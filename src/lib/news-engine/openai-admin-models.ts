import { prisma } from '@/lib/prisma';
import { listOpenAiModelsDetailedCached, type OpenAiModelInfo } from '@/lib/openai';
import { decryptWithNewsMasterKey, getNewsKeyVaultMasterKeyOrNull } from '@/lib/news-engine/key-vault';
import { expandProviderIdsForLookup } from '@/lib/news-engine/provider-id';

export type AdminOpenAiModelsKeySource = 'key_vault' | 'env' | 'none';

export type AdminOpenAiModelsKeyUsed = {
  source: AdminOpenAiModelsKeySource;
  id: string | null;
  label: string;
  pools: string[];
};

export type AdminOpenAiModelsResult = {
  ok: boolean;
  provider: 'openai';
  cached?: boolean;
  keySource: AdminOpenAiModelsKeySource;
  keysUsed: AdminOpenAiModelsKeyUsed[];
  warnings: string[];
  error?: string;
  models: OpenAiModelInfo[];
};

function isLikelyDummyKey(rawKey: string): boolean {
  const key = rawKey.trim().toLowerCase();
  if (!key) return true;
  if (key.includes('dummy')) return true;
  if (key.startsWith('sk-e2e-')) return true;
  return false;
}

function findMissing(models: OpenAiModelInfo[], expectedIds: string[]): string[] {
  const set = new Set(models.map((m) => m.id));
  return expectedIds.filter((id) => !set.has(id));
}

function looksLikePermissionOrAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('(401)') ||
    m.includes('(403)') ||
    m.includes('unauthorized') ||
    m.includes('forbidden') ||
    m.includes('incorrect api key') ||
    m.includes('invalid api key') ||
    m.includes('invalid authentication') ||
    m.includes('permission')
  );
}

export async function listAdminOpenAiModels(input?: { refresh?: boolean }): Promise<AdminOpenAiModelsResult> {
  const refresh = Boolean(input?.refresh);
  const ttlMs = refresh ? 0 : undefined;

  const warnings: string[] = [];

  // Prefer Key Vault keys if configured, but fall back to env for compatibility.
  const vaultConfigured = Boolean(getNewsKeyVaultMasterKeyOrNull());
  const enabledOpenAiKeys = vaultConfigured
    ? await prisma.newsApiKey.findMany({
        where: { enabled: true, provider: { in: expandProviderIdsForLookup('openai') } },
        orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'asc' }],
        take: 25,
        select: { id: true, label: true, pools: true, encryptedKey: true },
      })
    : [];

  const keyVaultCandidates: Array<{ id: string; label: string; pools: string[]; rawKey: string }> = [];
  for (const k of enabledOpenAiKeys) {
    let rawKey = '';
    try {
      rawKey = decryptWithNewsMasterKey(k.encryptedKey);
    } catch {
      continue;
    }
    if (isLikelyDummyKey(rawKey)) continue;
    keyVaultCandidates.push({ id: k.id, label: k.label, pools: k.pools ?? [], rawKey });
  }

  const envKey = (process.env.OPENAI_API_KEY || '').trim();
  const keysUsed: AdminOpenAiModelsKeyUsed[] = [];

  // De-dupe raw keys so we don't call /v1/models repeatedly for the same key.
  const seenKeyFingerprints = new Set<string>();
  const rawKeysToQuery: Array<{ source: AdminOpenAiModelsKeySource; id: string | null; label: string; pools: string[]; rawKey: string }> = [];

  for (const k of keyVaultCandidates) {
    const fp = k.rawKey.trim();
    if (!fp || seenKeyFingerprints.has(fp)) continue;
    seenKeyFingerprints.add(fp);
    rawKeysToQuery.push({ source: 'key_vault', id: k.id, label: k.label, pools: k.pools, rawKey: k.rawKey });
  }

  if (!rawKeysToQuery.length && envKey) {
    rawKeysToQuery.push({ source: 'env', id: null, label: 'OPENAI_API_KEY', pools: [], rawKey: envKey });
  }

  if (!rawKeysToQuery.length) {
    if (!vaultConfigured) {
      warnings.push('Key Vault is not configured (missing NEWS_ENGINE_KEY_VAULT_MASTER_KEY).');
    } else {
      warnings.push('No enabled OpenAI keys found in Key Vault (or keys were not decryptable).');
    }
    warnings.push('Also missing OPENAI_API_KEY, so models cannot be listed.');

    const error = 'No OpenAI key available to list models';

    return {
      ok: false,
      provider: 'openai',
      keySource: 'none',
      keysUsed: [],
      warnings,
      error,
      models: [],
    };
  }

  const modelsById = new Map<string, OpenAiModelInfo>();
  let anyCached = true;
  const keyErrors: string[] = [];

  // Limit how many distinct keys we query to reduce latency.
  const keysToQuery = rawKeysToQuery.slice(0, 5);

  for (const k of keysToQuery) {
    keysUsed.push({ source: k.source, id: k.id, label: k.label, pools: k.pools });

    try {
      const { models, cached } = await listOpenAiModelsDetailedCached({ apiKeyOverride: k.rawKey, ttlMs });
      anyCached = anyCached && cached;

      for (const m of models) {
        if (!modelsById.has(m.id)) modelsById.set(m.id, m);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OpenAI models list failed';
      keyErrors.push(`${k.label}: ${msg}`);
      continue;
    }
  }

  const models = Array.from(modelsById.values());
  if (keyErrors.length) {
    const preview = keyErrors.slice(0, 3).join(' | ');
    warnings.push(`Some keys failed model listing: ${preview}${keyErrors.length > 3 ? ' | …' : ''}`);
    if (keyErrors.some((e) => looksLikePermissionOrAuthError(e))) {
      warnings.push(
        'OpenAI rejected at least one key (401/403). This usually means the key is invalid, restricted to a different project/org, or lacks permissions for the endpoint.'
      );
    }
  }

  if (!models.length) {
    const err = keyErrors.length
      ? 'OpenAI returned no models for the key(s) queried.'
      : 'OpenAI returned an empty model list. This usually indicates a permissions or account issue.';
    warnings.push(err);
    return {
      ok: false,
      provider: 'openai',
      cached: anyCached,
      keySource: keysUsed.some((k) => k.source === 'key_vault') ? 'key_vault' : 'env',
      keysUsed,
      warnings,
      error: err,
      models: [],
    };
  }

  const expected = ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'dall-e-3', 'dall-e-2'];
  const missing = findMissing(models, expected);
  if (missing.includes('dall-e-3')) {
    warnings.push('DALL·E 3 (dall-e-3) is not listed for the key(s) used. Your OpenAI account/key may not have image model access.');
  }
  if (missing.length && missing.length !== expected.length) {
    warnings.push(`Some common models are not listed: ${missing.join(', ')}`);
  }
  if (vaultConfigured && !keyVaultCandidates.length) {
    warnings.push('Key Vault is configured but no usable OpenAI keys were found (check Enabled + Pool + the raw key value).');
  }
  if (keyVaultCandidates.length > 5) {
    warnings.push(`Only the first 5 distinct OpenAI keys were queried for model listing (found ${keyVaultCandidates.length}).`);
  }

  models.sort((a, b) => {
    const l = a.label.localeCompare(b.label);
    return l !== 0 ? l : a.id.localeCompare(b.id);
  });

  const keySource: AdminOpenAiModelsKeySource = keysUsed.some((k) => k.source === 'key_vault') ? 'key_vault' : 'env';

  return {
    ok: true,
    provider: 'openai',
    cached: anyCached,
    keySource,
    keysUsed,
    warnings,
    models,
  };
}

export async function assertAdminOpenAiModelIdIsValid(modelId: string): Promise<void> {
  const trimmed = modelId.trim();
  if (!trimmed) throw new Error('modelId is required');

  const result = await listAdminOpenAiModels();
  const modelIds = new Set(result.models.map((m) => m.id));

  if (!modelIds.has(trimmed)) {
    if (!result.ok) {
      const reason = result.warnings.length ? result.warnings.join(' ') : 'No OpenAI key available to list models.';
      throw new Error(`Cannot validate OpenAI modelId without a usable key. ${reason}`);
    }
    throw new Error(`Unsupported OpenAI modelId: ${trimmed}`);
  }
}

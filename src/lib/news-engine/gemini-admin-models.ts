import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { decryptWithNewsMasterKey, getNewsKeyVaultMasterKeyOrNull } from '@/lib/news-engine/key-vault';
import { expandProviderIdsForLookup } from '@/lib/news-engine/provider-id';

export type AdminGeminiModelsKeySource = 'key_vault' | 'env' | 'none';

export type AdminGeminiModelsKeyUsed = {
  source: AdminGeminiModelsKeySource;
  id: string | null;
  label: string;
  pools: string[];
};

export type AdminGeminiModelInfo = { id: string; type: string; label: string };

export type AdminGeminiModelsResult = {
  ok: boolean;
  provider: 'gemini';
  cached?: boolean;
  keySource: AdminGeminiModelsKeySource;
  keysUsed: AdminGeminiModelsKeyUsed[];
  warnings: string[];
  error?: string;
  models: AdminGeminiModelInfo[];
};

type GeminiModelsCache = {
  at: number;
  models: AdminGeminiModelInfo[];
};

const geminiModelsCache = new Map<string, GeminiModelsCache>();
const geminiModelsInFlight = new Map<string, Promise<AdminGeminiModelInfo[]>>();

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function isLikelyDummyKey(rawKey: string): boolean {
  const key = rawKey.trim().toLowerCase();
  if (!key) return true;
  if (key.includes('dummy')) return true;
  if (key.startsWith('sk-e2e-')) return true;
  return false;
}

function inferGeminiModelType(m: { supportedGenerationMethods?: unknown } | null | undefined): string {
  const methods = Array.isArray(m?.supportedGenerationMethods)
    ? (m?.supportedGenerationMethods as unknown[]).filter((x) => typeof x === 'string')
    : [];

  const set = new Set(methods.map((s) => String(s).toLowerCase()));
  if (set.has('generatecontent') || set.has('generate_content')) return 'chat';
  if (set.has('embedcontent') || set.has('embed_content')) return 'embedding';
  return methods.length ? 'other' : 'other';
}

function friendlyGeminiLabel(id: string, type: string, displayName?: string | null): string {
  const pretty = (displayName && displayName.trim()) ? displayName.trim() : id;
  return `${pretty} (${type.toUpperCase()})`;
}

async function listGeminiModelsRaw(apiKey: string): Promise<AdminGeminiModelInfo[]> {
  // Google AI Studio / Gemini API.
  // Listing models works via query param `key=`.
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const msg =
      (typeof data?.error?.message === 'string' && data.error.message.trim() ? data.error.message.trim() : null) ||
      `Gemini models list failed (${response.status})`;
    throw new Error(msg);
  }

  const items = Array.isArray(data?.models) ? data.models : [];
  const models: AdminGeminiModelInfo[] = [];

  for (const item of items) {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    if (!name) continue;

    // API returns names like "models/gemini-1.5-pro".
    const id = name.startsWith('models/') ? name.slice('models/'.length) : name;
    if (!id) continue;

    const type = inferGeminiModelType(item);
    const displayName = typeof item?.displayName === 'string' ? item.displayName : null;
    models.push({ id, type, label: friendlyGeminiLabel(id, type, displayName) });
  }

  // Dedupe by id and keep stable sort.
  const byId = new Map<string, AdminGeminiModelInfo>();
  for (const m of models) byId.set(m.id, m);

  const deduped = Array.from(byId.values());
  deduped.sort((a, b) => {
    const t = a.type.localeCompare(b.type);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  });

  return deduped;
}

async function listGeminiModelsCached(apiKey: string, ttlMs: number): Promise<{ models: AdminGeminiModelInfo[]; cached: boolean }> {
  const apiKeyHash = hashApiKey(apiKey);
  const now = Date.now();

  const existing = geminiModelsCache.get(apiKeyHash);
  if (existing && now - existing.at <= ttlMs) {
    return { models: existing.models, cached: true };
  }

  let inFlight = geminiModelsInFlight.get(apiKeyHash);
  if (!inFlight) {
    inFlight = listGeminiModelsRaw(apiKey)
      .then((models) => {
        geminiModelsCache.set(apiKeyHash, { at: Date.now(), models });
        return models;
      })
      .finally(() => {
        geminiModelsInFlight.delete(apiKeyHash);
      });
    geminiModelsInFlight.set(apiKeyHash, inFlight);
  }

  const models = await inFlight;
  return { models, cached: false };
}

function getEnvGeminiKey(): string {
  return (
    (process.env.GEMINI_API_KEY || '').trim() ||
    (process.env.GOOGLE_GEMINI_API_KEY || '').trim() ||
    (process.env.GOOGLE_API_KEY || '').trim()
  );
}

export async function listAdminGeminiModels(input?: { refresh?: boolean }): Promise<AdminGeminiModelsResult> {
  const refresh = Boolean(input?.refresh);
  const ttlMs = refresh ? 0 : 10 * 60 * 1000;

  const warnings: string[] = [];

  const vaultConfigured = Boolean(getNewsKeyVaultMasterKeyOrNull());
  const enabledGeminiKeys = vaultConfigured
    ? await prisma.newsApiKey.findMany({
        where: { enabled: true, provider: { in: expandProviderIdsForLookup('gemini') } },
        orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'asc' }],
        take: 25,
        select: { id: true, label: true, pools: true, encryptedKey: true },
      })
    : [];

  const keyVaultCandidates: Array<{ id: string; label: string; pools: string[]; rawKey: string }> = [];
  for (const k of enabledGeminiKeys) {
    let rawKey = '';
    try {
      rawKey = decryptWithNewsMasterKey(k.encryptedKey);
    } catch {
      continue;
    }
    if (isLikelyDummyKey(rawKey)) continue;
    keyVaultCandidates.push({ id: k.id, label: k.label, pools: k.pools ?? [], rawKey });
  }

  const envKey = getEnvGeminiKey();

  const keysUsed: AdminGeminiModelsKeyUsed[] = [];
  const seenFingerprints = new Set<string>();
  const rawKeysToQuery: Array<{ source: AdminGeminiModelsKeySource; id: string | null; label: string; pools: string[]; rawKey: string }> = [];

  for (const k of keyVaultCandidates) {
    const fp = k.rawKey.trim();
    if (!fp || seenFingerprints.has(fp)) continue;
    seenFingerprints.add(fp);
    rawKeysToQuery.push({ source: 'key_vault', id: k.id, label: k.label, pools: k.pools, rawKey: k.rawKey });
  }

  if (!rawKeysToQuery.length && envKey) {
    rawKeysToQuery.push({ source: 'env', id: null, label: 'GEMINI_API_KEY', pools: [], rawKey: envKey });
  }

  if (!rawKeysToQuery.length) {
    if (!vaultConfigured) {
      warnings.push('Key Vault is not configured (missing NEWS_ENGINE_KEY_VAULT_MASTER_KEY).');
    } else {
      warnings.push('No enabled Gemini keys found in Key Vault (or keys were not decryptable).');
    }
    warnings.push('Also missing GEMINI_API_KEY/GOOGLE_API_KEY, so models cannot be listed.');

    const error = 'No Gemini key available to list models';

    return {
      ok: false,
      provider: 'gemini',
      keySource: 'none',
      keysUsed: [],
      warnings,
      error,
      models: [],
    };
  }

  const modelsById = new Map<string, AdminGeminiModelInfo>();
  let anyCached = true;
  const keyErrors: string[] = [];

  const keysToQuery = rawKeysToQuery.slice(0, 5);
  for (const k of keysToQuery) {
    keysUsed.push({ source: k.source, id: k.id, label: k.label, pools: k.pools });

    try {
      const { models, cached } = await listGeminiModelsCached(k.rawKey, ttlMs);
      anyCached = anyCached && cached;

      for (const m of models) {
        if (!modelsById.has(m.id)) modelsById.set(m.id, m);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gemini models list failed';
      keyErrors.push(`${k.label}: ${msg}`);
      continue;
    }
  }

  const models = Array.from(modelsById.values());
  if (keyErrors.length) {
    warnings.push(
      `Some keys failed model listing: ${keyErrors.slice(0, 3).join(' | ')}${keyErrors.length > 3 ? ' | …' : ''}`
    );
  }

  if (!models.length) {
    const error = keyErrors.length
      ? 'Gemini returned no models for the key(s) queried.'
      : 'Gemini returned an empty model list. This usually indicates a permissions or account issue.';
    warnings.push(error);
    return {
      ok: false,
      provider: 'gemini',
      cached: anyCached,
      keySource: keysUsed.some((k) => k.source === 'key_vault') ? 'key_vault' : 'env',
      keysUsed,
      warnings,
      error,
      models: [],
    };
  }

  if (vaultConfigured && !keyVaultCandidates.length) {
    warnings.push('Key Vault is configured but no usable Gemini keys were found (check Enabled + Pool + the raw key value).');
  }
  if (keyVaultCandidates.length > 5) {
    warnings.push(`Only the first 5 distinct Gemini keys were queried for model listing (found ${keyVaultCandidates.length}).`);
  }

  // Stable ordering.
  models.sort((a, b) => {
    const l = a.label.localeCompare(b.label);
    return l !== 0 ? l : a.id.localeCompare(b.id);
  });

  const keySource: AdminGeminiModelsKeySource = keysUsed.some((k) => k.source === 'key_vault') ? 'key_vault' : 'env';

  return {
    ok: true,
    provider: 'gemini',
    cached: anyCached,
    keySource,
    keysUsed,
    warnings,
    models,
  };
}

export async function assertAdminGeminiModelIdIsValid(modelId: string): Promise<void> {
  const trimmed = modelId.trim();
  if (!trimmed) throw new Error('modelId is required');

  const result = await listAdminGeminiModels();
  const modelIds = new Set(result.models.map((m) => m.id));

  if (!modelIds.has(trimmed)) {
    if (!result.ok) {
      const reason = result.warnings.length ? result.warnings.join(' ') : 'No Gemini key available to list models.';
      throw new Error(`Cannot validate Gemini modelId without a usable key. ${reason}`);
    }
    throw new Error(`Unsupported Gemini modelId: ${trimmed}`);
  }
}

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { decryptWithNewsMasterKey, getNewsKeyVaultMasterKeyOrNull } from '@/lib/news-engine/key-vault';
import { expandProviderIdsForLookup, normalizeNewsProviderId } from '@/lib/news-engine/provider-id';

export type AdminAiModelsKeySource = 'key_vault' | 'env' | 'none';

export type AdminAiModelsKeyUsed = {
  source: AdminAiModelsKeySource;
  id: string | null;
  label: string;
  pools: string[];
};

export type AdminAiModelInfo = { id: string; type: string; label: string };

export type AdminOpenAiCompatModelsResult = {
  ok: boolean;
  provider: string;
  cached?: boolean;
  keySource: AdminAiModelsKeySource;
  keysUsed: AdminAiModelsKeyUsed[];
  warnings: string[];
  error?: string;
  models: AdminAiModelInfo[];
};

type ModelsCacheEntry = {
  at: number;
  models: AdminAiModelInfo[];
};

const modelsCache = new Map<string, ModelsCacheEntry>();
const inFlight = new Map<string, Promise<AdminAiModelInfo[]>>();

function hashKey(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function isLikelyDummyKey(rawKey: string): boolean {
  const key = rawKey.trim().toLowerCase();
  if (!key) return true;
  if (key.includes('dummy')) return true;
  if (key.startsWith('sk-e2e-')) return true;
  return false;
}

function getEnvKeyNameForOpenAiCompatBaseUrl(provider: string): string {
  const token = normalizeNewsProviderId(provider)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
  return `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL_${token}`;
}

function getOpenAiCompatBaseUrl(provider: string): string | null {
  const key = getEnvKeyNameForOpenAiCompatBaseUrl(provider);
  const direct = (process.env[key] || '').trim();
  if (direct) return direct;

  const fallback = (process.env.NEWS_ENGINE_OPENAI_COMPAT_BASE_URL || '').trim();
  return fallback || null;
}

async function listOpenAiCompatModelsRaw(baseUrl: string, apiKey: string): Promise<AdminAiModelInfo[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/models`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const message =
      (typeof data?.error?.message === 'string' && data.error.message.trim() ? data.error.message.trim() : null) ||
      (typeof data?.message === 'string' && data.message.trim() ? data.message.trim() : null) ||
      `Models list failed (${response.status})`;
    throw new Error(message);
  }

  const items = Array.isArray(data?.data) ? data.data : [];
  const byId = new Map<string, AdminAiModelInfo>();

  for (const item of items) {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, { id, type: 'other', label: id });
  }

  const models = Array.from(byId.values());
  models.sort((a, b) => a.id.localeCompare(b.id));
  return models;
}

async function listOpenAiCompatModelsCached(cacheKey: string, baseUrl: string, apiKey: string, ttlMs: number): Promise<{ models: AdminAiModelInfo[]; cached: boolean }> {
  const now = Date.now();
  const existing = modelsCache.get(cacheKey);
  if (existing && now - existing.at <= ttlMs) {
    return { models: existing.models, cached: true };
  }

  let promise = inFlight.get(cacheKey);
  if (!promise) {
    promise = listOpenAiCompatModelsRaw(baseUrl, apiKey)
      .then((models) => {
        modelsCache.set(cacheKey, { at: Date.now(), models });
        return models;
      })
      .finally(() => {
        inFlight.delete(cacheKey);
      });
    inFlight.set(cacheKey, promise);
  }

  const models = await promise;
  return { models, cached: false };
}

export async function listAdminOpenAiCompatModels(input: { provider: string; refresh?: boolean }): Promise<AdminOpenAiCompatModelsResult> {
  const provider = normalizeNewsProviderId(input.provider);
  const refresh = Boolean(input.refresh);
  const ttlMs = refresh ? 0 : 10 * 60 * 1000;

  const warnings: string[] = [];

  const baseUrl = getOpenAiCompatBaseUrl(provider);
  if (!baseUrl) {
    const envKey = getEnvKeyNameForOpenAiCompatBaseUrl(provider);
    return {
      ok: false,
      provider,
      keySource: 'none',
      keysUsed: [],
      warnings: [
        `Missing base URL for provider ${provider}. Set ${envKey} (or NEWS_ENGINE_OPENAI_COMPAT_BASE_URL).`,
      ],
      error: `Missing base URL for provider ${provider}`,
      models: [],
    };
  }

  const vaultConfigured = Boolean(getNewsKeyVaultMasterKeyOrNull());
  if (!vaultConfigured) {
    warnings.push('Key Vault is not configured (missing NEWS_ENGINE_KEY_VAULT_MASTER_KEY).');
  }

  const enabledKeys = vaultConfigured
    ? await prisma.newsApiKey.findMany({
        where: { enabled: true, provider: { in: expandProviderIdsForLookup(provider) } },
        orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'asc' }],
        take: 25,
        select: { id: true, label: true, pools: true, encryptedKey: true },
      })
    : [];

  const keyCandidates: Array<{ id: string; label: string; pools: string[]; rawKey: string }> = [];
  for (const k of enabledKeys) {
    let rawKey = '';
    try {
      rawKey = decryptWithNewsMasterKey(k.encryptedKey);
    } catch {
      continue;
    }
    if (isLikelyDummyKey(rawKey)) continue;
    keyCandidates.push({ id: k.id, label: k.label, pools: k.pools ?? [], rawKey });
  }

  if (!keyCandidates.length) {
    if (vaultConfigured) {
      warnings.push(`No enabled ${provider} keys found in Key Vault (or keys were not decryptable).`);
    }

    return {
      ok: false,
      provider,
      keySource: 'none',
      keysUsed: [],
      warnings,
      error: `No Key Vault key available for provider ${provider}`,
      models: [],
    };
  }

  const keysUsed: AdminAiModelsKeyUsed[] = [];
  const modelsById = new Map<string, AdminAiModelInfo>();
  let anyCached = true;
  const errors: string[] = [];

  // Limit distinct keys to reduce latency.
  const seen = new Set<string>();
  const distinct = keyCandidates.filter((k) => {
    const fp = k.rawKey.trim();
    if (!fp || seen.has(fp)) return false;
    seen.add(fp);
    return true;
  });

  const keysToQuery = distinct.slice(0, 5);
  for (const k of keysToQuery) {
    keysUsed.push({ source: 'key_vault', id: k.id, label: k.label, pools: k.pools });

    const cacheKey = hashKey(`${provider}|${baseUrl}|${k.rawKey}`);

    try {
      const { models, cached } = await listOpenAiCompatModelsCached(cacheKey, baseUrl, k.rawKey, ttlMs);
      anyCached = anyCached && cached;
      for (const m of models) {
        if (!modelsById.has(m.id)) modelsById.set(m.id, m);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Models list failed';
      errors.push(`${k.label}: ${msg}`);
      continue;
    }
  }

  const models = Array.from(modelsById.values());
  models.sort((a, b) => a.id.localeCompare(b.id));

  if (errors.length) {
    warnings.push(`Some keys failed model listing: ${errors.slice(0, 3).join(' | ')}${errors.length > 3 ? ' | …' : ''}`);
  }

  if (!models.length) {
    return {
      ok: false,
      provider,
      cached: anyCached,
      keySource: 'key_vault',
      keysUsed,
      warnings,
      error: `No models returned for provider ${provider}. Check base URL and key permissions.`,
      models: [],
    };
  }

  if (distinct.length > 5) {
    warnings.push(`Only the first 5 distinct ${provider} keys were queried for model listing (found ${distinct.length}).`);
  }

  return {
    ok: true,
    provider,
    cached: anyCached,
    keySource: 'key_vault',
    keysUsed,
    warnings,
    models,
  };
}

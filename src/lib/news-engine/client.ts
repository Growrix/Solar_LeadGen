import type { NewsEngineSettings, NewsItem, NewsSource, PipelineStatus, AuditLogEntry, NewsEngineState } from '@/lib/ui-stubs/news-engine';

type ApiErrorShape = { error?: string };

function toErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const maybe = (body as ApiErrorShape).error;
    if (typeof maybe === 'string' && maybe.trim()) return maybe;
  }
  return fallback;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new Error(toErrorMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

function mapSourceTypeToUi(value: unknown): NewsItem['sourceType'] {
  if (value === 'RSS_FEED') return 'RSS Feed';
  if (value === 'AI_AGENT') return 'AI Agent';
  if (value === 'MANUAL_ENTRY') return 'Manual Entry';
  if (value === 'RSS Feed' || value === 'AI Agent' || value === 'Manual Entry') return value;
  return 'Manual Entry';
}

function mapSourceTypeToApi(value: unknown): 'RSS_FEED' | 'AI_AGENT' | 'MANUAL_ENTRY' | undefined {
  if (value === 'RSS_FEED' || value === 'AI_AGENT' || value === 'MANUAL_ENTRY') return value;
  if (value === 'RSS Feed') return 'RSS_FEED';
  if (value === 'AI Agent') return 'AI_AGENT';
  if (value === 'Manual Entry') return 'MANUAL_ENTRY';
  return undefined;
}

function normalizeIso(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function mapAdminItemToUi(item: any): NewsItem {
  return {
    id: String(item.id),
    title: String(item.title ?? ''),
    summary: String(item.summary ?? ''),
    contentHtml: typeof item.contentHtml === 'string' ? item.contentHtml : undefined,
    status: item.status,
    category: String(item.category ?? ''),
    relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : 0,
    aiModel: String(item.aiModel ?? ''),
    createdAt: normalizeIso(item.createdAt) ?? new Date().toISOString(),
    sourceType: mapSourceTypeToUi(item.sourceType),
    publishedAt: normalizeIso(item.publishedAt),
    scheduledFor: normalizeIso(item.scheduledFor),
    slug: typeof item.slug === 'string' ? item.slug : undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((t: any) => typeof t === 'string') : [],

    seoTitle: item.seoTitle ?? null,
    seoDescription: item.seoDescription ?? null,
    ogImageUrl: item.ogImageUrl ?? null,
    rejectedAt: normalizeIso(item.rejectedAt),
    rejectionReason: item.rejectionReason ?? null,
    deletedAt: normalizeIso(item.deletedAt),
  };
}

function mapAdminSourceToUi(src: any): NewsSource {
  return {
    id: String(src.id),
    name: String(src.name ?? ''),
    url: String(src.url ?? ''),
    enabled: Boolean(src.enabled),
    lastSync: normalizeIso(src.lastSync),
    articleCount: typeof src.articleCount === 'number' ? src.articleCount : undefined,
  };
}

function mapAuditLogToUi(log: any): AuditLogEntry {
  const action = typeof log.action === 'string' ? log.action : '';
  return {
    id: String(log.id),
    timestamp: normalizeIso(log.createdAt) ?? new Date().toISOString(),
    action,
    origin: log.actorId ? 'admin' : 'system',
    status: action.includes('error') ? 'ERROR' : 'INFO',
    promptUsed: typeof log.promptUsed === 'string' && log.promptUsed.trim() ? log.promptUsed : undefined,

    itemId: typeof log.itemId === 'string' ? log.itemId : null,
    sourceId: typeof log.sourceId === 'string' ? log.sourceId : null,
    metadata: log.metadata ?? undefined,
  };
}

export type PublicNewsListItem = {
  id: string;
  title: string;
  summary: string;
  slug: string;
  publishedAt?: string;
  category: string;
  tags: string[];
  createdAt?: string;
};

export type PublicNewsItemDetail = {
  id: string;
  title: string;
  summary: string;
  slug: string;
  publishedAt?: string;
  category: string;
  tags: string[];
  createdAt?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  contentHtml?: string;
};

export async function fetchPublicNewsList(): Promise<PublicNewsListItem[]> {
  const data = await apiFetch<{ items: any[] }>(`/api/news`);
  return (data.items ?? [])
    .map((it) => ({
      id: String(it.id),
      title: String(it.title ?? ''),
      summary: String(it.summary ?? ''),
      slug: String(it.slug ?? ''),
      publishedAt: normalizeIso(it.publishedAt),
      category: String(it.category ?? ''),
      tags: Array.isArray(it.tags) ? it.tags.filter((t: any) => typeof t === 'string') : [],
      createdAt: normalizeIso(it.createdAt),
    }))
    .filter((it) => Boolean(it.slug));
}

export async function fetchPublicNewsBySlug(slug: string): Promise<PublicNewsItemDetail> {
  const data = await apiFetch<{ item: any }>(`/api/news/${encodeURIComponent(slug)}`);
  const it = data.item;
  return {
    id: String(it.id),
    title: String(it.title ?? ''),
    summary: String(it.summary ?? ''),
    slug: String(it.slug ?? ''),
    publishedAt: normalizeIso(it.publishedAt),
    category: String(it.category ?? ''),
    tags: Array.isArray(it.tags) ? it.tags.filter((t: any) => typeof t === 'string') : [],
    createdAt: normalizeIso(it.createdAt),
    seoTitle: it.seoTitle ?? null,
    seoDescription: it.seoDescription ?? null,
    ogImageUrl: it.ogImageUrl ?? null,
    contentHtml: typeof it.contentHtml === 'string' ? it.contentHtml : undefined,
  };
}

export async function fetchAdminState(): Promise<NewsEngineState> {
  const [itemsRes, sourcesRes, automationRes, settingsRes, auditRes, pipelineRes] = await Promise.all([
    apiFetch<{ items: any[] }>(`/api/admin/news-engine/items?limit=200`),
    apiFetch<{ sources: any[] }>(`/api/admin/news-engine/sources?limit=200`),
    apiFetch<{ automation: { autoDraft: boolean; autoSchedule: boolean; autoPublish: boolean } }>(
      `/api/admin/news-engine/automation/config`
    ),
    apiFetch<{ settings: NewsEngineSettings }>(`/api/admin/news-engine/settings`),
    apiFetch<{ logs: any[] }>(`/api/admin/news-engine/audit-logs?limit=200`),
    apiFetch<{ pipelineStatus: PipelineStatus }>(`/api/admin/news-engine/pipeline/status`),
  ]);

  return {
    items: (itemsRes.items ?? []).map(mapAdminItemToUi),
    sources: (sourcesRes.sources ?? []).map(mapAdminSourceToUi),
    automation: automationRes.automation,
    settings: settingsRes.settings,
    pipelineStatus: pipelineRes.pipelineStatus,
    auditLogs: (auditRes.logs ?? []).map(mapAuditLogToUi),
  };
}

export async function adminCreateItem(input: {
  title: string;
  summary?: string;
  contentHtml?: string;
  category?: string;
  tags?: string[];
  status?: string;
  aiModel?: string;
  relevanceScore?: number;
  sourceType?: NewsItem['sourceType'];

  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
}): Promise<NewsItem> {
  const body: Record<string, unknown> = {
    title: input.title,
    summary: input.summary ?? '',
    contentHtml: input.contentHtml ?? '',
    category: input.category ?? '',
    tags: input.tags ?? [],
  };
  if (input.status) body.status = input.status;
  if (input.aiModel) body.aiModel = input.aiModel;
  if (typeof input.relevanceScore === 'number') body.relevanceScore = input.relevanceScore;
  const sourceType = mapSourceTypeToApi(input.sourceType);
  if (sourceType) body.sourceType = sourceType;

   if (input.seoTitle !== undefined) body.seoTitle = input.seoTitle;
   if (input.seoDescription !== undefined) body.seoDescription = input.seoDescription;
   if (input.ogImageUrl !== undefined) body.ogImageUrl = input.ogImageUrl;

  const data = await apiFetch<{ item: any }>(`/api/admin/news-engine/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return mapAdminItemToUi(data.item);
}

export type TestPreviewGenerationResult = {
  title: string;
  summary: string;
  contentHtml: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  citations?: string[];
};

export async function adminRunTestPreviewGeneration(input: {
  topic?: string;
  url?: string;
}): Promise<{ result: TestPreviewGenerationResult; modelUsed: string; durationMs: number }>
{
  return await apiFetch(`/api/admin/news-engine/research/test`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function adminUpdateItem(
  id: string,
  input: Partial<{
    title: string;
    summary: string;
    category: string;
    tags: string[];
    contentHtml: string;
    status: string;
  }>
): Promise<NewsItem> {
  const data = await apiFetch<{ item: any }>(`/api/admin/news-engine/items/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );

  return mapAdminItemToUi(data.item);
}

export async function adminPublishNow(id: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}/publish-now`, {
    method: 'POST',
    body: JSON.stringify({ confirmText: 'PUBLISH' }),
  });
}

export async function adminSchedule(id: string, scheduledForIso: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduledFor: scheduledForIso }),
  });
}

export async function adminReject(id: string, reason: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function adminRewriteRequest(id: string, note: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}/rewrite-request`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function adminDeleteItem(id: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function adminPurgeItem(id: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(id)}/purge`, {
    method: 'DELETE',
  });
}

export async function adminRegenerateItem(
  id: string,
  input?: {
    note?: string;
    model?: string;
  }
): Promise<NewsItem> {
  const data = await apiFetch<{ item: any }>(
    `/api/admin/news-engine/items/${encodeURIComponent(id)}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    }
  );

  return mapAdminItemToUi(data.item);
}

export async function adminToggleSourceEnabled(sourceId: string, enabled: boolean): Promise<void> {
  await apiFetch(`/api/admin/news-engine/sources/${encodeURIComponent(sourceId)}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}

export async function adminUpsertSource(input: {
  id?: string;
  name: string;
  url: string;
  enabled: boolean;
}): Promise<void> {
  if (input.id) {
    await apiFetch(`/api/admin/news-engine/sources/${encodeURIComponent(input.id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name: input.name, url: input.url, enabled: input.enabled }),
    });
    return;
  }

  await apiFetch(`/api/admin/news-engine/sources`, {
    method: 'POST',
    body: JSON.stringify({ name: input.name, url: input.url, enabled: input.enabled }),
  });
}

export async function adminSetPipelineStatus(next: PipelineStatus): Promise<void> {
  if (next === 'PAUSED') {
    await apiFetch(`/api/admin/news-engine/pipeline/pause`, { method: 'POST' });
    return;
  }
  if (next === 'NOMINAL') {
    await apiFetch(`/api/admin/news-engine/pipeline/resume`, { method: 'POST' });
    return;
  }
  await apiFetch(`/api/admin/news-engine/pipeline/emergency-stop`, {
    method: 'POST',
    body: JSON.stringify({ confirmText: 'LOCKDOWN' }),
  });
}

export async function adminUpdateSettings(input: { settings: NewsEngineSettings }): Promise<void> {
  await apiFetch(`/api/admin/news-engine/settings`, {
    method: 'PUT',
    body: JSON.stringify({ settings: input.settings }),
  });
}

export async function adminUpdateAutomation(input: {
  automation: { autoDraft: boolean; autoSchedule: boolean; autoPublish: boolean };
  config?: unknown;
}): Promise<void> {
  await apiFetch(`/api/admin/news-engine/automation/config`, {
    method: 'PUT',
    body: JSON.stringify({ automation: input.automation, ...(input.config !== undefined ? { config: input.config } : {}) }),
  });
}

export async function adminRunAutomationNow(): Promise<{ ok: true; payload: unknown }> {
  return apiFetch(`/api/admin/news-engine/automation/run-now`, {
    method: 'POST',
  });
}

export type AdminSourcesConfig = {
  researchWeights: { web: number; social: number; journals: number };
  researchEnabled: { web: boolean; social: boolean; journals: boolean };
  rules: { deduplication: boolean; verifyPayload: boolean };
  minSources: number;
  countries: string[];
  blacklist: string;
};

export async function fetchAdminSourcesConfig(): Promise<AdminSourcesConfig> {
  const data = await apiFetch<{ config: AdminSourcesConfig }>(`/api/admin/news-engine/sources/config`);
  return data.config;
}

export async function adminUpdateSourcesConfig(config: AdminSourcesConfig): Promise<AdminSourcesConfig> {
  const data = await apiFetch<{ config: AdminSourcesConfig }>(`/api/admin/news-engine/sources/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });
  return data.config;
}

export async function adminSyncSource(sourceId: string): Promise<{ ok: true; status: 'ok' | 'not_modified'; imported: number }> {
  return apiFetch(`/api/admin/news-engine/sources/${encodeURIComponent(sourceId)}/sync`, {
    method: 'POST',
  });
}

export type AdminSourceEntry = {
  id: string;
  sourceId: string;
  url: string;
  title: string;
  externalId: string | null;
  publishedAt: string | null;
  fetchedAt: string;
  status: string;
  error: string | null;
  itemId: string | null;
};

export async function fetchAdminSourceEntries(sourceId: string, limit = 50): Promise<AdminSourceEntry[]> {
  const data = await apiFetch<{ entries: any[] }>(
    `/api/admin/news-engine/sources/${encodeURIComponent(sourceId)}/entries?limit=${encodeURIComponent(String(limit))}`
  );
  return (data.entries ?? []).map((e) => ({
    id: String(e.id),
    sourceId: String(e.sourceId),
    url: String(e.url ?? ''),
    title: String(e.title ?? ''),
    externalId: e.externalId ? String(e.externalId) : null,
    publishedAt: normalizeIso(e.publishedAt) ?? null,
    fetchedAt: normalizeIso(e.fetchedAt) ?? new Date().toISOString(),
    status: String(e.status ?? ''),
    error: typeof e.error === 'string' ? e.error : null,
    itemId: e.itemId ? String(e.itemId) : null,
  }));
}

export async function adminGenerateManualDraft(input: {
  title: string;
  prompt: string;
  category?: string;
  tags?: string[];
  outline?: string;
}): Promise<NewsItem> {
  const data = await apiFetch<{ item: any }>(
    `/api/admin/news-engine/items/generate-manual`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );

  return mapAdminItemToUi(data.item);
}

export type AdminNewsModelProfile = {
  id: string;
  displayName: string;
  provider: string;
  modelId: string;
  useCaseTags: string[];
  costTier: string;
  jsonModeRequired: boolean;
  maxTokens: number | null;
  enabled: boolean;
  createdAt: string;
};

export async function adminListModelProfiles(): Promise<AdminNewsModelProfile[]> {
  const data = await apiFetch<{ profiles: AdminNewsModelProfile[] }>(`/api/admin/news-engine/model-profiles`);
  return data.profiles ?? [];
}

export async function adminCreateModelProfile(input: {
  displayName: string;
  provider: string;
  modelId: string;
  enabled?: boolean;
}): Promise<AdminNewsModelProfile> {
  const data = await apiFetch<{ profile: AdminNewsModelProfile }>(`/api/admin/news-engine/model-profiles`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.profile;
}

export async function adminUpdateModelProfile(
  id: string,
  input: Partial<{
    displayName: string;
    provider: string;
    modelId: string;
    enabled: boolean;
  }>
): Promise<AdminNewsModelProfile> {
  const data = await apiFetch<{ profile: AdminNewsModelProfile }>(
    `/api/admin/news-engine/model-profiles/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );
  return data.profile;
}

export async function adminDisableModelProfile(id: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/model-profiles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export type AdminAiRouterDefaults = Record<
  | 'research_deep'
  | 'research_fast'
  | 'draft_longform'
  | 'rewrite'
  | 'seo'
  | 'dedup_semantic'
  | 'image_prompt'
  | 'image_generate',
  string | null
>;

export async function adminGetAiRouterDefaults(): Promise<AdminAiRouterDefaults> {
  const data = await apiFetch<{ defaults: Record<string, string | null> }>(`/api/admin/news-engine/ai-router/defaults`);
  return (data.defaults ?? {}) as AdminAiRouterDefaults;
}

export async function adminUpdateAiRouterDefaults(input: { defaults: Partial<AdminAiRouterDefaults> }): Promise<AdminAiRouterDefaults> {
  const data = await apiFetch<{ defaults: Record<string, string | null> }>(`/api/admin/news-engine/ai-router/defaults`, {
    method: 'PUT',
    body: JSON.stringify({ defaults: input.defaults }),
  });
  return (data.defaults ?? {}) as AdminAiRouterDefaults;
}

export type AdminKeyVaultEntry = {
  id: string;
  provider: 'OpenAI' | 'Other' | string;
  label: string;
  pool: 'Research' | 'Drafting' | 'Images' | string;
  enabled: boolean;
  maskedKey: string;
  lastUsedAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
};

export type AdminKeyVaultState = {
  masterKeyConfigured: boolean;
  keys: AdminKeyVaultEntry[];
};

export async function adminGetKeyVaultState(): Promise<AdminKeyVaultState> {
  const data = await apiFetch<{ masterKeyConfigured?: boolean; keys: AdminKeyVaultEntry[] }>(
    `/api/admin/news-engine/key-vault`
  );
  return {
    masterKeyConfigured: Boolean(data.masterKeyConfigured),
    keys: data.keys ?? [],
  };
}

export async function adminListKeyVaultKeys(): Promise<AdminKeyVaultEntry[]> {
  const data = await adminGetKeyVaultState();
  return data.keys;
}

export async function adminCreateKeyVaultKey(input: {
  provider: string;
  label: string;
  pool: string;
  enabled: boolean;
  rawKey: string;
}): Promise<AdminKeyVaultEntry> {
  const data = await apiFetch<{ key: AdminKeyVaultEntry }>(`/api/admin/news-engine/key-vault`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.key;
}

export async function adminUpdateKeyVaultKey(
  id: string,
  input: Partial<{ provider: string; label: string; pool: string; enabled: boolean; rawKey: string }>
): Promise<AdminKeyVaultEntry> {
  const data = await apiFetch<{ key: AdminKeyVaultEntry }>(`/api/admin/news-engine/key-vault/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );
  return data.key;
}

export async function adminDeleteKeyVaultKey(id: string): Promise<void> {
  await apiFetch(`/api/admin/news-engine/key-vault/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}

export type AdminItemProvenance = {
  itemId: string;
  sourceType: string;
  rssEntryUrls: string[];
  researchUrls: string[];
  stages: Array<{
    action: string;
    taskType: string | null;
    provider: string | null;
    model: string | null;
    modelProfileLabel: string | null;
    apiKeyLabel: string | null;
    createdAt: string;
  }>;
};

export async function adminFetchItemProvenance(itemId: string): Promise<AdminItemProvenance> {
  return await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(itemId)}/provenance`);
}

export type AdminItemImageControls = {
  itemId: string;
  ogImageUrl: string | null;
  ogImageApprovalRequired: boolean;
  ogImageApprovedAt: string | null;
  ogImageApprovedById: string | null;
};

export async function adminFetchItemImageControls(itemId: string): Promise<AdminItemImageControls> {
  return await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(itemId)}/image-controls`);
}

export async function adminUpdateItemImageControls(
  itemId: string,
  input: Partial<Pick<AdminItemImageControls, 'ogImageUrl' | 'ogImageApprovalRequired'>>
): Promise<AdminItemImageControls> {
  return await apiFetch(`/api/admin/news-engine/items/${encodeURIComponent(itemId)}/image-controls`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

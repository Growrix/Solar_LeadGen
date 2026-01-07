export type NewsEngineTab =
  | 'Dashboard'
  | 'Drafts & Reviews'
  | 'Audit Logs'
  | 'Master Control'
  | 'Automation Logic'
  | 'Sources'
  | 'Settings';

export type NewsItemStatus =
  | 'DRAFT'
  | 'NEEDS_REVIEW'
  | 'PUBLISHED'
  | 'SCHEDULED'
  | 'ERROR'
  | 'RESEARCH_DONE'
  | 'DRAFT_READY'
  | 'REJECTED';

export type PipelineStatus = 'NOMINAL' | 'PAUSED' | 'EMERGENCY_STOP';

export type AuditLogStatus = 'INFO' | 'WARN' | 'ERROR';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  contentHtml?: string;
  status: NewsItemStatus;
  category: string;
  relevanceScore: number;
  aiModel: string;
  createdAt: string;
  sourceType?: 'RSS Feed' | 'AI Agent' | 'Manual Entry';
  publishedAt?: string;
  scheduledFor?: string;
  slug?: string;
  tags: string[];

  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;

  rejectedAt?: string;
  rejectionReason?: string | null;
  deletedAt?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  lastSync?: string;
  articleCount?: number;
}

export interface NewsAutomationSettings {
  autoDraft: boolean;
  autoSchedule: boolean;
  autoPublish: boolean;
}

export interface NewsEngineSettings {
  regionLocale: string;
  dailyLimit: number;
  deduplicationEnabled: boolean;

  writingTone?: string;
  modelLabel?: string;
  dedupSensitivity?: number;
  hallucinationMonitoring?: boolean;
  contentPreservation?: boolean;
  autoArchivePeriod?: string;
  emailAlerts?: boolean;
  weeklyDigest?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  origin: string;
  status: AuditLogStatus;
  promptUsed?: string;

  itemId?: string | null;
  sourceId?: string | null;
  metadata?: unknown;
}

function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export function exportAuditLogsToCsv(logs: AuditLogEntry[], filename?: string): void {
  if (typeof window === 'undefined') return;

  const defaultName = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  const safeName = filename?.trim() ? filename.trim() : defaultName;

  const headers = ['timestamp', 'action', 'origin', 'status', 'promptUsed'] as const;
  const rows = logs.map((log) => [log.timestamp, log.action, log.origin, log.status, log.promptUsed ?? '']);

  const csv = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface NewsEngineState {
  items: NewsItem[];
  sources: NewsSource[];
  automation: NewsAutomationSettings;
  settings: NewsEngineSettings;
  pipelineStatus: PipelineStatus;
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = 'solarmatch.newsEngine.v1';

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function seedNewsEngineState(): NewsEngineState {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const published1Date = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2);
  const published2Date = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6);

  const published1Title = 'Grid upgrade accelerates rooftop solar approvals';
  const published2Title = 'Battery incentives expand for homeowners in 2026';

  const items: NewsItem[] = [
    {
      id: uid('news'),
      title: 'Draft: Regional solar install costs dip slightly',
      summary: 'A draft item awaiting editorial review, based on aggregated market notes.',
      status: 'NEEDS_REVIEW',
      category: 'Market',
      relevanceScore: 82,
      aiModel: 'gpt-5.2',
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 45)),
      sourceType: 'AI Agent',
      tags: ['pricing', 'market'],
    },
    {
      id: uid('news'),
      title: 'Draft: Weather-driven demand boosts solar interest',
      summary: 'Draft-ready content with a pending rewrite request.',
      status: 'DRAFT_READY',
      category: 'Trends',
      relevanceScore: 74,
      aiModel: 'gpt-5.2',
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
      sourceType: 'AI Agent',
      tags: ['demand', 'weather'],
    },
    {
      id: uid('news'),
      title: published1Title,
      summary: 'A published article highlighting process changes that reduce wait times.',
      status: 'PUBLISHED',
      category: 'Policy',
      relevanceScore: 91,
      aiModel: 'gpt-5.2',
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 48)),
      sourceType: 'RSS Feed',
      publishedAt: iso(published1Date),
      slug: slugify(published1Title),
      tags: ['policy', 'grid'],
    },
    {
      id: uid('news'),
      title: published2Title,
      summary: 'A published summary of incentive changes and who they apply to.',
      status: 'PUBLISHED',
      category: 'Incentives',
      relevanceScore: 88,
      aiModel: 'gpt-5.2',
      createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)),
      sourceType: 'RSS Feed',
      publishedAt: iso(published2Date),
      slug: slugify(published2Title),
      tags: ['battery', 'incentives'],
    },
  ];

  const sources: NewsSource[] = [
    {
      id: uid('src'),
      name: 'Government updates (example)',
      url: 'https://example.com/rss',
      enabled: true,
      lastSync: iso(new Date(now.getTime() - 1000 * 60 * 12)),
      articleCount: 24,
    },
    {
      id: uid('src'),
      name: 'Industry news (example)',
      url: 'https://example.com/industry/rss',
      enabled: true,
      lastSync: iso(new Date(now.getTime() - 1000 * 60 * 30)),
      articleCount: 18,
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: uid('log'),
      timestamp: iso(new Date(now.getTime() - 1000 * 60 * 7)),
      action: 'AI Draft Generated',
      origin: 'system',
      status: 'INFO',
      promptUsed: 'Generate an admin-ready draft summary based on the latest sources and constraints.',
    },
    {
      id: uid('log'),
      timestamp: iso(new Date(now.getTime() - 1000 * 60 * 3)),
      action: 'Item Moved to Needs Review',
      origin: 'system',
      status: 'INFO',
    },
  ];

  return {
    items,
    sources,
    automation: {
      autoDraft: true,
      autoSchedule: false,
      autoPublish: false,
    },
    settings: {
      regionLocale: 'AU',
      dailyLimit: 6,
      deduplicationEnabled: true,
    },
    pipelineStatus: 'NOMINAL',
    auditLogs,
  };
}

export function loadNewsEngineState(): NewsEngineState {
  if (typeof window === 'undefined') {
    return seedNewsEngineState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedNewsEngineState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  const parsed = safeParseJson<NewsEngineState>(raw);
  if (!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.auditLogs)) {
    const seeded = seedNewsEngineState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return parsed;
}

export function saveNewsEngineState(next: NewsEngineState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function appendAuditLog(state: NewsEngineState, entry: Omit<AuditLogEntry, 'id'>): NewsEngineState {
  const nextEntry: AuditLogEntry = { id: uid('log'), ...entry };
  return {
    ...state,
    auditLogs: [nextEntry, ...state.auditLogs],
  };
}

export function upsertItem(state: NewsEngineState, item: NewsItem): NewsEngineState {
  const existingIndex = state.items.findIndex((it) => it.id === item.id);
  if (existingIndex === -1) {
    return { ...state, items: [item, ...state.items] };
  }

  const nextItems = state.items.slice();
  nextItems[existingIndex] = item;
  return { ...state, items: nextItems };
}

export function createDraftFromTitle(title: string, summary: string): NewsItem {
  return {
    id: uid('news'),
    title,
    summary,
    status: 'DRAFT',
    category: 'Manual',
    relevanceScore: 0,
    aiModel: 'gpt-5.2',
    createdAt: new Date().toISOString(),
    sourceType: 'Manual Entry',
    tags: [],
  };
}

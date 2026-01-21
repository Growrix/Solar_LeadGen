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
  schedulePriority?: 'Low' | 'Normal' | 'High' | 'Urgent' | string;
  scheduleExpiresAt?: string | null;
  scheduleIsFeatured?: boolean;
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
  aiInputPrompt?: string;
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

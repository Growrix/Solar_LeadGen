import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { getNewsEnginePipelineStatus } from '@/lib/news-engine/settings';
import { writeNewsAuditLog } from '@/lib/news-engine/audit';
import { slugify } from '@/lib/news-engine/slug';
import { callOpenAiJson } from '@/lib/openai';
import { resolveNewsAiCallConfig, reportNewsAiKeyError, reportNewsAiKeySuccess } from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RSS_FETCH_TIMEOUT_MS = 20_000;

function truncateForLog(value: string, max = 600): string {
  if (!value) return '';
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

function looksLikeHtml(contentType: string | null, body: string): boolean {
  const ct = (contentType ?? '').toLowerCase();
  if (ct.includes('text/html') || ct.includes('application/xhtml')) return true;
  const head = body.slice(0, 300).trim().toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<head>');
}

async function fetchTextWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

const CRON_SECRET_HEADER = 'x-news-engine-cron-secret';

const KEY_DAILY_LIMIT = 'news.settings.daily_limit';
const KEY_DEDUP_ENABLED = 'news.settings.deduplication_enabled';

const KEY_AUTO_DRAFT = 'news.automation.auto_draft';
const KEY_AUTO_SCHEDULE = 'news.automation.auto_schedule';
const KEY_AUTO_PUBLISH = 'news.automation.auto_publish';
const KEY_AUTOMATION_CONFIG_JSON = 'news.automation.config_json';
const KEY_SOURCES_CONFIG_JSON = 'news.sources.config_json';

type SourcesConfig = {
  researchWeights: { web: number; social: number; journals: number };
  researchEnabled: { web: boolean; social: boolean; journals: boolean };
  rules: { deduplication: boolean; verifyPayload: boolean };
  minSources: number;
  countries: string[];
  blacklist: string;
};

type AutomationRunMode = 'dry' | 'live';

function parseRunMode(raw: string | null | undefined): AutomationRunMode {
  const v = (raw ?? '').trim().toLowerCase();
  return v === 'dry' ? 'dry' : 'live';
}

function parseBool(raw: string | null | undefined, fallback: boolean): boolean {
  if (raw === null || raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function parseNumber(raw: string | null | undefined, fallback: number): number {
  if (raw === null || raw === undefined) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function requireCronSecret(request: NextRequest): { ok: true } | { ok: false; status: number; error: string } {
  const configured = process.env.NEWS_ENGINE_CRON_SECRET;
  if (!configured) {
    return { ok: false, status: 500, error: 'Runner not configured: missing NEWS_ENGINE_CRON_SECRET' };
  }

  const provided = (request.headers.get(CRON_SECRET_HEADER) || '').trim();
  if (!provided || provided !== configured) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeJsonItem(item: any): Prisma.InputJsonValue {
  if (!item || typeof item !== 'object') return {};
  return {
    title: typeof item.title === 'string' ? item.title : null,
    link: typeof item.link === 'string' ? item.link : null,
    guid: typeof item.guid === 'string' ? item.guid : null,
    isoDate: typeof item.isoDate === 'string' ? item.isoDate : null,
    pubDate: typeof item.pubDate === 'string' ? item.pubDate : null,
    contentSnippet: typeof item.contentSnippet === 'string' ? item.contentSnippet : null,
  };
}

async function findAvailableSlug(base: string, excludeItemId?: string): Promise<string | null> {
  const normalizedBase = base.trim();
  if (!normalizedBase) return null;

  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? normalizedBase : `${normalizedBase}-${i + 1}`;
    const existing = await prisma.newsItem.findFirst({
      where: {
        slug: candidate,
        ...(excludeItemId ? { id: { not: excludeItemId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

type AutomationConfig = {
  windows?: string[];
};

type OperationalRuleScope = 'select' | 'research' | 'draft' | 'gate' | 'schedule' | 'publish';
type OperationalRuleAction = 'allow' | 'block' | 'require_review' | 'force_model' | 'priority';
type OperationalRuleSeverity = 'warn' | 'block';
type OperationalRuleConditionKind = 'category' | 'keywords_blacklist' | 'min_sources' | 'duplicate_similarity_gt';

type OperationalRuleCondition = {
  id: string;
  kind: OperationalRuleConditionKind;
  value: string;
};

type OperationalRuleConfig = {
  scope: OperationalRuleScope;
  conditions: OperationalRuleCondition[];
  action: OperationalRuleAction;
  severity: OperationalRuleSeverity;
  actionValue?: string;
};

type ParsedOperationalRule = {
  id: string;
  name: string;
  enabled: boolean;
  config: OperationalRuleConfig;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseOperationalRuleConfig(raw: unknown): OperationalRuleConfig | null {
  if (!isPlainObject(raw)) return null;
  const scope = typeof raw.scope === 'string' ? (raw.scope.trim() as OperationalRuleScope) : null;
  const action = typeof raw.action === 'string' ? (raw.action.trim() as OperationalRuleAction) : null;
  const severity = typeof raw.severity === 'string' ? (raw.severity.trim() as OperationalRuleSeverity) : null;
  const actionValue = typeof raw.actionValue === 'string' ? raw.actionValue.trim() : '';

  const allowedScopes: OperationalRuleScope[] = ['select', 'research', 'draft', 'gate', 'schedule', 'publish'];
  const allowedActions: OperationalRuleAction[] = ['allow', 'block', 'require_review', 'force_model', 'priority'];
  const allowedSeverities: OperationalRuleSeverity[] = ['warn', 'block'];

  if (!scope || !allowedScopes.includes(scope)) return null;
  if (!action || !allowedActions.includes(action)) return null;
  if (!severity || !allowedSeverities.includes(severity)) return null;

  const rawConditions = Array.isArray(raw.conditions) ? raw.conditions : [];
  const conditions: OperationalRuleCondition[] = rawConditions
    .filter((c) => isPlainObject(c))
    .map((c) => ({
      id: typeof c.id === 'string' ? c.id : '',
      kind: typeof c.kind === 'string' ? (c.kind.trim() as OperationalRuleConditionKind) : 'category',
      value: typeof c.value === 'string' ? c.value : '',
    }))
    .filter((c) => !!c.kind && !!c.value);

  return {
    scope,
    conditions,
    action,
    severity,
    ...(actionValue ? { actionValue } : {}),
  };
}

function normalizeKeywordsList(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 50);
}

function entryTextForRules(entry: { title: string; url: string; rawJson: unknown }): string {
  const pieces: string[] = [];
  if (entry.title) pieces.push(entry.title);
  if (entry.url) pieces.push(entry.url);
  if (isPlainObject(entry.rawJson)) {
    const maybeSnippet = entry.rawJson.contentSnippet;
    if (typeof maybeSnippet === 'string' && maybeSnippet.trim()) pieces.push(maybeSnippet);
    const maybeContent = entry.rawJson.content;
    if (typeof maybeContent === 'string' && maybeContent.trim()) pieces.push(maybeContent);
  }
  return pieces.join('\n').toLowerCase();
}

function pickLastErrorFromResults(input: {
  rssResults: Array<{ error?: string; status?: string }>;
  draftResults: Array<{ error?: string }>;
}): string | null {
  for (let i = input.draftResults.length - 1; i >= 0; i -= 1) {
    const e = input.draftResults[i]?.error;
    if (typeof e === 'string' && e.trim()) return e.trim();
  }
  for (let i = input.rssResults.length - 1; i >= 0; i -= 1) {
    const e = input.rssResults[i]?.error;
    if (typeof e === 'string' && e.trim()) return e.trim();
    const s = input.rssResults[i]?.status;
    if (typeof s === 'string' && s.trim() && s !== 'ok' && s !== 'not_modified' && s !== 'skipped_dry_run') {
      return `RSS: ${s}`;
    }
  }
  return null;
}

function safeParseSourcesConfig(raw: string | null | undefined): SourcesConfig {
  const fallback: SourcesConfig = {
    researchWeights: { web: 70, social: 30, journals: 50 },
    researchEnabled: { web: true, social: true, journals: true },
    rules: { deduplication: true, verifyPayload: false },
    minSources: 3,
    countries: ['USA', 'UK', 'Japan', 'Germany'],
    blacklist: '',
  };

  if (!raw) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
  const obj = parsed as Record<string, unknown>;

  const next: SourcesConfig = {
    researchWeights: { ...fallback.researchWeights },
    researchEnabled: { ...fallback.researchEnabled },
    rules: { ...fallback.rules },
    minSources: fallback.minSources,
    countries: [...fallback.countries],
    blacklist: fallback.blacklist,
  };

  const weights = obj.researchWeights;
  if (weights && typeof weights === 'object' && !Array.isArray(weights)) {
    const w = weights as Record<string, unknown>;
    for (const key of ['web', 'social', 'journals'] as const) {
      const v = w[key];
      if (typeof v === 'number' && Number.isFinite(v)) {
        next.researchWeights[key] = Math.max(0, Math.min(100, Math.floor(v)));
      }
    }
  }

  const enabled = obj.researchEnabled;
  if (enabled && typeof enabled === 'object' && !Array.isArray(enabled)) {
    const e = enabled as Record<string, unknown>;
    for (const key of ['web', 'social', 'journals'] as const) {
      const v = e[key];
      if (typeof v === 'boolean') next.researchEnabled[key] = v;
    }
  }

  const rules = obj.rules;
  if (rules && typeof rules === 'object' && !Array.isArray(rules)) {
    const r = rules as Record<string, unknown>;
    if (typeof r.deduplication === 'boolean') next.rules.deduplication = r.deduplication;
    if (typeof r.verifyPayload === 'boolean') next.rules.verifyPayload = r.verifyPayload;
  }

  if (typeof obj.minSources === 'number' && Number.isFinite(obj.minSources)) {
    next.minSources = Math.max(0, Math.floor(obj.minSources));
  }

  if (Array.isArray(obj.countries)) {
    const cleaned = obj.countries
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 30);
    if (cleaned.length) next.countries = cleaned;
  }

  if (typeof obj.blacklist === 'string') next.blacklist = obj.blacklist;

  return next;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function parseBlacklistHosts(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const withoutScheme = line.replace(/^https?:\/\//i, '');
      const host = withoutScheme.split(/[\/\s?#]/)[0] ?? '';
      return host.trim().toLowerCase();
    })
    .filter(Boolean);
}

function isHostBlacklisted(hostname: string, blacklistHosts: string[]): boolean {
  if (!hostname) return false;
  return blacklistHosts.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`));

}

function safeParseAutomationConfig(raw: string | null | undefined): AutomationConfig {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as AutomationConfig;
  } catch {
    return {};
  }
}

function parseWindowStart(w: string): Date | null {
  // Supports:
  // - "09:00 - 11:00" (today)
  // - "YYYY-MM-DD • 09:00 - 11:00"
  const raw = w.trim();
  if (!raw) return null;

  const parts = raw.split('•').map((p) => p.trim());
  const hasDate = parts.length >= 2;

  const datePart = hasDate ? parts[0] : '';
  const timeRangePart = hasDate ? parts.slice(1).join(' • ') : raw;

  const startMatch = timeRangePart.match(/^(\d{2}):(\d{2})/);
  if (!startMatch) return null;

  const hour = Number.parseInt(startMatch[1], 10);
  const minute = Number.parseInt(startMatch[2], 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  const base = new Date();
  if (hasDate) {
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return null;
    const yyyy = Number.parseInt(dateMatch[1], 10);
    const mm = Number.parseInt(dateMatch[2], 10);
    const dd = Number.parseInt(dateMatch[3], 10);
    if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null;
    base.setFullYear(yyyy, mm - 1, dd);
  }

  base.setHours(hour, minute, 0, 0);
  return Number.isNaN(base.getTime()) ? null : base;
}

function chooseNextScheduleTime(config: AutomationConfig, now: Date): Date | null {
  const windows = Array.isArray(config.windows) ? config.windows : [];
  for (const w of windows) {
    const start = parseWindowStart(w);
    if (!start) continue;
    if (start.getTime() > now.getTime()) return start;
  }

  // Fallback: schedule 1 hour from now.
  const fallback = new Date(now.getTime() + 60 * 60 * 1000);
  fallback.setSeconds(0, 0);
  return fallback;
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(unfenced);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }

  return null;
}

function pickString(obj: Record<string, unknown> | null, key: string, fallback = ''): string {
  if (!obj) return fallback;
  const raw = obj[key];
  return typeof raw === 'string' ? raw.trim() : fallback;
}

function pickStringArray(obj: Record<string, unknown> | null, key: string): string[] {
  if (!obj) return [];
  const raw = obj[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  const startedAt = new Date();

  const runMode = parseRunMode(request.nextUrl.searchParams.get('mode'));
  const isDryRun = runMode === 'dry';

  const auth = requireCronSecret(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let jobLogId: string | null = null;

  try {
    const pipelineStatus = await getNewsEnginePipelineStatus();

    const jobLog = await prisma.newsJobLog.create({
      data: {
        type: 'AUTO_RUN',
        status: 'SUCCESS',
        meta: {
          pipelineStatus,
          runMode,
          dryRun: isDryRun,
          startedAt: startedAt.toISOString(),
        },
      },
      select: { id: true },
    });

    jobLogId = jobLog.id;

    await writeNewsAuditLog({
      action: 'news_automation_run_started',
      metadata: { jobLogId, pipelineStatus },
    });

    if (pipelineStatus === 'PAUSED' || pipelineStatus === 'EMERGENCY_STOP') {
      const finishedAt = new Date();
      await prisma.newsJobLog.update({
        where: { id: jobLogId },
        data: {
          finishedAt,
          meta: {
            pipelineStatus,
            startedAt: startedAt.toISOString(),
            finishedAt: finishedAt.toISOString(),
            skipped: true,
          },
        },
      });

      await writeNewsAuditLog({
        action: 'news_automation_run_completed',
        metadata: { jobLogId, pipelineStatus, skipped: true },
      });

      return NextResponse.json({
        runId: jobLogId,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        summary: {
          ok: true,
          pipelineStatus,
          runMode,
          dryRun: isDryRun,
          skipped: true,
          skippedReason: `Pipeline is ${pipelineStatus}`,
          enabledSourceCount: 0,
          rssImportedCount: 0,
          selectedEntryCount: 0,
          draftCreatedCount: 0,
          ignoredByRulesCount: 0,
          forcedNeedsReviewCount: 0,
          priorityOverridesCount: 0,
          lastError: null,
        },
        results: {
          skipped: true,
          reason: `Pipeline is ${pipelineStatus}`,
        },
      });
    }

    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            KEY_DAILY_LIMIT,
            KEY_DEDUP_ENABLED,
            KEY_AUTO_DRAFT,
            KEY_AUTO_SCHEDULE,
            KEY_AUTO_PUBLISH,
            KEY_AUTOMATION_CONFIG_JSON,
            KEY_SOURCES_CONFIG_JSON,
          ],
        },
      },
      select: { key: true, value: true },
    });

    const settingMap = new Map<string, string>(settings.map((row) => [row.key, row.value] as const));

    const dailyLimit = Math.min(Math.max(parseNumber(settingMap.get(KEY_DAILY_LIMIT), 6), 0), 50);
    const sourcesConfig = safeParseSourcesConfig(settingMap.get(KEY_SOURCES_CONFIG_JSON));
    const blacklistHosts = parseBlacklistHosts(sourcesConfig.blacklist);
    const deduplicationEnabled = sourcesConfig.rules.deduplication;

    const autoDraft = parseBool(settingMap.get(KEY_AUTO_DRAFT), true);
    const autoSchedule = parseBool(settingMap.get(KEY_AUTO_SCHEDULE), false);
    const autoPublish = parseBool(settingMap.get(KEY_AUTO_PUBLISH), false);

    const automationConfig = safeParseAutomationConfig(settingMap.get(KEY_AUTOMATION_CONFIG_JSON));

    const dbRules = await prisma.newsAutomationRule.findMany({
      where: { enabled: true },
      select: { id: true, name: true, enabled: true, config: true },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });

    const operationalRules: ParsedOperationalRule[] = [];
    for (const rule of dbRules) {
      const parsed = parseOperationalRuleConfig(rule.config);
      if (!parsed) continue;
      operationalRules.push({ id: rule.id, name: rule.name, enabled: rule.enabled, config: parsed });
    }

    const allEnabledSources = await prisma.newsSource.findMany({
      where: { enabled: true },
      select: { id: true, url: true, name: true, etag: true, lastModified: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const sources = allEnabledSources.filter((src) => {
      if (!blacklistHosts.length) return true;
      const host = extractHostname(src.url);
      return !isHostBlacklisted(host, blacklistHosts);
    });

    if (sources.length < sourcesConfig.minSources) {
      const finishedAt = new Date();
      const reason = `Enabled RSS sources (${sources.length}) is below minSources (${sourcesConfig.minSources}).`;
      await prisma.newsJobLog.update({
        where: { id: jobLogId },
        data: {
          status: 'FAILURE',
          finishedAt,
          error: reason,
          meta: {
            pipelineStatus,
            runMode,
            dryRun: isDryRun,
            startedAt: startedAt.toISOString(),
            finishedAt: finishedAt.toISOString(),
            settings: {
              dailyLimit,
              deduplicationEnabled,
              autoDraft,
              autoSchedule,
              autoPublish,
            },
            sourcesConfig: {
              minSources: sourcesConfig.minSources,
              countries: sourcesConfig.countries,
              blacklistCount: blacklistHosts.length,
              filteredSources: {
                enabledTotal: allEnabledSources.length,
                allowed: sources.length,
              },
            },
          },
        },
      });

      await writeNewsAuditLog({
        action: 'news_automation_run_completed',
        metadata: { jobLogId, ok: false, error: reason, pipelineStatus },
      });

      return NextResponse.json(
        {
          runId: jobLogId,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          summary: {
            ok: false,
            pipelineStatus,
            runMode,
            dryRun: isDryRun,
            skipped: false,
            skippedReason: null,
            enabledSourceCount: sources.length,
            rssImportedCount: 0,
            selectedEntryCount: 0,
            draftCreatedCount: 0,
            ignoredByRulesCount: 0,
            forcedNeedsReviewCount: 0,
            priorityOverridesCount: 0,
            lastError: reason,
          },
          results: {
            pipelineStatus,
            runMode,
            dryRun: isDryRun,
            enabledSourceCount: sources.length,
            error: reason,
          },
        },
        { status: 400 }
      );
    }

    const rssParser = new Parser();

    const rssResults: Array<{
      sourceId: string;
      status: string;
      imported: number;
      itemsSeen?: number;
      error?: string;
      ignoredVerifyPayload?: number;
    }> = [];

    let ignoredVerifyPayloadTotal = 0;

    if (isDryRun) {
      rssResults.push({ sourceId: 'ALL', status: 'skipped_dry_run', imported: 0 });
    }

    for (const source of sources) {
      if (isDryRun) {
        continue;
      }
      try {
        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (compatible; SolarMatchNewsEngine/1.0)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        };

        if (source.etag) headers['If-None-Match'] = source.etag;
        if (source.lastModified) headers['If-Modified-Since'] = source.lastModified;

        let response: Response;
        try {
          response = await fetchTextWithTimeout(
            source.url,
            {
              method: 'GET',
              headers,
              cache: 'no-store',
              redirect: 'follow',
            },
            RSS_FETCH_TIMEOUT_MS
          );
        } catch (error) {
          const fetchedAt = new Date();
          const message =
            error instanceof Error && (error.name === 'AbortError' || error.message.toLowerCase().includes('aborted'))
              ? `Fetch timed out after ${Math.round(RSS_FETCH_TIMEOUT_MS / 1000)}s`
              : `Fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`;

          await prisma.newsSource.update({
            where: { id: source.id },
            data: {
              lastFetchedAt: fetchedAt,
              lastSync: fetchedAt,
              lastError: message,
              errorCount: { increment: 1 },
            },
          });

          rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
          continue;
        }

        const fetchedAt = new Date();

        if (response.status === 304) {
          await prisma.newsSource.update({
            where: { id: source.id },
            data: { lastFetchedAt: fetchedAt, lastSync: fetchedAt, lastError: null },
          });

          rssResults.push({ sourceId: source.id, status: 'not_modified', imported: 0 });
          continue;
        }

        if (!response.ok) {
          const bodyText = await response.text().catch(() => '');
          const message = `Fetch failed (${response.status} ${response.statusText || ''})`.trim();

          await prisma.newsSource.update({
            where: { id: source.id },
            data: {
              lastFetchedAt: fetchedAt,
              lastSync: fetchedAt,
              lastError: bodyText ? `${message}: ${truncateForLog(bodyText)}` : message,
              errorCount: { increment: 1 },
            },
          });

          rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
          continue;
        }

        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');

        const contentType = response.headers.get('content-type');
        const xml = await response.text();

        if (looksLikeHtml(contentType, xml)) {
          const message = 'This URL did not return an RSS/Atom feed (got HTML).';
          await prisma.newsSource.update({
            where: { id: source.id },
            data: {
              lastFetchedAt: fetchedAt,
              lastSync: fetchedAt,
              lastError: `${message} Content-Type=${contentType ?? 'unknown'}. Body: ${truncateForLog(xml)}`,
              errorCount: { increment: 1 },
            },
          });
          rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
          continue;
        }

        let feed: any;
        try {
          feed = await rssParser.parseString(xml);
        } catch (error) {
          const parseMessage = error instanceof Error ? error.message : 'Unknown parse error';
          const message = `Feed parse failed: ${parseMessage}`;

          await prisma.newsSource.update({
            where: { id: source.id },
            data: {
              lastFetchedAt: fetchedAt,
              lastSync: fetchedAt,
              lastError: `${message}. Content-Type=${contentType ?? 'unknown'}. Body: ${truncateForLog(xml)}`,
              errorCount: { increment: 1 },
            },
          });
          rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
          continue;
        }
        const now = new Date();

        const items = Array.isArray(feed.items) ? feed.items : [];

        const entryData = items
          .map((it: any) => {
            const url = typeof it.link === 'string' ? it.link.trim() : '';
            if (!url) return null;

            const title = typeof it.title === 'string' ? it.title.trim() : '';
            const summary = typeof it.contentSnippet === 'string' ? it.contentSnippet.trim() : '';
            const contentLength = summary.length;
            const publishedAt = parseDate(it.isoDate) ?? parseDate(it.pubDate);

            // Verify Payload: stricter checks
            if (sourcesConfig.rules.verifyPayload) {
              if (!title || !summary || contentLength < 40) {
                return {
                  sourceId: source.id,
                  externalId: typeof it.guid === 'string' ? it.guid : null,
                  url,
                  title: title || url,
                  publishedAt,
                  fetchedAt: now,
                  status: 'IGNORED' as const,
                  rawJson: safeJsonItem(it),
                };
              }
            }

            return {
              sourceId: source.id,
              externalId: typeof it.guid === 'string' ? it.guid : null,
              url,
              title: title || url,
              publishedAt,
              fetchedAt: now,
              status: 'NEW' as const,
              rawJson: safeJsonItem(it),
            };
          })
          .filter(Boolean) as Array<{
          sourceId: string;
          externalId: string | null;
          url: string;
          title: string;
          publishedAt: Date | null;
          fetchedAt: Date;
          status: 'NEW' | 'IGNORED';
          rawJson: Prisma.InputJsonValue;
        }>;


        // Separate valid and ignored entries
        const validEntries = entryData.filter((e) => e.status === 'NEW');
        const ignoredEntries = entryData.filter((e) => e.status === 'IGNORED');

        const created = validEntries.length
          ? await prisma.newsSourceEntry.createMany({ data: validEntries, skipDuplicates: true })
          : { count: 0 };

        const ignoredCreated = ignoredEntries.length
          ? await prisma.newsSourceEntry.createMany({ data: ignoredEntries, skipDuplicates: true })
          : { count: 0 };

        ignoredVerifyPayloadTotal += ignoredCreated.count;

        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: fetchedAt,
            lastSync: fetchedAt,
            lastError: null,
            errorCount: 0,
            ...(etag ? { etag } : {}),
            ...(lastModified ? { lastModified } : {}),
            articleCount: { increment: created.count },
          },
        });

        rssResults.push({
          sourceId: source.id,
          status: 'ok',
          imported: created.count,
          itemsSeen: items.length,
          ignoredVerifyPayload: ignoredCreated.count,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'RSS sync failed';
        rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
      }
    }


    const selectableEntries = await prisma.newsSourceEntry.findMany({
      where: {
        status: 'NEW',
        ...(deduplicationEnabled ? { itemId: null } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { fetchedAt: 'desc' }, { id: 'asc' }],
      take: dailyLimit,
      select: {
        id: true,
        sourceId: true,
        url: true,
        title: true,
        publishedAt: true,
        rawJson: true,
      },
    });

    const draftResults: Array<{ entryId: string; ok: boolean; itemId?: string; status?: string; error?: string }> = [];

    let ignoredByRulesCount = 0;
    let forcedNeedsReviewCount = 0;
    let priorityOverridesCount = 0;

    for (const entry of selectableEntries) {
      if (!isDryRun && operationalRules.length) {
        const entryText = entryTextForRules(entry);
        const matchingSelectRule = operationalRules.find((r) => {
          if (r.config.scope !== 'select') return false;
          if (r.config.action !== 'block') return false;
          if (r.config.severity !== 'block') return false;
          return r.config.conditions.some((c) => {
            if (c.kind !== 'keywords_blacklist') return false;
            const keywords = normalizeKeywordsList(c.value);
            return keywords.some((kw) => entryText.includes(kw));
          });
        });

        if (matchingSelectRule) {
          await prisma.newsSourceEntry
            .update({
              where: { id: entry.id },
              data: {
                status: 'IGNORED',
                error: `blocked_by_rule:${matchingSelectRule.id}`,
              },
            })
            .catch(() => null);
          ignoredByRulesCount += 1;
          draftResults.push({ entryId: entry.id, ok: true, status: 'ignored_by_rule' });
          continue;
        }
      }

      if (isDryRun) {
        if (!autoDraft) {
          draftResults.push({ entryId: entry.id, ok: true, status: 'dry_run_skipped_autoDraft_disabled' });
          continue;
        }

        const wouldAutoPublish = pipelineStatus === 'NOMINAL' && autoPublish;
        const wouldAutoSchedule = !wouldAutoPublish && autoSchedule;
        draftResults.push({
          entryId: entry.id,
          ok: true,
          status: wouldAutoPublish
            ? 'dry_run_would_publish'
            : wouldAutoSchedule
              ? 'dry_run_would_schedule'
              : 'dry_run_would_create_needs_review',
        });
        continue;
      }

      if (!autoDraft) {
        draftResults.push({ entryId: entry.id, ok: true, status: 'skipped_autoDraft_disabled' });
        continue;
      }

      let aiLogId: string | null = null;
      let resolvedApiKeyId: string | null = null;

      try {
        const aiConfig = await resolveNewsAiCallConfig(prisma, {
          taskType: 'draft_longform',
          pool: 'DRAFTING',
          fallbackProvider: 'openai',
          fallbackModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        });

        resolvedApiKeyId = aiConfig.apiKeyId;

        const aiLog = await prisma.newsAiRequestLog.create({
          data: {
            action: 'draft_from_rss_entry',
            provider: aiConfig.provider,
            model: aiConfig.model,
            taskType: 'draft_longform',
            modelProfileId: aiConfig.modelProfileId,
            apiKeyId: aiConfig.apiKeyId,
            input: {
              entryId: entry.id,
              title: entry.title,
              url: entry.url,
              publishedAt: entry.publishedAt ? entry.publishedAt.toISOString() : null,
            },
            success: false,
          },
          select: { id: true },
        });

        aiLogId = aiLog.id;

        const prompt = [
          'Draft a NEWS ENGINE post from this RSS entry.',
          '',
          `- Title: ${entry.title}`,
          `- URL: ${entry.url}`,
          entry.publishedAt ? `- PublishedAt: ${entry.publishedAt.toISOString()}` : null,
          sourcesConfig.countries.length ? `- Geographic focus: ${sourcesConfig.countries.join(', ')}` : null,
          '',
          'Constraints:',
          '- Be accurate and avoid unverifiable claims.',
          '- Write in a professional news style for a solar lead-gen site.',
          '- Return JSON only (no markdown).',
          '- contentHtml must be valid HTML (<p>, <h2>, <ul>/<li>).',
        ]
          .filter(Boolean)
          .join('\n');

        const system =
          'You are an assistant that drafts NEWS ENGINE posts for a solar lead-gen company. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription, ogImageUrl.';

        const aiStartMs = Date.now();
        const { raw, modelUsed } = await callOpenAiJson({
          system,
          prompt,
          modelOverride: aiConfig.model,
          apiKeyOverride: aiConfig.apiKeyOverride ?? undefined,
        });
        const durationMs = Math.max(0, Date.now() - aiStartMs);
        const parsed = tryParseJsonObject(raw);

        const title = pickString(parsed, 'title', entry.title) || entry.title;
        const summary = pickString(parsed, 'summary', '');
        const contentHtml = pickString(parsed, 'contentHtml', '');
        const category = pickString(parsed, 'category', '');
        const tags = pickStringArray(parsed, 'tags');
        const seoTitle = pickString(parsed, 'seoTitle', '') || null;
        const seoDescription = pickString(parsed, 'seoDescription', '') || null;
        const ogImageUrl = pickString(parsed, 'ogImageUrl', '') || null;

        const now = new Date();
        const shouldAutoPublish = pipelineStatus === 'NOMINAL' && autoPublish;

        let scheduledFor: Date | null = null;
        let status: 'NEEDS_REVIEW' | 'SCHEDULED' | 'PUBLISHED' = 'NEEDS_REVIEW';

        let schedulePriority: string | null = null;
        let forceNeedsReview = false;

        if (operationalRules.length) {
          const draftText = `${title}\n${summary}\n${contentHtml}\n${category}`.toLowerCase();

          for (const r of operationalRules) {
            const cfg = r.config;
            const shouldConsiderScope = cfg.scope === 'draft' || cfg.scope === 'gate' || cfg.scope === 'schedule' || cfg.scope === 'publish';
            if (!shouldConsiderScope) continue;

            const matched = cfg.conditions.length
              ? cfg.conditions.some((c) => {
                  if (c.kind === 'category') {
                    return category.trim().toLowerCase() === c.value.trim().toLowerCase();
                  }
                  if (c.kind === 'keywords_blacklist') {
                    const keywords = normalizeKeywordsList(c.value);
                    return keywords.some((kw) => draftText.includes(kw));
                  }
                  return false;
                })
              : false;

            if (!matched) continue;

            if (cfg.action === 'block' && cfg.severity === 'block') {
              await prisma.newsSourceEntry
                .update({
                  where: { id: entry.id },
                  data: { status: 'IGNORED', error: `blocked_by_rule:${r.id}` },
                })
                .catch(() => null);

              ignoredByRulesCount += 1;
              draftResults.push({ entryId: entry.id, ok: true, status: 'ignored_by_rule' });
              throw new Error('__RULE_BLOCKED__');
            }

            if (cfg.action === 'require_review') {
              forceNeedsReview = true;
            }

            if (cfg.scope === 'schedule' && cfg.action === 'priority' && cfg.actionValue?.trim()) {
              schedulePriority = cfg.actionValue.trim();
            }
          }
        }

        if (!shouldAutoPublish && autoSchedule) {
          scheduledFor = chooseNextScheduleTime(automationConfig, now);
          status = 'SCHEDULED';
        }

        if (shouldAutoPublish) {
          status = 'PUBLISHED';
        }

        if (forceNeedsReview && (status === 'SCHEDULED' || status === 'PUBLISHED')) {
          forcedNeedsReviewCount += 1;
          status = 'NEEDS_REVIEW';
          scheduledFor = null;
        }

        if (schedulePriority && status === 'SCHEDULED') {
          priorityOverridesCount += 1;
        }

        const createdItem = await prisma.newsItem.create({
          data: {
            title,
            summary,
            contentHtml,
            category,
            tags,
            aiModel: modelUsed,
            relevanceScore: 0,
            sourceType: 'RSS_FEED',
            sourceId: entry.sourceId,
            status,
            scheduledFor,
            ...(schedulePriority ? { schedulePriority } : {}),
            publishedAt: shouldAutoPublish ? now : null,
            seoTitle,
            seoDescription,
            ogImageUrl,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            ogImageUrl: true,
            ogImageApprovalRequired: true,
            ogImageApprovedAt: true,
          },
        });

        let publishBlockedByOgApproval = false;

        if (
          (createdItem.status === 'PUBLISHED' || createdItem.status === 'SCHEDULED') &&
          createdItem.ogImageApprovalRequired &&
          !createdItem.ogImageApprovedAt
        ) {
          publishBlockedByOgApproval = true;
          await prisma.newsItem.update({
            where: { id: createdItem.id },
            data: {
              status: 'NEEDS_REVIEW',
              publishedAt: null,
              scheduledFor: null,
            },
            select: { id: true },
          });
        }

        if (shouldAutoPublish && !publishBlockedByOgApproval) {
          const base = createdItem.slug?.trim() || slugify(createdItem.title);
          const slug = await findAvailableSlug(base, createdItem.id);
          if (slug) {
            await prisma.newsItem.update({
              where: { id: createdItem.id },
              data: { slug },
              select: { id: true },
            });
          }
        }

        await prisma.newsSourceEntry.update({
          where: { id: entry.id },
          data: {
            status: 'PROCESSED',
            itemId: createdItem.id,
            error: null,
          },
        });

        await prisma.newsAiRequestLog.update({
          where: { id: aiLogId },
          data: {
            model: modelUsed,
            durationMs,
            output: { draft: { title, summary, contentHtml, category, tags, seoTitle, seoDescription, ogImageUrl }, raw },
            success: true,
            itemId: createdItem.id,
          },
        });

        await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

        await writeNewsAuditLog({
          action: 'news_ai_draft_generated',
          itemId: createdItem.id,
          sourceId: entry.sourceId,
          metadata: {
            entryId: entry.id,
            autoPublish: shouldAutoPublish,
            autoSchedule,
            publishBlockedByOgApproval,
            scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
          },
          promptUsed: prompt,
        });

        draftResults.push({
          entryId: entry.id,
          ok: true,
          itemId: createdItem.id,
          status: publishBlockedByOgApproval ? 'NEEDS_REVIEW' : status,
        });
      } catch (error) {
        if (error instanceof Error && error.message === '__RULE_BLOCKED__') {
          continue;
        }
        const message = error instanceof Error ? error.message : 'Draft generation failed';

        await reportNewsAiKeyError(prisma, resolvedApiKeyId, message);

        if (aiLogId) {
          await prisma.newsAiRequestLog
            .update({
              where: { id: aiLogId },
              data: { success: false, error: message },
            })
            .catch(() => null);
        }

        await prisma.newsSourceEntry
          .update({
            where: { id: entry.id },
            data: { status: 'ERROR', error: message },
          })
          .catch(() => null);

        await writeNewsAuditLog({
          action: 'news_ai_draft_failed',
          sourceId: entry.sourceId,
          metadata: { entryId: entry.id, error: message },
        });

        draftResults.push({ entryId: entry.id, ok: false, error: message });
      }
    }

    const finishedAt = new Date();

    await prisma.newsJobLog.update({
      where: { id: jobLogId },
      data: {
        finishedAt,
        meta: {
          pipelineStatus,
          runMode,
          dryRun: isDryRun,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          settings: {
            dailyLimit,
            deduplicationEnabled,
            autoDraft,
            autoSchedule,
            autoPublish,
          },
          sourcesConfig: {
            minSources: sourcesConfig.minSources,
            countries: sourcesConfig.countries,
            blacklistCount: blacklistHosts.length,
            filteredSources: {
              enabledTotal: allEnabledSources.length,
              allowed: sources.length,
            },
          },
          verifyPayload: {
            enabled: sourcesConfig.rules.verifyPayload,
            ignoredCount: ignoredVerifyPayloadTotal,
          },
          rssResults,
          draftResults,
        },
      },
    });

    await writeNewsAuditLog({
      action: 'news_automation_run_completed',
      metadata: {
        jobLogId,
        pipelineStatus,
        draftCount: draftResults.filter((d) => d.ok && d.itemId).length,
      },
    });

    const rssImportedCount = rssResults.reduce((acc, r) => acc + (typeof r.imported === 'number' ? r.imported : 0), 0);
    const draftCreatedCount = draftResults.filter((d) => d.ok && d.itemId).length;
    const lastError = pickLastErrorFromResults({ rssResults, draftResults });

    return NextResponse.json({
      runId: jobLogId,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      summary: {
        ok: true,
        pipelineStatus,
        runMode,
        dryRun: isDryRun,
        skipped: false,
        skippedReason: null,
        enabledSourceCount: sources.length,
        rssImportedCount,
        selectedEntryCount: selectableEntries.length,
        draftCreatedCount,
        ignoredByRulesCount,
        forcedNeedsReviewCount,
        priorityOverridesCount,
        lastError,
      },
      results: {
        pipelineStatus,
        runMode,
        dryRun: isDryRun,
        enabledSourceCount: sources.length,
        sourcesConfig: {
          minSources: sourcesConfig.minSources,
          countries: sourcesConfig.countries,
          blacklistCount: blacklistHosts.length,
        },
        verifyPayload: {
          enabled: sourcesConfig.rules.verifyPayload,
          ignoredCount: ignoredVerifyPayloadTotal,
        },
        rssResults,
        selectedEntryCount: selectableEntries.length,
        draftResults,
        operationalRules: {
          enabledCount: dbRules.length,
          parsedCount: operationalRules.length,
          ignoredByRulesCount,
          forcedNeedsReviewCount,
          priorityOverridesCount,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Automation run failed';

    if (jobLogId) {
      await prisma.newsJobLog
        .update({
          where: { id: jobLogId },
          data: { status: 'FAILURE', finishedAt: new Date(), error: message },
        })
        .catch(() => null);

      await writeNewsAuditLog({
        action: 'news_automation_run_completed',
        metadata: { jobLogId, ok: false, error: message },
      });
    }

    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/internal/news-engine/automation/run] Error:', error);
    return NextResponse.json({ error: 'Failed to run News Engine automation' }, { status: 500 });
  }
}

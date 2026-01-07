import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { getNewsEnginePipelineStatus } from '@/lib/news-engine/settings';
import { writeNewsAuditLog } from '@/lib/news-engine/audit';
import { slugify } from '@/lib/news-engine/slug';
import { callOpenAiJson } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-news-engine-cron-secret';

const KEY_DAILY_LIMIT = 'news.settings.daily_limit';
const KEY_DEDUP_ENABLED = 'news.settings.deduplication_enabled';

const KEY_AUTO_DRAFT = 'news.automation.auto_draft';
const KEY_AUTO_SCHEDULE = 'news.automation.auto_schedule';
const KEY_AUTO_PUBLISH = 'news.automation.auto_publish';
const KEY_AUTOMATION_CONFIG_JSON = 'news.automation.config_json';

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
          ],
        },
      },
      select: { key: true, value: true },
    });

    const settingMap = new Map<string, string>(settings.map((row) => [row.key, row.value] as const));

    const dailyLimit = Math.min(Math.max(parseNumber(settingMap.get(KEY_DAILY_LIMIT), 6), 0), 50);
    const deduplicationEnabled = parseBool(settingMap.get(KEY_DEDUP_ENABLED), true);

    const autoDraft = parseBool(settingMap.get(KEY_AUTO_DRAFT), true);
    const autoSchedule = parseBool(settingMap.get(KEY_AUTO_SCHEDULE), false);
    const autoPublish = parseBool(settingMap.get(KEY_AUTO_PUBLISH), false);

    const automationConfig = safeParseAutomationConfig(settingMap.get(KEY_AUTOMATION_CONFIG_JSON));

    const sources = await prisma.newsSource.findMany({
      where: { enabled: true },
      select: { id: true, url: true, name: true, etag: true, lastModified: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const rssParser = new Parser();

    const rssResults: Array<{ sourceId: string; status: string; imported: number; itemsSeen?: number; error?: string }> = [];

    for (const source of sources) {
      try {
        const headers: Record<string, string> = {
          'User-Agent': 'SolarMatchNewsEngine/1.0 (+https://solarmatch.example)',
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        };

        if (source.etag) headers['If-None-Match'] = source.etag;
        if (source.lastModified) headers['If-Modified-Since'] = source.lastModified;

        const response = await fetch(source.url, { method: 'GET', headers });
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
          const message = `Fetch failed (${response.status})`;

          await prisma.newsSource.update({
            where: { id: source.id },
            data: {
              lastFetchedAt: fetchedAt,
              lastSync: fetchedAt,
              lastError: bodyText ? `${message}: ${bodyText.slice(0, 600)}` : message,
              errorCount: { increment: 1 },
            },
          });

          rssResults.push({ sourceId: source.id, status: 'error', imported: 0, error: message });
          continue;
        }

        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');

        const xml = await response.text();
        const feed = await rssParser.parseString(xml);
        const now = new Date();

        const items = Array.isArray(feed.items) ? feed.items : [];

        const entryData = items
          .map((it: any) => {
            const url = typeof it.link === 'string' ? it.link.trim() : '';
            if (!url) return null;

            const title = typeof it.title === 'string' ? it.title.trim() : '';
            const publishedAt = parseDate(it.isoDate) ?? parseDate(it.pubDate);

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
          status: 'NEW';
          rawJson: Prisma.InputJsonValue;
        }>;

        const created = entryData.length
          ? await prisma.newsSourceEntry.createMany({ data: entryData, skipDuplicates: true })
          : { count: 0 };

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

        rssResults.push({ sourceId: source.id, status: 'ok', imported: created.count, itemsSeen: items.length });
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

    for (const entry of selectableEntries) {
      if (!autoDraft) {
        draftResults.push({ entryId: entry.id, ok: true, status: 'skipped_autoDraft_disabled' });
        continue;
      }

      let aiLogId: string | null = null;

      try {
        const aiLog = await prisma.newsAiRequestLog.create({
          data: {
            action: 'draft_from_rss_entry',
            provider: 'openai',
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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

        const { raw, modelUsed } = await callOpenAiJson({ system, prompt });
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

        if (!shouldAutoPublish && autoSchedule) {
          scheduledFor = chooseNextScheduleTime(automationConfig, now);
          status = 'SCHEDULED';
        }

        if (shouldAutoPublish) {
          status = 'PUBLISHED';
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
            publishedAt: shouldAutoPublish ? now : null,
            seoTitle,
            seoDescription,
            ogImageUrl,
          },
          select: { id: true, title: true, slug: true },
        });

        if (shouldAutoPublish) {
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
            output: { draft: { title, summary, contentHtml, category, tags, seoTitle, seoDescription, ogImageUrl }, raw },
            success: true,
            itemId: createdItem.id,
          },
        });

        await writeNewsAuditLog({
          action: 'news_ai_draft_generated',
          itemId: createdItem.id,
          sourceId: entry.sourceId,
          metadata: {
            entryId: entry.id,
            autoPublish: shouldAutoPublish,
            autoSchedule,
            scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
          },
          promptUsed: prompt,
        });

        draftResults.push({ entryId: entry.id, ok: true, itemId: createdItem.id, status });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Draft generation failed';

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
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
          settings: {
            dailyLimit,
            deduplicationEnabled,
            autoDraft,
            autoSchedule,
            autoPublish,
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

    return NextResponse.json({
      runId: jobLogId,
      results: {
        pipelineStatus,
        rssResults,
        selectedEntryCount: selectableEntries.length,
        draftResults,
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

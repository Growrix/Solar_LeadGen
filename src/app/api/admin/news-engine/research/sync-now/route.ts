import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ResearchKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isKind(value: unknown): value is ResearchKind {
  return value === 'WEB' || value === 'SOCIAL' || value === 'JOURNAL' || value === 'TREND';
}

function parseLimit(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseInt(normalizeString(value), 10);
  if (!Number.isFinite(n) || n <= 0) return 30;
  return Math.min(Math.floor(n), 80);
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) return {};
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value as unknown as Prisma.InputJsonValue;
  if (typeof value === 'object') return value as Prisma.InputJsonValue;
  return {};
}

const RSS_FETCH_TIMEOUT_MS = 20_000;

async function fetchTextWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function getSeedFeedsForKind(kind: ResearchKind): string[] {
  // Practical E2E: use stable public RSS/Atom sources per research kind.
  // This makes the UI functional without requiring paid web-search APIs.
  switch (kind) {
    case 'WEB':
      return [
        'https://news.google.com/rss/search?q=solar%20energy&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=rooftop%20solar&hl=en-US&gl=US&ceid=US:en',
      ];
    case 'SOCIAL':
      return [
        'https://www.reddit.com/r/solar/.rss',
        'https://www.reddit.com/r/solarenergy/.rss',
      ];
    case 'JOURNAL':
      return [
        'https://www.sciencedaily.com/rss/earth_climate/renewable_energy.xml',
      ];
    case 'TREND':
      return [
        'https://news.google.com/rss/search?q=solar%20trend&hl=en-US&gl=US&ceid=US:en',
      ];
  }
}

async function fetchFeedEntries(feedUrl: string, limit: number): Promise<Array<{ url: string; title: string; publishedAt: Date | null; rawJson: Prisma.InputJsonValue }>> {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; SolarMatchNewsEngine/1.0)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  const response = await fetchTextWithTimeout(
    feedUrl,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
      redirect: 'follow',
    },
    RSS_FETCH_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Feed fetch failed (${response.status})`);
  }

  const body = await response.text();

  const parser = new Parser();
  const feed = await parser.parseString(body);
  const items = Array.isArray(feed?.items) ? feed.items : [];

  const out: Array<{ url: string; title: string; publishedAt: Date | null; rawJson: Prisma.InputJsonValue }> = [];

  for (const item of items.slice(0, limit)) {
    const url = normalizeString((item as any)?.link).trim();
    if (!url) continue;

    const title = normalizeString((item as any)?.title).trim() || url;
    const publishedAt = parseDate((item as any)?.isoDate) || parseDate((item as any)?.pubDate);

    out.push({
      url,
      title,
      publishedAt,
      rawJson: safeJsonValue({
        source: feedUrl,
        title: (item as any)?.title ?? null,
        link: (item as any)?.link ?? null,
        guid: (item as any)?.guid ?? null,
        isoDate: (item as any)?.isoDate ?? null,
        pubDate: (item as any)?.pubDate ?? null,
        contentSnippet: (item as any)?.contentSnippet ?? null,
      }),
    });
  }

  return out;
}

// POST /api/admin/news-engine/research/sync-now
// Body: { kind: WEB|SOCIAL|JOURNAL|TREND, query?: string, limit?: number }
export async function POST(request: NextRequest) {
  const startedAt = new Date();

  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as any;

    const kindRaw = body?.kind;
    if (!isKind(kindRaw)) {
      return NextResponse.json({ error: 'Invalid kind (expected WEB|SOCIAL|JOURNAL|TREND)' }, { status: 400 });
    }

    const query = normalizeString(body?.query).trim() || null;
    const limit = parseLimit(body?.limit);

    const feeds = getSeedFeedsForKind(kindRaw);

    const now = new Date();
    let received = 0;
    let imported = 0;
    const errors: Array<{ feedUrl: string; error: string }> = [];

    for (const feedUrl of feeds) {
      try {
        const entries = await fetchFeedEntries(feedUrl, limit);
        received += entries.length;

        if (entries.length) {
          const created = await prisma.newsResearchEntry.createMany({
            data: entries.map((e) => ({
              kind: kindRaw,
              query,
              url: e.url,
              title: e.title,
              publishedAt: e.publishedAt,
              fetchedAt: now,
              status: 'NEW',
              rawJson: e.rawJson,
            })),
            skipDuplicates: true,
          });

          imported += created.count;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ feedUrl, error: message });
      }
    }

    await writeNewsAuditLog({
      action: errors.length ? 'news_research_synced' : 'news_research_synced',
      actorId: auth.userId,
      metadata: {
        kind: kindRaw,
        query,
        feeds,
        imported,
        received,
        startedAt: startedAt.toISOString(),
        errors,
      },
    });

    return NextResponse.json({
      ok: true,
      kind: kindRaw,
      imported,
      received,
      feeds,
      errors,
      finishedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync research now';

    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    await writeNewsAuditLog({
      action: 'news_research_sync_failed',
      metadata: {
        error: message,
      },
    });

    console.error('❌ [POST /api/admin/news-engine/research/sync-now] Error:', error);
    return NextResponse.json({ error: 'Failed to sync research now' }, { status: 500 });
  }
}

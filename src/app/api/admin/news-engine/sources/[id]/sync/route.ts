import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

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

// POST /api/admin/news-engine/sources/[id]/sync
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startedAt = new Date();

  try {
    const auth = await requireAdmin();
    const { id } = await context.params;

    const source = await prisma.newsSource.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        url: true,
        enabled: true,
        etag: true,
        lastModified: true,
      },
    });

    if (!source) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

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

      await writeNewsAuditLog({
        action: 'news_source_sync_failed',
        actorId: auth.userId,
        sourceId: source.id,
        metadata: { status: 'fetch_exception', error: message },
      });

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const fetchedAt = new Date();

    if (response.status === 304) {
      await prisma.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchedAt: fetchedAt,
          lastSync: fetchedAt,
          lastError: null,
        },
      });

      await writeNewsAuditLog({
        action: 'news_source_synced',
        actorId: auth.userId,
        sourceId: source.id,
        metadata: { status: 304, imported: 0 },
      });

      return NextResponse.json({
        ok: true,
        status: 'not_modified' as const,
        imported: 0,
        fetchedAt: fetchedAt.toISOString(),
      });
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

      await writeNewsAuditLog({
        action: 'news_source_sync_failed',
        actorId: auth.userId,
        sourceId: source.id,
        metadata: { status: response.status },
      });

      return NextResponse.json({ error: message }, { status: 502 });
    }

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');

    const contentType = response.headers.get('content-type');
    const xml = await response.text();

    if (looksLikeHtml(contentType, xml)) {
      const message =
        'This URL did not return an RSS/Atom feed (got HTML). Use the site\'s RSS/Atom feed URL (often ends with /rss, /feed, or .xml).';
      await prisma.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchedAt: fetchedAt,
          lastSync: fetchedAt,
          lastError: `${message} Content-Type=${contentType ?? 'unknown'}. Body: ${truncateForLog(xml)}`,
          errorCount: { increment: 1 },
        },
      });

      await writeNewsAuditLog({
        action: 'news_source_sync_failed',
        actorId: auth.userId,
        sourceId: source.id,
        metadata: { status: 'not_a_feed', contentType },
      });

      return NextResponse.json({ error: message }, { status: 422 });
    }

    let feed: any;
    try {
      const parser = new Parser();
      feed = await parser.parseString(xml);
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

      await writeNewsAuditLog({
        action: 'news_source_sync_failed',
        actorId: auth.userId,
        sourceId: source.id,
        metadata: { status: 'parse_failed', contentType, error: parseMessage },
      });

      return NextResponse.json({ error: message }, { status: 422 });
    }

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
      ? await prisma.newsSourceEntry.createMany({
          data: entryData,
          skipDuplicates: true,
        })
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

    await writeNewsAuditLog({
      action: 'news_source_synced',
      actorId: auth.userId,
      sourceId: source.id,
      metadata: {
        imported: created.count,
        fetchedAt: fetchedAt.toISOString(),
        startedAt: startedAt.toISOString(),
        itemsSeen: items.length,
      },
    });

    return NextResponse.json({
      ok: true,
      status: 'ok' as const,
      imported: created.count,
      itemsSeen: items.length,
      fetchedAt: fetchedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/sources/[id]/sync] Error:', error);
    return NextResponse.json({ error: 'Failed to sync RSS source' }, { status: 500 });
  }
}

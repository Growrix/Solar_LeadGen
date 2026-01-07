import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import Parser from 'rss-parser';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

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

    const xml = await response.text();

    const parser = new Parser();
    const feed = await parser.parseString(xml);

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

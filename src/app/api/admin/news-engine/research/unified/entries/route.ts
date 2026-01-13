import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type SourceType = 'rss' | 'research';
type ResearchKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';
type EntryStatus = 'NEW' | 'PROCESSED' | 'IGNORED' | 'ERROR';

type Cursor = {
  fetchedAt: string;
  sourceType: SourceType;
  id: string;
};

function parseLimit(value: string | null): number {
  if (!value) return 40;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 40;
  return Math.min(n, 200);
}

function parseDateParam(value: string | null, mode: 'from' | 'to'): Date | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  // Accept YYYY-MM-DD from the UI.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) return null;
    if (mode === 'to') d.setUTCHours(23, 59, 59, 999);
    return d;
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const c = parsed as any;
    const fetchedAt = typeof c.fetchedAt === 'string' ? c.fetchedAt : '';
    const sourceType = c.sourceType === 'rss' || c.sourceType === 'research' ? c.sourceType : null;
    const id = typeof c.id === 'string' ? c.id : '';
    if (!fetchedAt || !sourceType || !id) return null;
    return { fetchedAt, sourceType, id };
  } catch {
    return null;
  }
}

function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c), 'utf8').toString('base64url');
}

function sourceTypeWeight(sourceType: SourceType): number {
  return sourceType === 'rss' ? 0 : 1;
}

function compareRows(
  a: { fetchedAtMs: number; sourceType: SourceType; id: string },
  b: { fetchedAtMs: number; sourceType: SourceType; id: string }
) {
  if (a.fetchedAtMs !== b.fetchedAtMs) return b.fetchedAtMs - a.fetchedAtMs;
  const aw = sourceTypeWeight(a.sourceType);
  const bw = sourceTypeWeight(b.sourceType);
  if (aw !== bw) return aw - bw;
  return b.id.localeCompare(a.id);
}

function makeCursorClauseForRss(
  cursor: Cursor | null,
  cursorFetchedAt: Date | null
): Prisma.NewsSourceEntryWhereInput | undefined {
  if (!cursor || !cursorFetchedAt) return undefined;

  const cWeight = sourceTypeWeight(cursor.sourceType);
  const rowWeight = sourceTypeWeight('rss');

  const or: Prisma.NewsSourceEntryWhereInput[] = [{ fetchedAt: { lt: cursorFetchedAt } }];
  if (rowWeight > cWeight) {
    or.push({ fetchedAt: cursorFetchedAt });
  } else if (rowWeight === cWeight && cursor.sourceType === 'rss') {
    or.push({ fetchedAt: cursorFetchedAt, id: { lt: cursor.id } });
  }

  return { OR: or };
}

function makeCursorClauseForResearch(
  cursor: Cursor | null,
  cursorFetchedAt: Date | null
): Prisma.NewsResearchEntryWhereInput | undefined {
  if (!cursor || !cursorFetchedAt) return undefined;

  const cWeight = sourceTypeWeight(cursor.sourceType);
  const rowWeight = sourceTypeWeight('research');

  const or: Prisma.NewsResearchEntryWhereInput[] = [{ fetchedAt: { lt: cursorFetchedAt } }];
  if (rowWeight > cWeight) {
    or.push({ fetchedAt: cursorFetchedAt });
  } else if (rowWeight === cWeight && cursor.sourceType === 'research') {
    or.push({ fetchedAt: cursorFetchedAt, id: { lt: cursor.id } });
  }

  return { OR: or };
}

// GET /api/admin/news-engine/research/unified/entries
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));

    const sourceTypeRaw = (searchParams.get('sourceType') || '').trim().toLowerCase();
    const sourceType: SourceType | null = sourceTypeRaw === 'rss' ? 'rss' : sourceTypeRaw === 'research' ? 'research' : null;

    const kindRaw = (searchParams.get('kind') || '').trim().toUpperCase();
    const kind: ResearchKind | null =
      kindRaw === 'WEB' || kindRaw === 'SOCIAL' || kindRaw === 'JOURNAL' || kindRaw === 'TREND' ? (kindRaw as ResearchKind) : null;

    const statusRaw = (searchParams.get('status') || '').trim().toUpperCase();
    const status: EntryStatus | null =
      statusRaw === 'NEW' || statusRaw === 'PROCESSED' || statusRaw === 'IGNORED' || statusRaw === 'ERROR' ? (statusRaw as EntryStatus) : null;

    const from = parseDateParam(searchParams.get('from'), 'from');
    const to = parseDateParam(searchParams.get('to'), 'to');
    const cursor = decodeCursor(searchParams.get('cursor'));
    const cursorFetchedAt = cursor ? new Date(cursor.fetchedAt) : null;
    const cursorFetchedAtOk = cursorFetchedAt && !Number.isNaN(cursorFetchedAt.getTime()) ? cursorFetchedAt : null;

    const shouldIncludeRss = sourceType === null || sourceType === 'rss';
    const shouldIncludeResearch = sourceType === null || sourceType === 'research';

    const fetchedAtWindow: Record<string, Date> = {};
    if (from) fetchedAtWindow.gte = from;
    if (to) fetchedAtWindow.lte = to;
    const fetchedAtFilter = Object.keys(fetchedAtWindow).length ? { fetchedAt: fetchedAtWindow } : {};

    const rssPromise = shouldIncludeRss
      ? prisma.newsSourceEntry.findMany({
          where: {
            ...(status ? { status } : {}),
            ...fetchedAtFilter,
            ...(makeCursorClauseForRss(cursor, cursorFetchedAtOk) ?? {}),
          },
          orderBy: [{ fetchedAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
          select: {
            id: true,
            sourceId: true,
            url: true,
            title: true,
            publishedAt: true,
            fetchedAt: true,
            status: true,
            error: true,
            itemId: true,
            source: { select: { name: true } },
          },
        })
      : Promise.resolve([]);

    const researchPromise = shouldIncludeResearch
      ? prisma.newsResearchEntry.findMany({
          where: {
            ...(kind ? { kind } : {}),
            ...(status ? { status } : {}),
            ...fetchedAtFilter,
            ...(makeCursorClauseForResearch(cursor, cursorFetchedAtOk) ?? {}),
          },
          orderBy: [{ fetchedAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
          select: {
            id: true,
            kind: true,
            query: true,
            url: true,
            title: true,
            publishedAt: true,
            fetchedAt: true,
            status: true,
            error: true,
            itemId: true,
          },
        })
      : Promise.resolve([]);

    const [rssRows, researchRows] = await Promise.all([rssPromise, researchPromise]);

    const rssItems = rssRows.map((r) => ({
      id: r.id,
      sourceType: 'rss' as const,
      kind: null,
      status: r.status as EntryStatus,
      url: r.url,
      title: r.title,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      fetchedAt: r.fetchedAt.toISOString(),
      fetchedAtMs: r.fetchedAt.getTime(),
      sourceId: r.sourceId,
      sourceName: r.source?.name ?? null,
      query: null,
      itemId: r.itemId ?? null,
      error: r.error ?? null,
    }));

    const researchItems = researchRows.map((r) => ({
      id: r.id,
      sourceType: 'research' as const,
      kind: r.kind as ResearchKind,
      status: r.status as EntryStatus,
      url: r.url,
      title: r.title,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      fetchedAt: r.fetchedAt.toISOString(),
      fetchedAtMs: r.fetchedAt.getTime(),
      sourceId: null,
      sourceName: null,
      query: r.query ?? null,
      itemId: r.itemId ?? null,
      error: r.error ?? null,
    }));

    const merged = [...rssItems, ...researchItems].sort(compareRows);
    const page = merged.slice(0, limit);
    const hasMore = merged.length > limit;

    const nextCursor = hasMore
      ? encodeCursor({
          fetchedAt: page[page.length - 1].fetchedAt,
          sourceType: page[page.length - 1].sourceType,
          id: page[page.length - 1].id,
        })
      : null;

    return NextResponse.json({
      computedAt: new Date().toISOString(),
      items: page.map((row) => ({
        id: row.id,
        sourceType: row.sourceType,
        kind: row.kind,
        status: row.status,
        url: row.url,
        title: row.title,
        publishedAt: row.publishedAt,
        fetchedAt: row.fetchedAt,
        sourceId: row.sourceId,
        sourceName: row.sourceName,
        query: row.query,
        itemId: row.itemId,
        error: row.error,
      })),
      nextCursor,
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

    console.error('❌ [GET /api/admin/news-engine/research/unified/entries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch unified research entries' }, { status: 500 });
  }
}

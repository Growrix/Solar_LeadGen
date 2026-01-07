import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

type ResearchKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';

type ResearchSyncEntryInput = {
  url: string;
  title?: string;
  publishedAt?: string | null;
  rawJson?: unknown;
};

type ResearchSyncRequest = {
  kind: ResearchKind;
  query?: string | null;
  entries: ResearchSyncEntryInput[];
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
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

function isKind(value: unknown): value is ResearchKind {
  return value === 'WEB' || value === 'SOCIAL' || value === 'JOURNAL' || value === 'TREND';
}

// POST /api/admin/news-engine/research/sync
export async function POST(request: NextRequest) {
  const startedAt = new Date();

  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as ResearchSyncRequest | null;

    const kindRaw = body?.kind;
    if (!isKind(kindRaw)) {
      return NextResponse.json({ error: 'Invalid kind (expected WEB|SOCIAL|JOURNAL|TREND)' }, { status: 400 });
    }

    const entries = Array.isArray(body?.entries) ? body!.entries : [];
    if (!entries.length) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    const query = normalizeString(body?.query).trim() || null;

    const now = new Date();

    const data = entries
      .map((e) => {
        const url = normalizeString(e?.url).trim();
        if (!url) return null;

        const title = normalizeString(e?.title).trim();
        const publishedAt = parseDate(e?.publishedAt);

        return {
          kind: kindRaw,
          query,
          url,
          title: title || url,
          publishedAt,
          fetchedAt: now,
          status: 'NEW' as const,
          rawJson: safeJsonValue(e?.rawJson),
        };
      })
      .filter(Boolean) as Array<{
      kind: ResearchKind;
      query: string | null;
      url: string;
      title: string;
      publishedAt: Date | null;
      fetchedAt: Date;
      status: 'NEW';
      rawJson: Prisma.InputJsonValue;
    }>;

    if (!data.length) {
      return NextResponse.json({ error: 'No valid entries (each entry must include a url)' }, { status: 400 });
    }

    const created = await prisma.newsResearchEntry.createMany({
      data,
      skipDuplicates: true,
    });

    await writeNewsAuditLog({
      action: 'news_research_synced',
      actorId: auth.userId,
      metadata: {
        kind: kindRaw,
        query,
        imported: created.count,
        received: entries.length,
        startedAt: startedAt.toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      imported: created.count,
      received: entries.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync research';

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

    console.error('❌ [POST /api/admin/news-engine/research/sync] Error:', error);
    return NextResponse.json({ error: 'Failed to sync research' }, { status: 500 });
  }
}

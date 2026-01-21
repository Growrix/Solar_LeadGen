import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type ResearchKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseLimit(value: string | null): number {
  if (!value) return 50;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(n, 200);
}

function isKind(value: unknown): value is ResearchKind {
  return value === 'WEB' || value === 'SOCIAL' || value === 'JOURNAL' || value === 'TREND';
}

// GET /api/admin/news-engine/research/entries?kind=WEB&limit=50
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const kindRaw = normalizeString(searchParams.get('kind')).trim().toUpperCase();
    if (!isKind(kindRaw)) {
      return NextResponse.json({ error: 'Invalid kind (expected WEB|SOCIAL|JOURNAL|TREND)' }, { status: 400 });
    }

    const limit = parseLimit(searchParams.get('limit'));

    const entries = await prisma.newsResearchEntry.findMany({
      where: { kind: kindRaw },
      orderBy: [{ fetchedAt: 'desc' }, { id: 'desc' }],
      take: limit,
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
    });

    return NextResponse.json({
      kind: kindRaw,
      entries: entries.map((e) => ({
        ...e,
        publishedAt: e.publishedAt ? e.publishedAt.toISOString() : null,
        fetchedAt: e.fetchedAt.toISOString(),
      })),
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

    console.error('❌ [GET /api/admin/news-engine/research/entries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch research entries' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseLimit(value: string | null): number {
  if (!value) return 50;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(n, 200);
}

// GET /api/admin/news-engine/sources
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = normalizeString(searchParams.get('q')).trim();
    const enabled = searchParams.get('enabled');
    const limit = parseLimit(searchParams.get('limit'));
    const cursor = searchParams.get('cursor');

    const where: Prisma.NewsSourceWhereInput = {
      ...(enabled === '1' ? { enabled: true } : enabled === '0' ? { enabled: false } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { url: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const sources = await prisma.newsSource.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        name: true,
        url: true,
        enabled: true,
        lastSync: true,
        articleCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = sources.length > limit;
    const pageSources = hasMore ? sources.slice(0, limit) : sources;
    const nextCursor = hasMore ? pageSources[pageSources.length - 1]?.id ?? null : null;

    return NextResponse.json({ sources: pageSources, nextCursor });
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
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/sources] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

// POST /api/admin/news-engine/sources
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const url = normalizeString(body.url).trim();
    const enabled = typeof body.enabled === 'boolean' ? body.enabled : true;

    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

    const created = await prisma.newsSource.create({
      data: {
        name,
        url,
        enabled,
      },
      select: {
        id: true,
        name: true,
        url: true,
        enabled: true,
        lastSync: true,
        articleCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_source_created',
      actorId: auth.userId,
      sourceId: created.id,
      metadata: { name: created.name, url: created.url },
    });

    return NextResponse.json({ source: created }, { status: 201 });
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
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/sources] Error:', error);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NEWS_ENGINE_DEFAULTS, publishDueScheduledNewsItems } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function parseLimit(value: string | null): number {
  if (!value) return NEWS_ENGINE_DEFAULTS.publicListDefaultLimit;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return NEWS_ENGINE_DEFAULTS.publicListDefaultLimit;
  return Math.min(n, NEWS_ENGINE_DEFAULTS.publicListMaxLimit);
}

export async function GET(request: NextRequest) {
  try {
    try {
      await publishDueScheduledNewsItems();
    } catch (error) {
      console.warn('⚠️ [GET /api/news] publishDueScheduledNewsItems failed:', error);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const cursor = searchParams.get('cursor');

    const items = await prisma.newsItem.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        slug: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        ogImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

    return NextResponse.json({
      items: pageItems,
      nextCursor,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error:
            'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/news] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

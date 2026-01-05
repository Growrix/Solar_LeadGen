import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { publishDueScheduledNewsItems } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    try {
      await publishDueScheduledNewsItems();
    } catch (error) {
      console.warn('⚠️ [GET /api/news/[slug]] publishDueScheduledNewsItems failed:', error);
    }

    const item = await prisma.newsItem.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        slug: true,
        contentHtml: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        ogImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
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

    console.error('❌ [GET /api/news/[slug]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
  }
}

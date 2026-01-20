import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;

    const existing = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        deletedAt: true,
        publishedAt: true,
        scheduledFor: true,
        slug: true,
      },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Only published items can be unpublished' }, { status: 409 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        status: 'DRAFT',
        publishedAt: null,
        scheduledFor: null,
        scheduleExpiresAt: null,
        scheduleIsFeatured: false,
        rejectedAt: null,
        rejectionReason: null,
      },
      select: {
        id: true,
        status: true,
        publishedAt: true,
        scheduledFor: true,
        slug: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_unpublished',
      actorId: auth.userId,
      itemId: id,
      metadata: {
        slug: updated.slug,
        previousPublishedAt: existing.publishedAt ? existing.publishedAt.toISOString() : null,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error:
              'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
          },
          { status: 500 }
        );
      }

      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/unpublish] Error:', error);
    return NextResponse.json({ error: 'Failed to unpublish news item' }, { status: 500 });
  }
}

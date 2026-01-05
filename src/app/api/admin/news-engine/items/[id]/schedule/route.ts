import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseRequiredFutureDate(value: unknown): Date | null {
  const s = normalizeString(value).trim();
  if (!s) return null;
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getTime() <= Date.now()) return null;
  return dt;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const scheduledFor = parseRequiredFutureDate(body.scheduledFor);
    if (!scheduledFor) {
      return NextResponse.json({ error: 'scheduledFor must be a future ISO datetime' }, { status: 400 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledFor,
        publishedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      },
      select: {
        id: true,
        status: true,
        scheduledFor: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_scheduled',
      actorId: auth.userId,
      itemId: id,
      metadata: { scheduledFor: updated.scheduledFor?.toISOString() },
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

    console.error('❌ [POST /api/admin/news-engine/items/[id]/schedule] Error:', error);
    return NextResponse.json({ error: 'Failed to schedule news item' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const note = normalizeString(body.note).trim();
    if (!note) {
      return NextResponse.json({ error: 'note is required' }, { status: 400 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        status: 'DRAFT',
        rejectedAt: null,
        rejectionReason: null,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_rewrite_requested',
      actorId: auth.userId,
      itemId: id,
      metadata: { note },
      promptUsed: note,
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

    console.error('❌ [POST /api/admin/news-engine/items/[id]/rewrite-request] Error:', error);
    return NextResponse.json({ error: 'Failed to request rewrite' }, { status: 500 });
  }
}

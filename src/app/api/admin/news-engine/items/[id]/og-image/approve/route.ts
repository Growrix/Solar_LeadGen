import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// POST /api/admin/news-engine/items/[id]/og-image/approve
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    const { id } = await context.params;
    const itemId = normalizeString(id);
    if (!itemId) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const existing = await prisma.newsItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        deletedAt: true,
        ogImageUrl: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
        ogImageApprovedById: true,
      },
    });

    if (!existing || existing.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!existing.ogImageUrl || !existing.ogImageUrl.trim()) {
      return NextResponse.json({ error: 'Cannot approve: ogImageUrl is not set' }, { status: 409 });
    }

    const now = new Date();

    const updated = await prisma.newsItem.update({
      where: { id: itemId },
      data: {
        ogImageApprovedAt: now,
        ogImageApprovedById: auth.userId,
      },
      select: {
        id: true,
        ogImageUrl: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
        ogImageApprovedById: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_og_image_approved',
      actorId: auth.userId,
      itemId: updated.id,
      metadata: {
        ogImageUrl: updated.ogImageUrl,
        ogImageApprovalRequired: updated.ogImageApprovalRequired,
        ogImageApprovedAt: updated.ogImageApprovedAt?.toISOString() ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: updated.id,
      ogImageApprovedAt: updated.ogImageApprovedAt ? updated.ogImageApprovedAt.toISOString() : null,
      ogImageApprovedById: updated.ogImageApprovedById,
    });
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
          { error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.' },
          { status: 500 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/og-image/approve] Error:', error);
    return NextResponse.json({ error: 'Failed to approve OG image' }, { status: 500 });
  }
}

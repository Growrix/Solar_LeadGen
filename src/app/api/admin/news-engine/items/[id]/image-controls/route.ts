import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// GET /api/admin/news-engine/items/[id]/image-controls
export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const item = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        ogImageUrl: true,
        ogImageLastCheckedAt: true,
        ogImageLastCheckStatus: true,
        ogImageLastCheckError: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
        ogImageApprovedById: true,
      },
    });

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    return NextResponse.json({
      itemId: item.id,
      ogImageUrl: item.ogImageUrl,
      ogImageLastCheckedAt: item.ogImageLastCheckedAt ? item.ogImageLastCheckedAt.toISOString() : null,
      ogImageLastCheckStatus: item.ogImageLastCheckStatus ?? null,
      ogImageLastCheckError: item.ogImageLastCheckError ?? null,
      ogImageApprovalRequired: item.ogImageApprovalRequired,
      ogImageApprovedAt: item.ogImageApprovedAt ? item.ogImageApprovedAt.toISOString() : null,
      ogImageApprovedById: item.ogImageApprovedById,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/items/[id]/image-controls] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch image controls' }, { status: 500 });
  }
}

// PUT /api/admin/news-engine/items/[id]/image-controls
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const body = (await request.json().catch(() => null)) as any;

    const data: Prisma.JsonObject = {};

    if (typeof body?.ogImageApprovalRequired === 'boolean') {
      data.ogImageApprovalRequired = body.ogImageApprovalRequired;
    }

    if (typeof body?.ogImageUrl === 'string') {
      data.ogImageUrl = normalizeString(body.ogImageUrl) || null;
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data,
      select: {
        id: true,
        ogImageUrl: true,
        ogImageLastCheckedAt: true,
        ogImageLastCheckStatus: true,
        ogImageLastCheckError: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
        ogImageApprovedById: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_image_controls_updated',
      actorId: auth.userId,
      itemId: updated.id,
      metadata: data,
    });

    return NextResponse.json({
      itemId: updated.id,
      ogImageUrl: updated.ogImageUrl,
      ogImageLastCheckedAt: updated.ogImageLastCheckedAt ? updated.ogImageLastCheckedAt.toISOString() : null,
      ogImageLastCheckStatus: updated.ogImageLastCheckStatus ?? null,
      ogImageLastCheckError: updated.ogImageLastCheckError ?? null,
      ogImageApprovalRequired: updated.ogImageApprovalRequired,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    console.error('❌ [PUT /api/admin/news-engine/items/[id]/image-controls] Error:', error);
    return NextResponse.json({ error: 'Failed to update image controls' }, { status: 500 });
  }
}

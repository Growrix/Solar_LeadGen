import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { ingestOgImageToS3 } from '@/lib/news-engine/og-image';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// POST /api/admin/news-engine/items/[id]/og-image/ingest
// Body: { imageUrl: string }
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    const { id } = await context.params;
    const itemId = normalizeString(id);
    if (!itemId) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const body = (await request.json().catch(() => null)) as any;
    const imageUrl = normalizeString(body?.imageUrl);
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });

    const item = await prisma.newsItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        deletedAt: true,
        ogImageApprovalRequired: true,
      },
    });

    if (!item || item.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const ingested = await ingestOgImageToS3({
      itemId: item.id,
      imageUrl,
    });

    const updated = await prisma.newsItem.update({
      where: { id: item.id },
      data: {
        ogImageUrl: ingested.url,
        ogImageApprovedAt: null,
        ogImageApprovedById: null,
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
      action: 'news_item_og_image_ingested',
      actorId: auth.userId,
      itemId: updated.id,
      metadata: {
        sourceUrl: ingested.sourceUrl,
        ogImageUrl: updated.ogImageUrl,
        contentType: ingested.contentType,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: updated.id,
      ogImageUrl: updated.ogImageUrl,
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

    const message = error instanceof Error ? error.message : 'Failed to ingest OG image';
    console.error('❌ [POST /api/admin/news-engine/items/[id]/og-image/ingest] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

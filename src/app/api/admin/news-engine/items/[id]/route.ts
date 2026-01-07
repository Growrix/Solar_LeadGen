import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.floor(value);
}

function normalizeNewsItemStatus(value: unknown):
  | 'DRAFT'
  | 'NEEDS_REVIEW'
  | 'RESEARCH_DONE'
  | 'DRAFT_READY'
  | 'PUBLISHED'
  | 'SCHEDULED'
  | 'REJECTED'
  | 'ERROR'
  | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  if (
    upper === 'DRAFT' ||
    upper === 'NEEDS_REVIEW' ||
    upper === 'RESEARCH_DONE' ||
    upper === 'DRAFT_READY' ||
    upper === 'PUBLISHED' ||
    upper === 'SCHEDULED' ||
    upper === 'REJECTED' ||
    upper === 'ERROR'
  ) {
    return upper;
  }
  return null;
}

function normalizeSourceType(value: unknown): 'RSS_FEED' | 'AI_AGENT' | 'MANUAL_ENTRY' | null {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  if (upper === 'RSS_FEED' || upper === 'AI_AGENT' || upper === 'MANUAL_ENTRY') return upper;
  if (value === 'RSS Feed') return 'RSS_FEED';
  if (value === 'AI Agent') return 'AI_AGENT';
  if (value === 'Manual Entry') return 'MANUAL_ENTRY';
  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const item = await prisma.newsItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
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
          error:
            'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/items/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const title = normalizeString(body.title).trim();
    const summary = normalizeString(body.summary);
    const contentHtml = normalizeString(body.contentHtml);
    const category = normalizeString(body.category);

    const seoTitle = normalizeString(body.seoTitle).trim();
    const seoDescription = normalizeString(body.seoDescription).trim();
    const ogImageUrl = normalizeString(body.ogImageUrl).trim();

    const tags = body.tags === undefined ? undefined : normalizeStringArray(body.tags);

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = title;
    if (body.summary !== undefined) data.summary = summary;
    if (body.contentHtml !== undefined) data.contentHtml = contentHtml;
    if (body.category !== undefined) data.category = category;
    if (body.aiModel !== undefined) data.aiModel = normalizeString(body.aiModel);
    if (body.relevanceScore !== undefined) {
      const score = normalizeInt(body.relevanceScore);
      if (score === null) {
        return NextResponse.json({ error: 'relevanceScore must be a number' }, { status: 400 });
      }
      data.relevanceScore = score;
    }
    if (body.sourceType !== undefined) {
      const sourceType = normalizeSourceType(body.sourceType);
      if (!sourceType) {
        return NextResponse.json({ error: 'sourceType must be RSS_FEED, AI_AGENT, or MANUAL_ENTRY' }, { status: 400 });
      }
      data.sourceType = sourceType;
    }
    if (body.status !== undefined) {
      const status = normalizeNewsItemStatus(body.status);
      if (!status) {
        return NextResponse.json({ error: 'status is invalid' }, { status: 400 });
      }
      data.status = status;

      // If we're moving out of REJECTED, also clear rejection fields.
      // This is needed for the "Rejected" queue workflows (restore/regenerate).
      if (status !== 'REJECTED') {
        data.rejectedAt = null;
        data.rejectionReason = null;
      }
    }
    if (body.seoTitle !== undefined) data.seoTitle = seoTitle || null;
    if (body.seoDescription !== undefined) data.seoDescription = seoDescription || null;
    if (body.ogImageUrl !== undefined) data.ogImageUrl = ogImageUrl || null;
    if (tags !== undefined) data.tags = tags;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data,
    });

    await writeNewsAuditLog({
      action: 'news_item_updated',
      actorId: auth.userId,
      itemId: id,
      metadata: { fields: Object.keys(data) },
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

    console.error('❌ [PUT /api/admin/news-engine/items/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update news item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;

    const deleted = await prisma.newsItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_deleted',
      actorId: auth.userId,
      itemId: id,
      metadata: { deletedAt: deleted.deletedAt?.toISOString() },
    });

    return NextResponse.json({ ok: true });
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

    console.error('❌ [DELETE /api/admin/news-engine/items/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete news item' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { publishDueScheduledNewsItems, slugify, writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.floor(value);
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

function parseNullableDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function parseLimit(value: string | null): number {
  if (!value) return 50;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(n, 200);
}

function normalizeStatus(value: unknown):
  | 'DRAFT'
  | 'NEEDS_REVIEW'
  | 'RESEARCH_DONE'
  | 'DRAFT_READY'
  | 'ERROR'
  | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (
    upper === 'DRAFT' ||
    upper === 'NEEDS_REVIEW' ||
    upper === 'RESEARCH_DONE' ||
    upper === 'DRAFT_READY' ||
    upper === 'ERROR'
  ) {
    return upper;
  }
  return null;
}

async function findAvailableSlug(base: string, excludeItemId?: string): Promise<string | null> {
  const normalizedBase = base.trim();
  if (!normalizedBase) return null;

  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? normalizedBase : `${normalizedBase}-${i + 1}`;
    const existing = await prisma.newsItem.findFirst({
      where: {
        slug: candidate,
        ...(excludeItemId ? { id: { not: excludeItemId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    try {
      await publishDueScheduledNewsItems();
    } catch (error) {
      console.warn('⚠️ [GET /api/admin/news-engine/items] publishDueScheduledNewsItems failed:', error);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const cursor = searchParams.get('cursor');

    const status = normalizeStatus(searchParams.get('status'));
    const category = normalizeString(searchParams.get('category')).trim();
    const q = normalizeString(searchParams.get('q')).trim();

    const dateFrom = parseNullableDate(searchParams.get('from'));
    const dateTo = parseNullableDate(searchParams.get('to'));

    const includeDeleted = searchParams.get('includeDeleted') === '1';

    const items = await prisma.newsItem.findMany({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
              },
            }
          : {}),
      },
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
        title: true,
        summary: true,
        contentHtml: true,
        slug: true,
        status: true,
        category: true,
        relevanceScore: true,
        aiModel: true,
        tags: true,
        sourceType: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        scheduledFor: true,
        rejectedAt: true,
        rejectionReason: true,
        deletedAt: true,
        seoTitle: true,
        seoDescription: true,
        ogImageUrl: true,
      },
    });

    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

    return NextResponse.json({ items: pageItems, nextCursor });
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

    console.error('❌ [GET /api/admin/news-engine/items] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    const body = await request.json();

    const title = normalizeString(body.title).trim();
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const explicitSlug = normalizeString(body.slug).trim();
    const slugBase = slugify(explicitSlug || title);
    const slug = slugBase ? await findAvailableSlug(slugBase) : null;

    const relevanceScore = normalizeInt(body.relevanceScore);
    const sourceType = normalizeSourceType(body.sourceType);

    const created = await prisma.newsItem.create({
      data: {
        title,
        summary: normalizeString(body.summary),
        contentHtml: normalizeString(body.contentHtml),
        category: normalizeString(body.category),
        tags: normalizeStringArray(body.tags),
        aiModel: normalizeString(body.aiModel),
        ...(relevanceScore !== null ? { relevanceScore } : {}),
        ...(sourceType ? { sourceType } : {}),
        seoTitle: normalizeString(body.seoTitle).trim() || null,
        seoDescription: normalizeString(body.seoDescription).trim() || null,
        ogImageUrl: normalizeString(body.ogImageUrl).trim() || null,
        slug,
        status: normalizeStatus(body.status) ?? 'DRAFT',
        createdById: auth.userId,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        contentHtml: true,
        slug: true,
        status: true,
        category: true,
        relevanceScore: true,
        aiModel: true,
        tags: true,
        sourceType: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        scheduledFor: true,
        rejectedAt: true,
        rejectionReason: true,
        deletedAt: true,
        seoTitle: true,
        seoDescription: true,
        ogImageUrl: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_created',
      actorId: auth.userId,
      itemId: created.id,
      metadata: { title: created.title },
    });

    return NextResponse.json({ item: created }, { status: 201 });
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

      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/items] Error:', error);
    return NextResponse.json({ error: 'Failed to create news item' }, { status: 500 });
  }
}

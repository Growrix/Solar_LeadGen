import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import {
  isValidConfirmText,
  NEWS_ENGINE_CONFIRM_TEXT,
  slugify,
  writeNewsAuditLog,
} from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const confirmText = normalizeString(body.confirmText);
    if (!isValidConfirmText(confirmText, NEWS_ENGINE_CONFIRM_TEXT.publishNow)) {
      return NextResponse.json(
        { error: `confirmText must be ${NEWS_ENGINE_CONFIRM_TEXT.publishNow}` },
        { status: 400 }
      );
    }

    const existing = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        deletedAt: true,
        status: true,
        ogImageUrl: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
      },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.ogImageApprovalRequired && !existing.ogImageApprovedAt) {
      const hasUrl = typeof existing.ogImageUrl === 'string' && existing.ogImageUrl.trim();
      return NextResponse.json(
        {
          error: hasUrl
            ? 'OG image approval is required before publish. Approve the OG image in Review.'
            : 'OG image approval is required before publish. Set an OG image and approve it in Review.',
        },
        { status: 409 }
      );
    }

    const base = existing.slug?.trim() || slugify(existing.title);
    const slug = await findAvailableSlug(base, existing.id);
    if (!slug) {
      return NextResponse.json({ error: 'Unable to generate slug' }, { status: 400 });
    }

    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        scheduledFor: null,
        rejectedAt: null,
        rejectionReason: null,
        slug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    const isRepublish = existing.status === 'PUBLISHED';

    await writeNewsAuditLog({
      action: isRepublish ? 'news_item_republished' : 'news_item_published_now',
      actorId: auth.userId,
      itemId: id,
      metadata: { slug: updated.slug, republished: isRepublish },
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

      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/publish-now] Error:', error);
    return NextResponse.json({ error: 'Failed to publish news item' }, { status: 500 });
  }
}

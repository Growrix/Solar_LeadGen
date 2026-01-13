import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function toIso(dt: Date): string {
  return dt.toISOString();
}

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const dueSoonWindowHours = 24;
    const dueSoonEnd = new Date(now.getTime() + dueSoonWindowHours * 60 * 60 * 1000);

    const [
      rssNewEntries,
      researchWeb,
      researchSocial,
      researchJournal,
      researchTrend,
      draftsNeedingReview,
      scheduledDueSoon,
      errors,
    ] = await Promise.all([
      prisma.newsSourceEntry.count({ where: { status: 'NEW' } }),
      prisma.newsResearchEntry.count({ where: { status: 'NEW', kind: 'WEB' } }),
      prisma.newsResearchEntry.count({ where: { status: 'NEW', kind: 'SOCIAL' } }),
      prisma.newsResearchEntry.count({ where: { status: 'NEW', kind: 'JOURNAL' } }),
      prisma.newsResearchEntry.count({ where: { status: 'NEW', kind: 'TREND' } }),
      prisma.newsItem.count({ where: { deletedAt: null, status: 'NEEDS_REVIEW' } }),
      prisma.newsItem.count({
        where: {
          deletedAt: null,
          status: 'SCHEDULED',
          scheduledFor: {
            gte: now,
            lte: dueSoonEnd,
          },
        },
      }),
      prisma.newsItem.count({ where: { deletedAt: null, status: 'ERROR' } }),
    ]);

    return NextResponse.json({
      rssNewEntries,
      researchNewEntries: {
        WEB: researchWeb,
        SOCIAL: researchSocial,
        JOURNAL: researchJournal,
        TREND: researchTrend,
      },
      draftsNeedingReview,
      scheduledDueSoon,
      errors,
      computedAt: toIso(now),
      dueSoonWindowHours,
    });
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

    console.error('❌ [GET /api/admin/news-engine/ops/queue-snapshot] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch queue snapshot' }, { status: 500 });
  }
}

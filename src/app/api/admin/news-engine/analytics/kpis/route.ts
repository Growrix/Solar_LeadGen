import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { getSettings } from '@/lib/services/settings-service';
import { getNewsEnginePipelineStatus } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

const KEY_AUTO_DRAFT = 'news.automation.auto_draft';
const KEY_AUTO_SCHEDULE = 'news.automation.auto_schedule';
const KEY_AUTO_PUBLISH = 'news.automation.auto_publish';

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

// GET /api/admin/news-engine/analytics/kpis
export async function GET() {
  try {
    await requireAdmin();

    const asOf = new Date();
    const cutoff = new Date(asOf.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalStoriesLast30, avgRelevanceAgg, reviewQueueCount, pipelineStatus, settings] = await Promise.all([
      prisma.newsItem.count({
        where: {
          deletedAt: null,
          createdAt: { gte: cutoff },
        },
      }),
      prisma.newsItem.aggregate({
        where: {
          deletedAt: null,
          createdAt: { gte: cutoff },
        },
        _avg: { relevanceScore: true },
      }),
      prisma.newsItem.count({
        where: {
          deletedAt: null,
          status: { in: ['DRAFT', 'NEEDS_REVIEW', 'DRAFT_READY'] },
        },
      }),
      getNewsEnginePipelineStatus(),
      getSettings([KEY_AUTO_DRAFT, KEY_AUTO_SCHEDULE, KEY_AUTO_PUBLISH]),
    ]);

    const avgRelevanceLast30Raw = avgRelevanceAgg._avg.relevanceScore;
    const avgRelevanceLast30 =
      typeof avgRelevanceLast30Raw === 'number' && Number.isFinite(avgRelevanceLast30Raw)
        ? Math.round(avgRelevanceLast30Raw)
        : null;

    return NextResponse.json({
      asOf: asOf.toISOString(),
      kpis: {
        totalStoriesLast30,
        avgRelevanceLast30,
        reviewQueueCount,
        pipelineStatus,
        automations: {
          autoDraft: parseBool(settings[KEY_AUTO_DRAFT], true),
          autoSchedule: parseBool(settings[KEY_AUTO_SCHEDULE], false),
          autoPublish: parseBool(settings[KEY_AUTO_PUBLISH], false),
        },
      },
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
          error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/analytics/kpis] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard KPIs' }, { status: 500 });
  }
}

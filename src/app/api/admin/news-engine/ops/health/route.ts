import { NextResponse } from 'next/server';
import { Prisma, type NewsJobType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type JobHealth = {
  type: string;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureError: string | null;
};

function toIso(dt: Date | null | undefined): string | null {
  return dt ? dt.toISOString() : null;
}

async function getJobHealth(type: NewsJobType): Promise<JobHealth> {
  const [lastSuccess, lastFailure] = await Promise.all([
    prisma.newsJobLog.findFirst({
      where: { type, status: 'SUCCESS' },
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      select: { startedAt: true },
    }),
    prisma.newsJobLog.findFirst({
      where: { type, status: 'FAILURE' },
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      select: { startedAt: true, error: true },
    }),
  ]);

  return {
    type,
    lastSuccessAt: toIso(lastSuccess?.startedAt ?? null),
    lastFailureAt: toIso(lastFailure?.startedAt ?? null),
    lastFailureError: typeof lastFailure?.error === 'string' && lastFailure.error.trim() ? lastFailure.error : null,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const computedAt = new Date();

    const [autoRun, rssSync, researchSync, autoSchedule, autoPublish, aiDraft, dedupeCleanup] = await Promise.all([
      getJobHealth('AUTO_RUN'),
      getJobHealth('RSS_SYNC'),
      getJobHealth('RESEARCH_SYNC'),
      getJobHealth('AUTO_SCHEDULE'),
      getJobHealth('AUTO_PUBLISH'),
      getJobHealth('AI_DRAFT'),
      getJobHealth('DEDUP_CLEANUP'),
    ]);

    return NextResponse.json({
      computedAt: computedAt.toISOString(),
      jobs: {
        AUTO_RUN: autoRun,
        RSS_SYNC: rssSync,
        RESEARCH_SYNC: researchSync,
        AI_DRAFT: aiDraft,
        AUTO_SCHEDULE: autoSchedule,
        AUTO_PUBLISH: autoPublish,
        DEDUP_CLEANUP: dedupeCleanup,
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
          error:
            'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/ops/health] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch News Engine health' }, { status: 500 });
  }
}

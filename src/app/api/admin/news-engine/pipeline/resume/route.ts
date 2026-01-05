import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/authorization';
import { setNewsEnginePipelineStatus, writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

// POST /api/admin/news-engine/pipeline/resume
export async function POST(_request: NextRequest) {
  try {
    const auth = await requireAdmin();

    await setNewsEnginePipelineStatus('NOMINAL', auth.userId);
    await writeNewsAuditLog({
      action: 'news_pipeline_resumed',
      actorId: auth.userId,
    });

    return NextResponse.json({ pipelineStatus: 'NOMINAL' });
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
          error: 'Database schema missing required tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/pipeline/resume] Error:', error);
    return NextResponse.json({ error: 'Failed to resume pipeline' }, { status: 500 });
  }
}

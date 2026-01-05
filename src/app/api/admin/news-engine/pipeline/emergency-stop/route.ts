import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/authorization';
import { isValidConfirmText, NEWS_ENGINE_CONFIRM_TEXT, setNewsEnginePipelineStatus, writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

// POST /api/admin/news-engine/pipeline/emergency-stop
// Body: { confirmText: "LOCKDOWN" }
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    const body = await request.json().catch(() => ({}));
    if (!isValidConfirmText(body.confirmText, NEWS_ENGINE_CONFIRM_TEXT.emergencyStop)) {
      return NextResponse.json(
        { error: `confirmText must be "${NEWS_ENGINE_CONFIRM_TEXT.emergencyStop}"` },
        { status: 400 }
      );
    }

    await setNewsEnginePipelineStatus('EMERGENCY_STOP', auth.userId);
    await writeNewsAuditLog({
      action: 'news_pipeline_emergency_stop',
      actorId: auth.userId,
    });

    return NextResponse.json({ pipelineStatus: 'EMERGENCY_STOP' });
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

    console.error('❌ [POST /api/admin/news-engine/pipeline/emergency-stop] Error:', error);
    return NextResponse.json({ error: 'Failed to emergency stop pipeline' }, { status: 500 });
  }
}

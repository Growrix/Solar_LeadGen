import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { getNewsEnginePipelineStatus } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

// GET /api/admin/news-engine/pipeline/status
export async function GET() {
  try {
    await requireAdmin();

    const pipelineStatus = await getNewsEnginePipelineStatus();
    return NextResponse.json({ pipelineStatus });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/pipeline/status] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { listAdminOpenAiModels } from '@/lib/news-engine/openai-admin-models';
import { listAdminGeminiModels } from '@/lib/news-engine/gemini-admin-models';
import { listAdminOpenAiCompatModels } from '@/lib/news-engine/openai-compat-admin-models';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/news-engine/ai/models?provider=openai|gemini
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const provider = request.nextUrl.searchParams.get('provider')?.trim().toLowerCase() || 'openai';

    const refresh = request.nextUrl.searchParams.get('refresh')?.trim() === '1';

    if (provider === 'openai') {
      const result = await listAdminOpenAiModels({ refresh });
      return NextResponse.json(
        result.ok
          ? result
          : {
              ...result,
              ok: false,
              provider: 'openai',
              error: result.error || 'OpenAI model listing failed',
              models: [],
            }
      );
    }

    if (provider === 'gemini') {
      const result = await listAdminGeminiModels({ refresh });
      return NextResponse.json(
        result.ok
          ? result
          : {
              ...result,
              ok: false,
              provider: 'gemini',
              error: result.error || 'Gemini model listing failed',
              models: [],
            }
      );
    }

    const result = await listAdminOpenAiCompatModels({ provider, refresh });
    return NextResponse.json(result.ok ? result : { ...result, ok: false, error: result.error || 'Model listing failed', models: [] });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Failed to list models';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { ensureDefaultModelProfiles } from '@/lib/news-engine/ai-router';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { assertAdminOpenAiModelIdIsValid } from '@/lib/news-engine/openai-admin-models';
import { assertAdminGeminiModelIdIsValid } from '@/lib/news-engine/gemini-admin-models';
import { normalizeNewsProviderId } from '@/lib/news-engine/provider-id';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

// GET /api/admin/news-engine/model-profiles
export async function GET() {
  try {
    await requireAdmin();

    await ensureDefaultModelProfiles(prisma);

    const profiles = await prisma.newsModelProfile.findMany({
      orderBy: [{ enabled: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        displayName: true,
        provider: true,
        modelId: true,
        useCaseTags: true,
        costTier: true,
        jsonModeRequired: true,
        maxTokens: true,
        enabled: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/model-profiles] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch model profiles' }, { status: 500 });
  }
}

// POST /api/admin/news-engine/model-profiles
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as any;

    const displayName = normalizeString(body?.displayName);
    const provider = normalizeNewsProviderId(normalizeString(body?.provider));
    const modelId = normalizeString(body?.modelId);

    if (!displayName) return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    if (!provider) return NextResponse.json({ error: 'provider is required' }, { status: 400 });
    if (!modelId) return NextResponse.json({ error: 'modelId is required' }, { status: 400 });

    const normalizedProvider = provider;
    if (normalizedProvider === 'openai') {
      try {
        await assertAdminOpenAiModelIdIsValid(modelId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Invalid OpenAI modelId';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    if (normalizedProvider === 'gemini') {
      try {
        await assertAdminGeminiModelIdIsValid(modelId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Invalid Gemini modelId';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    const useCaseTags = normalizeStringArray(body?.useCaseTags);
    const costTier = normalizeString(body?.costTier);
    const jsonModeRequired = typeof body?.jsonModeRequired === 'boolean' ? body.jsonModeRequired : false;
    const maxTokens = typeof body?.maxTokens === 'number' && Number.isFinite(body.maxTokens) ? Math.floor(body.maxTokens) : null;
    const enabled = typeof body?.enabled === 'boolean' ? body.enabled : true;

    const created = await prisma.newsModelProfile.create({
      data: {
        displayName,
        provider: normalizedProvider,
        modelId,
        useCaseTags,
        costTier,
        jsonModeRequired,
        maxTokens,
        enabled,
      },
      select: {
        id: true,
        displayName: true,
        provider: true,
        modelId: true,
        useCaseTags: true,
        costTier: true,
        jsonModeRequired: true,
        maxTokens: true,
        enabled: true,
        createdAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_model_profile_created',
      actorId: auth.userId,
      metadata: { id: created.id, displayName: created.displayName, provider: created.provider, modelId: created.modelId },
    });

    return NextResponse.json({ profile: created });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ error: 'Database schema missing required tables. Apply migrations and retry.' }, { status: 500 });
    }

    console.error('❌ [POST /api/admin/news-engine/model-profiles] Error:', error);
    return NextResponse.json({ error: 'Failed to create model profile' }, { status: 500 });
  }
}

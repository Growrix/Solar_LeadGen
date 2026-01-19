import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { assertAdminOpenAiModelIdIsValid } from '@/lib/news-engine/openai-admin-models';
import { assertAdminGeminiModelIdIsValid } from '@/lib/news-engine/gemini-admin-models';

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

// PUT /api/admin/news-engine/model-profiles/[id]
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const body = (await request.json().catch(() => null)) as any;

    const data: Record<string, unknown> = {};

    if (typeof body?.displayName === 'string') data.displayName = normalizeString(body.displayName);
    if (typeof body?.provider === 'string') data.provider = normalizeString(body.provider).toLowerCase();
    if (typeof body?.modelId === 'string') data.modelId = normalizeString(body.modelId);
    if (body?.useCaseTags !== undefined) data.useCaseTags = normalizeStringArray(body.useCaseTags);
    if (typeof body?.costTier === 'string') data.costTier = normalizeString(body.costTier);
    if (typeof body?.jsonModeRequired === 'boolean') data.jsonModeRequired = body.jsonModeRequired;
    if (typeof body?.maxTokens === 'number' && Number.isFinite(body.maxTokens)) data.maxTokens = Math.floor(body.maxTokens);
    if (body?.maxTokens === null) data.maxTokens = null;
    if (typeof body?.enabled === 'boolean') data.enabled = body.enabled;

    // If provider/modelId is touched, validate the effective OpenAI modelId.
    const providerTouched = typeof body?.provider === 'string';
    const modelTouched = typeof body?.modelId === 'string';

    if (providerTouched || modelTouched) {
      const current = await prisma.newsModelProfile.findUnique({
        where: { id },
        select: { provider: true, modelId: true },
      });

      const effectiveProvider = (providerTouched ? String(data.provider ?? '') : current?.provider ?? '').trim().toLowerCase();
      const effectiveModelId = (modelTouched ? String(data.modelId ?? '') : current?.modelId ?? '').trim();

      if (effectiveProvider === 'openai') {
        try {
          await assertAdminOpenAiModelIdIsValid(effectiveModelId);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Invalid OpenAI modelId';
          return NextResponse.json({ error: msg }, { status: 400 });
        }
      }

      if (effectiveProvider === 'gemini') {
        try {
          await assertAdminGeminiModelIdIsValid(effectiveModelId);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Invalid Gemini modelId';
          return NextResponse.json({ error: msg }, { status: 400 });
        }
      }
    }

    const updated = await prisma.newsModelProfile.update({
      where: { id },
      data,
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
      action: 'news_model_profile_updated',
      actorId: auth.userId,
      metadata: { id: updated.id },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Model profile not found' }, { status: 404 });
    }

    console.error('❌ [PUT /api/admin/news-engine/model-profiles/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update model profile' }, { status: 500 });
  }
}

// DELETE /api/admin/news-engine/model-profiles/[id] (hard delete)
export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // Clear any router defaults referencing this profile (FK is Restrict).
      await tx.newsModelRouterDefault.deleteMany({ where: { modelProfileId: id } });
      await tx.newsModelProfile.delete({ where: { id } });
    });

    await writeNewsAuditLog({
      action: 'news_model_profile_deleted',
      actorId: auth.userId,
      metadata: { id },
    });

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Model profile not found' }, { status: 404 });
    }

    console.error('❌ [DELETE /api/admin/news-engine/model-profiles/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete model profile' }, { status: 500 });
  }
}

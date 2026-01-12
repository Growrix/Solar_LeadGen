import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { resolveNewsAiCallConfig, reportNewsAiKeyError, reportNewsAiKeySuccess } from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractOpenAiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const anyData = data as any;
  const message = anyData?.error?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  const topMessage = anyData?.message;
  if (typeof topMessage === 'string' && topMessage.trim()) return topMessage.trim();
  return null;
}

async function generateOpenAiImageUrl(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    }),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(extractOpenAiErrorMessage(data) || 'OpenAI image generation failed');
  }

  const anyData = data as any;
  const url = anyData?.data?.[0]?.url;
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('OpenAI image generation returned no URL');
  }

  return url.trim();
}

// POST /api/admin/news-engine/items/[id]/og-image/generate
// Body: { promptOverride?: string }
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;

  try {
    const auth = await requireAdmin();
    const { id } = await context.params;
    const itemId = normalizeString(id);
    if (!itemId) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const item = await prisma.newsItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        deletedAt: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        ogImageUrl: true,
        ogImageApprovalRequired: true,
      },
    });

    if (!item || item.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = (await request.json().catch(() => null)) as any;
    const promptOverride = normalizeString(body?.promptOverride);

    const prompt =
      promptOverride ||
      [
        'Create a clean, modern, high-quality OG image for a solar industry news article.',
        'Style: professional editorial, no text, no logos, no watermarks.',
        'Use strong lighting and a modern renewable-energy aesthetic.',
        '',
        `Title: ${item.title}`,
        item.category ? `Category: ${item.category}` : null,
        item.summary ? `Summary: ${item.summary}` : null,
        Array.isArray(item.tags) && item.tags.length ? `Tags: ${item.tags.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n');

    const aiConfig = await resolveNewsAiCallConfig(prisma, {
      taskType: 'image_generate',
      pool: 'IMAGES',
      fallbackProvider: 'openai',
      fallbackModel: process.env.NEWS_ENGINE_IMAGE_MODEL || 'dall-e-3',
    });

    resolvedApiKeyId = aiConfig.apiKeyId;

    if (aiConfig.provider !== 'openai') {
      return NextResponse.json({ error: `Image generation provider not supported: ${aiConfig.provider}` }, { status: 400 });
    }

    if (!aiConfig.apiKeyOverride) {
      return NextResponse.json(
        {
          error:
            'Key Vault not configured for IMAGES pool. Add an enabled News Engine API key with pool=IMAGES and set NEWS_ENGINE_KEY_VAULT_MASTER_KEY.',
        },
        { status: 400 }
      );
    }

    const aiLog = await prisma.newsAiRequestLog.create({
      data: {
        actorId: auth.userId,
        action: 'og_image_generate',
        itemId: item.id,
        provider: aiConfig.provider,
        model: aiConfig.model,
        taskType: 'image_generate',
        modelProfileId: aiConfig.modelProfileId,
        apiKeyId: aiConfig.apiKeyId,
        input: { prompt, startedAt: startedAt.toISOString() },
        success: false,
      },
      select: { id: true },
    });

    aiLogId = aiLog.id;

    const aiStartMs = Date.now();
    const ogImageUrl = await generateOpenAiImageUrl({
      apiKey: aiConfig.apiKeyOverride,
      model: aiConfig.model,
      prompt,
    });
    const durationMs = Math.max(0, Date.now() - aiStartMs);

    const updated = await prisma.newsItem.update({
      where: { id: item.id },
      data: {
        ogImageUrl,
        // New image => requires re-approval.
        ogImageApprovedAt: null,
        ogImageApprovedById: null,
      },
      select: {
        id: true,
        ogImageUrl: true,
        ogImageApprovalRequired: true,
        ogImageApprovedAt: true,
        ogImageApprovedById: true,
        updatedAt: true,
      },
    });

    await prisma.newsAiRequestLog.update({
      where: { id: aiLogId },
      data: {
        durationMs,
        output: { ogImageUrl },
        success: true,
      },
      select: { id: true },
    });

    await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

    await writeNewsAuditLog({
      action: 'news_item_og_image_generated',
      actorId: auth.userId,
      itemId: updated.id,
      metadata: {
        provider: aiConfig.provider,
        model: aiConfig.model,
        modelProfileId: aiConfig.modelProfileId,
        apiKeyId: aiConfig.apiKeyId,
        apiKeyLabel: aiConfig.apiKeyLabel,
        aiLogId,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: updated.id,
      ogImageUrl: updated.ogImageUrl,
      ogImageApprovedAt: updated.ogImageApprovedAt ? updated.ogImageApprovedAt.toISOString() : null,
      ogImageApprovedById: updated.ogImageApprovedById,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate OG image';

    await reportNewsAiKeyError(prisma, resolvedApiKeyId, message);

    if (aiLogId) {
      await prisma.newsAiRequestLog
        .update({
          where: { id: aiLogId },
          data: {
            success: false,
            error: message,
            output: { error: message },
          },
          select: { id: true },
        })
        .catch(() => null);
    }

    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.' },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/og-image/generate] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { resolveNewsAiCallConfig, reportNewsAiKeyError, reportNewsAiKeySuccess } from '@/lib/news-engine/ai-runtime';
import { ingestOgImageToS3 } from '@/lib/news-engine/og-image';
import { uploadFile, getPublicUrlForKey } from '@/lib/s3';
import { searchUnsplashLandscapeImage } from '@/lib/news-engine/unsplash';

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

function isAllowedOpenAiImageModel(model: string): boolean {
  const normalized = model.trim().toLowerCase();
  return normalized === 'dall-e-3' || normalized === 'dall-e-2' || normalized === 'gpt-image-1';
}

function buildFreeImageQuery(input: { title?: string | null; category?: string | null; tags?: string[] | null }): string {
  const tokens = [
    'solar',
    'renewable',
    (input.category || '').trim(),
    (input.title || '').trim(),
    ...(Array.isArray(input.tags) ? input.tags : []),
  ]
    .flatMap((t) => String(t || '').split(/\s+/))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .slice(0, 10);

  return Array.from(new Set(tokens)).join(' ');
}

async function findFreeSourceImageUrl(input: { title?: string | null; category?: string | null; tags?: string[] | null }): Promise<string> {
  const query = buildFreeImageQuery(input);
  const result = await searchUnsplashLandscapeImage({ query });
  return result.imageUrl;
}

function shouldFallbackFromOpenAiImageError(err: unknown): boolean {
  const status = typeof (err as any)?.status === 'number' ? Number((err as any).status) : null;
  const message = err instanceof Error ? err.message : '';
  const lower = message.toLowerCase();

  // Do NOT fallback on missing/invalid key errors.
  if (status === 401 || lower.includes('invalid api key')) return false;
  if (lower.includes('missing openai api key')) return false;

  // Common model access failure patterns.
  if (status === 403 || status === 404) return true;
  if (lower.includes('does not exist') && lower.includes('model')) return true;
  if (lower.includes('do not have access') && lower.includes('model')) return true;
  if (lower.includes('not authorized') && lower.includes('model')) return true;

  return false;
}

async function generateOpenAiImageUrl(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ url?: string; b64Json?: string }> {
  const baseBody = {
    model: input.model,
    prompt: input.prompt,
    n: 1,
    size: '1024x1024',
  };

  async function post(body: any): Promise<{ response: Response; data: unknown }> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as unknown;
    return { response, data };
  }

  // Prefer base64 output to avoid fetching OpenAI-hosted URLs (which can be transiently 503/blocked).
  // Some backends reject `response_format`; if so, retry without it.
  let attempt = await post({ ...baseBody, response_format: 'b64_json' });

  if (!attempt.response.ok) {
    const message = extractOpenAiErrorMessage(attempt.data) || 'OpenAI image generation failed';
    const lower = message.toLowerCase();
    const isUnknownParam = lower.includes('unknown parameter') && lower.includes('response_format');
    if (attempt.response.status === 400 && isUnknownParam) {
      attempt = await post(baseBody);
    }
  }

  const response = attempt.response;
  const data = attempt.data;

  if (!response.ok) {
    const error = new Error(extractOpenAiErrorMessage(data) || 'OpenAI image generation failed') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const anyData = data as any;

  const url = anyData?.data?.[0]?.url;
  if (typeof url === 'string' && url.trim()) {
    return { url: url.trim() };
  }

  const b64Json = anyData?.data?.[0]?.b64_json;
  if (typeof b64Json === 'string' && b64Json.trim()) {
    return { b64Json: b64Json.trim() };
  }

  throw new Error('OpenAI image generation returned no usable image payload');
}

async function uploadOpenAiBase64ToS3(input: { itemId: string; b64Json: string }): Promise<{ url: string; key: string }> {
  const buffer = Buffer.from(input.b64Json, 'base64');
  const key = `news-engine/og-images/${encodeURIComponent(input.itemId)}/${Date.now()}.png`;
  await uploadFile(buffer, key, 'image/png');
  return { key, url: getPublicUrlForKey(key) };
}

// POST /api/admin/news-engine/items/[id]/og-image/generate
// Body: { promptOverride?: string }
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;
  let notice: string | null = null;

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

    const fallbackEnvKey = (process.env.OPENAI_API_KEY || '').trim();
    const apiKey = (aiConfig.apiKeyOverride || '').trim() || fallbackEnvKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing OpenAI API key. Set OPENAI_API_KEY in .env (or configure News Engine Key Vault keys for the IMAGES pool).',
        },
        { status: 400 }
      );
    }

    const requestedModel = (aiConfig.model || '').trim() || (process.env.NEWS_ENGINE_IMAGE_MODEL || 'dall-e-3');
    const defaultModel = (process.env.NEWS_ENGINE_IMAGE_MODEL || 'dall-e-3').trim() || 'dall-e-3';

    const initialModel = isAllowedOpenAiImageModel(requestedModel) ? requestedModel : defaultModel;
    if (!isAllowedOpenAiImageModel(requestedModel)) {
      notice = `Requested image model "${requestedModel}" is not allowed. Using "${initialModel}".`;
    }

    const modelCandidates = Array.from(
      new Set(
        [
          initialModel,
          // Try other allowed models as fallbacks.
          'gpt-image-1',
          'dall-e-3',
          'dall-e-2',
        ].filter((m) => isAllowedOpenAiImageModel(m))
      )
    );

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

    let usedProvider: 'openai' | 'free_source' = 'openai';
    let usedModel: string | null = null;
    let sourceUrl: string | null = null;
    let ogImageUrl: string | null = null;
    let ingestedContentType: string | null = null;

    try {
      let lastError: unknown = null;

      for (const candidate of modelCandidates) {
        try {
          const generated = await generateOpenAiImageUrl({
            apiKey,
            model: candidate,
            prompt,
          });

          let ingested: { url: string; contentType: string; sourceUrl: string };

          if (generated.b64Json) {
            const uploaded = await uploadOpenAiBase64ToS3({ itemId: item.id, b64Json: generated.b64Json });
            ingested = {
              url: uploaded.url,
              contentType: 'image/png',
              sourceUrl: uploaded.url,
            };
          } else if (generated.url) {
            ingested = await ingestOgImageToS3({
              itemId: item.id,
              imageUrl: generated.url,
            });
          } else {
            throw new Error('OpenAI image generation returned no image');
          }

          usedProvider = 'openai';
          usedModel = candidate;
          ogImageUrl = ingested.url;
          sourceUrl = ingested.sourceUrl;
          ingestedContentType = ingested.contentType;

          if (candidate !== initialModel) {
            notice = `OpenAI image model "${initialModel}" was not available; used fallback model "${candidate}".`;
          }

          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          if (!shouldFallbackFromOpenAiImageError(err)) {
            throw err;
          }
        }
      }

      if (!usedModel) {
        // All allowed OpenAI image models failed with model/access errors -> fallback to free-source image.
        const freeUrl = await findFreeSourceImageUrl({ title: item.title, category: item.category, tags: item.tags });
        const ingested = await ingestOgImageToS3({ itemId: item.id, imageUrl: freeUrl });
        usedProvider = 'free_source';
        usedModel = null;
        ogImageUrl = ingested.url;
        sourceUrl = ingested.sourceUrl;
        ingestedContentType = ingested.contentType;
        notice =
          'OpenAI image model access failed; used a free-source image fallback. Configure a supported OpenAI image model to enable AI generation.';
        void lastError;
      }
    } finally {
      // Ensure duration includes retries/fallbacks.
    }

    if (!ogImageUrl) {
      throw new Error('OpenAI image generation returned no usable image');
    }

    const finalOgImageUrl = ogImageUrl;

    const durationMs = Math.max(0, Date.now() - aiStartMs);

    const updated = await prisma.newsItem.update({
      where: { id: item.id },
      data: {
        ogImageUrl: finalOgImageUrl,
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
        output: {
          ogImageUrl: finalOgImageUrl,
          sourceUrl,
          contentType: ingestedContentType,
          providerUsed: usedProvider,
          modelUsed: usedModel,
          notice,
        },
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
        model: usedModel || initialModel,
        providerUsed: usedProvider,
        modelUsed: usedModel,
        modelProfileId: aiConfig.modelProfileId,
        apiKeyId: aiConfig.apiKeyId,
        apiKeyLabel: aiConfig.apiKeyLabel,
        aiLogId,
        ogImageUrl: finalOgImageUrl,
        sourceUrl,
        notice,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: updated.id,
      ogImageUrl: updated.ogImageUrl,
      ogImageApprovedAt: updated.ogImageApprovedAt ? updated.ogImageApprovedAt.toISOString() : null,
      ogImageApprovedById: updated.ogImageApprovedById,
      notice,
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

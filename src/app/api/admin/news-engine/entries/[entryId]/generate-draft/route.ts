import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { callOpenAiJson } from '@/lib/openai';
import {
  resolveNewsAiCallConfig,
  reportNewsAiKeyError,
  reportNewsAiKeySuccess,
  type ResolvedNewsAiCallConfig,
} from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';

type GenerateDraftRequest = {
  model?: string;
  note?: string;
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(unfenced);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }

  return null;
}

function pickString(obj: Record<string, unknown> | null, key: string, fallback = ''): string {
  if (!obj) return fallback;
  const raw = obj[key];
  return typeof raw === 'string' ? raw.trim() : fallback;
}

function pickStringArray(obj: Record<string, unknown> | null, key: string): string[] {
  if (!obj) return [];
  const raw = obj[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

const NEWS_ENGINE_SYSTEM_PROMPT =
  'You are an assistant that drafts NEWS ENGINE posts for a solar lead-gen company. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription, ogImageUrl. contentHtml must be valid HTML and should not include unverified claims.';

// POST /api/admin/news-engine/entries/[entryId]/generate-draft
export async function POST(request: NextRequest, context: { params: Promise<{ entryId: string }> }) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;

  try {
    const auth = await requireAdmin();
    const { entryId } = await context.params;

    const body = (await request.json().catch(() => null)) as GenerateDraftRequest | null;
    const note = normalizeString(body?.note).trim();
    const modelOverride = normalizeString(body?.model).trim();

    const entry = await prisma.newsSourceEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        url: true,
        title: true,
        publishedAt: true,
        rawJson: true,
        status: true,
        sourceId: true,
        source: { select: { id: true, name: true } },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (entry.status === 'PROCESSED') {
      return NextResponse.json({ error: 'Entry already processed' }, { status: 409 });
    }

    const snippet =
      entry.rawJson && typeof entry.rawJson === 'object' && 'contentSnippet' in (entry.rawJson as any)
        ? normalizeString((entry.rawJson as any).contentSnippet).trim()
        : '';

    const inputForLog = {
      entryId: entry.id,
      url: entry.url,
      title: entry.title,
      sourceId: entry.sourceId,
      sourceName: entry.source?.name ?? null,
      publishedAt: entry.publishedAt ? entry.publishedAt.toISOString() : null,
      note,
      startedAt: startedAt.toISOString(),
    };

    const baseConfig = await resolveNewsAiCallConfig(prisma, {
      taskType: 'draft_longform',
      pool: 'DRAFTING',
      fallbackProvider: 'openai',
      fallbackModel: modelOverride || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    });

    const aiConfig: ResolvedNewsAiCallConfig = modelOverride
      ? {
          ...baseConfig,
          model: modelOverride,
          modelProfileId: null,
          modelProfileLabel: null,
        }
      : baseConfig;

    resolvedApiKeyId = aiConfig.apiKeyId;

    const aiLog = await prisma.newsAiRequestLog.create({
      data: {
        actorId: auth.userId,
        action: 'generate_draft_from_rss_entry',
        provider: aiConfig.provider,
        model: aiConfig.model,
        taskType: 'draft_longform',
        modelProfileId: aiConfig.modelProfileId,
        apiKeyId: aiConfig.apiKeyId,
        input: inputForLog,
        success: false,
      },
      select: { id: true },
    });

    aiLogId = aiLog.id;

    const prompt = [
      'Draft a News Engine post based on the following RSS entry metadata.',
      '',
      `Source: ${entry.source?.name ?? 'Unknown'}`,
      `URL: ${entry.url}`,
      `Title: ${entry.title}`,
      entry.publishedAt ? `PublishedAt: ${entry.publishedAt.toISOString()}` : null,
      snippet ? `Snippet: ${snippet}` : null,
      note ? `Editor note: ${note}` : null,
      '',
      'Requirements:',
      '- Produce JSON only (no markdown).',
      '- The article must avoid unverifiable claims; if specifics are unknown, keep it high-level.',
      '- contentHtml must be valid HTML (<p>, <h2>, <ul>/<li> as needed).',
      '- Make it relevant to solar leads / homeowners / energy industry where reasonable.',
    ]
      .filter(Boolean)
      .join('\n');

    const aiStartMs = Date.now();
    const { raw, modelUsed } = await callOpenAiJson({
      system: NEWS_ENGINE_SYSTEM_PROMPT,
      prompt,
      modelOverride: aiConfig.model,
      apiKeyOverride: aiConfig.apiKeyOverride ?? undefined,
      temperature: 0.4,
    });
    const durationMs = Math.max(0, Date.now() - aiStartMs);
    const parsed = tryParseJsonObject(raw);

    const draft = {
      title: pickString(parsed, 'title', entry.title) || entry.title,
      summary: pickString(parsed, 'summary', ''),
      contentHtml: pickString(parsed, 'contentHtml', ''),
      category: pickString(parsed, 'category', ''),
      tags: pickStringArray(parsed, 'tags'),
      seoTitle: pickString(parsed, 'seoTitle', '') || null,
      seoDescription: pickString(parsed, 'seoDescription', '') || null,
      ogImageUrl: pickString(parsed, 'ogImageUrl', '') || null,
    };

    const createdItem = await prisma.newsItem.create({
      data: {
        title: draft.title,
        summary: draft.summary,
        contentHtml: draft.contentHtml,
        category: draft.category,
        tags: draft.tags,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        ogImageUrl: draft.ogImageUrl,
        status: 'DRAFT_READY',
        aiModel: modelUsed,
        relevanceScore: 0,
        sourceType: 'RSS_FEED',
        sourceId: entry.sourceId,
        createdById: auth.userId,
      },
      select: { id: true },
    });

    await prisma.newsSourceEntry.update({
      where: { id: entry.id },
      data: {
        status: 'PROCESSED',
        error: null,
        itemId: createdItem.id,
      },
    });

    await prisma.newsAiRequestLog.update({
      where: { id: aiLogId },
      data: {
        model: modelUsed,
        durationMs,
        output: { draft, raw },
        success: true,
        itemId: createdItem.id,
      },
    });

    await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

    await writeNewsAuditLog({
      action: 'news_ai_draft_generated',
      actorId: auth.userId,
      itemId: createdItem.id,
      sourceId: entry.sourceId,
      metadata: { entryId: entry.id, model: modelUsed },
      promptUsed: prompt,
    });

    const fullItem = await prisma.newsItem.findUnique({
      where: { id: createdItem.id },
    });

    return NextResponse.json({ item: fullItem });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate draft';

    await reportNewsAiKeyError(prisma, resolvedApiKeyId, message);

    if (aiLogId) {
      await prisma.newsAiRequestLog
        .update({
          where: { id: aiLogId },
          data: { success: false, error: message },
        })
        .catch(() => null);
    }

    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
          },
          { status: 500 }
        );
      }

      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/entries/[entryId]/generate-draft] Error:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { buildDistinctTitle, isNearDuplicateTitle } from '@/lib/news-engine/title-guard';
import { callOpenAiJson } from '@/lib/openai';
import {
  resolveNewsAiCallConfig,
  reportNewsAiKeyError,
  reportNewsAiKeySuccess,
  type ResolvedNewsAiCallConfig,
} from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';

type ResearchKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';

type GenerateDraftRequest = {
  query?: string;
  kinds?: ResearchKind[];
  limit?: number;
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

function isKind(value: unknown): value is ResearchKind {
  return value === 'WEB' || value === 'SOCIAL' || value === 'JOURNAL' || value === 'TREND';
}

const NEWS_ENGINE_SYSTEM_PROMPT =
  'You are an assistant that drafts NEWS ENGINE posts for a solar lead-gen company. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription, ogImageUrl. contentHtml must be valid HTML (not markdown) and should use headings (h2/h3), paragraphs, lists when relevant, and emphasis tags (<strong>/<em>) to improve readability. Do not include unverified claims.';

// POST /api/admin/news-engine/research/generate-draft
export async function POST(request: NextRequest) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;

  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as GenerateDraftRequest | null;

    const query = normalizeString(body?.query).trim();
    const note = normalizeString(body?.note).trim();
    const modelOverride = normalizeString(body?.model).trim();

    const requestedKinds = Array.isArray(body?.kinds) ? body!.kinds.filter(isKind) : [];
    const kinds: ResearchKind[] = requestedKinds.length ? requestedKinds : ['WEB', 'SOCIAL', 'JOURNAL', 'TREND'];

    const limitRaw = typeof body?.limit === 'number' ? body.limit : Number.parseInt(normalizeString(body?.limit), 10);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(50, Math.floor(limitRaw))) : 12;

    const where: Prisma.NewsResearchEntryWhereInput = {
      status: 'NEW',
      kind: { in: kinds },
      ...(query ? { query } : {}),
    };

    const researchEntries = await prisma.newsResearchEntry.findMany({
      where,
      orderBy: [{ fetchedAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        kind: true,
        query: true,
        url: true,
        title: true,
        publishedAt: true,
      },
    });

    if (!researchEntries.length) {
      return NextResponse.json(
        { error: query ? 'No NEW research entries found for this query' : 'No NEW research entries found' },
        { status: 404 }
      );
    }

    const inputForLog = {
      query: query || null,
      kinds,
      limit,
      entryIds: researchEntries.map((e) => e.id),
      startedAt: startedAt.toISOString(),
      note,
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
        action: 'generate_draft_from_research',
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

    const citations = researchEntries
      .map((e, idx) => {
        const when = e.publishedAt ? ` (${e.publishedAt.toISOString().slice(0, 10)})` : '';
        return `${idx + 1}. [${e.kind}] ${e.title}${when} — ${e.url}`;
      })
      .join('\n');

    const prompt = [
      'Draft a News Engine post using the following research citations.',
      query ? `Topic/Query: ${query}` : null,
      note ? `Editor note: ${note}` : null,
      '',
      'Citations:',
      citations,
      '',
      'Requirements:',
      '- Output JSON only (no markdown).',
      '- The article must avoid unverifiable claims; use cautious language when details are unknown.',
      '- contentHtml must be valid HTML (<p>, <h2>, <ul>/<li> as needed).',
      '- Create a distinct headline; do not copy source titles verbatim.',
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
      title: pickString(parsed, 'title', query ? `News: ${query}` : 'News Draft') || (query ? `News: ${query}` : 'News Draft'),
      summary: pickString(parsed, 'summary', ''),
      contentHtml: pickString(parsed, 'contentHtml', ''),
      category: pickString(parsed, 'category', ''),
      tags: pickStringArray(parsed, 'tags'),
      seoTitle: pickString(parsed, 'seoTitle', '') || null,
      seoDescription: pickString(parsed, 'seoDescription', '') || null,
      ogImageUrl: pickString(parsed, 'ogImageUrl', '') || null,
    };

    let titleCollision = false;
    let matchedSourceTitle: string | null = null;
    for (const sourceTitle of researchEntries.map((e) => e.title).filter(Boolean)) {
      if (draft.title && isNearDuplicateTitle(draft.title, sourceTitle)) {
        titleCollision = true;
        matchedSourceTitle = sourceTitle;
        break;
      }
    }

    if (titleCollision) {
      draft.title = buildDistinctTitle({
        summary: draft.summary,
        category: draft.category,
        fallback: draft.title,
      });
    }

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
        sourceType: 'AI_AGENT',
        createdById: auth.userId,
      },
      select: { id: true },
    });

    await prisma.newsResearchEntry.updateMany({
      where: { id: { in: researchEntries.map((e) => e.id) } },
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
        output: { draft, raw, citations: researchEntries.map((e) => ({ id: e.id, kind: e.kind, url: e.url, title: e.title })) },
        success: true,
        itemId: createdItem.id,
      },
    });

    await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

    await writeNewsAuditLog({
      action: 'news_ai_draft_generated',
      actorId: auth.userId,
      itemId: createdItem.id,
      metadata: {
        query: query || null,
        kinds,
        limit,
        model: modelUsed,
        titleCollision,
        sourceTitle: titleCollision ? matchedSourceTitle : undefined,
      },
      promptUsed: prompt,
    });

    const fullItem = await prisma.newsItem.findUnique({
      where: { id: createdItem.id },
    });

    return NextResponse.json({ item: fullItem, used: { count: researchEntries.length } });
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

    console.error('❌ [POST /api/admin/news-engine/research/generate-draft] Error:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}

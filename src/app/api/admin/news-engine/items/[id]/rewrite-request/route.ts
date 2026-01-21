import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { callNewsAiJson } from '@/lib/news-engine/ai-call';
import { resolveNewsAiCallConfig, reportNewsAiKeyError, reportNewsAiKeySuccess } from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(unfenced);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // ignore
  }
  return null;
}

function pickString(obj: Record<string, unknown>, key: string): string {
  return normalizeString(obj[key]).trim();
}

function pickStringArray(obj: Record<string, unknown>, key: string): string[] {
  const raw = obj[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

const NEWS_ENGINE_REWRITE_SYSTEM_PROMPT =
  'You are an assistant that rewrites NEWS ENGINE articles for a solar lead-gen company. The editor has requested changes. Apply the editor instructions while preserving the core topic. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription. contentHtml must be valid HTML (not markdown) and should use headings (h2/h3), paragraphs, lists when relevant, and emphasis tags (<strong>/<em>) to improve readability.';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;

  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const note = normalizeString(body.note).trim();
    if (!note) {
      return NextResponse.json({ error: 'note is required' }, { status: 400 });
    }

    // Fetch existing item to provide context for rewrite
    const item = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        summary: true,
        contentHtml: true,
        category: true,
        tags: true,
        status: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Create AI request log entry
    const inputForLog = {
      itemId: id,
      title: item.title,
      category: item.category,
      note,
      startedAt: startedAt.toISOString(),
    };

    const aiConfig = await resolveNewsAiCallConfig(prisma, {
      taskType: 'rewrite',
      pool: 'DRAFTING',
      fallbackProvider: 'openai',
      fallbackModel: process.env.OPENAI_MODEL || 'o3-mini',
    });

    resolvedApiKeyId = aiConfig.apiKeyId;

    const aiLog = await prisma.newsAiRequestLog.create({
      data: {
        actorId: auth.userId,
        action: 'rewrite_request',
        provider: aiConfig.provider,
        model: aiConfig.model,
        taskType: 'rewrite',
        modelProfileId: aiConfig.modelProfileId,
        apiKeyId: aiConfig.apiKeyId,
        input: inputForLog,
        success: false,
        itemId: id,
      },
      select: { id: true },
    });

    aiLogId = aiLog.id;

    // Build the prompt for AI rewrite
    const prompt = [
      'Rewrite this NEWS ENGINE article based on editor instructions.',
      '',
      'Current article:',
      `- Title: ${item.title}`,
      item.category ? `- Category: ${item.category}` : null,
      item.summary ? `- Summary: ${item.summary}` : null,
      item.contentHtml ? `- Content (HTML): ${item.contentHtml.substring(0, 2000)}...` : null,
      '',
      '--- EDITOR INSTRUCTIONS ---',
      note,
      '--- END INSTRUCTIONS ---',
      '',
      'Constraints:',
      '- Apply the editor instructions to improve the article.',
      '- Keep the core topic and factual information accurate.',
      '- Write in a professional news style for a solar lead-gen site.',
      '- Return JSON only (no markdown fencing).',
      '- contentHtml must be valid HTML (use <p>, <h2>, <h3>, <ul>/<li> where appropriate).',
    ]
      .filter(Boolean)
      .join('\n');

    // Call OpenAI
    const aiStartMs = Date.now();
    const { raw, modelUsed } = await callNewsAiJson({
      provider: aiConfig.provider,
      model: aiConfig.model,
      system: NEWS_ENGINE_REWRITE_SYSTEM_PROMPT,
      prompt,
      apiKeyOverride: aiConfig.apiKeyOverride,
      temperature: 0.5,
    });
    const durationMs = Math.max(0, Date.now() - aiStartMs);

    const parsed = tryParseJsonObject(raw);

    // Extract fields from AI response, falling back to existing values
    const next = {
      title: parsed ? pickString(parsed, 'title') || item.title : item.title,
      summary: parsed ? pickString(parsed, 'summary') || item.summary : item.summary,
      contentHtml: parsed ? pickString(parsed, 'contentHtml') || item.contentHtml : item.contentHtml,
      category: parsed ? pickString(parsed, 'category') || item.category : item.category,
      tags: parsed && pickStringArray(parsed, 'tags').length > 0 ? pickStringArray(parsed, 'tags') : item.tags,
      seoTitle: parsed ? pickString(parsed, 'seoTitle') || null : null,
      seoDescription: parsed ? pickString(parsed, 'seoDescription') || null : null,
    };

    // Update the item with rewritten content
    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        title: next.title,
        summary: next.summary,
        contentHtml: next.contentHtml,
        category: next.category,
        tags: next.tags,
        seoTitle: next.seoTitle,
        seoDescription: next.seoDescription,
        status: 'DRAFT_READY', // Move back to draft ready for review
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    // Update AI log with success
    await prisma.newsAiRequestLog.update({
      where: { id: aiLogId },
      data: {
        model: modelUsed,
        durationMs,
        output: { draft: next, raw },
        success: true,
      },
    });

    await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

    // Write audit log
    await writeNewsAuditLog({
      action: 'news_item_rewritten',
      actorId: auth.userId,
      itemId: id,
      metadata: { note, model: modelUsed },
      promptUsed: prompt,
    });

    return NextResponse.json({ item: updated, rewriteApplied: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to rewrite news item';

    await reportNewsAiKeyError(prisma, resolvedApiKeyId, message);

    // Log failure if AI log was created
    if (aiLogId) {
      await prisma.newsAiRequestLog
        .update({
          where: { id: aiLogId },
          data: {
            success: false,
            error: message,
          },
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
            error:
              'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
          },
          { status: 500 }
        );
      }

      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/rewrite-request] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

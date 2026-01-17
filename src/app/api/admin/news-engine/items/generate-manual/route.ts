import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog, slugify, findAvailableSlug } from '@/lib/news-engine';
import { callOpenAiJson } from '@/lib/openai';
import { resolveNewsAiCallConfig, reportNewsAiKeyError, reportNewsAiKeySuccess } from '@/lib/news-engine/ai-runtime';

export const dynamic = 'force-dynamic';

type GenerateManualRequest = {
  title: string;
  prompt: string;
  category?: string;
  tags?: string[];
  outline?: string;
};

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

const MANUAL_DRAFT_SYSTEM_PROMPT =
  'You are an AI assistant that writes professional news articles for a solar energy lead-generation company. The user will provide a title and prompt. Generate a complete article. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription. contentHtml must be valid HTML (not markdown) and should use headings (h2/h3), paragraphs, lists when relevant, and emphasis tags (<strong>/<em>) to improve readability.';

export async function POST(request: NextRequest) {
  const startedAt = new Date();
  let aiLogId: string | null = null;
  let resolvedApiKeyId: string | null = null;

  try {
    const auth = await requireAdmin();

    const body = (await request.json().catch(() => null)) as GenerateManualRequest | null;

    const title = normalizeString(body?.title).trim();
    const prompt = normalizeString(body?.prompt).trim();
    const category = normalizeString(body?.category).trim() || 'General';
    const tags = (body?.tags ?? []).filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
    const outline = normalizeString(body?.outline).trim();

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Create AI request log entry
    const inputForLog = {
      title,
      prompt,
      category,
      tags,
      outline,
      startedAt: startedAt.toISOString(),
    };

    const aiConfig = await resolveNewsAiCallConfig(prisma, {
      taskType: 'draft_longform',
      pool: 'DRAFTING',
      fallbackProvider: 'openai',
      fallbackModel: process.env.OPENAI_MODEL || 'o3-mini',
    });

    resolvedApiKeyId = aiConfig.apiKeyId;

    const aiLog = await prisma.newsAiRequestLog.create({
      data: {
        actorId: auth.userId,
        action: 'manual_draft',
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

    // Build the prompt for AI generation
    const aiPrompt = [
      `Write a complete news article based on this input:`,
      '',
      `Title: ${title}`,
      `Topic/Prompt: ${prompt}`,
      category !== 'General' ? `Category: ${category}` : null,
      tags.length > 0 ? `Tags: ${tags.join(', ')}` : null,
      outline ? `Outline/Structure: ${outline}` : null,
      '',
      'Requirements:',
      '- Write in a professional news style for a solar energy/renewable energy industry audience.',
      '- Include factual information where relevant.',
      '- contentHtml must be valid HTML (use <p>, <h2>, <h3>, <ul>/<li> where appropriate).',
      '- Generate an appropriate summary (1-2 sentences).',
      '- Generate SEO-friendly title and description.',
      '- Return valid JSON only (no markdown fencing).',
    ]
      .filter(Boolean)
      .join('\n');

    // Call OpenAI
    const aiStartMs = Date.now();
    const { raw, modelUsed } = await callOpenAiJson({
      system: MANUAL_DRAFT_SYSTEM_PROMPT,
      prompt: aiPrompt,
      modelOverride: aiConfig.model,
      apiKeyOverride: aiConfig.apiKeyOverride ?? undefined,
      temperature: 0.5,
    });
    const durationMs = Math.max(0, Date.now() - aiStartMs);

    const parsed = tryParseJsonObject(raw);

    // Extract fields from AI response
    const generated = {
      title: parsed ? pickString(parsed, 'title') || title : title,
      summary: parsed ? pickString(parsed, 'summary') : prompt.substring(0, 300),
      contentHtml: parsed ? pickString(parsed, 'contentHtml') : `<p>${prompt}</p>`,
      category: parsed ? pickString(parsed, 'category') || category : category,
      tags: parsed && pickStringArray(parsed, 'tags').length > 0 ? pickStringArray(parsed, 'tags') : tags,
      seoTitle: parsed ? pickString(parsed, 'seoTitle') || null : null,
      seoDescription: parsed ? pickString(parsed, 'seoDescription') || null : null,
    };

    // Generate unique slug
    const slugBase = slugify(generated.title);
    const slug = slugBase ? await findAvailableSlug(slugBase) : null;

    // Create the news item
    const item = await prisma.newsItem.create({
      data: {
        title: generated.title,
        summary: generated.summary,
        contentHtml: generated.contentHtml,
        category: generated.category,
        tags: generated.tags,
        slug,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        status: 'DRAFT_READY',
        sourceType: 'MANUAL_ENTRY',
        aiModel: modelUsed,
        relevanceScore: 85, // Default score for manual drafts
      },
    });

    // Update AI log with success
    await prisma.newsAiRequestLog.update({
      where: { id: aiLogId },
      data: {
        model: modelUsed,
        durationMs,
        output: { draft: generated, raw },
        success: true,
        itemId: item.id,
      },
    });

    await reportNewsAiKeySuccess(prisma, resolvedApiKeyId);

    // Write audit log
    await writeNewsAuditLog({
      action: 'news_ai_draft_generated',
      actorId: auth.userId,
      itemId: item.id,
      metadata: { title, category, source: 'manual' },
      promptUsed: aiPrompt,
    });

    return NextResponse.json({ item, aiGenerated: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate manual draft';

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
    }

    console.error('❌ [POST /api/admin/news-engine/items/generate-manual] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

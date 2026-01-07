import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';
import { callOpenAiJson } from '@/lib/openai';

export const dynamic = 'force-dynamic';

type RegenerateRequest = {
  note?: string;
  model?: string;
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

const NEWS_ENGINE_REGEN_SYSTEM_PROMPT =
  'You are an assistant that regenerates rejected NEWS ENGINE drafts for a solar lead-gen company. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription, ogImageUrl.';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startedAt = new Date();
  let aiLogId: string | null = null;

  try {
    const auth = await requireAdmin();

    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as RegenerateRequest | null;

    const note = normalizeString(body?.note).trim();
    const modelOverride = normalizeString(body?.model).trim();

    const item = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        summary: true,
        contentHtml: true,
        category: true,
        tags: true,
        rejectionReason: true,
        status: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (item.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Only REJECTED items can be regenerated' }, { status: 409 });
    }

    const inputForLog = {
      itemId: id,
      title: item.title,
      category: item.category,
      rejectionReason: item.rejectionReason ?? '',
      note,
      startedAt: startedAt.toISOString(),
    };

    const aiLog = await prisma.newsAiRequestLog.create({
      data: {
        actorId: auth.userId,
        action: 'regenerate',
        provider: 'openai',
        model: modelOverride || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: inputForLog,
        success: false,
        itemId: id,
      },
      select: { id: true },
    });

    aiLogId = aiLog.id;

    const prompt = [
      'Regenerate this rejected NEWS ENGINE draft.',
      '',
      'Existing draft:',
      `- Title: ${item.title}`,
      item.category ? `- Category: ${item.category}` : null,
      item.summary ? `- Summary: ${item.summary}` : null,
      item.rejectionReason ? `- Rejection reason: ${item.rejectionReason}` : null,
      note ? `- Editor note: ${note}` : null,
      '',
      'Constraints:',
      '- Keep it accurate and helpful; avoid unverifiable claims.',
      '- Write in a professional news style for a solar lead-gen site.',
      '- Return JSON only (no markdown).',
      '- contentHtml must be valid HTML (use <p>, <h2>, <ul>/<li> where appropriate).',
    ]
      .filter(Boolean)
      .join('\n');

    const { raw, modelUsed } = await callOpenAiJson({
      system: NEWS_ENGINE_REGEN_SYSTEM_PROMPT,
      prompt,
      modelOverride: modelOverride || undefined,
      temperature: 0.4,
    });
    const parsed = tryParseJsonObject(raw);

    const next = {
      title: parsed ? pickString(parsed, 'title') || item.title : item.title,
      summary: parsed ? pickString(parsed, 'summary') : item.summary,
      contentHtml: parsed ? pickString(parsed, 'contentHtml') : item.contentHtml,
      category: parsed ? pickString(parsed, 'category') : item.category,
      tags: parsed ? pickStringArray(parsed, 'tags') : item.tags,
      seoTitle: parsed ? pickString(parsed, 'seoTitle') || null : null,
      seoDescription: parsed ? pickString(parsed, 'seoDescription') || null : null,
      ogImageUrl: parsed ? pickString(parsed, 'ogImageUrl') || null : null,
    };

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
        ogImageUrl: next.ogImageUrl,
        status: 'DRAFT_READY',
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    await prisma.newsAiRequestLog.update({
      where: { id: aiLogId },
      data: {
        model: modelUsed,
        output: { draft: next, raw },
        success: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_item_regenerated',
      actorId: auth.userId,
      itemId: id,
      metadata: { note: note || null, model: modelUsed },
      promptUsed: prompt,
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate news item';

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

    console.error('❌ [POST /api/admin/news-engine/items/[id]/regenerate] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

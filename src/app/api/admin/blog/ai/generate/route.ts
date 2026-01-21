import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { callOpenAiText } from '@/lib/openai';

export const dynamic = 'force-dynamic';

type AiGenerateRequest = {
  topic: string;
  keywords?: string;
  tone?: string;
  audience?: string;
  cta?: string;
};

type AiGenerateResponse = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  readTime: string;
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();

  // Common case: model wraps JSON in code fences
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

function getClientIp(request: NextRequest): string | null {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? null;
  return request.ip ?? null;
}

const BLOG_SYSTEM_PROMPT =
  'You are an assistant that generates blog drafts for a solar lead-gen company. Output must be valid JSON only with fields: title, excerpt, content, seoTitle, seoDescription, category, tags (array of strings), readTime.';

export async function POST(request: NextRequest) {
  const startedAt = new Date();
  let logId: string | null = null;

  try {
    const auth = await requireAdmin();

    const rate = await checkRateLimit(`blog-ai:${auth.userId}`);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: new Date(rate.resetAt).toISOString(),
        },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => null)) as AiGenerateRequest | null;
    const topic = normalizeString(body?.topic).trim();
    const keywords = normalizeString(body?.keywords).trim();
    const tone = normalizeString(body?.tone).trim();
    const audience = normalizeString(body?.audience).trim();
    const cta = normalizeString(body?.cta).trim();

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    const inputForLog = {
      topic,
      keywords,
      tone,
      audience,
      cta,
    };

    const log = await prisma.blogAiRequestLog.create({
      data: {
        userId: auth.userId,
        action: 'generate',
        input: inputForLog,
        success: false,
        ip,
        userAgent,
      },
      select: { id: true },
    });

    logId = log.id;

    const prompt = [
      `Topic: ${topic}`,
      keywords ? `Keywords: ${keywords}` : null,
      tone ? `Tone: ${tone}` : null,
      audience ? `Audience: ${audience}` : null,
      cta ? `Call to action: ${cta}` : null,
      '',
      'Constraints:',
      '- Keep it accurate and helpful; avoid unverifiable claims.',
      '- Use Australian context where reasonable.',
      '- Content should be suitable for a solar lead generation site.',
      '- Return JSON only, no markdown fences.',
    ]
      .filter(Boolean)
      .join('\n');

    const { text: raw } = await callOpenAiText({
      system: BLOG_SYSTEM_PROMPT,
      prompt,
      temperature: 0.7,
    });
    const parsed = tryParseJsonObject(raw);

    const response: AiGenerateResponse = {
      title: parsed ? pickString(parsed, 'title') : topic,
      excerpt: parsed ? pickString(parsed, 'excerpt') : '',
      content: parsed ? pickString(parsed, 'content') : raw,
      seoTitle: parsed ? pickString(parsed, 'seoTitle') : '',
      seoDescription: parsed ? pickString(parsed, 'seoDescription') : '',
      category: parsed ? pickString(parsed, 'category') : '',
      tags: parsed ? pickStringArray(parsed, 'tags') : [],
      readTime: parsed ? pickString(parsed, 'readTime') : '',
    };

    await prisma.blogAiRequestLog.update({
      where: { id: logId },
      data: {
        output: response,
        success: true,
      },
    });

    return NextResponse.json({ draft: response, startedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI generate failed';

    if (logId) {
      await prisma.blogAiRequestLog
        .update({
          where: { id: logId },
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

    console.error('❌ [POST /api/admin/blog/ai/generate] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

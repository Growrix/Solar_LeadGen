import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { callOpenAiJson } from '@/lib/openai';

export const dynamic = 'force-dynamic';

type TestPreviewRequest = {
  topic?: string;
  url?: string;
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

const TEST_PREVIEW_SYSTEM_PROMPT =
  'You are an AI assistant that generates a preview news draft for testing purposes. Output must be valid JSON only with fields: title, summary, contentHtml, seoTitle, seoDescription, citations (array of strings).';

export async function POST(request: NextRequest) {
  const started = Date.now();

  try {
    await requireAdmin();

    const body = (await request.json().catch(() => null)) as TestPreviewRequest | null;

    const topic = normalizeString(body?.topic).trim();
    const url = normalizeString(body?.url).trim();

    if (!topic && !url) {
      return NextResponse.json({ error: 'topic or url is required' }, { status: 400 });
    }

    const prompt = [
      'Generate a test news draft preview.',
      url ? `Target URL (may be used as context): ${url}` : null,
      topic ? `Topic / prompt override: ${topic}` : null,
      '',
      'Requirements:',
      '- Write in a professional news style suitable for a solar/renewables audience.',
      '- Keep it concise (preview length).',
      '- contentHtml must be valid HTML (use <p>, <h2>, <ul>/<li> if needed).',
      '- citations should be a short list of plausible citation labels/URLs if available (otherwise empty array).',
      '- Return valid JSON only (no markdown fencing).',
    ]
      .filter(Boolean)
      .join('\n');

    const { raw, modelUsed } = await callOpenAiJson({
      system: TEST_PREVIEW_SYSTEM_PROMPT,
      prompt,
      temperature: 0.4,
    });

    const obj = tryParseJsonObject(raw);
    if (!obj) {
      return NextResponse.json(
        { error: 'AI returned invalid JSON', raw },
        { status: 502 }
      );
    }

    const durationMs = Date.now() - started;

    return NextResponse.json({
      result: {
        title: pickString(obj, 'title'),
        summary: pickString(obj, 'summary'),
        contentHtml: pickString(obj, 'contentHtml'),
        seoTitle: pickString(obj, 'seoTitle') || null,
        seoDescription: pickString(obj, 'seoDescription') || null,
        citations: pickStringArray(obj, 'citations'),
      },
      modelUsed,
      durationMs,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [POST /api/admin/news-engine/research/test] Error:', error);
    return NextResponse.json({ error: 'Failed to run test preview generation' }, { status: 500 });
  }
}

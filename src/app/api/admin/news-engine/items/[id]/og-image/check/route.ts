import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

type OgImageCheckStatus = 'OK' | 'BROKEN' | 'UNKNOWN';

function validateHttpUrl(rawUrl: string): { ok: true; url: string } | { ok: false; reason: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { ok: false, reason: 'ogImageUrl is empty' };

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, reason: 'ogImageUrl must be http/https' };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, reason: 'ogImageUrl is not a valid URL' };
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkOgImageUrlServerSide(url: string): Promise<{ status: OgImageCheckStatus; error: string | null }> {
  const timeoutMs = 8000;

  try {
    let res = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' }, timeoutMs);

    // Fallback for origins that don't support HEAD.
    if (res.status === 405 || res.status === 501) {
      res = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          redirect: 'follow',
          headers: {
            // Minimize payload if server supports Range.
            Range: 'bytes=0-0',
          },
        },
        timeoutMs
      );
    }

    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return { status: 'OK', error: null };
    }

    return { status: 'BROKEN', error: `HTTP ${res.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { status: 'BROKEN', error: message };
  }
}

// POST /api/admin/news-engine/items/[id]/og-image/check
export async function POST(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const item = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        ogImageUrl: true,
      },
    });

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const now = new Date();
    const urlRaw = item.ogImageUrl ?? '';
    const validated = validateHttpUrl(urlRaw);

    let status: OgImageCheckStatus = 'UNKNOWN';
    let error: string | null = null;

    if (validated.ok) {
      const result = await checkOgImageUrlServerSide(validated.url);
      status = result.status;
      error = result.error;
    } else {
      status = 'UNKNOWN';
      error = validated.reason;
    }

    await prisma.newsItem.update({
      where: { id: item.id },
      data: {
        ogImageLastCheckedAt: now,
        ogImageLastCheckStatus: status,
        ogImageLastCheckError: error,
      },
      select: { id: true },
    });

    await writeNewsAuditLog({
      action: 'news_item_og_image_checked',
      actorId: auth.userId,
      itemId: item.id,
      metadata: {
        status,
        ogImageUrl: item.ogImageUrl,
        error,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: item.id,
      ogImageUrl: item.ogImageUrl,
      status,
      checkedAt: now.toISOString(),
      error,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database schema missing required tables/columns. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/items/[id]/og-image/check] Error:', error);
    return NextResponse.json({ error: 'Failed to check OG image URL' }, { status: 500 });
  }
}

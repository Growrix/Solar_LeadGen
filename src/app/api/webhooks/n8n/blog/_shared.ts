import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export function requireN8nSecret(request: NextRequest): { ok: true } | { ok: false; status: number; error: string } {
  const configured = process.env.N8N_WEBHOOK_SECRET;
  if (!configured) {
    return { ok: false, status: 500, error: 'Webhook not configured: missing N8N_WEBHOOK_SECRET' };
  }

  const headerSecret = request.headers.get('x-n8n-secret');
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const provided = (headerSecret || querySecret || '').trim();

  if (!provided || provided !== configured) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generateUniqueSlug(base: string): Promise<string> {
  const baseSlug = slugify(base);
  if (!baseSlug) return '';

  const existing = await prisma.blogPost.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  if (!existing) return baseSlug;

  for (let i = 2; i <= 50; i++) {
    const candidate = `${baseSlug}-${i}`;
    const found = await prisma.blogPost.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!found) return candidate;
  }

  // Extremely unlikely; fall back to cuid-like suffix
  return `${baseSlug}-${Date.now()}`;
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { encryptWithNewsMasterKey, tryMaskEncryptedKey } from '@/lib/news-engine/key-vault';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapPoolUiToDb(pool: string): 'RESEARCH' | 'DRAFTING' | 'IMAGES' {
  const v = pool.trim().toLowerCase();
  if (v === 'drafting') return 'DRAFTING';
  if (v === 'images') return 'IMAGES';
  return 'RESEARCH';
}

function mapPoolDbToUi(pool: 'RESEARCH' | 'DRAFTING' | 'IMAGES'): 'Research' | 'Drafting' | 'Images' {
  if (pool === 'DRAFTING') return 'Drafting';
  if (pool === 'IMAGES') return 'Images';
  return 'Research';
}

function normalizeProviderId(provider: string): string {
  const raw = provider.trim();
  if (!raw) return 'other';
  const v = raw.toLowerCase();

  // Back-compat for the old UI values.
  if (v === 'openai') return 'openai';
  if (v === 'other') return 'other';

  // Common aliases.
  if (v === 'google' || v === 'google-gemini' || v === 'gemini' || v === 'google gemini') return 'gemini';
  if (v === 'anthropic' || v === 'claude') return 'anthropic';
  if (v === 'deepseek') return 'deepseek';
  if (v === 'xai' || v === 'x-ai') return 'xai';
  if (v === 'azure' || v === 'azure-openai' || v === 'azure openai') return 'azure-openai';
  if (v === 'aws' || v === 'bedrock' || v === 'aws-bedrock' || v === 'aws bedrock') return 'bedrock';
  if (v === 'openrouter' || v === 'open-router') return 'openrouter';
  if (v === 'vertex' || v === 'vertexai' || v === 'vertex ai') return 'vertexai';

  // Generic normalization: keep it stable and URL-safe.
  return v
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'other';
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((t) => (t.length <= 3 ? t.toUpperCase() : t[0].toUpperCase() + t.slice(1)))
    .join(' ');
}

function providerLabel(providerId: string): string {
  const v = providerId.trim().toLowerCase();
  const known: Record<string, string> = {
    openai: 'OpenAI',
    gemini: 'Google Gemini',
    anthropic: 'Anthropic',
    deepseek: 'DeepSeek',
    xai: 'xAI',
    mistral: 'Mistral',
    cohere: 'Cohere',
    groq: 'Groq',
    together: 'Together.ai',
    fireworks: 'Fireworks',
    openrouter: 'OpenRouter',
    perplexity: 'Perplexity',
    'azure-openai': 'Azure OpenAI',
    bedrock: 'AWS Bedrock',
    vertexai: 'Google Vertex AI',
    huggingface: 'Hugging Face',
    ollama: 'Ollama',
    other: 'Other',
  };
  return known[v] ?? toTitleCase(providerId.trim() || 'other');
}

// PUT /api/admin/news-engine/key-vault/[id]
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const body = (await request.json().catch(() => null)) as any;

    const data: Record<string, unknown> = {};

    if (typeof body?.provider === 'string') data.provider = normalizeProviderId(normalizeString(body.provider));
    if (typeof body?.label === 'string') data.label = normalizeString(body.label) || 'Untitled key';
    if (typeof body?.pool === 'string') data.pools = [mapPoolUiToDb(normalizeString(body.pool))];
    if (typeof body?.enabled === 'boolean') data.enabled = body.enabled;

    const rawKey = normalizeString(body?.rawKey);
    if (rawKey) {
      data.encryptedKey = encryptWithNewsMasterKey(rawKey);
    }

    const updated = await prisma.newsApiKey.update({
      where: { id },
      data,
      select: {
        id: true,
        provider: true,
        label: true,
        pools: true,
        enabled: true,
        encryptedKey: true,
        lastUsedAt: true,
        lastSuccessAt: true,
        lastErrorAt: true,
        lastError: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_key_vault_key_updated',
      actorId: auth.userId,
      metadata: { id: updated.id },
    });

    return NextResponse.json({
      key: {
        id: updated.id,
        provider: updated.provider,
        providerLabel: providerLabel(updated.provider),
        label: updated.label,
        pool: mapPoolDbToUi(updated.pools?.[0] ?? 'RESEARCH'),
        enabled: updated.enabled,
        maskedKey: tryMaskEncryptedKey(updated.encryptedKey),
        lastUsedAt: updated.lastUsedAt ? updated.lastUsedAt.toISOString() : null,
        lastSuccessAt: updated.lastSuccessAt ? updated.lastSuccessAt.toISOString() : null,
        lastErrorAt: updated.lastErrorAt ? updated.lastErrorAt.toISOString() : null,
        lastError: updated.lastError,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    const msg = error instanceof Error ? error.message : 'Failed to update key';
    console.error('❌ [PUT /api/admin/news-engine/key-vault/[id]] Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/news-engine/key-vault/[id]
export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.newsApiKey.delete({ where: { id } });

    await writeNewsAuditLog({
      action: 'news_key_vault_key_deleted',
      actorId: auth.userId,
      metadata: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    console.error('❌ [DELETE /api/admin/news-engine/key-vault/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { decryptWithNewsMasterKey, encryptWithNewsMasterKey, getNewsKeyVaultMasterKeyOrNull, tryMaskEncryptedKey } from '@/lib/news-engine/key-vault';
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

function isLikelyDummyRawKey(rawKey: string): boolean {
  const key = rawKey.trim().toLowerCase();
  if (!key) return true;
  if (key.includes('dummy')) return true;
  if (key.startsWith('sk-e2e-')) return true;
  return false;
}

// GET /api/admin/news-engine/key-vault
export async function GET() {
  try {
    await requireAdmin();

    const masterKeyConfigured = Boolean(getNewsKeyVaultMasterKeyOrNull());

    const keys = await prisma.newsApiKey.findMany({
      orderBy: [{ enabled: 'desc' }, { createdAt: 'desc' }],
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

    const filtered = masterKeyConfigured
      ? keys.filter((k) => {
          try {
            const raw = decryptWithNewsMasterKey(k.encryptedKey);
            return !isLikelyDummyRawKey(raw);
          } catch {
            // If we cannot decrypt, keep it (it may be a real key, but the vault is misconfigured).
            return true;
          }
        })
      : keys;

    return NextResponse.json({
      masterKeyConfigured,
      keys: filtered.map((k) => ({
        id: k.id,
        provider: k.provider,
        providerLabel: providerLabel(k.provider),
        label: k.label,
        pool: mapPoolDbToUi(k.pools?.[0] ?? 'RESEARCH'),
        enabled: k.enabled,
        maskedKey: tryMaskEncryptedKey(k.encryptedKey),
        lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
        lastSuccessAt: k.lastSuccessAt ? k.lastSuccessAt.toISOString() : null,
        lastErrorAt: k.lastErrorAt ? k.lastErrorAt.toISOString() : null,
        lastError: k.lastError,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/key-vault] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch key vault' }, { status: 500 });
  }
}

// POST /api/admin/news-engine/key-vault
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as any;

    const provider = normalizeProviderId(normalizeString(body?.provider));
    const label = normalizeString(body?.label) || 'Untitled key';
    const pool = mapPoolUiToDb(normalizeString(body?.pool));
    const enabled = typeof body?.enabled === 'boolean' ? body.enabled : true;
    const rawKey = normalizeString(body?.rawKey);

    if (!rawKey) return NextResponse.json({ error: 'rawKey is required' }, { status: 400 });

    const encryptedKey = encryptWithNewsMasterKey(rawKey);

    const created = await prisma.newsApiKey.create({
      data: {
        provider,
        label,
        pools: [pool],
        enabled,
        encryptedKey,
      },
      select: { id: true, provider: true, label: true, pools: true, enabled: true, encryptedKey: true },
    });

    await writeNewsAuditLog({
      action: 'news_key_vault_key_created',
      actorId: auth.userId,
      metadata: { id: created.id, provider: created.provider, label: created.label, pools: created.pools },
    });

    return NextResponse.json({
      key: {
        id: created.id,
        provider: created.provider,
        providerLabel: providerLabel(created.provider),
        label: created.label,
        pool: mapPoolDbToUi(created.pools?.[0] ?? 'RESEARCH'),
        enabled: created.enabled,
        maskedKey: tryMaskEncryptedKey(created.encryptedKey),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ error: 'Database schema missing required tables. Apply migrations and retry.' }, { status: 500 });
    }

    const msg = error instanceof Error ? error.message : 'Failed to create key';
    console.error('❌ [POST /api/admin/news-engine/key-vault] Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

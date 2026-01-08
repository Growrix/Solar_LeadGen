import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { encryptWithNewsMasterKey, getNewsKeyVaultMasterKeyOrNull, tryMaskEncryptedKey } from '@/lib/news-engine/key-vault';
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

function mapProviderUiToDb(provider: string): string {
  const v = provider.trim().toLowerCase();
  if (v === 'openai') return 'openai';
  if (v) return v;
  return 'other';
}

function mapProviderDbToUi(provider: string): 'OpenAI' | 'Other' {
  return provider.trim().toLowerCase() === 'openai' ? 'OpenAI' : 'Other';
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

    return NextResponse.json({
      masterKeyConfigured,
      keys: keys.map((k) => ({
        id: k.id,
        provider: mapProviderDbToUi(k.provider),
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

    const provider = mapProviderUiToDb(normalizeString(body?.provider));
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
        provider: mapProviderDbToUi(created.provider),
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

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.map((v) => normalizeString(v)).filter(Boolean);
  return Array.from(new Set(ids));
}

// POST /api/admin/news-engine/model-profiles/bulk-delete
// Permanently deletes model profiles and clears any AI router defaults referencing them.
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as any;

    const ids = normalizeIdList(body?.ids);
    if (!ids.length) {
      return NextResponse.json({ error: 'ids is required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const clearedDefaults = await tx.newsModelRouterDefault.deleteMany({
        where: { modelProfileId: { in: ids } },
      });

      const deletedProfiles = await tx.newsModelProfile.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        clearedDefaultsCount: clearedDefaults.count,
        deletedCount: deletedProfiles.count,
      };
    });

    await writeNewsAuditLog({
      action: 'news_model_profile_deleted',
      actorId: auth.userId,
      metadata: { ids, ...result },
    });

    return NextResponse.json({ ok: true, ...result });
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

    console.error('❌ [POST /api/admin/news-engine/model-profiles/bulk-delete] Error:', error);
    return NextResponse.json({ error: 'Failed to delete model profiles' }, { status: 500 });
  }
}

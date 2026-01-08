import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// GET /api/admin/news-engine/items/[id]/provenance
export async function GET(_request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin();
    const id = normalizeString(context.params.id);
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const item = await prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        sourceType: true,
        sourceEntries: { select: { url: true, title: true } },
        researchEntries: { select: { url: true, title: true, kind: true } },
        aiRequestLogs: {
          orderBy: { createdAt: 'asc' },
          select: {
            action: true,
            taskType: true,
            provider: true,
            model: true,
            createdAt: true,
            modelProfile: { select: { displayName: true } },
            apiKey: { select: { label: true } },
          },
        },
      },
    });

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const rssEntryUrls = Array.from(new Set((item.sourceEntries ?? []).map((e) => e.url).filter(Boolean)));
    const researchUrls = Array.from(new Set((item.researchEntries ?? []).map((e) => e.url).filter(Boolean)));

    const stages = (item.aiRequestLogs ?? []).map((l) => ({
      action: l.action,
      taskType: l.taskType,
      provider: l.provider,
      model: l.model,
      modelProfileLabel: l.modelProfile?.displayName ?? null,
      apiKeyLabel: l.apiKey?.label ?? null,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({
      itemId: item.id,
      sourceType: item.sourceType,
      rssEntryUrls,
      researchUrls,
      stages,
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

    console.error('❌ [GET /api/admin/news-engine/items/[id]/provenance] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch item provenance' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function parseLimit(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 50;
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(200, n));
}

// GET /api/admin/news-engine/sources/[id]/entries?limit=50
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));

    const entries = await prisma.newsSourceEntry.findMany({
      where: { sourceId: id },
      orderBy: { fetchedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        sourceId: true,
        url: true,
        title: true,
        externalId: true,
        publishedAt: true,
        fetchedAt: true,
        status: true,
        error: true,
        itemId: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema missing News Engine tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/sources/[id]/entries] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch source entries' }, { status: 500 });
  }
}

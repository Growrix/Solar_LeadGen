import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function parseLimit(value: string | null): number {
  if (!value) return 50;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(n, 200);
}

function parseNullableDate(value: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

// GET /api/admin/news-engine/audit-logs
// Filters: from/to/itemId/action + cursor pagination
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const cursor = searchParams.get('cursor');

    const from = parseNullableDate(searchParams.get('from'));
    const to = parseNullableDate(searchParams.get('to'));
    const itemId = searchParams.get('itemId')?.trim() || '';
    const action = searchParams.get('action')?.trim() || '';

    const logs = await prisma.newsAuditLog.findMany({
      where: {
        ...(itemId ? { itemId } : {}),
        ...(action ? { action } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        action: true,
        actorId: true,
        itemId: true,
        sourceId: true,
        metadata: true,
        promptUsed: true,
        createdAt: true,
      },
    });

    const hasMore = logs.length > limit;
    const pageLogs = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? pageLogs[pageLogs.length - 1]?.id ?? null : null;

    return NextResponse.json({ logs: pageLogs, nextCursor });
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
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/audit-logs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

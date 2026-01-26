import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type BlogCommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
type BulkAction = 'approve' | 'reject' | 'spam' | 'delete';

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

function normalizeAction(value: unknown): BulkAction | null {
  if (typeof value !== 'string') return null;
  const lower = value.toLowerCase();
  if (lower === 'approve' || lower === 'reject' || lower === 'spam' || lower === 'delete') {
    return lower;
  }
  return null;
}

function actionToStatus(action: BulkAction): BlogCommentStatus | null {
  switch (action) {
    case 'approve':
      return 'APPROVED';
    case 'reject':
      return 'REJECTED';
    case 'spam':
      return 'SPAM';
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const ids = normalizeStringArray(body.ids);
    const action = normalizeAction(body.action);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required and must not be empty' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'action must be one of: approve, reject, spam, delete' }, { status: 400 });
    }

    const existingComments = await prisma.blogComment.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    const existingIds = existingComments.map((c) => c.id);
    const notFoundIds = ids.filter((id) => !existingIds.includes(id));

    if (action === 'delete') {
      const result = await prisma.blogComment.deleteMany({
        where: { id: { in: existingIds } },
      });

      return NextResponse.json({
        success: true,
        action,
        processed: result.count,
        notFound: notFoundIds,
      });
    }

    const newStatus = actionToStatus(action);
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await prisma.blogComment.updateMany({
      where: { id: { in: existingIds } },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      action,
      newStatus,
      processed: result.count,
      notFound: notFoundIds,
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
        { error: 'Database schema missing blog_comments table. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('[POST /api/admin/blog/comments/bulk] Error:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}

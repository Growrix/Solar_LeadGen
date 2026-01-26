import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type BlogCommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeStatus(value: unknown): BlogCommentStatus | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (upper === 'PENDING' || upper === 'APPROVED' || upper === 'REJECTED' || upper === 'SPAM') {
    return upper;
  }
  return null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const comment = await prisma.blogComment.findUnique({
      where: { id },
      include: {
        post: { select: { id: true, title: true, slug: true } },
        parent: { select: { id: true, authorName: true, content: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            content: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        postId: comment.postId,
        post: comment.post,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: comment.status,
        parentId: comment.parentId,
        parent: comment.parent,
        replies: comment.replies,
        ipAddress: comment.ipAddress,
        userAgent: comment.userAgent,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[GET /api/admin/blog/comments/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog comment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogComment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const updated = await prisma.blogComment.update({
      where: { id },
      data: {
        ...(body.content !== undefined ? { content: normalizeString(body.content).trim() } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) ?? existing.status } : {}),
        ...(body.authorName !== undefined ? { authorName: normalizeString(body.authorName).trim() } : {}),
        ...(body.authorEmail !== undefined ? { authorEmail: normalizeString(body.authorEmail).trim().toLowerCase() } : {}),
      },
      include: {
        post: { select: { id: true, title: true, slug: true } },
        parent: { select: { id: true, authorName: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({
      comment: {
        id: updated.id,
        postId: updated.postId,
        post: updated.post,
        authorName: updated.authorName,
        authorEmail: updated.authorEmail,
        content: updated.content,
        status: updated.status,
        parentId: updated.parentId,
        parent: updated.parent,
        replyCount: updated._count.replies,
        ipAddress: updated.ipAddress,
        userAgent: updated.userAgent,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
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
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    console.error('[PUT /api/admin/blog/comments/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update blog comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await prisma.blogComment.findUnique({
      where: { id },
      include: { _count: { select: { replies: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.blogComment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[DELETE /api/admin/blog/comments/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete blog comment' }, { status: 500 });
  }
}

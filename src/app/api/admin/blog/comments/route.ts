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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const status = statusParam ? normalizeStatus(statusParam) : null;
    const postId = searchParams.get('postId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.BlogCommentWhereInput = {
      ...(status ? { status } : {}),
      ...(postId ? { postId } : {}),
    };

    const [pendingCount, approvedCount, rejectedCount, spamCount, total, comments] = await Promise.all([
      prisma.blogComment.count({ where: { status: 'PENDING' } }),
      prisma.blogComment.count({ where: { status: 'APPROVED' } }),
      prisma.blogComment.count({ where: { status: 'REJECTED' } }),
      prisma.blogComment.count({ where: { status: 'SPAM' } }),
      prisma.blogComment.count({ where }),
      prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: { select: { id: true, title: true, slug: true } },
          parent: { select: { id: true, authorName: true } },
          _count: { select: { replies: true } },
        },
      }),
    ]);

    return NextResponse.json({
      counts: {
        all: pendingCount + approvedCount + rejectedCount + spamCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        spam: spamCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      comments: comments.map((c) => ({
        id: c.id,
        postId: c.postId,
        post: c.post,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        content: c.content,
        status: c.status,
        parentId: c.parentId,
        parent: c.parent,
        replyCount: c._count.replies,
        ipAddress: c.ipAddress,
        userAgent: c.userAgent,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
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

    console.error('[GET /api/admin/blog/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const postId = normalizeString(body.postId).trim();
    const authorName = normalizeString(body.authorName).trim();
    const authorEmail = normalizeString(body.authorEmail).trim().toLowerCase();
    const content = normalizeString(body.content).trim();

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    if (!authorName) {
      return NextResponse.json({ error: 'authorName is required' }, { status: 400 });
    }

    if (!authorEmail) {
      return NextResponse.json({ error: 'authorEmail is required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const status = normalizeStatus(body.status) ?? 'PENDING';

    const created = await prisma.blogComment.create({
      data: {
        postId,
        authorName,
        authorEmail,
        content,
        status,
        ipAddress: body.ipAddress ?? null,
        userAgent: body.userAgent ?? null,
        parentId: body.parentId ?? null,
      },
      include: {
        post: { select: { id: true, title: true, slug: true } },
        parent: { select: { id: true, authorName: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: created.id,
          postId: created.postId,
          post: created.post,
          authorName: created.authorName,
          authorEmail: created.authorEmail,
          content: created.content,
          status: created.status,
          parentId: created.parentId,
          parent: created.parent,
          replyCount: created._count.replies,
          ipAddress: created.ipAddress,
          userAgent: created.userAgent,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid postId or parentId reference' }, { status: 400 });
    }

    console.error('[POST /api/admin/blog/comments] Error:', error);
    return NextResponse.json({ error: 'Failed to create blog comment' }, { status: 500 });
  }
}

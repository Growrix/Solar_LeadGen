import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type BlogAuthorStatus = 'ACTIVE' | 'INACTIVE';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeStatus(value: unknown): BlogAuthorStatus | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (upper === 'ACTIVE' || upper === 'INACTIVE') {
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

    const author = await prisma.blogAuthor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            publishedAt: true,
            createdAt: true,
          },
        },
        _count: { select: { posts: true } },
      },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        bio: author.bio,
        avatarUrl: author.avatarUrl,
        status: author.status,
        socialLinks: author.socialLinks,
        userId: author.userId,
        user: author.user,
        postCount: author._count.posts,
        posts: author.posts,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[GET /api/admin/blog/authors/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog author' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogAuthor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const email = normalizeString(body.email).trim().toLowerCase();
    if (email && email !== existing.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      const emailTaken = await prisma.blogAuthor.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use by another author' }, { status: 409 });
      }
    }

    const updated = await prisma.blogAuthor.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: normalizeString(body.name).trim() } : {}),
        ...(email ? { email } : {}),
        ...(body.bio !== undefined ? { bio: normalizeString(body.bio) } : {}),
        ...(body.avatarUrl !== undefined ? { avatarUrl: normalizeString(body.avatarUrl) } : {}),
        ...(body.status !== undefined ? { status: normalizeStatus(body.status) ?? existing.status } : {}),
        ...(body.socialLinks !== undefined ? { socialLinks: body.socialLinks } : {}),
        ...(body.userId !== undefined
          ? body.userId
            ? { user: { connect: { id: body.userId } } }
            : { userId: null }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({
      author: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        status: updated.status,
        socialLinks: updated.socialLinks,
        userId: updated.userId,
        user: updated.user,
        postCount: updated._count.posts,
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
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    console.error('[PUT /api/admin/blog/authors/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update blog author' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await prisma.blogAuthor.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    if (existing._count.posts > 0) {
      return NextResponse.json(
        { error: `Cannot delete author with ${existing._count.posts} associated posts. Reassign posts first.` },
        { status: 400 }
      );
    }

    await prisma.blogAuthor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[DELETE /api/admin/blog/authors/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete blog author' }, { status: 500 });
  }
}

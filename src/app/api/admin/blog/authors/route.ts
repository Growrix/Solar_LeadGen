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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const status = statusParam ? normalizeStatus(statusParam) : null;
    const q = normalizeString(searchParams.get('q')).trim();

    const where: Prisma.BlogAuthorWhereInput = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [activeCount, inactiveCount, authors] = await Promise.all([
      prisma.blogAuthor.count({ where: { status: 'ACTIVE' } }),
      prisma.blogAuthor.count({ where: { status: 'INACTIVE' } }),
      prisma.blogAuthor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { posts: true } },
        },
      }),
    ]);

    return NextResponse.json({
      counts: {
        all: activeCount + inactiveCount,
        active: activeCount,
        inactive: inactiveCount,
      },
      authors: authors.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        bio: a.bio,
        avatarUrl: a.avatarUrl,
        status: a.status,
        socialLinks: a.socialLinks,
        userId: a.userId,
        user: a.user,
        postCount: a._count.posts,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
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
        { error: 'Database schema missing blog_authors table. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('[GET /api/admin/blog/authors] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const email = normalizeString(body.email).trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const existing = await prisma.blogAuthor.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Author with this email already exists' }, { status: 409 });
    }

    const status = normalizeStatus(body.status) ?? 'ACTIVE';

    const created = await prisma.blogAuthor.create({
      data: {
        name,
        email,
        bio: normalizeString(body.bio),
        avatarUrl: normalizeString(body.avatarUrl),
        status,
        socialLinks: body.socialLinks ?? null,
        ...(body.userId ? { user: { connect: { id: body.userId } } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(
      {
        author: {
          id: created.id,
          name: created.name,
          email: created.email,
          bio: created.bio,
          avatarUrl: created.avatarUrl,
          status: created.status,
          socialLinks: created.socialLinks,
          userId: created.userId,
          user: created.user,
          postCount: created._count.posts,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database schema missing blog_authors table. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('[POST /api/admin/blog/authors] Error:', error);
    return NextResponse.json({ error: 'Failed to create blog author' }, { status: 500 });
  }
}

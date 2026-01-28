import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type BlogPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseNullableDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function normalizeStatus(value: unknown): BlogPostStatus | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (upper === 'DRAFT' || upper === 'SCHEDULED' || upper === 'PUBLISHED' || upper === 'ARCHIVED') {
    return upper;
  }
  return null;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        blogAuthor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        ...post,
        tags: post.tags.map((t) => t.tag),
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
      return NextResponse.json(
        {
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/blog/posts/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await request.json();

    const title = normalizeString(body.title);
    const explicitSlug = normalizeString(body.slug).trim();
    const computedSlug = explicitSlug ? slugify(explicitSlug) : '';

    const nextStatus = normalizeStatus(body.status);
    const scheduledFor = body.scheduledFor !== undefined ? parseNullableDate(body.scheduledFor) : undefined;

    const categoryName = body.category !== undefined ? normalizeString(body.category).trim() : undefined;
    const tags = body.tags !== undefined ? normalizeStringArray(body.tags) : undefined;

    const blogAuthorId = body.blogAuthorId !== undefined ? normalizeString(body.blogAuthorId).trim() : undefined;

    if (blogAuthorId !== undefined && blogAuthorId) {
      const exists = await prisma.blogAuthor.findUnique({ where: { id: blogAuthorId } });
      if (!exists) {
        return NextResponse.json({ error: 'Invalid blogAuthorId' }, { status: 400 });
      }
    }

    if (computedSlug) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: computedSlug } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(computedSlug ? { slug: computedSlug } : {}),
        ...(body.excerpt !== undefined ? { excerpt: normalizeString(body.excerpt) } : {}),
        ...(body.content !== undefined ? { content: normalizeString(body.content) } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: normalizeString(body.coverImageUrl) } : {}),
        ...(body.readTime !== undefined ? { readTime: normalizeString(body.readTime) } : {}),
        ...(blogAuthorId !== undefined
          ? blogAuthorId
            ? { blogAuthor: { connect: { id: blogAuthorId } } }
            : { blogAuthor: { disconnect: true } }
          : {}),
        ...(nextStatus
          ? {
              status: nextStatus,
              publishedAt: nextStatus === 'PUBLISHED' ? new Date() : undefined,
              archivedAt: nextStatus === 'ARCHIVED' ? new Date() : undefined,
            }
          : {}),
        ...(body.robots !== undefined ? { robots: normalizeString(body.robots) } : {}),
        ...(body.seoTitle !== undefined ? { seoTitle: normalizeString(body.seoTitle) } : {}),
        ...(body.seoDescription !== undefined ? { seoDescription: normalizeString(body.seoDescription) } : {}),
        ...(body.ogImageUrl !== undefined ? { ogImageUrl: normalizeString(body.ogImageUrl) } : {}),
        ...(body.canonicalUrl !== undefined ? { canonicalUrl: normalizeString(body.canonicalUrl) } : {}),
        ...(scheduledFor !== undefined ? { scheduledFor } : {}),
        ...(categoryName !== undefined
          ? categoryName
            ? {
                category: {
                  connectOrCreate: {
                    where: { slug: slugify(categoryName) },
                    create: { name: categoryName, slug: slugify(categoryName) },
                  },
                },
              }
            : { category: { disconnect: true } }
          : {}),
        ...(tags !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tags.map((t) => {
                  const tagSlug = slugify(t);
                  return {
                    tag: {
                      connectOrCreate: {
                        where: { slug: tagSlug },
                        create: { name: t, slug: tagSlug },
                      },
                    },
                  };
                }),
              },
            }
          : {}),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        blogAuthor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json({
      post: {
        ...updated,
        tags: updated.tags.map((t) => t.tag),
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
      return NextResponse.json(
        {
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [PATCH /api/admin/blog/posts/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const archived = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        archivedAt: true,
      },
    });

    return NextResponse.json({ success: true, post: archived });
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
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [DELETE /api/admin/blog/posts/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}

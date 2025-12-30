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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const status = statusParam ? normalizeStatus(statusParam) : null;

    const posts = await prisma.blogPost.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: p.coverImageUrl,
        readTime: p.readTime,
        status: p.status,
        robots: p.robots,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        ogImageUrl: p.ogImageUrl,
        canonicalUrl: p.canonicalUrl,
        scheduledFor: p.scheduledFor,
        publishedAt: p.publishedAt,
        archivedAt: p.archivedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        author: p.author,
        category: p.category,
        tags: p.tags.map((t) => t.tag),
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
        {
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/blog/posts] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    const body = await request.json();

    const title = normalizeString(body.title).trim();
    const explicitSlug = normalizeString(body.slug).trim();
    const slug = slugify(explicitSlug || title);

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    const categoryName = normalizeString(body.category).trim();
    const tags = normalizeStringArray(body.tags);

    const status = normalizeStatus(body.status) ?? 'DRAFT';
    const scheduledFor = parseNullableDate(body.scheduledFor);

    const created = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: normalizeString(body.excerpt),
        content: normalizeString(body.content),
        coverImageUrl: normalizeString(body.coverImageUrl),
        readTime: normalizeString(body.readTime),
        status,
        robots: normalizeString(body.robots) || 'index,follow',
        seoTitle: normalizeString(body.seoTitle),
        seoDescription: normalizeString(body.seoDescription),
        ogImageUrl: normalizeString(body.ogImageUrl),
        canonicalUrl: normalizeString(body.canonicalUrl),
        scheduledFor,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        archivedAt: status === 'ARCHIVED' ? new Date() : null,
        author: { connect: { id: auth.userId } },
        ...(categoryName
          ? {
              category: {
                connectOrCreate: {
                  where: { slug: slugify(categoryName) },
                  create: { name: categoryName, slug: slugify(categoryName) },
                },
              },
            }
          : {}),
        tags: {
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
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json(
      {
        post: {
          ...created,
          tags: created.tags.map((t) => t.tag),
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
        {
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/blog/posts] Error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

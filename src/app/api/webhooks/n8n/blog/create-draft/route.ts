import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug, requireN8nSecret, slugify } from '../_shared';

export const dynamic = 'force-dynamic';

type Payload = {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  readTime?: string;
  category?: string;
  tags?: string[];
  authorId: string;
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

export async function POST(request: NextRequest) {
  const auth = requireN8nSecret(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const startedAt = new Date();

  const job = await prisma.blogJobLog.create({
    data: {
      type: 'N8N_CREATE_DRAFT',
      status: 'SUCCESS',
      startedAt,
      meta: { note: 'started' },
    },
    select: { id: true },
  });

  try {
    const body = (await request.json().catch(() => null)) as Payload | null;

    const title = normalizeString(body?.title).trim();
    const explicitSlug = normalizeString(body?.slug).trim();
    const excerpt = normalizeString(body?.excerpt);
    const content = normalizeString(body?.content);
    const coverImageUrl = normalizeString(body?.coverImageUrl);
    const readTime = normalizeString(body?.readTime);
    const authorId = normalizeString(body?.authorId).trim();

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
    if (!authorId) return NextResponse.json({ error: 'authorId is required' }, { status: 400 });

    const slugBase = explicitSlug ? slugify(explicitSlug) : title;
    const slug = await generateUniqueSlug(slugBase);
    if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

    const categoryName = normalizeString(body?.category).trim();
    const tags = normalizeStringArray(body?.tags);

    const created = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImageUrl,
        readTime,
        status: 'DRAFT',
        robots: 'index,follow',
        author: { connect: { id: authorId } },
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
      select: { id: true, slug: true, status: true, createdAt: true },
    });

    await prisma.blogJobLog.update({
      where: { id: job.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        meta: { created },
      },
    });

    return NextResponse.json({ post: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create draft';

    await prisma.blogJobLog
      .update({
        where: { id: job.id },
        data: {
          status: 'FAILURE',
          finishedAt: new Date(),
          error: message,
        },
      })
      .catch(() => null);

    console.error('❌ [POST /api/webhooks/n8n/blog/create-draft] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

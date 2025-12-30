import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatPublicDate(value: Date | null): string {
  if (!value) return '';
  try {
    return value.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return value.toISOString();
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        readTime: post.readTime,
        author: post.author.name || post.author.email || 'SolarMatch',
        date: formatPublicDate(post.publishedAt ?? post.createdAt),
        category: post.category?.name ?? 'General',
        tags: post.tags.map((t) => t.tag),
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImageUrl: post.ogImageUrl,
        canonicalUrl: post.canonicalUrl,
        robots: post.robots,
        publishedAt: post.publishedAt,
      },
    });
  } catch (error) {
    console.error('❌ [GET /api/blog/posts/[slug]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

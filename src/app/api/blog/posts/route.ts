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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 50;

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    const items = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author.name || p.author.email || 'SolarMatch',
      date: formatPublicDate(p.publishedAt ?? p.createdAt),
      readTime: p.readTime,
      category: p.category?.name ?? 'General',
      image: p.coverImageUrl,
    }));

    return NextResponse.json({ posts: items });
  } catch (error) {
    console.error('❌ [GET /api/blog/posts] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

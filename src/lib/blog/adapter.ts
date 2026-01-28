import type { Post } from '@/types/blog';
import { allArticles } from '@/data/blogData';
import { prisma } from '@/lib/prisma';

export type BlogPostKey = string;
export type BlogPostSlug = string;

export type BlogPost = Post & {
  key: BlogPostKey;
  slug: BlogPostSlug;
};

export type BlogPostDetail = BlogPost & {
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robots?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

function mapSeedPosts(): BlogPost[] {
  return allArticles.map((post) => {
    const slug = slugify(post.title);
    return {
      ...post,
      key: slug,
      slug,
    };
  });
}

function mapSeedPostDetail(slug: string): BlogPostDetail | null {
  const normalized = slugify(slug);
  const base = mapSeedPosts().find((p) => p.slug === normalized) ?? null;
  if (!base) return null;
  return {
    ...base,
    content: '',
    seoTitle: base.title,
    seoDescription: base.excerpt,
    ogImageUrl: base.image,
    canonicalUrl: '',
    robots: 'index,follow',
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
        coverImageUrl: { not: '' },
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { name: true, email: true } },
        blogAuthor: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    if (dbPosts.length === 0) {
      return mapSeedPosts();
    }

    return dbPosts.map((p) => ({
      key: p.slug,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.blogAuthor?.name || p.author.name || p.blogAuthor?.email || p.author.email || 'SolarMatch',
      date: formatPublicDate(p.publishedAt ?? p.createdAt),
      readTime: p.readTime,
      category: p.category?.name ?? 'General',
      image: p.coverImageUrl,
    }));
  } catch {
    return mapSeedPosts();
  }
}

export async function getBlogPostBySlug(slug: BlogPostSlug): Promise<BlogPost | null> {
  const normalized = slugify(slug);
  try {
    const fromDb = await prisma.blogPost.findFirst({
      where: {
        slug: normalized,
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: { select: { name: true, email: true } },
        blogAuthor: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    if (!fromDb) {
      return mapSeedPosts().find((p) => p.slug === normalized) ?? null;
    }

    if (!fromDb.coverImageUrl) {
      return null;
    }

    return {
      key: fromDb.slug,
      slug: fromDb.slug,
      title: fromDb.title,
      excerpt: fromDb.excerpt,
      author: fromDb.blogAuthor?.name || fromDb.author.name || fromDb.blogAuthor?.email || fromDb.author.email || 'SolarMatch',
      date: formatPublicDate(fromDb.publishedAt ?? fromDb.createdAt),
      readTime: fromDb.readTime,
      category: fromDb.category?.name ?? 'General',
      image: fromDb.coverImageUrl,
    };
  } catch {
    return mapSeedPosts().find((p) => p.slug === normalized) ?? null;
  }
}

export async function getBlogPostDetailBySlug(slug: BlogPostSlug): Promise<BlogPostDetail | null> {
  const normalized = slugify(slug);
  try {
    const fromDb = await prisma.blogPost.findFirst({
      where: {
        slug: normalized,
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      include: {
        author: { select: { name: true, email: true } },
        blogAuthor: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    if (!fromDb) {
      return mapSeedPostDetail(normalized);
    }

    if (!fromDb.coverImageUrl) {
      return null;
    }

    return {
      key: fromDb.slug,
      slug: fromDb.slug,
      title: fromDb.title,
      excerpt: fromDb.excerpt,
      author: fromDb.blogAuthor?.name || fromDb.author.name || fromDb.blogAuthor?.email || fromDb.author.email || 'SolarMatch',
      date: formatPublicDate(fromDb.publishedAt ?? fromDb.createdAt),
      readTime: fromDb.readTime,
      category: fromDb.category?.name ?? 'General',
      image: fromDb.coverImageUrl,
      content: fromDb.content,
      seoTitle: fromDb.seoTitle,
      seoDescription: fromDb.seoDescription,
      ogImageUrl: fromDb.ogImageUrl,
      canonicalUrl: fromDb.canonicalUrl,
      robots: fromDb.robots,
    };
  } catch {
    return mapSeedPostDetail(normalized);
  }
}

export async function getBlogPostByKey(key: BlogPostKey): Promise<BlogPost | null> {
  return getBlogPostBySlug(key);
}

export async function getBlogCategories(): Promise<string[]> {
  const posts = await getBlogPosts();
  return ['All', ...Array.from(new Set(posts.map((p) => p.category)))];
}

export function getBlogPostSlug(post: Post): BlogPostSlug {
  return slugify(post.title);
}

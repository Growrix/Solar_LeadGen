import type { Post } from '@/types/blog';
import { allArticles } from '@/data/blogData';

export type BlogPostKey = string;
export type BlogPostSlug = string;

export type BlogPost = Post & {
  key: BlogPostKey;
  slug: BlogPostSlug;
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

export function getBlogPosts(): BlogPost[] {
  return allArticles.map((post) => {
    const slug = slugify(post.title);
    return {
      ...post,
      key: slug,
      slug,
    };
  });
}

export function getBlogPostBySlug(slug: BlogPostSlug): BlogPost | null {
  const normalized = slugify(slug);
  return getBlogPosts().find((p) => p.slug === normalized) ?? null;
}

export function getBlogPostByKey(key: BlogPostKey): BlogPost | null {
  return getBlogPostBySlug(key);
}

export function getBlogCategories(): string[] {
  const posts = getBlogPosts();
  return ['All', ...Array.from(new Set(posts.map((p) => p.category)))];
}

export function getBlogPostSlug(post: Post): BlogPostSlug {
  return slugify(post.title);
}

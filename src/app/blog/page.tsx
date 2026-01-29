import type { Metadata } from 'next';
import BlogIndexClient from './BlogIndexClient';
import type { Post } from '@/types/blog';
import { getWpPosts, wpPostToCard } from '@/lib/wordpress/posts';
import { getWpCategories } from '@/lib/wordpress/categories';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'SolarMatch Blog',
  description: 'Solar guides, rebates, and technology updates.',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  let posts: Post[] = [];
  let error: string | undefined;
  let categories: Array<{ id: number; name: string; count?: number }> = [];
  let recentPosts: Array<{ slug: string; title: string; date: string }> = [];

  const categoryId = searchParams?.category ? Number(searchParams.category) : undefined;
  const selectedCategoryId = Number.isFinite(categoryId) ? (categoryId as number) : undefined;

  try {
    const [wpPosts, wpCategories, wpRecent] = await Promise.all([
      getWpPosts({ perPage: 100, page: 1, status: 'publish', embed: true, categoryId: selectedCategoryId, revalidateSeconds: 60 }),
      getWpCategories({ perPage: 100, hideEmpty: true, revalidateSeconds: 300 }),
      getWpPosts({ perPage: 5, page: 1, status: 'publish', embed: false, revalidateSeconds: 60 }),
    ]);

    posts = wpPosts.map((p) => wpPostToCard(p));

    categories = wpCategories
      .map((c) => ({ id: c.id, name: c.name, count: c.count }))
      .filter((c) => c.id > 0 && c.name);

    recentPosts = wpRecent.map((p) => {
      const d = new Date(p.date);
      const dateLabel = Number.isNaN(d.getTime())
        ? p.date
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return { slug: p.slug, title: p.title?.rendered ?? '', date: dateLabel };
    });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load WordPress posts';
  }

  return <BlogIndexClient posts={posts} error={error} categories={categories} recentPosts={recentPosts} />;
}

import BlogPageClient from '@/app/blog/BlogPageClient';
import { getBlogPosts } from '@/lib/blog/strapi';

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogPageClient initialPosts={posts} />;
}
import type { Post } from '@/types/blog';

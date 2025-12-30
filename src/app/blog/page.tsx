import { getBlogPosts } from '@/lib/blog/adapter';
import BlogPageClient from './BlogPageClient';

export const metadata = {
  title: 'SolarMatch Blog',
  description: 'Solar news, rebates, guides, and technology updates from SolarMatch.',
  openGraph: {
    title: 'SolarMatch Blog',
    description: 'Solar news, rebates, guides, and technology updates from SolarMatch.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogPageClient initialArticles={posts} />;
}

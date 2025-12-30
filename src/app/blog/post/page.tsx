import type { Metadata } from 'next';
import BlogPostPageClient from './BlogPostPageClient';

export const metadata: Metadata = {
  title: 'SolarMatch Blog Article',
  description: 'Read the latest solar energy news, rebates, and technology updates from SolarMatch.',
  openGraph: {
    title: 'SolarMatch Blog Article',
    description: 'Read the latest solar energy news, rebates, and technology updates from SolarMatch.',
    type: 'article',
  },
};

export default function BlogPostPage() {
  return <BlogPostPageClient />;
}
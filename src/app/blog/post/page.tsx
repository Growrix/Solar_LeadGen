'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BlogPostLegacyPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const storedPost = sessionStorage.getItem('currentBlogPost');
      if (!storedPost) {
        router.replace('/blog');
        return;
      }

      const parsed = JSON.parse(storedPost) as { title?: string };
      const slug = parsed?.title ? slugify(parsed.title) : '';
      if (!slug) {
        router.replace('/blog');
        return;
      }

      router.replace(`/blog/${slug}`);
    } catch {
      router.replace('/blog');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-heading-4">Loading...</div>
    </div>
  );
}
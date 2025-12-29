'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/types/blog';
import { slugify } from '@/lib/blog/slugify';

export default function BlogPostPage() {
  const router = useRouter();

  useEffect(() => {
    const storedPost = sessionStorage.getItem('currentBlogPost');
    if (!storedPost) {
      router.replace('/blog');
      return;
    }

    try {
      const post = JSON.parse(storedPost) as Post;
      const slug = slugify(post?.title ?? '');

      if (!slug) {
        router.replace('/blog');
        return;
      }

      router.replace(`/blog/${encodeURIComponent(slug)}`);
    } catch {
      router.replace('/blog');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-heading-4">Redirecting…</div>
    </div>
  );
}
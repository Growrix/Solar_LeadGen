'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FooterNav from '@/components/FooterNav';
import type { BlogPost } from '@/types/blog';
import { applyScheduledPublishes, getCmsPostBySlug } from '@/lib/blog/cms-store';
import BlogPostContent from '@/components/blog/BlogPostContent';

export default function LocalCmsPostFallback({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      applyScheduledPublishes();
      const found = getCmsPostBySlug(slug);
      if (found && found.status === 'PUBLISHED') {
        setPost(found);
      } else {
        setPost(null);
      }
    } finally {
      setChecked(true);
    }
  }, [slug]);

  if (!checked) {
    return (
      <div className="min-h-screen flex flex-col blog-post-page-bg animate-fade-in">
        <main className="flex-grow pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <p className="text-body-small text-muted-foreground">Loading…</p>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col blog-post-page-bg animate-fade-in">
        <main className="flex-grow pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h1 className="text-heading-2 text-foreground mb-3">Article not found</h1>
            <p className="text-body-small text-muted-foreground mb-6">This post isn’t available.</p>
            <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 text-body-small">
              Back to All Articles
            </Link>
          </div>
        </main>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col blog-post-page-bg animate-fade-in">
      <main className="flex-grow pb-20 md:pb-0">
        <article>
          <header className="relative h-64 sm:h-80 md:h-96">
            <Image src={post.featuredImageUrl} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </header>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 text-body-small mb-8">
              Back to All Articles
            </Link>

            <span className="text-label text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">{post.categoryName}</span>

            <h1 className="text-heading-1 sm:text-heading-1 md:text-heading-1 text-foreground mb-6 tracking-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-8 border-y border-border py-4">
              <div className="flex items-center space-x-2">
                <span>By {post.authorName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{post.publishedDateLabel}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{post.readTimeLabel}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p className="text-heading-3 text-muted-foreground">{post.excerpt}</p>
              <BlogPostContent content={post.content} format={post.contentFormat} />
            </div>
          </div>
        </article>
      </main>

      <FooterNav />
    </div>
  );
}

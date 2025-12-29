import React from 'react';
import Link from 'next/link';
import FooterNav from '@/components/FooterNav';

export default function LocalCmsPostFallback({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen flex flex-col blog-post-page-bg animate-fade-in">
      <main className="flex-grow pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-heading-2 text-foreground mb-3">Article not found</h1>
          <p className="text-body-small text-muted-foreground mb-6">This post “{slug}” isn’t available.</p>
          <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 text-body-small">
            Back to All Articles
          </Link>
        </div>
      </main>
      <FooterNav />
    </div>
  );
}

function LocalCmsLegacyPreviewShell() {
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

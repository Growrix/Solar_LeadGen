'use client';

import React from 'react';
import Button from '@/components/Button';
import { loadNewsEngineState, type NewsItem } from '@/lib/ui-stubs/news-engine';

function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 1600 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share"
    >
      <div
        className="bg-surface rounded-2xl shadow-neu-outset w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-3 text-foreground">Share</h2>
            <p className="text-body-small text-muted-foreground mt-1">Copy the link.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-background text-muted-foreground shadow-neu-outset hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="bg-background rounded-2xl shadow-neu-inset p-5">
            <div className="text-body-small text-muted-foreground">URL</div>
            <div className="mt-2 text-body text-foreground break-words">{url}</div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                } catch {
                  // no-op
                }
              }}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicNewsDetailPage({ params }: { params: { slug: string } }) {
  const [item, setItem] = React.useState<NewsItem | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);

  React.useEffect(() => {
    const state = loadNewsEngineState();
    const found = state.items.find((it) => it.status === 'PUBLISHED' && it.slug === params.slug) ?? null;
    setItem(found);
  }, [params.slug]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-surface rounded-2xl shadow-neu-outset p-10 text-center">
            <h1 className="text-heading-2 text-foreground">Not found</h1>
            <p className="text-muted-foreground mt-2">This post does not exist.</p>
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" className="px-4 py-2" onClick={() => window.location.href = '/news'}>
                Back to News
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button variant="secondary" className="px-4 py-2" onClick={() => window.location.href = '/news'}>
            Back
          </Button>
        </div>

        <article className="bg-surface rounded-2xl shadow-neu-outset p-8">
          <h1 className="text-heading-1 text-foreground">{item.title}</h1>
          <p className="text-muted-foreground mt-2">Published {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '—'}</p>

          <div className="mt-6 text-body text-muted-foreground">{item.summary}</div>

          <div className="mt-8 flex justify-end">
            <Button variant="primary" className="px-4 py-2" onClick={() => setShareOpen(true)}>
              Share
            </Button>
          </div>
        </article>
      </div>

      {shareOpen ? <ShareModal url={shareUrl} onClose={() => setShareOpen(false)} /> : null}
    </div>
  );
}

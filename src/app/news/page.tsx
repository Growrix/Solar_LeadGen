'use client';

import React from 'react';
import Button from '@/components/Button';
import { loadNewsEngineState, type NewsItem } from '@/lib/ui-stubs/news-engine';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function PublicNewsListingPage() {
  const [items, setItems] = React.useState<NewsItem[]>([]);

  React.useEffect(() => {
    const state = loadNewsEngineState();
    setItems(state.items.filter((it) => it.status === 'PUBLISHED' && it.slug));

    const onStorage = () => {
      const next = loadNewsEngineState();
      setItems(next.items.filter((it) => it.status === 'PUBLISHED' && it.slug));
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-heading-1 text-foreground mb-2">News</h1>
            <p className="text-heading-4 text-muted-foreground">Published items only.</p>
          </div>
          <Button variant="secondary" className="px-4 py-2" onClick={() => window.location.href = '/admin/news-engine'}>
            Admin
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-neu-outset p-10 text-center">
            <h2 className="text-heading-3 text-foreground">No published items</h2>
            <p className="text-muted-foreground mt-2">Publish something from the News Engine admin hub.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((it) => (
              <div key={it.id} className="bg-surface rounded-2xl shadow-neu-outset p-6">
                <div className="text-body-small text-muted-foreground">{formatDate(it.publishedAt)}</div>
                <div className="mt-2 text-heading-3 text-foreground">{it.title}</div>
                <div className="mt-3 text-body text-muted-foreground">{it.summary}</div>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary" className="px-4 py-2" onClick={() => window.location.href = `/news/${it.slug}`}>Read</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

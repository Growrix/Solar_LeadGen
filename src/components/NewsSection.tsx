'use client';

import React from 'react';
import Link from 'next/link';
import { fetchPublicNewsList, type PublicNewsListItem } from '@/lib/news-engine/client';

function safeDateLabel(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowRightLargeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <line x1="5" x2="19" y1="12" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default function NewsSection() {
  const [items, setItems] = React.useState<PublicNewsListItem[]>([]);


  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const list = await fetchPublicNewsList();
        if (!alive) return;
        setItems(list);
      } catch {
        if (!alive) return;
        setItems([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Always show 3 cards in a single row, matching BlogSection
  // If fewer than 3, show as many as available
  const cards = items.slice(0, 3);

  return (
    <section className="news-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-heading-2 lg:text-heading-1 text-foreground mb-4">Latest News</h2>
          <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
            Published updates and announcements from SolarMatch.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="bg-background rounded-2xl shadow-neu-outset p-10 text-center max-w-lg mx-auto">
            <h3 className="text-heading-3 text-foreground">No news yet</h3>
            <p className="text-body text-muted-foreground mt-2">Check back soon for updates.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {cards.map((it, idx) => (
                <Link
                  key={it.id}
                  href={`/news/${it.slug}`}
                  className="bg-background rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg overflow-hidden group cursor-pointer transition-colors duration-300"
                  aria-label={`Read news: ${it.title}`}
                >
                  <div className="p-6 lg:p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 bg-background shadow-neu-inset px-3 py-1.5 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-neu-inset-sm"></div>
                        <span className="text-caption text-foreground">{it.category || 'General'}</span>
                      </div>
                      <span className="text-caption text-muted-foreground">{safeDateLabel(it.publishedAt)}</span>
                    </div>

                    <h3 className={idx === 0 ? "text-heading-3 lg:text-heading-2 text-foreground mb-4 leading-snug group-hover:text-primary transition-colors" : "text-heading-4 text-foreground mb-4 leading-snug group-hover:text-primary transition-colors"}>
                      {it.title}
                    </h3>
                    <p className="text-body text-muted-foreground mb-6 leading-relaxed">{it.summary}</p>

                    <div
                      aria-hidden="true"
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 text-body-small tracking-wider rounded-full bg-background text-muted-foreground shadow-neu-outset-sm group-hover:text-foreground group-hover:shadow-neu-inset-sm mt-auto"
                    >
                      <span>{idx === 0 ? 'Read Story' : 'Read'}</span>
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-body-small tracking-wider rounded-full bg-background text-muted-foreground shadow-neu-outset-sm hover:text-foreground hover:shadow-neu-inset-sm active:shadow-neu-inset-sm active:scale-[0.98]"
                aria-label="See all news"
              >
                <span>See All News</span>
                <ArrowRightLargeIcon />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

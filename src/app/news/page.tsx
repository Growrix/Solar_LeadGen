'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { fetchPublicNewsList, type PublicNewsListItem } from '@/lib/news-engine/client';

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

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
    className="h-4 w-4 text-muted-foreground"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

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

export default function PublicNewsListingPage() {

  const [items, setItems] = React.useState<PublicNewsListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setIsLoading(true);
      try {
        const list = await fetchPublicNewsList();
        if (!alive) return;
        setItems(list);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const publishedNews = React.useMemo(() => items, [items]);
  const categories = React.useMemo(() => {
    const cats = new Set(publishedNews.map(n => n.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [publishedNews]);

  const filteredItems = React.useMemo(() => {
    return publishedNews.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || (item.summary?.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [publishedNews, activeCategory, searchQuery]);

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      {/* Header and Search */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={resetFilters}>
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-background">
              <span className="text-body">SM</span>
            </div>
            <span className="text-heading-2 text-foreground hidden sm:block lg:text-heading-1">NEWS</span>
          </div>
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Search published news..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-10 py-3 bg-surface border-none rounded-2xl text-body focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground text-foreground"
              aria-label="Search news by headline"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Clear search</span>X
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Category Filter Strip */}
      <div className="bg-background border-b border-border py-6 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <span className="text-caption text-muted-foreground uppercase tracking-widest mr-2">Topics</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-caption uppercase tracking-widest whitespace-nowrap border ${activeCategory === cat ? 'bg-primary text-background border-primary shadow-neu-outset scale-105' : 'bg-surface text-muted-foreground hover:text-primary border-border hover:border-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-5 animate-pulse">
                <div className="aspect-[16/10] bg-surface rounded-3xl" />
                <div className="px-2 space-y-3">
                  <div className="h-3 bg-surface rounded w-1/4" />
                  <div className="h-6 bg-surface rounded w-full" />
                  <div className="h-10 bg-surface rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-16 animate-in fade-in duration-700">
            {/* Featured Story (First published item) */}
            {activeCategory === 'All' && searchQuery === '' && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-neu-outset">
                  {filteredItems[0].ogImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filteredItems[0].ogImageUrl}
                      alt={filteredItems[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60 transition-transform duration-1000 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-background/10 pointer-events-none">
                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none"><rect x="0" y="0" width="120" height="60" rx="8" fill="currentColor" className="text-accent/30"/><path d="M10 50 L40 30 L70 40 L110 10" stroke="#fff" strokeWidth="3" fill="none"/></svg>
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-2 bg-background/80 backdrop-blur-xl border border-border rounded-full text-caption text-primary uppercase tracking-widest">Featured Analysis</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-caption text-primary uppercase tracking-widest">
                    <span>{filteredItems[0].category}</span>
                    <span className="w-1.5 h-1.5 bg-border rounded-full" />
                    <span className="text-muted-foreground">{formatDate(filteredItems[0].publishedAt)}</span>
                  </div>
                  <h2 className="text-heading-2 text-foreground leading-[1.1] group-hover:text-primary md:text-heading-1"> 
                    {filteredItems[0].title}
                  </h2>
                  <p className="text-body-large text-muted-foreground leading-relaxed line-clamp-3">
                    {filteredItems[0].summary}
                  </p>
                  {filteredItems[0].tags?.length ? (
                    <div className="flex flex-wrap gap-2 text-caption uppercase tracking-widest text-muted-foreground">
                      {filteredItems[0].tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-surface border border-border rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <a href={`/news/${filteredItems[0].slug}`} className="flex items-center gap-2 text-primary text-caption uppercase tracking-widest group/btn">
                    Read Intelligence Report
                    <ArrowRightIcon />
                  </a>
                </div>
              </section>
            )}
            {/* Grid for rest of the items */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {(activeCategory === 'All' && searchQuery === '' ? filteredItems.slice(1) : filteredItems).map(item => (
                <a key={item.id} href={`/news/${item.slug}`} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1">
                  <div className="aspect-[16/10] rounded-3xl bg-surface relative mb-6 overflow-hidden shadow-neu-outset group-hover:shadow-neu-inset transition-colors duration-500">
                    {item.ogImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.ogImageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 opacity-80 group-hover:scale-110 transition-transform duration-1000" />
                    )}
                    <div className="absolute bottom-5 left-5">
                      <span className="px-3 py-1.5 bg-background/95 backdrop-blur-md rounded-xl text-caption uppercase tracking-widest text-primary border border-border">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 px-1">
                    <div className="flex items-center gap-2 text-caption text-muted-foreground uppercase tracking-widest">
                      {formatDate(item.publishedAt)}
                    </div>
                    <h4 className="text-heading-4 text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-body text-muted-foreground leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                    {item.tags?.length ? (
                      <div className="flex flex-wrap gap-2 text-caption uppercase tracking-widest text-muted-foreground">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-surface border border-border rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </a>
              ))}
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center text-muted-foreground mb-8 border border-border">
              <span className="text-heading-2">🔍</span>
            </div>
            <h3 className="text-heading-3 text-foreground mb-3 tracking-tight">No published stories found</h3>
            <p className="text-body-large text-muted-foreground max-w-sm mb-10">We couldn&apos;t find any news matching your current criteria. Try resetting your filters to browse all published news.</p>
            <button onClick={resetFilters} className="px-10 py-4 bg-primary text-background text-caption rounded-2xl shadow-xl shadow-primary/10 hover:scale-105 transition-colors uppercase tracking-widest active:scale-95">
              Reset All Filters
            </button>
          </div>
        )}
      </main>
      <Footer
        onBecomePartnerClick={() => {}}
        onPartnerSignInClick={() => {}}
        onScrollToQuote={() => {}}
        onScrollToRebate={() => {}}
        onBlogClick={() => {}}
        onGovernmentNewsClick={() => {}}
      />
    </div>
  );
}

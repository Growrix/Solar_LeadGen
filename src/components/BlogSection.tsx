"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Post } from '../types/blog';
import Button from '@/components/ui/button';

type WpRendered = { rendered: string };

type WpPostLite = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  yoast_head_json?: {
    description?: string;
  };
  _embedded?: {
    author?: Array<{ name?: string }>;
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  if (typeof window === 'undefined') return text;
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

function truncateToWords(text: string, maxWords = 36): string {
  const normalized = decodeHtmlEntities(text)
    .replace(/\[&hellip;\]/gi, '…')
    .replace(/&hellip;/gi, '…')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return '';

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return normalized;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// --- Icon Components ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ArrowRightLargeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

interface BlogSectionProps {
  onSeeAllPostsClick: () => void;
  onNavigateToPost: (post: Post) => void;
}

const BlogSection: React.FC<BlogSectionProps> = ({ onSeeAllPostsClick, onNavigateToPost }) => {
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/wp/posts?per_page=3&_embed=1&status=publish', { cache: 'no-store' });
        const json = (await res.json()) as { items?: WpPostLite[]; error?: string };
        if (!res.ok) {
          throw new Error(json?.error || `Failed to load posts (${res.status})`);
        }

        const items = Array.isArray(json.items) ? json.items : [];

        const mapped: Post[] = items.map((p) => {
          const title = stripHtml(p.title?.rendered ?? '') || 'Untitled';
          const excerpt =
            (p.yoast_head_json?.description ? stripHtml(p.yoast_head_json.description) : '') ||
            stripHtml(p.excerpt?.rendered ?? '') ||
            stripHtml(p.content?.rendered ?? '');

          const previewExcerpt = truncateToWords(excerpt, 36);

          const contentText = stripHtml(p.content?.rendered ?? '');

          const featured = p._embedded?.['wp:featuredmedia']?.[0];
          const imageUrl = featured?.source_url || '/images/blog-placeholder.svg';

          return {
            title,
            excerpt: previewExcerpt || title,
            author: p._embedded?.author?.[0]?.name ?? 'SolarMatch',
            date: formatDate(p.date),
            readTime: estimateReadTime(contentText || excerpt || title),
            category: 'Blog',
            image: imageUrl,
            slug: p.slug,
            link: p.link,
          };
        });

        if (!cancelled) {
          setArticles(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load posts');
          setArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-heading-2 lg:text-heading-1 text-foreground mb-4">
            Latest Solar News & Insights
          </h2>
          <p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
            Stay informed with expert insights, industry updates, and practical tips from our solar specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {error ? (
            <div className="col-span-full bg-background rounded-2xl shadow-neu-inset p-6 text-center text-muted-foreground">
              {error}
            </div>
          ) : null}

          {(loading ? Array.from({ length: 3 }).map((_, i) => ({
            title: 'Loading…',
            excerpt: 'Loading latest posts…',
            author: '—',
            date: '—',
            readTime: '—',
            category: 'Blog',
            image: '/images/blog-placeholder.svg',
            slug: undefined,
          })) : articles).map((article, index) => (
            <article 
              key={index} 
              onClick={() => !loading && onNavigateToPost(article)}
              className={`bg-background rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg overflow-hidden group transition-colors duration-300 ${
                loading ? 'opacity-60 cursor-default' : 'cursor-pointer'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Read article: ${article.title}`}
              onKeyDown={(e) => !loading && e.key === 'Enter' && onNavigateToPost(article)}
            >
              <div className="relative w-full h-44 bg-background shadow-neu-inset">
                <Image
                  src={article.image || '/images/blog-placeholder.svg'}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
              </div>
              <div className="p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 bg-background shadow-neu-inset px-3 py-1.5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-neu-inset-sm"></div>
                    <span className="text-caption text-foreground">
                      {article.category}
                    </span>
                  </div>
                  <span className="text-caption text-muted-foreground">
                    {article.readTime}
                  </span>
                </div>
                
                <h3 className="text-heading-4 text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-body text-muted-foreground mb-5 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-body-small text-muted-foreground mb-6 border-t border-border pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon />
                      <span className="text-muted-foreground">{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon />
                      <span className="text-muted-foreground">{article.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div
                    className="text-primary group-hover:text-primary/80 transition-colors inline-flex items-center space-x-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPost(article);
                    }}
                  >
                    <span>Read Article</span>
                    <ArrowRightIcon />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onSeeAllPostsClick}
            variant="secondary"
            className="inline-flex items-center space-x-2 px-8 py-4"
          >
            <span>See All Posts</span>
            <ArrowRightLargeIcon />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

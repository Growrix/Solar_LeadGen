"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Post } from '../types/blog';
import { Button } from '@/ds';

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
    <section className="py-24 bg-background border-t border-border" id="resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground-secondary mb-4 tracking-tight">
              Latest Solar News & Insights
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stay informed with expert insights, industry updates, and practical tips from our solar specialists.
            </p>
          </div>
          <div className="hidden md:block">
            <Button onClick={onSeeAllPostsClick} variant="secondary" size="md">
              <span>View All Posts</span>
              <ArrowRightLargeIcon />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {error ? (
            <div className="col-span-full bg-surface rounded-2xl p-6 text-center text-muted-foreground border border-border">
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
              className={`bg-slate-800 rounded-2xl overflow-hidden group border border-slate-700 transition-all duration-300 hover:border-brand-500/50 hover:-translate-y-1 hover:shadow-modal ${
                loading ? 'opacity-60 cursor-default' : 'cursor-pointer'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Read article: ${article.title}`}
              onKeyDown={(e) => !loading && e.key === 'Enter' && onNavigateToPost(article)}
            >
              <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                <Image
                  src={article.image || '/images/blog-placeholder.svg'}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-brand-500 text-brand-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarIcon />
                    <span>{article.date}</span>
                  </div>
                  <span className="text-xs text-slate-400">{article.readTime}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-3 leading-snug group-hover:text-brand-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed flex-1">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <UserIcon />
                    <span>{article.author}</span>
                  </div>
                  <div
                    className="text-brand-400 text-sm font-semibold inline-flex items-center gap-1.5 group-hover:text-brand-300 group-hover:gap-2.5 transition-all"
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

        <div className="mt-8 md:hidden flex justify-center">
          <Button onClick={onSeeAllPostsClick} variant="secondary" size="lg">
            <span>See All Posts</span>
            <ArrowRightLargeIcon />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

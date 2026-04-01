"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Post } from '../types/blog';
import { Button, Section } from '@/ds';
import { Calendar, User, ArrowRight } from '@/ds/icons';

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

// Icons imported from @/ds/icons above

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
    <Section size="xl" tone="surface" container="wide" id="resources">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div style={{ maxWidth: '42rem' }}>
            <h2 className="text-heading-2 mb-4">
              Latest Solar News & Insights
            </h2>
            <p className="text-body-large ui-text-muted">
              Stay informed with expert insights, industry updates, and practical tips from our solar specialists.
            </p>
          </div>
          <div className="ui-only-desktop">
            <Button onClick={onSeeAllPostsClick} variant="secondary" size="md">
              <span>View All Posts</span>
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>

        <div className="ui-grid ui-grid--3 mb-10">
          {error ? (
            <div className="col-span-full ui-card ui-text-center ui-text-muted">
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
              className={`ui-card ui-card--flush group transition-all duration-300 overflow-hidden ${
                loading ? 'opacity-60 cursor-default' : 'cursor-pointer'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Read article: ${article.title}`}
              onKeyDown={(e) => !loading && e.key === 'Enter' && onNavigateToPost(article)}
            >
              <div className="relative w-full h-48 overflow-hidden" style={{ background: 'var(--ds-color-background)' }}>
                <Image
                  src={article.image || '/images/blog-placeholder.svg'}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={index < 2}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--ds-color-background) 0%, transparent 60%)' }} />
                <div className="absolute top-4 left-4">
                  <span className="ui-badge ui-badge--accent">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col" style={{ padding: 'var(--ds-space-card-padding)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-caption">
                    <Calendar size={14} />
                    <span>{article.date}</span>
                  </div>
                  <span className="text-caption">{article.readTime}</span>
                </div>
                
                <h3 className="text-heading-4 mb-3 leading-snug transition-colors">
                  {article.title}
                </h3>
                <p className="text-body-small ui-text-muted mb-5 leading-relaxed flex-1">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--ds-color-border)' }}>
                  <div className="flex items-center gap-1.5 text-caption">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 transition-all"
                    style={{ color: 'var(--ds-color-accent)', fontSize: 'var(--ds-font-size-2)', fontWeight: 'var(--ds-font-weight-semibold)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPost(article);
                    }}
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="ui-only-mobile flex justify-center">
          <Button onClick={onSeeAllPostsClick} variant="secondary" size="lg">
            <span>See All Posts</span>
            <ArrowRight size={20} />
          </Button>
        </div>
    </Section>
  );
};

export default BlogSection;

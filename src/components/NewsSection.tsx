"use client";

import React from 'react';
import Image from 'next/image';
import { Newspaper, ArrowRight, Clock, ExternalLink } from '@/ds/icons';
import { Button, Section } from '@/ds';

type NewsArticle = {
  id: string;
  source: string;
  title: string;
  snippet: string;
  date: string;
  url: string;
  imageUrl: string;
};

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    source: 'Clean Energy Wire',
    title: 'Global Solar Capacity Surpasses 1 Terawatt Milestone',
    snippet: 'A historic achievement for renewable energy as solar adoption accelerates worldwide, driven by falling panel costs and government initiatives across major economies.',
    date: '2 hours ago',
    url: '#',
    imageUrl: 'https://picsum.photos/seed/solar-farm/1200/800',
  },
  {
    id: '2',
    source: 'TechCrunch',
    title: 'New Solid-State Battery Tech Could Double Storage Efficiency',
    snippet: 'Breakthrough research promises safer, longer-lasting home battery solutions for solar systems.',
    date: '5 hours ago',
    url: '#',
    imageUrl: 'https://picsum.photos/seed/battery/800/600',
  },
  {
    id: '3',
    source: 'Solar Power World',
    title: 'California Updates Net Metering Policies for 2024',
    snippet: 'What homeowners need to know about the new NEM 3.0 regulations and export rates effective this month.',
    date: '1 day ago',
    url: '#',
    imageUrl: 'https://picsum.photos/seed/meter/800/600',
  },
  {
    id: '4',
    source: 'Reuters',
    title: 'Major Solar Incentives Announced for Low-Income Households',
    snippet: 'Government launches new grant program to make clean energy accessible to more communities.',
    date: '2 days ago',
    url: '#',
    imageUrl: 'https://picsum.photos/seed/roof-worker/800/600',
  },
];

// ArrowRight icon imported from @/ds/icons above

const NewsSection: React.FC = () => {
  const [featuredArticle, ...otherArticles] = NEWS_ARTICLES;

  return (
    <Section id="news-section" size="xl" tone="surface" container="wide">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--ds-color-accent)' }}>
              <Newspaper size={20} />
              <span className="text-caption" style={{ fontWeight: 'var(--ds-font-weight-bold)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ds-color-accent)' }}>In the News</span>
            </div>
            <h2 className="text-heading-2 mb-3">
              Industry News &amp; Updates
            </h2>
            <p className="text-body-large" style={{ color: 'var(--ds-color-text-muted)', maxWidth: '42rem' }}>
              Stay informed with the latest headlines from the renewable energy sector.
            </p>
          </div>

          <div className="hidden lg:block">
            <Button variant="secondary" size="md">
              <span>More News</span>
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 xl:col-span-8">
            <a
              href={featuredArticle.url}
              className="group relative block w-full min-h-[400px] rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--ds-shadow-xl)', border: '1px solid var(--ds-color-border)' }}
            >
              <div className="relative w-full min-h-[400px]">
                <Image
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 opacity-90 group-hover:opacity-80 transition-opacity" style={{ background: 'linear-gradient(to top, var(--ds-color-background) 0%, color-mix(in oklab, var(--ds-color-background) 60%, transparent) 40%, transparent 100%)' }} />

                <div className="absolute top-6 left-6">
                  <span className="ui-badge ui-badge--accent" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Featured Story
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3 text-caption" style={{ color: 'var(--ds-color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>{featuredArticle.source}</span>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--ds-color-accent)' }} />
                    <div className="flex items-center" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'none' }}>
                      <Clock size={16} style={{ marginRight: '0.375rem' }} />
                      <span>{featuredArticle.date}</span>
                    </div>
                  </div>

                  <h3 className="text-heading-2 mb-4 leading-tight group-hover:opacity-80 transition-colors">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-body-large ui-line-clamp-3 mb-6 opacity-90" style={{ maxWidth: '42rem', color: 'color-mix(in oklab, var(--ds-color-foreground-secondary) 80%, transparent)' }}>
                    {featuredArticle.snippet}
                  </p>

                  <div className="flex items-center transition-colors" style={{ color: 'var(--ds-color-foreground-secondary)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    Read Full Story
                    <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <div className="ui-card h-full overflow-hidden flex flex-col gap-2" style={{ padding: 'var(--ds-space-2)' }}>
              {otherArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  className="group flex gap-4 rounded-xl transition-all duration-200"
                  style={{ padding: 'var(--ds-space-4)', border: '1px solid transparent' }}
                >
                  <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden" style={{ background: 'var(--ds-color-background)', border: '1px solid var(--ds-color-border)' }}>
                    <Image
                      src={article.imageUrl}
                      alt=""
                      width={96}
                      height={96}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-caption truncate" style={{ fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {article.source}
                      </span>
                      <span style={{ color: 'var(--ds-color-border)', fontSize: '10px' }}>•</span>
                      <span className="text-caption">{article.date}</span>
                    </div>

                    <h3 className="text-body mb-2 leading-snug ui-line-clamp-2 group-hover:opacity-80 transition-colors" style={{ fontWeight: 'var(--ds-font-weight-bold)', color: 'var(--ds-color-foreground-secondary)' }}>
                      {article.title}
                    </h3>

                    <div className="flex items-center text-caption transition-colors" style={{ fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-accent)' }}>
                      Read More <ExternalLink size={12} style={{ marginLeft: '0.25rem' }} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-8 lg:hidden flex justify-center">
          <Button variant="secondary" size="lg">
            <span>More News</span>
            <ArrowRight size={20} />
          </Button>
        </div>

    </Section>
  );
};

export default NewsSection;

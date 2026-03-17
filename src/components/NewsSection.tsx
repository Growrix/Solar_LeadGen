"use client";

import React from 'react';
import Image from 'next/image';
import { Newspaper, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/ds';

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
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    source: 'TechCrunch',
    title: 'New Solid-State Battery Tech Could Double Storage Efficiency',
    snippet: 'Breakthrough research promises safer, longer-lasting home battery solutions for solar systems.',
    date: '5 hours ago',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    source: 'Solar Power World',
    title: 'California Updates Net Metering Policies for 2025',
    snippet: 'What homeowners need to know about the new NEM 3.0 regulations and export rates effective this year.',
    date: '1 day ago',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    source: 'Reuters',
    title: 'Major Solar Incentives Announced for Low-Income Households',
    snippet: 'Government launches new grant program to make clean energy accessible to more communities.',
    date: '2 days ago',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
  },
];

const ArrowRightLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" x2="19" y1="12" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const NewsSection: React.FC = () => {
  const [featuredArticle, ...otherArticles] = NEWS_ARTICLES;

  return (
    <section id="news-section" className="py-24 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Newspaper className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">In the News</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground-secondary mb-3 tracking-tight">
              Industry News &amp; Updates
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Stay informed with the latest headlines from the renewable energy sector.
            </p>
          </div>

          <div className="hidden lg:block">
            <Button variant="secondary" size="md">
              <span>More News</span>
              <ArrowRightLargeIcon />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 xl:col-span-8">
            <a
              href={featuredArticle.url}
              className="group relative flex w-full min-h-[400px] rounded-2xl overflow-hidden shadow-modal border border-border"
              style={{ display: 'block' }}
            >
              <div className="relative w-full" style={{ minHeight: '400px' }}>
                <Image
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-1.5 bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                    Featured Story
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                  <div className="flex items-center gap-3 text-brand-300 text-sm font-semibold uppercase tracking-wider mb-3">
                    <span>{featuredArticle.source}</span>
                    <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                    <div className="flex items-center text-muted-foreground font-normal normal-case">
                      <Clock className="w-4 h-4 mr-1.5" />
                      <span>{featuredArticle.date}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-brand-200 transition-colors">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-lg text-white/80 mb-6 max-w-2xl line-clamp-2 md:line-clamp-3">
                    {featuredArticle.snippet}
                  </p>

                  <div className="flex items-center text-white font-semibold group-hover:text-brand-400 transition-colors">
                    Read Full Story
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <div className="bg-surface rounded-2xl border border-border p-2 h-full overflow-hidden flex flex-col gap-2">
              {otherArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  className="group flex gap-4 p-4 rounded-xl hover:bg-surface-hover transition-all duration-200 border border-transparent hover:border-border"
                >
                  <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-background border border-border">
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
                      <span className="text-xs font-bold text-primary tracking-wider uppercase truncate">
                        {article.source}
                      </span>
                      <span className="text-border text-[10px]">•</span>
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-foreground-secondary mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <div className="flex items-center text-xs font-semibold text-primary group-hover:text-accent-hover transition-colors">
                      Read More <ExternalLink className="w-3 h-3 ml-1" />
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
            <ArrowRightLargeIcon />
          </Button>
        </div>

      </div>
    </section>
  );
};

export default NewsSection;

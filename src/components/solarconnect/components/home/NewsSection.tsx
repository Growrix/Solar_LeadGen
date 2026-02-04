import React from 'react';
import { Newspaper, ArrowRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { FeaturedNewsCard } from './FeaturedNewsCard';
import { NEWS_CONTENT, UI_LABELS } from '../../constants/labels';
import { Button } from '../ui/Button';

export const NewsSection: React.FC = () => {
  // Separate the first article as featured, and the rest as the list
  const [featuredArticle, ...otherArticles] = NEWS_CONTENT.articles;

  return (
    <section id="news" className="py-24 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3 text-accent">
              <Newspaper className="w-5 h-5" />
              <span className="uppercase tracking-widest text-body-small">{UI_LABELS.inTheNews}</span>
            </div>
            <h2 className="text-foreground-secondary mb-3 text-heading-1">
              {NEWS_CONTENT.headline}
            </h2>
            <p className="text-foreground max-w-2xl text-body-large">
              {NEWS_CONTENT.subheadline}
            </p>
          </div>
          
          <div className="hidden lg:block">
            <Button variant="outline">
              {NEWS_CONTENT.cta} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Layout Grid: Featured (Left) + List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Article Column */}
          <div className="lg:col-span-7 xl:col-span-8">
             <FeaturedNewsCard article={featuredArticle} />
          </div>

          {/* Sidebar List Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <div className="bg-surface rounded-2xl border border-border p-2 h-full overflow-hidden">
              <div className="flex flex-col h-full gap-2">
                {otherArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Mobile CTA */}
        <div className="mt-8 lg:hidden">
          <Button variant="secondary" fullWidth>
            {NEWS_CONTENT.cta}
          </Button>
        </div>

      </div>
    </section>
  );
};
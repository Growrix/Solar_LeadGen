import React from 'react';
import { Newspaper, ArrowRight } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { FeaturedNewsCard } from './FeaturedNewsCard';
import { NEWS_CONTENT, UI_LABELS } from '../../constants/labels';
import { Button } from '../ui/Button';
import { Grid, Section, SectionHeader, Stack } from '@/ds';

export const NewsSection: React.FC = () => {
  // Separate the first article as featured, and the rest as the list
  const [featuredArticle, ...otherArticles] = NEWS_CONTENT.articles;

  return (
    <Section id="news" className="py-24 bg-background border-t border-border">
        
        {/* Section Header */}
        <SectionHeader
          className="mb-12"
          contentClassName=""
          eyebrow={
            <>
              <Newspaper className="w-5 h-5" />
              <span className="uppercase tracking-widest text-body-small">{UI_LABELS.inTheNews}</span>
            </>
          }
          title={NEWS_CONTENT.headline}
          description={NEWS_CONTENT.subheadline}
          actionsClassName="hidden lg:block"
          actions={
            <Button variant="outline">
              {NEWS_CONTENT.cta} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          }
        />

        {/* Layout Grid: Featured (Left) + List (Right) */}
          <Grid cols={1} colsLg={12} gap="xl">
          
          {/* Featured Article Column */}
          <div className="lg:col-span-7 xl:col-span-8">
             <FeaturedNewsCard article={featuredArticle} />
          </div>

          {/* Sidebar List Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <div className="bg-surface rounded-2xl border border-border p-2 h-full overflow-hidden">
              <Stack className="h-full" gap="xs">
                {otherArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </Stack>
            </div>
          </div>

        </Grid>

        {/* Mobile CTA */}
        <div className="mt-8 lg:hidden">
          <Button variant="secondary" fullWidth>
            {NEWS_CONTENT.cta}
          </Button>
        </div>

    </Section>
  );
};
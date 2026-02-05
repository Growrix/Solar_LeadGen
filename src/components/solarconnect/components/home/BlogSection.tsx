import React from 'react';
import { BlogCard } from './BlogCard';
import { Button } from '../ui/Button';
import { BLOG_CONTENT } from '../../constants/labels';
import { ArrowRight } from 'lucide-react';
import { Grid, Section, SectionHeader } from '@/ds';

export const BlogSection: React.FC = () => {
  return (
    <Section id="resources" className="py-24 bg-background border-t border-border">
        {/* Header */}
        <SectionHeader
          className="mb-12"
          contentClassName="max-w-2xl"
          titleClassName="mb-4 tracking-tight"
          descriptionClassName="leading-relaxed"
          title={BLOG_CONTENT.sectionTitle}
          description={BLOG_CONTENT.sectionSubtitle}
          actionsClassName="hidden md:block"
          actions={
            <Button variant="outline">
              {BLOG_CONTENT.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          }
        />

        {/* Grid */}
        <Grid cols={1} colsMd={2} colsLg={3} gap="xl">
          {BLOG_CONTENT.posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </Grid>

        {/* Mobile CTA */}
        <div className="mt-10 md:hidden flex justify-center">
          <Button variant="secondary" fullWidth>
            {BLOG_CONTENT.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
    </Section>
  );
};
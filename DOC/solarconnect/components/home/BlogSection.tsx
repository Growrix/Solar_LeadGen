import React from 'react';
import { BlogCard } from './BlogCard';
import { Button } from '../ui/Button';
import { BLOG_CONTENT } from '../../constants/labels';
import { ArrowRight } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section id="resources" className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              {BLOG_CONTENT.sectionTitle}
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              {BLOG_CONTENT.sectionSubtitle}
            </p>
          </div>
          <div className="hidden md:block">
            <Button variant="outline">
              {BLOG_CONTENT.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_CONTENT.posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 md:hidden flex justify-center">
          <Button variant="secondary" fullWidth>
            {BLOG_CONTENT.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
import React from 'react';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../../types';
import { UI_LABELS } from '../../constants/labels';
import { Badge } from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

export const FeaturedNewsCard: React.FC<FeaturedNewsCardProps> = ({ article }) => {
  return (
    <a 
      href={article.url}
      className="group relative block w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-700"
    >
      {/* Background Image */}
      <img 
        src={article.imageUrl} 
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />

      {/* Badge */}
      <div className="absolute top-6 left-6">
        <Badge variant="solid" className="shadow-lg">
          {UI_LABELS.featuredStory}
        </Badge>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
        <div className="flex items-center gap-3 text-brand-300 text-sm font-semibold uppercase tracking-wider mb-3">
          <span>{article.source}</span>
          <span className="w-1 h-1 rounded-full bg-brand-500"></span>
          <div className="flex items-center text-slate-300 font-normal normal-case">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{article.date}</span>
          </div>
        </div>

        <Heading level={3} className="text-2xl md:text-4xl mb-4 leading-tight group-hover:text-brand-200 transition-colors">
          {article.title}
        </Heading>
        
        <Text variant="white" size="lg" className="mb-6 max-w-2xl line-clamp-2 md:line-clamp-3 opacity-90">
          {article.snippet}
        </Text>

        <div className="flex items-center text-white font-semibold group-hover:text-brand-400 transition-colors">
          {UI_LABELS.readFullStory} <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
};
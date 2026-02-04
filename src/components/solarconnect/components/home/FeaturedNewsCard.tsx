import React from 'react';
import Image from 'next/image';
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
      className="group relative block w-full h-full min-h-featured-news rounded-2xl overflow-hidden shadow-xl border border-border"
    >
      {/* Background Image */}
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-surface/60 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />

      {/* Badge */}
      <div className="absolute top-6 left-6">
        <Badge variant="solid" className="shadow-lg">
          {UI_LABELS.featuredStory}
        </Badge>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
        <div className="flex items-center gap-3 text-accent uppercase tracking-wider mb-3 text-body-small">
          <span>{article.source}</span>
          <span className="w-1 h-1 rounded-full bg-accent"></span>
          <div className="flex items-center text-icon normal-case">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{article.date}</span>
          </div>
        </div>

        <Heading level={3} className="mb-4 leading-tight group-hover:text-accent transition-colors">
          {article.title}
        </Heading>
        
        <Text variant="white" size="lg" className="mb-6 max-w-2xl line-clamp-2 md:line-clamp-3 opacity-90">
          {article.snippet}
        </Text>

        <div className="flex items-center text-foreground-secondary text-label group-hover:text-accent transition-colors">
          {UI_LABELS.readFullStory} <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
};
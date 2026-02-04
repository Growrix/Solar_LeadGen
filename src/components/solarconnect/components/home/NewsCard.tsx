import React from 'react';
import Image from 'next/image';
import { ExternalLink, Clock } from 'lucide-react';
import { NewsArticle } from '../../types';
import { UI_LABELS } from '../../constants/labels';
import { Text } from '../ui/Typography';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <a 
      href={article.url}
      className="group flex gap-4 p-4 rounded-xl hover:bg-surface/50 transition duration-200 border border-transparent hover:border-border"
    >
      {/* Thumbnail */}
      <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-background border border-border">
        <Image
          src={article.imageUrl}
          alt=""
          width={96}
          height={96}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-accent tracking-wider uppercase truncate text-caption">
            {article.source}
          </span>
          <span className="text-foreground-muted text-micro">•</span>
          <Text size="xs" variant="muted" className="flex items-center">
             {article.date}
          </Text>
        </div>
        
        <h3 className="text-foreground-secondary mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2 text-body">
          {article.title}
        </h3>
        
        <div className="flex items-center text-accent group-hover:text-accent transition-colors text-caption">
          {UI_LABELS.readMore} <ExternalLink className="w-3 h-3 ml-1" />
        </div>
      </div>
    </a>
  );
};
import React from 'react';
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
      className="group flex gap-4 p-4 rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-transparent hover:border-slate-600"
    >
      {/* Thumbnail */}
      <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
        <img 
          src={article.imageUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-brand-500 tracking-wider uppercase truncate">
            {article.source}
          </span>
          <span className="text-slate-600 text-[10px]">•</span>
          <Text size="xs" variant="muted" className="flex items-center">
             {article.date}
          </Text>
        </div>
        
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        <div className="flex items-center text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors">
          {UI_LABELS.readMore} <ExternalLink className="w-3 h-3 ml-1" />
        </div>
      </div>
    </a>
  );
};
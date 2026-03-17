import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { BlogPost } from '../../types';
import { UI_LABELS } from '../../constants/labels';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading, Text } from '../ui/Typography';
import { Badge } from '../ui/Badge';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Card as="article" hoverEffect className="flex flex-col overflow-hidden h-full group">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="solid" className="shadow-lg">
            {post.category}
          </Badge>
        </div>
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-4 mb-3">
          <Text size="xs" variant="muted" className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </Text>
          <Text size="xs" variant="muted" className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </Text>
        </div>

        <Heading level={3} className="mb-3 text-xl group-hover:text-brand-400 transition-colors line-clamp-2">
          {post.title}
        </Heading>
        
        <Text size="sm" className="mb-6 line-clamp-3">
          {post.excerpt}
        </Text>

        <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
          <Text size="xs" variant="muted" className="font-medium group-hover:text-slate-400 transition-colors">
            {UI_LABELS.by} {post.author}
          </Text>
          <Button variant="link" className="text-sm font-semibold group-hover:gap-2 transition-all">
            {UI_LABELS.readArticle}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
import React from 'react';
import Image from 'next/image';
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
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center gap-4 mb-3">
          <Text size="xs" variant="muted" className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </Text>
          <Text size="xs" variant="muted" className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </Text>
        </div>

        <Heading level={3} className="mb-3 group-hover:text-accent transition-colors line-clamp-2 text-body-large">
          {post.title}
        </Heading>
        
        <Text size="sm" className="mb-6 line-clamp-3">
          {post.excerpt}
        </Text>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <Text size="xs" variant="muted" className="group-hover:text-foreground transition-colors">
            {UI_LABELS.by} {post.author}
          </Text>
          <Button variant="link" className="group-hover:gap-2 transition text-body-small">
            {UI_LABELS.readArticle}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
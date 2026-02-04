import { LucideIcon } from 'lucide-react';

export interface QuoteOption {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent';
}

export interface NavItem {
  label: string;
  href: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  date: string;
  readTime: string;
  author: string;
}

export interface NewsArticle {
  id: string;
  source: string;
  title: string;
  snippet: string;
  date: string;
  url: string;
  imageUrl: string;
}
export interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export type BlogPostContentFormat = 'markdown' | 'html' | 'plaintext';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedDateLabel: string;
  readTimeLabel: string;
  categoryName: string;
  featuredImageUrl: string;
  content: string;
  contentFormat: BlogPostContentFormat;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

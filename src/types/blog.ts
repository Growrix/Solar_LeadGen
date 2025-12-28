export interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export type BlogPostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthorProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface BlogMediaAsset {
  id: string;
  url: string;
  alt?: string;
  mimeType?: string;
  bytes?: number;
}

export interface BlogPostRevision {
  id: string;
  createdAt: string; // ISO timestamp
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: 'markdown' | 'html' | 'plaintext';
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedDateLabel: string;
  readTimeLabel: string;
  categoryName: string;
  featuredImageUrl: string;
}

export interface BlogPost extends BlogPostSummary {
  status: BlogPostStatus;
  content: string;
  contentFormat: 'markdown' | 'html' | 'plaintext';
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  publishedAt?: string; // ISO timestamp
  scheduledPublishAt?: string; // ISO timestamp
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  tags?: BlogTag[];
  revisions?: BlogPostRevision[];
}

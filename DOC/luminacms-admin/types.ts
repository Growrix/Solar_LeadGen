
export type PostStatus = 'published' | 'draft' | 'scheduled';
export type CommentStatus = 'pending' | 'approved' | 'spam';
export type MediaType = 'image' | 'video' | 'document';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: PostStatus;
  publishDate: string;
  category: string;
  tags: string[];
  coverImage: string;
  views: number;
  // SEO Fields
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  title: string;
  alt: string;
  caption: string;
  size: string;
  dimensions?: string;
  type: MediaType;
  uploadedDate: string;
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  date: string;
  postId: string;
  postTitle: string;
  status: CommentStatus;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface AnalyticsData {
  name: string;
  views: number;
  likes: number;
}

export enum NavigationTab {
  Dashboard = 'dashboard',
  Posts = 'posts',
  Editor = 'editor',
  Comments = 'comments',
  Taxonomy = 'taxonomy',
  Media = 'media',
  Settings = 'settings'
}

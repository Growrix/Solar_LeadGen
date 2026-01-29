
export interface Author {
  name: string;
  avatar: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'contributor' | 'guest';
  status: 'active' | 'inactive';
  bio?: string;
  joinedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags?: string[];
  author: Author; // Kept for display compatibility
  authorId?: string; // Link to AuthorProfile
  publishedAt: string;
  readTime: string;
}

export type PostStatus = 'published' | 'draft' | 'scheduled' | 'archived' | 'needs_review' | 'rejected' | 'error';

export interface AdminPost extends BlogPost {
  status: PostStatus;
  updatedAt: string;
  folderId?: string | null;
}

export interface TrashedPost {
  id: string;
  title: string;
  previousStatus: PostStatus;
  author: string;
  trashedAt: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
  updatedAt: string;
}

export type CommentStatus = 'pending' | 'approved' | 'hidden' | 'spam';

export interface Comment {
  id: string;
  postTitle: string;
  postSlug: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  status: CommentStatus;
  submittedAt: string;
}

export type ViewState = 'loading' | 'error' | 'empty' | 'success';

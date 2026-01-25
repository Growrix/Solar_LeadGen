export type CommentStatus = 'pending' | 'approved' | 'hidden' | 'spam';

export type Comment = {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  status: CommentStatus;
  submittedAt: string;
  postTitle: string;
  postSlug: string;
};

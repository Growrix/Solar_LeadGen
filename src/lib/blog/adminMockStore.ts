export type AdminBlogStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type AdminBlogRobots = 'index,follow' | 'noindex,nofollow';

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: AdminBlogRobots;
  status: AdminBlogStatus;
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'solarmatch_admin_blog_posts_v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function ensureInitialized(): void {
  if (typeof window === 'undefined') return;
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([] satisfies AdminBlogPost[]));
}

export function listAdminBlogPosts(): AdminBlogPost[] {
  if (typeof window === 'undefined') return [];
  ensureInitialized();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<AdminBlogPost[]>(raw);
  const posts = Array.isArray(parsed) ? parsed : [];

  return posts
    .filter((p) => p && typeof p === 'object')
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export function getAdminBlogPostById(id: string): AdminBlogPost | null {
  if (typeof window === 'undefined') return null;
  return listAdminBlogPosts().find((p) => p.id === id) ?? null;
}

export type AdminBlogPostCreateInput = Omit<
  AdminBlogPost,
  'id' | 'createdAt' | 'updatedAt'
>;

export function createAdminBlogPost(input: AdminBlogPostCreateInput): AdminBlogPost {
  if (typeof window === 'undefined') {
    return {
      id: 'server',
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  }

  ensureInitialized();

  const id =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : String(Date.now());

  const createdAt = nowIso();
  const post: AdminBlogPost = {
    id,
    ...input,
    createdAt,
    updatedAt: createdAt,
  };

  const posts = listAdminBlogPosts();
  posts.unshift(post);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));

  return post;
}

export type AdminBlogPostUpdateInput = Partial<Omit<AdminBlogPost, 'id' | 'createdAt'>>;

export function updateAdminBlogPost(id: string, patch: AdminBlogPostUpdateInput): AdminBlogPost | null {
  if (typeof window === 'undefined') return null;
  ensureInitialized();

  const posts = listAdminBlogPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const updated: AdminBlogPost = {
    ...posts[idx],
    ...patch,
    updatedAt: nowIso(),
  };

  const next = [...posts];
  next[idx] = updated;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return updated;
}

export function deleteAdminBlogPost(id: string): boolean {
  if (typeof window === 'undefined') return false;
  ensureInitialized();

  const posts = listAdminBlogPosts();
  const next = posts.filter((p) => p.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.length !== posts.length;
}

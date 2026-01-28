export type AdminBlogStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type AdminBlogRobots = 'index,follow' | 'noindex,nofollow';

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readTime: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: AdminBlogRobots;
  status: AdminBlogStatus;
  scheduledFor: string;
  blogAuthorId: string | null;
  blogAuthor: null | { id: string; name: string; email: string; avatarUrl: string };
  createdAt: string;
  updatedAt: string;
};

export type AdminBlogPostCreateInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readTime: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: AdminBlogRobots;
  status: AdminBlogStatus;
  scheduledFor: string;
  blogAuthorId?: string | null;
};

export type AdminBlogPostUpdateInput = Partial<Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>>;

export type AdminBlogPostListCounts = {
  all: number;
  published: number;
  drafts: number;
};

export type AdminBlogPostListResult = {
  posts: AdminBlogPost[];
  counts: AdminBlogPostListCounts;
};

export type AdminBlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminBlogTag = {
  id: string;
  name: string;
  slug: string;
};

type AdminApiPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readTime: string;
  status: AdminBlogStatus;
  robots: AdminBlogRobots;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  category: null | { id: string; name: string; slug: string };
  tags: Array<{ id: string; name: string; slug: string }>;
  blogAuthorId?: string | null;
  blogAuthor?: null | { id: string; name: string; email: string; avatarUrl: string | null };
};

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response');
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await parseJson<{ error?: string }>(res).catch(() => null);
    const message = body?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    (err as any).status = res.status;
    throw err;
  }

  return parseJson<T>(res);
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function mapAdminApiPostToAdminBlogPost(post: AdminApiPost): AdminBlogPost {
  return {
    id: post.id,
    title: normalizeString(post.title),
    slug: normalizeString(post.slug),
    excerpt: normalizeString(post.excerpt),
    content: normalizeString(post.content),
    coverImageUrl: normalizeString(post.coverImageUrl),
    readTime: normalizeString(post.readTime),
    category: normalizeString(post.category?.name ?? ''),
    tags: Array.isArray(post.tags) ? post.tags.map((t) => normalizeString(t.name)).filter(Boolean) : [],
    seoTitle: normalizeString(post.seoTitle),
    seoDescription: normalizeString(post.seoDescription),
    ogImageUrl: normalizeString(post.ogImageUrl),
    canonicalUrl: normalizeString(post.canonicalUrl),
    robots: post.robots ?? 'index,follow',
    status: post.status ?? 'DRAFT',
    scheduledFor: normalizeString(post.scheduledFor ?? ''),
    blogAuthorId: normalizeString(post.blogAuthorId ?? '') || null,
    blogAuthor: post.blogAuthor
      ? {
          id: normalizeString(post.blogAuthor.id),
          name: normalizeString(post.blogAuthor.name),
          email: normalizeString(post.blogAuthor.email),
          avatarUrl: normalizeString(post.blogAuthor.avatarUrl ?? ''),
        }
      : null,
    createdAt: normalizeString(post.createdAt),
    updatedAt: normalizeString(post.updatedAt),
  };
}

function mapTaxonomyItem(value: any): { id: string; name: string; slug: string } {
  return {
    id: normalizeString(value?.id),
    name: normalizeString(value?.name),
    slug: normalizeString(value?.slug),
  };
}

export async function listAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const data = await requestJson<{ posts: AdminApiPost[] }>('/api/admin/blog/posts', { method: 'GET' });
  return (data.posts ?? []).map(mapAdminApiPostToAdminBlogPost);
}

export async function listAdminBlogPostsWithMeta(options?: {
  status?: AdminBlogStatus | 'ALL';
  q?: string;
}): Promise<AdminBlogPostListResult> {
  const params = new URLSearchParams();
  if (options?.status && options.status !== 'ALL') params.set('status', options.status);
  if (options?.q) params.set('q', options.q);

  const qs = params.toString();
  const url = qs ? `/api/admin/blog/posts?${qs}` : '/api/admin/blog/posts';

  const data = await requestJson<{ posts: AdminApiPost[]; counts?: Partial<AdminBlogPostListCounts> }>(url, {
    method: 'GET',
  });

  return {
    posts: (data.posts ?? []).map(mapAdminApiPostToAdminBlogPost),
    counts: {
      all: Number(data.counts?.all ?? 0),
      published: Number(data.counts?.published ?? 0),
      drafts: Number(data.counts?.drafts ?? 0),
    },
  };
}

export async function getAdminBlogPostById(id: string): Promise<AdminBlogPost | null> {
  try {
    const data = await requestJson<{ post: AdminApiPost }>(`/api/admin/blog/posts/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    return data.post ? mapAdminApiPostToAdminBlogPost(data.post) : null;
  } catch (err) {
    const status = (err as any)?.status;
    if (status === 404) return null;
    throw err;
  }
}

export async function createAdminBlogPost(input: AdminBlogPostCreateInput): Promise<AdminBlogPost> {
  const data = await requestJson<{ post: AdminApiPost }>('/api/admin/blog/posts', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      tags: input.tags ?? [],
      category: input.category ?? '',
      blogAuthorId: input.blogAuthorId ?? null,
    }),
  });

  return mapAdminApiPostToAdminBlogPost(data.post);
}

export async function updateAdminBlogPost(
  id: string,
  patch: AdminBlogPostUpdateInput
): Promise<AdminBlogPost | null> {
  try {
    const data = await requestJson<{ post: AdminApiPost }>(`/api/admin/blog/posts/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...patch,
          ...(patch.tags ? { tags: patch.tags } : {}),
          ...(patch.category !== undefined ? { category: patch.category } : {}),
          ...(patch.blogAuthorId !== undefined ? { blogAuthorId: patch.blogAuthorId } : {}),
        }),
      }
    );

    return data.post ? mapAdminApiPostToAdminBlogPost(data.post) : null;
  } catch (err) {
    const status = (err as any)?.status;
    if (status === 404) return null;
    throw err;
  }
}

export async function deleteAdminBlogPost(id: string): Promise<boolean> {
  await requestJson<{ success: boolean }>(`/api/admin/blog/posts/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return true;
}

export async function listAdminBlogCategories(): Promise<AdminBlogCategory[]> {
  const data = await requestJson<{ categories: unknown[] }>('/api/admin/blog/categories', { method: 'GET' });
  return Array.isArray(data.categories) ? data.categories.map(mapTaxonomyItem) : [];
}

export async function createAdminBlogCategory(input: { name: string }): Promise<AdminBlogCategory> {
  const data = await requestJson<{ category: unknown }>('/api/admin/blog/categories', {
    method: 'POST',
    body: JSON.stringify({ name: input.name }),
  });
  return mapTaxonomyItem(data.category);
}

export async function updateAdminBlogCategory(
  id: string,
  patch: { name: string }
): Promise<AdminBlogCategory> {
  const data = await requestJson<{ category: unknown }>(
    `/api/admin/blog/categories/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ name: patch.name }),
    }
  );
  return mapTaxonomyItem(data.category);
}

export async function deleteAdminBlogCategory(id: string): Promise<boolean> {
  await requestJson<{ success: boolean }>(`/api/admin/blog/categories/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return true;
}

export async function listAdminBlogTags(): Promise<AdminBlogTag[]> {
  const data = await requestJson<{ tags: unknown[] }>('/api/admin/blog/tags', { method: 'GET' });
  return Array.isArray(data.tags) ? data.tags.map(mapTaxonomyItem) : [];
}

export async function createAdminBlogTag(input: { name: string }): Promise<AdminBlogTag> {
  const data = await requestJson<{ tag: unknown }>('/api/admin/blog/tags', {
    method: 'POST',
    body: JSON.stringify({ name: input.name }),
  });
  return mapTaxonomyItem(data.tag);
}

export async function updateAdminBlogTag(id: string, patch: { name: string }): Promise<AdminBlogTag> {
  const data = await requestJson<{ tag: unknown }>(`/api/admin/blog/tags/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ name: patch.name }),
    }
  );
  return mapTaxonomyItem(data.tag);
}

export async function deleteAdminBlogTag(id: string): Promise<boolean> {
  await requestJson<{ success: boolean }>(`/api/admin/blog/tags/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return true;
}

export type AdminBlogAuthorStatus = 'ACTIVE' | 'INACTIVE';

export type AdminBlogAuthor = {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  status: AdminBlogAuthorStatus;
  socialLinks: unknown;
  userId: string | null;
  user: null | { id: string; name: string | null; email: string; role?: string };
  postCount: number;
  createdAt: string;
  updatedAt: string;
};

type AdminApiAuthor = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  status: AdminBlogAuthorStatus;
  socialLinks: unknown;
  userId: string | null;
  user: null | { id: string; name: string | null; email: string; role?: string };
  postCount: number;
  createdAt: string;
  updatedAt: string;
};

function normalizeAuthorStatus(value: unknown): AdminBlogAuthorStatus {
  const upper = typeof value === 'string' ? value.toUpperCase() : '';
  return upper === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

function mapAdminApiAuthorToAdminBlogAuthor(author: AdminApiAuthor): AdminBlogAuthor {
  return {
    id: normalizeString(author.id),
    name: normalizeString(author.name),
    email: normalizeString(author.email),
    bio: normalizeString(author.bio ?? ''),
    avatarUrl: normalizeString(author.avatarUrl ?? ''),
    status: normalizeAuthorStatus(author.status),
    socialLinks: author.socialLinks ?? null,
    userId: normalizeString(author.userId ?? '') || null,
    user: author.user
      ? {
          id: normalizeString(author.user.id),
          name: author.user.name ?? null,
          email: normalizeString(author.user.email),
          role: (author.user as any).role,
        }
      : null,
    postCount: Number(author.postCount ?? 0),
    createdAt: normalizeString(author.createdAt),
    updatedAt: normalizeString(author.updatedAt),
  };
}

export async function listAdminBlogAuthors(options?: {
  q?: string;
  status?: AdminBlogAuthorStatus | 'ALL';
}): Promise<{ authors: AdminBlogAuthor[]; counts: { all: number; active: number; inactive: number } }> {
  const params = new URLSearchParams();
  if (options?.q) params.set('q', options.q);
  if (options?.status && options.status !== 'ALL') params.set('status', options.status);

  const qs = params.toString();
  const url = qs ? `/api/admin/blog/authors?${qs}` : '/api/admin/blog/authors';

  const data = await requestJson<{ authors: AdminApiAuthor[]; counts?: Partial<{ all: number; active: number; inactive: number }> }>(
    url,
    { method: 'GET' }
  );

  return {
    authors: (data.authors ?? []).map(mapAdminApiAuthorToAdminBlogAuthor),
    counts: {
      all: Number(data.counts?.all ?? 0),
      active: Number(data.counts?.active ?? 0),
      inactive: Number(data.counts?.inactive ?? 0),
    },
  };
}

export async function createAdminBlogAuthor(input: {
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  status?: AdminBlogAuthorStatus;
  socialLinks?: unknown;
  userId?: string | null;
}): Promise<AdminBlogAuthor> {
  const data = await requestJson<{ author: AdminApiAuthor }>('/api/admin/blog/authors', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return mapAdminApiAuthorToAdminBlogAuthor(data.author);
}

export async function updateAdminBlogAuthor(
  id: string,
  patch: {
    name?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    status?: AdminBlogAuthorStatus;
    socialLinks?: unknown;
    userId?: string | null;
  }
): Promise<AdminBlogAuthor> {
  const data = await requestJson<{ author: AdminApiAuthor }>(
    `/api/admin/blog/authors/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(patch),
    }
  );
  return mapAdminApiAuthorToAdminBlogAuthor(data.author);
}

export async function deleteAdminBlogAuthor(id: string): Promise<boolean> {
  await requestJson<{ success: boolean }>(`/api/admin/blog/authors/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return true;
}

export type AdminBlogCommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

export type AdminBlogComment = {
  id: string;
  postId: string;
  post: { id: string; title: string; slug: string };
  authorName: string;
  authorEmail: string;
  content: string;
  status: AdminBlogCommentStatus;
  parentId: string | null;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
};

type AdminApiComment = {
  id: string;
  postId: string;
  post: { id: string; title: string; slug: string };
  authorName: string;
  authorEmail: string;
  content: string;
  status: AdminBlogCommentStatus;
  parentId: string | null;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
};

function normalizeCommentStatus(value: unknown): AdminBlogCommentStatus {
  const upper = typeof value === 'string' ? value.toUpperCase() : '';
  if (upper === 'APPROVED' || upper === 'REJECTED' || upper === 'SPAM' || upper === 'PENDING') return upper;
  return 'PENDING';
}

function mapAdminApiCommentToAdminBlogComment(comment: AdminApiComment): AdminBlogComment {
  return {
    id: normalizeString(comment.id),
    postId: normalizeString(comment.postId),
    post: {
      id: normalizeString(comment.post?.id),
      title: normalizeString(comment.post?.title),
      slug: normalizeString(comment.post?.slug),
    },
    authorName: normalizeString(comment.authorName),
    authorEmail: normalizeString(comment.authorEmail),
    content: normalizeString(comment.content),
    status: normalizeCommentStatus(comment.status),
    parentId: normalizeString(comment.parentId ?? '') || null,
    replyCount: Number(comment.replyCount ?? 0),
    createdAt: normalizeString(comment.createdAt),
    updatedAt: normalizeString(comment.updatedAt),
  };
}

export async function listAdminBlogComments(options?: {
  status?: AdminBlogCommentStatus | 'ALL';
  postId?: string;
  page?: number;
  limit?: number;
}): Promise<{
  comments: AdminBlogComment[];
  counts: { all: number; pending: number; approved: number; rejected: number; spam: number };
}> {
  const params = new URLSearchParams();
  if (options?.status && options.status !== 'ALL') params.set('status', options.status);
  if (options?.postId) params.set('postId', options.postId);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const qs = params.toString();
  const url = qs ? `/api/admin/blog/comments?${qs}` : '/api/admin/blog/comments';

  const data = await requestJson<{
    comments: AdminApiComment[];
    counts?: Partial<{ all: number; pending: number; approved: number; rejected: number; spam: number }>;
  }>(url, { method: 'GET' });

  return {
    comments: (data.comments ?? []).map(mapAdminApiCommentToAdminBlogComment),
    counts: {
      all: Number(data.counts?.all ?? 0),
      pending: Number(data.counts?.pending ?? 0),
      approved: Number(data.counts?.approved ?? 0),
      rejected: Number(data.counts?.rejected ?? 0),
      spam: Number(data.counts?.spam ?? 0),
    },
  };
}

export async function updateAdminBlogComment(
  id: string,
  patch: { status?: AdminBlogCommentStatus; content?: string; authorName?: string; authorEmail?: string }
): Promise<AdminBlogComment> {
  const data = await requestJson<{ comment: AdminApiComment }>(
    `/api/admin/blog/comments/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(patch),
    }
  );
  return mapAdminApiCommentToAdminBlogComment(data.comment);
}

export async function deleteAdminBlogComment(id: string): Promise<boolean> {
  await requestJson<{ success: boolean }>(`/api/admin/blog/comments/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  return true;
}

export async function bulkAdminBlogComments(input: {
  ids: string[];
  action: 'approve' | 'reject' | 'spam' | 'delete';
}): Promise<{ success: boolean; processed: number; notFound?: string[] }> {
  const data = await requestJson<{ success: boolean; processed: number; notFound?: string[] }>(
    '/api/admin/blog/comments/bulk',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return data;
}

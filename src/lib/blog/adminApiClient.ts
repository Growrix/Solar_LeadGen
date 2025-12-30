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
  createdAt: string;
  updatedAt: string;
};

export type AdminBlogPostCreateInput = Omit<AdminBlogPost, 'id' | 'createdAt' | 'updatedAt'>;

export type AdminBlogPostUpdateInput = Partial<Omit<AdminBlogPost, 'id' | 'createdAt'>>;

export type AdminBlogPostListCounts = {
  all: number;
  published: number;
  drafts: number;
};

export type AdminBlogPostListResult = {
  posts: AdminBlogPost[];
  counts: AdminBlogPostListCounts;
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
    createdAt: normalizeString(post.createdAt),
    updatedAt: normalizeString(post.updatedAt),
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

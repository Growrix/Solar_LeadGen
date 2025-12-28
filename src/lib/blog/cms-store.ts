import type { BlogMediaAsset, BlogPost, BlogPostRevision, BlogPostStatus, BlogTag } from '@/types/blog';

const STORAGE_KEY = 'blog_cms_posts_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function safeParsePosts(raw: string | null): BlogPost[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as BlogPost[];
  } catch {
    return [];
  }
}

export function listCmsPosts(): BlogPost[] {
  if (!isBrowser()) return [];
  return safeParsePosts(window.localStorage.getItem(STORAGE_KEY));
}

export function getCmsPostById(id: string): BlogPost | null {
  return listCmsPosts().find((p) => p.id === id) ?? null;
}

export function getCmsPostBySlug(slug: string): BlogPost | null {
  return listCmsPosts().find((p) => p.slug === slug) ?? null;
}

export function upsertCmsPost(next: BlogPost): BlogPost {
  if (!isBrowser()) return next;

  const posts = listCmsPosts();
  const existingIndex = posts.findIndex((p) => p.id === next.id);

  const updatedAt = nowIso();
  const post: BlogPost = {
    ...next,
    updatedAt,
    createdAt: next.createdAt ?? updatedAt,
    revisions: next.revisions ?? [],
  };

  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return post;
}

export function createDraftFromTemplate(template?: Partial<BlogPost>): BlogPost {
  const baseTitle = template?.title?.trim() || 'Untitled draft';
  const slug = template?.slug?.trim() || slugify(baseTitle) || `draft-${Date.now()}`;

  const createdAt = nowIso();
  const id = template?.id ?? `local:${slug}:${Date.now()}`;

  const post: BlogPost = {
    id,
    slug,
    title: baseTitle,
    excerpt: template?.excerpt ?? '',
    authorName: template?.authorName ?? 'Admin',
    publishedDateLabel: template?.publishedDateLabel ?? '',
    readTimeLabel: template?.readTimeLabel ?? '',
    categoryName: template?.categoryName ?? 'Uncategorized',
    featuredImageUrl: template?.featuredImageUrl ?? '/images/solar-panel-roof.jpg',
    status: (template?.status as BlogPostStatus) ?? 'DRAFT',
    content: template?.content ?? '',
    contentFormat: template?.contentFormat ?? 'markdown',
    seoTitle: template?.seoTitle,
    seoDescription: template?.seoDescription,
    ogImageUrl: template?.ogImageUrl,
    tags: (template?.tags as BlogTag[]) ?? [],
    createdAt,
    updatedAt: createdAt,
    publishedAt: template?.publishedAt,
    scheduledPublishAt: template?.scheduledPublishAt,
    revisions: template?.revisions ?? [],
  };

  return upsertCmsPost(post);
}

export function addRevisionSnapshot(post: BlogPost): BlogPost {
  const revision: BlogPostRevision = {
    id: `rev:${post.id}:${Date.now()}`,
    createdAt: nowIso(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    contentFormat: post.contentFormat,
  };

  return upsertCmsPost({
    ...post,
    revisions: [revision, ...(post.revisions ?? [])],
  });
}

export function restoreRevision(post: BlogPost, revisionId: string): BlogPost {
  const revision = (post.revisions ?? []).find((r) => r.id === revisionId);
  if (!revision) return post;

  return upsertCmsPost({
    ...post,
    title: revision.title,
    slug: revision.slug,
    excerpt: revision.excerpt,
    content: revision.content,
    contentFormat: revision.contentFormat,
  });
}

export function publishPostNow(post: BlogPost): BlogPost {
  const publishedAt = nowIso();
  return upsertCmsPost({
    ...post,
    status: 'PUBLISHED',
    publishedAt,
    publishedDateLabel: new Date(publishedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    scheduledPublishAt: undefined,
  });
}

export function schedulePost(post: BlogPost, scheduledIso: string): BlogPost {
  return upsertCmsPost({
    ...post,
    scheduledPublishAt: scheduledIso,
  });
}

export function applyScheduledPublishes(): void {
  if (!isBrowser()) return;
  const posts = listCmsPosts();
  const now = Date.now();

  let changed = false;
  const next = posts.map((p) => {
    if (p.status !== 'PUBLISHED' && p.scheduledPublishAt) {
      const when = Date.parse(p.scheduledPublishAt);
      if (Number.isFinite(when) && when <= now) {
        changed = true;
        const publishedAt = p.publishedAt ?? nowIso();
        return {
          ...p,
          status: 'PUBLISHED' as const,
          publishedAt,
          publishedDateLabel: new Date(publishedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          scheduledPublishAt: undefined,
        };
      }
    }
    return p;
  });

  if (changed) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

export function listMockMediaAssetsFromPosts(posts: BlogPost[]): BlogMediaAsset[] {
  const byUrl = new Map<string, BlogMediaAsset>();
  for (const post of posts) {
    const url = post.featuredImageUrl;
    if (!url) continue;
    if (!byUrl.has(url)) {
      byUrl.set(url, {
        id: `media:${url}`,
        url,
        alt: post.title,
      });
    }
  }
  return Array.from(byUrl.values());
}

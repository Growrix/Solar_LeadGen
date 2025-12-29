import 'server-only';

import type { BlogPost } from '@/types/blog';
import { allArticles } from '@/data/blogData';
import { slugify } from '@/lib/blog/slugify';

type StrapiImageLike = {
  url?: string;
  data?: {
    attributes?: {
      url?: string;
      alternativeText?: string | null;
    };
  } | null;
};

type StrapiPostAttributes = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  contentFormat?: BlogPost['contentFormat'] | null;
  authorName?: string | null;
  publishedAt?: string | null;
  publishedDateLabel?: string | null;
  readTimeLabel?: string | null;
  categoryName?: string | null;
  featuredImageUrl?: string | null;
  featuredImage?: StrapiImageLike | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  ogImage?: StrapiImageLike | null;
};

type StrapiPostEntity = {
  id?: number | string;
  attributes?: StrapiPostAttributes;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function resolveStrapiMediaUrl(strapiUrl: string, image: StrapiImageLike | undefined | null): string | null {
  const raw = image?.data?.attributes?.url ?? image?.url;
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${strapiUrl.replace(/\/$/, '')}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function toIsoDateLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function mapStrapiPost(strapiUrl: string, entity: StrapiPostEntity): BlogPost | null {
  const a = entity.attributes;
  if (!a?.slug || !a?.title) return null;

  const featuredImageUrl =
    a.featuredImageUrl ?? resolveStrapiMediaUrl(strapiUrl, a.featuredImage) ?? '/images/solar-panel-roof.jpg';
  const ogImageUrl = a.ogImageUrl ?? resolveStrapiMediaUrl(strapiUrl, a.ogImage) ?? undefined;

  const publishedAt = a.publishedAt ?? undefined;

  return {
    id: String(entity.id ?? a.slug),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? '',
    authorName: a.authorName ?? 'SolarMatch',
    publishedDateLabel: a.publishedDateLabel ?? (publishedAt ? toIsoDateLabel(publishedAt) : ''),
    readTimeLabel: a.readTimeLabel ?? '',
    categoryName: a.categoryName ?? 'Uncategorized',
    featuredImageUrl,
    content: a.content ?? '',
    contentFormat: (a.contentFormat ?? 'plaintext') as BlogPost['contentFormat'],
    seoTitle: a.seoTitle ?? undefined,
    seoDescription: a.seoDescription ?? undefined,
    ogImageUrl,
  };
}

function fallbackFromSeed(slug: string): BlogPost | null {
  const seed = allArticles.find((a) => slugify(a.title) === slug);
  if (!seed) return null;
  return {
    id: `seed:${slug}`,
    slug,
    title: seed.title,
    excerpt: seed.excerpt,
    authorName: seed.author,
    publishedDateLabel: seed.date,
    readTimeLabel: seed.readTime,
    categoryName: seed.category,
    featuredImageUrl: seed.image,
    content: seed.excerpt,
    contentFormat: 'plaintext',
    seoTitle: seed.title,
    seoDescription: seed.excerpt,
    ogImageUrl: seed.image,
  };
}

function fallbackListFromSeed(): BlogPost[] {
  return allArticles.map((seed) => {
    const slug = slugify(seed.title);
    return {
      id: `seed:${slug}`,
      slug,
      title: seed.title,
      excerpt: seed.excerpt,
      authorName: seed.author,
      publishedDateLabel: seed.date,
      readTimeLabel: seed.readTime,
      categoryName: seed.category,
      featuredImageUrl: seed.image,
      content: seed.excerpt,
      contentFormat: 'plaintext',
      seoTitle: seed.title,
      seoDescription: seed.excerpt,
      ogImageUrl: seed.image,
    };
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const strapiUrl = process.env.STRAPI_URL;

  if (!strapiUrl) {
    return fallbackFromSeed(slug);
  }

  const token = process.env.STRAPI_TOKEN;
  const url = new URL('/api/posts', strapiUrl);
  url.searchParams.set('filters[slug][$eq]', slug);
  url.searchParams.set('populate', 'featuredImage,ogImage');

  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const json = (await res.json()) as StrapiListResponse<StrapiPostEntity>;
  const entity = json.data?.[0];
  if (!entity) return null;

  return mapStrapiPost(strapiUrl, entity);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const strapiUrl = process.env.STRAPI_URL;

  if (!strapiUrl) {
    return fallbackListFromSeed();
  }

  const token = process.env.STRAPI_TOKEN;
  const url = new URL('/api/posts', strapiUrl);
  url.searchParams.set('populate', 'featuredImage,ogImage');
  url.searchParams.set('sort', 'publishedAt:desc');
  url.searchParams.set('filters[publishedAt][$notNull]', 'true');
  url.searchParams.set('pagination[pageSize]', '50');

  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return fallbackListFromSeed();
  }

  const json = (await res.json()) as StrapiListResponse<StrapiPostEntity>;
  const entities = json.data ?? [];
  const mapped = entities
    .map((entity) => mapStrapiPost(strapiUrl, entity))
    .filter((post): post is BlogPost => Boolean(post));

  return mapped.length > 0 ? mapped : fallbackListFromSeed();
}

import type { WpPost } from './types';
import { wpFetch } from './wpFetch';

export type GetWpPostsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  slug?: string;
  categoryId?: number;
  status?: 'publish' | 'draft' | 'future' | 'pending' | 'private' | 'any';
  embed?: boolean;
  revalidateSeconds?: number;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatWpDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export async function getWpPosts(options: GetWpPostsOptions = {}): Promise<WpPost[]> {
  const qs = new URLSearchParams();
  qs.set('page', String(options.page ?? 1));
  qs.set('per_page', String(options.perPage ?? 10));
  qs.set('status', options.status ?? 'publish');
  if (options.search) qs.set('search', options.search);
  if (options.slug) qs.set('slug', options.slug);
  if (typeof options.categoryId === 'number' && Number.isFinite(options.categoryId)) {
    qs.set('categories', String(Math.floor(options.categoryId)));
  }
  if (options.embed ?? true) qs.set('_embed', '1');

  const { data } = await wpFetch<WpPost[]>(`/wp/v2/posts?${qs.toString()}`, {
    next: { revalidate: options.revalidateSeconds ?? 60 },
  });
  return data;
}

export async function getWpPostBySlug(slug: string): Promise<WpPost | null> {
  const posts = await getWpPosts({ slug, perPage: 1, page: 1, status: 'publish', embed: true });
  return posts[0] ?? null;
}

export function wpPostToCard(post: WpPost): {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  link: string;
} {
  const title = stripHtml(post.title?.rendered ?? '') || 'Untitled';
  const excerptText = stripHtml(post.excerpt?.rendered ?? '');
  const contentText = stripHtml(post.content?.rendered ?? '');

  const author = post._embedded?.author?.[0]?.name ?? 'WordPress';
  const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/blog-placeholder.svg';

  return {
    title,
    excerpt: excerptText || contentText || '',
    author,
    date: formatWpDate(post.date),
    readTime: estimateReadTime(contentText || excerptText || title),
    category: 'Blog',
    image,
    slug: post.slug,
    link: post.link,
  };
}

import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import type { PublicNewsItemDetail } from '@/lib/news-engine/client';
import { buildFullUrl } from '@/lib/config/app-url';
import NewsDetailClient from './NewsDetailClient';

export const dynamic = 'force-dynamic';

function normalizeIso(value?: Date | string | null): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  try {
    return value.toISOString();
  } catch {
    return undefined;
  }
}

async function fetchPublicItem(slug: string): Promise<PublicNewsItemDetail | null> {
  const item = await prisma.newsItem.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      slug: true,
      publishedAt: true,
      category: true,
      tags: true,
      createdAt: true,
      seoTitle: true,
      seoDescription: true,
      ogImageUrl: true,
      contentHtml: true,
    },
  });

  if (!item) return null;

  return {
    id: String(item.id),
    title: String(item.title ?? ''),
    summary: String(item.summary ?? ''),
    slug: String(item.slug ?? ''),
    publishedAt: normalizeIso(item.publishedAt),
    category: String(item.category ?? ''),
    tags: Array.isArray(item.tags) ? item.tags.filter((t: any) => typeof t === 'string') : [],
    createdAt: normalizeIso(item.createdAt),
    seoTitle: item.seoTitle ?? null,
    seoDescription: item.seoDescription ?? null,
    ogImageUrl: item.ogImageUrl ?? null,
    contentHtml: typeof item.contentHtml === 'string' ? item.contentHtml : undefined,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await fetchPublicItem(params.slug);
  if (!item) {
    return {
      title: 'News',
      description: 'SolarMatch news updates.',
    };
  }

  const title = (item.seoTitle ?? '').trim() || item.title;
  const description = (item.seoDescription ?? '').trim() || item.summary || 'SolarMatch news update.';

  const ogImageUrl = item.ogImageUrl
    ? item.ogImageUrl.startsWith('http')
      ? item.ogImageUrl
      : buildFullUrl(item.ogImageUrl)
    : null;

  const ogImage = ogImageUrl ? [{ url: ogImageUrl }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/news/${item.slug}`,
      images: ogImage,
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function PublicNewsDetailPage({ params }: { params: { slug: string } }) {
  const item = await fetchPublicItem(params.slug);
  return <NewsDetailClient slug={params.slug} initialItem={item} />;
}

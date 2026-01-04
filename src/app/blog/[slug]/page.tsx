import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostDetailBySlug } from '@/lib/blog/adapter';
import BlogPostPageClient from '../post/BlogPostPageClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPostDetailBySlug(params.slug);
  if (!post) {
    return {
      title: 'Blog Post Not Found | SolarMatch',
      robots: { index: false, follow: false },
    };
  }

  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || post.excerpt;
  const ogImage = post.ogImageUrl?.trim() || post.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    robots: post.robots ? post.robots : 'index,follow',
    alternates: {
      canonical: post.canonicalUrl?.trim() || `/blog/${post.slug}`,
    },
  };
}

export default async function BlogSlugPage({ params }: PageProps) {
  const post = await getBlogPostDetailBySlug(params.slug);
  if (!post) return notFound();

  return <BlogPostPageClient initialPost={post} disableRedirect />;
}

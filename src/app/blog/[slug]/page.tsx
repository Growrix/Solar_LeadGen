import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FooterNav from '@/components/FooterNav';
import { getWpPostBySlug, getWpTagsByIds, wpPostTags } from '@/lib/wordpress/posts';
import { getWpPosts } from '@/lib/wordpress/posts';
import { getWpCategories } from '@/lib/wordpress/categories';
import BlogSidebarClient from '../BlogSidebarClient';

type BlogPostPageProps = {
  params: { slug: string };
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getWpPostBySlug(params.slug);
  if (!post) return {};

  const yoast = (post as any).yoast_head_json as
    | {
        title?: string;
        description?: string;
        og_title?: string;
        og_description?: string;
        og_image?: Array<{ url?: string }>;
      }
    | undefined;

  const title = stripHtml(post.title?.rendered ?? '');
  const description = yoast?.description ?? stripHtml(post.excerpt?.rendered ?? '');
  const ogImage = yoast?.og_image?.[0]?.url;

  return {
    title: yoast?.title ?? title,
    description,
    openGraph: {
      title: yoast?.og_title ?? yoast?.title ?? title,
      description: yoast?.og_description ?? description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostBySlugPage({ params }: BlogPostPageProps) {
  const [post, categories, recent] = await Promise.all([
    getWpPostBySlug(params.slug),
    getWpCategories({ perPage: 100, hideEmpty: true, revalidateSeconds: 300 }),
    getWpPosts({ perPage: 5, page: 1, status: 'publish', embed: false, revalidateSeconds: 60 }),
  ]);
  if (!post) notFound();

  const title = stripHtml(post.title?.rendered ?? '') || 'Untitled';
  const excerpt = stripHtml(post.excerpt?.rendered ?? '');
  const author = post._embedded?.author?.[0]?.name ?? 'WordPress';
  const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/blog-placeholder.svg';
  const date = new Date(post.date);
  const dateLabel = Number.isNaN(date.getTime())
    ? post.date
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let tags = wpPostTags(post);
  if (tags.length === 0 && Array.isArray(post.tags) && post.tags.length > 0) {
    tags = await getWpTagsByIds(post.tags);
  }

  const sidebarCategories = categories
    .map((c) => ({ id: c.id, name: c.name, count: c.count }))
    .filter((c) => c.id > 0 && c.name);

  const recentPosts = recent.map((p) => {
    const d = new Date(p.date);
    const recentDate = Number.isNaN(d.getTime())
      ? p.date
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { slug: p.slug, title: p.title?.rendered ?? '', date: recentDate };
  });

  return (
    <div className="min-h-screen flex flex-col blog-post-page-bg animate-fade-in">
      <main className="flex-grow pb-20 md:pb-0">
        <article>
          <header className="relative h-64 sm:h-80 md:h-96">
            <Image src={image} alt={title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
              <div className="max-w-3xl">
                <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 text-body-small mb-8">
                  Back to All Articles
                </Link>

                <span className="text-label text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">Blog</span>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-caption text-muted-foreground border border-border px-3 py-1 rounded-full bg-surface/30"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <h1 className="text-heading-1 sm:text-heading-1 md:text-heading-1 text-foreground mb-6 tracking-tight">{title}</h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-8 border-y border-border py-4">
                  <div className="flex items-center space-x-2">
                    <span>By {author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{dateLabel}</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none space-y-6">
                  {excerpt ? <p className="text-heading-3 text-muted-foreground">{excerpt}</p> : null}
                  <div className="text-foreground" dangerouslySetInnerHTML={{ __html: post.content?.rendered ?? '' }} />
                </div>
              </div>

              <BlogSidebarClient categories={sidebarCategories} recentPosts={recentPosts} />
            </div>
          </div>
        </article>
      </main>

      <FooterNav />
    </div>
  );
}

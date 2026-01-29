'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NewsletterSignup from '@/components/NewsletterSignup';

export type SidebarCategory = {
  id: number;
  name: string;
  count?: number;
};

export type SidebarRecentPost = {
  slug: string;
  title: string;
  date: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function BlogSidebarClient({
  categories,
  recentPosts,
}: {
  categories: SidebarCategory[];
  recentPosts: SidebarRecentPost[];
}) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category');

  return (
    <aside className="space-y-6">
      <section className="theme-card p-5">
        <h3 className="text-heading-4 text-foreground mb-4">Categories</h3>
        <div className="flex flex-col gap-2">
          <Link
            href="/blog"
            className={`rounded-xl px-3 py-2 text-body-small transition-colors ${
              !activeCategory ? 'bg-primary/10 text-primary' : 'hover:bg-surface/60 text-muted-foreground'
            }`}
          >
            All
          </Link>
          {categories.map((c) => {
            const isActive = activeCategory === String(c.id);
            return (
              <Link
                key={c.id}
                href={`/blog?category=${c.id}`}
                className={`rounded-xl px-3 py-2 text-body-small transition-colors flex items-center justify-between ${
                  isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface/60 text-muted-foreground'
                }`}
              >
                <span>{c.name}</span>
                {typeof c.count === 'number' ? <span className="text-caption opacity-80">{c.count}</span> : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="theme-card p-5">
        <h3 className="text-heading-4 text-foreground mb-4">Recent Posts</h3>
        <div className="flex flex-col gap-3">
          {recentPosts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <div className="text-body-small text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {stripHtml(p.title) || 'Untitled'}
              </div>
              <div className="text-caption text-muted-foreground mt-1">{p.date}</div>
            </Link>
          ))}
          {recentPosts.length === 0 ? <div className="text-body-small text-muted-foreground">No recent posts.</div> : null}
        </div>
      </section>

      <section className="theme-card p-5">
        <h3 className="text-heading-4 text-foreground mb-2">Newsletter</h3>
        <p className="text-body-small text-muted-foreground mb-4">Get new posts and solar updates in your inbox.</p>
        <NewsletterSignup />
      </section>
    </aside>
  );
}

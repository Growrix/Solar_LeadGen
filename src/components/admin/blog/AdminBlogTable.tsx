'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import type { BlogPost, BlogPostStatus } from '@/types/blog';
import { applyScheduledPublishes, listCmsPosts } from '@/lib/blog/cms-store';

function formatIsoDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(status: BlogPostStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PENDING_APPROVAL':
      return 'Pending';
    case 'PUBLISHED':
      return 'Published';
    case 'ARCHIVED':
      return 'Archived';
  }
}

export default function AdminBlogTable() {
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = () => {
    setLoading(true);
    setError(null);

    try {
      applyScheduledPublishes();
      setPosts(listCmsPosts());
    } catch (e) {
      console.error(e);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery]);

  const counts = useMemo(() => {
    const draft = posts.filter((p) => p.status === 'DRAFT').length;
    const scheduled = posts.filter((p) => p.status !== 'PUBLISHED' && Boolean(p.scheduledPublishAt)).length;
    const published = posts.filter((p) => p.status === 'PUBLISHED').length;
    return { draft, scheduled, published };
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Drafts</p>
            <p className="text-heading-2 text-foreground">{counts.draft}</p>
          </div>
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Scheduled</p>
            <p className="text-heading-2 text-foreground">{counts.scheduled}</p>
          </div>
          <div className="theme-card p-4">
            <p className="text-body-small text-muted-foreground mb-1">Published</p>
            <p className="text-heading-2 text-success">{counts.published}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push('/admin/blog/new')}
            variant="primary"
            className="whitespace-nowrap"
          >
            New post
          </Button>
          <Button
            onClick={refresh}
            disabled={loading}
            variant="secondary"
            className="whitespace-nowrap"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="theme-card p-4">
        <input
          type="text"
          placeholder="Search by title, slug, or category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full px-4 py-3"
        />
      </div>

      {error && (
        <div className="bg-destructive/10 shadow-neu-inset border border-destructive/30 rounded-2xl p-4">
          <p className="text-body-small text-error">{error}</p>
        </div>
      )}

      <div className="theme-card p-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-body-small text-muted-foreground">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => {
              const updated = formatIsoDate(post.updatedAt || post.createdAt);
              const scheduled = formatIsoDate(post.scheduledPublishAt);

              return (
                <div
                  key={post.id}
                  className="bg-surface rounded-2xl shadow-neu-outset p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-heading-3 text-foreground truncate">{post.title}</p>
                      <span className="text-caption text-muted-foreground">{statusLabel(post.status)}</span>
                      {post.scheduledPublishAt && post.status !== 'PUBLISHED' && (
                        <span className="text-caption text-muted-foreground">Scheduled: {scheduled}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-1">
                      <span className="text-caption text-muted-foreground">/{post.slug}</span>
                      <span className="text-caption text-muted-foreground">{post.categoryName}</span>
                      {updated && <span className="text-caption text-muted-foreground">Updated: {updated}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {post.status === 'PUBLISHED' && (
                      <Button
                        onClick={() => window.open(`/blog/${encodeURIComponent(post.slug)}`, '_blank')}
                        variant="secondary"
                        className="whitespace-nowrap"
                      >
                        View
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push(`/admin/blog/${encodeURIComponent(post.id)}`)}
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

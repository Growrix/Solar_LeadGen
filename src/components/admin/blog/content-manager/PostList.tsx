'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import type { AdminBlogStatus, AdminBlogPost } from '@/lib/blog/adminApiClient';
import { listAdminBlogPostsWithMeta } from '@/lib/blog/adminApiClient';

type StatusFilter = AdminBlogStatus | 'ALL';

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusBadgeClasses(status: AdminBlogStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-success/10 text-success border border-success/20';
    case 'DRAFT':
      return 'bg-muted/20 text-muted-foreground border border-border';
    case 'SCHEDULED':
      return 'bg-info/10 text-info border border-info/20';
    case 'ARCHIVED':
      return 'bg-warning/10 text-warning border border-warning/20';
    default:
      return 'bg-muted/20 text-muted-foreground border border-border';
  }
}

export function PostList() {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('ALL');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [posts, setPosts] = React.useState<AdminBlogPost[]>([]);
  const [counts, setCounts] = React.useState<{ all: number; published: number; drafts: number } | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminBlogPostsWithMeta({ status, q: q.trim() || undefined });
      setPosts(result.posts);
      setCounts(result.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <NeumorphicInput
            label="Search"
            placeholder="Search posts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="space-y-2">
            <label className="block text-body-small text-foreground">Status</label>
            <select
              className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {counts ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-body-small text-muted-foreground">
          <span className="px-3 py-1 rounded-xl bg-muted/20 border border-border">All: {counts.all}</span>
          <span className="px-3 py-1 rounded-xl bg-muted/20 border border-border">Published: {counts.published}</span>
          <span className="px-3 py-1 rounded-xl bg-muted/20 border border-border">Drafts: {counts.drafts}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 bg-error/10 border border-error/20 rounded-2xl p-4">
          <p className="text-body text-error">{error}</p>
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="text-body-small text-muted-foreground">
              <th className="text-left py-2 pr-3">Title</th>
              <th className="text-left py-2 pr-3">Status</th>
              <th className="text-left py-2 pr-3">Updated</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted-foreground">
                  No posts found.
                </td>
              </tr>
            ) : null}

            {posts.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-3 pr-3">
                  <div className="space-y-1">
                    <div className="text-foreground">{p.title || '(Untitled)'}</div>
                    <div className="text-body-small text-muted-foreground">/{p.slug}</div>
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl ${statusBadgeClasses(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 pr-3 text-muted-foreground">{formatDate(p.updatedAt)}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link href={`/admin/blog/${encodeURIComponent(p.id)}`} className="btn-neu px-3 py-2 text-ui">
                      Edit
                    </Link>
                    <Link
                      href={`/admin/blog/${encodeURIComponent(p.id)}/preview`}
                      className="btn-neu px-3 py-2 text-ui"
                    >
                      Preview
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import {
  listAdminBlogPosts,
  type AdminBlogPost,
  type AdminBlogStatus,
} from '@/lib/blog/adminApiClient';

function getStatusBadgeClasses(status: AdminBlogStatus): string {
  const base = 'px-3 py-1 rounded-full text-body-small';

  const map: Record<AdminBlogStatus, string> = {
    DRAFT: 'bg-surface text-muted-foreground',
    SCHEDULED: 'bg-warning text-warning-foreground',
    PUBLISHED: 'bg-success text-success-foreground',
    ARCHIVED: 'bg-surface text-muted-foreground',
  };

  return `${base} ${map[status]}`;
}

export default function AdminBlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = React.useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const next = await listAdminBlogPosts();
      setPosts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();

    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Blog Posts</h1>
          <p className="text-heading-4 text-muted-foreground">Admin blog CMS.</p>
        </div>

        <Button variant="primary" onClick={() => router.push('/admin/blog/new')}>
          Create New Post
        </Button>
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <h2 className="text-heading-4 text-foreground">Unable to load posts</h2>
              <p className="text-muted-foreground mt-2">{error}</p>
              <div className="mt-6 flex justify-center">
                <Button variant="primary" onClick={() => void refresh()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <h2 className="text-heading-4 text-foreground">Loading…</h2>
              <p className="text-muted-foreground mt-2">Fetching posts from the server.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="text-heading-4 text-foreground">No posts yet</h2>
              <p className="text-muted-foreground mt-2">
                Create your first draft to see it here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-surface shadow-neu-inset">
                  <tr>
                    <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Title</th>
                    <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-body-small text-muted-foreground">Updated</th>
                    <th className="px-6 py-4 text-right text-body-small text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-t border-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-foreground text-body">{post.title || '(Untitled)'}</div>
                        <div className="text-muted-foreground text-body-small mt-1">/{post.slug || 'slug'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClasses(post.status)}>{post.status}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-body-small">
                        {new Date(post.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="secondary"
                            className="px-4 py-2"
                            onClick={() => router.push(`/admin/blog/${post.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-4 py-2"
                            onClick={() => router.push(`/admin/blog/${post.id}/preview`)}
                          >
                            Preview
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

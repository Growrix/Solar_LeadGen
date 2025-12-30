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

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const next = await listAdminBlogPosts();
      setPosts(next);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-heading-2 text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground text-body-small mt-1">
              Admin blog CMS.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push('/admin/blog/new')}
          >
            Create New Post
          </Button>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
          {loading ? (
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
    </div>
  );
}

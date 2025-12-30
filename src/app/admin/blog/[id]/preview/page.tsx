'use client';

import React from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { getAdminBlogPostById } from '@/lib/blog/adminMockStore';

export default function AdminBlogPreviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [mounted, setMounted] = React.useState(false);
  const [post, setPost] = React.useState<ReturnType<typeof getAdminBlogPostById>>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (!id) return;
    setPost(getAdminBlogPostById(id));
  }, [mounted, id]);

  if (!mounted) return null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto bg-surface rounded-2xl shadow-neu-outset p-12 text-center">
          <h1 className="text-heading-3 text-foreground">Preview unavailable</h1>
          <p className="text-muted-foreground mt-2">This post was not found.</p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => router.push('/admin/blog')}>
              Back to Blog Posts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-heading-2 text-foreground">Preview</h1>
            <p className="text-muted-foreground text-body-small mt-1">
              Admin-only preview (mocked content).
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push(`/admin/blog/${post.id}`)}>
              Back to Edit
            </Button>
            <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
              Back to List
            </Button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
          {post.coverImageUrl ? (
            <div className="relative w-full h-72">
              <Image
                src={post.coverImageUrl}
                alt={post.title || 'Cover image'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-6 border-b border-border text-muted-foreground">
              No cover image URL set.
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-background shadow-neu-inset text-body-small text-muted-foreground border border-border">
                {post.status}
              </span>
              {post.category ? (
                <span className="px-3 py-1 rounded-full bg-background shadow-neu-inset text-body-small text-muted-foreground border border-border">
                  {post.category}
                </span>
              ) : null}
              {post.tags?.length ? (
                <span className="text-muted-foreground text-body-small">
                  Tags: {post.tags.join(', ')}
                </span>
              ) : null}
            </div>

            <h2 className="text-heading-1 text-foreground mb-4">{post.title || '(Untitled)'}</h2>

            {post.excerpt ? (
              <p className="text-heading-4 text-muted-foreground mb-8">{post.excerpt}</p>
            ) : null}

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-foreground text-body leading-relaxed">
                {post.content || 'No content yet.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

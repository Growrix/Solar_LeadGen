'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import type { BlogPost } from '@/types/blog';
import RichTextEditor from '@/components/admin/blog/RichTextEditor';
import {
  addRevisionSnapshot,
  getCmsPostById,
  publishPostNow,
  schedulePost,
  slugify,
  upsertCmsPost,
} from '@/lib/blog/cms-store';

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminBlogEditor({ postId }: { postId: string }) {
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const loaded = getCmsPostById(postId);
      if (!loaded) {
        setError('Post not found.');
        setPost(null);
      } else {
        setPost(loaded);
        setScheduleValue(toDatetimeLocalValue(loaded.scheduledPublishAt));
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load post.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const publicUrl = useMemo(() => {
    if (!post) return null;
    return `/blog/${encodeURIComponent(post.slug)}`;
  }, [post]);

  const save = () => {
    if (!post) return;
    setError(null);

    try {
      const normalizedSlug = slugify(post.slug || post.title || '');
      const next: BlogPost = {
        ...post,
        title: post.title.trim() || 'Untitled draft',
        slug: normalizedSlug || post.slug,
      };
      const saved = upsertCmsPost(next);
      setPost(saved);
      setScheduleValue(toDatetimeLocalValue(saved.scheduledPublishAt));
    } catch (e) {
      console.error(e);
      setError('Failed to save.');
    }
  };

  const saveRevision = () => {
    if (!post) return;
    setError(null);

    try {
      const saved = addRevisionSnapshot(post);
      setPost(saved);
    } catch (e) {
      console.error(e);
      setError('Failed to save revision.');
    }
  };

  const publishNow = () => {
    if (!post) return;
    setError(null);

    try {
      const saved = publishPostNow(post);
      setPost(saved);
      setScheduleValue('');
    } catch (e) {
      console.error(e);
      setError('Failed to publish.');
    }
  };

  const schedule = () => {
    if (!post) return;
    setError(null);

    const iso = fromDatetimeLocalValue(scheduleValue);
    if (!iso) {
      setError('Invalid schedule time.');
      return;
    }

    try {
      const saved = schedulePost(post, iso);
      setPost(saved);
    } catch (e) {
      console.error(e);
      setError('Failed to schedule.');
    }
  };

  if (loading) {
    return (
      <div className="theme-card p-6">
        <p className="text-body-small text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="space-y-4">
        <div className="theme-card p-6">
          <h1 className="text-heading-2 text-foreground mb-2">Blog editor</h1>
          <p className="text-body-small text-error">{error}</p>
        </div>
        <Button onClick={() => router.push('/admin/blog')} variant="secondary">
          Back to list
        </Button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-heading-2 text-foreground truncate">{post.title || 'Untitled draft'}</h1>
          <p className="text-body-small text-muted-foreground">Status: {post.status}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => router.push('/admin/blog')} variant="secondary" className="whitespace-nowrap">
            Back
          </Button>
          <Button onClick={save} variant="secondary" className="whitespace-nowrap">
            Save draft
          </Button>
          <Button onClick={saveRevision} variant="secondary" className="whitespace-nowrap">
            Save revision
          </Button>
          <Button onClick={publishNow} variant="primary" className="whitespace-nowrap">
            Publish now
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 shadow-neu-inset border border-destructive/30 rounded-2xl p-4">
          <p className="text-body-small text-error">{error}</p>
        </div>
      )}

      <div className="theme-card p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-body-small text-muted-foreground">Title</label>
            <input
              className="form-input w-full mt-2 px-4 py-3"
              placeholder="Post title"
              value={post.title}
              onChange={(e) => {
                const nextTitle = e.target.value;
                setPost((prev) => {
                  if (!prev) return prev;
                  const nextSlug = hasEditedSlug ? prev.slug : slugify(nextTitle || prev.slug);
                  return { ...prev, title: nextTitle, slug: nextSlug };
                });
              }}
            />
          </div>
          <div>
            <label className="text-body-small text-muted-foreground">Slug</label>
            <input
              className="form-input w-full mt-2 px-4 py-3"
              placeholder="post-slug"
              value={post.slug}
              onChange={(e) => {
                setHasEditedSlug(true);
                const nextSlug = e.target.value;
                setPost((prev) => (prev ? { ...prev, slug: nextSlug } : prev));
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-body-small text-muted-foreground">Excerpt</label>
          <textarea
            className="form-input w-full mt-2 px-4 py-3 resize-none"
            placeholder="Short summary shown in lists and previews"
            rows={3}
            value={post.excerpt}
            onChange={(e) => setPost((prev) => (prev ? { ...prev, excerpt: e.target.value } : prev))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-body-small text-muted-foreground">Category</label>
            <input
              className="form-input w-full mt-2 px-4 py-3"
              placeholder="Uncategorized"
              value={post.categoryName}
              onChange={(e) => setPost((prev) => (prev ? { ...prev, categoryName: e.target.value } : prev))}
            />
          </div>
          <div>
            <label className="text-body-small text-muted-foreground">Featured image URL</label>
            <input
              className="form-input w-full mt-2 px-4 py-3"
              placeholder="https://…"
              value={post.featuredImageUrl}
              onChange={(e) => setPost((prev) => (prev ? { ...prev, featuredImageUrl: e.target.value } : prev))}
            />
          </div>
        </div>

        <div>
          <label className="text-body-small text-muted-foreground">Content</label>
          <div className="mt-2">
            <RichTextEditor
              value={post.content}
              onChange={(nextHtml) =>
                setPost((prev) => (prev ? { ...prev, content: nextHtml, contentFormat: 'html' } : prev))
              }
            />
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <label className="text-body-small text-muted-foreground">Schedule publish (optional)</label>
              <input
                type="datetime-local"
                className="form-input w-full mt-2 px-4 py-3"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={schedule} variant="secondary" className="whitespace-nowrap">
                Save schedule
              </Button>
              {post.status === 'PUBLISHED' && publicUrl && (
                <Button
                  onClick={() => window.open(publicUrl, '_blank')}
                  variant="secondary"
                  className="whitespace-nowrap"
                >
                  View live
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
          <p className="text-body-small text-muted-foreground">
            Tip: After publishing, the post will appear on the public blog list in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

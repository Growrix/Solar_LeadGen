'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import {
  createAdminBlogPost,
  type AdminBlogRobots,
  type AdminBlogStatus,
} from '@/lib/blog/adminApiClient';

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readTime: string;
  category: string;
  tagsCsv: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: AdminBlogRobots;
  status: AdminBlogStatus;
  scheduledFor: string;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    readTime: '',
    category: '',
    tagsCsv: '',
    seoTitle: '',
    seoDescription: '',
    ogImageUrl: '',
    canonicalUrl: '',
    robots: 'index,follow',
    status: 'DRAFT',
    scheduledFor: '',
  });

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      const nextSlug = isSlugManuallyEdited ? prev.slug : slugify(value);
      return { ...prev, title: value, slug: nextSlug };
    });
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleResetSlugFromTitle = () => {
    setIsSlugManuallyEdited(false);
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const post = await createAdminBlogPost({
        title: form.title,
        slug: form.slug || slugify(form.title) || 'untitled',
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl,
        readTime: form.readTime,
        category: form.category,
        tags: form.tagsCsv
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        ogImageUrl: form.ogImageUrl,
        canonicalUrl: form.canonicalUrl,
        robots: form.robots,
        status: form.status,
        scheduledFor: form.scheduledFor,
      });

      router.push(`/admin/blog/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-heading-1 text-foreground mb-2">Create Draft</h1>
            <p className="text-heading-4 text-muted-foreground">Creates a new blog post in the database.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 bg-error/10 border border-error/20 rounded-2xl p-4">
            <p className="text-body text-error">{error}</p>
          </div>
        ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Title</label>
                <input
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Slug</label>
                <div className="flex gap-3">
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    className="h-12 px-4"
                    onClick={handleResetSlugFromTitle}
                    disabled={!form.title}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Excerpt</label>
                <textarea
                  className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-28"
                  value={form.excerpt}
                  onChange={(e) => onChange('excerpt', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Cover Image URL</label>
                <input
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.coverImageUrl}
                  onChange={(e) => onChange('coverImageUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Read Time</label>
                <input
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.readTime}
                  onChange={(e) => onChange('readTime', e.target.value)}
                  placeholder="e.g. 5 min read"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">Category</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.category}
                    onChange={(e) => onChange('category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">Tags (comma separated)</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.tagsCsv}
                    onChange={(e) => onChange('tagsCsv', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Status</label>
                <select
                  className="form-select w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.status}
                  onChange={(e) => onChange('status', e.target.value as AdminBlogStatus)}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Schedule Date/Time</label>
                <input
                  type="datetime-local"
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.scheduledFor}
                  onChange={(e) => onChange('scheduledFor', e.target.value)}
                />
              </div>
            </div>
          </div>

        <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Markdown Editor</label>
                <textarea
                  className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-48"
                  value={form.content}
                  onChange={(e) => onChange('content', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Preview Pane</label>
                <div className="p-4 rounded-2xl bg-background shadow-neu-inset border border-border whitespace-pre-wrap text-body text-foreground min-h-32">
                  {form.content || 'Nothing to preview yet.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">Meta Title</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.seoTitle}
                    onChange={(e) => onChange('seoTitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">OG Image URL</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.ogImageUrl}
                    onChange={(e) => onChange('ogImageUrl', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Meta Description</label>
                <textarea
                  className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-24"
                  value={form.seoDescription}
                  onChange={(e) => onChange('seoDescription', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">Canonical URL</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.canonicalUrl}
                    onChange={(e) => onChange('canonicalUrl', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-body-small text-muted-foreground mb-2">Robots</label>
                  <select
                    className="form-select w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={form.robots}
                    onChange={(e) => onChange('robots', e.target.value as AdminBlogRobots)}
                  >
                    <option value="index,follow">index,follow</option>
                    <option value="noindex,nofollow">noindex,nofollow</option>
                  </select>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import {
  getAdminBlogPostById,
  updateAdminBlogPost,
  type AdminBlogPost,
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

type AiDraft = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  readTime: string;
};

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [loaded, setLoaded] = React.useState<AdminBlogPost | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [aiTopic, setAiTopic] = React.useState('');
  const [aiKeywords, setAiKeywords] = React.useState('');
  const [aiTone, setAiTone] = React.useState('');
  const [aiAudience, setAiAudience] = React.useState('');
  const [aiCta, setAiCta] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      const post = await getAdminBlogPostById(id);
      setLoaded(post);

      if (!post) {
        setForm(null);
        return;
      }

      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        readTime: post.readTime,
        category: post.category,
        tagsCsv: (post.tags || []).join(', '),
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImageUrl: post.ogImageUrl,
        canonicalUrl: post.canonicalUrl,
        robots: post.robots,
        status: post.status,
        scheduledFor: post.scheduledFor,
      });
    })().catch(() => {
      setLoaded(null);
      setForm(null);
    });
  }, [id]);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    if (saving) return;
    setSaving(true);

    try {
      const updated = await updateAdminBlogPost(id, {
        title: form.title,
        slug: form.slug,
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

      setLoaded(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!form) return;
    if (aiLoading) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/admin/blog/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          keywords: aiKeywords,
          tone: aiTone,
          audience: aiAudience,
          cta: aiCta,
        }),
      });

      const data = (await response.json().catch(() => null)) as null | {
        error?: string;
        draft?: AiDraft;
      };

      if (!response.ok) {
        setAiError(data?.error || 'AI request failed');
        return;
      }

      const draft = data?.draft;
      if (!draft) {
        setAiError('AI response was empty');
        return;
      }

      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: draft.title || prev.title,
          excerpt: draft.excerpt || prev.excerpt,
          content: draft.content || prev.content,
          seoTitle: draft.seoTitle || prev.seoTitle,
          seoDescription: draft.seoDescription || prev.seoDescription,
          category: draft.category || prev.category,
          tagsCsv: (draft.tags && draft.tags.length ? draft.tags.join(', ') : prev.tagsCsv) || '',
          readTime: draft.readTime || prev.readTime,
        };
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (!loaded || !form) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto bg-surface rounded-2xl shadow-neu-outset p-12 text-center">
          <h1 className="text-heading-3 text-foreground">Post not found</h1>
          <p className="text-muted-foreground mt-2">This draft may have been deleted.</p>
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-heading-2 text-foreground">Edit Post</h1>
            <p className="text-muted-foreground text-body-small mt-1">ID: {loaded.id}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
              Back
            </Button>
            <Button variant="secondary" onClick={() => router.push(`/admin/blog/${loaded.id}/preview`)}>
              Preview
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Title</label>
                <input
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-body-small text-muted-foreground mb-2">Slug</label>
                <input
                  className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                  value={form.slug}
                  onChange={(e) => onChange('slug', e.target.value)}
                />
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
              <div className="p-4 rounded-2xl bg-background shadow-neu-inset border border-border">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-heading-4 text-foreground">AI Drafting</h2>
                    <p className="text-muted-foreground text-body-small mt-1">
                      Generates draft content and SEO fields (admin-only).
                    </p>
                  </div>
                  <Button variant="secondary" onClick={handleGenerateDraft} disabled={aiLoading}>
                    {aiLoading ? 'Generating…' : 'Generate'}
                  </Button>
                </div>

                {aiError ? (
                  <p className="text-body-small text-muted-foreground mt-3">{aiError}</p>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-2">Topic</label>
                    <input
                      className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Solar rebates in Australia 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-2">Keywords</label>
                    <input
                      className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="comma separated"
                    />
                  </div>
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-2">Tone</label>
                    <input
                      className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      placeholder="e.g. friendly, practical"
                    />
                  </div>
                  <div>
                    <label className="block text-body-small text-muted-foreground mb-2">Audience</label>
                    <input
                      className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                      value={aiAudience}
                      onChange={(e) => setAiAudience(e.target.value)}
                      placeholder="e.g. homeowners comparing installers"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-body-small text-muted-foreground mb-2">CTA</label>
                  <input
                    className="form-input w-full h-12 rounded-2xl shadow-neu-inset text-body px-4"
                    value={aiCta}
                    onChange={(e) => setAiCta(e.target.value)}
                    placeholder="e.g. Get a free solar quote"
                  />
                </div>
              </div>

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
    </div>
  );
}

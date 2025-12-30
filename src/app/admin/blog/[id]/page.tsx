'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { NeumorphicSelect } from '@/components/ui/neumorphic-select';
import {
  getAdminBlogPostById,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  type AdminBlogPost,
  type AdminBlogRobots,
  type AdminBlogStatus,
} from '@/lib/blog/adminApiClient';

type EditorTab = 'GENERAL' | 'SEO' | 'AI';

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

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function toDatetimeLocalValue(isoString: string): string {
  if (!isoString) return '';
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return '';

  const yyyy = dt.getFullYear();
  const mm = pad2(dt.getMonth() + 1);
  const dd = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mi = pad2(dt.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDatetimeLocalValue(localValue: string): string {
  const trimmed = localValue.trim();
  if (!trimmed) return '';
  const dt = new Date(trimmed);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString();
}

function mapPostToForm(post: AdminBlogPost): FormState {
  return {
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
    scheduledFor: toDatetimeLocalValue(post.scheduledFor),
  };
}

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [loaded, setLoaded] = React.useState<AdminBlogPost | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<EditorTab>('GENERAL');
  const [archiving, setArchiving] = React.useState(false);

  const [aiTopic, setAiTopic] = React.useState('');
  const [aiKeywords, setAiKeywords] = React.useState('');
  const [aiTone, setAiTone] = React.useState('');
  const [aiAudience, setAiAudience] = React.useState('');
  const [aiCta, setAiCta] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const post = await getAdminBlogPostById(id);
      if (cancelled) return;

      setLoaded(post);
      setForm(post ? mapPostToForm(post) : null);
      setIsSlugManuallyEdited(true);
      setActiveTab('GENERAL');
    })()
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
        setLoaded(null);
        setForm(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const nextSlug = isSlugManuallyEdited ? prev.slug : slugify(value);
      return { ...prev, title: value, slug: nextSlug };
    });
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    onChange('slug', value);
  };

  const handleResetSlugFromTitle = () => {
    setIsSlugManuallyEdited(false);
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, slug: slugify(prev.title) };
    });
  };

  const handleSave = async () => {
    if (saving) return;
    await handleSaveWithOverrides({});
  };

  const handleSaveWithOverrides = async (overrides: Partial<FormState>) => {
    setError(null);
    if (!form) return;
    if (saving) return;
    setSaving(true);

    const nextForm: FormState = { ...form, ...overrides };

    try {
      const updated = await updateAdminBlogPost(id, {
        title: nextForm.title,
        slug: nextForm.slug,
        excerpt: nextForm.excerpt,
        content: nextForm.content,
        coverImageUrl: nextForm.coverImageUrl,
        readTime: nextForm.readTime,
        category: nextForm.category,
        tags: nextForm.tagsCsv
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: nextForm.seoTitle,
        seoDescription: nextForm.seoDescription,
        ogImageUrl: nextForm.ogImageUrl,
        canonicalUrl: nextForm.canonicalUrl,
        robots: nextForm.robots,
        status: nextForm.status,
        scheduledFor: fromDatetimeLocalValue(nextForm.scheduledFor),
      });

      if (!updated) {
        setError('Post not found');
        setLoaded(null);
        setForm(null);
        return;
      }

      setLoaded(updated);
      setForm(mapPostToForm(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (archiving) return;
    setArchiving(true);
    setError(null);
    try {
      await deleteAdminBlogPost(id);
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move post to trash');
    } finally {
      setArchiving(false);
    }
  };

  const handleGenerateDraft = async () => {
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
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-surface rounded-2xl shadow-neu-outset p-12 text-center">
          <h1 className="text-heading-3 text-foreground">Loading…</h1>
          <p className="text-muted-foreground mt-2">Fetching blog post data.</p>
        </div>
      </div>
    );
  }

  if (error && (!loaded || !form)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-surface rounded-2xl shadow-neu-outset p-12 text-center">
          <h1 className="text-heading-3 text-foreground">Could not load post</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
              Back to Blog Posts
            </Button>
            <Button variant="primary" onClick={() => router.refresh()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded || !form) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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

  const permalinkPath = `/blog/${form.slug}`;
  const canSchedule = Boolean(form.scheduledFor.trim());

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Edit Post</h1>
          <p className="text-heading-4 text-muted-foreground">ID: {loaded.id}</p>
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

        {error ? (
          <div className="mb-6 bg-error/10 border border-error/20 rounded-2xl p-4">
            <p className="text-body text-error">{error}</p>
          </div>
        ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                className={`px-4 py-2 rounded-full border border-border bg-surface text-body-small shadow-neu-outset transition-colors ${
                  activeTab === 'GENERAL'
                    ? 'shadow-neu-inset text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('GENERAL')}
              >
                General
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full border border-border bg-surface text-body-small shadow-neu-outset transition-colors ${
                  activeTab === 'SEO' ? 'shadow-neu-inset text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('SEO')}
              >
                SEO
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full border border-border bg-surface text-body-small shadow-neu-outset transition-colors ${
                  activeTab === 'AI' ? 'shadow-neu-inset text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('AI')}
              >
                AI
              </button>
            </div>

            {activeTab === 'GENERAL' ? (
              <div className="space-y-5">
                <NeumorphicInput
                  label="Title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-body-small text-foreground">Slug</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <NeumorphicInput value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} />
                    <Button
                      variant="secondary"
                      className="h-12 px-5"
                      onClick={handleResetSlugFromTitle}
                      disabled={!form.title}
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="text-body-small text-muted-foreground">
                    Permalink: <span className="text-foreground">{permalinkPath}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-body-small text-foreground mb-2">Excerpt</label>
                  <textarea
                    className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-28"
                    value={form.excerpt}
                    onChange={(e) => onChange('excerpt', e.target.value)}
                  />
                </div>

                <NeumorphicInput
                  label="Cover Image URL"
                  value={form.coverImageUrl}
                  onChange={(e) => onChange('coverImageUrl', e.target.value)}
                />

                <NeumorphicInput
                  label="Read Time"
                  value={form.readTime}
                  onChange={(e) => onChange('readTime', e.target.value)}
                  placeholder="e.g. 5 min read"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeumorphicInput
                    label="Category"
                    value={form.category}
                    onChange={(e) => onChange('category', e.target.value)}
                  />
                  <NeumorphicInput
                    label="Tags (comma separated)"
                    value={form.tagsCsv}
                    onChange={(e) => onChange('tagsCsv', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-body-small text-foreground mb-2">Markdown Editor</label>
                  <textarea
                    className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-56"
                    value={form.content}
                    onChange={(e) => onChange('content', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-body-small text-foreground mb-2">Preview</label>
                  <div className="p-4 rounded-2xl bg-background shadow-neu-inset border border-border whitespace-pre-wrap text-body text-foreground min-h-32">
                    {form.content || 'Nothing to preview yet.'}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'SEO' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeumorphicInput
                    label="Meta Title"
                    value={form.seoTitle}
                    onChange={(e) => onChange('seoTitle', e.target.value)}
                  />
                  <NeumorphicInput
                    label="OG Image URL"
                    value={form.ogImageUrl}
                    onChange={(e) => onChange('ogImageUrl', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-body-small text-foreground mb-2">Meta Description</label>
                  <textarea
                    className="form-input w-full rounded-2xl shadow-neu-inset text-body px-4 py-3 h-24"
                    value={form.seoDescription}
                    onChange={(e) => onChange('seoDescription', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeumorphicInput
                    label="Canonical URL"
                    value={form.canonicalUrl}
                    onChange={(e) => onChange('canonicalUrl', e.target.value)}
                  />
                  <NeumorphicSelect
                    label="Robots"
                    value={form.robots}
                    onChange={(e) => onChange('robots', e.target.value as AdminBlogRobots)}
                  >
                    <option value="index,follow">index,follow</option>
                    <option value="noindex,nofollow">noindex,nofollow</option>
                  </NeumorphicSelect>
                </div>
              </div>
            ) : null}

            {activeTab === 'AI' ? (
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

                  {aiError ? <p className="text-body-small text-muted-foreground mt-3">{aiError}</p> : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <NeumorphicInput
                      label="Topic"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Solar rebates in Australia 2025"
                    />
                    <NeumorphicInput
                      label="Keywords"
                      value={aiKeywords}
                      onChange={(e) => setAiKeywords(e.target.value)}
                      placeholder="comma separated"
                    />
                    <NeumorphicInput
                      label="Tone"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      placeholder="e.g. friendly, practical"
                    />
                    <NeumorphicInput
                      label="Audience"
                      value={aiAudience}
                      onChange={(e) => setAiAudience(e.target.value)}
                      placeholder="e.g. homeowners comparing installers"
                    />
                  </div>

                  <NeumorphicInput
                    label="CTA"
                    value={aiCta}
                    onChange={(e) => setAiCta(e.target.value)}
                    placeholder="e.g. Get a free solar quote"
                    className="mt-4"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3">
              <Button variant="secondary" onClick={() => router.push('/admin/blog')} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSaveWithOverrides({ status: 'DRAFT', scheduledFor: '' })}
                disabled={saving}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSaveWithOverrides({ status: 'PUBLISHED', scheduledFor: '' })}
                disabled={saving}
              >
                Publish Now
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSaveWithOverrides({ status: 'SCHEDULED' })}
                disabled={saving || !canSchedule}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-outset p-6 space-y-5">
          <h2 className="text-heading-3 text-foreground">Publishing</h2>

          <NeumorphicSelect
            label="Status"
            value={form.status}
            onChange={(e) => onChange('status', e.target.value as AdminBlogStatus)}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </NeumorphicSelect>

          <NeumorphicInput
            label="Schedule Date/Time"
            type="datetime-local"
            value={form.scheduledFor}
            onChange={(e) => onChange('scheduledFor', e.target.value)}
          />

          <div className="p-4 rounded-2xl bg-background shadow-neu-inset border border-border">
            <div className="text-body-small text-muted-foreground">Permalink</div>
            <div className="text-body text-foreground mt-1">{permalinkPath}</div>
          </div>

          <Button
            variant="secondary"
            className="w-full py-3"
            onClick={() => window.open(permalinkPath, '_blank')}
            disabled={!form.slug}
          >
            View Public URL
          </Button>

          <Button
            variant="secondary"
            className="w-full py-3"
            onClick={() => router.push(`/admin/blog/${loaded.id}/preview`)}
          >
            Preview
          </Button>

          <div className="pt-2">
            <Button
              variant="secondary"
              className="w-full py-3"
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? 'Moving to Trash…' : 'Trash (Archive)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

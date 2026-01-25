'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Send,
  Archive,
  Image as ImageIcon,
  Sparkles,
  Layout,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  createAdminBlogPost,
  getAdminBlogPostById,
  updateAdminBlogPost,
  type AdminBlogPost,
  type AdminBlogPostCreateInput,
  type AdminBlogStatus,
} from '@/lib/blog/adminApiClient';
import { MediaPickerModal } from '@/components/admin/blog/shared/MediaPickerModal';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';

type ViewState = 'loading' | 'ready' | 'error' | 'not-found';

type TabKey = 'content' | 'seo' | 'scheduling' | 'ai';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDateTimeLocal(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function fromDateTimeLocal(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

function buildCreatePayload(draft: EditorDraft): AdminBlogPostCreateInput {
  return {
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    content: draft.content,
    coverImageUrl: draft.coverImageUrl,
    readTime: draft.readTime,
    category: draft.category,
    tags: draft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    ogImageUrl: draft.ogImageUrl,
    canonicalUrl: draft.canonicalUrl,
    robots: draft.robots,
    status: draft.status,
    scheduledFor: draft.scheduledFor,
  };
}

type EditorDraft = {
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  category: string;
  tags: string;
  content: string;
  readTime: string;

  status: AdminBlogStatus;
  scheduledFor: string;

  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  robots: 'index,follow' | 'noindex,nofollow';

  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

const DEFAULT_DRAFT: EditorDraft = {
  title: '',
  subtitle: '',
  slug: '',
  excerpt: '',
  coverImageUrl: '',
  category: '',
  tags: '',
  content: '',
  readTime: '5 min read',

  status: 'DRAFT',
  scheduledFor: '',

  focusKeyword: '',
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  robots: 'index,follow',

  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',
};

export function AdminPostEditorClient(props: { id?: string }) {
  const router = useRouter();
  const isNew = !props.id || props.id === 'new';

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState<TabKey>('content');

  const [draft, setDraft] = useState<EditorDraft>(DEFAULT_DRAFT);
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const [postId, setPostId] = useState<string | null>(isNew ? null : props.id ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

  const scheduleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isNew) {
        setDraft(DEFAULT_DRAFT);
        setIsSlugTouched(false);
        setViewState('ready');
        return;
      }

      setViewState('loading');
      try {
        const found = await getAdminBlogPostById(props.id as string);
        if (cancelled) return;

        if (!found) {
          setViewState('not-found');
          return;
        }

        setPostId(found.id);
        setDraft((prev) => ({
          ...prev,
          title: found.title,
          subtitle: '',
          slug: found.slug,
          excerpt: found.excerpt,
          coverImageUrl: found.coverImageUrl,
          category: found.category,
          tags: (found.tags ?? []).join(', '),
          content: found.content,
          readTime: found.readTime,
          status: found.status,
          scheduledFor: found.scheduledFor,
          seoTitle: found.seoTitle,
          seoDescription: found.seoDescription,
          ogImageUrl: found.ogImageUrl,
          canonicalUrl: found.canonicalUrl,
          robots: found.robots,
        }));
        setIsSlugTouched(true);
        setViewState('ready');
      } catch {
        if (cancelled) return;
        setViewState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isNew, props.id]);

  useEffect(() => {
    if (isSlugTouched) return;
    setDraft((prev) => {
      const nextSlug = slugify(prev.title);
      return nextSlug === prev.slug ? prev : { ...prev, slug: nextSlug };
    });
  }, [draft.title, isSlugTouched]);

  const previewHref = useMemo(() => {
    const id = postId ?? '';
    if (!id) return null;
    return `/admin/blog/${encodeURIComponent(id)}/preview`;
  }, [postId]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);

    try {
      if (isNew) {
        const created = await createAdminBlogPost(buildCreatePayload(draft));
        setPostId(created.id);
        setNotification({ message: 'Draft created', type: 'success' });
        router.replace(`/admin/blog/${encodeURIComponent(created.id)}`);
        return;
      }

      if (!postId) throw new Error('Missing post id');

      const patch: Partial<AdminBlogPost> = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        content: draft.content,
        coverImageUrl: draft.coverImageUrl,
        category: draft.category,
        tags: draft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        ogImageUrl: draft.ogImageUrl,
        canonicalUrl: draft.canonicalUrl,
        robots: draft.robots,
        readTime: draft.readTime,
        scheduledFor: draft.scheduledFor,
      };

      await updateAdminBlogPost(postId, patch);
      setNotification({ message: 'Saved', type: 'success' });
    } catch {
      setNotification({ message: 'Save failed', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [draft, isNew, postId, router]);

  const publishNow = useCallback(async () => {
    if (!postId) {
      setNotification({ message: 'Save draft first', type: 'error' });
      return;
    }

    setIsPublishing(true);
    try {
      await updateAdminBlogPost(postId, {
        status: 'PUBLISHED',
        scheduledFor: '',
      });
      setDraft((prev) => ({ ...prev, status: 'PUBLISHED', scheduledFor: '' }));
      setNotification({ message: 'Published', type: 'success' });
    } catch {
      setNotification({ message: 'Publish failed', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  }, [postId]);

  const archivePost = useCallback(async () => {
    if (!postId) return;

    setIsPublishing(true);
    try {
      await updateAdminBlogPost(postId, { status: 'ARCHIVED' });
      setDraft((prev) => ({ ...prev, status: 'ARCHIVED' }));
      setNotification({ message: 'Archived', type: 'success' });
    } catch {
      setNotification({ message: 'Archive failed', type: 'error' });
    } finally {
      setIsPublishing(false);
      setConfirmArchiveOpen(false);
    }
  }, [postId]);

  const schedulePost = useCallback(async () => {
    if (!postId) {
      setNotification({ message: 'Save draft first', type: 'error' });
      return;
    }

    if (!draft.scheduledFor) {
      setNotification({ message: 'Choose a schedule time', type: 'error' });
      scheduleInputRef.current?.focus();
      return;
    }

    setIsPublishing(true);
    try {
      await updateAdminBlogPost(postId, {
        status: 'SCHEDULED',
        scheduledFor: draft.scheduledFor,
      });
      setDraft((prev) => ({ ...prev, status: 'SCHEDULED' }));
      setNotification({ message: 'Scheduled', type: 'success' });
      setIsScheduleOpen(false);
    } catch {
      setNotification({ message: 'Schedule failed', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  }, [draft.scheduledFor, postId]);

  const statusBadge = useMemo(() => {
    const config: Record<AdminBlogStatus, { bg: string; text: string; dot: string; label: string }> = {
      DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', label: 'Draft' },
      SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Scheduled' },
      PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Published' },
      ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-500', label: 'Archived' },
    };

    const c = config[draft.status] ?? config.DRAFT;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 ${c.bg} ${c.text}`}>
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  }, [draft.status]);

  if (viewState === 'loading') {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading editor...
        </div>
      </div>
    );
  }

  if (viewState === 'not-found') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8 max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-900">Post not found</h2>
          <p className="text-slate-600 mt-2">This post may have been deleted.</p>
          <div className="mt-6">
            <Link href="/admin/blog/content-manager" className="text-solar-700 hover:underline">
              Back to Content Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-2xl">
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Could not load editor</h2>
              <p className="text-slate-600 mt-1">Please try again.</p>
              <div className="mt-6">
                <Link href="/admin/blog/content-manager" className="text-solar-700 hover:underline">
                  Back to Content Manager
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {notification && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="mt-0.5">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1">{notification.message}</div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blog/content-manager"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="w-px h-5 bg-slate-200" />
              <h1 className="text-xl font-bold text-slate-900">{isNew ? 'New Post' : 'Edit Post'}</h1>
              {statusBadge}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Media
              </button>

              {previewHref ? (
                <Link
                  href={previewHref}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              )}

              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 bg-solar-600 hover:bg-solar-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                disabled={!postId || isPublishing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>

              <button
                type="button"
                onClick={() => void publishNow()}
                disabled={!postId || isPublishing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish
              </button>

              <button
                type="button"
                onClick={() => setConfirmArchiveOpen(true)}
                disabled={!postId || isPublishing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'content', label: 'Content', icon: <Layout className="w-4 h-4" /> },
                { key: 'seo', label: 'SEO', icon: <Globe className="w-4 h-4" /> },
                { key: 'scheduling', label: 'Scheduling', icon: <Clock className="w-4 h-4" /> },
                { key: 'ai', label: 'AI', icon: <Sparkles className="w-4 h-4" /> },
              ] satisfies Array<{ key: TabKey; label: string; icon: React.ReactNode }>
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={
                  activeTab === t.key
                    ? 'inline-flex items-center gap-2 px-4 py-2 bg-solar-600 text-white rounded-lg font-medium shadow-sm'
                    : 'inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50'
                }
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'content' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                        placeholder="Add a title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
                      <input
                        type="text"
                        value={draft.slug}
                        onChange={(e) => {
                          setIsSlugTouched(true);
                          setDraft((p) => ({ ...p, slug: e.target.value }));
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none font-mono text-sm"
                        placeholder="my-post-slug"
                      />
                      <p className="text-xs text-slate-500 mt-1">Auto-generated from title until you edit it.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Excerpt</label>
                      <textarea
                        value={draft.excerpt}
                        onChange={(e) => setDraft((p) => ({ ...p, excerpt: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none min-h-[96px]"
                        placeholder="Short summary used on the listing page..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Content (HTML)</label>
                      <textarea
                        value={draft.content}
                        onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none min-h-[360px] font-mono text-sm"
                        placeholder="<h2>Heading</h2><p>Write...</p>"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">SEO</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Focus keyword</label>
                      <input
                        type="text"
                        value={draft.focusKeyword}
                        onChange={(e) => setDraft((p) => ({ ...p, focusKeyword: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                        placeholder="solar rebates"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">SEO title</label>
                      <input
                        type="text"
                        value={draft.seoTitle}
                        onChange={(e) => setDraft((p) => ({ ...p, seoTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                        placeholder="(defaults to post title)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">SEO description</label>
                      <textarea
                        value={draft.seoDescription}
                        onChange={(e) => setDraft((p) => ({ ...p, seoDescription: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none min-h-[96px]"
                        placeholder="(defaults to excerpt)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Canonical URL</label>
                      <input
                        type="text"
                        value={draft.canonicalUrl}
                        onChange={(e) => setDraft((p) => ({ ...p, canonicalUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none font-mono text-sm"
                        placeholder="https://example.com/blog/my-post"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Open Graph title</label>
                        <input
                          type="text"
                          value={draft.ogTitle}
                          onChange={(e) => setDraft((p) => ({ ...p, ogTitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                          placeholder="(optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Open Graph image</label>
                        <input
                          type="text"
                          value={draft.ogImageUrl}
                          onChange={(e) => setDraft((p) => ({ ...p, ogImageUrl: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none font-mono text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Robots</label>
                      <select
                        value={draft.robots}
                        onChange={(e) => setDraft((p) => ({ ...p, robots: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none bg-white"
                      >
                        <option value="index,follow">index,follow</option>
                        <option value="noindex,nofollow">noindex,nofollow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scheduling' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Scheduling</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={draft.status}
                        onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as AdminBlogStatus }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none bg-white"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule for</label>
                      <input
                        ref={scheduleInputRef}
                        type="datetime-local"
                        value={toDateTimeLocal(draft.scheduledFor)}
                        onChange={(e) => setDraft((p) => ({ ...p, scheduledFor: fromDateTimeLocal(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Used when status is Scheduled.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void schedulePost()}
                        disabled={!postId || isPublishing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70"
                      >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                        Confirm Schedule
                      </button>

                      <button
                        type="button"
                        onClick={() => void publishNow()}
                        disabled={!postId || isPublishing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70"
                      >
                        <Send className="w-4 h-4" />
                        Publish Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">AI</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Prototype UI surface only. Hookups can be added later.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Prompt</label>
                      <textarea
                        value={draft.focusKeyword}
                        onChange={(e) => setDraft((p) => ({ ...p, focusKeyword: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none min-h-[120px]"
                        placeholder="Write a draft about solar incentives in 2026..."
                      />
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate (stub)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Post Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={draft.category}
                      onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                      placeholder="Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tags</label>
                    <input
                      type="text"
                      value={draft.tags}
                      onChange={(e) => setDraft((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                      placeholder="Solar, Finance, Guides"
                    />
                    <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Read time</label>
                    <input
                      type="text"
                      value={draft.readTime}
                      onChange={(e) => setDraft((p) => ({ ...p, readTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
                      placeholder="5 min read"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Cover image</label>
                    {draft.coverImageUrl ? (
                      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-200">
                        <Image
                          src={draft.coverImageUrl}
                          alt="Cover"
                          fill
                          sizes="(min-width: 1024px) 30vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <div className="text-sm">No image selected</div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Choose image
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  {postId ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono">ID: {postId}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Save draft to create ID
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">Admin Editor (prototype surface)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) =>
          setDraft((p) => ({
            ...p,
            coverImageUrl: url,
            ogImageUrl: p.ogImageUrl || url,
          }))
        }
      />

      <ConfirmationModal
        isOpen={confirmArchiveOpen}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={() => void archivePost()}
        title="Archive post?"
        message="This will hide the post from public listings."
        confirmLabel="Archive"
        isDestructive={false}
        isLoading={isPublishing}
      />

      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsScheduleOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-solar-600" />
                <h3 className="text-lg font-bold text-slate-900">Schedule Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Publish at</label>
              <input
                ref={scheduleInputRef}
                type="datetime-local"
                value={toDateTimeLocal(draft.scheduledFor)}
                onChange={(e) => setDraft((p) => ({ ...p, scheduledFor: fromDateTimeLocal(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none"
              />

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void schedulePost()}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

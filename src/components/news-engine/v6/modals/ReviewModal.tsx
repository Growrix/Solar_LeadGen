'use client';

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Copy,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Target,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import type { AuditLogEntry, NewsItem } from '@/lib/ui-stubs/news-engine';
import {
  adminUpdateItem,
  adminApproveItemOgImage,
  adminCheckItemOgImage,
  adminFetchItemImageControls,
  adminFetchItemProvenance,
  adminGenerateItemOgImage,
  adminIngestItemOgImage,
  adminUpdateItemImageControls,
  type AdminItemProvenance,
} from '@/lib/news-engine/client';
import { RichHtmlEditor } from '../components/RichHtmlEditor';
import { getStatusBadgeClasses } from '../shared';

type ReviewTabV6 = 'research' | 'article' | 'preview' | 'seo' | 'history';

export function ReviewModalV6({
  isOpen,
  onClose,
  item,
  auditLogs,
  onApprove,
  onPublish,
  onUnpublish,
  onRewrite,
  onReject,
  onDelete,
  onRegenerate,
  onRestore,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: NewsItem | null;
  auditLogs?: AuditLogEntry[];
  onApprove?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onRewrite?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onRestore?: () => void;
  onSave?: () => Promise<void> | void;
}) {
  const [activeTab, setActiveTab] = React.useState<ReviewTabV6>('article');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [provenance, setProvenance] = React.useState<AdminItemProvenance | null>(null);

  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftSummary, setDraftSummary] = React.useState('');
  const [draftContentHtml, setDraftContentHtml] = React.useState('');
  const [draftCategory, setDraftCategory] = React.useState('');
  const [draftSeoTitle, setDraftSeoTitle] = React.useState('');
  const [draftSeoDescription, setDraftSeoDescription] = React.useState('');
  const [draftTagsCsv, setDraftTagsCsv] = React.useState('');

  const [requireImageApproval, setRequireImageApproval] = React.useState(true);
  const [ogImageOverride, setOgImageOverride] = React.useState('');
  const [ogImageApprovedAt, setOgImageApprovedAt] = React.useState<string | null>(null);
  const [isGeneratingOgImage, setIsGeneratingOgImage] = React.useState(false);
  const [isApprovingOgImage, setIsApprovingOgImage] = React.useState(false);
  const [isIngestingOgImage, setIsIngestingOgImage] = React.useState(false);

  const [ogImageHealth, setOgImageHealth] = React.useState<'OK' | 'BROKEN' | 'UNKNOWN'>('UNKNOWN');
  const [ogImageCheckedAt, setOgImageCheckedAt] = React.useState<string | null>(null);
  const [ogImageCheckError, setOgImageCheckError] = React.useState<string | null>(null);
  const [isCheckingOgImage, setIsCheckingOgImage] = React.useState(false);
  const lastSavedApprovalRef = React.useRef<boolean | null>(null);
  const autoIngestAttemptedRef = React.useRef<string | null>(null);
  const autoIngestInFlightRef = React.useRef(false);

  function isStableOgImageUrl(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    // Stable if it's already pointing at News Engine stored assets.
    if (trimmed.includes('news-engine/og-images/')) return true;
    // Stable if it's the app proxy route to S3 (relative URLs are expected here).
    if (trimmed.startsWith('/api/public/news-engine/s3/')) return true;
    return false;
  }

  function buildFreeImageQuery(): string {
    const tokens = [
      'solar',
      'renewable',
      (draftCategory || item?.category || '').trim(),
      (draftTitle || item?.title || '').trim(),
      ...((item?.tags ?? []).slice(0, 4)),
    ]
      .flatMap((t) => String(t || '').split(/\s+/))
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .filter((t) => t.length >= 3)
      .slice(0, 10);

    return Array.from(new Set(tokens)).join(' ');
  }

  const ingestOgImageIfNeeded = React.useCallback(async (inputUrl: string): Promise<string | null> => {
    if (!item) return null;
    const trimmed = inputUrl.trim();
    if (!trimmed) return null;
    if (isStableOgImageUrl(trimmed)) return trimmed;

    const current = (item.ogImageUrl ?? '').trim();
    if (trimmed === current && isStableOgImageUrl(current)) return trimmed;
    if (trimmed.startsWith('/')) {
      // Relative URLs cannot be ingested server-side (server expects http(s) remote fetch).
      // If it got here, it means it's not our stable proxy route.
      throw new Error('Image URL must be an absolute http(s) URL');
    }

    setIsIngestingOgImage(true);
    try {
      const res = await adminIngestItemOgImage(item.id, trimmed);
      const nextUrl = res.ogImageUrl ?? '';
      setOgImageOverride(nextUrl);
      setOgImageApprovedAt(res.ogImageApprovedAt ?? null);
      return nextUrl || null;
    } finally {
      setIsIngestingOgImage(false);
    }
  }, [item]);

  // Phase 17: Auto-ingest initial OG image URL so preview/approval does not require manual "Save to S3".
  React.useEffect(() => {
    if (!isOpen || !item) return;
    const current = (ogImageOverride || item.ogImageUrl || '').trim();
    if (!current) return;
    if (isStableOgImageUrl(current)) return;
    if (autoIngestAttemptedRef.current === item.id) return;
    if (autoIngestInFlightRef.current) return;

    autoIngestInFlightRef.current = true;

    void (async () => {
      try {
        const nextUrl = await ingestOgImageIfNeeded(current);
        if (nextUrl) {
          autoIngestAttemptedRef.current = item.id;
        }
      } catch (err) {
        // Non-blocking: operator can still override manually.
        console.warn(err);
      } finally {
        autoIngestInFlightRef.current = false;
      }
    })();
  }, [isOpen, item, ogImageOverride, ingestOgImageIfNeeded]);

  React.useEffect(() => {
    if (!isOpen || !item) return;
    setProvenance(null);
    setRequireImageApproval(true);
    setOgImageOverride(item.ogImageUrl ?? '');
    setOgImageApprovedAt(null);

    setDraftTitle(item.title ?? '');
    setDraftSummary((item.summary ?? '').trim());
    setDraftCategory((item.category ?? '').trim());
    setDraftSeoTitle((item.seoTitle ?? '').trim());
    setDraftSeoDescription((item.seoDescription ?? item.summary ?? '').trim());
    setDraftContentHtml((typeof item.contentHtml === 'string' ? item.contentHtml : '') || '');
    setDraftTagsCsv((item.tags ?? []).join(', '));

    setOgImageHealth('UNKNOWN');
    setOgImageCheckedAt(null);
    setOgImageCheckError(null);
    lastSavedApprovalRef.current = null;
  }, [isOpen, item]);

  React.useEffect(() => {
    if (!isOpen || !item) return;
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const [prov, img] = await Promise.all([
          adminFetchItemProvenance(item.id),
          adminFetchItemImageControls(item.id),
        ]);
        if (cancelled) return;
        setProvenance(prov);
        setRequireImageApproval(Boolean(img.ogImageApprovalRequired));
        setOgImageOverride(img.ogImageUrl ?? '');
        setOgImageApprovedAt(img.ogImageApprovedAt ?? null);
        setOgImageHealth(img.ogImageLastCheckStatus ?? 'UNKNOWN');
        setOgImageCheckedAt(img.ogImageLastCheckedAt ?? null);
        setOgImageCheckError(img.ogImageLastCheckError ?? null);
        lastSavedApprovalRef.current = Boolean(img.ogImageApprovalRequired);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, item]);

  React.useEffect(() => {
    if (!item) return;
    if (lastSavedApprovalRef.current === null) return;
    if (lastSavedApprovalRef.current === requireImageApproval) return;

    const nextValue = requireImageApproval;
    lastSavedApprovalRef.current = nextValue;

    void (async () => {
      try {
        await adminUpdateItemImageControls(item.id, { ogImageApprovalRequired: nextValue });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to persist approval requirement';
        console.error(msg);
      }
    })();
  }, [item, requireImageApproval]);

  const modelProfileLabelByTask = React.useMemo(() => {
    const map: Record<string, string> = {};
    const stages = provenance?.stages ?? [];
    for (const s of stages) {
      const task = s.taskType || '';
      if (!task) continue;
      const label = s.modelProfileLabel ?? s.model ?? '';
      if (label) map[task] = label;
    }
    return map;
  }, [provenance]);

  if (!isOpen || !item) return null;

  const logsForItem = (auditLogs ?? [])
    .filter((l) => l.itemId === item.id)
    .slice()
    .sort((a, b) => {
      const at = Date.parse(a.timestamp);
      const bt = Date.parse(b.timestamp);
      return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
    });

  const promptUsed = logsForItem.find((l) => typeof l.promptUsed === 'string' && l.promptUsed.trim())?.promptUsed ?? '';

  function extractUrls(text: string): string[] {
    if (!text) return [];
    const matches = text.match(/https?:\/\/[^\s)\]]+/g) ?? [];
    const unique = new Set<string>();
    for (const m of matches) {
      const cleaned = m.replace(/[\.,;:]+$/, '');
      if (cleaned) unique.add(cleaned);
    }
    return Array.from(unique);
  }

  const sourceUrls = extractUrls(promptUsed);

  const provenanceSources = provenance?.sources?.length ? provenance.sources : null;

  const rssEntryUrls = provenanceSources
    ? provenanceSources.filter((s) => s.kind === 'RSS').map((s) => s.url)
    : (provenance?.rssEntryUrls?.length ? provenance.rssEntryUrls : []);

  const researchUrls = provenanceSources
    ? provenanceSources.filter((s) => s.kind !== 'RSS').map((s) => s.url)
    : (provenance?.researchUrls?.length ? provenance.researchUrls : sourceUrls);

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function openMany(urls: string[]) {
    const unique = Array.from(new Set(urls.filter(Boolean)));
    if (!unique.length) return;
    const safeCount = Math.min(unique.length, 12);
    const confirmText =
      unique.length > 5
        ? `Open ${safeCount} sources in new tabs? (Showing first ${safeCount} of ${unique.length})`
        : `Open ${unique.length} sources in new tabs?`;
    if (!window.confirm(confirmText)) return;
    for (const u of unique.slice(0, safeCount)) {
      try {
        window.open(u, '_blank', 'noopener,noreferrer');
      } catch {
        // ignore
      }
    }
  }

  const researchUsedLabel = (() => {
    const hasRss = item.sourceType === 'RSS Feed';
    const hasWeb = sourceUrls.length > 0;
    if (hasRss && hasWeb) return 'RSS + Web';
    if (hasRss && !hasWeb) return 'RSS only';
    if (!hasRss && hasWeb) return 'Web only';
    return 'Trend';
  })();

  const modelProfilesByStage: Array<{ stage: string; label: string }> = [
    { stage: 'research_deep', label: '—' },
    { stage: 'research_fast', label: '—' },
    { stage: 'draft_longform', label: item.aiModel || '—' },
    { stage: 'rewrite', label: '—' },
    { stage: 'seo', label: '—' },
    { stage: 'dedup_semantic', label: '—' },
    { stage: 'image_prompt', label: '—' },
    { stage: 'image_generate', label: '—' },
  ];

  function htmlToPlainText(html: string): string {
    const raw = html.trim();
    if (!raw) return '';
    try {
      const doc = new DOMParser().parseFromString(raw, 'text/html');
      return (doc.body?.textContent ?? '').trim();
    } catch {
      return raw;
    }
  }

  const htmlForCounts = draftContentHtml?.trim()
    ? draftContentHtml
    : (typeof item.contentHtml === 'string' ? item.contentHtml : '');

  const articleText = htmlForCounts.trim()
    ? htmlToPlainText(htmlForCounts)
    : (draftSummary || item.summary || '').trim();

  const wordCount = articleText ? articleText.split(/\s+/).filter(Boolean).length : 0;
  const readMins = Math.max(1, Math.round(wordCount / 200));

  function formatRelative(tsIso: string): string {
    const ms = Date.parse(tsIso);
    if (!Number.isFinite(ms)) return '';
    const diffMs = Date.now() - ms;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const isPublished = item.status === 'PUBLISHED';
  const isRejected = item.status === 'REJECTED';

  const isManualEntry = item.sourceType === 'Manual Entry';
  const articleTabLabel = isManualEntry ? 'Article' : 'Generated Article';

  const draftTags = draftTagsCsv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const effectiveOgUrl = (ogImageOverride || item.ogImageUrl || '').trim();

  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: ReviewTabV6;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 text-body border-b-2 ${
        activeTab === id
          ? 'border-accent text-brand-accent bg-surface'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const confidenceBadgeClasses =
    item.relevanceScore > 90
      ? 'bg-success text-success-foreground border border-success/20'
      : 'bg-warning text-warning-foreground border border-warning/20';

  const historyEvents = logsForItem.slice(0, 12).map((log) => {
    const icon = log.action.includes('publish')
      ? <Globe size={16} />
      : log.action.includes('schedule')
        ? <Clock size={16} />
        : log.action.includes('ai')
          ? <Zap size={16} />
          : <History size={16} />;

    return {
      time: formatRelative(log.timestamp) || log.timestamp,
      action: log.action,
      user: log.origin,
      icon,
    };
  });

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-background w-full max-w-6xl h-full max-h-[92vh] rounded-[32px] shadow-neu-outset flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <header className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center text-background shadow-neu-outset">
              <Zap size={28} fill="currentColor" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={getStatusBadgeClasses(item.status)}>{item.status}</span>
                <span
                  className={`flex items-center gap-1.5 text-body-small px-2.5 py-1 rounded-full uppercase tracking-widest ${confidenceBadgeClasses}`}
                >
                  <CheckCircle2 size={12} />
                  {item.relevanceScore}% AI Confidence
                </span>
              </div>
              <h2 className="text-heading-2 text-foreground tracking-tight">{item.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full"
            aria-label="Close review"
          >
            <X size={24} />
          </button>
        </header>

        <nav className="flex px-4 border-b border-border bg-background overflow-x-auto no-scrollbar">
          <TabButton id="research" label="Research Summary" icon={<BookOpen size={18} />} />
          <TabButton id="article" label={articleTabLabel} icon={<FileText size={18} />} />
          <TabButton id="preview" label="Preview" icon={<Globe size={18} />} />
          <TabButton id="seo" label="SEO & Compliance" icon={<ShieldCheck size={18} />} />
          <TabButton id="history" label="Version History" icon={<History size={18} />} />
        </nav>

        <div className="flex-1 overflow-y-auto bg-surface">
          {isLoading ? (
            <div className="p-12 space-y-8 animate-pulse">
              <div className="h-8 bg-background rounded w-1/3" />
              <div className="space-y-4">
                <div className="h-4 bg-background rounded w-full" />
                <div className="h-4 bg-background rounded w-full" />
                <div className="h-4 bg-background rounded w-2/3" />
              </div>
              <div className="h-48 bg-background rounded-2xl w-full" />
            </div>
          ) : (
            <div className="p-10 max-w-4xl mx-auto">
              {activeTab === 'preview' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <div className="text-body-small text-muted-foreground uppercase tracking-widest">
                      {(draftCategory || '').trim() || 'Category'}
                    </div>

                    <h1 className="text-heading-1 text-foreground tracking-tight">
                      {draftTitle.trim() || 'Title goes here'}
                    </h1>

                    {draftSummary.trim() ? (
                      <p className="text-body text-muted-foreground">{draftSummary.trim()}</p>
                    ) : null}

                    {draftTags.length ? (
                      <div className="flex flex-wrap gap-2">
                        {draftTags.slice(0, 10).map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 bg-surface text-foreground rounded-full text-body-small uppercase tracking-wider border border-border"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {effectiveOgUrl ? (
                      <div className="rounded-2xl border border-border overflow-hidden bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={effectiveOgUrl}
                          alt=""
                          className="w-full h-auto block"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="border-t border-border pt-6">
                      {(draftContentHtml || '').trim() ? (
                        <div
                          className="prose prose-neutral prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: draftContentHtml }}
                        />
                      ) : (
                        <p className="text-body text-muted-foreground">No article content yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'article' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <div className="space-y-2">
                      <label className="text-body-small text-muted-foreground uppercase tracking-widest">Headline</label>
                      <input
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full text-heading-1 text-foreground bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-body-small text-muted-foreground uppercase tracking-widest">Summary</label>
                        <textarea
                          value={draftSummary}
                          onChange={(e) => setDraftSummary(e.target.value)}
                          className="w-full h-28 px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0 resize-none"
                          placeholder="Short summary used on listing and SEO."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-body-small text-muted-foreground uppercase tracking-widest">Category</label>
                        <input
                          type="text"
                          value={draftCategory}
                          onChange={(e) => setDraftCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0"
                          placeholder={item.category || 'e.g. Policy, Market, Technology'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-body-small text-muted-foreground uppercase tracking-widest">Article Body</label>
                      <RichHtmlEditor
                        initialHtml={draftContentHtml}
                        onHtmlChange={setDraftContentHtml}
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-8 border-t border-border">
                      <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                        <Clock size={14} /> {readMins} min read
                      </div>
                      <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                        <FileText size={14} /> {wordCount} words
                      </div>
                      <div className="ml-auto text-body-small text-brand-accent bg-surface px-3 py-1 rounded-full">
                        Curated by {item.aiModel}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'research' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-heading-3 text-foreground">Provenance</h3>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <span className="text-body-small text-muted-foreground uppercase tracking-widest">
                          Research used: {researchUsedLabel}
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset"
                          onClick={() => {
                            const all = Array.from(new Set([...rssEntryUrls, ...researchUrls].filter(Boolean)));
                            void (async () => {
                              const ok = await copyToClipboard(all.join('\n'));
                              window.alert(ok ? 'Sources copied to clipboard.' : 'Failed to copy sources.');
                            })();
                          }}
                          disabled={!rssEntryUrls.length && !researchUrls.length}
                          title="Copy all recorded source URLs"
                        >
                          <Copy size={14} />
                          Copy sources
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset"
                          onClick={() => openMany([...rssEntryUrls, ...researchUrls])}
                          disabled={!rssEntryUrls.length && !researchUrls.length}
                          title="Open sources (may open multiple tabs)"
                        >
                          <ExternalLink size={14} />
                          Open all
                        </button>
                      </div>
                    </div>

                    {!provenanceSources ? (
                      <div className="p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-body text-foreground">Details view is URL-only</p>
                        <p className="text-body-small text-muted-foreground mt-1">
                          This item does not yet have enriched provenance rows.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-body text-foreground">Details view is enriched (Phase 4)</p>
                        <p className="text-body-small text-muted-foreground mt-1">
                          Kind/title/timestamp are server-supplied and persisted from source rows.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">
                          {provenanceSources ? 'Sources' : 'URLs used'}
                        </p>
                        <div className="space-y-2">
                          {provenanceSources ? (
                            <div className="p-3 rounded-xl bg-surface border border-border">
                              <p className="text-body-small text-muted-foreground">Sources (server)</p>
                              <div className="mt-2 space-y-2">
                                {provenanceSources.slice(0, 12).map((s) => (
                                  <a
                                    key={`${s.kind}:${s.url}`}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block p-2 rounded-lg bg-background border border-border hover:bg-surface"
                                    title={s.timestamp ? new Date(s.timestamp).toLocaleString() : undefined}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-surface text-body-small text-muted-foreground uppercase tracking-widest">
                                        {s.kind}
                                      </span>
                                      <span className="text-body-small text-muted-foreground">
                                        {s.timestamp ? formatRelative(s.timestamp) : ''}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-body text-foreground truncate">{(s.title || s.url).trim()}</div>
                                    <div className="mt-0.5 text-body-small text-muted-foreground truncate">{s.url}</div>
                                  </a>
                                ))}
                                {provenanceSources.length > 12 ? (
                                  <p className="text-body-small text-muted-foreground">Showing first 12 of {provenanceSources.length} sources.</p>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          <div className="p-3 rounded-xl bg-surface border border-border">
                            <p className="text-body-small text-muted-foreground">RSS entry URLs</p>
                            {rssEntryUrls.length ? (
                              <div className="mt-2 space-y-1">
                                {rssEntryUrls.slice(0, 8).map((u) => (
                                  <a
                                    key={u}
                                    href={u}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-body-small text-brand-accent hover:underline truncate"
                                  >
                                    {u}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-body text-foreground">—</p>
                            )}
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border">
                            <p className="text-body-small text-muted-foreground">Research URLs</p>
                            {researchUrls.length ? (
                              <div className="mt-2 space-y-1">
                                {researchUrls.slice(0, 8).map((u) => (
                                  <a
                                    key={u}
                                    href={u}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-body-small text-brand-accent hover:underline truncate"
                                  >
                                    {u}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-body text-foreground">—</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">Model profile (label only)</p>
                        <div className="grid grid-cols-1 gap-2">
                          {modelProfilesByStage.map((row) => (
                            <div
                              key={row.stage}
                              className="flex items-center justify-between gap-4 px-4 py-2 rounded-xl bg-surface border border-border"
                            >
                              <span className="text-body text-foreground">{row.stage}</span>
                              <span className="text-body-small text-muted-foreground">{modelProfileLabelByTask[row.stage] ?? row.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                        <Target size={20} className="text-brand-accent" />
                        Verified Sources
                      </h3>
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">
                        {researchUrls.length ? `Sources (${researchUrls.length})` : 'No sources recorded'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {researchUrls.length ? (
                        researchUrls.slice(0, 6).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-5 rounded-2xl border border-border bg-background hover:border-accent/40 group flex items-center justify-between shadow-neu-outset"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-muted-foreground group-hover:text-brand-accent group-hover:bg-surface-hover transition-colors shrink-0">
                                <ExternalLink size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-body text-foreground truncate">{url}</p>
                                <p className="text-body-small text-muted-foreground mt-0.5 truncate">From generation prompt</p>
                              </div>
                            </div>
                            <CheckCircle2 size={20} className="text-success shrink-0" />
                          </a>
                        ))
                      ) : (
                        <div className="p-6 rounded-2xl border border-border bg-background shadow-neu-outset">
                          <p className="text-body text-muted-foreground">
                            No research citations are attached to this item yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <h3 className="text-heading-3 text-foreground">Research Extraction Log</h3>
                    <div className="space-y-4">
                      {[
                        item.sourceType ? `Source type: ${item.sourceType}` : null,
                        item.category ? `Category: ${item.category}` : null,
                        item.tags?.length ? `Tags: ${item.tags.join(', ')}` : null,
                        item.aiModel ? `Model: ${item.aiModel}` : null,
                        logsForItem.length ? `Audit events: ${logsForItem.length}` : null,
                      ]
                        .filter(Boolean)
                        .map((fact, idx) => (
                          <div key={String(fact)} className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border">
                            <div className="w-6 h-6 rounded-full bg-accent text-background flex items-center justify-center text-body-small shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-body text-foreground leading-relaxed">{String(fact)}</p>
                          </div>
                        ))}
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === 'seo' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-background p-6 rounded-2xl border border-border shadow-neu-outset space-y-4">
                      <div className="flex items-center gap-2">
                        <Search size={18} className="text-brand-accent" />
                        <span className="text-body-small text-muted-foreground uppercase tracking-widest">Search Metadata</span>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Target Keyword</label>
                          <div className="px-3 py-2 bg-surface border border-border rounded-xl text-body text-brand-accent">
                            {draftTags[0] || draftCategory || item.category || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Tags</label>
                          <input
                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0"
                            value={draftTagsCsv}
                            onChange={(e) => setDraftTagsCsv(e.target.value)}
                            placeholder={(item.tags ?? []).length ? (item.tags ?? []).join(', ') : 'e.g. Solar, Policy, Market'}
                          />
                          <p className="text-body-small text-muted-foreground">
                            Comma-separated. Saved as <span className="font-mono">tags[]</span>.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">SEO Title</label>
                          <input
                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0"
                            value={draftSeoTitle}
                            onChange={(e) => setDraftSeoTitle(e.target.value)}
                            placeholder={item.title}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Meta Description</label>
                          <textarea
                            className="w-full h-24 px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0 resize-none"
                            value={draftSeoDescription}
                            onChange={(e) => setDraftSeoDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-background p-6 rounded-2xl border border-border shadow-neu-outset space-y-4">
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-success" />
                        <span className="text-body-small text-muted-foreground uppercase tracking-widest">Compliance & Quality</span>
                      </div>
                      <div className="p-4 rounded-xl bg-surface border border-border">
                        <p className="text-body text-foreground">Planned / Not available yet</p>
                        <p className="text-body-small text-muted-foreground mt-1">
                          Automated compliance scanning is not implemented in this expansion cycle.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background p-6 rounded-2xl border border-border shadow-neu-outset space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">Image controls</p>
                        <p className="text-body text-foreground">OG Image</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-body-small uppercase tracking-widest ${
                            ogImageHealth === 'OK'
                              ? 'bg-success text-success-foreground border-success/20'
                              : ogImageHealth === 'BROKEN'
                                ? 'bg-destructive text-destructive-foreground border-destructive/20'
                                : 'bg-surface text-muted-foreground border-border'
                          }`}
                          title={
                            ogImageCheckedAt
                              ? `Last checked: ${new Date(ogImageCheckedAt).toLocaleString()}${ogImageCheckError ? `; Error: ${ogImageCheckError}` : ''}`
                              : 'Not checked yet'
                          }
                        >
                          <ImageIcon size={14} />
                          {isCheckingOgImage ? 'CHECKING' : ogImageHealth}
                        </div>

                        <button
                          type="button"
                          disabled={isCheckingOgImage || !effectiveOgUrl}
                          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body-small text-foreground hover:bg-surface-hover shadow-neu-outset disabled:opacity-50"
                          onClick={() => {
                            if (!effectiveOgUrl) return;
                            void (async () => {
                              setIsCheckingOgImage(true);
                              try {
                                const res = await adminCheckItemOgImage(item.id);
                                if (res.ogImageUrl != null) setOgImageOverride(res.ogImageUrl);
                                setOgImageHealth(res.status);
                                setOgImageCheckedAt(res.checkedAt);
                                setOgImageCheckError(res.error ?? null);
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'Failed to check OG image';
                                window.alert(msg);
                              } finally {
                                setIsCheckingOgImage(false);
                              }
                            })();
                          }}
                          title="Server-side OG image check (persisted)"
                        >
                          <RefreshCcw size={16} />
                          Re-check
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={isGeneratingOgImage}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body-small text-foreground hover:bg-surface-hover shadow-neu-outset disabled:opacity-50"
                        onClick={() => {
                          void (async () => {
                            setIsGeneratingOgImage(true);
                            try {
                              const res = await adminGenerateItemOgImage(item.id);
                              setOgImageOverride(res.ogImageUrl ?? '');
                              setOgImageApprovedAt(res.ogImageApprovedAt ?? null);
                              if (res.notice && String(res.notice).trim()) {
                                window.alert(String(res.notice).trim());
                              }
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Failed to generate OG image';
                              window.alert(msg);
                            } finally {
                              setIsGeneratingOgImage(false);
                            }
                          })();
                        }}
                      >
                        <Zap size={16} />
                        {isGeneratingOgImage ? 'Generating…' : 'Generate AI image'}
                      </button>

                      <button
                        type="button"
                        disabled={isIngestingOgImage}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body-small text-foreground hover:bg-surface-hover shadow-neu-outset disabled:opacity-50"
                        onClick={() => {
                          if (!item) return;
                          void (async () => {
                            setIsIngestingOgImage(true);
                            try {
                              const e2eOverride = (process.env.NEXT_PUBLIC_NEWS_ENGINE_E2E_FREE_IMAGE_URL || '').trim();
                              let imageUrl = e2eOverride;

                              if (!imageUrl) {
                                const q = buildFreeImageQuery();
                                const response = await fetch(
                                  `/api/admin/news-engine/free-image/unsplash?q=${encodeURIComponent(q || 'solar')}`
                                );
                                const body = (await response.json().catch(() => null)) as any;
                                if (!response.ok) {
                                  throw new Error(String(body?.error || 'Failed to find a free image'));
                                }
                                imageUrl = String(body?.imageUrl || '').trim();
                                if (!imageUrl) throw new Error('Free image search returned no image URL');
                              }

                              const res = await adminIngestItemOgImage(item.id, imageUrl);
                              setOgImageOverride(res.ogImageUrl ?? '');
                              setOgImageApprovedAt(res.ogImageApprovedAt ?? null);
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Failed to fetch a free-source image';
                              window.alert(msg);
                            } finally {
                              setIsIngestingOgImage(false);
                            }
                          })();
                        }}
                        title="Find and ingest a free image via Unsplash"
                      >
                        <Search size={16} />
                        {isIngestingOgImage ? 'Fetching…' : 'Find free image'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">Current preview</p>
                        <div className="w-full aspect-[16/9] rounded-2xl border border-border bg-surface overflow-hidden flex items-center justify-center">
                          {(ogImageOverride || item.ogImageUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ogImageOverride || item.ogImageUrl || ''}
                              alt="OG preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-body text-muted-foreground">No OG image set</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <p className="text-body text-foreground">Approval status</p>
                            <p className="text-body-small text-muted-foreground">
                              {ogImageApprovedAt ? `Approved ${new Date(ogImageApprovedAt).toLocaleString()}` : 'Not approved yet'}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isApprovingOgImage || !(ogImageOverride || item.ogImageUrl)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset disabled:opacity-50"
                            onClick={() => {
                              void (async () => {
                                setIsApprovingOgImage(true);
                                try {
                                  const effectiveUrl = (ogImageOverride || item.ogImageUrl || '').trim();
                                  if (!effectiveUrl) {
                                    throw new Error('Cannot approve: ogImageUrl is not set');
                                  }

                                  let urlToPersist: string | null = effectiveUrl;

                                  // Prefer ingesting to stable storage, but do not block approval if the host
                                  // is fetchable by the browser yet blocks server-side ingestion.
                                  if (!isStableOgImageUrl(effectiveUrl) && !effectiveUrl.startsWith('/')) {
                                    try {
                                      urlToPersist = await ingestOgImageIfNeeded(effectiveUrl);
                                    } catch {
                                      urlToPersist = effectiveUrl;
                                    }
                                  }

                                  const updatePayload: { ogImageApprovalRequired: boolean; ogImageUrl?: string | null } = {
                                    ogImageApprovalRequired: requireImageApproval,
                                  };
                                  if (urlToPersist != null) updatePayload.ogImageUrl = urlToPersist;

                                  await adminUpdateItemImageControls(item.id, updatePayload);
                                  const res = await adminApproveItemOgImage(item.id);
                                  setOgImageApprovedAt(res.ogImageApprovedAt ?? null);
                                } catch (err) {
                                  const msg = err instanceof Error ? err.message : 'Failed to approve OG image';
                                  window.alert(msg);
                                } finally {
                                  setIsApprovingOgImage(false);
                                }
                              })();
                            }}
                          >
                            <CheckSquare size={14} />
                            {isApprovingOgImage ? 'Approving…' : 'Approve OG Image'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <p className="text-body text-foreground">Require approval before publish</p>
                            <p className="text-body-small text-muted-foreground">This setting is persisted and enforced on publish paths.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRequireImageApproval((v) => !v)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                              requireImageApproval ? 'bg-accent' : 'bg-surface'
                            }`}
                            aria-label="Toggle image approval requirement"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                                requireImageApproval ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Override image URL</label>
                          <input
                            value={ogImageOverride}
                            onChange={(e) => setOgImageOverride(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                          />
                          <button
                            type="button"
                            disabled={isIngestingOgImage || !ogImageOverride.trim()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset disabled:opacity-50"
                            onClick={() => {
                              if (!item) return;
                              void (async () => {
                                try {
                                  await ingestOgImageIfNeeded(ogImageOverride);
                                } catch (err) {
                                  const msg = err instanceof Error ? err.message : 'Failed to save OG image';
                                  window.alert(msg);
                                }
                              })();
                            }}
                          >
                            <Save size={14} />
                            {isIngestingOgImage ? 'Saving…' : 'Save to S3'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'history' ? (
                <div className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset animate-in fade-in duration-500">
                  <div className="space-y-8">
                    {historyEvents.length ? historyEvents.map((log, idx) => (
                      <div key={`${log.action}-${log.time}`} className="flex gap-6 relative group">
                        {idx !== historyEvents.length - 1 ? (
                          <div className="absolute left-6 top-10 w-px h-12 bg-border group-hover:bg-accent/30 transition-colors" />
                        ) : null}
                        <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground group-hover:text-brand-accent group-hover:bg-surface-hover z-10">
                          {log.icon}
                        </div>
                        <div className="pt-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-body text-foreground">{log.action}</p>
                            <span className="text-body-small text-muted-foreground uppercase tracking-widest">{log.time}</span>
                          </div>
                          <p className="text-body-small text-muted-foreground mt-1 uppercase tracking-widest">Triggered by: {log.user}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-body text-muted-foreground">No audit history recorded for this item yet.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <footer className="px-8 py-6 border-t border-border bg-background flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isRejected ? (
              <button
                type="button"
                onClick={onRestore}
                className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground bg-surface hover:bg-surface-hover rounded-2xl uppercase tracking-widest"
              >
                <ArrowRight size={16} />
                Restore to Draft
              </button>
            ) : (
              <button
                type="button"
                onClick={onReject}
                className="px-6 py-3 text-body-small text-destructive hover:bg-destructive/10 rounded-2xl uppercase tracking-widest border border-transparent hover:border-destructive/20"
              >
                Reject
              </button>
            )}

            {isRejected ? (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground bg-surface hover:bg-surface-hover rounded-2xl uppercase tracking-widest"
              >
                <RefreshCcw size={16} />
                Regenerate
              </button>
            ) : (
              <button
                type="button"
                onClick={onRewrite}
                className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground bg-surface hover:bg-surface-hover rounded-2xl uppercase tracking-widest"
              >
                <RefreshCcw size={16} />
                Request Rewrite
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              className="px-6 py-3 text-body-small text-destructive hover:bg-destructive/10 rounded-2xl uppercase tracking-widest border border-transparent hover:border-destructive/20"
            >
              {isRejected ? 'Delete Permanently' : 'Delete'}
            </button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  if (!item) return;
                  setIsSaving(true);
                  try {
                    await adminUpdateItem(item.id, {
                      title: draftTitle.trim(),
                      summary: draftSummary.trim(),
                      contentHtml: draftContentHtml,
                      category: draftCategory.trim(),
                      tags: draftTags,
                      seoTitle: draftSeoTitle.trim() ? draftSeoTitle.trim() : null,
                      seoDescription: draftSeoDescription.trim() ? draftSeoDescription.trim() : null,
                    });
                    const resolvedOgUrl = ogImageOverride.trim()
                      ? await ingestOgImageIfNeeded(ogImageOverride)
                      : null;
                    await adminUpdateItemImageControls(item.id, {
                      ogImageUrl: resolvedOgUrl,
                      ogImageApprovalRequired: requireImageApproval,
                    });
                    await onSave?.();
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Failed to save';
                    window.alert(msg);
                  } finally {
                    setIsSaving(false);
                  }
                })();
              }}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground border border-border rounded-2xl hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => {
                void (async () => {
                  if (!item) return;
                  setIsSaving(true);
                  try {
                    await adminUpdateItem(item.id, {
                      title: draftTitle.trim(),
                      summary: draftSummary.trim(),
                      contentHtml: draftContentHtml,
                      category: draftCategory.trim(),
                      tags: draftTags,
                      seoTitle: draftSeoTitle.trim() ? draftSeoTitle.trim() : null,
                      seoDescription: draftSeoDescription.trim() ? draftSeoDescription.trim() : null,
                    });
                    const resolvedOgUrl = ogImageOverride.trim()
                      ? await ingestOgImageIfNeeded(ogImageOverride)
                      : null;
                    await adminUpdateItemImageControls(item.id, {
                      ogImageUrl: resolvedOgUrl,
                      ogImageApprovalRequired: requireImageApproval,
                    });
                    await onSave?.();
                    onPublish?.();
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Failed to publish';
                    window.alert(msg);
                  } finally {
                    setIsSaving(false);
                  }
                })();
              }}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 text-body-small rounded-2xl uppercase tracking-widest ${
                'text-brand-accent bg-surface border border-border hover:bg-surface-hover active:scale-95'
              }`}
            >
              <Globe size={18} />
              {isPublished ? 'Republish Now' : 'Publish Now'}
            </button>

            {isPublished ? (
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Unpublish this post? It will be moved back to Draft and removed from public pages.')) {
                    return;
                  }

                  void (async () => {
                    if (!item) return;
                    setIsSaving(true);
                    try {
                      await adminUpdateItem(item.id, {
                        title: draftTitle.trim(),
                        summary: draftSummary.trim(),
                        contentHtml: draftContentHtml,
                        category: draftCategory.trim(),
                        tags: draftTags,
                        seoTitle: draftSeoTitle.trim() ? draftSeoTitle.trim() : null,
                        seoDescription: draftSeoDescription.trim() ? draftSeoDescription.trim() : null,
                      });
                      const resolvedOgUrl = ogImageOverride.trim()
                        ? await ingestOgImageIfNeeded(ogImageOverride)
                        : null;
                      await adminUpdateItemImageControls(item.id, {
                        ogImageUrl: resolvedOgUrl,
                        ogImageApprovalRequired: requireImageApproval,
                      });
                      onUnpublish?.();
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Failed to unpublish';
                      window.alert(msg);
                    } finally {
                      setIsSaving(false);
                    }
                  })();
                }}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground border border-border rounded-2xl hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              >
                <XCircle size={18} />
                Unpublish
              </button>
            ) : null}

            <button
              type="button"
              onClick={onApprove}
              className="flex items-center gap-2 px-10 py-3 bg-foreground text-background rounded-2xl text-body-small shadow-neu-outset hover:opacity-90 active:scale-[0.98] uppercase tracking-[0.1em]"
            >
              Approve for Scheduling
              <ArrowRight size={18} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

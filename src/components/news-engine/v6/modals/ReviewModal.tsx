'use client';

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  History,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Target,
  X,
  Zap,
} from 'lucide-react';
import type { AuditLogEntry, NewsItem } from '@/lib/ui-stubs/news-engine';
import { getStatusBadgeClasses } from '../shared';

type ReviewTabV6 = 'research' | 'article' | 'seo' | 'history';

export function ReviewModalV6({
  isOpen,
  onClose,
  item,
  auditLogs,
  onApprove,
  onPublish,
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
  onRewrite?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onRestore?: () => void;
  onSave?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<ReviewTabV6>('article');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [requireImageApproval, setRequireImageApproval] = React.useState(true);
  const [ogImageOverride, setOgImageOverride] = React.useState('');

  React.useEffect(() => {
    if (!isOpen || !item) return;
    setRequireImageApproval(true);
    setOgImageOverride(item.ogImageUrl ?? '');
  }, [isOpen, item]);

  React.useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

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

  const articleText =
    typeof item.contentHtml === 'string' && item.contentHtml.trim()
      ? htmlToPlainText(item.contentHtml)
      : (item.summary ?? '').trim();

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
          <TabButton id="article" label="Generated Article" icon={<FileText size={18} />} />
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
              {activeTab === 'article' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <div className="space-y-2">
                      <label className="text-body-small text-muted-foreground uppercase tracking-widest">Headline</label>
                      <input
                        type="text"
                        defaultValue={item.title}
                        className="w-full text-heading-1 text-foreground bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-body-small text-muted-foreground uppercase tracking-widest">Article Body</label>
                      <textarea
                        className="w-full h-[500px] text-body text-foreground leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none"
                        defaultValue={articleText || item.summary || ''}
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
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">
                        Research used: {researchUsedLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">URLs used</p>
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-surface border border-border">
                            <p className="text-body-small text-muted-foreground">RSS entry URLs</p>
                            <p className="text-body text-foreground">—</p>
                          </div>
                          <div className="p-3 rounded-xl bg-surface border border-border">
                            <p className="text-body-small text-muted-foreground">Research URLs</p>
                            {sourceUrls.length ? (
                              <div className="mt-2 space-y-1">
                                {sourceUrls.slice(0, 8).map((u) => (
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
                              <span className="text-body-small text-muted-foreground">{row.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-border p-4">
                      <p className="text-body-small text-muted-foreground">Backend hooks required (list only):</p>
                      <ul className="mt-2 space-y-1">
                        <li className="text-body-small text-muted-foreground">- Fetch provenance fields for an item</li>
                        <li className="text-body-small text-muted-foreground">- Fetch per-stage model profile labels</li>
                      </ul>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                        <Target size={20} className="text-brand-accent" />
                        Verified Sources
                      </h3>
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">
                        {sourceUrls.length ? `Sources (${sourceUrls.length})` : 'No sources recorded'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sourceUrls.length ? (
                        sourceUrls.slice(0, 6).map((url) => (
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
                            {(item.tags && item.tags[0]) || item.category || '—'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Meta Description</label>
                          <textarea
                            className="w-full h-24 px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0 resize-none"
                            defaultValue={(item.seoDescription ?? item.summary ?? '').trim()}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-background p-6 rounded-2xl border border-border shadow-neu-outset space-y-4">
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-success" />
                        <span className="text-body-small text-muted-foreground uppercase tracking-widest">Compliance & Quality</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: 'Fact Consistency', status: 'Not evaluated' },
                          { label: 'Plagiarism Scan', status: 'Not evaluated' },
                          { label: 'Tone', status: 'Not evaluated' },
                          { label: 'Hallucination Check', status: 'Not evaluated' },
                        ].map((c) => (
                          <div key={c.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-body text-muted-foreground">{c.label}</span>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-body-small uppercase tracking-widest">
                              <CheckSquare size={12} />
                              {c.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-background p-6 rounded-2xl border border-border shadow-neu-outset space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-body-small text-muted-foreground uppercase tracking-widest">Image controls</p>
                        <p className="text-body text-foreground">OG Image</p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body-small text-muted-foreground cursor-not-allowed"
                      >
                        <Zap size={16} />
                        Generate AI image
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
                            <p className="text-body text-foreground">Require approval before publish</p>
                            <p className="text-body-small text-muted-foreground">UI-only toggle; publishing enforcement is backend-owned.</p>
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
                          <p className="text-body-small text-muted-foreground">
                            Backend hooks required to persist `ogImageUrl` + approval flag.
                          </p>
                        </div>

                        <div className="bg-surface rounded-xl border border-border p-4">
                          <p className="text-body-small text-muted-foreground">Backend hooks required (list only):</p>
                          <ul className="mt-2 space-y-1">
                            <li className="text-body-small text-muted-foreground">- Trigger image generation</li>
                            <li className="text-body-small text-muted-foreground">- Persist ogImageUrl + approval flag</li>
                          </ul>
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
                setIsSaving(true);
                onSave?.();
                window.setTimeout(() => setIsSaving(false), 1000);
              }}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground border border-border rounded-2xl hover:bg-surface shadow-neu-outset active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={onPublish}
              disabled={isPublished}
              className={`flex items-center gap-2 px-6 py-3 text-body-small rounded-2xl uppercase tracking-widest ${
                isPublished
                  ? 'bg-surface text-muted-foreground cursor-not-allowed border border-border'
                  : 'text-brand-accent bg-surface border border-border hover:bg-surface-hover active:scale-95'
              }`}
            >
              <Globe size={18} />
              {isPublished ? 'Already Published' : 'Publish Now'}
            </button>

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

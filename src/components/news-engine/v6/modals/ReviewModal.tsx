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
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { getStatusBadgeClasses } from '../shared';

type ReviewTabV6 = 'research' | 'article' | 'seo' | 'history';

export function ReviewModalV6({
  isOpen,
  onClose,
  item,
  onApprove,
  onPublish,
  onRewrite,
  onReject,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: NewsItem | null;
  onApprove?: () => void;
  onPublish?: () => void;
  onRewrite?: () => void;
  onReject?: () => void;
  onSave?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<ReviewTabV6>('article');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isPublished = item.status === 'PUBLISHED';

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

  const verifiedSources = [
    { name: 'Nature Electronics', ref: 'REF-6A1C2F' },
    { name: 'Reuters Tech', ref: 'REF-8B3D11' },
    { name: 'IEEE Spectrum', ref: 'REF-29F0AD' },
    { name: 'SemiEngineering', ref: 'REF-1C9E44' },
  ];

  const extractionFacts = [
    'Identified core breakthrough in Silicon-Photonics integration.',
    'Verified energy efficiency claims against historical data.',
    'Detected related patent filing from Global Innovation Hub.',
    'Fact-checked Dr. Elena Vance’s professional affiliation.',
  ];

  const historyEvents = [
    { time: '12m ago', action: 'Draft Finalized', user: item.aiModel, icon: <CheckCircle2 size={16} /> },
    { time: '14m ago', action: 'Fact Verification Success', user: 'System Agent', icon: <ShieldCheck size={16} /> },
    { time: '18m ago', action: 'Research Extraction Complete', user: 'System Agent', icon: <BookOpen size={16} /> },
    { time: '22m ago', action: 'Source Ingestion', user: 'RSS Feed', icon: <RefreshCcw size={16} /> },
  ];

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
                        defaultValue={`${item.summary}\n\nSilicon-based photonics is undergoing a massive transformation as hyperscale data centers reach the limits of electrical copper interconnects. By integrating laser arrays directly onto CMOS wafers, throughput can scale to 800G and beyond without the thermal bottleneck traditional systems face.\n\n\"We are seeing a convergence of optical physics and high-volume semiconductor manufacturing,\" says Lead Researcher Dr. Elena Vance. This development is expected to slash latency for large-scale AI training clusters by as much as 35% within the next 24 months.`}
                      />
                    </div>

                    <div className="flex items-center gap-6 pt-8 border-t border-border">
                      <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                        <Clock size={14} /> 4 min read
                      </div>
                      <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                        <FileText size={14} /> 542 words
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
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                        <Target size={20} className="text-brand-accent" />
                        Verified Sources
                      </h3>
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">Cross-verified (4/4)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {verifiedSources.map((source) => (
                        <div
                          key={source.ref}
                          className="p-5 rounded-2xl border border-border bg-background hover:border-accent/40 group flex items-center justify-between shadow-neu-outset"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-muted-foreground group-hover:text-brand-accent group-hover:bg-surface-hover transition-colors">
                              <ExternalLink size={18} />
                            </div>
                            <div>
                              <p className="text-body text-foreground">{source.name}</p>
                              <p className="text-body-small text-muted-foreground mt-0.5">Reference_ID: {source.ref}</p>
                            </div>
                          </div>
                          <CheckCircle2 size={20} className="text-success" />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset space-y-6">
                    <h3 className="text-heading-3 text-foreground">Research Extraction Log</h3>
                    <div className="space-y-4">
                      {extractionFacts.map((fact, idx) => (
                        <div key={fact} className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border">
                          <div className="w-6 h-6 rounded-full bg-accent text-background flex items-center justify-center text-body-small shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-body text-foreground leading-relaxed">{fact}</p>
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
                          <div className="px-3 py-2 bg-surface border border-border rounded-xl text-body text-brand-accent">Silicon Photonics AI</div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-body-small text-muted-foreground uppercase tracking-widest">Meta Description</label>
                          <textarea
                            className="w-full h-24 px-3 py-2 bg-surface border border-border rounded-xl text-body text-foreground focus:ring-0 resize-none"
                            defaultValue="Explore how new silicon-based laser arrays are achieving 400Gbps transmission speeds, potentially slashing cloud latency and energy consumption by 40%."
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
                          { label: 'Fact Consistency', status: 'Passed' },
                          { label: 'Plagiarism Scan', status: 'Passed (0%)' },
                          { label: 'Tone: Journalistic', status: 'Verified' },
                          { label: 'Hallucination Check', status: 'Passed' },
                        ].map((c) => (
                          <div key={c.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-body text-muted-foreground">{c.label}</span>
                            <div className="flex items-center gap-1.5 text-success text-body-small uppercase tracking-widest">
                              <CheckSquare size={12} />
                              {c.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'history' ? (
                <div className="bg-background p-8 rounded-[32px] border border-border shadow-neu-outset animate-in fade-in duration-500">
                  <div className="space-y-8">
                    {historyEvents.map((log, idx) => (
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
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <footer className="px-8 py-6 border-t border-border bg-background flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReject}
              className="px-6 py-3 text-body-small text-destructive hover:bg-destructive/10 rounded-2xl uppercase tracking-widest border border-transparent hover:border-destructive/20"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onRewrite}
              className="flex items-center gap-2 px-6 py-3 text-body-small text-foreground bg-surface hover:bg-surface-hover rounded-2xl uppercase tracking-widest"
            >
              <RefreshCcw size={16} />
              Request Rewrite
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

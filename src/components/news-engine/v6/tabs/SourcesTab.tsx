'use client';

import React from 'react';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Hash,
  Layers,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import type { NewsEngineState } from '@/lib/ui-stubs/news-engine';
import type { useSavedIndicator } from '../shared';
import { formatRelativeTime } from '../shared';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type ResearchId = 'web' | 'social' | 'journals';

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;

  sourcesSaved: SavedIndicator;

  setEditingSourceId: (next: string | null) => void;
  setSourceModalOpen: (open: boolean) => void;

  sourcesResearchWeights: Record<ResearchId, number>;
  setSourcesResearchWeights: React.Dispatch<React.SetStateAction<Record<ResearchId, number>>>;

  sourcesResearchEnabled: Record<ResearchId, boolean>;
  setSourcesResearchEnabled: React.Dispatch<React.SetStateAction<Record<ResearchId, boolean>>>;

  sourcesRules: { deduplication: boolean; verifyPayload: boolean };
  setSourcesRules: React.Dispatch<React.SetStateAction<{ deduplication: boolean; verifyPayload: boolean }>>;

  sourcesMinSources: number;
  setSourcesMinSources: (next: number) => void;

  sourcesCountries: string[];
  setSourcesCountries: React.Dispatch<React.SetStateAction<string[]>>;

  sourcesCountryInput: string;
  setSourcesCountryInput: (next: string) => void;

  sourcesBlacklist: string;
  setSourcesBlacklist: (next: string) => void;
};

export function SourcesTabV6({
  state,
  setState,
  sourcesSaved,
  setEditingSourceId,
  setSourceModalOpen,
  sourcesResearchWeights,
  setSourcesResearchWeights,
  sourcesResearchEnabled,
  setSourcesResearchEnabled,
  sourcesRules,
  setSourcesRules,
  sourcesMinSources,
  setSourcesMinSources,
  sourcesCountries,
  setSourcesCountries,
  sourcesCountryInput,
  setSourcesCountryInput,
  sourcesBlacklist,
  setSourcesBlacklist,
}: Props) {
  const [query, setQuery] = React.useState('');

  const filteredSources = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.sources;

    return state.sources.filter((src) => {
      const name = src.name.toLowerCase();
      const url = src.url.toLowerCase();
      return name.includes(q) || url.includes(q);
    });
  }, [query, state.sources]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 relative">
      {sourcesSaved.status !== 'idle' ? (
        <div className="fixed bottom-8 right-8 z-[1600] flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-2xl shadow-neu-outset animate-in slide-in-from-bottom-4 duration-300">
          {sourcesSaved.status === 'saving' ? (
            <>
              <Loader2 size={16} className="animate-spin text-brand-accent" />
              <span className="text-body-small uppercase tracking-widest">Syncing Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-body-small uppercase tracking-widest">Pipeline Updated</span>
            </>
          )}
        </div>
      ) : null}

      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-heading-1 text-foreground tracking-tight">Sources & Research</h1>
          <p className="text-muted-foreground text-body mt-1">
            Configure where the AI pulls its data from and how it researches topics.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingSourceId(null);
            setSourceModalOpen(true);
          }}
          className="flex items-center gap-2 bg-accent text-background px-4 py-2 rounded-lg hover:bg-accent-hover shadow-neu-outset transition-colors"
        >
          <Plus size={20} />
          Add Source
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface flex-wrap gap-4">
              <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                <Layers size={18} className="text-brand-accent" />
                RSS Source Manager
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter sources..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-body bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface text-muted-foreground text-body-small uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Source & URL</th>
                    <th className="px-6 py-3">Last Sync</th>
                    <th className="px-6 py-3">Articles</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSources.map((src) => (
                    <tr key={src.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            className="text-body text-foreground text-left hover:text-brand-accent transition-colors"
                            onClick={() => {
                              setEditingSourceId(src.id);
                              setSourceModalOpen(true);
                            }}
                          >
                            {src.name}
                          </button>
                          <span className="text-body-small text-muted-foreground truncate max-w-[220px]">{src.url}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body text-muted-foreground">
                        {src.lastSync ? formatRelativeTime(src.lastSync) : '—'}
                      </td>
                      <td className="px-6 py-4 text-body text-foreground">{src.articleCount ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = {
                                ...state,
                                sources: state.sources.map((s) => (s.id === src.id ? { ...s, enabled: !s.enabled } : s)),
                              };
                              setState(next);
                              sourcesSaved.trigger();
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              src.enabled ? 'bg-accent' : 'bg-surface'
                            }`}
                            aria-label={`Toggle ${src.name}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                                src.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-body-small uppercase min-w-[80px] ${
                              src.enabled ? 'text-success' : 'text-muted-foreground'
                            }`}
                          >
                            {src.enabled ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingSourceId(src.id);
                            setSourceModalOpen(true);
                          }}
                          aria-label="More"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {state.sources.length === 0 ? <div className="p-12 text-center text-muted-foreground">No sources added yet.</div> : null}
          </section>

          <section className="bg-background rounded-2xl border border-border shadow-neu-outset p-6">
            <div className="mb-6">
              <h2 className="text-heading-3 text-foreground">Web & Trend Research</h2>
              <p className="text-body text-muted-foreground">Control AI exploration beyond static RSS feeds.</p>
            </div>

            <div className="space-y-6">
              {[
                { id: 'web' as const, label: 'Global Web Search', icon: <Globe size={20} />, color: 'text-info' },
                { id: 'social' as const, label: 'Real-time Social Trends', icon: <Hash size={20} />, color: 'text-brand-accent' },
                { id: 'journals' as const, label: 'Academic & Scientific Journals', icon: <ExternalLink size={20} />, color: 'text-success' },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-6 p-4 bg-surface rounded-xl border border-border">
                  <div className={`p-3 bg-background rounded-lg shadow-neu-outset ${item.color}`}>{item.icon}</div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-body text-foreground">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSourcesResearchEnabled((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                          sourcesSaved.trigger();
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          sourcesResearchEnabled[item.id] ? 'bg-accent' : 'bg-background'
                        } border border-border`}
                        aria-label={`Toggle ${item.label}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                            sourcesResearchEnabled[item.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div
                      className={`space-y-1 transition-opacity ${
                        sourcesResearchEnabled[item.id] ? 'opacity-100' : 'opacity-40 pointer-events-none'
                      }`}
                    >
                      <div className="flex justify-between text-body-small text-muted-foreground">
                        <span>Research Priority</span>
                        <span className="text-brand-accent">{sourcesResearchWeights[item.id]}%</span>
                      </div>
                      <input
                        type="range"
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
                        value={sourcesResearchWeights[item.id]}
                        onChange={(e) => {
                          setSourcesResearchWeights({
                            ...sourcesResearchWeights,
                            [item.id]: parseInt(e.target.value, 10),
                          });
                          sourcesSaved.trigger();
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-background rounded-2xl border border-border shadow-neu-outset p-6 sticky top-24">
            <div className="mb-6">
              <h2 className="text-heading-3 text-foreground">Research Rules</h2>
              <p className="text-body text-muted-foreground">Establish boundaries for the AI engine.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-body text-muted-foreground flex items-center gap-2">
                  <RefreshCw size={14} className="text-muted-foreground" />
                  Min Sources per Story
                </label>
                <input
                  type="number"
                  value={sourcesMinSources}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSourcesMinSources(Number.isFinite(v) ? v : 0);
                    sourcesSaved.trigger();
                  }}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
                <p className="text-body-small text-muted-foreground italic">Ensures cross-verification of news facts.</p>
              </div>

              <div className="space-y-2">
                <label className="text-body text-muted-foreground flex items-center gap-2">
                  <Globe size={14} className="text-muted-foreground" />
                  Geographical Focus
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-surface border border-border rounded-lg">
                  {sourcesCountries.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-background border border-border text-muted-foreground rounded text-body-small flex items-center gap-1"
                    >
                      {c}
                      <button
                        type="button"
                        className="hover:text-foreground"
                        onClick={() => {
                          setSourcesCountries((prev) => prev.filter((x) => x !== c));
                          sourcesSaved.trigger();
                        }}
                        aria-label={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={sourcesCountryInput}
                    onChange={(e) => setSourcesCountryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const next = sourcesCountryInput.trim();
                        if (!next) return;
                        if (!sourcesCountries.includes(next)) {
                          setSourcesCountries((prev) => [...prev, next]);
                          sourcesSaved.trigger();
                        }
                        setSourcesCountryInput('');
                      }
                    }}
                    placeholder="Add..."
                    className="bg-transparent border-none text-body-small w-20 focus:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-body text-muted-foreground flex items-center gap-2">
                  <ShieldAlert size={14} className="text-muted-foreground" />
                  Source Blacklist
                </label>
                <textarea
                  placeholder="Enter domains to ignore (one per line)..."
                  value={sourcesBlacklist}
                  onChange={(e) => {
                    setSourcesBlacklist(e.target.value);
                    sourcesSaved.trigger();
                  }}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body h-24 focus:outline-none focus:ring-2 focus:ring-destructive/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="pt-4 space-y-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-body text-muted-foreground flex items-center gap-2">
                      <Copy size={14} />
                      Deduplication
                    </p>
                    <p className="text-body-small text-muted-foreground">Prevent repeated coverage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSourcesRules((prev) => ({ ...prev, deduplication: !prev.deduplication }));
                      sourcesSaved.trigger();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                      sourcesRules.deduplication ? 'bg-accent' : 'bg-background'
                    }`}
                    aria-label="Toggle Deduplication"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                        sourcesRules.deduplication ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-body text-muted-foreground flex items-center gap-2">
                      <Sliders size={14} />
                      Verify Payload
                    </p>
                    <p className="text-body-small text-muted-foreground">Check source credibility.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSourcesRules((prev) => ({ ...prev, verifyPayload: !prev.verifyPayload }));
                      sourcesSaved.trigger();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-border ${
                      sourcesRules.verifyPayload ? 'bg-accent' : 'bg-background'
                    }`}
                    aria-label="Toggle Verify Payload"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                        sourcesRules.verifyPayload ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sourcesSaved.trigger();
                }}
                disabled={sourcesSaved.status === 'saving'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background rounded-lg text-body hover:opacity-90 transition-colors shadow-neu-outset active:scale-[0.98] disabled:opacity-50"
              >
                {sourcesSaved.status === 'saving' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : sourcesSaved.status === 'saved' ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : null}
                {sourcesSaved.status === 'saved' ? 'Configuration Saved' : 'Save Configuration'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

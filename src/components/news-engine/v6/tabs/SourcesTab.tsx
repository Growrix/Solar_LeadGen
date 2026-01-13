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
import {
  adminSyncResearchNow,
  adminSyncSource,
  fetchAdminResearchEntries,
  fetchAdminUnifiedResearchEntries,
  type AdminResearchEntry,
  type AdminUnifiedResearchEntry,
} from '@/lib/news-engine/client';
import type { useSavedIndicator } from '../shared';
import { formatRelativeTime, ModalShell } from '../shared';

type SavedIndicator = ReturnType<typeof useSavedIndicator>;

type ResearchId = 'web' | 'social' | 'journals';

type ResearchSyncKind = 'WEB' | 'SOCIAL' | 'JOURNAL' | 'TREND';

type Props = {
  state: NewsEngineState;
  setState: React.Dispatch<React.SetStateAction<NewsEngineState | null>>;

  sourcesSaved: SavedIndicator;

  onToggleSourceEnabled: (sourceId: string, enabled: boolean) => void;

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
  onToggleSourceEnabled,
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

  const [showUnifiedResearch, setShowUnifiedResearch] = React.useState(false);
  const [unifiedFilters, setUnifiedFilters] = React.useState<{
    sourceType: 'ALL' | 'RSS' | 'RESEARCH';
    kind: 'ALL' | ResearchSyncKind;
    status: 'ALL' | 'NEW' | 'PROCESSED' | 'ERROR';
    from: string;
    to: string;
  }>(() => ({
    sourceType: 'ALL',
    kind: 'ALL',
    status: 'ALL',
    from: '',
    to: '',
  }));

  const [unifiedListing, setUnifiedListing] = React.useState<{
    loading: boolean;
    error: string | null;
    items: AdminUnifiedResearchEntry[];
    nextCursor: string | null;
    computedAt: string | null;
  }>(() => ({
    loading: false,
    error: null,
    items: [],
    nextCursor: null,
    computedAt: null,
  }));

  const loadUnifiedEntries = React.useCallback(
    async (mode: 'reset' | 'more' = 'reset') => {
      setUnifiedListing((prev) => ({
        ...prev,
        loading: true,
        error: null,
        ...(mode === 'reset' ? { items: [], nextCursor: null } : null),
      }));

      try {
        const res = await fetchAdminUnifiedResearchEntries({
          sourceType:
            unifiedFilters.sourceType === 'RSS'
              ? 'rss'
              : unifiedFilters.sourceType === 'RESEARCH'
                ? 'research'
                : undefined,
          kind: unifiedFilters.kind === 'ALL' ? undefined : unifiedFilters.kind,
          status: unifiedFilters.status === 'ALL' ? undefined : unifiedFilters.status,
          from: unifiedFilters.from || undefined,
          to: unifiedFilters.to || undefined,
          limit: 40,
          cursor: mode === 'more' ? unifiedListing.nextCursor ?? undefined : undefined,
        });

        setUnifiedListing((prev) => ({
          ...prev,
          loading: false,
          computedAt: res.computedAt,
          nextCursor: res.nextCursor,
          items: mode === 'more' ? [...prev.items, ...res.items] : res.items,
        }));
      } catch (error) {
        setUnifiedListing((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load unified entries',
        }));
      }
    },
    [unifiedFilters.from, unifiedFilters.kind, unifiedFilters.sourceType, unifiedFilters.status, unifiedFilters.to, unifiedListing.nextCursor]
  );

  React.useEffect(() => {
    if (!showUnifiedResearch) return;
    void loadUnifiedEntries('reset');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUnifiedResearch, unifiedFilters]);

  const [rssSync, setRssSync] = React.useState<{
    syncingSourceId: string | null;
    lastErrorById: Record<string, string | null>;
    lastImportedById: Record<string, number | null>;
    lastSyncedAtById: Record<string, string | null>;
  }>(() => ({
    syncingSourceId: null,
    lastErrorById: {},
    lastImportedById: {},
    lastSyncedAtById: {},
  }));

  const [researchSync, setResearchSync] = React.useState<{
    lastSyncedAtByKind: Record<ResearchSyncKind, string | null>;
    lastErrorByKind: Record<ResearchSyncKind, string | null>;
    lastImportedByKind: Record<ResearchSyncKind, number | null>;
    syncingKind: ResearchSyncKind | null;
  }>(() => ({
    lastSyncedAtByKind: { WEB: null, SOCIAL: null, JOURNAL: null, TREND: null },
    lastErrorByKind: { WEB: null, SOCIAL: null, JOURNAL: null, TREND: null },
    lastImportedByKind: { WEB: null, SOCIAL: null, JOURNAL: null, TREND: null },
    syncingKind: null,
  }));

  const [researchEntriesModal, setResearchEntriesModal] = React.useState<{
    open: boolean;
    kind: ResearchSyncKind | null;
    loading: boolean;
    error: string | null;
    entries: AdminResearchEntry[];
  }>({
    open: false,
    kind: null,
    loading: false,
    error: null,
    entries: [],
  });

  const loadResearchEntries = React.useCallback(async (kind: ResearchSyncKind) => {
    setResearchEntriesModal((prev) => ({ ...prev, open: true, kind, loading: true, error: null, entries: [] }));
    try {
      const entries = await fetchAdminResearchEntries(kind, 75);
      setResearchEntriesModal((prev) => ({ ...prev, open: true, kind, loading: false, error: null, entries }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch research entries';
      setResearchEntriesModal((prev) => ({ ...prev, open: true, kind, loading: false, error: message, entries: [] }));
    }
  }, []);

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
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowUnifiedResearch((v) => !v)}
            className="flex items-center gap-2 bg-surface text-foreground px-4 py-2 rounded-lg hover:bg-surface-hover shadow-neu-outset transition-colors border border-border"
            aria-expanded={showUnifiedResearch}
            aria-controls="unified-research-center"
          >
            <Globe size={18} className="text-brand-accent" />
            Unified Research Center
          </button>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {showUnifiedResearch ? (
            <section
              id="unified-research-center"
              className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface flex-wrap gap-4">
                <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                  <Globe size={18} className="text-brand-accent" />
                  Unified Research Center
                </h3>
                <span className="text-body-small text-muted-foreground">
                  {unifiedListing.loading
                    ? 'Loading…'
                    : unifiedListing.computedAt
                      ? `Updated ${formatRelativeTime(unifiedListing.computedAt)}`
                      : '—'}
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="space-y-1">
                    <span className="text-body-small text-muted-foreground uppercase tracking-widest">Source type</span>
                    <select
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground shadow-neu-inset"
                      value={unifiedFilters.sourceType}
                      onChange={(e) => setUnifiedFilters((p) => ({ ...p, sourceType: e.target.value as any }))}
                    >
                      <option value="ALL">All</option>
                      <option value="RSS">RSS</option>
                      <option value="RESEARCH">Research</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-body-small text-muted-foreground uppercase tracking-widest">Kind</span>
                    <select
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground shadow-neu-inset"
                      value={unifiedFilters.kind}
                      onChange={(e) => setUnifiedFilters((p) => ({ ...p, kind: e.target.value as any }))}
                    >
                      <option value="ALL">All</option>
                      <option value="WEB">WEB</option>
                      <option value="SOCIAL">SOCIAL</option>
                      <option value="JOURNAL">JOURNAL</option>
                      <option value="TREND">TREND</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-body-small text-muted-foreground uppercase tracking-widest">Status</span>
                    <select
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground shadow-neu-inset"
                      value={unifiedFilters.status}
                      onChange={(e) => setUnifiedFilters((p) => ({ ...p, status: e.target.value as any }))}
                    >
                      <option value="ALL">All</option>
                      <option value="NEW">New</option>
                      <option value="PROCESSED">Processed</option>
                      <option value="ERROR">Error</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">From</span>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground shadow-neu-inset"
                        value={unifiedFilters.from}
                        onChange={(e) => setUnifiedFilters((p) => ({ ...p, from: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-body-small text-muted-foreground uppercase tracking-widest">To</span>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-body text-foreground shadow-neu-inset"
                        value={unifiedFilters.to}
                        onChange={(e) => setUnifiedFilters((p) => ({ ...p, to: e.target.value }))}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-4 shadow-neu-inset space-y-3">
                  {unifiedListing.error ? (
                    <p className="text-body-small text-muted-foreground">Unified listing error: {unifiedListing.error}</p>
                  ) : null}

                  {unifiedListing.items.length === 0 && !unifiedListing.loading && !unifiedListing.error ? (
                    <p className="text-body-small text-muted-foreground">No entries match the current filters.</p>
                  ) : null}

                  {unifiedListing.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-body-small text-muted-foreground uppercase tracking-widest">
                            <th className="py-2 pr-4">Type</th>
                            <th className="py-2 pr-4">Kind</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Title</th>
                            <th className="py-2 pr-4">Fetched</th>
                          </tr>
                        </thead>
                        <tbody className="text-body">
                          {unifiedListing.items.map((row) => (
                            <tr key={`${row.sourceType}:${row.id}`} className="border-t border-border">
                              <td className="py-2 pr-4 text-foreground">{row.sourceType === 'rss' ? 'RSS' : 'Research'}</td>
                              <td className="py-2 pr-4 text-muted-foreground">{row.kind ?? '—'}</td>
                              <td className="py-2 pr-4 text-muted-foreground">{row.status}</td>
                              <td className="py-2 pr-4">
                                <a
                                  href={row.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-foreground hover:text-brand-accent underline underline-offset-2"
                                  title={row.url}
                                >
                                  {row.title || row.url}
                                </a>
                                {row.sourceName ? (
                                  <div className="text-body-small text-muted-foreground mt-1">{row.sourceName}</div>
                                ) : null}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">{formatRelativeTime(row.fetchedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body-small text-muted-foreground">
                      Showing {unifiedListing.items.length} {unifiedListing.items.length === 1 ? 'entry' : 'entries'}
                    </span>
                    {unifiedListing.nextCursor ? (
                      <button
                        type="button"
                        onClick={() => void loadUnifiedEntries('more')}
                        disabled={unifiedListing.loading}
                        className="px-4 py-2 rounded-lg bg-background border border-border text-foreground hover:bg-surface-hover shadow-neu-outset"
                      >
                        Load more
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

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
                          {rssSync.lastErrorById[src.id] ? (
                            <span className="text-body-small text-destructive mt-1 truncate max-w-[220px]">
                              Last error: {rssSync.lastErrorById[src.id]}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body text-muted-foreground">
                        {rssSync.lastSyncedAtById[src.id]
                          ? formatRelativeTime(rssSync.lastSyncedAtById[src.id] as string)
                          : src.lastSync
                            ? formatRelativeTime(src.lastSync)
                            : '—'}
                      </td>
                      <td className="px-6 py-4 text-body text-foreground">{src.articleCount ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextEnabled = !src.enabled;
                              const next = {
                                ...state,
                                sources: state.sources.map((s) => (s.id === src.id ? { ...s, enabled: nextEnabled } : s)),
                              };
                              setState(next);
                              sourcesSaved.trigger();
                              onToggleSourceEnabled(src.id, nextEnabled);
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (rssSync.syncingSourceId) return;
                              setRssSync((prev) => ({
                                ...prev,
                                syncingSourceId: src.id,
                                lastErrorById: { ...prev.lastErrorById, [src.id]: null },
                              }));
                              try {
                                const res = await adminSyncSource(src.id);
                                const nowIso = new Date().toISOString();
                                setRssSync((prev) => ({
                                  ...prev,
                                  syncingSourceId: null,
                                  lastImportedById: { ...prev.lastImportedById, [src.id]: res.imported },
                                  lastSyncedAtById: { ...prev.lastSyncedAtById, [src.id]: nowIso },
                                }));
                                setState((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    sources: prev.sources.map((s) => (s.id === src.id ? { ...s, lastSync: nowIso } : s)),
                                  };
                                });
                              } catch (e) {
                                const message = e instanceof Error ? e.message : 'Failed to sync source';
                                setRssSync((prev) => ({
                                  ...prev,
                                  syncingSourceId: null,
                                  lastErrorById: { ...prev.lastErrorById, [src.id]: message },
                                }));
                              }
                            }}
                            disabled={rssSync.syncingSourceId === src.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors disabled:opacity-50"
                            aria-label={`Sync now: ${src.name}`}
                            title={rssSync.syncingSourceId === src.id ? 'Syncing...' : 'Sync now'}
                          >
                            {rssSync.syncingSourceId === src.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Sync now
                          </button>

                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground p-2"
                            onClick={() => {
                              setEditingSourceId(src.id);
                              setSourceModalOpen(true);
                            }}
                            aria-label="Edit source"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {state.sources.length === 0 ? <div className="p-12 text-center text-muted-foreground">No sources added yet.</div> : null}
          </section>

          <section className="bg-background rounded-2xl border border-border shadow-neu-outset overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface flex-wrap gap-4">
              <h3 className="text-heading-3 text-foreground flex items-center gap-2">
                <RefreshCw size={18} className="text-brand-accent" />
                Recent Research Sync
              </h3>
              <span className="text-body-small text-muted-foreground">API-backed</span>
            </div>

            <div className="p-6 space-y-4">
              {([
                { kind: 'WEB' as const, label: 'WEB' },
                { kind: 'SOCIAL' as const, label: 'SOCIAL' },
                { kind: 'JOURNAL' as const, label: 'JOURNAL' },
                { kind: 'TREND' as const, label: 'TREND' },
              ] as const).map((row) => {
                const lastSync = researchSync.lastSyncedAtByKind[row.kind];
                const lastErr = researchSync.lastErrorByKind[row.kind];
                const imported = researchSync.lastImportedByKind[row.kind];
                const syncing = researchSync.syncingKind === row.kind;
                return (
                  <div key={row.kind} className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-[220px]">
                      <p className="text-body text-foreground">{row.label}</p>
                      <p className="text-body-small text-muted-foreground">
                        Last sync: {lastSync ? formatRelativeTime(lastSync) : '—'}
                      </p>
                      <p className="text-body-small text-muted-foreground">Imported: {typeof imported === 'number' ? imported : '—'}</p>
                      {lastErr ? <p className="text-body-small text-destructive mt-1">Last error: {lastErr}</p> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={syncing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors disabled:opacity-50"
                        title={syncing ? 'Syncing…' : 'Sync Research Now'}
                        onClick={() => {
                          if (researchSync.syncingKind) return;
                          void (async () => {
                            setResearchSync((prev) => ({
                              ...prev,
                              syncingKind: row.kind,
                              lastErrorByKind: { ...prev.lastErrorByKind, [row.kind]: null },
                            }));
                            try {
                              const res = await adminSyncResearchNow(row.kind);
                              const nowIso = new Date().toISOString();
                              setResearchSync((prev) => ({
                                ...prev,
                                syncingKind: null,
                                lastImportedByKind: { ...prev.lastImportedByKind, [row.kind]: res.imported },
                                lastSyncedAtByKind: { ...prev.lastSyncedAtByKind, [row.kind]: nowIso },
                                lastErrorByKind: {
                                  ...prev.lastErrorByKind,
                                  [row.kind]: res.errors?.length ? `${res.errors.length} feed(s) failed (see audit log)` : null,
                                },
                              }));
                            } catch (e) {
                              const message = e instanceof Error ? e.message : 'Failed to sync research';
                              setResearchSync((prev) => ({
                                ...prev,
                                syncingKind: null,
                                lastErrorByKind: { ...prev.lastErrorByKind, [row.kind]: message },
                              }));
                            }
                          })();
                        }}
                      >
                        {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Sync Research Now
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
                        title="View latest research entries"
                        onClick={() => {
                          void loadResearchEntries(row.kind);
                        }}
                      >
                        <ExternalLink size={14} /> View Entries
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {researchEntriesModal.open && researchEntriesModal.kind ? (
            <ModalShell
              title={`Research Entries: ${researchEntriesModal.kind}`}
              description="Latest ingested research entries (most recent first)."
              onClose={() => setResearchEntriesModal((prev) => ({ ...prev, open: false }))}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div className="text-body-small text-muted-foreground">
                  {researchEntriesModal.loading ? 'Loading…' : `${researchEntriesModal.entries.length} item(s)`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!researchEntriesModal.kind) return;
                    void loadResearchEntries(researchEntriesModal.kind);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-body-small text-foreground hover:bg-surface shadow-neu-outset transition-colors"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {researchEntriesModal.error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-body-small text-destructive">
                  {researchEntriesModal.error}
                </div>
              ) : null}

              <div className="space-y-3">
                {researchEntriesModal.entries.map((e) => (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 bg-background rounded-xl border border-border shadow-neu-outset hover:bg-surface transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-body text-foreground truncate">{e.title || e.url}</p>
                        <p className="text-body-small text-muted-foreground truncate">{e.url}</p>
                      </div>
                      <div className="text-body-small text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(e.fetchedAt)}
                      </div>
                    </div>
                  </a>
                ))}

                {!researchEntriesModal.loading && researchEntriesModal.entries.length === 0 ? (
                  <div className="text-body text-muted-foreground">No entries found for this kind yet.</div>
                ) : null}
              </div>
            </ModalShell>
          ) : null}

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

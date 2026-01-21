'use client';

import React from 'react';
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Rss,
  Search,
  XCircle,
  Zap,
} from 'lucide-react';
import Button from '@/components/Button';
import type { NewsItem, NewsEngineState } from '@/lib/ui-stubs/news-engine';
import { fetchAdminNewsKpis } from '@/lib/news-engine/client';
import {
  DashboardStatusBadge,
  formatRelativeTime,
  type DashboardDateRange,
  type DashboardFilterState,
  type DashboardSourceType,
} from '../shared';

type Props = {
  state: NewsEngineState;

  dashboardSearchTerm: string;
  setDashboardSearchTerm: (next: string) => void;

  dashboardFilters: DashboardFilterState;
  setDashboardFilters: React.Dispatch<React.SetStateAction<DashboardFilterState>>;

  dashboardStatuses: Array<DashboardFilterState['status']>;
  dashboardCategories: string[];
  dashboardSourceTypes: DashboardSourceType[];
  dashboardDateRanges: DashboardDateRange[];

  clearDashboardFilters: () => void;
  hasActiveDashboardFilters: boolean;

  filteredDashboardNews: NewsItem[];

  openReviewForItem: (itemId: string) => void;
  openCreateNews: () => void;
  openGenerateAiDraft: () => void;
};

export function DashboardTabV6({
  state,
  dashboardSearchTerm,
  setDashboardSearchTerm,
  dashboardFilters,
  setDashboardFilters,
  dashboardStatuses,
  dashboardCategories,
  dashboardSourceTypes,
  dashboardDateRanges,
  clearDashboardFilters,
  hasActiveDashboardFilters,
  filteredDashboardNews,
  openReviewForItem,
  openCreateNews,
  openGenerateAiDraft,
}: Props) {
  const pageSize = 20;
  const [pageIndex, setPageIndex] = React.useState(0);

  const [kpisLoading, setKpisLoading] = React.useState(false);
  const [kpisError, setKpisError] = React.useState<string | null>(null);
  const [kpis, setKpis] = React.useState<{
    asOf: string;
    totalStoriesLast30: number;
    avgRelevanceLast30: number | null;
    reviewQueueCount: number;
    pipelineStatus: NewsEngineState['pipelineStatus'];
  } | null>(null);

  React.useEffect(() => {
    setPageIndex(0);
  }, [dashboardSearchTerm, dashboardFilters]);

  React.useEffect(() => {
    let mounted = true;
    setKpisLoading(true);
    setKpisError(null);

    void (async () => {
      try {
        const res = await fetchAdminNewsKpis();
        if (!mounted) return;
        setKpis({
          asOf: res.asOf,
          totalStoriesLast30: res.kpis.totalStoriesLast30,
          avgRelevanceLast30: res.kpis.avgRelevanceLast30,
          reviewQueueCount: res.kpis.reviewQueueCount,
          pipelineStatus: res.kpis.pipelineStatus,
        });
      } catch (error) {
        if (!mounted) return;
        setKpis(null);
        setKpisError(error instanceof Error ? error.message : 'Failed to load KPIs');
      } finally {
        if (!mounted) return;
        setKpisLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = React.useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredDashboardNews.slice(start, start + pageSize);
  }, [filteredDashboardNews, pageIndex]);

  const totalItems = filteredDashboardNews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrev = pageIndex > 0;
  const canNext = pageIndex + 1 < totalPages;

  const nonDeletedItems = React.useMemo(
    () => state.items.filter((it) => !it.deletedAt),
    [state.items]
  );

  const last30DaysItems = React.useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return nonDeletedItems.filter((it) => {
      const createdAtMs = Date.parse(it.createdAt);
      return Number.isFinite(createdAtMs) && createdAtMs >= cutoff;
    });
  }, [nonDeletedItems]);

  const totalStoriesLast30 = last30DaysItems.length;
  const avgRelevanceLast30 = React.useMemo(() => {
    if (!last30DaysItems.length) return null;
    const sum = last30DaysItems.reduce((acc, it) => acc + (Number.isFinite(it.relevanceScore) ? it.relevanceScore : 0), 0);
    return Math.round(sum / last30DaysItems.length);
  }, [last30DaysItems]);

  const reviewQueueCount = React.useMemo(() => {
    return nonDeletedItems.filter((it) => it.status === 'NEEDS_REVIEW' || it.status === 'DRAFT_READY' || it.status === 'DRAFT').length;
  }, [nonDeletedItems]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {kpisError ? (
        <div className="bg-surface p-3 rounded-xl border border-border shadow-neu-outset">
          <p className="text-body-small text-muted-foreground">Dashboard KPIs unavailable: {kpisError}</p>
        </div>
      ) : null}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Stories',
            value: kpis?.totalStoriesLast30 ?? totalStoriesLast30,
            icon: <Rss size={20} />,
            description: 'Created (last 30 days)',
            isPlaceholder: !kpis,
          },
          {
            label: 'Avg. Relevance',
            value:
              (kpis?.avgRelevanceLast30 ?? avgRelevanceLast30) === null
                ? kpisLoading
                  ? 'Loading…'
                  : '—'
                : `${Math.round(kpis?.avgRelevanceLast30 ?? avgRelevanceLast30 ?? 0)}%`,
            icon: <Activity size={20} />,
            description: 'Avg. score (last 30 days)',
            isPlaceholder: !kpis,
          },
          {
            label: 'Automations',
            value:
              (kpis?.pipelineStatus ?? state.pipelineStatus) === 'NOMINAL'
                ? 'Active'
                : (kpis?.pipelineStatus ?? state.pipelineStatus) === 'PAUSED'
                  ? 'Paused'
                  : 'Stopped',
            icon: <Zap size={20} />,
            description: 'System status',
            isPlaceholder: !kpis,
          },
          {
            label: 'Review Queue',
            value: kpis?.reviewQueueCount ?? reviewQueueCount,
            icon: <Clock size={20} />,
            description: 'Needs review / drafts',
            isPlaceholder: !kpis,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface p-6 rounded-xl border border-border shadow-neu-outset transition-colors hover:shadow-neu-inset"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-background rounded-lg text-brand-accent shadow-neu-inset">{kpi.icon}</div>
              {kpi.isPlaceholder ? (
                <span
                  className="text-body-small text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5 shadow-neu-inset"
                  aria-label="Placeholder KPI"
                  title="Placeholder KPI"
                >
                  {kpisLoading ? 'Loading' : 'Placeholder'}
                </span>
              ) : null}
            </div>
            <div className="space-y-1">
              <p className="text-body-small text-muted-foreground tracking-wider">{kpi.label}</p>
              <h3 className="text-heading-2 text-foreground">{kpi.value}</h3>
              <p className="text-body-small text-muted-foreground">{kpi.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface p-4 rounded-xl border border-border shadow-neu-outset flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search articles, summaries or categories..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors text-body text-foreground"
                value={dashboardSearchTerm}
                onChange={(e) => setDashboardSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={clearDashboardFilters}
              className={`flex items-center gap-1.5 text-body-small px-3 py-2 rounded-lg transition-colors ${
                hasActiveDashboardFilters
                  ? 'text-brand-accent bg-background hover:bg-surface-hover'
                  : 'text-muted-foreground bg-background cursor-not-allowed opacity-50'
              }`}
              disabled={!hasActiveDashboardFilters}
            >
              <XCircle size={14} />
              Clear All
            </button>

            <button
              type="button"
              onClick={openCreateNews}
              className="bg-accent text-background px-4 py-1.5 rounded-lg text-body-small hover:bg-accent-hover shadow-neu-outset transition-colors uppercase tracking-widest"
              aria-label="Create News"
            >
              Create News
            </button>
            <button
              type="button"
              onClick={openGenerateAiDraft}
              className="bg-surface text-foreground px-4 py-1.5 rounded-lg text-body-small hover:bg-surface-hover shadow-neu-outset transition-colors uppercase tracking-widest border border-border"
              aria-label="Generate AI Draft"
            >
              Generate AI Draft
            </button>
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-auto pb-1">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-body-small text-muted-foreground uppercase tracking-widest">Filter By</span>
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          <div className="relative group">
            <select
              value={dashboardFilters.status}
              onChange={(e) =>
                setDashboardFilters((prev) => ({ ...prev, status: e.target.value as DashboardFilterState['status'] }))
              }
              className="appearance-none pl-3 pr-8 py-1.5 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {dashboardStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'Status: All' : s}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="relative group">
            <select
              value={dashboardFilters.category}
              onChange={(e) => setDashboardFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {dashboardCategories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'Category: All' : c}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="relative group">
            <select
              value={dashboardFilters.sourceType}
              onChange={(e) =>
                setDashboardFilters((prev) => ({
                  ...prev,
                  sourceType: e.target.value as DashboardFilterState['sourceType'],
                }))
              }
              className="appearance-none pl-3 pr-8 py-1.5 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {dashboardSourceTypes.map((st) => (
                <option key={st} value={st}>
                  {st === 'All Types' ? 'Source: All' : st}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={12} />
            <select
              value={dashboardFilters.dateRange}
              onChange={(e) =>
                setDashboardFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value as DashboardFilterState['dateRange'],
                }))
              }
              className="appearance-none pl-7 pr-8 py-1.5 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {dashboardDateRanges.map((dr) => (
                <option key={dr} value={dr}>
                  {dr === 'All Time' ? 'Date: All Time' : dr}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>

          <div className="relative group">
            <select
              value={dashboardFilters.minScore}
              onChange={(e) => setDashboardFilters((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }))}
              className="appearance-none pl-3 pr-8 py-1.5 text-body-small text-foreground bg-background border border-border rounded-lg hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value={0}>Score: Any</option>
              <option value={80}>Score &gt; 80</option>
              <option value={90}>Score &gt; 90</option>
              <option value={95}>Score &gt; 95</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </section>

      <section className="bg-surface rounded-xl border border-border shadow-neu-outset overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-heading-3 text-foreground">AI News Feed</h2>
            <span className="bg-background text-muted-foreground text-body-small px-2 py-0.5 rounded-full uppercase tracking-wider border border-border">
              {filteredDashboardNews.length} Stories
            </span>
          </div>
          <span className="text-body-small text-muted-foreground uppercase tracking-wider">Latest updates</span>
        </div>

        {filteredDashboardNews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background text-muted-foreground text-body-small uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">News Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          className="text-left text-body text-foreground group-hover:text-brand-accent transition-colors"
                          onClick={() => openReviewForItem(item.id)}
                        >
                          {item.title}
                        </button>
                        <span className="text-body text-muted-foreground truncate mt-1">{item.summary}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-body text-muted-foreground">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className={`inline-flex items-center justify-center px-2 py-1 rounded text-body-small ${
                          item.relevanceScore >= 95 ? 'bg-accent text-background' : 'bg-background text-brand-accent'
                        }`}
                      >
                        {item.relevanceScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DashboardStatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-body text-foreground">{formatRelativeTime(item.createdAt)}</span>
                        <span className="text-body-small text-muted-foreground uppercase tracking-wider">{item.aiModel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openReviewForItem(item.id)}
                          className="text-brand-accent hover:text-foreground text-body-small flex items-center gap-1 uppercase tracking-widest"
                        >
                          Review
                          <ChevronRight size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface">
            <div className="bg-background p-6 rounded-2xl mb-4 border border-border shadow-neu-inset">
              <Search className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-heading-2 text-foreground tracking-tight">No results match your filters</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2 text-body">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap justify-center">
              <Button variant="secondary" className="px-6 py-3" onClick={clearDashboardFilters}>
                Reset All Filters
              </Button>
              <Button variant="primary" className="px-6 py-3" onClick={openCreateNews}>
                <span className="inline-flex items-center gap-2">
                  <Plus size={18} />
                  Create News
                </span>
              </Button>
              <Button variant="secondary" className="px-6 py-3" onClick={openGenerateAiDraft}>
                Generate AI Draft
              </Button>
            </div>
          </div>
        )}

        {filteredDashboardNews.length > 0 ? (
          <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-between">
            <span className="text-body-small text-muted-foreground uppercase tracking-widest">
              Showing {Math.min(pageSize, Math.max(0, totalItems - pageIndex * pageSize))} of {totalItems} results
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={!canPrev}
                className={`px-4 py-1.5 text-body-small uppercase tracking-widest bg-surface border border-border rounded-lg transition-colors ${
                  canPrev ? 'text-foreground hover:bg-surface-hover' : 'text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={!canNext}
                className={`px-4 py-1.5 text-body-small uppercase tracking-widest bg-surface border border-border rounded-lg transition-colors ${
                  canNext ? 'text-foreground hover:bg-surface-hover' : 'text-muted-foreground cursor-not-allowed opacity-60'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

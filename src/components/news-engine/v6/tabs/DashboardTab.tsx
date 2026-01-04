'use client';

import React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Rss,
  Search,
  XCircle,
  Zap,
} from 'lucide-react';
import Button from '@/components/Button';
import type { NewsItem, NewsEngineState } from '@/lib/ui-stubs/news-engine';
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
  openManualDraft: () => void;
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
  openManualDraft,
}: Props) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Stories', value: 1284, trend: 12.5, icon: <Rss size={20} />, description: 'Last 30 days' },
          { label: 'Avg. Relevance', value: '92%', trend: 4.2, icon: <Activity size={20} />, description: 'AI quality score' },
          {
            label: 'Automations',
            value:
              state.pipelineStatus === 'NOMINAL'
                ? 'Active'
                : state.pipelineStatus === 'PAUSED'
                  ? 'Paused'
                  : 'Stopped',
            trend: 0,
            icon: <Zap size={20} />,
            description: 'System status',
          },
          { label: 'Review Queue', value: 12, trend: -18, icon: <Clock size={20} />, description: 'Pending approval' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface p-6 rounded-xl border border-border shadow-neu-outset transition-colors hover:shadow-neu-inset"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-background rounded-lg text-brand-accent shadow-neu-inset">{kpi.icon}</div>
              <div className={`flex items-center gap-1 text-body-small ${kpi.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {kpi.trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(kpi.trend)}%
              </div>
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
                {filteredDashboardNews.map((item) => (
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
                        <button type="button" className="text-muted-foreground hover:text-foreground p-1" aria-label="More options">
                          <MoreVertical size={18} />
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
              <Button variant="primary" className="px-6 py-3" onClick={openManualDraft}>
                <span className="inline-flex items-center gap-2">
                  <Plus size={18} />
                  Create Manual Draft
                </span>
              </Button>
            </div>
          </div>
        )}

        {filteredDashboardNews.length > 0 ? (
          <div className="px-6 py-4 bg-background border-t border-border flex items-center justify-between">
            <span className="text-body-small text-muted-foreground uppercase tracking-widest">
              Showing {filteredDashboardNews.length} of {state.items.length} results
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-1.5 text-body-small uppercase tracking-widest bg-surface border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                className="px-4 py-1.5 text-body-small uppercase tracking-widest bg-surface border border-border rounded-lg text-foreground hover:bg-surface-hover transition-colors"
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

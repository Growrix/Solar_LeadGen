'use client';

import React from 'react';
import type { NewsItem, PipelineStatus } from '@/lib/ui-stubs/news-engine';

export type DashboardDateRange = 'All Time' | 'Today' | 'Yesterday' | 'Last 7 Days';
export type DashboardSourceType = 'All Types' | 'RSS Feed' | 'AI Agent' | 'Manual Entry';

export type DashboardFilterState = {
  status: NewsItem['status'] | 'All';
  category: string;
  minScore: number;
  dateRange: DashboardDateRange;
  sourceType: DashboardSourceType;
};

export function formatDateTime(value: string | Date): string {
  const iso = value instanceof Date ? value.toISOString() : value;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function formatRelativeTime(value: string | Date): string {
  const iso = value instanceof Date ? value.toISOString() : value;
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;

    const diffMs = Date.now() - then;
    const future = diffMs < 0;
    const absSeconds = Math.floor(Math.abs(diffMs) / 1000);

    if (absSeconds < 30) return future ? 'in a moment' : 'Just now';

    const minutes = Math.floor(absSeconds / 60);
    if (minutes < 60) return future ? `in ${minutes}m` : `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return future ? `in ${days}d` : `${days}d ago`;
  } catch {
    return iso;
  }
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getStatusBadgeClasses(status: NewsItem['status']): string {
  const base = 'px-3 py-1 rounded-full text-body-small';
  const map: Record<NewsItem['status'], string> = {
    DRAFT: 'bg-surface text-muted-foreground',
    NEEDS_REVIEW: 'bg-warning text-warning-foreground',
    DRAFT_READY: 'bg-surface text-foreground',
    RESEARCH_DONE: 'bg-surface text-muted-foreground',
    SCHEDULED: 'bg-warning text-warning-foreground',
    PUBLISHED: 'bg-success text-success-foreground',
    REJECTED: 'bg-destructive text-destructive-foreground',
    ERROR: 'bg-destructive text-destructive-foreground',
  };
  return `${base} ${map[status]}`;
}

export function getPipelineBadgeClasses(status: PipelineStatus): string {
  const base = 'px-3 py-1 rounded-full text-body-small';
  const map: Record<PipelineStatus, string> = {
    NOMINAL: 'bg-success text-success-foreground',
    PAUSED: 'bg-warning text-warning-foreground',
    EMERGENCY_STOP: 'bg-destructive text-destructive-foreground',
  };
  return `${base} ${map[status]}`;
}

export function DashboardStatusBadge({ status }: { status: NewsItem['status'] }) {
  return <span className={getStatusBadgeClasses(status)}>{status}</span>;
}

export function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 1600 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-surface rounded-2xl shadow-neu-outset w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-2 text-foreground">{title}</h2>
            {description ? <p className="text-body-small text-muted-foreground mt-1">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-background text-muted-foreground shadow-neu-outset hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function useSavedIndicator() {
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  const trigger = React.useCallback(() => {
    setStatus('saving');
    window.setTimeout(() => setStatus('saved'), 350);
    window.setTimeout(() => setStatus('idle'), 1200);
  }, []);

  return { status, trigger };
}

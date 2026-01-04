'use client';

import React from 'react';
import { Clock, Filter, MoreVertical, Plus, Search, Zap } from 'lucide-react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { formatRelativeTime } from '../shared';

type DraftsBoardColumn = {
  key: NewsItem['status'];
  label: string;
  dotClass: string;
};

type Props = {
  draftsBoardFilterTerm: string;
  setDraftsBoardFilterTerm: (next: string) => void;
  draftsBoardColumns: DraftsBoardColumn[];
  draftsFilteredItems: NewsItem[];
  openReviewForItem: (itemId: string) => void;
  openManualDraft: () => void;
};

export function DraftsReviewsTabV6({
  draftsBoardFilterTerm,
  setDraftsBoardFilterTerm,
  draftsBoardColumns,
  draftsFilteredItems,
  openReviewForItem,
  openManualDraft,
}: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-4 bg-background border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Filter board..."
              value={draftsBoardFilterTerm}
              onChange={(e) => setDraftsBoardFilterTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-body bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground placeholder:text-muted-foreground shadow-neu-inset"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-body text-muted-foreground bg-background border border-border rounded-lg hover:bg-surface"
          >
            <Filter size={14} />
            View Options
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            {['U1', 'U2', 'U3'].map((label) => (
              <div
                key={label}
                className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center text-body-small text-muted-foreground"
              >
                {label}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={openManualDraft}
            className="bg-accent text-background px-4 py-1.5 rounded-lg text-body-small hover:bg-accent-hover shadow-neu-outset transition-colors uppercase tracking-widest"
            aria-label="Create Manual Draft"
          >
            Create Manual Draft
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6 bg-surface">
        <div className="flex gap-6 h-full min-w-max">
          {draftsBoardColumns.map((col) => {
            const columnItems = draftsFilteredItems.filter((it) => {
              if (col.key === 'DRAFT_READY') return it.status === 'DRAFT_READY' || it.status === 'DRAFT';
              return it.status === col.key;
            });

            return (
              <div key={col.key} className="w-80 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dotClass} shadow-neu-outset`} />
                    <h3 className="text-body-small text-muted-foreground uppercase tracking-widest">{col.label}</h3>
                    <span className="bg-background text-muted-foreground text-body-small px-2 py-0.5 rounded-full">
                      {columnItems.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={openManualDraft}
                    className="text-muted-foreground hover:text-brand-accent p-1 rounded-md hover:bg-background transition-colors"
                    title="Create Manual Draft"
                    aria-label={`Create Manual Draft in ${col.label} column`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 bg-background rounded-3xl p-2 border border-dashed border-border min-h-[500px]">
                  {columnItems.length > 0 ? (
                    columnItems.map((draft) => (
                      <button
                        key={draft.id}
                        type="button"
                        onClick={() => openReviewForItem(draft.id)}
                        className="bg-background p-4 rounded-xl border border-border shadow-neu-outset hover:shadow-neu-inset hover:border-accent/40 transition-colors cursor-pointer text-left w-full mb-3 relative overflow-hidden group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-body-small uppercase tracking-wider text-muted-foreground bg-surface px-1.5 py-0.5 rounded">
                            {draft.category}
                          </span>
                          <span className="text-muted-foreground group-hover:text-foreground" aria-label="More options">
                            <MoreVertical size={14} />
                          </span>
                        </div>

                        <h4 className="text-body text-foreground leading-tight mb-2 group-hover:text-brand-accent transition-colors">
                          {draft.title}
                        </h4>

                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-body-small text-muted-foreground">
                            <Clock size={12} />
                            {formatRelativeTime(draft.createdAt)}
                          </div>
                          <div className="flex items-center gap-1 text-body-small text-brand-accent">
                            <Zap size={12} fill="currentColor" />
                            {draft.relevanceScore}%
                          </div>
                          <div className="ml-auto text-body-small text-muted-foreground">
                            {draft.aiModel.split(' ').length > 2 ? draft.aiModel.split(' ')[2] : draft.aiModel}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-60">
                      <div className="w-10 h-10 border-2 border-dashed border-muted-foreground rounded-lg mb-2" />
                      <p className="text-body-small uppercase tracking-widest text-muted-foreground">Empty State</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

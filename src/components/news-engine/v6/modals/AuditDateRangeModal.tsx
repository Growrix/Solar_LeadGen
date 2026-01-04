'use client';

import React from 'react';
import { Calendar, X } from 'lucide-react';

export type AuditDateRange = {
  from: string;
  to: string;
} | null;

type Props = {
  dateRange: AuditDateRange;
  onApply: (range: AuditDateRange) => void;
  onClose: () => void;
};

export function AuditDateRangeModal({ dateRange, onApply, onClose }: Props) {
  const [from, setFrom] = React.useState(dateRange?.from ?? '');
  const [to, setTo] = React.useState(dateRange?.to ?? '');

  const handleApply = () => {
    if (from && to) {
      onApply({ from, to });
    } else if (!from && !to) {
      onApply(null);
    } else {
      onApply({ from: from || to, to: to || from });
    }
    onClose();
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    onApply(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-range-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-sm rounded-3xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-xl shadow-neu-inset text-brand-accent">
              <Calendar size={20} />
            </div>
            <h2 id="date-range-modal-title" className="text-heading-3 text-foreground">
              Filter by Date Range
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground bg-background rounded-lg shadow-neu-inset transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="date-from" className="block text-body-small text-muted-foreground uppercase tracking-widest">
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date-to" className="block text-body-small text-muted-foreground uppercase tracking-widest">
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-body text-muted-foreground hover:text-foreground hover:bg-surface shadow-neu-outset transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-body text-foreground hover:bg-surface shadow-neu-outset transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-xl shadow-neu-outset hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { AlertTriangle, Calendar, CalendarDays, CheckCircle2, Clock, Pin, TimerOff, X } from 'lucide-react';

export function ScheduleModal({
  item,
  onClose,
  onSchedule,
}: {
  item: NewsItem;
  onClose: () => void;
  onSchedule: (iso: string) => void;
}) {
  const [publishDate, setPublishDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = React.useState('09:00');
  const [priority, setPriority] = React.useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [hasExpiry, setHasExpiry] = React.useState(false);
  const [expiryDate, setExpiryDate] = React.useState('');
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const PriorityButton = ({ value }: { value: typeof priority }) => {
    const active = priority === value;
    return (
      <button
        type="button"
        onClick={() => setPriority(value)}
        className={`py-2 rounded-lg border transition-all text-body-small uppercase tracking-widest ${
          active
            ? 'bg-accent text-accent-foreground border-accent shadow-neu-outset'
            : 'bg-background border-border text-muted-foreground hover:bg-surface-hover'
        }`}
      >
        {value}
      </button>
    );
  };

  const Toggle = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-background transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const handleConfirm = () => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      const iso = new Date(`${publishDate}T${publishTime}:00`).toISOString();
      onSchedule(iso);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-md rounded-2xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 text-success rounded-lg border border-success/20 shadow-neu-inset">
              <Calendar size={20} />
            </div>
            <h2 id="schedule-modal-title" className="text-heading-4 text-foreground">
              Schedule Publication
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div className="bg-surface p-3 rounded-lg border border-border shadow-neu-inset">
            <p className="text-body-small uppercase tracking-widest text-muted-foreground">Target Story</p>
            <p className="text-body font-semibold text-foreground truncate mt-1">{item.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <CalendarDays size={14} /> Publish Date
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <Clock size={14} /> Time
              </label>
              <input
                type="time"
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle size={14} /> Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              <PriorityButton value="Low" />
              <PriorityButton value="Normal" />
              <PriorityButton value="High" />
              <PriorityButton value="Urgent" />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TimerOff size={16} className="text-muted-foreground" />
                <span className="text-body font-semibold text-foreground">Auto-Expiry</span>
              </div>
              <Toggle checked={hasExpiry} onToggle={() => setHasExpiry((v) => !v)} />
            </div>

            {hasExpiry ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
                />
                <p className="text-body-small text-muted-foreground italic">
                  Story will be unpublished automatically on this date.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin size={16} className="text-muted-foreground" />
                <span className="text-body font-semibold text-foreground">Pin as Featured</span>
              </div>
              <Toggle checked={isFeatured} onToggle={() => setIsFeatured((v) => !v)} />
            </div>
          </div>
        </div>

        <footer className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-lg text-body font-semibold shadow-neu-outset hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Schedule Story
          </button>
        </footer>
      </div>
    </div>
  );
}

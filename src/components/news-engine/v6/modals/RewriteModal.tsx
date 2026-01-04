'use client';

import React from 'react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { AlertCircle, Layers, MessageSquare, RotateCcw, Target, X } from 'lucide-react';

export function RewriteModal({
  item,
  onClose,
  onRewrite,
}: {
  item: NewsItem;
  onClose: () => void;
  onRewrite: (note: string) => void;
}) {
  const [reason, setReason] = React.useState('');
  const [intensity, setIntensity] = React.useState('Standard Rewrite (Balancing existing vs new)');
  const [focusAreas, setFocusAreas] = React.useState<string[]>(['Tone & Voice']);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const focusOptions = [
    'Tone & Voice',
    'Fact Density',
    'Structural Flow',
    'SEO Optimization',
    'Clarity & Conciseness',
    'Length (Shorter)',
    'Length (Longer)',
  ];

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason or instructions for the rewrite.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    window.setTimeout(() => {
      const note = `Instructions: ${reason.trim()}\nIntensity: ${intensity}\nFocus Areas: ${focusAreas.join(', ')}`;
      onRewrite(note);
      setIsSubmitting(false);
      setReason('');
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewrite-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-lg rounded-2xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-brand-accent rounded-lg border border-accent/20 shadow-neu-inset">
              <RotateCcw size={20} />
            </div>
            <h2 id="rewrite-modal-title" className="text-heading-4 text-foreground">
              Request AI Rewrite
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
          <div className="bg-accent/10 p-3 rounded-xl border border-accent/20 shadow-neu-inset">
            <p className="text-body-small uppercase tracking-widest text-muted-foreground">Target Draft</p>
            <p className="text-body text-foreground truncate mt-1">{item.title}</p>
          </div>

          <div className="space-y-2">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <MessageSquare size={14} /> Instructions &amp; Reasoning
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Tell the AI what needs to change (e.g., 'Make it more professional and focus more on the economic impact')..."
              className={`w-full h-28 px-4 py-3 bg-background border rounded-xl text-body focus:outline-none focus:ring-2 resize-none text-foreground placeholder:text-muted-foreground ${
                error ? 'border-destructive focus:ring-destructive/10' : 'border-border focus:ring-accent/20'
              }`}
            />
            {error ? (
              <p className="text-body-small text-destructive flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <Layers size={14} /> Rewrite Intensity
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
              aria-label="Rewrite intensity"
            >
              <option>Light Polish (Minor corrections)</option>
              <option>Standard Rewrite (Balancing existing vs new)</option>
              <option>Complete Overhaul (Fresh generation from scratch)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <Target size={14} /> Strategic Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((option) => {
                const active = focusAreas.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleFocusArea(option)}
                    className={`px-3 py-1.5 rounded-full border text-body-small ${
                      active
                        ? 'bg-accent text-accent-foreground border-accent shadow-neu-outset'
                        : 'bg-background border-border text-muted-foreground hover:bg-surface-hover'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-xl text-body shadow-neu-outset hover:bg-accent/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
            ) : (
              <RotateCcw size={18} />
            )}
            Send Rewrite Request
          </button>
        </footer>
      </div>
    </div>
  );
}

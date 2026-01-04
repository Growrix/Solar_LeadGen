'use client';

import React from 'react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { AlertCircle, AlertOctagon, CheckSquare, MessageSquare, Square, Trash2, X } from 'lucide-react';

export function RejectModal({
  item,
  onClose,
  onReject,
}: {
  item: NewsItem;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState('');
  const [categories, setCategories] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const rejectionCategories = [
    'Factual Inaccuracy',
    'Policy Violation',
    'Low Quality / Hallucination',
    'Off-topic / Irrelevant',
    'Grammar & Syntax Errors',
    'Biased Content',
  ];

  const toggleCategory = (cat: string) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const isFormValid = reason.trim().length > 0;

  const handleConfirm = () => {
    if (!isFormValid) {
      setTouched(true);
      return;
    }
    setIsSubmitting(true);
    window.setTimeout(() => {
      const note = categories.length
        ? `Categories: ${categories.join(', ')}\nFeedback: ${reason.trim()}`
        : reason.trim();
      onReject(note);
      setIsSubmitting(false);
      setReason('');
      setCategories([]);
      setTouched(false);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-md rounded-2xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 shadow-neu-inset">
              <AlertOctagon size={20} />
            </div>
            <h2 id="reject-modal-title" className="text-heading-4 text-foreground">
              Reject News Draft
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
          <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20 shadow-neu-inset">
            <p className="text-body-small uppercase tracking-widest text-muted-foreground">Permanently Rejecting</p>
            <p className="text-body text-foreground truncate mt-1">{item.title}</p>
          </div>

          <div className="space-y-3">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={14} /> Rejection Reasons
            </label>
            <div className="grid grid-cols-1 gap-2">
              {rejectionCategories.map((cat) => {
                const active = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left ${
                      active
                        ? 'bg-destructive/10 border-destructive/20 text-destructive'
                        : 'bg-background border-border text-muted-foreground hover:bg-surface-hover'
                    }`}
                  >
                    {active ? (
                      <CheckSquare size={18} className="text-destructive" />
                    ) : (
                      <Square size={18} className="text-muted-foreground" />
                    )}
                    <span className="text-body">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body-small text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
              <MessageSquare size={14} /> Detailed Feedback <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Provide specific feedback on why this draft is being rejected..."
              className={`w-full h-24 px-4 py-3 bg-background border rounded-xl text-body focus:outline-none focus:ring-2 resize-none text-foreground placeholder:text-muted-foreground ${
                touched && !isFormValid
                  ? 'border-destructive focus:ring-destructive/10'
                  : 'border-border focus:ring-accent/20'
              }`}
            />
            {touched && !isFormValid ? (
              <p className="text-body-small text-destructive flex items-center gap-2">
                <AlertCircle size={14} /> A rejection reason is required to audit the decision.
              </p>
            ) : null}
          </div>
        </div>

        <footer className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !isFormValid}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-body shadow-neu-outset disabled:opacity-50 ${
              isFormValid ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-border text-muted-foreground'
            }`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            Reject Draft
          </button>
        </footer>
      </div>
    </div>
  );
}

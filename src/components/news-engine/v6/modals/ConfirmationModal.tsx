'use client';

import React from 'react';
import type { NewsItem } from '@/lib/ui-stubs/news-engine';
import { AlertOctagon, CheckCircle2, Globe, Loader2, PauseCircle, X } from 'lucide-react';

type ConfirmationKindV6 = { type: 'PUBLISH_NOW' } | { type: 'PAUSE' } | { type: 'RESUME' } | { type: 'EMERGENCY_STOP' };

export function ConfirmationModal({
  kind,
  item,
  onClose,
  onConfirm,
}: {
  kind: ConfirmationKindV6;
  item: NewsItem | null;
  onClose: () => void;
  onConfirm: (typed: string) => void;
}) {
  const config = React.useMemo(() => {
    if (kind.type === 'PAUSE') {
      return {
        title: 'Pause Content Pipeline?',
        message:
          'This will halt all active AI research, RSS ingestion, and automated drafting tasks. Existing drafts will remain accessible for manual review.',
        confirmLabel: 'Confirm Pipeline Pause',
        variant: 'warning' as const,
        requireConfirmText: null as string | null,
      };
    }

    if (kind.type === 'RESUME') {
      return {
        title: 'Resume All Automations?',
        message: 'This will re-activate all background services including the research agents and drafting engine.',
        confirmLabel: 'Confirm Pipeline Resume',
        variant: 'success' as const,
        requireConfirmText: null as string | null,
      };
    }

    if (kind.type === 'EMERGENCY_STOP') {
      return {
        title: 'CRITICAL: System Lockdown',
        message:
          'You are about to initiate an immediate emergency stop. All active processes will be killed and the system will require manual admin reset.',
        confirmLabel: 'Initiate Emergency Stop',
        variant: 'danger' as const,
        requireConfirmText: 'LOCKDOWN',
      };
    }

    return {
      title: 'Confirm Live Publication',
      message: `You are about to publish "${item?.title ?? ''}" immediately to the live insights feed. This action cannot be undone.`,
      confirmLabel: 'Publish Now',
      variant: 'publish' as const,
      requireConfirmText: 'PUBLISH',
    };
  }, [kind.type, item?.title]);

  const needsTyped = Boolean(config.requireConfirmText);
  const [typed, setTyped] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setTyped('');
    setIsSubmitting(false);
  }, [kind.type]);

  const theme =
    kind.type === 'PAUSE'
      ? { icon: <PauseCircle size={28} />, iconClass: 'bg-warning/10 text-warning border-warning/30', ctaClass: 'bg-warning text-warning-foreground' }
      : kind.type === 'EMERGENCY_STOP'
        ? { icon: <AlertOctagon size={28} />, iconClass: 'bg-destructive/10 text-destructive border-destructive/30', ctaClass: 'bg-destructive text-destructive-foreground' }
        : kind.type === 'RESUME'
          ? { icon: <CheckCircle2 size={28} />, iconClass: 'bg-success/10 text-success border-success/30', ctaClass: 'bg-success text-success-foreground' }
          : { icon: <Globe size={28} />, iconClass: 'bg-accent/10 text-brand-accent border-accent/20', ctaClass: 'bg-accent text-accent-foreground' };

  const requiredText = config.requireConfirmText;
  const isConfirmDisabled = (needsTyped && typed !== requiredText) || isSubmitting;

  const handleConfirm = () => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      onConfirm(typed);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-sm rounded-3xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-10 text-center space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border ${theme.iconClass} shadow-neu-inset`}>
            {theme.icon}
          </div>

          <div className="space-y-2">
            <h3 id="confirmation-modal-title" className="text-heading-2 text-foreground">
              {config.title}
            </h3>
            <p className="text-body text-muted-foreground">{config.message}</p>
          </div>

          {needsTyped ? (
            <div className="space-y-3 pt-2">
              <label className="text-body-small uppercase tracking-widest text-muted-foreground block">
                Verification required: Type{' '}
                <span className="text-brand-accent">&quot;{requiredText}&quot;</span>
              </label>
              <input
                autoFocus
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className={`w-full px-4 py-3 bg-background border rounded-xl text-center text-body focus:outline-none transition-all placeholder:text-muted-foreground ${
                  typed === requiredText ? 'border-success focus:ring-2 focus:ring-success/10' : 'border-border focus:ring-2 focus:ring-accent/20'
                }`}
                placeholder="Type here..."
              />
            </div>
          ) : null}
        </div>

        <footer className="px-8 pb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-4 text-body-small text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-body-small uppercase tracking-widest shadow-neu-outset transition-all ${
              isConfirmDisabled ? 'bg-border text-muted-foreground shadow-none cursor-not-allowed' : `${theme.ctaClass} hover:opacity-95`
            }`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : config.confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

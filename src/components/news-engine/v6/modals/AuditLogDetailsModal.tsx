'use client';

import React from 'react';
import { FileText, X } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/ui-stubs/news-engine';
import { formatDateTime } from '../shared';

type Props = {
  log: AuditLogEntry | null;
  onClose: () => void;
};

export function AuditLogDetailsModal({ log, onClose }: Props) {
  if (!log) return null;

  const statusBadge = (status: AuditLogEntry['status']) => {
    const cls =
      status === 'INFO'
        ? 'bg-info/10 text-info border-info/30'
        : status === 'WARN'
          ? 'bg-warning/10 text-warning border-warning/30'
          : 'bg-destructive/10 text-destructive border-destructive/30';
    return <span className={`px-2 py-0.5 rounded-full text-body-small border uppercase tracking-widest ${cls}`}>{status}</span>;
  };

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-details-modal-title"
    >
      <div
        className="relative bg-surface w-full max-w-lg rounded-3xl shadow-neu-outset flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-xl shadow-neu-inset text-brand-accent">
              <FileText size={20} />
            </div>
            <h2 id="log-details-modal-title" className="text-heading-3 text-foreground">
              Log Details
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

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-body-small text-muted-foreground uppercase tracking-widest">Timestamp</p>
            <p className="text-body text-foreground">{formatDateTime(log.timestamp)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-body-small text-muted-foreground uppercase tracking-widest">Action</p>
            <p className="text-body text-foreground font-semibold">{log.action}</p>
          </div>

          <div className="space-y-2">
            <p className="text-body-small text-muted-foreground uppercase tracking-widest">Origin</p>
            <p className="text-body text-foreground capitalize">{log.origin}</p>
          </div>

          <div className="space-y-2">
            <p className="text-body-small text-muted-foreground uppercase tracking-widest">Status</p>
            <div>{statusBadge(log.status)}</div>
          </div>

          {log.promptUsed ? (
            <div className="space-y-2">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Prompt</p>
              <p className="text-body text-foreground italic">Prompt data available (use Prompt Details for full view)</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-body-small text-muted-foreground uppercase tracking-widest">Prompt</p>
              <p className="text-body text-muted-foreground italic">No prompt recorded</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-xl shadow-neu-outset hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

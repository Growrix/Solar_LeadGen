'use client';

import React, { useState } from 'react';
import { X, CheckCircle, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import type { CommentStatus } from '@/components/admin/blog/shared/commentTypes';

type BulkModerateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
  action: CommentStatus | null;
  count: number;
  isLoading?: boolean;
};

export function BulkModerateModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  count,
  isLoading = false,
}: BulkModerateModalProps) {
  const [note, setNote] = useState('');

  if (!isOpen || !action) return null;

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  const config = {
    approved: {
      title: 'Approve Comments',
      icon: CheckCircle,
      color: 'text-success',
      btnColor: 'bg-success hover:bg-success/90 text-success-foreground',
      description: `Are you sure you want to approve ${count} selected comments? They will become visible to the public.`,
    },
    hidden: {
      title: 'Hide Comments',
      icon: EyeOff,
      color: 'text-foreground-muted',
      btnColor: 'bg-foreground hover:bg-foreground/90 text-background',
      description: `Are you sure you want to hide ${count} selected comments? They will only be visible to admins.`,
    },
    spam: {
      title: 'Mark as Spam',
      icon: ShieldAlert,
      color: 'text-warning',
      btnColor: 'bg-warning hover:bg-warning/90 text-warning-foreground',
      description: `Are you sure you want to mark ${count} selected comments as spam?`,
    },
    pending: {
      title: '',
      icon: X,
      color: '',
      btnColor: '',
      description: '',
    },
  } as const;

  const currentConfig = (config as any)[action] ?? config.approved;
  const Icon = currentConfig.icon as any;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            <Icon className={`icon-sm ${currentConfig.color}`} />
            {currentConfig.title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-body-small text-foreground-muted mb-6">{currentConfig.description}</p>

          <div>
            <label className="block text-label text-foreground uppercase tracking-wider mb-2">
              Internal Note <span className="normal-case text-foreground-muted">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a reason for this bulk action..."
              className="w-full px-3 py-2 text-body-small border border-border rounded-input bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-button text-button shadow-button transition-colors flex items-center gap-2 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${currentConfig.btnColor}`}
          >
            {isLoading && <Loader2 className="icon-sm animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

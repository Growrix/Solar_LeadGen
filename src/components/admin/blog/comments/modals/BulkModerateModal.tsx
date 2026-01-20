'use client';

import React from 'react';
import Button from '@/components/Button';
import type { CommentStatus } from '@/components/admin/blog/shared/blogPrototypeStore';

const LABELS: Record<CommentStatus, string> = {
  approved: 'Approve',
  hidden: 'Hide',
  spam: 'Mark as Spam',
  pending: 'Mark Pending',
};

export default function BulkModerateModal(props: {
  isOpen: boolean;
  action: CommentStatus | null;
  count: number;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}) {
  const { isOpen, action, count, isLoading, onClose, onConfirm } = props;
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setNote('');
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="theme-card w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground">Bulk Moderation</h2>
          <p className="text-body-small text-muted-foreground">
            {LABELS[action]} {count} selected comment(s).
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
          <label className="block text-body-small text-muted-foreground mb-2">Moderator note (optional)</label>
          <textarea
            className="form-input w-full min-h-[100px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note…"
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(note.trim() || undefined)}
            disabled={isLoading}
          >
            {isLoading ? 'Working…' : LABELS[action]}
          </Button>
        </div>
      </div>
    </div>
  );
}

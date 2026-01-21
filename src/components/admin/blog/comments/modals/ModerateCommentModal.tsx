'use client';

import React from 'react';
import Button from '@/components/Button';
import type { CommentItem, CommentStatus } from '@/components/admin/blog/shared/blogPrototypeStore';

function StatusButton(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`px-4 py-2 rounded-xl text-body-small shadow-neu-outset transition-colors ${
        props.active ? 'bg-background text-foreground' : 'bg-surface text-muted-foreground hover:text-foreground'
      }`}
    >
      {props.label}
    </button>
  );
}

export default function ModerateCommentModal(props: {
  isOpen: boolean;
  comment: CommentItem | null;
  onClose: () => void;
  onAction: (status: CommentStatus, note?: string) => void;
}) {
  const { isOpen, comment, onClose, onAction } = props;
  const [selected, setSelected] = React.useState<CommentStatus>('approved');
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (!isOpen || !comment) return;
    setSelected(comment.status);
    setNote('');
  }, [isOpen, comment]);

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

  if (!isOpen || !comment) return null;

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="theme-card w-full max-w-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading-3 text-foreground">Moderate Comment</h2>
            <p className="text-body-small text-muted-foreground">Choose an action and optionally add a note.</p>
          </div>
          <Button variant="secondary" className="px-3 py-2" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <div className="text-body text-foreground mb-1">{comment.authorName}</div>
            <div className="text-body-small text-muted-foreground mb-3">{comment.authorEmail}</div>
            <div className="text-body text-foreground">{comment.content}</div>
            <div className="mt-3 text-body-small text-muted-foreground">
              Post: {comment.postTitle} • Submitted: {comment.submittedAt}
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <div className="text-body-small text-muted-foreground mb-2">Action</div>
            <div className="flex flex-wrap gap-3">
              <StatusButton label="Approve" active={selected === 'approved'} onClick={() => setSelected('approved')} />
              <StatusButton label="Hide" active={selected === 'hidden'} onClick={() => setSelected('hidden')} />
              <StatusButton label="Spam" active={selected === 'spam'} onClick={() => setSelected('spam')} />
              <StatusButton label="Pending" active={selected === 'pending'} onClick={() => setSelected('pending')} />
            </div>
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
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onAction(selected, note.trim() || undefined);
              onClose();
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

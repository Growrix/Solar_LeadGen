'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  EyeOff,
  ShieldAlert,
  FileText,
  ExternalLink,
} from 'lucide-react';
import type { Comment, CommentStatus } from '@/components/admin/blog/shared/commentTypes';

type ModerateCommentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  comment: Comment | null;
  onAction: (action: CommentStatus, note?: string) => void;
};

export function ModerateCommentModal({ isOpen, onClose, comment, onAction }: ModerateCommentModalProps) {
  const [internalNote, setInternalNote] = useState('');

  if (!isOpen || !comment) return null;

  const handleAction = (status: CommentStatus) => {
    onAction(status, internalNote);
    setInternalNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            <MessageSquare className="icon-sm text-muted-foreground" />
            Moderate Comment
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-start gap-4 mb-6">
            <Image
              src={comment.authorAvatar}
              alt={comment.authorName}
              width={48}
              height={48}
              sizes="48px"
              className="w-12 h-12 rounded-full border border-border bg-background-alt object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-label text-foreground">{comment.authorName}</h4>
              <p className="text-caption text-foreground-muted mb-1">{comment.authorEmail}</p>
              <div className="flex items-center gap-3 text-caption text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Clock className="icon-xs" /> {comment.submittedAt}
                </span>
                <span
                  className={`capitalize px-1.5 py-0.5 rounded border ${
                    comment.status === 'approved'
                      ? 'bg-success/15 border-success/20 text-success'
                      : comment.status === 'spam'
                        ? 'bg-error/15 border-error/20 text-error'
                        : comment.status === 'hidden'
                          ? 'bg-muted border-border text-foreground-muted'
                          : 'bg-warning/15 border-warning/20 text-warning'
                  }`}
                >
                  {comment.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-3 bg-background-alt rounded-card border border-border flex items-center justify-between group">
            <div className="flex items-center gap-2 text-body-small text-foreground-muted truncate">
              <FileText className="icon-sm text-muted-foreground" />
              <span className="truncate">
                On: <span className="text-foreground">{comment.postTitle}</span>
              </span>
            </div>
            <a
              href={`/blog/${comment.postSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-accent p-1"
              title="View Post"
            >
              <ExternalLink className="icon-sm" />
            </a>
          </div>

          <div className="mb-6">
            <label className="block text-label text-foreground uppercase tracking-wider mb-2">
              Comment Content
            </label>
            <div className="bg-surface border border-border rounded-card p-4 text-body-small text-foreground shadow-card">
              {comment.content}
            </div>
          </div>

          <div>
            <label className="block text-label text-foreground uppercase tracking-wider mb-2">
              Internal Note <span className="normal-case text-foreground-muted">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a reason for your decision..."
              className="w-full px-3 py-2 text-body-small border border-border rounded-input bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-button text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex gap-2">
            <button
              onClick={() => handleAction('spam')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-surface border border-error/30 text-error hover:bg-error/10 rounded-button text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              title="Mark as Spam"
            >
              <ShieldAlert className="icon-sm" />
              <span className="sm:hidden">Spam</span>
            </button>

            <button
              onClick={() => handleAction('hidden')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-surface border border-border text-foreground hover:bg-surface-hover rounded-button text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <EyeOff className="icon-sm" />
              Hide
            </button>

            <button
              onClick={() => handleAction('approved')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-success-foreground rounded-button text-button shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <CheckCircle className="icon-sm" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

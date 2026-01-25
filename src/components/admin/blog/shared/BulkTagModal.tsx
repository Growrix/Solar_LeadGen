'use client';

import React, { useState } from 'react';
import { X, Tag, Loader2, Plus } from 'lucide-react';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (tags: string[]) => void;
}

export function BulkTagModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: BulkTagModalProps) {
  const [tagsInput, setTagsInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!tagsInput.trim()) return;

    setIsProcessing(true);
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setTimeout(() => {
      onConfirm(tags);
      setIsProcessing(false);
      setTagsInput('');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      />

      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            <Tag className="icon-sm text-accent" />
            Bulk Assign Tags
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-body-small text-foreground-muted mb-4">
            Add tags to <strong>{selectedCount}</strong> selected posts. Existing tags will be
            preserved.
          </p>

          <div className="space-y-2">
            <label className="block text-label text-foreground uppercase tracking-wider">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Solar, Innovation, 2024"
              className="w-full px-3 py-2 border border-border rounded-input text-body-small text-foreground bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || !tagsInput.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors shadow-button disabled:opacity-70 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {isProcessing ? <Loader2 className="icon-sm animate-spin" /> : <Plus className="icon-sm" />}
            Add Tags
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Button from '@/components/Button';

export default function BulkEditMediaModal(props: {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (updates: { altText?: string; caption?: string; tags?: string[] }) => void;
}) {
  const { isOpen, count, onClose, onConfirm } = props;
  const [altText, setAltText] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [tags, setTags] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setAltText('');
    setCaption('');
    setTags('');
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

  if (!isOpen) return null;

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-surface shadow-neu-outset p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-heading-2 text-foreground mb-1">Bulk Edit</h2>
          <p className="text-body-small text-muted-foreground">
            Apply updates to {count} selected item{count > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-2xl bg-background shadow-neu-inset p-5">
            <label className="block text-body-small text-muted-foreground mb-3">Alt text</label>
            <input
              className={inputClass}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the images for accessibility..."
            />
          </div>
          <div className="rounded-2xl bg-background shadow-neu-inset p-5">
            <label className="block text-body-small text-muted-foreground mb-3">Caption</label>
            <input
              className={inputClass}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption text..."
            />
          </div>
          <div className="rounded-2xl bg-background shadow-neu-inset p-5">
            <label className="block text-body-small text-muted-foreground mb-3">Tags (comma-separated)</label>
            <input
              className={inputClass}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
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
              onConfirm({
                altText: altText.trim() || undefined,
                caption: caption.trim() || undefined,
                tags: tagList.length ? tagList : undefined,
              });
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

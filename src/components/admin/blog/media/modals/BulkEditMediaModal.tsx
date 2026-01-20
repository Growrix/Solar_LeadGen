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

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="theme-card w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground">Bulk Edit</h2>
          <p className="text-body-small text-muted-foreground">Apply updates to {count} selected items.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Alt text</label>
            <input className="form-input w-full" value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Caption</label>
            <input className="form-input w-full" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Tags (comma-separated)</label>
            <input className="form-input w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
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

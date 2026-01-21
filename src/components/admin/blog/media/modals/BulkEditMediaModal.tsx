'use client';

import React from 'react';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const buttonBase =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';
const buttonSecondary = cn(buttonBase, 'border border-border bg-card text-foreground hover:bg-muted');
const buttonPrimary = cn(buttonBase, 'bg-primary text-primary-foreground hover:opacity-90');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4 py-8" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground">Bulk Edit</h2>
          <p className="text-body-small text-muted-foreground">Apply updates to {count} selected items.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Alt text</label>
            <input className="form-input w-full" value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Caption</label>
            <input className="form-input w-full" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Tags (comma-separated)</label>
            <input className="form-input w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonPrimary}
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
          </button>
        </div>
      </div>
    </div>
  );
}

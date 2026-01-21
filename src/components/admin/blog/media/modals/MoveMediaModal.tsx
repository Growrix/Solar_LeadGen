'use client';

import React from 'react';
import type { MediaFolder } from '@/components/admin/blog/shared/blogPrototypeStore';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const buttonBase =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';
const buttonSecondary = cn(buttonBase, 'border border-border bg-card text-foreground hover:bg-muted');
const buttonPrimary = cn(buttonBase, 'bg-primary text-primary-foreground hover:opacity-90');

export default function MoveMediaModal(props: {
  isOpen: boolean;
  folders: MediaFolder[];
  defaultFolderId: string | null;
  count: number;
  onClose: () => void;
  onMove: (folderId: string | null) => void;
}) {
  const { isOpen, folders, defaultFolderId, count, onClose, onMove } = props;
  const [folderId, setFolderId] = React.useState<string | null>(defaultFolderId);

  React.useEffect(() => {
    if (!isOpen) return;
    setFolderId(defaultFolderId);
  }, [isOpen, defaultFolderId]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4 py-8" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground">Move Media</h2>
          <p className="text-body-small text-muted-foreground">Move {count} item(s) to a folder.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <label className="block text-body-small text-muted-foreground mb-2">Destination folder</label>
          <select
            className="form-input w-full"
            value={folderId ?? ''}
            onChange={(e) => setFolderId(e.target.value ? e.target.value : null)}
          >
            <option value="">(Root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => {
              onMove(folderId);
              onClose();
            }}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}

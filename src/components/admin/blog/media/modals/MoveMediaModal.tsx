'use client';

import React from 'react';
import Button from '@/components/Button';
import type { MediaFolder } from '@/components/admin/blog/shared/blogPrototypeStore';

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

  const selectClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small appearance-none cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-surface shadow-neu-outset p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-heading-2 text-foreground mb-1">Move Media</h2>
          <p className="text-body-small text-muted-foreground">
            Move {count} item{count > 1 ? 's' : ''} to a folder.
          </p>
        </div>

        <div className="rounded-2xl bg-background shadow-neu-inset p-5">
          <label className="block text-body-small text-muted-foreground mb-3">Destination folder</label>
          <select
            className={selectClass}
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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onMove(folderId);
              onClose();
            }}
          >
            Move
          </Button>
        </div>
      </div>
    </div>
  );
}

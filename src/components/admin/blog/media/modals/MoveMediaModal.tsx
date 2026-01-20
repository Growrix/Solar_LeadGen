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

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="theme-card w-full max-w-lg p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6">
          <h2 className="text-heading-3 text-foreground">Move Media</h2>
          <p className="text-body-small text-muted-foreground">Move {count} item(s) to a folder.</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
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

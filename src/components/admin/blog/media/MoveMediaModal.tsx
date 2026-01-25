'use client';

import React, { useMemo, useState } from 'react';
import { Folder as FolderIcon, FolderInput, Loader2, X } from 'lucide-react';

export interface MoveMediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
}

interface MoveMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  folders: MoveMediaFolder[];
  onConfirm: (folderId: string | null) => void;
}

export function MoveMediaModal({ isOpen, onClose, selectedCount, folders, onConfirm }: MoveMediaModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const foldersByParent = useMemo(() => {
    const map = new Map<string | null, MoveMediaFolder[]>();
    for (const folder of folders) {
      const key = folder.parentId ?? null;
      const list = map.get(key) ?? [];
      list.push(folder);
      map.set(key, list);
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      map.set(key, list);
    }
    return map;
  }, [folders]);

  if (!isOpen) return null;

  const renderFolderOptions = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const children = foldersByParent.get(parentId) ?? [];
    if (children.length === 0) return null;

    return children.map(folder => (
      <React.Fragment key={folder.id}>
        <option value={folder.id}>
          {'\u00A0\u00A0'.repeat(depth)} 📁 {folder.name}
        </option>
        {renderFolderOptions(folder.id, depth + 1)}
      </React.Fragment>
    ));
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedFolderId);
      setIsProcessing(false);
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
            <FolderInput className="w-5 h-5 text-primary" />
            Move {selectedCount} Item{selectedCount !== 1 ? 's' : ''}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-label text-foreground mb-2">Select Destination Folder</label>
          <div className="relative">
            <select
              value={selectedFolderId || 'root'}
              onChange={(e) => setSelectedFolderId(e.target.value === 'root' ? null : e.target.value)}
              className="w-full px-3 py-2.5 border border-input rounded-input text-body bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 appearance-none"
            >
              <option value="root">🏠 Root</option>
              {renderFolderOptions(null)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <FolderIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <p className="text-body-small text-muted-foreground mt-2">
            Items will be moved from their current location to the selected folder.
          </p>
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderInput className="w-4 h-4" />}
            Move Items
          </button>
        </div>
      </div>
    </div>
  );
}

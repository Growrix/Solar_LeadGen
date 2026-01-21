'use client';

import React from 'react';
import { AdminButton, AdminInput, AdminCard } from '@/components/admin/ui';
import type { MediaFolder } from '@/components/admin/blog/shared/blogPrototypeStore';

function buildTree(folders: MediaFolder[]) {
  const byParent = new Map<string | null, MediaFolder[]>();
  for (const folder of folders) {
    const key = folder.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(folder);
    byParent.set(key, list);
  }

  const sortByName = (a: MediaFolder, b: MediaFolder) => a.name.localeCompare(b.name);
  for (const [k, list] of byParent.entries()) {
    list.sort(sortByName);
    byParent.set(k, list);
  }

  return byParent;
}

export default function FolderTree(props: {
  folders: MediaFolder[];
  currentFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
}) {
  const { folders, currentFolderId, onSelectFolder, onAddFolder } = props;
  const [newFolderName, setNewFolderName] = React.useState('');
  const byParent = React.useMemo(() => buildTree(folders), [folders]);

  const renderNodes = (parentId: string | null, depth: number) => {
    const nodes = byParent.get(parentId) ?? [];
    return (
      <div className="space-y-0.5">
        {nodes.map((f) => {
          const active = currentFolderId === f.id;
          return (
            <div key={f.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectFolder(f.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-[var(--admin-radius)] text-sm transition-all duration-150
                  ${active
                    ? 'bg-[var(--admin-primary-muted)] text-[var(--admin-fg-primary)] font-medium border-l-2 border-[var(--admin-primary)]'
                    : 'text-[var(--admin-fg-secondary)] hover:text-[var(--admin-fg-primary)] hover:bg-[var(--admin-bg-hover)]'
                  }
                `}
                style={{ paddingLeft: `${12 + depth * 16}px` }}
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M2 4C2 3.44772 2.44772 3 3 3H6L7.5 5H13C13.5523 5 14 5.44772 14 6V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity="0.2"/>
                  </svg>
                  {f.name}
                </span>
              </button>
              {renderNodes(f.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminCard variant="elevated" padding="lg">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-[var(--admin-fg-primary)]">Folders</h3>
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className="text-xs text-[var(--admin-primary)] hover:text-[var(--admin-primary-hover)] transition-colors font-medium"
        >
          Go to Root
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <AdminInput
          value={newFolderName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
          placeholder="New folder..."
          size="sm"
        />
        <AdminButton
          variant="secondary"
          size="sm"
          disabled={!newFolderName.trim()}
          onClick={() => {
            onAddFolder(newFolderName.trim(), currentFolderId);
            setNewFolderName('');
          }}
        >
          Add
        </AdminButton>
      </div>

      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={`
            w-full text-left px-3 py-2 rounded-[var(--admin-radius)] text-sm transition-all duration-150
            ${currentFolderId === null
              ? 'bg-[var(--admin-primary-muted)] text-[var(--admin-fg-primary)] font-medium border-l-2 border-[var(--admin-primary)]'
              : 'text-[var(--admin-fg-secondary)] hover:text-[var(--admin-fg-primary)] hover:bg-[var(--admin-bg-hover)]'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            All Media
          </span>
        </button>
        {renderNodes(null, 0)}
      </div>
    </AdminCard>
  );
}

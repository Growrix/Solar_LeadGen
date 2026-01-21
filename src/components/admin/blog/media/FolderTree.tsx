'use client';

import React from 'react';
import Button from '@/components/Button';
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
      <div className={depth === 0 ? 'space-y-1' : 'space-y-1'}>
        {nodes.map((f) => {
          const active = currentFolderId === f.id;
          return (
            <div key={f.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectFolder(f.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-body-small transition-colors ${
                  active ? 'bg-background text-foreground shadow-neu-inset' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                {f.name}
              </button>
              {renderNodes(f.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-2xl shadow-neu-outset p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-heading-6 text-foreground">Folders</div>
        <Button variant="secondary" className="px-3 py-2" onClick={() => onSelectFolder(null)}>
          Root
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder…"
          className="form-input flex-1 px-3 py-2"
        />
        <Button
          variant="secondary"
          className="px-3 py-2"
          disabled={!newFolderName.trim()}
          onClick={() => {
            onAddFolder(newFolderName.trim(), currentFolderId);
            setNewFolderName('');
          }}
        >
          Add
        </Button>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-xl text-body-small transition-colors ${
            currentFolderId === null
              ? 'bg-background text-foreground shadow-neu-inset'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Media
        </button>
        {renderNodes(null, 0)}
      </div>
    </div>
  );
}

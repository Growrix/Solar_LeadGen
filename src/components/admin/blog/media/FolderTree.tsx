'use client';

import React from 'react';
import Button from '@/components/Button';
import type { MediaFolder } from '@/components/admin/blog/shared/blogPrototypeStore';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

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
      <div className="space-y-1">
        {nodes.map((f) => {
          const active = currentFolderId === f.id;
          return (
            <div key={f.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectFolder(f.id)}
                className={cn(
                  'w-full text-left px-4 py-2.5 rounded-xl text-body-small transition-all duration-200',
                  active
                    ? 'bg-background text-foreground shadow-neu-inset font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
                style={{ paddingLeft: `${16 + depth * 16}px` }}
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

  const inputClass = 'flex-1 px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small';

  return (
    <div className="bg-surface rounded-2xl shadow-neu-outset p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-heading-4 text-foreground font-medium">Folders</div>
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className="px-3 py-1.5 rounded-lg text-body-small text-primary hover:text-primary/80 transition-colors"
        >
          Root
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder..."
          className={inputClass}
        />
        <Button
          variant="secondary"
          className="px-4 py-2"
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
          className={cn(
            'w-full text-left px-4 py-2.5 rounded-xl text-body-small transition-all duration-200',
            currentFolderId === null
              ? 'bg-background text-foreground shadow-neu-inset font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          All Media
        </button>
        {renderNodes(null, 0)}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

type MediaType = 'image' | 'video' | 'document';

type MediaItem = {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  uploadedAt: string;
  folder?: string | null;
};

type TabKey = 'LIBRARY' | 'TRASH';

type Toast = { message: string; type: 'success' | 'error' };

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getMockLibrary(): MediaItem[] {
  return [
    {
      id: 'm1',
      name: 'solar-panels-hero.jpg',
      type: 'image',
      url: 'https://example.com/solar-panels-hero.jpg',
      uploadedAt: new Date().toISOString(),
      folder: null,
    },
    {
      id: 'm2',
      name: 'case-study.pdf',
      type: 'document',
      url: 'https://example.com/case-study.pdf',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      folder: 'Case Studies',
    },
  ];
}

export function MediaLibrary() {
  const [tab, setTab] = React.useState<TabKey>('LIBRARY');
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | MediaType>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const [library, setLibrary] = React.useState<MediaItem[]>(() => getMockLibrary());
  const [trash, setTrash] = React.useState<MediaItem[]>([]);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<Toast | null>(null);

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [detailsItem, setDetailsItem] = React.useState<MediaItem | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const source = tab === 'LIBRARY' ? library : trash;

  const filtered = source.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const moveToTrash = (ids: string[]) => {
    if (ids.length === 0) return;

    setLibrary((prev) => {
      const toTrash = prev.filter((x) => ids.includes(x.id));
      setTrash((t) => [...toTrash, ...t]);
      return prev.filter((x) => !ids.includes(x.id));
    });

    clearSelection();
    setToast({ message: 'Moved to trash', type: 'success' });
  };

  const restoreFromTrash = (ids: string[]) => {
    if (ids.length === 0) return;

    setTrash((prev) => {
      const toRestore = prev.filter((x) => ids.includes(x.id));
      setLibrary((l) => [...toRestore, ...l]);
      return prev.filter((x) => !ids.includes(x.id));
    });

    clearSelection();
    setToast({ message: 'Restored', type: 'success' });
  };

  const hardDelete = (ids: string[]) => {
    if (ids.length === 0) return;

    setTrash((prev) => prev.filter((x) => !ids.includes(x.id)));
    clearSelection();
    setToast({ message: 'Deleted permanently', type: 'success' });
  };

  const selected = Array.from(selectedIds);

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          className={
            toast.type === 'success'
              ? 'bg-success/10 border border-success/20 rounded-2xl p-4'
              : 'bg-error/10 border border-error/20 rounded-2xl p-4'
          }
        >
          <p className={toast.type === 'success' ? 'text-body text-success' : 'text-body text-error'}>
            {toast.message}
          </p>
        </div>
      ) : null}

      <div className="bg-surface rounded-2xl shadow-neu-outset p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab('LIBRARY');
                clearSelection();
              }}
              className={tab === 'LIBRARY' ? 'btn-neu px-3 py-2 text-ui shadow-neu-inset' : 'btn-neu px-3 py-2 text-ui'}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('TRASH');
                clearSelection();
              }}
              className={tab === 'TRASH' ? 'btn-neu px-3 py-2 text-ui shadow-neu-inset' : 'btn-neu px-3 py-2 text-ui'}
            >
              Trash
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              Upload
            </Button>
            <Button
              variant="secondary"
              onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
            >
              View: {viewMode === 'grid' ? 'Grid' : 'List'}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <NeumorphicInput
            label="Search"
            placeholder="Search media"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-body-small text-foreground">Type</label>
            <select
              className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
              value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | MediaType)}
            >
              <option value="all">All</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-body-small text-foreground">Status</label>
            <div className="bg-background rounded-xl shadow-neu-inset border border-border/50 px-4 py-3 text-body text-muted-foreground">
              {tab === 'LIBRARY' ? 'Active' : 'In Trash'}
            </div>
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-body text-muted-foreground">Selected: {selected.length}</p>

            <div className="flex items-center gap-2">
              {tab === 'LIBRARY' ? (
                <>
                  <Button variant="secondary" onClick={() => moveToTrash(selected)}>
                    Move to Trash
                  </Button>
                  <Button variant="secondary" onClick={clearSelection}>
                    Clear
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => restoreFromTrash(selected)}>
                    Restore
                  </Button>
                  <Button
                    variant="secondary"
                    className="border border-error/30 text-error"
                    onClick={() => hardDelete(selected)}
                  >
                    Delete
                  </Button>
                  <Button variant="secondary" onClick={clearSelection}>
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-body text-muted-foreground">No media found.</p>
            <p className="text-body-small text-muted-foreground mt-2">
              Media backend is not connected yet; this page currently uses UI-only mock data.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDetailsItem(item)}
                className="text-left bg-background rounded-2xl border border-border shadow-neu-outset p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body text-foreground break-words">{item.name}</p>
                    <p className="text-body-small text-muted-foreground mt-1">
                      {item.type.toUpperCase()} • {formatDate(item.uploadedAt)}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4"
                    aria-label="Select media"
                  />
                </div>

                <div className="mt-3">
                  <p className="text-body-small text-muted-foreground">URL</p>
                  <p className="text-body-small text-foreground break-words">{item.url}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="text-body-small text-muted-foreground">
                  <th className="text-left py-2 pr-3">Select</th>
                  <th className="text-left py-2 pr-3">Name</th>
                  <th className="text-left py-2 pr-3">Type</th>
                  <th className="text-left py-2 pr-3">Uploaded</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4"
                        aria-label="Select media"
                      />
                    </td>
                    <td className="py-3 pr-3 text-foreground">{item.name}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{item.type.toUpperCase()}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{formatDate(item.uploadedAt)}</td>
                    <td className="py-3 text-right">
                      <button type="button" className="btn-neu px-3 py-2 text-ui" onClick={() => setDetailsItem(item)}>
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(item) => {
          setLibrary((prev) => [item, ...prev]);
          setToast({ message: 'Uploaded (UI-only)', type: 'success' });
        }}
      />

      <DetailsModal
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onCopy={() => setToast({ message: 'Copied URL (UI-only)', type: 'success' })}
      />
    </div>
  );
}

function ModalShell(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { title, open, onClose, children, footer } = props;
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface border border-border rounded-xl shadow-neu-outset max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4">
          <h2 className="text-foreground text-heading-3">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex justify-end gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function UploadModal(props: {
  open: boolean;
  onClose: () => void;
  onUploaded: (item: MediaItem) => void;
}) {
  const { open, onClose, onUploaded } = props;
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<MediaType>('image');
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setName('');
    setUrl('');
    setType('image');
  }, [open]);

  return (
    <ModalShell
      title="Upload Media"
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const next: MediaItem = {
                id: `m_${Math.random().toString(36).slice(2)}`,
                name: name.trim() || 'untitled',
                type,
                url: url.trim() || 'https://example.com/asset',
                uploadedAt: new Date().toISOString(),
                folder: null,
              };
              onUploaded(next);
              onClose();
            }}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <NeumorphicInput label="File name" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="space-y-2">
          <label className="block text-body-small text-foreground">Type</label>
          <select
            className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
            value={type}
            onChange={(e) => setType(e.target.value as MediaType)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
        </div>

        <NeumorphicInput label="URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />

        <div className="bg-muted/20 border border-border rounded-2xl p-4">
          <p className="text-body-small text-muted-foreground">
            Backend is not connected yet. This upload modal is UI-only and will store items in memory.
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function DetailsModal(props: {
  item: MediaItem | null;
  onClose: () => void;
  onCopy: () => void;
}) {
  const { item, onClose, onCopy } = props;
  const open = Boolean(item);

  return (
    <ModalShell
      title="Media Details"
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              if (!item) return;
              try {
                void navigator.clipboard.writeText(item.url);
              } catch {
                // ignore
              }
              onCopy();
            }}
            disabled={!item}
          >
            Copy URL
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      {item ? (
        <div className="space-y-3">
          <div>
            <p className="text-body-small text-muted-foreground">Name</p>
            <p className="text-body text-foreground break-words">{item.name}</p>
          </div>
          <div>
            <p className="text-body-small text-muted-foreground">Type</p>
            <p className="text-body text-foreground">{item.type.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-body-small text-muted-foreground">URL</p>
            <p className="text-body text-foreground break-words">{item.url}</p>
          </div>
          <div>
            <p className="text-body-small text-muted-foreground">Uploaded</p>
            <p className="text-body text-foreground">{formatDate(item.uploadedAt)}</p>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import ConfirmDialog from '@/components/admin/blog/shared/ConfirmDialog';
import FolderTree from '@/components/admin/blog/media/FolderTree';
import UploadMediaModal from '@/components/admin/blog/media/modals/UploadMediaModal';
import MediaDetailsModal from '@/components/admin/blog/media/modals/MediaDetailsModal';
import MoveMediaModal from '@/components/admin/blog/media/modals/MoveMediaModal';
import BulkEditMediaModal from '@/components/admin/blog/media/modals/BulkEditMediaModal';
import { useBlogPrototypeStore, type MediaItem, type MediaType, type TrashedMediaItem } from '@/components/admin/blog/shared/blogPrototypeStore';

type TabKey = 'library' | 'trash';

type Notification = { message: string; type: 'success' | 'error' };

function parseDate(dateStr: string): number {
  if (dateStr === 'Just now') return new Date().getTime();
  return Date.parse(dateStr) || 0;
}

function MediaThumb({ item }: { item: MediaItem }) {
  if (item.type === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.url} alt={item.altText ?? item.name} className="w-full h-full object-cover" />;
  }

  if (item.type === 'video') {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <span className="text-body-small">Video</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      <span className="text-body-small">Document</span>
    </div>
  );
}

export default function MediaLibrary() {
  const router = useRouter();
  const store = useBlogPrototypeStore();

  const [activeTab, setActiveTab] = React.useState<TabKey>('library');
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | MediaType>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [thumbnailSize, setThumbnailSize] = React.useState(200);

  const [showDateFilter, setShowDateFilter] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [notification, setNotification] = React.useState<Notification | null>(null);

  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [detailsItem, setDetailsItem] = React.useState<MediaItem | null>(null);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);

  const [confirmState, setConfirmState] = React.useState<
    | null
    | {
        kind: 'trash' | 'restore' | 'delete';
        ids: string[];
      }
  >(null);

  React.useEffect(() => {
    const timer = notification ? window.setTimeout(() => setNotification(null), 3000) : undefined;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [notification]);

  React.useEffect(() => {
    // mimic prototype behavior: clear filters on tab change
    setSelectedIds(new Set());
    setSearchQuery('');
    setTypeFilter('all');
    setShowDateFilter(false);
    setDateRange({ start: '', end: '' });
  }, [activeTab]);

  const sourceList: Array<MediaItem | TrashedMediaItem> = activeTab === 'library' ? store.media : store.trashedMedia;

  const filtered = React.useMemo(() => {
    return sourceList.filter((raw) => {
      const item = raw as MediaItem;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const itemTime = parseDate(item.uploadedAt);
        if (dateRange.start) {
          const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
          if (itemTime < startTime) matchesDate = false;
        }
        if (dateRange.end && matchesDate) {
          const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);
          if (itemTime > endTime) matchesDate = false;
        }
      }

      let matchesFolder = true;
      if (activeTab === 'library' && !searchQuery && !dateRange.start && !dateRange.end) {
        matchesFolder = item.folderId === currentFolderId || (currentFolderId === null && !item.folderId);
      }

      return matchesSearch && matchesType && matchesFolder && matchesDate;
    });
  }, [activeTab, currentFolderId, dateRange.end, dateRange.start, searchQuery, sourceList, typeFilter]);

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  const currentFolderName = currentFolderId
    ? store.folders.find((f) => f.id === currentFolderId)?.name || 'Unknown Folder'
    : 'All Media';

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((m) => m.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedList = Array.from(selectedIds);

  const openConfirm = (kind: 'trash' | 'restore' | 'delete', ids: string[]) => {
    setConfirmState({ kind, ids });
  };

  const confirmTitle =
    confirmState?.kind === 'trash'
      ? 'Move to trash?'
      : confirmState?.kind === 'restore'
        ? 'Restore from trash?'
        : 'Delete permanently?';

  const confirmMessage =
    confirmState?.kind === 'trash'
      ? `Move ${confirmState.ids.length} item(s) to Trash?`
      : confirmState?.kind === 'restore'
        ? `Restore ${confirmState.ids.length} item(s) back to Library?`
        : `Permanently delete ${confirmState?.ids.length ?? 0} item(s)? This can’t be undone.`;

  const runConfirm = () => {
    if (!confirmState) return;

    try {
      if (confirmState.kind === 'trash') {
        confirmState.ids.forEach((id) => store.moveMediaToTrash(id));
        setNotification({ message: 'Moved to trash.', type: 'success' });
      }
      if (confirmState.kind === 'restore') {
        confirmState.ids.forEach((id) => store.restoreMediaFromTrash(id));
        setNotification({ message: 'Restored.', type: 'success' });
      }
      if (confirmState.kind === 'delete') {
        confirmState.ids.forEach((id) => store.permanentlyDeleteMedia(id));
        setNotification({ message: 'Deleted permanently.', type: 'success' });
      }

      clearSelection();
    } catch (e) {
      setNotification({ message: e instanceof Error ? e.message : 'Action failed', type: 'error' });
    } finally {
      setConfirmState(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UploadMediaModal
        isOpen={isUploadOpen}
        folders={store.folders}
        defaultFolderId={currentFolderId}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(items) => {
          items.forEach((it) => store.addMedia(it));
          setNotification({ message: `Uploaded ${items.length} file(s).`, type: 'success' });
        }}
      />

      <MediaDetailsModal
        isOpen={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onSave={(id, updates) => {
          store.updateMedia(id, updates);
          setNotification({ message: 'Saved.', type: 'success' });
          setDetailsItem((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
        }}
        onRename={(id, name) => {
          store.renameMedia(id, name);
          setNotification({ message: 'Renamed.', type: 'success' });
          setDetailsItem((prev) => (prev && prev.id === id ? { ...prev, name } : prev));
        }}
        onReplace={(id, file) => {
          store.replaceMedia(id, file);
          setNotification({ message: 'Replaced file.', type: 'success' });
          setDetailsItem((prev) =>
            prev && prev.id === id
              ? {
                  ...prev,
                  name: file.name,
                  url: URL.createObjectURL(file),
                  size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                  uploadedAt: 'Just now',
                }
              : prev
          );
        }}
      />

      <MoveMediaModal
        isOpen={isMoveOpen}
        folders={store.folders}
        defaultFolderId={currentFolderId}
        count={selectedIds.size}
        onClose={() => setIsMoveOpen(false)}
        onMove={(folderId) => {
          store.moveMediaToFolder(selectedList, folderId);
          setNotification({ message: 'Moved.', type: 'success' });
          if (folderId !== currentFolderId) clearSelection();
        }}
      />

      <BulkEditMediaModal
        isOpen={isBulkEditOpen}
        count={selectedIds.size}
        onClose={() => setIsBulkEditOpen(false)}
        onConfirm={(updates) => {
          store.bulkUpdateMedia(selectedList, updates);
          setNotification({ message: 'Updated.', type: 'success' });
        }}
      />

      <ConfirmDialog
        isOpen={!!confirmState}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmState?.kind === 'trash' ? 'Move to Trash' : confirmState?.kind === 'restore' ? 'Restore' : 'Delete'}
        variant={confirmState?.kind === 'delete' ? 'danger' : 'default'}
        onConfirm={runConfirm}
        onCancel={() => setConfirmState(null)}
      />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Media Library</h1>
          <p className="text-heading-4 text-muted-foreground">Prototype-mirror UI (stored locally for now).</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/admin/blog/content-manager')}>
            Content Manager
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/blog')}>
            Back
          </Button>
        </div>
      </div>

      {notification ? (
        <div className="fixed top-24 right-6 z-50">
          <div className="bg-surface shadow-neu-outset rounded-2xl px-4 py-3 border border-border">
            <div className="text-body text-foreground">{notification.message}</div>
          </div>
        </div>
      ) : null}

      {selectedIds.size > 0 ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-4xl">
          <div className="bg-surface shadow-neu-outset rounded-2xl p-3 border border-border flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <span className="bg-background text-foreground text-body-small text-heading-6 px-3 py-1 rounded-full shadow-neu-inset">
                {selectedIds.size}
              </span>
              <span className="text-body text-foreground whitespace-nowrap">Selected</span>
            </div>

            <div className="h-px w-full sm:h-8 sm:w-px bg-border" />

            <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
              {activeTab === 'library' ? (
                <>
                  <Button variant="secondary" className="px-3 py-2" onClick={() => setIsMoveOpen(true)}>
                    Move
                  </Button>
                  <Button variant="secondary" className="px-3 py-2" onClick={() => setIsBulkEditOpen(true)}>
                    Bulk Edit
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    onClick={() => openConfirm('trash', selectedList)}
                  >
                    Trash
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    onClick={() => openConfirm('restore', selectedList)}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    onClick={() => openConfirm('delete', selectedList)}
                  >
                    Delete
                  </Button>
                </>
              )}

              <Button variant="secondary" className="px-3 py-2" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-[320px]">
          <FolderTree
            folders={store.folders}
            currentFolderId={currentFolderId}
            onSelectFolder={(id) => {
              setCurrentFolderId(id);
              setIsSidebarOpen(false);
            }}
            onAddFolder={(name, parentId) => {
              store.addFolder(name, parentId);
              setNotification({ message: 'Folder created.', type: 'success' });
            }}
          />
        </div>

        <div className="flex-1">
          <div className="bg-surface rounded-2xl shadow-neu-outset p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-body text-foreground">{activeTab === 'library' ? currentFolderName : 'Trash'}</div>
                  <div className="text-body-small text-muted-foreground">{filtered.length} item(s)</div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="secondary" className="px-3 py-2 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                    Folders
                  </Button>
                  <Button variant={activeTab === 'library' ? 'primary' : 'secondary'} onClick={() => setActiveTab('library')}>
                    Library
                  </Button>
                  <Button variant={activeTab === 'trash' ? 'primary' : 'secondary'} onClick={() => setActiveTab('trash')}>
                    Trash
                  </Button>
                  <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
                    Upload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <NeumorphicInput
                    label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files by name…"
                  />
                </div>

                <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
                  <label className="block text-body-small text-muted-foreground mb-2">Type</label>
                  <select
                    className="form-input w-full"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                  >
                    <option value="all">All</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} onClick={() => setViewMode('grid')}>
                    Grid
                  </Button>
                  <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} onClick={() => setViewMode('list')}>
                    List
                  </Button>

                  <Button variant="secondary" onClick={() => setShowDateFilter((v) => !v)}>
                    Date Filter
                  </Button>
                </div>

                <div className="bg-surface rounded-2xl shadow-neu-inset p-4 w-full md:w-[360px]">
                  <label className="block text-body-small text-muted-foreground mb-2">Thumbnail size</label>
                  <input
                    type="range"
                    min={120}
                    max={260}
                    value={thumbnailSize}
                    onChange={(e) => setThumbnailSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {showDateFilter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
                    <label className="block text-body-small text-muted-foreground mb-2">Start</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
                    <label className="block text-body-small text-muted-foreground mb-2">End</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <label className="flex items-center gap-3 text-body-small text-muted-foreground">
                <input type="checkbox" checked={allSelected} onChange={(e) => selectAll(e.target.checked)} />
                Select all
              </label>
              <div className="text-body-small text-muted-foreground">{activeTab === 'library' ? 'Library' : 'Trash'}</div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No media matches your filters.</div>
            ) : viewMode === 'grid' ? (
              <div
                className="p-4 grid gap-4"
                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(160, thumbnailSize)}px, 1fr))` }}
              >
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-background rounded-2xl shadow-neu-outset overflow-hidden hover:shadow-neu-inset transition-shadow cursor-pointer"
                    onClick={() => {
                      if (activeTab === 'library') setDetailsItem(item as MediaItem);
                    }}
                  >
                    <div className="relative" style={{ height: `${thumbnailSize}px` }}>
                      <MediaThumb item={item as MediaItem} />
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-body text-foreground truncate">{item.name}</div>
                      <div className="text-body-small text-muted-foreground mt-1">
                        {item.type} • {item.size}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeTab === 'library' ? (
                          <>
                            <button
                              type="button"
                              className="text-body-small text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                void navigator.clipboard.writeText(item.url);
                                setNotification({ message: 'URL copied.', type: 'success' });
                              }}
                            >
                              Copy URL
                            </button>
                            <span className="text-muted-foreground">|</span>
                            <button
                              type="button"
                              className="text-body-small text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirm('trash', [item.id]);
                              }}
                            >
                              Trash
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-body-small text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirm('restore', [item.id]);
                              }}
                            >
                              Restore
                            </button>
                            <span className="text-muted-foreground">|</span>
                            <button
                              type="button"
                              className="text-body-small text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirm('delete', [item.id]);
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-surface shadow-neu-inset">
                    <tr>
                      <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Select</th>
                      <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Size</th>
                      <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Uploaded</th>
                      <th className="px-4 py-3 text-right text-body-small text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-t border-border hover:bg-surface-hover">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleOne(item.id)} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left"
                            onClick={() => {
                              if (activeTab === 'library') setDetailsItem(item as MediaItem);
                            }}
                          >
                            <div className="text-body text-foreground">{item.name}</div>
                            <div className="text-body-small text-muted-foreground">{item.url}</div>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-body-small text-muted-foreground">{item.type}</td>
                        <td className="px-4 py-3 text-body-small text-muted-foreground">{item.size}</td>
                        <td className="px-4 py-3 text-body-small text-muted-foreground">{item.uploadedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-3">
                            {activeTab === 'library' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  className="px-3 py-2"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(item.url);
                                    setNotification({ message: 'URL copied.', type: 'success' });
                                  }}
                                >
                                  Copy URL
                                </Button>
                                <Button variant="secondary" className="px-3 py-2" onClick={() => openConfirm('trash', [item.id])}>
                                  Trash
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="secondary"
                                  className="px-3 py-2"
                                  onClick={() => openConfirm('restore', [item.id])}
                                >
                                  Restore
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="px-3 py-2"
                                  onClick={() => openConfirm('delete', [item.id])}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 h-full w-[320px] p-4" onClick={(e) => e.stopPropagation()}>
            <FolderTree
              folders={store.folders}
              currentFolderId={currentFolderId}
              onSelectFolder={(id) => {
                setCurrentFolderId(id);
                setIsSidebarOpen(false);
              }}
              onAddFolder={(name, parentId) => {
                store.addFolder(name, parentId);
                setNotification({ message: 'Folder created.', type: 'success' });
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

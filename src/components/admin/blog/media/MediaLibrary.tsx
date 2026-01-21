'use client';

import React from 'react';
import Button from '@/components/Button';
import FolderTree from '@/components/admin/blog/media/FolderTree';
import UploadMediaModal from '@/components/admin/blog/media/modals/UploadMediaModal';
import MoveMediaModal from '@/components/admin/blog/media/modals/MoveMediaModal';
import MediaDetailsModal from '@/components/admin/blog/media/modals/MediaDetailsModal';
import BulkEditMediaModal from '@/components/admin/blog/media/modals/BulkEditMediaModal';
import {
  useBlogPrototypeStore,
  type MediaFolder,
  type MediaItem,
  type MediaType,
} from '@/components/admin/blog/shared/blogPrototypeStore';

type Tab = 'library' | 'trash';
type ViewMode = 'grid' | 'list';
type ThumbSize = 'small' | 'medium' | 'large';
type SortBy = 'date' | 'name';
type SortDir = 'desc' | 'asc';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDayValue(value: string) {
  if (!value) return '';
  return value;
}

function thumbClass(size: ThumbSize) {
  if (size === 'small') return 'h-24';
  if (size === 'large') return 'h-44';
  return 'h-32';
}

function typePill(type: MediaType) {
  if (type === 'image') return 'bg-primary/10 text-primary';
  if (type === 'video') return 'bg-secondary/10 text-secondary';
  return 'bg-surface text-muted-foreground';
}

function typeLabel(type: MediaType) {
  if (type === 'image') return 'Image';
  if (type === 'video') return 'Video';
  return 'Document';
}

export default function MediaLibrary() {
  const store = useBlogPrototypeStore();
  const { media, trashedMedia, folders } = store;
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<Tab>('library');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [thumbnailSize, setThumbnailSize] = React.useState<ThumbSize>('medium');
  const [sortBy, setSortBy] = React.useState<SortBy>('date');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<MediaType | 'all'>('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isMoveOpen, setIsMoveOpen] = React.useState(false);
  const [isBulkOpen, setIsBulkOpen] = React.useState(false);

  const sourceItems = activeTab === 'trash' ? trashedMedia : media;

  const filteredItems = React.useMemo(() => {
    const base =
      activeTab === 'trash'
        ? sourceItems
        : sourceItems.filter((it) => it.folderId === currentFolderId);

    const needle = searchQuery.trim().toLowerCase();

    const filtered = base
      .filter((it) => {
        if (!needle) return true;
        const tags = it.tags ?? [];
        return (
          it.name.toLowerCase().includes(needle) ||
          (it.altText ?? '').toLowerCase().includes(needle) ||
          (it.caption ?? '').toLowerCase().includes(needle) ||
          tags.some((t) => t.toLowerCase().includes(needle))
        );
      })
      .filter((it) => (typeFilter === 'all' ? true : it.type === typeFilter))
      .filter((it) => {
        if (!dateFrom && !dateTo) return true;
        const dt = new Date(it.uploadedAt);
        if (dateFrom) {
          const start = new Date(dateFrom);
          start.setHours(0, 0, 0, 0);
          if (dt < start) return false;
        }
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          if (dt > end) return false;
        }
        return true;
      });

    const sign = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return sign * a.name.localeCompare(b.name);
      const da = new Date(a.uploadedAt).getTime();
      const db = new Date(b.uploadedAt).getTime();
      return sign * (da - db);
    });
  }, [activeTab, currentFolderId, dateFrom, dateTo, searchQuery, sortBy, sortDir, sourceItems, typeFilter]);

  const selectedCount = selectedIds.size;
  const currentItem = React.useMemo(() => {
    if (!detailId) return null;
    const all = [...media, ...trashedMedia];
    return all.find((x) => x.id === detailId) ?? null;
  }, [detailId, media, trashedMedia]);

  const clearSelection = React.useCallback(() => setSelectedIds(new Set()), []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = filteredItems.length > 0 && selectedCount === filteredItems.length;

  const selectAll = () => setSelectedIds(new Set(filteredItems.map((x) => x.id)));

  const currentFolderName = React.useMemo(() => {
    if (!currentFolderId) return 'All Media';
    const f = folders.find((x) => x.id === currentFolderId);
    return f?.name ?? 'All Media';
  }, [currentFolderId, folders]);

  const bulkTrashOrDelete = () => {
    if (selectedCount === 0) return;
    if (activeTab === 'trash') {
      selectedIds.forEach((id) => store.permanentlyDeleteMedia(id));
    } else {
      selectedIds.forEach((id) => store.moveMediaToTrash(id));
    }
    clearSelection();
  };

  const bulkRestore = () => {
    if (activeTab !== 'trash' || selectedCount === 0) return;
    selectedIds.forEach((id) => store.restoreMediaFromTrash(id));
    clearSelection();
  };

  const today = React.useMemo(() => formatDate(new Date()), []);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  React.useEffect(() => {
    setCurrentPage(1);
    clearSelection();
  }, [activeTab, currentFolderId, searchQuery, typeFilter, dateFrom, dateTo, sortBy, sortDir, viewMode, thumbnailSize, clearSelection]);

  const pagedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [currentPage, filteredItems]);

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small';
  const selectClass = 'px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small appearance-none cursor-pointer';

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Media Library</h1>
          <p className="text-heading-4 text-muted-foreground">Organize and manage all your media files.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
            Upload
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              store.addFolder('New Folder', null);
            }}
          >
            New Folder
          </Button>
          {activeTab === 'trash' && trashedMedia.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                trashedMedia.forEach((item) => store.permanentlyDeleteMedia(item.id));
                clearSelection();
              }}
            >
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <FolderTree
            folders={folders}
            currentFolderId={currentFolderId}
            onSelectFolder={(id) => {
              setActiveTab('library');
              setCurrentFolderId(id);
            }}
            onAddFolder={(name, parentId) => store.addFolder(name, parentId)}
          />
        </aside>

        <section className="lg:col-span-9">
          <div className="bg-surface rounded-2xl shadow-neu-outset">
            <div className="p-6 border-b border-border/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className={cn(
                      'px-4 py-2 rounded-full text-body-small transition-all duration-200',
                      activeTab === 'library'
                        ? 'bg-background text-foreground shadow-neu-inset'
                        : 'bg-surface text-muted-foreground shadow-neu-outset hover:text-foreground'
                    )}
                  >
                    Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('trash')}
                    className={cn(
                      'px-4 py-2 rounded-full text-body-small transition-all duration-200',
                      activeTab === 'trash'
                        ? 'bg-background text-foreground shadow-neu-inset'
                        : 'bg-surface text-muted-foreground shadow-neu-outset hover:text-foreground'
                    )}
                  >
                    Trash
                  </button>

                  <div className="ml-2 text-body-small text-muted-foreground">
                    {activeTab === 'trash' ? 'Trash' : currentFolderName} • {filteredItems.length} items
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-2 rounded-xl text-body-small transition-all duration-200',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-neu-inset'
                        : 'bg-surface text-muted-foreground shadow-neu-outset hover:text-foreground'
                    )}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-2 rounded-xl text-body-small transition-all duration-200',
                      viewMode === 'list'
                        ? 'bg-background text-foreground shadow-neu-inset'
                        : 'bg-surface text-muted-foreground shadow-neu-outset hover:text-foreground'
                    )}
                  >
                    List
                  </button>

                  <select
                    className={cn(selectClass, 'w-28')}
                    value={thumbnailSize}
                    onChange={(e) => setThumbnailSize(e.target.value as ThumbSize)}
                    aria-label="Thumbnail size"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-4">
                  <input
                    className={inputClass}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                  />
                </div>
                <div className="md:col-span-2">
                  <select
                    className={cn(selectClass, 'w-full')}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as MediaType | 'all')}
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <select
                    className={cn(selectClass, 'w-full')}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                  >
                    <option value="date">Sort: Date</option>
                    <option value="name">Sort: Name</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <select
                    className={cn(selectClass, 'w-full')}
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as SortDir)}
                  >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    className={inputClass}
                    type="date"
                    max={today}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(normalizeDayValue(e.target.value))}
                    aria-label="From date"
                  />
                  <input
                    className={inputClass}
                    type="date"
                    max={today}
                    value={dateTo}
                    onChange={(e) => setDateTo(normalizeDayValue(e.target.value))}
                    aria-label="To date"
                  />
                </div>
              </div>

              {selectedCount > 0 && (
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-background shadow-neu-inset p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-body text-foreground font-medium">
                    {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {activeTab === 'trash' ? (
                      <>
                        <Button variant="secondary" onClick={bulkRestore}>
                          Restore
                        </Button>
                        <Button variant="secondary" onClick={bulkTrashOrDelete}>
                          Delete Forever
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => setIsMoveOpen(true)}>
                          Move
                        </Button>
                        <Button variant="secondary" onClick={() => setIsBulkOpen(true)}>
                          Bulk Edit
                        </Button>
                        <Button variant="secondary" onClick={bulkTrashOrDelete}>
                          Move to Trash
                        </Button>
                      </>
                    )}
                    <Button variant="secondary" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl bg-background shadow-neu-inset p-12 text-center text-muted-foreground">
                  No media found.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {pagedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group overflow-hidden rounded-2xl bg-background shadow-neu-outset transition-all duration-200 hover:shadow-neu-inset"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border/20 px-4 py-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                          />
                          <span className="sr-only">Select</span>
                        </label>
                        <span className={cn('rounded-full px-3 py-1 text-label', typePill(item.type))}>
                          {typeLabel(item.type)}
                        </span>
                      </div>

                      <button type="button" className="block w-full text-left" onClick={() => setDetailId(item.id)}>
                        <div className={cn('w-full bg-surface p-3', thumbClass(thumbnailSize))}>
                          <div className="h-full w-full overflow-hidden rounded-xl bg-background shadow-neu-inset">
                            {item.type === 'image' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.url} alt={item.altText ?? item.name} className="h-full w-full object-cover" />
                            ) : item.type === 'video' ? (
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                <span className="text-heading-4">Video</span>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                <span className="text-heading-4">Document</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 px-4 py-4">
                          <div className="truncate text-body text-foreground font-medium">{item.name}</div>
                          <div className="flex items-center justify-between text-body-small text-muted-foreground">
                            <span>{item.size}</span>
                            <span>{item.uploadedAt}</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl bg-background shadow-neu-outset">
                  <div className="grid grid-cols-12 gap-3 border-b border-border/20 px-5 py-4 text-body-small text-muted-foreground font-medium">
                    <div className="col-span-1">
                      <button
                        type="button"
                        className="underline hover:text-foreground transition-colors"
                        onClick={isAllSelected ? clearSelection : selectAll}
                      >
                        {isAllSelected ? 'None' : 'All'}
                      </button>
                    </div>
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Date</div>
                  </div>
                  <div className="divide-y divide-border/10">
                    {pagedItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid cursor-pointer grid-cols-12 gap-3 px-5 py-4 hover:bg-surface/50 transition-colors"
                        onClick={() => setDetailId(item.id)}
                      >
                        <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="col-span-5 truncate text-body text-foreground">{item.name}</div>
                        <div className="col-span-2">
                          <span className={cn('rounded-full px-3 py-1 text-label', typePill(item.type))}>
                            {typeLabel(item.type)}
                          </span>
                        </div>
                        <div className="col-span-2 text-body-small text-muted-foreground">{item.size}</div>
                        <div className="col-span-2 text-body-small text-muted-foreground">{item.uploadedAt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-body-small text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UploadMediaModal
        isOpen={isUploadOpen}
        folders={folders}
        defaultFolderId={currentFolderId}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(itemsToAdd) => {
          itemsToAdd.forEach((item) => store.addMedia(item));
        }}
      />

      <MoveMediaModal
        isOpen={isMoveOpen}
        folders={folders}
        defaultFolderId={currentFolderId}
        count={selectedCount}
        onClose={() => setIsMoveOpen(false)}
        onMove={(folderId) => {
          store.moveMediaToFolder(Array.from(selectedIds), folderId);
          clearSelection();
        }}
      />

      <BulkEditMediaModal
        isOpen={isBulkOpen}
        count={selectedCount}
        onClose={() => setIsBulkOpen(false)}
        onConfirm={(updates) => {
          store.bulkUpdateMedia(Array.from(selectedIds), updates);
          clearSelection();
        }}
      />

      <MediaDetailsModal
        isOpen={Boolean(detailId)}
        item={currentItem}
        onClose={() => setDetailId(null)}
        onSave={(id, updates) => store.updateMedia(id, updates)}
        onRename={(id, name) => store.renameMedia(id, name)}
        onReplace={(id, file) => store.replaceMedia(id, file)}
      />
    </div>
  );
}

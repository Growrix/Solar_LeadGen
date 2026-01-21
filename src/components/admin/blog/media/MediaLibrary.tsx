'use client';

import React from 'react';
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminCard,
  AdminBadge,
  AdminTabs,
  AdminPagination,
  AdminEmptyState,
  AdminToolbar,
  AdminCheckbox,
} from '@/components/admin/ui';
import FolderTree from '@/components/admin/blog/media/FolderTree';
import UploadMediaModal from '@/components/admin/blog/media/modals/UploadMediaModal';
import MoveMediaModal from '@/components/admin/blog/media/modals/MoveMediaModal';
import MediaDetailsModal from '@/components/admin/blog/media/modals/MediaDetailsModal';
import BulkEditMediaModal from '@/components/admin/blog/media/modals/BulkEditMediaModal';
import {
  useBlogPrototypeStore,
  type MediaItem,
  type MediaType,
} from '@/components/admin/blog/shared/blogPrototypeStore';

type Tab = 'library' | 'trash';
type ViewMode = 'grid' | 'list';
type ThumbSize = 'small' | 'medium' | 'large';
type SortBy = 'date' | 'name';
type SortDir = 'desc' | 'asc';

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

function getTypeBadgeVariant(type: MediaType): 'primary' | 'success' | 'secondary' {
  if (type === 'image') return 'primary';
  if (type === 'video') return 'success';
  return 'secondary';
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

  const tabs = [
    { id: 'library', label: 'Library', count: media.length },
    { id: 'trash', label: 'Trash', count: trashedMedia.length },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'document', label: 'Documents' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort: Date' },
    { value: 'name', label: 'Sort: Name' },
  ];

  const sortDirOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' },
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 bg-[var(--admin-bg-base)] min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-fg-primary)] mb-1">Media Library</h1>
          <p className="text-sm text-[var(--admin-fg-secondary)]">Organize and manage all your media files.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminButton variant="primary" onClick={() => setIsUploadOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1.5">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload
          </AdminButton>
          <AdminButton
            variant="secondary"
            onClick={() => store.addFolder('New Folder', null)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1.5">
              <path d="M2 4C2 3.44772 2.44772 3 3 3H6L7.5 5H13C13.5523 5 14 5.44772 14 6V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            New Folder
          </AdminButton>
          {activeTab === 'trash' && trashedMedia.length > 0 && (
            <AdminButton
              variant="destructive"
              onClick={() => {
                trashedMedia.forEach((item) => store.permanentlyDeleteMedia(item.id));
                clearSelection();
              }}
            >
              Empty Trash
            </AdminButton>
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
          <AdminCard variant="elevated" padding="none">
            <div className="p-5 border-b border-[var(--admin-border)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <AdminTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id: string) => setActiveTab(id as Tab)}
                    variant="default"
                    size="sm"
                  />
                  <span className="text-sm text-[var(--admin-fg-muted)]">
                    {activeTab === 'trash' ? 'Trash' : currentFolderName} • {filteredItems.length} items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[var(--admin-border)] rounded-[var(--admin-radius)]">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]' : 'text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg-primary)]'} rounded-l-[var(--admin-radius)]`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)]' : 'text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg-primary)]'} rounded-r-[var(--admin-radius)]`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <AdminSelect
                    options={sizeOptions}
                    value={thumbnailSize}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setThumbnailSize(e.target.value as ThumbSize)}
                    size="sm"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <AdminInput
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    size="sm"
                    leftIcon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <AdminSelect
                    options={typeOptions}
                    value={typeFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as MediaType | 'all')}
                    size="sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <AdminSelect
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortBy)}
                    size="sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <AdminSelect
                    options={sortDirOptions}
                    value={sortDir}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortDir(e.target.value as SortDir)}
                    size="sm"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    className="flex-1 h-8 px-2 text-xs rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] text-[var(--admin-fg-primary)] border border-[var(--admin-border)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
                    type="date"
                    max={today}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(normalizeDayValue(e.target.value))}
                    aria-label="From date"
                  />
                  <input
                    className="flex-1 h-8 px-2 text-xs rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] text-[var(--admin-fg-primary)] border border-[var(--admin-border)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
                    type="date"
                    max={today}
                    value={dateTo}
                    onChange={(e) => setDateTo(normalizeDayValue(e.target.value))}
                    aria-label="To date"
                  />
                </div>
              </div>

              {selectedCount > 0 && (
                <AdminToolbar className="mt-4 bg-[var(--admin-primary-muted)]">
                  <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-[var(--admin-fg-primary)]">
                      {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeTab === 'trash' ? (
                        <>
                          <AdminButton variant="secondary" size="sm" onClick={bulkRestore}>
                            Restore
                          </AdminButton>
                          <AdminButton variant="destructive" size="sm" onClick={bulkTrashOrDelete}>
                            Delete Forever
                          </AdminButton>
                        </>
                      ) : (
                        <>
                          <AdminButton variant="secondary" size="sm" onClick={() => setIsMoveOpen(true)}>
                            Move
                          </AdminButton>
                          <AdminButton variant="secondary" size="sm" onClick={() => setIsBulkOpen(true)}>
                            Bulk Edit
                          </AdminButton>
                          <AdminButton variant="destructive" size="sm" onClick={bulkTrashOrDelete}>
                            Move to Trash
                          </AdminButton>
                        </>
                      )}
                      <AdminButton variant="ghost" size="sm" onClick={clearSelection}>
                        Clear
                      </AdminButton>
                    </div>
                  </div>
                </AdminToolbar>
              )}
            </div>

            <div className="p-5">
              {filteredItems.length === 0 ? (
                <AdminEmptyState
                  title="No media found"
                  description="Upload some files or adjust your filters to see media here."
                  action={{
                    label: 'Upload Files',
                    onClick: () => setIsUploadOpen(true),
                  }}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {pagedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group overflow-hidden rounded-[var(--admin-radius-lg)] border transition-all duration-200 ${
                        selectedIds.has(item.id)
                          ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-muted)]'
                          : 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] hover:border-[var(--admin-border-strong)] hover:shadow-[var(--admin-shadow-2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border-muted)] px-3 py-2">
                        <AdminCheckbox
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                        <AdminBadge variant={getTypeBadgeVariant(item.type)} size="sm">
                          {typeLabel(item.type)}
                        </AdminBadge>
                      </div>

                      <button type="button" className="block w-full text-left" onClick={() => setDetailId(item.id)}>
                        <div className={`w-full bg-[var(--admin-bg-base)] p-2 ${thumbClass(thumbnailSize)}`}>
                          <div className="h-full w-full overflow-hidden rounded-[var(--admin-radius-md)] bg-[var(--admin-secondary)]">
                            {item.type === 'image' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.url} alt={item.altText ?? item.name} className="h-full w-full object-cover" />
                            ) : item.type === 'video' ? (
                              <div className="flex h-full items-center justify-center text-[var(--admin-fg-muted)]">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center text-[var(--admin-fg-muted)]">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 px-3 py-3">
                          <div className="truncate text-sm font-medium text-[var(--admin-fg-primary)]">{item.name}</div>
                          <div className="flex items-center justify-between text-xs text-[var(--admin-fg-muted)]">
                            <span>{item.size}</span>
                            <span>{item.uploadedAt}</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)]">
                  <div className="grid grid-cols-12 gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-bg-base)] px-4 py-3 text-xs font-semibold text-[var(--admin-fg-muted)] uppercase tracking-wider">
                    <div className="col-span-1">
                      <button
                        type="button"
                        className="underline hover:text-[var(--admin-fg-primary)] transition-colors"
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
                  <div className="divide-y divide-[var(--admin-border-muted)]">
                    {pagedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`grid cursor-pointer grid-cols-12 gap-3 px-4 py-3 transition-colors ${
                          selectedIds.has(item.id)
                            ? 'bg-[var(--admin-primary-muted)]'
                            : 'hover:bg-[var(--admin-bg-hover)]'
                        }`}
                        onClick={() => setDetailId(item.id)}
                      >
                        <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                          <AdminCheckbox
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                        </div>
                        <div className="col-span-5 truncate text-sm text-[var(--admin-fg-primary)]">{item.name}</div>
                        <div className="col-span-2">
                          <AdminBadge variant={getTypeBadgeVariant(item.type)} size="sm">
                            {typeLabel(item.type)}
                          </AdminBadge>
                        </div>
                        <div className="col-span-2 text-sm text-[var(--admin-fg-muted)]">{item.size}</div>
                        <div className="col-span-2 text-sm text-[var(--admin-fg-muted)]">{item.uploadedAt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredItems.length > 0 && (
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </AdminCard>
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
        onMove={(destFolderId: string | null) => {
          store.moveMediaToFolder(Array.from(selectedIds), destFolderId);
          clearSelection();
        }}
      />

      <MediaDetailsModal
        isOpen={Boolean(detailId)}
        item={currentItem}
        onClose={() => setDetailId(null)}
        onSave={(id: string, updates: { altText?: string; caption?: string; tags?: string[] }) => store.updateMedia(id, updates)}
        onRename={(id: string, name: string) => store.renameMedia(id, name)}
        onReplace={(id: string, newFile: File) => store.replaceMedia(id, newFile)}
      />

      <BulkEditMediaModal
        isOpen={isBulkOpen}
        count={selectedCount}
        onClose={() => setIsBulkOpen(false)}
        onConfirm={(updates: { altText?: string; caption?: string; tags?: string[] }) => {
          selectedIds.forEach((id: string) => store.updateMedia(id, updates));
          clearSelection();
        }}
      />
    </div>
  );
}

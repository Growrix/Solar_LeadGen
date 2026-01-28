'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { format, parse } from 'date-fns';
import {
  CheckCircle,
  ChevronRight,
  Copy,
  Edit2,
  Folder as FolderIcon,
  FolderInput,
  FolderOpen,
  Grid,
  Home,
  List,
  MoreHorizontal,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Film,
  FileText,
} from 'lucide-react';
import { SkeletonMediaGrid } from './SkeletonMediaGrid';
import { UploadMediaModal, type FileWithMeta } from './UploadMediaModal';
import { MediaDetailsModal } from './MediaDetailsModal';
import { MoveMediaModal, type MoveMediaFolder } from './MoveMediaModal';
import { BulkEditMediaModal } from './BulkEditMediaModal';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';

type ViewState = 'loading' | 'success';
type TabType = 'library' | 'trash';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size?: string;
  uploadedAt: string;
  dimensions?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  folderId?: string | null;
  references?: Array<{ id: string; title: string; type: 'post' | 'page' | 'template' }>;
}

interface TrashedMediaItem extends MediaItem {
  trashedAt: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  type: 'media';
}

const initialFolders: Folder[] = [];
const initialMedia: MediaItem[] = [];

const nowLabel = () => {
  const date = new Date();
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseDate = (dateStr: string): number => {
  if (dateStr === 'Just now') return new Date().getTime();
  return Date.parse(dateStr) || 0;
};

type ApiMediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
type ApiMediaAssetStatus = 'ACTIVE' | 'TRASHED';

type ApiMediaAsset = {
  id: string;
  name: string;
  type: ApiMediaAssetType;
  url: string;
  size: number | null;
  dimensions: string | null;
  altText: string | null;
  caption: string | null;
  tags: string[];
  folderId: string | null;
  status: ApiMediaAssetStatus;
  trashedAt: string | null;
  createdAt: string;
};

type ApiMediaFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

function formatBytes(size: number | null | undefined): string | undefined {
  if (!size || size <= 0) return undefined;
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function toUiMediaType(type: ApiMediaAssetType): MediaItem['type'] {
  switch (type) {
    case 'IMAGE':
      return 'image';
    case 'VIDEO':
      return 'video';
    case 'DOCUMENT':
    default:
      return 'document';
  }
}

function formatUploadedAtLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return format(date, 'MMM d, yyyy');
}

function mapApiAssetToMediaItem(asset: ApiMediaAsset): MediaItem {
  return {
    id: asset.id,
    name: asset.name,
    type: toUiMediaType(asset.type),
    url: asset.url,
    size: formatBytes(asset.size ?? undefined),
    uploadedAt: formatUploadedAtLabel(asset.createdAt),
    dimensions: asset.dimensions ?? undefined,
    altText: asset.altText ?? undefined,
    caption: asset.caption ?? undefined,
    tags: asset.tags ?? [],
    folderId: asset.folderId,
  };
}

function mapApiAssetToTrashedMediaItem(asset: ApiMediaAsset): TrashedMediaItem {
  return {
    ...mapApiAssetToMediaItem(asset),
    trashedAt: asset.trashedAt ? formatUploadedAtLabel(asset.trashedAt) : 'Unknown',
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string'
        ? (data as any).error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

const FileIcon = ({ type, className = 'w-8 h-8' }: { type: string; className?: string }) => {
  switch (type) {
    case 'image':
      return <ImageIcon className={`${className} text-accent`} />;
    case 'video':
      return <Film className={`${className} text-warning`} />;
    case 'document':
      return <FileText className={`${className} text-info`} />;
    default:
      return <FileText className={`${className} text-muted-foreground`} />;
  }
};

export function MediaLibrary() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [trashedMedia, setTrashedMedia] = useState<TrashedMediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [thumbnailSize, setThumbnailSize] = useState(200);

  // Date filter state
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  const [detailsModalItem, setDetailsModalItem] = useState<MediaItem | null>(null);
  const [actionItem, setActionItem] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
  const [targetFolder, setTargetFolder] = useState<Folder | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [isFolderDeleteModalOpen, setIsFolderDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const folderNameInputRef = useRef<HTMLInputElement>(null);

  const loadAllFolders = async (): Promise<Folder[]> => {
    const results: Folder[] = [];
    const queue: Array<string | null> = [null];
    const visited = new Set<string | null>();

    while (queue.length > 0) {
      const parentId = queue.shift() ?? null;
      if (visited.has(parentId)) continue;
      visited.add(parentId);

      const url = parentId ? `/api/admin/media/folders?parentId=${encodeURIComponent(parentId)}` : '/api/admin/media/folders';
      const data = await requestJson<{ folders: ApiMediaFolder[] }>(url);
      for (const folder of data.folders ?? []) {
        results.push({ id: folder.id, name: folder.name, parentId: folder.parentId, type: 'media' });
        queue.push(folder.id);
      }

      if (results.length > 5000) break;
    }

    return results;
  };

  const loadAssets = async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) setViewState('loading');

    const status: ApiMediaAssetStatus = activeTab === 'trash' ? 'TRASHED' : 'ACTIVE';
    const typeParam =
      typeFilter === 'all' ? null : (typeFilter.toUpperCase() as ApiMediaAssetType);

    const params = new URLSearchParams();
    params.set('status', status);
    params.set('limit', '100');
    params.set('page', '1');

    if (typeParam) params.set('type', typeParam);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());

    if (activeTab === 'library' && !searchQuery.trim()) {
      params.set('folderId', currentFolderId ? currentFolderId : 'root');
    }

    const data = await requestJson<{ assets: ApiMediaAsset[] }>(`/api/admin/media/assets?${params.toString()}`);
    const assets = data.assets ?? [];

    if (activeTab === 'trash') {
      setTrashedMedia(assets.map(mapApiAssetToTrashedMediaItem));
    } else {
      setMedia(assets.map(mapApiAssetToMediaItem));
    }

    setViewState('success');
  };

  const reloadEverything = async () => {
    setViewState('loading');
    const [folderList] = await Promise.all([loadAllFolders()]);
    setFolders(folderList);
    await loadAssets({ showLoading: false });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setViewState('loading');
        const folderList = await loadAllFolders();
        if (cancelled) return;
        setFolders(folderList);
        await loadAssets({ showLoading: false });
      } catch (error) {
        if (cancelled) return;
        setNotification({ message: error instanceof Error ? error.message : 'Failed to load media', type: 'error' });
        setViewState('success');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAssets();
      } catch (error) {
        if (cancelled) return;
        setNotification({ message: error instanceof Error ? error.message : 'Failed to load media', type: 'error' });
        setViewState('success');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentFolderId, searchQuery, typeFilter]);

  useEffect(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setTypeFilter('all');
    setCurrentFolderId(null);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (!isFolderModalOpen) return;
    const timer = setTimeout(() => folderNameInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isFolderModalOpen]);

  const sourceList: Array<MediaItem | TrashedMediaItem> = activeTab === 'library' ? media : trashedMedia;

  const currentSubfolders = folders.filter(f => f.parentId === currentFolderId && f.type === 'media');

  const filteredMedia = sourceList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    let matchesFolder = true;
    if (activeTab === 'library' && !searchQuery) {
      matchesFolder = item.folderId === currentFolderId || (currentFolderId === null && !item.folderId);
    }

    // Date filter logic (only for library tab)
    let matchesDate = true;
    if (activeTab === 'library' && (dateFrom || dateTo)) {
      // Try to parse item.uploadedAt as MM/dd/yyyy or fallback to Date.parse
      let itemDate: Date | null = null;
      try {
        itemDate = parse(item.uploadedAt, 'MMM d, yyyy', new Date());
        if (isNaN(itemDate.getTime())) itemDate = new Date(Date.parse(item.uploadedAt));
      } catch {
        itemDate = new Date(Date.parse(item.uploadedAt));
      }
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (itemDate < fromDate) matchesDate = false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        // Set toDate to end of day
        toDate.setHours(23,59,59,999);
        if (itemDate > toDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesType && matchesFolder && matchesDate;
  });

  const getBreadcrumbs = () => {
    const crumbs: Array<{ id: string | null; name: string }> = [];
    let current = currentFolderId;
    while (current) {
      const folder = folders.find(f => f.id === current);
      if (!folder) break;
      crumbs.unshift({ id: folder.id, name: folder.name });
      current = folder.parentId;
    }
    return [{ id: null, name: 'Home' }, ...crumbs];
  };
  const breadcrumbs = getBreadcrumbs();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(filteredMedia.map(m => m.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    let idsToDrag = [item.id];
    if (selectedIds.has(item.id)) idsToDrag = Array.from(selectedIds);
    e.dataTransfer.setData('application/json', JSON.stringify({ mediaIds: idsToDrag }));
    e.dataTransfer.effectAllowed = 'move';

    if (idsToDrag.length > 1) {
      const dragPreview = document.createElement('div');
      dragPreview.className = 'bg-surface text-foreground px-3 py-1.5 rounded-button text-body-small shadow-modal border border-border absolute -top-96';
      dragPreview.textContent = `Moving ${idsToDrag.length} items`;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeTab === 'library') setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const moveMediaToFolder = async (mediaIds: string[], folderId: string | null) => {
    await Promise.all(
      mediaIds.map(id =>
        requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify({ folderId }),
        }),
      ),
    );
    await loadAssets({ showLoading: false });
  };

  const handleFolderDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    try {
      const jsonStr = e.dataTransfer.getData('application/json');
      if (!jsonStr) return;
      const data = JSON.parse(jsonStr) as { mediaIds?: string[] };
      if (!data.mediaIds?.length) return;
      void (async () => {
        try {
          await moveMediaToFolder(data.mediaIds!, targetId);
          setNotification({
            message: `${data.mediaIds!.length} item${data.mediaIds!.length !== 1 ? 's' : ''} moved to folder`,
            type: 'success',
          });
          setSelectedIds(new Set());
        } catch (error) {
          setNotification({ message: error instanceof Error ? error.message : 'Move failed', type: 'error' });
        }
      })();
    } catch {
      setNotification({ message: 'Drop failed', type: 'error' });
    }
  };

  const toggleTrashOrRestore = async (id: string) => {
    await requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}`, { method: 'DELETE' });
  };

  const permanentlyDeleteMedia = async (id: string) => {
    await requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}?permanent=true`, { method: 'DELETE' });
  };

  const updateMedia = async (id: string, data: { altText: string; caption: string; tags: string[] }) => {
    await requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await loadAssets({ showLoading: false });
  };

  const renameMedia = async (id: string, newName: string) => {
    await requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });
    await loadAssets({ showLoading: false });
  };

  const replaceMedia = () => {
    setNotification({ message: 'Replace is not supported yet (upload backend required)', type: 'error' });
  };

  const bulkUpdateMedia = async (ids: string[], updates: { altText?: string; caption?: string; tags?: string[] }) => {
    await Promise.all(
      ids.map(id =>
        requestJson(`/api/admin/media/assets/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        }),
      ),
    );
    await loadAssets({ showLoading: false });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setNotification({ message: 'URL copied to clipboard', type: 'success' });
    setOpenMenuId(null);
  };

  const handleItemClick = (item: MediaItem) => {
    if (activeTab === 'library') setDetailsModalItem(item);
  };

  const handleSaveDetails = (id: string, data: { altText: string; caption: string; tags: string[] }) => {
    void (async () => {
      try {
        await updateMedia(id, data);
        setNotification({ message: 'Media details saved successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Failed to save details', type: 'error' });
      }
    })();
  };

  const handleRenameMedia = (id: string, newName: string) => {
    void (async () => {
      try {
        await renameMedia(id, newName);
        setNotification({ message: 'File renamed successfully', type: 'success' });
        setDetailsModalItem(prev => (prev ? { ...prev, name: newName } : null));
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Rename failed', type: 'error' });
      }
    })();
  };

  const handleReplaceMedia = (id: string, file: File) => {
    replaceMedia();
    void id;
    void file;
  };

  const handleUploadComplete = (files: FileWithMeta[], targetFolderId: string | null) => {
    void (async () => {
      try {
        for (const f of files) {
          const file = f.file;
          const presigned = await requestJson<{
            uploadURL: string;
            objectPath: string;
            publicUrl: string;
            metadata: { name: string; size: number; contentType: string; type: ApiMediaAssetType };
          }>('/api/admin/media/upload', {
            method: 'POST',
            body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
          });

          const putRes = await fetch(presigned.uploadURL, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          if (!putRes.ok) {
            throw new Error(`Upload failed (${putRes.status})`);
          }

          await requestJson('/api/admin/media/assets', {
            method: 'POST',
            body: JSON.stringify({
              name: file.name,
              url: presigned.publicUrl,
              s3Key: presigned.objectPath,
              mimeType: file.type,
              type: presigned.metadata.type,
              size: file.size,
              altText: f.altText,
              caption: f.caption,
              tags: [],
              folderId: targetFolderId,
            }),
          });
        }

        await loadAssets({ showLoading: false });
        setNotification({ message: 'Files uploaded successfully', type: 'success' });
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Upload failed', type: 'error' });
      }
    })();
  };

  const initiateDelete = (id: string) => {
    setActionItem(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const initiateRestore = (id: string) => {
    setActionItem(id);
    setIsRestoreModalOpen(true);
    setOpenMenuId(null);
  };

  const initiateBulkDelete = () => {
    setActionItem(null);
    setIsDeleteModalOpen(true);
  };

  const initiateBulkRestore = () => {
    setActionItem(null);
    setIsRestoreModalOpen(true);
  };

  const initiateBulkMove = () => {
    if (selectedIds.size > 0) setIsMoveModalOpen(true);
  };

  const initiateBulkEdit = () => {
    if (selectedIds.size > 0) setIsBulkEditModalOpen(true);
  };

  const confirmDelete = () => {
    void (async () => {
      setIsProcessing(true);
      try {
        const idsToProcess = actionItem ? [actionItem] : Array.from(selectedIds);
        if (activeTab === 'library') {
          await Promise.all(idsToProcess.map(id => toggleTrashOrRestore(id)));
          await loadAssets({ showLoading: false });
          setNotification({ message: `${idsToProcess.length} item(s) moved to trash`, type: 'success' });
        } else {
          await Promise.all(idsToProcess.map(id => permanentlyDeleteMedia(id)));
          await loadAssets({ showLoading: false });
          setNotification({ message: `${idsToProcess.length} item(s) permanently deleted`, type: 'success' });
        }

        setSelectedIds(prev => {
          const next = new Set(prev);
          idsToProcess.forEach(id => next.delete(id));
          return next;
        });
        setActionItem(null);
        setIsDeleteModalOpen(false);
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Delete failed', type: 'error' });
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  const confirmRestore = () => {
    void (async () => {
      setIsProcessing(true);
      try {
        const idsToProcess = actionItem ? [actionItem] : Array.from(selectedIds);
        await Promise.all(idsToProcess.map(id => toggleTrashOrRestore(id)));
        await loadAssets({ showLoading: false });
        setNotification({ message: `${idsToProcess.length} item(s) restored`, type: 'success' });

        setSelectedIds(prev => {
          const next = new Set(prev);
          idsToProcess.forEach(id => next.delete(id));
          return next;
        });
        setActionItem(null);
        setIsRestoreModalOpen(false);
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Restore failed', type: 'error' });
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  const confirmMove = (targetFolderId: string | null) => {
    const idsToProcess = Array.from(selectedIds);
    void (async () => {
      try {
        await moveMediaToFolder(idsToProcess, targetFolderId);
        setNotification({ message: `${idsToProcess.length} item(s) moved`, type: 'success' });
        setSelectedIds(new Set());
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Move failed', type: 'error' });
      }
    })();
  };

  const confirmBulkEdit = (updates: { altText?: string; caption?: string; tags?: string[] }) => {
    const idsToProcess = Array.from(selectedIds);
    void (async () => {
      try {
        await bulkUpdateMedia(idsToProcess, updates);
        setNotification({ message: `${idsToProcess.length} item(s) updated`, type: 'success' });
        setSelectedIds(new Set());
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Bulk update failed', type: 'error' });
      }
    })();
  };

  const handleCreateFolder = () => {
    setFolderModalMode('create');
    setTargetFolder(null);
    setFolderNameInput('');
    setIsFolderModalOpen(true);
  };

  const handleRenameFolder = (folder: Folder) => {
    setFolderModalMode('rename');
    setTargetFolder(folder);
    setFolderNameInput(folder.name);
    setIsFolderModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setIsFolderDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const submitFolderForm = () => {
    if (!folderNameInput.trim()) return;
    void (async () => {
      try {
        if (folderModalMode === 'create') {
          await requestJson('/api/admin/media/folders', {
            method: 'POST',
            body: JSON.stringify({ name: folderNameInput.trim(), parentId: currentFolderId }),
          });
          setNotification({ message: 'Folder created', type: 'success' });
        } else if (targetFolder) {
          await requestJson(`/api/admin/media/folders/${encodeURIComponent(targetFolder.id)}`, {
            method: 'PUT',
            body: JSON.stringify({ name: folderNameInput.trim() }),
          });
          setNotification({ message: 'Folder renamed', type: 'success' });
        }

        await reloadEverything();
        setIsFolderModalOpen(false);
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Folder action failed', type: 'error' });
      }
    })();
  };

  const confirmDeleteFolder = () => {
    if (!folderToDelete) return;
    void (async () => {
      try {
        const folderInfo = await requestJson<{ folder: { id: string; parentId: string | null } }>(
          `/api/admin/media/folders/${encodeURIComponent(folderToDelete)}`,
        );

        const targetParentId = folderInfo.folder.parentId;

        const children = await requestJson<{ folders: ApiMediaFolder[] }>(
          `/api/admin/media/folders?parentId=${encodeURIComponent(folderToDelete)}`,
        );

        await Promise.all(
          (children.folders ?? []).map(child =>
            requestJson(`/api/admin/media/folders/${encodeURIComponent(child.id)}`, {
              method: 'PUT',
              body: JSON.stringify({ parentId: targetParentId }),
            }),
          ),
        );

        for (const status of ['ACTIVE', 'TRASHED'] as ApiMediaAssetStatus[]) {
          let page = 1;
          while (true) {
            const params = new URLSearchParams();
            params.set('status', status);
            params.set('folderId', folderToDelete);
            params.set('limit', '100');
            params.set('page', String(page));
            const assetsResp = await requestJson<{ assets: ApiMediaAsset[]; pagination?: { totalPages?: number } }>(
              `/api/admin/media/assets?${params.toString()}`,
            );
            const assets = assetsResp.assets ?? [];
            if (assets.length === 0) break;

            await Promise.all(
              assets.map(a =>
                requestJson(`/api/admin/media/assets/${encodeURIComponent(a.id)}`, {
                  method: 'PUT',
                  body: JSON.stringify({ folderId: null }),
                }),
              ),
            );

            const totalPages = assetsResp.pagination?.totalPages ?? 1;
            if (page >= totalPages) break;
            page += 1;
          }
        }

        await requestJson(`/api/admin/media/folders/${encodeURIComponent(folderToDelete)}`, { method: 'DELETE' });
        setNotification({ message: 'Folder deleted', type: 'success' });
        setIsFolderDeleteModalOpen(false);
        setFolderToDelete(null);
        await reloadEverything();
      } catch (error) {
        setNotification({ message: error instanceof Error ? error.message : 'Folder delete failed', type: 'error' });
      }
    })();
  };

  const moveFoldersForModal: MoveMediaFolder[] = folders.map(f => ({ id: f.id, name: f.name, parentId: f.parentId }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hidden Modals */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadComplete}
        folders={moveFoldersForModal}
        defaultFolderId={currentFolderId}
      />

      <MediaDetailsModal
        isOpen={!!detailsModalItem}
        onClose={() => setDetailsModalItem(null)}
        mediaItem={detailsModalItem}
        onSave={handleSaveDetails}
        onDelete={initiateDelete}
        onReplace={handleReplaceMedia}
        onRename={handleRenameMedia}
      />

      <MoveMediaModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={confirmMove}
        folders={moveFoldersForModal}
      />

      <BulkEditMediaModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={confirmBulkEdit}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isProcessing}
        title={activeTab === 'library' ? 'Move to Trash?' : 'Delete Permanently?'}
        message={activeTab === 'library' ? 'Are you sure you want to move selected items to trash?' : 'This action cannot be undone.'}
        confirmLabel={activeTab === 'library' ? 'Move to Trash' : 'Delete Forever'}
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        isLoading={isProcessing}
        title="Restore Items?"
        message="Restore selected items to library?"
        confirmLabel="Restore"
        isDestructive={false}
      />

      <ConfirmationModal
        isOpen={isFolderDeleteModalOpen}
        onClose={() => setIsFolderDeleteModalOpen(false)}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder?"
        message="Items inside will be moved to the root directory."
        confirmLabel="Delete Folder"
        isDestructive={true}
      />

      {/* Simple Folder Form Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFolderModalOpen(false)}
          />
          <div className="relative bg-surface rounded-modal shadow-modal p-6 w-full max-w-sm animate-fade-in-up border border-border">
            <h3 className="text-heading-4 text-foreground mb-4">
              {folderModalMode === 'create' ? 'New Folder' : 'Rename Folder'}
            </h3>
            <input
              ref={folderNameInputRef}
              type="text"
              className="w-full border border-border rounded-input px-3 py-2 text-body-small mb-4 bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              placeholder="Folder Name"
              value={folderNameInput}
              onChange={e => setFolderNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitFolderForm()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFolderForm}
                disabled={!folderNameInput.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors disabled:opacity-50"
              >
                {folderModalMode === 'create' ? 'Create' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-surface text-foreground px-4 py-3 rounded-card shadow-card flex items-center gap-3 border border-border">
            <CheckCircle className={`icon-sm ${notification.type === 'success' ? 'text-success' : 'text-error'}`} />
            <span className="text-body-small">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up w-[90%] max-w-3xl">
          <div className="bg-surface text-foreground p-3 rounded-card shadow-modal flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-border">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start pl-2">
              <span className="bg-background-alt text-foreground text-caption px-2 py-0.5 rounded-full border border-border">{selectedIds.size}</span>
              <span className="text-body-small whitespace-nowrap">Selected</span>
            </div>

            <div className="h-px w-full sm:h-8 sm:w-px bg-border"></div>

            <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 bg-surface border border-border text-button text-foreground rounded-button transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                type="button"
              >
                Clear
              </button>

              {activeTab === 'trash' ? (
                <button
                  onClick={initiateBulkRestore}
                  className="px-3 py-1.5 bg-success hover:bg-success/90 text-success-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  type="button"
                >
                  <RotateCcw className="icon-sm" /> Restore
                </button>
              ) : (
                <>
                  <button
                    onClick={initiateBulkEdit}
                    className="px-3 py-1.5 bg-foreground hover:bg-foreground/90 text-background text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    type="button"
                  >
                    <Edit2 className="icon-sm" /> Edit
                  </button>
                  <button
                    onClick={initiateBulkMove}
                    className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    type="button"
                  >
                    <FolderInput className="icon-sm" /> Move
                  </button>
                </>
              )}

              <button
                onClick={initiateBulkDelete}
                className="px-3 py-1.5 bg-error hover:bg-error/90 text-error-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                type="button"
              >
                <Trash2 className="icon-sm" /> {activeTab === 'library' ? 'Trash' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Area */}
      <div className="bg-surface border-b border-border px-6 py-6 sticky top-0 z-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-heading-2 text-foreground">
                {activeTab === 'library' ? 'Media Library' : 'Media Trash'}
              </h1>

              <nav className="flex items-center text-body-small text-muted-foreground overflow-x-auto no-scrollbar whitespace-nowrap">
                {activeTab === 'library' ? (
                  breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id || 'root'}>
                      {index > 0 && <ChevronRight className="icon-sm mx-1 text-muted-foreground flex-shrink-0" />}
                      <button
                        onClick={() => setCurrentFolderId(crumb.id)}
                        className={`hover:text-accent transition-colors flex items-center gap-1.5 ${
                          index === breadcrumbs.length - 1 ? 'text-foreground' : ''
                        }`}
                      >
                        {index === 0 && <Home className="icon-sm" />}
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  ))
                ) : (
                  <span className="flex items-center gap-2 text-foreground">
                    <Trash2 className="icon-sm" /> Trash
                  </span>
                )}
              </nav>

              {activeTab === 'library' && !searchQuery && (
                <p className="text-caption text-muted-foreground">
                  {currentSubfolders.length} folders, {filteredMedia.length} files
                </p>
              )}
            </div>

            {activeTab === 'library' && (
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="inline-flex items-center justify-center px-4 py-2 bg-surface border border-border text-foreground hover:bg-surface-hover rounded-button transition-colors text-button"
                >
                  <FolderInput className="icon-sm mr-2" />
                  New Folder
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button shadow-button transition-colors text-button"
                >
                  <Upload className="icon-sm mr-2" />
                  Upload
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-background-alt p-2 rounded-card border border-border">
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
              <div className="flex bg-surface rounded-input p-1 border border-border shadow-card">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`px-3 py-1.5 rounded-button text-button transition ${
                    activeTab === 'library' ? 'bg-background-alt text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Library
                </button>
                <button
                  onClick={() => setActiveTab('trash')}
                  className={`px-3 py-1.5 rounded-button text-button transition ${
                    activeTab === 'trash'
                      ? 'bg-error/10 text-error border border-error/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Trash
                </button>
              </div>

              <div className="w-px h-8 bg-border hidden md:block" />

              <div className="flex items-center gap-1">
                {(['all', 'image', 'video', 'document'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 text-button rounded-button transition capitalize whitespace-nowrap ${
                      typeFilter === type
                        ? 'bg-surface text-foreground shadow-button border border-border'
                        : 'text-muted-foreground hover:bg-surface/50'
                    }`}
                  >
                    {type === 'all' ? 'All' : `${type}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="relative flex-grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-xs text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background-alt border border-border rounded-input text-body-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition"
                />
              </div>

              {/* Date Range Filter */}
              {activeTab === 'library' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-border rounded-input text-body-small bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    placeholder="From"
                    aria-label="Date from"
                    style={{ minWidth: 120 }}
                  />
                  <span className="text-muted-foreground text-caption">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-border rounded-input text-body-small bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    placeholder="To"
                    aria-label="Date to"
                    style={{ minWidth: 120 }}
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => { setDateFrom(''); setDateTo(''); }}
                      className="ml-1 px-3 py-2 text-button text-muted-foreground hover:text-foreground bg-surface border border-border rounded-button transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="hidden lg:flex items-center gap-2 px-2">
                  <ZoomOut className="icon-xs text-muted-foreground" />
                  <input
                    type="range"
                    min="120"
                    max="380"
                    step="10"
                    value={thumbnailSize}
                    onChange={e => setThumbnailSize(parseInt(e.target.value))}
                    className="w-16 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                  <ZoomIn className="icon-xs text-muted-foreground" />
                </div>
              )}

              <div className="flex bg-surface p-1 rounded-input border border-border shadow-card">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'grid' ? 'bg-background-alt text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition ${
                    viewMode === 'list' ? 'bg-background-alt text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {viewState === 'loading' && <SkeletonMediaGrid />}

        {viewState === 'success' && filteredMedia.length === 0 && currentSubfolders.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-card bg-background-alt">
            <div className="bg-surface p-4 rounded-full shadow-card mb-4 border border-border">
              <FolderOpen className="icon-xl text-muted-foreground" />
            </div>
            <h3 className="text-heading-5 text-foreground">Empty Folder</h3>
            <p className="text-body-small text-muted-foreground mt-1 mb-4">Drag files here or start by creating a new folder.</p>
            {activeTab === 'library' && (
              <div className="flex gap-3">
                <button onClick={handleCreateFolder} className="text-button text-accent hover:underline">
                  Create Folder
                </button>
                <span className="text-muted-foreground">|</span>
                <button onClick={() => setIsUploadModalOpen(true)} className="text-button text-accent hover:underline">
                  Upload File
                </button>
              </div>
            )}
          </div>
        )}

        {viewState === 'success' && (filteredMedia.length > 0 || currentSubfolders.length > 0) && (
          <>
            {activeTab === 'library' && currentSubfolders.length > 0 && !searchQuery && (
              <div className="mb-8">
                <h4 className="text-label text-muted-foreground uppercase tracking-wider mb-4 px-1">Folders</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {currentSubfolders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      onDragOver={e => handleFolderDragOver(e, folder.id)}
                      onDragLeave={handleFolderDragLeave}
                      onDrop={e => handleFolderDrop(e, folder.id)}
                      className={`group relative flex flex-col p-4 bg-surface border rounded-card cursor-pointer transition hover:shadow-card ${
                        dragOverFolderId === folder.id
                          ? 'border-accent ring-2 ring-accent/30 bg-accent/10'
                          : 'border-border hover:border-accent/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <FolderIcon
                          className={`w-8 h-8 mb-3 ${
                            dragOverFolderId === folder.id
                              ? 'text-accent fill-accent/20'
                              : 'text-warning fill-warning/10'
                          }`}
                        />

                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-button transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === folder.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-card shadow-dropdown z-20 overflow-hidden text-caption py-1">
                              <button
                                onClick={() => handleRenameFolder(folder)}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Edit2 className="w-3 h-3" /> Rename
                              </button>
                              <button
                                onClick={() => handleDeleteFolder(folder.id)}
                                className="w-full text-left px-3 py-2 hover:bg-error/10 flex items-center gap-2 text-error"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-body-small text-foreground truncate" title={folder.name}>
                        {folder.name}
                      </span>
                      <span className="text-caption text-muted-foreground mt-1">{media.filter(m => m.folderId === folder.id).length} items</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredMedia.length > 0 && (
              <div>
                {currentSubfolders.length > 0 && <h4 className="text-label text-muted-foreground uppercase tracking-wider mb-4 px-1">Files</h4>}

                {viewMode === 'grid' && (
                  <div className="mb-4 flex items-center px-1">
                    <label className="flex items-center gap-2 text-body-small text-muted-foreground cursor-pointer hover:text-foreground select-none">
                      <input
                        type="checkbox"
                        checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length}
                        ref={input => {
                          if (input) input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length;
                        }}
                        onChange={handleSelectAll}
                        className="rounded border-border text-accent w-4 h-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      />
                      {selectedIds.size > 0 ? `${selectedIds.size} Selected` : 'Select All Files'}
                    </label>
                  </div>
                )}

                {viewMode === 'grid' ? (
                  <div
                    className="grid gap-4 animate-fade-in pb-20"
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))` }}
                  >
                    {filteredMedia.map(item => {
                      const isSelected = selectedIds.has(item.id);
                      const isLibrary = activeTab === 'library';
                      return (
                        <div
                          key={item.id}
                          className={`group relative bg-surface border rounded-card shadow-card hover:shadow-modal transition cursor-pointer flex flex-col ${
                            isSelected ? 'ring-2 ring-accent/40 border-accent/40' : 'border-border'
                          }`}
                          onClick={() => handleItemClick(item as MediaItem)}
                          draggable={isLibrary}
                          onDragStart={e => isLibrary && handleDragStart(e, item as MediaItem)}
                        >
                          <div
                            className={`absolute top-2 left-2 z-10 ${isSelected ? 'block' : 'hidden group-hover:block'}`}
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                handleSelectOne(item.id, e as any);
                              }}
                              className="w-5 h-5 rounded border-border text-accent cursor-pointer shadow-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            />
                          </div>

                          <div className="aspect-square bg-background-alt relative overflow-hidden flex items-center justify-center rounded-t-card">
                            {item.type === 'image' ? (
                              <Image
                                src={item.url}
                                alt={item.name}
                                fill
                                sizes={`${thumbnailSize}px`}
                                className="object-cover transition-transform group-hover:scale-105 duration-500"
                              />
                            ) : item.type === 'video' ? (
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => {
                                  e.currentTarget.pause();
                                  e.currentTarget.currentTime = 0;
                                }}
                              />
                            ) : (
                              <FileIcon type={item.type} />
                            )}

                            <div className="absolute inset-0 bg-overlay/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 backdrop-blur-[1px]">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleCopyUrl(item.url);
                                }}
                                className="p-2 bg-surface/90 hover:bg-surface text-foreground rounded-full shadow-button transition-transform hover:scale-110"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  isLibrary ? initiateDelete(item.id) : initiateRestore(item.id);
                                }}
                                className={`p-2 bg-surface/90 hover:bg-surface rounded-full shadow-button transition-transform hover:scale-110 ${
                                  isLibrary ? 'text-error' : 'text-success'
                                }`}
                                title={isLibrary ? 'Trash' : 'Restore'}
                              >
                                {isLibrary ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="p-3 border-t border-border relative rounded-b-card flex-grow">
                            <h4 className="text-body-small text-foreground truncate w-full" title={item.name}>
                              {item.name}
                            </h4>
                            <div className="flex items-center justify-between mt-1 text-caption text-muted-foreground">
                              <span className="uppercase">{item.type}</span>
                              <span>{item.size}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden animate-fade-in pb-20">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-background-alt">
                        <tr>
                          <th scope="col" className="w-12 px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={filteredMedia.length > 0 && selectedIds.size === filteredMedia.length}
                              ref={input => {
                                if (input) input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredMedia.length;
                              }}
                              onChange={handleSelectAll}
                              className="rounded border-border text-accent w-4 h-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            />
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">
                            File
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-label text-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        {filteredMedia.map(item => {
                          const isSelected = selectedIds.has(item.id);
                          const isLibrary = activeTab === 'library';
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors group hover:bg-muted ${isSelected ? 'bg-accent/10' : ''} cursor-pointer`}
                              onClick={() => handleItemClick(item as MediaItem)}
                              draggable={isLibrary}
                              onDragStart={e => isLibrary && handleDragStart(e, item as MediaItem)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    handleSelectOne(item.id, e as any);
                                  }}
                                  className="rounded border-border text-accent w-4 h-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 mr-4 bg-background-alt rounded-input flex items-center justify-center overflow-hidden border border-border relative">
                                    {item.type === 'image' ? (
                                      <Image src={item.url} alt={item.name} fill sizes="40px" className="object-cover" />
                                    ) : (
                                      <FileIcon type={item.type} className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="text-body-small text-foreground truncate max-w-xs" title={item.name}>
                                    {item.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-caption bg-muted text-foreground capitalize border border-border">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-body-small text-muted-foreground">{item.size}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-body-small text-muted-foreground">
                                {isLibrary ? item.uploadedAt : (item as TrashedMediaItem).trashedAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-body-small" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleCopyUrl(item.url)}
                                    className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                    type="button"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => (isLibrary ? initiateDelete(item.id) : initiateRestore(item.id))}
                                    className={`p-1.5 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                                      isLibrary
                                        ? 'text-muted-foreground hover:text-error hover:bg-error/10'
                                        : 'text-muted-foreground hover:text-success hover:bg-success/10'
                                    }`}
                                    type="button"
                                  >
                                    {isLibrary ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

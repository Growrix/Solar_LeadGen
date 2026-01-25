'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Send,
  Tag,
  Trash2,
  User,
} from 'lucide-react';

import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import { BulkTagModal } from '@/components/admin/blog/shared/BulkTagModal';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import type { AdminBlogPost, AdminBlogStatus } from '@/lib/blog/adminApiClient';
import { deleteAdminBlogPost, listAdminBlogPostsWithMeta, updateAdminBlogPost } from '@/lib/blog/adminApiClient';

interface PostListProps {
  isTabbed?: boolean;
}

type ViewState = 'loading' | 'success' | 'error' | 'empty';
type StatusFilter = AdminBlogStatus | 'ALL' | 'NEEDS_REVIEW' | 'TRASH';

const STORAGE_KEYS = {
  viewMode: 'adminPostViewMode',
  visibleColumns: 'adminPostVisibleColumns',
  visibleBoardFields: 'adminPostVisibleBoardFields',
  trashedIds: 'adminPostTrashedIds',
  needsReviewIds: 'adminPostNeedsReviewIds',
} as const;

const LIST_COLUMNS = ['status', 'category', 'author', 'date'] as const;
const BOARD_FIELDS = ['coverImage', 'category', 'author', 'date', 'excerpt', 'tags'] as const;

function safeParseJsonArray(value: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return null;
  }
}

function sanitizeSet(value: string[] | null, allowed: readonly string[], fallback: Set<string>): Set<string> {
  if (!value) return new Set(fallback);
  const allowedSet = new Set(allowed);
  const next = new Set(value.filter((v) => allowedSet.has(v)));
  return next.size > 0 ? next : new Set(fallback);
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPostIssues(post: AdminBlogPost): string[] {
  const issues: string[] = [];
  if (!post.coverImageUrl) issues.push('Missing cover image');
  if (!post.excerpt) issues.push('Missing excerpt');
  if (!post.category) issues.push('Missing category');
  return issues;
}

const STATUS_LABELS: Record<AdminBlogStatus, string> = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const STATUS_PILL_STYLE: Record<AdminBlogStatus, { bg: string; text: string; border: string; icon?: React.ReactNode }> = {
  PUBLISHED: { bg: 'bg-success/15', text: 'text-success', border: 'border-success/20' },
  DRAFT: { bg: 'bg-muted', text: 'text-foreground-muted', border: 'border-border' },
  SCHEDULED: {
    bg: 'bg-info/15',
    text: 'text-info',
    border: 'border-info/20',
    icon: <Clock className="icon-xs mr-1" />,
  },
  ARCHIVED: { bg: 'bg-muted', text: 'text-foreground-muted', border: 'border-border', icon: <Archive className="icon-xs mr-1" /> },
};

function StatusPill({ status }: { status: AdminBlogStatus }) {
  const config = STATUS_PILL_STYLE[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption border ${config.bg} ${config.text} ${config.border} capitalize`}
    >
      {config.icon}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PostList({ isTabbed = false }: PostListProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [viewMode, setViewMode] = useState<'list' | 'board'>(() => {
    if (typeof window === 'undefined') return 'list';
    const saved = window.localStorage.getItem(STORAGE_KEYS.viewMode);
    return saved === 'board' || saved === 'list' ? saved : 'list';
  });

  const [showViewOptions, setShowViewOptions] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set(LIST_COLUMNS);
    const parsed = safeParseJsonArray(window.localStorage.getItem(STORAGE_KEYS.visibleColumns));
    return sanitizeSet(parsed, LIST_COLUMNS, new Set(LIST_COLUMNS));
  });
  const [visibleBoardFields, setVisibleBoardFields] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set(['coverImage', 'author', 'date']);
    const parsed = safeParseJsonArray(window.localStorage.getItem(STORAGE_KEYS.visibleBoardFields));
    return sanitizeSet(parsed, BOARD_FIELDS, new Set(['coverImage', 'author', 'date']));
  });

  const [trashedIds, setTrashedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const parsed = safeParseJsonArray(window.localStorage.getItem(STORAGE_KEYS.trashedIds));
    return new Set(parsed ?? []);
  });
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const parsed = safeParseJsonArray(window.localStorage.getItem(STORAGE_KEYS.needsReviewIds));
    return new Set(parsed ?? []);
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const viewOptionsButtonRef = useRef<HTMLButtonElement>(null);

  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [tempStatusValue, setTempStatusValue] = useState<AdminBlogStatus>('DRAFT');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'trash' | 'restore' | 'permanentDelete' | null>(null);
  const [pendingActionIds, setPendingActionIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setViewState('loading');
    try {
      const result = await listAdminBlogPostsWithMeta({
        status: 'ALL',
        q: searchQuery.trim() || undefined,
      });
      setPosts(result.posts);
      setViewState(result.posts.length === 0 ? 'empty' : 'success');
    } catch {
      setViewState('error');
    }
  }, [searchQuery]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.visibleColumns, JSON.stringify(Array.from(visibleColumns)));
  }, [visibleColumns]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.visibleBoardFields, JSON.stringify(Array.from(visibleBoardFields)));
  }, [visibleBoardFields]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.trashedIds, JSON.stringify(Array.from(trashedIds)));
  }, [trashedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.needsReviewIds, JSON.stringify(Array.from(needsReviewIds)));
  }, [needsReviewIds]);

  useEffect(() => {
    if (statusFilter === 'TRASH') setViewMode('list');
  }, [statusFilter]);

  useEffect(() => {
    if (viewMode === 'board' && statusFilter !== 'TRASH') setStatusFilter('ALL');
  }, [viewMode, statusFilter]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!showViewOptions) return;
      const target = e.target as Node;
      if (viewOptionsButtonRef.current?.contains(target)) return;
      setShowViewOptions(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showViewOptions]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const activePosts = useMemo(() => posts.filter((p) => !trashedIds.has(p.id)), [posts, trashedIds]);
  const trashedPosts = useMemo(() => posts.filter((p) => trashedIds.has(p.id)), [posts, trashedIds]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = statusFilter === 'TRASH' ? trashedPosts : activePosts;

    return list.filter((p) => {
      const matchesSearch = !query || (p.title || '').toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (statusFilter === 'NEEDS_REVIEW') return needsReviewIds.has(p.id);
      if (statusFilter === 'TRASH') return true;
      if (statusFilter === 'ALL') return true;
      return p.status === statusFilter;
    });
  }, [activePosts, needsReviewIds, searchQuery, statusFilter, trashedPosts]);

  const stats = useMemo(() => {
    const inReview = activePosts.filter((p) => needsReviewIds.has(p.id)).length;
    return {
      total: activePosts.length,
      published: activePosts.filter((p) => p.status === 'PUBLISHED').length,
      scheduled: activePosts.filter((p) => p.status === 'SCHEDULED').length,
      inReview,
      drafts: activePosts.filter((p) => p.status === 'DRAFT').length,
    };
  }, [activePosts, needsReviewIds]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const visibleSelectedCount = filteredItems.filter((i) => selectedIds.has(i.id)).length;
    const allSelected = filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;
    const someSelected = visibleSelectedCount > 0 && visibleSelectedCount < filteredItems.length;
    headerCheckboxRef.current.indeterminate = someSelected;
    headerCheckboxRef.current.checked = allSelected;
  }, [filteredItems, selectedIds]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredItems.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const openConfirm = (action: 'trash' | 'restore' | 'permanentDelete', ids: string[]) => {
    setConfirmAction(action);
    setPendingActionIds(ids);
    setConfirmModalOpen(true);
  };

  const closeConfirm = () => {
    if (isProcessing) return;
    setConfirmModalOpen(false);
    setConfirmAction(null);
    setPendingActionIds([]);
  };

  const confirmActionHandler = async () => {
    if (!confirmAction || pendingActionIds.length === 0) return;
    setIsProcessing(true);
    try {
      if (confirmAction === 'trash') {
        setTrashedIds((prev) => {
          const next = new Set(prev);
          pendingActionIds.forEach((id) => next.add(id));
          return next;
        });
        setSelectedIds(new Set());
        setNotification({ message: `Moved ${pendingActionIds.length} post(s) to trash.`, type: 'success' });
      }

      if (confirmAction === 'restore') {
        setTrashedIds((prev) => {
          const next = new Set(prev);
          pendingActionIds.forEach((id) => next.delete(id));
          return next;
        });
        setSelectedIds(new Set());
        setNotification({ message: `Restored ${pendingActionIds.length} post(s).`, type: 'success' });
      }

      if (confirmAction === 'permanentDelete') {
        for (const id of pendingActionIds) {
          // This is a real delete (server-side). Keep it only in Trash.
          // eslint-disable-next-line no-await-in-loop
          await deleteAdminBlogPost(id);
        }
        setTrashedIds((prev) => {
          const next = new Set(prev);
          pendingActionIds.forEach((id) => next.delete(id));
          return next;
        });
        setSelectedIds(new Set());
        setNotification({ message: `Deleted ${pendingActionIds.length} post(s) permanently.`, type: 'success' });
        await fetchData();
      }
    } catch {
      setNotification({ message: 'Action failed. Please try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
      closeConfirm();
    }
  };

  const handleBulkStatusChange = async (nextStatus: AdminBlogStatus) => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        // eslint-disable-next-line no-await-in-loop
        await updateAdminBlogPost(id, { status: nextStatus });
      }
      setNotification({
        message:
          nextStatus === 'PUBLISHED'
            ? `${selectedIds.size} post(s) published.`
            : nextStatus === 'ARCHIVED'
              ? `${selectedIds.size} post(s) archived.`
              : `${selectedIds.size} post(s) updated.`,
        type: 'success',
      });
      setSelectedIds(new Set());
      await fetchData();
    } catch {
      setNotification({ message: 'Bulk update failed. Please try again.', type: 'error' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkAddTags = async (newTags: string[]) => {
    if (selectedIds.size === 0 || newTags.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        const post = posts.find((p) => p.id === id);
        const existingTags = post?.tags ?? [];
        const mergedTags = Array.from(new Set([...existingTags, ...newTags]));
        // eslint-disable-next-line no-await-in-loop
        await updateAdminBlogPost(id, { tags: mergedTags });
      }
      setNotification({ message: `Tags added to ${selectedIds.size} post(s).`, type: 'success' });
      setSelectedIds(new Set());
      await fetchData();
    } catch {
      setNotification({ message: 'Bulk tagging failed. Please try again.', type: 'error' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const tabItems: Array<{ key: StatusFilter; label: string }> = [
    { key: 'ALL', label: 'all' },
    { key: 'PUBLISHED', label: 'published' },
    { key: 'DRAFT', label: 'draft' },
    { key: 'SCHEDULED', label: 'scheduled' },
    { key: 'ARCHIVED', label: 'archived' },
    { key: 'NEEDS_REVIEW', label: 'needs review' },
    { key: 'TRASH', label: 'trash' },
  ];

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleBoardField = (field: string) => {
    setVisibleBoardFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const handleToggleNeedsReview = (id: string) => {
    setNeedsReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startStatusEdit = (post: AdminBlogPost) => {
    if (statusFilter === 'TRASH') return;
    setEditingStatusId(post.id);
    setTempStatusValue(post.status);
  };

  const saveStatusEdit = async (postId: string, nextStatus: AdminBlogStatus) => {
    try {
      await updateAdminBlogPost(postId, { status: nextStatus });
      setNotification({ message: 'Status updated.', type: 'success' });
      await fetchData();
    } catch {
      setNotification({ message: 'Failed to update status.', type: 'error' });
    } finally {
      setEditingStatusId(null);
    }
  };

  const confirmCopy = useMemo(() => {
    const count = pendingActionIds.length;
    if (confirmAction === 'trash') {
      return {
        title: 'Move to Trash?',
        message:
          count === 1
            ? 'Are you sure you want to move this post to trash?'
            : `Are you sure you want to trash ${count} items?`,
        confirmLabel: 'Move to Trash',
        isDestructive: false,
      };
    }
    if (confirmAction === 'restore') {
      return {
        title: count === 1 ? 'Restore post?' : 'Restore selected posts?',
        message: count === 1 ? 'Are you sure you want to restore this post?' : `Are you sure you want to restore ${count} posts?`,
        confirmLabel: 'Restore',
        isDestructive: false,
      };
    }
    if (confirmAction === 'permanentDelete') {
      return {
        title: 'Delete Permanently?',
        message:
          count === 1
            ? 'Are you sure you want to permanently delete this post? This action cannot be undone.'
            : `Are you sure you want to permanently delete ${count} items?`,
        confirmLabel: 'Delete Forever',
        isDestructive: true,
      };
    }
    return {
      title: 'Confirm',
      message: 'Are you sure?',
      confirmLabel: 'Confirm',
      isDestructive: false,
    };
  }, [confirmAction, pendingActionIds.length]);

  return (
    <div className={`min-h-screen bg-background text-foreground relative ${isTabbed ? '' : 'pt-0'}`}>
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-foreground text-background px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-border">
             <CheckCircle className="w-5 h-5 text-success" />
             <span className="text-caption">{notification.message}</span>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={closeConfirm}
        onConfirm={confirmActionHandler}
        isLoading={isProcessing}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.confirmLabel}
        isDestructive={confirmCopy.isDestructive}
      />

      <BulkTagModal
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkAddTags}
      />

      {!isTabbed && (
        <div className="bg-surface border-b border-border px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-heading-2">Posts</h1>
              <p className="text-body text-muted-foreground mt-1">Manage and organize your blog content.</p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Link>
          </div>
        </div>
      )}

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-6 py-8 pb-32`}>
        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col">
            <span className="text-label text-muted-foreground uppercase tracking-wider mb-1">Total Posts</span>
            <span className="text-heading-2">{stats.total}</span>
          </div>
          <div className="bg-success/5 p-4 rounded-xl border border-success/20 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <span className="text-label text-success uppercase tracking-wider mb-1">Published</span>
            <span className="text-heading-2">{stats.published}</span>
          </div>
          <div className="bg-info/5 p-4 rounded-xl border border-info/20 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <Clock className="w-8 h-8 text-info" />
            </div>
            <span className="text-label text-info uppercase tracking-wider mb-1">Scheduled</span>
            <span className="text-heading-2">{stats.scheduled}</span>
          </div>
          <div className="bg-warning/5 p-4 rounded-xl border border-warning/20 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <span className="text-label text-warning uppercase tracking-wider mb-1">In Review</span>
            <span className="text-heading-2">{stats.inReview}</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col">
            <span className="text-label text-muted-foreground uppercase tracking-wider mb-1">Drafts</span>
            <span className="text-heading-2">{stats.drafts}</span>
          </div>
        </div>

        {/* Header / Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {viewMode === 'list' && (
              <div className="flex p-1 bg-surface border border-border rounded-lg shadow-sm">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setSelectedIds(new Set());
                    }}
                    className={`px-3 py-1.5 text-button rounded-md transition-colors transition-shadow transition-transform whitespace-nowrap ${
                      statusFilter === tab.key
                        ? 'bg-muted text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    } capitalize`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {statusFilter !== 'TRASH' && (
              <div className="flex p-1 bg-surface border border-border rounded-lg shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors transition-shadow transition-transform ${
                    viewMode === 'list' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`p-1.5 rounded-md transition-colors transition-shadow transition-transform ${
                    viewMode === 'board' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
              <button
                ref={viewOptionsButtonRef}
                type="button"
                onClick={() => setShowViewOptions(!showViewOptions)}
                className={`p-2 rounded-lg border transition-colors ${
                  showViewOptions
                    ? 'bg-muted border-border text-foreground'
                    : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                }`}
                title="Customize View"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {showViewOptions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowViewOptions(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-border bg-background-alt flex justify-between items-center">
                      <h4 className="text-label text-muted-foreground uppercase tracking-wider">
                        {viewMode === 'list' ? 'Columns' : 'Card Fields'}
                      </h4>
                      <button
                        onClick={() => setShowViewOptions(false)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Close view options"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-2 space-y-1">
                      {viewMode === 'list' ? (
                        <>
                          {LIST_COLUMNS.map((col) => (
                            <label key={col} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={visibleColumns.has(col)}
                                onChange={() => toggleColumn(col)}
                                className="w-4 h-4 rounded border-input text-accent focus:ring-ring"
                              />
                              <span className="text-body text-muted-foreground capitalize">{col}</span>
                            </label>
                          ))}
                        </>
                      ) : (
                        <>
                          {BOARD_FIELDS.map((field) => (
                            <label key={field} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={visibleBoardFields.has(field)}
                                onChange={() => toggleBoardField(field)}
                                className="w-4 h-4 rounded border-input text-accent focus:ring-ring"
                              />
                              <span className="text-body text-muted-foreground capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative flex-grow md:flex-grow-0 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder={statusFilter === 'TRASH' ? 'Search trash...' : 'Search posts...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-background text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>

            {isTabbed && statusFilter !== 'TRASH' && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Post
              </Link>
            )}
          </div>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-surface rounded-lg border border-border p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-destructive/10 p-3 rounded-full mb-3 border border-destructive/20">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-heading-4 mb-2">Could not load posts</h3>
            <button
              onClick={() => fetchData()}
              className="text-button text-muted-foreground hover:text-foreground underline flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </button>
          </div>
        )}

        {viewState === 'success' && filteredItems.length === 0 && (
          <div className="bg-surface rounded-lg border border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-muted p-4 rounded-full mb-4 border border-border">
              {statusFilter === 'TRASH' ? <Trash2 className="w-8 h-8 text-muted-foreground" /> : <FileText className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-heading-4 mb-1">{statusFilter === 'TRASH' ? 'Trash is empty' : 'No posts found'}</h3>
            <p className="text-body text-muted-foreground mb-6">
              {statusFilter === 'TRASH'
                ? 'Deleted posts will appear here.'
                : `No ${statusFilter === 'ALL' ? '' : statusFilter.toLowerCase().replace(/_/g, ' ')} posts found.`}
            </p>
            {statusFilter !== 'TRASH' && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-background border border-input text-foreground rounded-lg hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create Post
              </Link>
            )}
          </div>
        )}

        {/* List */}
        {viewState === 'success' && viewMode === 'list' && filteredItems.length > 0 && (
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background-alt">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12">
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-input text-accent focus:ring-ring cursor-pointer"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    {visibleColumns.has('status') && (
                      <th scope="col" className="px-6 py-3 text-left text-label text-muted-foreground uppercase tracking-wider w-36">
                        Status
                      </th>
                    )}
                    {visibleColumns.has('category') && (
                      <th scope="col" className="px-6 py-3 text-left text-label text-muted-foreground uppercase tracking-wider w-40">
                        Category
                      </th>
                    )}
                    {visibleColumns.has('author') && (
                      <th scope="col" className="px-6 py-3 text-left text-label text-muted-foreground uppercase tracking-wider w-40">
                        Author
                      </th>
                    )}
                    {visibleColumns.has('date') && (
                      <th scope="col" className="px-6 py-3 text-left text-label text-muted-foreground uppercase tracking-wider w-40">
                        Updated
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-right text-label text-muted-foreground uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredItems.map((post) => {
                    const issues = getPostIssues(post);
                    const hasIssues = issues.length > 0;
                    const isNeedsReview = needsReviewIds.has(post.id);
                    const isSelected = selectedIds.has(post.id);

                    return (
                      <tr
                        key={post.id}
                        className={`transition-colors group ${isSelected ? 'bg-accent/10 hover:bg-accent/15' : 'hover:bg-muted/40'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(post.id)}
                            className="w-4 h-4 rounded border-input text-accent focus:ring-ring cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-body text-foreground line-clamp-1">{post.title || '(Untitled)'}</span>
                                {hasIssues && (
                                  <div className="relative group/tooltip">
                                    <AlertTriangle className="w-4 h-4 text-warning" />
                                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-56 bg-foreground text-background text-caption rounded-lg p-3 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-colors transition-shadow transition-transform z-30 border border-border">
                                      <div className="text-label mb-2">Attention Needed:</div>
                                      <ul className="space-y-1">
                                        {issues.map((issue) => (
                                          <li key={issue} className="flex items-start gap-2">
                                            <span className="mt-0.5">•</span>
                                            <span>{issue}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                                {isNeedsReview && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-warning/15 text-warning border border-warning/20">
                                    Needs Review
                                  </span>
                                )}
                              </div>
                            </div>

                            {statusFilter !== 'TRASH' && (
                              <button
                                type="button"
                                onClick={() => handleToggleNeedsReview(post.id)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isNeedsReview
                                    ? 'bg-warning/10 border-warning/20 text-warning'
                                    : 'bg-background border-input text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                                title={isNeedsReview ? 'Remove Needs Review' : 'Mark as Needs Review'}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>

                        {visibleColumns.has('status') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStatusId === post.id ? (
                              <select
                                value={tempStatusValue}
                                onChange={(e) => {
                                  const next = e.target.value as AdminBlogStatus;
                                  setTempStatusValue(next);
                                  void saveStatusEdit(post.id, next);
                                }}
                                onBlur={() => setEditingStatusId(null)}
                                className="text-body border border-input rounded-lg px-2 py-1 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                            ) : (
                              <button
                                type="button"
                                onDoubleClick={() => startStatusEdit(post)}
                                className="cursor-default"
                                title={statusFilter === 'TRASH' ? undefined : 'Double-click to edit'}
                              >
                                <StatusPill status={post.status} />
                              </button>
                            )}
                          </td>
                        )}

                        {visibleColumns.has('category') && (
                          <td className="px-6 py-4 whitespace-nowrap text-body text-muted-foreground">{post.category || '—'}</td>
                        )}
                        {visibleColumns.has('author') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 text-body text-muted-foreground">
                              <User className="w-4 h-4 text-muted-foreground" />
                              Admin
                            </span>
                          </td>
                        )}
                        {visibleColumns.has('date') && (
                          <td className="px-6 py-4 whitespace-nowrap text-body text-muted-foreground">{formatDate(post.updatedAt)}</td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap text-right text-button">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {statusFilter === 'TRASH' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openConfirm('restore', [post.id])}
                                  className="p-1.5 text-muted-foreground hover:text-success hover:bg-success/10 rounded transition-colors"
                                  title="Restore"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openConfirm('permanentDelete', [post.id])}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                  title="Delete Forever"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/admin/blog/${encodeURIComponent(post.id)}/preview`}
                                  className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/admin/blog/${encodeURIComponent(post.id)}`}
                                  className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openConfirm('trash', [post.id])}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                  title="Trash"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="border-t border-border bg-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-body text-muted-foreground">Showing {filteredItems.length} items</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground bg-muted cursor-not-allowed text-button"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground bg-muted cursor-not-allowed text-button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Board */}
        {viewState === 'success' && viewMode === 'board' && statusFilter !== 'TRASH' && (
          <div>
            <div className="mb-4 text-body text-warning bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Drag-and-drop is a prototype placeholder.
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar">
              {(
                [
                  { key: 'DRAFT', title: 'Drafts', tone: 'slate' },
                  { key: 'NEEDS_REVIEW', title: 'Needs Review', tone: 'amber' },
                  { key: 'SCHEDULED', title: 'Scheduled', tone: 'blue' },
                  { key: 'PUBLISHED', title: 'Published', tone: 'green' },
                ] as const
              ).map((col) => {
                const boardItems = filteredItems.filter((p) => p.status !== 'ARCHIVED');

                const columnItems =
                  col.key === 'NEEDS_REVIEW'
                    ? boardItems.filter((p) => needsReviewIds.has(p.id))
                    : boardItems.filter((p) => !needsReviewIds.has(p.id) && p.status === col.key);

                const headerTone =
                  col.tone === 'amber'
                    ? { border: 'border-warning/20', bg: 'bg-warning/10', text: 'text-warning', count: 'text-warning' }
                    : col.tone === 'blue'
                      ? { border: 'border-info/20', bg: 'bg-info/10', text: 'text-info', count: 'text-info' }
                      : col.tone === 'green'
                        ? { border: 'border-success/20', bg: 'bg-success/10', text: 'text-success', count: 'text-success' }
                        : { border: 'border-border', bg: 'bg-background-alt', text: 'text-foreground', count: 'text-muted-foreground' };

                return (
                  <div key={col.key} className="min-w-[320px] w-[320px] shrink-0 bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className={`px-4 py-3 border-b ${headerTone.border} ${headerTone.bg} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-button ${headerTone.text}`}>{col.title}</span>
                        <span className={`text-caption ${headerTone.count}`}>({columnItems.length})</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      {columnItems.length === 0 && (
                        <div className="text-body text-muted-foreground px-3 py-6 text-center">No posts</div>
                      )}
                      {columnItems.map((post) => {
                        const issues = getPostIssues(post);
                        const hasIssues = issues.length > 0;
                        const needsReview = needsReviewIds.has(post.id);
                        const showCover = visibleBoardFields.has('coverImage');
                        const isSelected = selectedIds.has(post.id);

                        return (
                          <div key={post.id} className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                            {showCover && (
                              <div className="relative h-32 bg-muted">
                                {post.coverImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={post.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <FileText className="w-8 h-8" />
                                  </div>
                                )}
                                {!post.coverImageUrl && hasIssues && (
                                  <div className="absolute top-2 right-2 bg-warning/15 text-warning border border-warning/20 rounded-lg px-2 py-1 text-caption flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Issue
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSelectRow(post.id)}
                                      className="h-4 w-4 rounded border-input text-accent focus:ring-ring"
                                      aria-label="Select post"
                                    />
                                    <div className="text-body text-foreground line-clamp-2">{post.title || '(Untitled)'}</div>
                                    {(hasIssues && post.coverImageUrl) && (
                                      <div className="relative group/tooltip">
                                        <AlertTriangle className="w-4 h-4 text-warning" />
                                        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-56 bg-foreground text-background text-caption rounded-lg p-3 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-colors transition-shadow transition-transform z-30 border border-border">
                                          <div className="text-label mb-2">Attention Needed:</div>
                                          <ul className="space-y-1">
                                            {issues.map((issue) => (
                                              <li key={issue} className="flex items-start gap-2">
                                                <span className="mt-0.5">•</span>
                                                <span>{issue}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                    {needsReview && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-warning/15 text-warning border border-warning/20">
                                        Needs Review
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-caption text-muted-foreground font-mono mt-1">/{post.slug}</div>
                                </div>
                              </div>

                              <div className="mt-3 space-y-2">
                                {visibleBoardFields.has('category') && (
                                  <div className="text-body text-muted-foreground">Category: {post.category || '—'}</div>
                                )}
                                {visibleBoardFields.has('author') && (
                                  <div className="text-body text-muted-foreground flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" /> Admin
                                  </div>
                                )}
                                {visibleBoardFields.has('date') && (
                                  <div className="text-body text-muted-foreground">Updated: {formatDate(post.updatedAt)}</div>
                                )}
                                {visibleBoardFields.has('excerpt') && post.excerpt && (
                                  <div className="text-body text-muted-foreground line-clamp-3">{post.excerpt}</div>
                                )}
                                {visibleBoardFields.has('tags') && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {post.tags.slice(0, 3).map((t) => (
                                      <span key={t} className="text-caption px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/blog/${encodeURIComponent(post.id)}`}
                                    className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/admin/blog/${encodeURIComponent(post.id)}/preview`}
                                    className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded transition-colors"
                                    title="Preview"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => openConfirm('trash', [post.id])}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                    title="Move to Trash"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleNeedsReview(post.id)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    needsReview
                                      ? 'bg-warning/10 border-warning/20 text-warning'
                                      : 'bg-background border-input text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                  }`}
                                  title={needsReview ? 'Remove Needs Review' : 'Mark as Needs Review'}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up w-[90%] max-w-4xl">
            <div className="bg-foreground text-background p-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-border">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start pl-2">
                <span className="bg-background text-foreground text-caption px-2 py-0.5 rounded-full border border-border">{selectedIds.size}</span>
                <span className="text-button whitespace-nowrap">Selected</span>
              </div>

              <div className="h-px w-full sm:h-8 sm:w-px bg-border"></div>

              <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
                {statusFilter !== 'TRASH' ? (
                  <>
                    <button
                      type="button"
                      disabled={isBulkProcessing}
                      onClick={() => void handleBulkStatusChange('PUBLISHED')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-success hover:bg-success/90 disabled:opacity-60 disabled:hover:bg-success text-success-foreground text-button rounded-lg transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" /> Publish
                    </button>
                    <button
                      type="button"
                      disabled={isBulkProcessing}
                      onClick={() => void handleBulkStatusChange('ARCHIVED')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-60 disabled:hover:bg-muted text-foreground text-button rounded-lg transition-colors shadow-sm border border-border"
                    >
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                    <button
                      type="button"
                      disabled={isBulkProcessing}
                      onClick={() => setIsBulkTagModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-info hover:bg-info/90 disabled:opacity-60 disabled:hover:bg-info text-info-foreground text-button rounded-lg transition-colors shadow-sm"
                    >
                      <Tag className="w-4 h-4" /> Tag
                    </button>
                    <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                    <button
                      type="button"
                      onClick={() => openConfirm('trash', Array.from(selectedIds))}
                      className="flex items-center gap-2 px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-button rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Trash
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openConfirm('restore', Array.from(selectedIds))}
                      className="flex items-center gap-2 px-4 py-1.5 bg-success hover:bg-success/90 text-success-foreground text-button rounded-lg transition-colors shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => openConfirm('permanentDelete', Array.from(selectedIds))}
                      className="flex items-center gap-2 px-4 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-button rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Forever
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-button text-muted-foreground hover:text-background hover:bg-background/10 rounded-lg transition-colors whitespace-nowrap ml-2"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

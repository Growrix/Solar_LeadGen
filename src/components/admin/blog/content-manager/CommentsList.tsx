'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  EyeOff,
  ShieldAlert,
  Edit2,
} from 'lucide-react';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import { BulkModerateModal } from '@/components/admin/blog/shared/BulkModerateModal';
import { ModerateCommentModal } from '@/components/admin/blog/shared/ModerateCommentModal';
import type { Comment, CommentStatus } from '@/components/admin/blog/shared/commentTypes';

type ViewState = 'loading' | 'success' | 'error' | 'empty';

const STUB_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    authorName: 'Alex Rivera',
    authorEmail: 'alex@example.com',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    content: 'This was super helpful — thanks for breaking it down so clearly.',
    status: 'pending',
    submittedAt: 'Jan 22, 2026 · 10:14 AM',
    postTitle: 'Solar Battery Storage Trends 2025',
    postSlug: 'solar-battery-trends-2025',
  },
  {
    id: 'c-2',
    authorName: 'Jamie Chen',
    authorEmail: 'jamie@example.com',
    authorAvatar: 'https://i.pravatar.cc/100?img=5',
    content: 'Do you have a source for the STC deeming period reduction timeline?',
    status: 'approved',
    submittedAt: 'Jan 23, 2026 · 2:05 PM',
    postTitle: 'Tax Incentives for Commercial Solar',
    postSlug: 'commercial-solar-tax-incentives',
  },
  {
    id: 'c-3',
    authorName: 'Morgan Patel',
    authorEmail: 'morgan@example.com',
    authorAvatar: 'https://i.pravatar.cc/100?img=32',
    content: 'Buy cheap panels at spammy-site.example — limited time deal!',
    status: 'spam',
    submittedAt: 'Jan 24, 2026 · 9:01 AM',
    postTitle: 'The Myth of cloudy days',
    postSlug: 'myth-cloudy-days-solar',
  },
];

export function CommentsList({ isTabbed = false }: { isTabbed?: boolean }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [comments, setComments] = useState<Comment[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CommentStatus>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [isBulkModerateModalOpen, setIsBulkModerateModalOpen] = useState(false);
  const [bulkModerateAction, setBulkModerateAction] = useState<CommentStatus | null>(null);
  const [isBulkModerating, setIsBulkModerating] = useState(false);

  const fetchData = () => {
    setViewState('loading');
    setSelectedIds(new Set());
    setTimeout(() => {
      const data = STUB_COMMENTS;
      setComments(data);
      setViewState(data.length === 0 ? 'empty' : 'success');
    }, 500);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredComments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return comments.filter((comment) => {
      const matchesSearch =
        comment.authorName.toLowerCase().includes(q) || comment.content.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [comments, searchQuery, statusFilter]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allSelected = filteredComments.length > 0 && selectedIds.size === filteredComments.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < filteredComments.length;
    headerCheckboxRef.current.indeterminate = someSelected;
    headerCheckboxRef.current.checked = allSelected;
  }, [selectedIds, filteredComments]);

  const updateCommentStatus = (id: string, status: CommentStatus) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredComments.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  const initiateBulkDelete = () => {
    if (selectedIds.size > 0) setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setIsBulkDeleting(true);
    setTimeout(() => {
      selectedIds.forEach((id) => deleteComment(id));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setNotification({ message: `${count} comments deleted permanently.`, type: 'success' });
      setIsBulkDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }, 500);
  };

  const initiateBulkStatusChange = (status: CommentStatus) => {
    if (selectedIds.size > 0) {
      setBulkModerateAction(status);
      setIsBulkModerateModalOpen(true);
    }
  };

  const handleBulkModerateConfirm = (note?: string) => {
    void note;
    if (!bulkModerateAction) return;

    setIsBulkModerating(true);
    setTimeout(() => {
      selectedIds.forEach((id) => updateCommentStatus(id, bulkModerateAction));

      const count = selectedIds.size;
      const actionLabels: Record<CommentStatus, string> = {
        approved: 'approved',
        hidden: 'hidden',
        spam: 'marked as spam',
        pending: 'marked as pending',
      };
      const label = actionLabels[bulkModerateAction] || 'updated';
      setNotification({ message: `${count} comments ${label} successfully.`, type: 'success' });

      setSelectedIds(new Set());
      setIsBulkModerating(false);
      setIsBulkModerateModalOpen(false);
      setBulkModerateAction(null);
    }, 500);
  };

  const handleUpdateStatus = (id: string, newStatus: CommentStatus) => {
    updateCommentStatus(id, newStatus);

    let message = '';
    if (newStatus === 'approved') message = 'Comment approved.';
    if (newStatus === 'hidden') message = 'Comment hidden from public.';
    if (newStatus === 'spam') message = 'Comment marked as spam.';
    if (newStatus === 'pending') message = 'Comment marked as pending.';

    setNotification({ message, type: 'success' });
  };

  const handleModerateClick = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (comment) {
      setSelectedComment(comment);
      setIsModerateModalOpen(true);
    }
  };

  const handleModerationComplete = (action: CommentStatus, note?: string) => {
    void note;
    if (!selectedComment) return;
    handleUpdateStatus(selectedComment.id, action);
  };

  const handleDeleteClick = (id: string) => {
    setCommentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!commentToDelete) return;

    setIsDeleting(true);
    setTimeout(() => {
      deleteComment(commentToDelete);

      if (selectedIds.has(commentToDelete)) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(commentToDelete);
          return next;
        });
      }

      setNotification({ message: 'Comment deleted permanently.', type: 'success' });
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    }, 500);
  };

  const StatusPill = ({ status }: { status: CommentStatus }) => {
    const styles: Record<CommentStatus, string> = {
      pending: 'bg-warning/15 text-warning border-warning/20',
      approved: 'bg-success/15 text-success border-success/20',
      hidden: 'bg-muted text-foreground-muted border-border',
      spam: 'bg-error/15 text-error border-error/20',
    };

    const labels: Record<CommentStatus, string> = {
      pending: 'Pending',
      approved: 'Approved',
      hidden: 'Hidden',
      spam: 'Spam',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption border ${styles[status]} capitalize`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-background font-sans text-foreground relative ${isTabbed ? '' : 'pt-0'}`}>
      <ModerateCommentModal
        isOpen={isModerateModalOpen}
        onClose={() => setIsModerateModalOpen(false)}
        comment={selectedComment}
        onAction={handleModerationComplete}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete comment?"
        message="Are you sure you want to delete this comment? This action is permanent and cannot be undone."
        confirmLabel="Delete Comment"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        isLoading={isBulkDeleting}
        title="Delete selected comments?"
        message={`Are you sure you want to delete ${selectedIds.size} selected comments? This action is permanent and cannot be undone.`}
        confirmLabel="Delete Comments"
        isDestructive={true}
      />

      <BulkModerateModal
        isOpen={isBulkModerateModalOpen}
        onClose={() => setIsBulkModerateModalOpen(false)}
        onConfirm={handleBulkModerateConfirm}
        action={bulkModerateAction}
        count={selectedIds.size}
        isLoading={isBulkModerating}
      />

      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-surface text-foreground px-4 py-3 rounded-card shadow-card flex items-center gap-3 border border-border">
            <CheckCircle className="icon-sm text-success" />
            <span className="text-body-small">{notification.message}</span>
          </div>
        </div>
      )}

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
                onClick={() => initiateBulkStatusChange('approved')}
                className="px-3 py-1.5 bg-success hover:bg-success/90 text-success-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Approve Selected"
                type="button"
              >
                <CheckCircle className="icon-sm" /> <span className="hidden sm:inline">Approve</span>
              </button>
              <button
                onClick={() => initiateBulkStatusChange('hidden')}
                className="px-3 py-1.5 bg-foreground hover:bg-foreground/90 text-background text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Hide Selected"
                type="button"
              >
                <EyeOff className="icon-sm" /> <span className="hidden sm:inline">Hide</span>
              </button>
              <button
                onClick={() => initiateBulkStatusChange('spam')}
                className="px-3 py-1.5 bg-warning hover:bg-warning/90 text-warning-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Mark as Spam"
                type="button"
              >
                <ShieldAlert className="icon-sm" /> <span className="hidden sm:inline">Mark Spam</span>
              </button>
              <button
                onClick={initiateBulkDelete}
                className="px-3 py-1.5 bg-error hover:bg-error/90 text-error-foreground text-button rounded-button transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Delete Selected"
                type="button"
              >
                <Trash2 className="icon-sm" /> <span className="hidden sm:inline">Delete</span>
              </button>

              <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>

              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 text-button text-foreground-muted hover:text-foreground hover:bg-muted rounded-button transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {!isTabbed && (
        <div className="bg-surface border-b border-border px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-heading-2 text-foreground">Comments</h1>
              <p className="text-body-small text-foreground-muted mt-1">Moderate user discussions and manage community engagement.</p>
            </div>
          </div>
        </div>
      )}

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-7xl'} mx-auto px-6 py-8 pb-32`}>
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-surface p-2 rounded-card border border-border shadow-card">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 no-scrollbar">
            {(['all', 'pending', 'approved', 'hidden', 'spam'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-button rounded-button transition-colors transition-shadow transition-transform capitalize whitespace-nowrap ${
                  statusFilter === status ? 'bg-foreground text-background shadow-button' : 'text-foreground-muted hover:bg-muted'
                }`}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search author or content..."
              className="w-full pl-9 pr-4 py-2 bg-background-alt border border-border rounded-input text-body-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors transition-shadow transition-transform"
            />
          </div>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-surface rounded-card border border-error/20 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-error/15 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2">Could not load comments</h3>
            <button onClick={fetchData} className="text-button text-foreground-muted hover:text-foreground underline flex items-center" type="button">
              <RefreshCw className="icon-xs mr-1" /> Retry
            </button>
          </div>
        )}

        {(viewState === 'empty' || (viewState === 'success' && filteredComments.length === 0)) && (
          <div className="bg-surface border border-dashed border-border rounded-card p-12 flex flex-col items-center justify-center text-center">
            <p className="text-body-small text-foreground-muted">No comments found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2 text-accent text-button hover:underline"
              type="button"
            >
              Clear filters
            </button>
          </div>
        )}

        {viewState === 'success' && filteredComments.length > 0 && (
          <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background-alt">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-4 text-left">
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        onChange={handleSelectAll}
                        className="rounded border-border text-accent w-4 h-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-label text-foreground uppercase tracking-wider w-1/4"
                    >
                      Author
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-label text-foreground uppercase tracking-wider w-1/3"
                    >
                      Comment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-label text-foreground uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-label text-foreground uppercase tracking-wider"
                    >
                      Submitted
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-label text-foreground uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredComments.map((comment) => {
                    const isSelected = selectedIds.has(comment.id);
                    return (
                      <tr
                        key={comment.id}
                        className={`transition-colors group ${isSelected ? 'bg-accent/10 hover:bg-accent/15' : 'hover:bg-muted'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(comment.id)}
                            className="rounded border-border text-accent w-4 h-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full bg-background-alt border border-border" />
                            <div>
                              <div className="text-body-small text-foreground">{comment.authorName}</div>
                              <div className="text-caption text-foreground-muted">{comment.authorEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-body-small text-foreground-muted line-clamp-2" title={comment.content}>
                              {comment.content}
                            </p>
                            <a
                              href={`/blog/${comment.postSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-caption text-foreground-muted hover:text-accent hover:underline mt-1 truncate max-w-xs block"
                            >
                              On: {comment.postTitle}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusPill status={comment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-body-small text-foreground-muted">{comment.submittedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {comment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(comment.id, 'approved')}
                                  className="p-1.5 text-success hover:bg-success/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                  title="Approve"
                                  type="button"
                                >
                                  <CheckCircle className="icon-sm" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(comment.id, 'spam')}
                                  className="p-1.5 text-error hover:bg-error/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                  title="Mark as Spam"
                                  type="button"
                                >
                                  <ShieldAlert className="icon-sm" />
                                </button>
                              </>
                            )}
                            {comment.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(comment.id, 'hidden')}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                                title="Hide"
                                type="button"
                              >
                                <EyeOff className="icon-sm" />
                              </button>
                            )}
                            <div className="w-px h-4 bg-border mx-1"></div>
                            <button
                              onClick={() => handleModerateClick(comment.id)}
                              className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                              title="Moderate / Edit"
                              type="button"
                            >
                              <Edit2 className="icon-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(comment.id)}
                              className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                              title="Delete"
                              type="button"
                            >
                              <Trash2 className="icon-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

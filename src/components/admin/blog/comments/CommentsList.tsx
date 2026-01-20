'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import ConfirmDialog from '@/components/admin/blog/shared/ConfirmDialog';
import ModerateCommentModal from '@/components/admin/blog/comments/modals/ModerateCommentModal';
import BulkModerateModal from '@/components/admin/blog/comments/modals/BulkModerateModal';
import { useBlogPrototypeStore, type CommentItem, type CommentStatus } from '@/components/admin/blog/shared/blogPrototypeStore';

type Notification = { message: string; type: 'success' | 'error' };

function StatusPill({ status }: { status: CommentStatus }) {
  const map: Record<CommentStatus, string> = {
    pending: 'bg-warning text-warning-foreground',
    approved: 'bg-success text-success-foreground',
    hidden: 'bg-surface text-muted-foreground',
    spam: 'bg-destructive text-destructive-foreground',
  };

  const label: Record<CommentStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    hidden: 'Hidden',
    spam: 'Spam',
  };

  return <span className={`px-3 py-1 rounded-full text-body-small ${map[status]}`}>{label[status]}</span>;
}

export default function CommentsList() {
  const router = useRouter();
  const store = useBlogPrototypeStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | CommentStatus>('all');
  const [notification, setNotification] = React.useState<Notification | null>(null);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const [isModerateOpen, setIsModerateOpen] = React.useState(false);
  const [selectedComment, setSelectedComment] = React.useState<CommentItem | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<{ ids: string[] } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false);

  const [bulkModerateAction, setBulkModerateAction] = React.useState<CommentStatus | null>(null);
  const [isBulkModerateOpen, setIsBulkModerateOpen] = React.useState(false);
  const [isBulkModerating, setIsBulkModerating] = React.useState(false);

  React.useEffect(() => {
    const timer = notification ? window.setTimeout(() => setNotification(null), 3000) : undefined;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [notification]);

  const filtered = React.useMemo(() => {
    return store.comments.filter((comment) => {
      const matchesSearch =
        comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, store.comments]);

  React.useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
    const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

    headerCheckboxRef.current.indeterminate = someSelected;
    headerCheckboxRef.current.checked = allSelected;
  }, [filtered, selectedIds]);

  const selectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((c) => c.id)));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleUpdateStatus = (id: string, newStatus: CommentStatus) => {
    store.updateCommentStatus(id, newStatus);
    const msg =
      newStatus === 'approved'
        ? 'Comment approved.'
        : newStatus === 'hidden'
          ? 'Comment hidden.'
          : newStatus === 'spam'
            ? 'Comment marked as spam.'
            : 'Comment marked as pending.';
    setNotification({ message: msg, type: 'success' });
  };

  const openModerate = (id: string) => {
    const comment = store.comments.find((c) => c.id === id);
    if (!comment) return;
    setSelectedComment(comment);
    setIsModerateOpen(true);
  };

  const initiateBulkStatusChange = (action: CommentStatus) => {
    if (selectedIds.size === 0) return;
    setBulkModerateAction(action);
    setIsBulkModerateOpen(true);
  };

  const confirmBulkModerate = async () => {
    if (!bulkModerateAction) return;
    setIsBulkModerating(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      selectedIds.forEach((id) => store.updateCommentStatus(id, bulkModerateAction));
      setNotification({ message: 'Bulk moderation applied.', type: 'success' });
      clearSelection();
    } finally {
      setIsBulkModerating(false);
      setIsBulkModerateOpen(false);
      setBulkModerateAction(null);
    }
  };

  const confirmSingleDelete = async () => {
    if (!confirmDelete) return;
    await new Promise((r) => setTimeout(r, 250));
    confirmDelete.ids.forEach((id) => store.deleteComment(id));
    setNotification({ message: 'Comment deleted permanently.', type: 'success' });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      confirmDelete.ids.forEach((id) => next.delete(id));
      return next;
    });
    setConfirmDelete(null);
  };

  const confirmBulkDeleteNow = async () => {
    await new Promise((r) => setTimeout(r, 250));
    selectedIds.forEach((id) => store.deleteComment(id));
    setNotification({ message: `${selectedIds.size} comment(s) deleted permanently.`, type: 'success' });
    clearSelection();
    setConfirmBulkDelete(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ModerateCommentModal
        isOpen={isModerateOpen}
        comment={selectedComment}
        onClose={() => setIsModerateOpen(false)}
        onAction={(action) => {
          if (!selectedComment) return;
          handleUpdateStatus(selectedComment.id, action);
        }}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete comment?"
        message="Are you sure you want to delete this comment? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => void confirmSingleDelete()}
      />

      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="Delete selected comments?"
        message={`Are you sure you want to delete ${selectedIds.size} selected comment(s)? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => void confirmBulkDeleteNow()}
      />

      <BulkModerateModal
        isOpen={isBulkModerateOpen}
        action={bulkModerateAction}
        count={selectedIds.size}
        isLoading={isBulkModerating}
        onClose={() => {
          setIsBulkModerateOpen(false);
          setBulkModerateAction(null);
        }}
        onConfirm={() => void confirmBulkModerate()}
      />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-1 text-foreground mb-2">Comments</h1>
          <p className="text-heading-4 text-muted-foreground">Prototype-mirror moderation UI (stored locally for now).</p>
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
              <Button variant="secondary" className="px-3 py-2" onClick={() => initiateBulkStatusChange('approved')}>
                Approve
              </Button>
              <Button variant="secondary" className="px-3 py-2" onClick={() => initiateBulkStatusChange('hidden')}>
                Hide
              </Button>
              <Button variant="secondary" className="px-3 py-2" onClick={() => initiateBulkStatusChange('spam')}>
                Spam
              </Button>
              <Button variant="secondary" className="px-3 py-2" onClick={() => setConfirmBulkDelete(true)}>
                Delete
              </Button>
              <Button variant="secondary" className="px-3 py-2" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-surface rounded-2xl shadow-neu-outset p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <NeumorphicInput
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author or content…"
            />
          </div>
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Status</label>
            <select
              className="form-input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-neu-outset overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <label className="flex items-center gap-3 text-body-small text-muted-foreground">
            <input ref={headerCheckboxRef} type="checkbox" onChange={(e) => selectAll(e.target.checked)} />
            Select
          </label>
          <div className="text-body-small text-muted-foreground">{filtered.length} comment(s)</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No comments match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface shadow-neu-inset">
                <tr>
                  <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Select</th>
                  <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Author</th>
                  <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Comment</th>
                  <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Post</th>
                  <th className="px-4 py-3 text-left text-body-small text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-body-small text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comment) => (
                  <tr key={comment.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(comment.id)} onChange={() => toggleRow(comment.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={comment.authorAvatar} alt={comment.authorName} className="w-10 h-10 rounded-full shadow-neu-outset" />
                        <div>
                          <div className="text-body text-foreground">{comment.authorName}</div>
                          <div className="text-body-small text-muted-foreground">{comment.authorEmail}</div>
                          <div className="text-body-small text-muted-foreground">{comment.submittedAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-body text-foreground">{comment.content}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-body text-foreground">{comment.postTitle}</div>
                      <div className="text-body-small text-muted-foreground">/{comment.postSlug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={comment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button variant="secondary" className="px-3 py-2" onClick={() => handleUpdateStatus(comment.id, 'approved')}>
                          Approve
                        </Button>
                        <Button variant="secondary" className="px-3 py-2" onClick={() => handleUpdateStatus(comment.id, 'hidden')}>
                          Hide
                        </Button>
                        <Button variant="secondary" className="px-3 py-2" onClick={() => handleUpdateStatus(comment.id, 'spam')}>
                          Spam
                        </Button>
                        <Button variant="secondary" className="px-3 py-2" onClick={() => openModerate(comment.id)}>
                          Moderate
                        </Button>
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => setConfirmDelete({ ids: [comment.id] })}
                        >
                          Delete
                        </Button>
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
  );
}

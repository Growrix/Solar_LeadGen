'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Edit2, Eye, Trash2, AlertCircle, 
  RefreshCw, FileText, CheckCircle, RotateCcw, 
  Clock, Archive, LayoutGrid, List, MoreVertical
} from 'lucide-react';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import type { AdminBlogStatus, AdminBlogPost } from '@/lib/blog/adminApiClient';
import { listAdminBlogPostsWithMeta, deleteAdminBlogPost } from '@/lib/blog/adminApiClient';

interface PostListProps {
  isTabbed?: boolean;
}

type ViewState = 'loading' | 'success' | 'error' | 'empty';
type StatusFilter = AdminBlogStatus | 'ALL';

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

const StatusPill: React.FC<{ status: AdminBlogStatus }> = ({ status }) => {
  const statusConfig: Record<AdminBlogStatus, { bg: string; text: string; border: string; icon?: React.ReactNode }> = {
    PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    DRAFT: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: <Clock className="w-3 h-3 mr-1" /> },
    ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', icon: <Archive className="w-3 h-3 mr-1" /> },
  };

  const config = statusConfig[status] || statusConfig['DRAFT'];
    
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} capitalize`}>
      {config.icon}
      {status.toLowerCase()}
    </span>
  );
};

export function PostList({ isTabbed = false }: PostListProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [counts, setCounts] = useState<{ all: number; published: number; drafts: number } | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setViewState('loading');
    try {
      const result = await listAdminBlogPostsWithMeta({ 
        status: statusFilter === 'ALL' ? undefined : statusFilter, 
        q: searchQuery.trim() || undefined 
      });
      setPosts(result.posts);
      setCounts(result.counts);
      setViewState(result.posts.length === 0 ? 'empty' : 'success');
    } catch {
      setViewState('error');
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const visibleSelectedCount = posts.filter(i => selectedIds.has(i.id)).length;
      const allSelected = posts.length > 0 && visibleSelectedCount === posts.length;
      const someSelected = visibleSelectedCount > 0 && visibleSelectedCount < posts.length;
      headerCheckboxRef.current.indeterminate = someSelected;
      headerCheckboxRef.current.checked = allSelected;
    }
  }, [selectedIds, posts]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(posts.map(p => p.id)));
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

  const initiateDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteAdminBlogPost(itemToDelete);
      setNotification({ message: 'Post deleted successfully.', type: 'success' });
      void fetchData();
    } catch {
      setNotification({ message: 'Failed to delete post.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const tabItems: Array<{ key: StatusFilter; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'PUBLISHED', label: 'Published' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 relative ${isTabbed ? '' : 'pt-0'}`}>
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete Post"
        isDestructive={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {tabItems.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                {counts && tab.key === 'ALL' && <span className="ml-1.5 text-slate-400">({counts.all})</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={viewMode === 'list' ? 'Board view' : 'List view'}
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-orange-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow"
            />
          </div>

          <button
            onClick={() => fetchData()}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-white rounded-lg border border-red-100 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Could not load posts</h3>
            <button onClick={() => fetchData()} className="text-sm font-medium text-slate-600 hover:text-slate-900 underline flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </button>
          </div>
        )}

        {viewState === 'empty' && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No posts found</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first post to get started.</p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Create Post
            </Link>
          </div>
        )}

        {viewState === 'success' && posts.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12">
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                      Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(post.id)}
                          onChange={() => handleSelectRow(post.id)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 line-clamp-1">{post.title || '(Untitled)'}</span>
                          <span className="text-xs text-slate-500 font-mono">/{post.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusPill status={post.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(post.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/blog/${encodeURIComponent(post.id)}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/${encodeURIComponent(post.id)}/preview`}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => initiateDelete(post.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

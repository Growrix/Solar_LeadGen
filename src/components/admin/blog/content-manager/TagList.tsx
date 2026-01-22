'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Tag as TagIcon, CheckCircle, Search } from 'lucide-react';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import { ManageTaxonomyModal } from '@/components/admin/blog/shared/ManageTaxonomyModal';
import {
  createAdminBlogTag,
  deleteAdminBlogTag,
  listAdminBlogTags,
  updateAdminBlogTag,
} from '@/lib/blog/adminApiClient';

type ViewState = 'loading' | 'success' | 'error' | 'empty';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
  updatedAt?: string;
}

interface TagListProps {
  isTabbed?: boolean;
}

export function TagList({ isTabbed = false }: TagListProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tag | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const fetchData = useCallback(async () => {
    setViewState('loading');
    try {
      const data = await listAdminBlogTags();
      setTags(data);
      setViewState(data.length === 0 ? 'empty' : 'success');
    } catch {
      setViewState('error');
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingItem(null);
    setIsManageModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const tag = tags.find(t => t.id === id);
    if (tag) {
      setEditingItem(tag);
      setIsManageModalOpen(true);
    }
  };

  const handleSave = async (data: { name: string; slug: string }) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateAdminBlogTag(editingItem.id, data);
        setNotification({ message: 'Tag updated successfully.', type: 'success' });
      } else {
        await createAdminBlogTag(data);
        setNotification({ message: 'Tag created successfully.', type: 'success' });
      }
      void fetchData();
      setIsManageModalOpen(false);
      setEditingItem(null);
    } catch {
      setNotification({ message: 'Failed to save tag.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const initiateDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteAdminBlogTag(itemToDelete);
      setNotification({ message: 'Tag deleted successfully.', type: 'success' });
      void fetchData();
    } catch {
      setNotification({ message: 'Failed to delete tag.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

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
        title="Delete Tag?"
        message="Are you sure you want to delete this tag? This action cannot be undone."
        confirmLabel="Delete Tag"
        isDestructive={true}
      />

      <ManageTaxonomyModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSave={handleSave}
        type="Tag"
        initialData={editingItem}
        isLoading={isSaving}
      />

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-6 py-8`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-500 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-shadow"
            />
          </div>

          <button 
            onClick={handleAddNew}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors focus:ring-4 focus:ring-orange-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </button>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-white rounded-lg border border-red-100 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Could not load tags</h3>
            <button onClick={() => fetchData()} className="text-sm font-medium text-slate-600 hover:text-slate-900 underline flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </button>
          </div>
        )}

        {(viewState === 'empty' || (viewState === 'success' && filteredTags.length === 0 && !searchQuery)) && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <TagIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No tags found</h3>
            <p className="text-slate-500 text-sm mb-6">Create tags to help users find your content.</p>
            <button 
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Add Tag
            </button>
          </div>
        )}

        {viewState === 'success' && filteredTags.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
            <p className="text-slate-500">No tags found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')} 
              className="mt-2 text-orange-600 font-medium text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {viewState === 'success' && filteredTags.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Posts
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{tag.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded text-xs">{tag.slug}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {tag._count?.posts ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(tag.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => initiateDelete(tag.id)}
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

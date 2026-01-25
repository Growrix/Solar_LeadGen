'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Folder, CheckCircle, Search, ArrowLeft } from 'lucide-react';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import { ManageTaxonomyModal } from '@/components/admin/blog/shared/ManageTaxonomyModal';
import {
  createAdminBlogCategory,
  deleteAdminBlogCategory,
  listAdminBlogCategories,
  updateAdminBlogCategory,
} from '@/lib/blog/adminApiClient';

type ViewState = 'loading' | 'success' | 'error' | 'empty';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
  updatedAt?: string;
}

interface CategoryListProps {
  isTabbed?: boolean;
}

export function CategoryList({ isTabbed = false }: CategoryListProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const fetchData = useCallback(async () => {
    setViewState('loading');
    try {
      const data = await listAdminBlogCategories();
      setCategories(data);
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

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackToPosts = () => {
    window.location.href = '/admin/blog/content-manager?tab=posts';
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsManageModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditingItem(category);
      setIsManageModalOpen(true);
    }
  };

  const handleSave = async (data: { name: string; slug: string }) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateAdminBlogCategory(editingItem.id, data);
        setNotification({ message: 'Category updated successfully.', type: 'success' });
      } else {
        await createAdminBlogCategory(data);
        setNotification({ message: 'Category created successfully.', type: 'success' });
      }
      void fetchData();
      setIsManageModalOpen(false);
      setEditingItem(null);
    } catch {
      setNotification({ message: 'Failed to save category.', type: 'error' });
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
      await deleteAdminBlogCategory(itemToDelete);
      setNotification({ message: 'Category deleted successfully.', type: 'success' });
      void fetchData();
    } catch {
      setNotification({ message: 'Failed to delete category.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className={`min-h-screen bg-background font-sans text-foreground relative ${isTabbed ? '' : 'pt-0'}`}>
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-surface text-foreground px-4 py-3 rounded-card shadow-card flex items-center gap-3 border border-border">
             <CheckCircle className="icon-sm text-success" />
             <span className="text-body-small">{notification.message}</span>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete Category"
        isDestructive={true}
      />

      <ManageTaxonomyModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSave={handleSave}
        type="Category"
        initialData={editingItem}
        isLoading={isSaving}
      />

      {!isTabbed && (
        <div className="bg-surface border-b border-border px-6 py-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToPosts}
                className="p-2 -ml-2 hover:bg-muted rounded-full text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Back to Posts"
                type="button"
              >
                <ArrowLeft className="icon-sm" />
              </button>
              <div>
                <h1 className="text-heading-2 text-foreground">Categories</h1>
                <p className="text-body-small text-foreground-muted mt-1">Organize your posts with categories.</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-background text-button rounded-button shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              type="button"
            >
              <Plus className="icon-sm mr-2" />
              Add Category
            </button>
          </div>
        </div>
      )}

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-6 py-8`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="icon-sm text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-input leading-5 bg-background-alt placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-body-small transition-shadow"
            />
          </div>

          {isTabbed && (
            <button
              onClick={handleAddNew}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-background text-button rounded-button shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              type="button"
            >
              <Plus className="icon-sm mr-2" />
              Add Category
            </button>
          )}
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-surface rounded-card border border-error/20 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-error/15 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2">Could not load categories</h3>
            <button onClick={() => fetchData()} className="text-button text-foreground-muted hover:text-foreground underline flex items-center">
              <RefreshCw className="icon-xs mr-1" /> Retry
            </button>
          </div>
        )}

        {(viewState === 'empty' || (viewState === 'success' && filteredCategories.length === 0 && !searchQuery)) && (
          <div className="bg-surface rounded-card border border-border p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-background-alt p-4 rounded-full mb-4 border border-border">
              <Folder className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-heading-4 text-foreground mb-1">No categories found</h3>
            <p className="text-body-small text-foreground-muted mb-6">Create categories to structure your content.</p>
            <button 
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-surface border border-border text-button text-foreground rounded-button hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Add Category
            </button>
          </div>
        )}

        {viewState === 'success' && filteredCategories.length === 0 && searchQuery && (
          <div className="bg-surface rounded-card border border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
            <p className="text-body-small text-foreground-muted">No categories found matching &quot;{searchQuery}&quot;</p>
            <button 
              onClick={() => setSearchQuery('')} 
              className="mt-2 text-accent text-button hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {viewState === 'success' && filteredCategories.length > 0 && (
          <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background-alt">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider w-48">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider w-24">
                      Posts
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-label text-foreground uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-muted transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-body-small text-foreground">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-caption font-mono bg-muted text-foreground-muted px-2 py-1 rounded border border-border">{category.slug}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-muted text-foreground border border-border">
                          {category._count?.posts ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(category.id)}
                            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            title="Edit"
                          >
                            <Edit2 className="icon-sm" />
                          </button>
                          <button 
                            onClick={() => initiateDelete(category.id)}
                            className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            title="Delete"
                          >
                            <Trash2 className="icon-sm" />
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

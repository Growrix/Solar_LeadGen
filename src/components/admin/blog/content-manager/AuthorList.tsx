'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  Eye,
  Edit2,
} from 'lucide-react';
import { SkeletonAdminTable } from '@/components/admin/blog/shared/SkeletonAdminTable';
import { ConfirmationModal } from '@/components/admin/blog/shared/ConfirmationModal';
import { ManageAuthorModal } from '@/components/admin/blog/shared/ManageAuthorModal';
import { AuthorPreviewModal } from '@/components/admin/blog/shared/AuthorPreviewModal';
import type { AuthorProfile } from '@/components/admin/blog/shared/authorTypes';
import {
  createAdminBlogAuthor,
  deleteAdminBlogAuthor,
  listAdminBlogAuthors,
  updateAdminBlogAuthor,
  type AdminBlogAuthor,
  type AdminBlogAuthorStatus,
} from '@/lib/blog/adminApiClient';

type ViewState = 'loading' | 'success' | 'error' | 'empty';

function formatJoinedAt(value: string): string {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  try {
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return dt.toISOString();
  }
}

function mapAuthorStatus(status: AdminBlogAuthorStatus): 'active' | 'inactive' {
  return status === 'INACTIVE' ? 'inactive' : 'active';
}

function getAuthorRole(author: AdminBlogAuthor): string {
  const social = author.socialLinks as any;
  const roleFromSocial = social && typeof social === 'object' ? social.role : null;
  if (typeof roleFromSocial === 'string' && roleFromSocial.trim()) return roleFromSocial.trim();
  if (author.user?.role === 'ADMIN') return 'admin';
  return 'contributor';
}

function getDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

function mapAdminAuthorToProfile(author: AdminBlogAuthor): AuthorProfile {
  return {
    id: author.id,
    name: author.name,
    email: author.email,
    role: getAuthorRole(author),
    status: mapAuthorStatus(author.status),
    avatar: author.avatarUrl || getDefaultAvatar(author.name),
    joinedAt: formatJoinedAt(author.createdAt),
    bio: author.bio || '',
  };
}

export function AuthorList({ isTabbed = false }: { isTabbed?: boolean }) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorProfile | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAuthor, setPreviewAuthor] = useState<AuthorProfile | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setViewState('loading');
    try {
      const { authors: found } = await listAdminBlogAuthors({ status: 'ALL' });
      const mapped = found.map(mapAdminAuthorToProfile);
      setAuthors(mapped);
      setViewState(mapped.length === 0 ? 'empty' : 'success');
    } catch {
      setViewState('error');
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredAuthors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return authors.filter(
      (author) =>
        author.name.toLowerCase().includes(q) ||
        author.email.toLowerCase().includes(q) ||
        String(author.role).toLowerCase().includes(q)
    );
  }, [authors, searchQuery]);

  const handleAddNew = () => {
    setEditingAuthor(null);
    setIsManageModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const author = authors.find((a) => a.id === id);
    if (author) {
      setEditingAuthor(author);
      setIsManageModalOpen(true);
    }
  };

  const handlePreview = (author: AuthorProfile) => {
    setPreviewAuthor(author);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAuthorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!authorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdminBlogAuthor(authorToDelete);
      setAuthors((prev) => prev.filter((a) => a.id !== authorToDelete));
      setNotification({ message: 'Author removed successfully.', type: 'success' });
      setIsDeleteModalOpen(false);
      setAuthorToDelete(null);
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to remove author.';
      setNotification({ message, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAuthor = async (data: Omit<AuthorProfile, 'id' | 'joinedAt'>) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        bio: data.bio ?? '',
        avatarUrl: data.avatar,
        status: (data.status === 'inactive' ? 'INACTIVE' : 'ACTIVE') as AdminBlogAuthorStatus,
        socialLinks: { role: data.role },
      };

      if (editingAuthor) {
        const updated = await updateAdminBlogAuthor(editingAuthor.id, payload);
        const mapped = mapAdminAuthorToProfile(updated);
        setAuthors((prev) => prev.map((a) => (a.id === editingAuthor.id ? mapped : a)));
        setNotification({ message: 'Author updated successfully.', type: 'success' });
      } else {
        const created = await createAdminBlogAuthor(payload);
        const mapped = mapAdminAuthorToProfile(created);
        setAuthors((prev) => [mapped, ...prev]);
        setNotification({ message: 'New author added successfully.', type: 'success' });
      }

      setIsManageModalOpen(false);
      setEditingAuthor(null);
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to save author.';
      setNotification({ message, type: 'error' });
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      admin: 'bg-accent/15 text-accent border-accent/20',
      editor: 'bg-info/15 text-info border-info/20',
      contributor: 'bg-success/15 text-success border-success/20',
      guest: 'bg-muted text-foreground-muted border-border',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-caption border capitalize ${
          styles[role] || styles.guest
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-background font-sans text-foreground ${isTabbed ? '' : 'pt-0'}`}>
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-surface text-foreground px-4 py-3 rounded-card shadow-card flex items-center gap-3 border border-border">
            <CheckCircle className="icon-sm text-success" />
            <span className="text-body-small">{notification.message}</span>
          </div>
        </div>
      )}

      <ManageAuthorModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSave={handleSaveAuthor}
        initialData={editingAuthor}
      />

      <AuthorPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} author={previewAuthor} />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Author?"
        message="Are you sure you want to remove this author? This action cannot be undone."
        confirmLabel="Remove"
        isDestructive={true}
      />

      {!isTabbed && (
        <div className="bg-surface border-b border-border px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-heading-2 text-foreground">Authors & Team</h1>
              <p className="text-body-small text-foreground-muted mt-1">Manage contributors, editors, and administrators.</p>
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-background text-button rounded-button shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Plus className="icon-sm mr-2" />
              Add Author
            </button>
          </div>
        </div>
      )}

      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-6 py-8 pb-32`}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-9 pr-4 py-2 bg-background-alt border border-border rounded-input text-body-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {isTabbed && (
              <button
                onClick={handleAddNew}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-background text-button rounded-button shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Plus className="icon-sm mr-2" />
                Add Author
              </button>
            )}
          </div>
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'error' && (
          <div className="bg-surface rounded-card border border-error/20 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-error/15 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-heading-4 text-foreground mb-2">Could not load authors</h3>
            <button
              onClick={fetchData}
              className="text-button text-foreground-muted hover:text-foreground underline flex items-center"
            >
              <RefreshCw className="icon-xs mr-1" /> Retry
            </button>
          </div>
        )}

        {(viewState === 'empty' || (viewState === 'success' && filteredAuthors.length === 0 && !searchQuery)) && (
          <div className="bg-surface border border-dashed border-border rounded-card p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-background-alt p-4 rounded-full mb-4 border border-border">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-heading-4 text-foreground mb-1">No authors found</h3>
            <p className="text-body-small text-foreground-muted mb-6">Get started by adding your team members.</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-surface border border-border text-button text-foreground rounded-button hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Add Author
            </button>
          </div>
        )}

        {viewState === 'success' && filteredAuthors.length === 0 && searchQuery && (
          <div className="bg-surface border border-dashed border-border rounded-card p-12 flex flex-col items-center justify-center text-center">
            <p className="text-body-small text-foreground-muted">No authors found matching &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery('')} className="mt-2 text-accent text-button hover:underline">
              Clear search
            </button>
          </div>
        )}

        {viewState === 'success' && filteredAuthors.length > 0 && (
          <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background-alt">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-label text-foreground uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-label text-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredAuthors.map((author) => (
                    <tr key={author.id} className="hover:bg-muted transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full bg-background-alt border border-border object-cover" />
                          <div>
                            <div className="text-body-small text-foreground">{author.name}</div>
                            <div className="text-caption text-foreground-muted">Joined {author.joinedAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={String(author.role)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-body-small text-foreground-muted gap-2">
                          <Mail className="icon-xs text-muted-foreground" />
                          {author.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption border ${
                            author.status === 'active'
                              ? 'bg-success/15 text-success border-success/20'
                              : 'bg-muted text-foreground-muted border-border'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              author.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                            }`}
                          />
                          {author.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePreview(author)}
                            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            title="Preview Profile"
                          >
                            <Eye className="icon-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(author.id)}
                            className="p-1.5 text-muted-foreground hover:text-accent hover:bg-muted rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            title="Edit"
                          >
                            <Edit2 className="icon-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(author.id)}
                            className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            title="Remove"
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

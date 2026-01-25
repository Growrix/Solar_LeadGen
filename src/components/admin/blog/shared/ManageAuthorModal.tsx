'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Save, Loader2, User, Shield, Image as ImageIcon } from 'lucide-react';
import type { AuthorProfile } from '@/components/admin/blog/shared/authorTypes';
import { MediaPickerModal } from '@/components/admin/blog/shared/MediaPickerModal';

type ManageAuthorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AuthorProfile, 'id' | 'joinedAt'>) => void;
  initialData?: AuthorProfile | null;
  isLoading?: boolean;
};

export function ManageAuthorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: ManageAuthorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'contributor',
    status: 'active',
    avatar: '',
    bio: '',
  });

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status,
        avatar: initialData.avatar,
        bio: initialData.bio || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'contributor',
        status: 'active',
        avatar: '',
        bio: '',
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const finalAvatar =
      formData.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;

    onSave({
      ...(formData as any),
      avatar: finalAvatar,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={!isLoading ? onClose : undefined}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-solar-600" />
              {initialData ? 'Edit Author' : 'Add New Author'}
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="contributor">Contributor</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
              <div className="flex gap-3">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Select from Media Library"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                  {formData.avatar ? (
                    <Image src={formData.avatar} alt="Preview" fill sizes="40px" className="object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-300" />
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Leave blank to auto-generate initials.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short bio for author profile..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none resize-none"
              />
            </div>
          </form>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Author
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

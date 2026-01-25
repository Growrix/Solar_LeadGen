'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Tag, Folder, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ManageTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; slug: string }) => void;
  type: 'Category' | 'Tag';
  initialData?: { id: string; name: string; slug: string } | null;
  isLoading?: boolean;
}

export function ManageTaxonomyModal({
  isOpen,
  onClose,
  onSave,
  type,
  initialData,
  isLoading = false,
}: ManageTaxonomyModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setIsSlugTouched(true);
      } else {
        setName('');
        setSlug('');
        setIsSlugTouched(false);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugTouched) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }
    onSave({ name, slug });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            {type === 'Category' ? (
              <Folder className="icon-sm text-accent" />
            ) : (
              <Tag className="icon-sm text-accent" />
            )}
            {initialData ? `Edit ${type}` : `Add ${type}`}
          </h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="icon-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/15 text-error text-body-small rounded-input border border-error/20">
              <AlertCircle className="icon-sm" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-label text-foreground mb-1">
              Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder={`e.g. ${type === 'Category' ? 'Industry News' : 'Solar'}`}
              className="w-full px-3 py-2 border border-border rounded-input bg-background-alt text-body-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors transition-shadow transition-transform"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-label text-foreground mb-1">
              Slug <span className="text-error">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-muted-foreground" />
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="url-friendly-slug"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-input bg-background-alt text-body-small text-foreground font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors transition-shadow transition-transform"
              />
            </div>
            <p className="mt-1 text-caption text-foreground-muted">
              Unique identifier used in the URL.
            </p>
          </div>
        </form>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors shadow-button disabled:opacity-70 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {isLoading ? (
              <>
                <Loader2 className="icon-sm animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="icon-sm" /> Save {type}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

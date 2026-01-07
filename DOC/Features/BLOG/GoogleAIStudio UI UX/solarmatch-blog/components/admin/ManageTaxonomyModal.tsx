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

const ManageTaxonomyModal: React.FC<ManageTaxonomyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  initialData,
  isLoading = false,
}) => {
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {type === 'Category' ? (
              <Folder className="w-5 h-5 text-solar-600" />
            ) : (
              <Tag className="w-5 h-5 text-solar-600" />
            )}
            {initialData ? `Edit ${type}` : `Add ${type}`}
          </h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder={`e.g. ${type === 'Category' ? 'Industry News' : 'Solar'}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="url-friendly-slug"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all bg-slate-50 font-mono text-sm text-slate-600"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Unique identifier used in the URL.
            </p>
          </div>
        </form>

        {/* Footer */}
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
                <Save className="w-4 h-4" /> Save {type}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTaxonomyModal;
'use client';

import React from 'react';
import Button from '@/components/Button';
import type { MediaFolder, MediaItem, MediaType } from '@/components/admin/blog/shared/blogPrototypeStore';

function inferType(file: File): MediaType {
  if (file.type.startsWith('image')) return 'image';
  if (file.type.startsWith('video')) return 'video';
  return 'document';
}

export default function UploadMediaModal(props: {
  isOpen: boolean;
  folders: MediaFolder[];
  defaultFolderId: string | null;
  onClose: () => void;
  onUpload: (items: Array<Omit<MediaItem, 'id' | 'uploadedAt'>>) => void;
}) {
  const { isOpen, folders, defaultFolderId, onClose, onUpload } = props;
  const [files, setFiles] = React.useState<File[]>([]);
  const [folderId, setFolderId] = React.useState<string | null>(defaultFolderId);
  const [tags, setTags] = React.useState('');
  const [altText, setAltText] = React.useState('');
  const [caption, setCaption] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setFiles([]);
    setFolderId(defaultFolderId);
    setTags('');
    setAltText('');
    setCaption('');
  }, [isOpen, defaultFolderId]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (files.length === 0) return;
    const items = files.map((file) => {
      const type = inferType(file);
      const sizeMb = (file.size / 1024 / 1024).toFixed(1);
      const url = URL.createObjectURL(file);

      return {
        name: file.name,
        url,
        type,
        size: `${sizeMb} MB`,
        folderId,
        altText: altText.trim() || undefined,
        caption: caption.trim() || undefined,
        tags: tagList.length ? tagList : undefined,
      } satisfies Omit<MediaItem, 'id' | 'uploadedAt'>;
    });

    onUpload(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="theme-card w-full max-w-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading-3 text-foreground">Upload Media</h2>
            <p className="text-body-small text-muted-foreground">UI-only upload; stored locally for prototype parity.</p>
          </div>
          <Button variant="secondary" className="px-3 py-2" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
            <label className="block text-body-small text-muted-foreground mb-2">Files</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="form-input w-full"
            />
            {files.length ? (
              <div className="mt-3 text-body-small text-muted-foreground">Selected: {files.length} file(s)</div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Folder</label>
              <select
                className="form-input w-full"
                value={folderId ?? ''}
                onChange={(e) => setFolderId(e.target.value ? e.target.value : null)}
              >
                <option value="">(Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Tags (comma-separated)</label>
              <input className="form-input w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Alt text</label>
              <input className="form-input w-full" value={altText} onChange={(e) => setAltText(e.target.value)} />
            </div>
            <div className="bg-surface rounded-2xl shadow-neu-inset p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Caption</label>
              <input className="form-input w-full" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={files.length === 0} onClick={handleSubmit}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}

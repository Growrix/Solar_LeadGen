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

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small';
  const selectClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small appearance-none cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-surface shadow-neu-outset p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading-2 text-foreground mb-1">Upload Media</h2>
            <p className="text-body-small text-muted-foreground">Upload files to your media library.</p>
          </div>
          <Button variant="secondary" onClick={onClose} className="px-4 py-2">
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-2xl bg-background shadow-neu-inset p-5">
            <label className="block text-body-small text-muted-foreground mb-3">Files</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className={inputClass}
            />
            {files.length > 0 && (
              <div className="mt-3 text-body-small text-primary font-medium">
                Selected: {files.length} file(s)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Folder</label>
              <select
                className={selectClass}
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

            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Tags (comma-separated)</label>
              <input
                className={inputClass}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Alt text</label>
              <input
                className={inputClass}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image..."
              />
            </div>
            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Caption</label>
              <input
                className={inputClass}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption..."
              />
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

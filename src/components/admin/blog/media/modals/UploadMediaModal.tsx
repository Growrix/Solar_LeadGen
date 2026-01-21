'use client';

import React from 'react';
import { AdminButton, AdminSelect, AdminInput, AdminModal, AdminFileUploader } from '@/components/admin/ui';
import type { MediaFolder, MediaItem, MediaType } from '@/components/admin/blog/shared/blogPrototypeStore';

function inferType(file: File): MediaType {
  if (file.type.startsWith('image')) return 'image';
  if (file.type.startsWith('video')) return 'video';
  return 'document';
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (files.length === 0) return;
    const items = files.map((file) => {
      const type = inferType(file);
      const url = URL.createObjectURL(file);

      return {
        name: file.name,
        url,
        type,
        size: formatSize(file.size),
        folderId,
        altText: altText.trim() || undefined,
        caption: caption.trim() || undefined,
        tags: tagList.length ? tagList : undefined,
      } satisfies Omit<MediaItem, 'id' | 'uploadedAt'>;
    });

    onUpload(items);
    onClose();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const folderOptions = [
    { value: '', label: 'Root (No folder)' },
    ...folders.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Media"
      description="Upload files to your media library"
      size="lg"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" disabled={files.length === 0} onClick={handleSubmit}>
            Upload {files.length > 0 && `(${files.length})`}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-5">
        <AdminFileUploader
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          multiple
          maxSize={50 * 1024 * 1024}
          onFilesSelected={(newFiles: File[]) => setFiles((prev) => [...prev, ...newFiles])}
          label="Drop files here"
          hint="or click to browse. Max 50MB per file."
        />

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-[var(--admin-fg-primary)]">
              Selected files ({files.length})
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] border border-[var(--admin-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--admin-fg-primary)] truncate">{file.name}</div>
                    <div className="text-xs text-[var(--admin-fg-muted)]">{formatSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 rounded text-[var(--admin-fg-muted)] hover:text-[var(--admin-destructive)] hover:bg-[var(--admin-destructive-muted)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect
            label="Destination folder"
            options={folderOptions}
            value={folderId ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFolderId(e.target.value || null)}
          />
          <AdminInput
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Alt text"
            value={altText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
            placeholder="Describe the image..."
          />
          <AdminInput
            label="Caption"
            value={caption}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaption(e.target.value)}
            placeholder="Optional caption..."
          />
        </div>
      </div>
    </AdminModal>
  );
}

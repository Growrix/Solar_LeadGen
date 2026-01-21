'use client';

import React from 'react';
import { AdminButton, AdminInput, AdminBadge, AdminModal } from '@/components/admin/ui';
import type { MediaItem, MediaType } from '@/components/admin/blog/shared/blogPrototypeStore';

function getTypeBadgeVariant(type: MediaType): 'primary' | 'success' | 'secondary' {
  if (type === 'image') return 'primary';
  if (type === 'video') return 'success';
  return 'secondary';
}

function typeLabel(type: MediaType) {
  if (type === 'image') return 'Image';
  if (type === 'video') return 'Video';
  return 'Document';
}

export default function MediaDetailsModal(props: {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onSave: (id: string, updates: { altText?: string; caption?: string; tags?: string[] }) => void;
  onRename: (id: string, name: string) => void;
  onReplace: (id: string, file: File) => void;
}) {
  const { isOpen, item, onClose, onSave, onRename, onReplace } = props;
  const [name, setName] = React.useState('');
  const [altText, setAltText] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [tags, setTags] = React.useState('');

  React.useEffect(() => {
    if (!isOpen || !item) return;
    setName(item.name);
    setAltText(item.altText ?? '');
    setCaption(item.caption ?? '');
    setTags((item.tags ?? []).join(', '));
  }, [isOpen, item]);

  if (!item) return null;

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Media Details"
      description="Edit metadata, rename, or replace this file"
      size="xl"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => {
              onSave(item.id, {
                altText: altText.trim() || undefined,
                caption: caption.trim() || undefined,
                tags: tagList.length ? tagList : undefined,
              });
              onClose();
            }}
          >
            Save Changes
          </AdminButton>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--admin-fg-primary)]">Preview</span>
            <AdminBadge variant={getTypeBadgeVariant(item.type)}>
              {typeLabel(item.type)}
            </AdminBadge>
          </div>

          <div className="overflow-hidden rounded-[var(--admin-radius-lg)] bg-[var(--admin-secondary)] border border-[var(--admin-border)]">
            {item.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.altText ?? item.name} className="w-full h-auto max-h-64 object-contain" />
            ) : item.type === 'video' ? (
              <video src={item.url} controls className="w-full h-auto max-h-64" />
            ) : (
              <div className="p-12 text-center text-[var(--admin-fg-muted)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-medium">Document</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => void navigator.clipboard.writeText(item.url)}
            >
              Copy URL
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
            >
              Open
            </AdminButton>
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onReplace(item.id, file);
                }}
              />
              <span className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-[var(--admin-radius)] bg-[var(--admin-secondary)] text-[var(--admin-secondary-fg)] hover:bg-[var(--admin-secondary-hover)] border border-[var(--admin-border)] transition-colors cursor-pointer">
                Replace
              </span>
            </label>
          </div>

          <div className="rounded-[var(--admin-radius-md)] bg-[var(--admin-bg-base)] border border-[var(--admin-border)] p-4 space-y-2">
            <div className="text-sm text-[var(--admin-fg-muted)]">
              <span className="text-[var(--admin-fg-primary)] font-medium">Name:</span> {item.name}
            </div>
            <div className="text-sm text-[var(--admin-fg-muted)]">
              <span className="text-[var(--admin-fg-primary)] font-medium">Size:</span> {item.size}
            </div>
            <div className="text-sm text-[var(--admin-fg-muted)]">
              <span className="text-[var(--admin-fg-primary)] font-medium">Uploaded:</span> {item.uploadedAt}
            </div>
            {item.dimensions && (
              <div className="text-sm text-[var(--admin-fg-muted)]">
                <span className="text-[var(--admin-fg-primary)] font-medium">Dimensions:</span> {item.dimensions}
              </div>
            )}
          </div>

          {item.references?.length ? (
            <div>
              <div className="text-sm font-medium text-[var(--admin-fg-primary)] mb-2">Referenced by</div>
              <div className="space-y-1.5">
                {item.references.map((r) => (
                  <div key={`${r.type}_${r.id}`} className="rounded-[var(--admin-radius)] bg-[var(--admin-bg-base)] border border-[var(--admin-border)] px-3 py-2">
                    <div className="text-sm text-[var(--admin-fg-primary)]">{r.title}</div>
                    <div className="text-xs text-[var(--admin-fg-muted)]">/{r.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-fg-secondary)] mb-1.5">Filename</label>
            <div className="flex gap-2">
              <AdminInput
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="flex-1"
              />
              <AdminButton
                variant="secondary"
                disabled={!name.trim() || name.trim() === item.name}
                onClick={() => onRename(item.id, name.trim())}
              >
                Rename
              </AdminButton>
            </div>
          </div>

          <AdminInput
            label="Alt Text"
            value={altText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
            placeholder="Describe the image for accessibility..."
          />

          <AdminInput
            label="Caption"
            value={caption}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCaption(e.target.value)}
            placeholder="Optional caption text..."
          />

          <AdminInput
            label="Tags"
            value={tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            hint="Comma-separated"
          />
        </div>
      </div>
    </AdminModal>
  );
}

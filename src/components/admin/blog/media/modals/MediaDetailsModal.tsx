'use client';

import React from 'react';
import Button from '@/components/Button';
import type { MediaItem, MediaType } from '@/components/admin/blog/shared/blogPrototypeStore';

function TypeBadge({ type }: { type: MediaType }) {
  const baseClass = 'inline-flex items-center justify-center px-3 py-1 rounded-full text-label font-medium';
  if (type === 'image') return <span className={`${baseClass} bg-primary/10 text-primary`}>Image</span>;
  if (type === 'video') return <span className={`${baseClass} bg-secondary/10 text-secondary`}>Video</span>;
  return <span className={`${baseClass} bg-surface text-muted-foreground`}>Document</span>;
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

  if (!isOpen || !item) return null;

  const tagList = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-background text-foreground shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-body-small';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-neu-outset p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading-2 text-foreground mb-1">Media Details</h2>
            <p className="text-body-small text-muted-foreground">Edit metadata, rename, or replace this file.</p>
          </div>
          <Button variant="secondary" onClick={onClose} className="px-4 py-2">
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-background shadow-neu-inset p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-body text-foreground font-medium">Preview</div>
              <TypeBadge type={item.type} />
            </div>

            <div className="overflow-hidden rounded-2xl bg-surface shadow-neu-outset">
              {item.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText ?? item.name} className="w-full h-auto" />
              ) : item.type === 'video' ? (
                <video src={item.url} controls className="w-full h-auto" />
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <span className="text-heading-3">Document</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(item.url);
                }}
              >
                Copy URL
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              >
                Open
              </Button>
              <label className="inline-flex cursor-pointer">
                <span className="sr-only">Replace file</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onReplace(item.id, file);
                  }}
                />
                <span className="inline-flex items-center justify-center gap-3 px-8 py-4 text-body-small tracking-wider rounded-full transition-colors duration-200 bg-surface text-foreground shadow-neu-outset hover:shadow-neu-inset active:scale-[0.98] cursor-pointer">
                  Replace
                </span>
              </label>
            </div>

            <div className="mt-5 rounded-xl bg-surface shadow-neu-outset p-4 space-y-2">
              <div className="text-body-small text-muted-foreground">
                <span className="text-foreground font-medium">Name:</span> {item.name}
              </div>
              <div className="text-body-small text-muted-foreground">
                <span className="text-foreground font-medium">Size:</span> {item.size}
              </div>
              <div className="text-body-small text-muted-foreground">
                <span className="text-foreground font-medium">Uploaded:</span> {item.uploadedAt}
              </div>
              {item.dimensions && (
                <div className="text-body-small text-muted-foreground">
                  <span className="text-foreground font-medium">Dimensions:</span> {item.dimensions}
                </div>
              )}
            </div>

            {item.references?.length ? (
              <div className="mt-5">
                <div className="text-body text-foreground font-medium mb-3">Referenced by</div>
                <div className="space-y-2">
                  {item.references.map((r) => (
                    <div key={`${r.type}_${r.id}`} className="rounded-xl bg-surface shadow-neu-outset px-4 py-3">
                      <div className="text-body text-foreground">{r.title}</div>
                      <div className="text-body-small text-muted-foreground">/{r.slug}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Filename</label>
              <div className="flex gap-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={!name.trim() || name.trim() === item.name}
                  onClick={() => onRename(item.id, name.trim())}
                >
                  Rename
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Alt Text</label>
              <input
                className={inputClass}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility..."
              />
            </div>

            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Caption</label>
              <input
                className={inputClass}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption text..."
              />
            </div>

            <div className="rounded-2xl bg-background shadow-neu-inset p-5">
              <label className="block text-body-small text-muted-foreground mb-3">Tags</label>
              <input
                className={inputClass}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <div className="mt-2 text-body-small text-muted-foreground">Comma-separated.</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
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
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

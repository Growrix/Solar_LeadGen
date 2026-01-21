'use client';

import React from 'react';
import type { MediaItem, MediaType } from '@/components/admin/blog/shared/blogPrototypeStore';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const buttonBase =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';
const buttonSecondary = cn(buttonBase, 'border border-border bg-card text-foreground hover:bg-muted');
const buttonPrimary = cn(buttonBase, 'bg-primary text-primary-foreground hover:opacity-90');

function TypeIcon({ type }: { type: MediaType }) {
  if (type === 'image') return <span className="text-body-small">IMG</span>;
  if (type === 'video') return <span className="text-body-small">VID</span>;
  return <span className="text-body-small">DOC</span>;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4 py-8" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-heading-3 text-foreground">Media Details</h2>
            <p className="text-body-small text-muted-foreground">Edit metadata, rename, replace, and copy URL.</p>
          </div>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-body-small text-muted-foreground">Preview</div>
              <div className="text-muted-foreground"><TypeIcon type={item.type} /></div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {item.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText ?? item.name} className="w-full h-auto" />
              ) : item.type === 'video' ? (
                <video src={item.url} controls className="w-full h-auto" />
              ) : (
                <div className="p-10 text-center text-muted-foreground">Document</div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => {
                  void navigator.clipboard.writeText(item.url);
                }}
              >
                Copy URL
              </button>
              <button type="button" className={buttonSecondary} onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}>
                Open
              </button>
              <label className="inline-flex">
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
                <span className="inline-flex items-center">
                  <span className={buttonSecondary}>Replace</span>
                </span>
              </label>
            </div>

            <div className="mt-4 text-body-small text-muted-foreground">
              <div>Name: {item.name}</div>
              <div>Size: {item.size}</div>
              <div>Uploaded: {item.uploadedAt}</div>
              {item.dimensions ? <div>Dimensions: {item.dimensions}</div> : null}
            </div>

            {item.references?.length ? (
              <div className="mt-4">
                <div className="text-body-small text-muted-foreground mb-2">Referenced by</div>
                <div className="space-y-2">
                  {item.references.map((r) => (
                    <div key={`${r.type}_${r.id}`} className="rounded-xl border border-border bg-card px-3 py-2">
                      <div className="text-body text-foreground">{r.title}</div>
                      <div className="text-body-small text-muted-foreground">/{r.slug}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Filename</label>
              <div className="flex gap-3">
                <input className="form-input flex-1" value={name} onChange={(e) => setName(e.target.value)} />
                <button
                  type="button"
                  className={buttonSecondary}
                  disabled={!name.trim() || name.trim() === item.name}
                  onClick={() => onRename(item.id, name.trim())}
                >
                  Rename
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Alt Text</label>
              <input className="form-input w-full" value={altText} onChange={(e) => setAltText(e.target.value)} />
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Caption</label>
              <input className="form-input w-full" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="block text-body-small text-muted-foreground mb-2">Tags</label>
              <input className="form-input w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="mt-2 text-body-small text-muted-foreground">Comma-separated.</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button type="button" className={buttonSecondary} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={buttonPrimary}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

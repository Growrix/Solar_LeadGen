'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Crop,
  Download,
  FileText,
  Film,
  FlipHorizontal,
  FlipVertical,
  HardDrive,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Maximize2,
  Pencil,
  RefreshCw,
  RotateCw,
  Save,
  Tag,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';

import Button from '@/components/ui/button';

import type { MediaItem } from './MediaLibrary';

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onSave: (id: string, data: { altText: string; caption: string; tags: string[] }) => void;
  onDelete: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onRename: (id: string, newName: string) => void;
}

type AspectRatio = 'original' | '1:1' | '16:9' | '4:3';

export function MediaDetailsModal({
  isOpen,
  onClose,
  mediaItem,
  onSave,
  onDelete,
  onReplace,
  onRename,
}: MediaDetailsModalProps) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [transforms, setTransforms] = useState({ rotate: 0, flipH: false, flipV: false, scale: 1 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');

  useEffect(() => {
    if (!mediaItem) return;

    setAltText(mediaItem.altText || '');
    setCaption(mediaItem.caption || '');
    setTags(mediaItem.tags ? mediaItem.tags.join(', ') : '');
    setIsCopied(false);
    setIsSaving(false);
    setIsReplacing(false);

    setRenameValue(mediaItem.name);
    setIsRenaming(false);

    setIsEditing(false);
    setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
    setAspectRatio('original');
    setIsProcessingEdit(false);
  }, [mediaItem, isOpen]);

  if (!isOpen || !mediaItem) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(mediaItem.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      onSave(mediaItem.id, { altText, caption, tags: parsedTags });
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== mediaItem.name) {
      onRename(mediaItem.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    onDelete(mediaItem.id);
    onClose();
  };

  const handleReplaceClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReplacing(true);
    setTimeout(() => {
      onReplace(mediaItem.id, file);
      setIsReplacing(false);
    }, 1000);
  };

  const rotateRight = () => setTransforms(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
  const flipHorizontal = () => setTransforms(prev => ({ ...prev, flipH: !prev.flipH }));
  const flipVertical = () => setTransforms(prev => ({ ...prev, flipV: !prev.flipV }));

  const saveEdits = () => {
    setIsProcessingEdit(true);
    setTimeout(() => {
      setIsProcessingEdit(false);
      setIsEditing(false);
    }, 1000);
  };

  const FileIcon = ({ className = 'w-12 h-12' }: { className?: string }) => {
    switch (mediaItem.type) {
      case 'video':
        return <Film className={`${className} text-warning`} />;
      case 'document':
        return <FileText className={`${className} text-info`} />;
      default:
        return <ImageIcon className={`${className} text-accent`} />;
    }
  };

  const getCropStyle = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square w-3/4';
      case '16:9':
        return 'aspect-video w-full';
      case '4:3':
        return 'aspect-[4/3] w-5/6';
      default:
        return 'w-full h-full border-none shadow-none';
    }
  };

  const hasReferences = !!(mediaItem.references && mediaItem.references.length > 0);
  const isPdf = mediaItem.type === 'document' && mediaItem.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={mediaItem.type === 'image' ? 'image/*' : mediaItem.type === 'video' ? 'video/*' : '*/*'}
      />

      <div
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity"
        onClick={isEditing ? undefined : onClose}
      />

      <div className="relative bg-surface rounded-modal shadow-modal border border-border w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        {!isEditing && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="absolute top-4 right-4 z-10 p-2 bg-surface/80 text-foreground hover:bg-surface rounded-full md:hidden border border-border"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        )}

        <div className="w-full md:w-2/3 bg-background-alt flex flex-col relative transition duration-300">
          {isEditing && (
            <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border z-10">
              <h3 className="text-heading-5 text-foreground flex items-center gap-2">
                <Pencil className="icon-sm text-accent" /> Edit Image
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
                    setAspectRatio('original');
                    setIsProcessingEdit(false);
                  }}
                  disabled={isProcessingEdit}
                  variant="secondary"
                  className="px-3 py-1.5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveEdits}
                  disabled={isProcessingEdit}
                  variant="primary"
                  className="px-3 py-1.5 flex items-center gap-1.5"
                >
                  {isProcessingEdit ? <Loader2 className="icon-xs animate-spin" /> : <Save className="icon-xs" />}
                  Save Copy
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {mediaItem.type === 'image' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaItem.url}
                  alt={mediaItem.name}
                  style={{
                    transform: `rotate(${transforms.rotate}deg) scaleX(${transforms.flipH ? -1 : 1}) scaleY(${transforms.flipV ? -1 : 1})`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className={`max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] object-contain shadow-modal ${
                    isEditing ? 'ring-1 ring-border' : ''
                  }`}
                />

                {isEditing && aspectRatio !== 'original' && (
                  <div
                    className={`absolute border-2 border-background pointer-events-none ring-[9999px] ring-overlay/70 ${getCropStyle()}`}
                  >
                    <div className="absolute top-1/3 w-full h-px bg-background/30" />
                    <div className="absolute top-2/3 w-full h-px bg-background/30" />
                    <div className="absolute left-1/3 h-full w-px bg-background/30" />
                    <div className="absolute left-2/3 h-full w-px bg-background/30" />
                  </div>
                )}
              </div>
            ) : mediaItem.type === 'video' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full w-full h-full">
                <video
                  src={mediaItem.url}
                  controls
                  className="max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] shadow-modal bg-surface rounded-card outline-none border border-border"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-full bg-surface rounded-card shadow-modal overflow-hidden max-w-2xl max-h-[calc(90vh-140px)] border border-border">
                <iframe src={mediaItem.url} className="w-full h-full" title={mediaItem.name} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FileIcon className="w-24 h-24 mb-4" />
                <p className="text-heading-5 text-foreground">{mediaItem.name}</p>
                <p className="text-body-small text-muted-foreground mt-2">Preview not available for this file type</p>
              </div>
            )}

            {!isEditing && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                {mediaItem.type === 'image' && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    className="p-2 bg-surface/90 hover:bg-surface text-foreground rounded-button backdrop-blur-sm flex items-center gap-2 text-button border border-border"
                  >
                    <Pencil className="w-4 h-4" /> Edit Image
                  </Button>
                )}
                <a
                  href={mediaItem.url}
                  download={mediaItem.name}
                  className="p-2 bg-surface/90 hover:bg-surface text-foreground rounded-button backdrop-blur-sm transition-colors flex items-center gap-2 text-button border border-border"
                  title="Download original file"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <a
                  href={mediaItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-surface/90 hover:bg-surface text-foreground rounded-button backdrop-blur-sm transition-colors flex items-center gap-2 text-button border border-border"
                >
                  <Maximize2 className="w-4 h-4" /> View Original
                </a>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="bg-surface border-t border-border p-2 md:p-4 flex flex-wrap justify-center gap-4 md:gap-8 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Button
                  onClick={rotateRight}
                  variant="ghost"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-button"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-px h-8 bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <Button
                  onClick={flipHorizontal}
                  variant={transforms.flipH ? 'primary' : 'ghost'}
                  className={`p-2 rounded-button ${transforms.flipH ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </Button>
                <Button
                  onClick={flipVertical}
                  variant={transforms.flipV ? 'primary' : 'ghost'}
                  className={`p-2 rounded-button ${transforms.flipV ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-px h-8 bg-border hidden sm:block" />

              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-muted-foreground mr-1" />
                {(['original', '1:1', '16:9', '4:3'] as AspectRatio[]).map(ratio => (
                  <Button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    variant={aspectRatio === ratio ? 'secondary' : 'ghost'}
                    className={`px-3 py-1.5 text-button rounded-button ${aspectRatio === ratio ? 'bg-background-alt text-foreground border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {ratio === 'original' ? 'Orig' : ratio}
                  </Button>
                ))}
              </div>

              <div className="w-px h-8 bg-border hidden sm:block" />

              <Button
                onClick={() => {
                  setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
                  setAspectRatio('original');
                }}
                variant="ghost"
                className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-button"
                title="Reset All"
              >
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <div className={`w-full md:w-1/3 bg-surface flex flex-col border-l border-border ${isEditing ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-border flex justify-between items-start">
            <div className="pr-8 flex-1">
              {isRenaming ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="text-heading-4 text-foreground border-b-2 border-accent focus-visible:outline-none bg-transparent w-full py-0.5"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setRenameValue(mediaItem.name);
                      }
                    }}
                  />
                  <Button onClick={handleRenameSubmit} variant="ghost" className="p-1 text-success hover:bg-success/10 rounded-button" title="Save">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsRenaming(false);
                      setRenameValue(mediaItem.name);
                    }}
                    variant="ghost"
                    className="p-1 text-error hover:bg-error/10 rounded-button"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  <h3
                    className="text-heading-4 text-foreground break-words line-clamp-2 cursor-text"
                    title={mediaItem.name}
                    onClick={() => setIsRenaming(true)}
                  >
                    {mediaItem.name}
                  </h3>
                  <Button
                    onClick={() => {
                      setIsRenaming(true);
                      setRenameValue(mediaItem.name);
                    }}
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-button"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-body-small text-muted-foreground capitalize mt-1">{mediaItem.type}</p>
            </div>

            <Button onClick={onClose} variant="ghost" className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full hidden md:block">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-body-small">
              <div className="space-y-1">
                <span className="text-muted-foreground text-caption flex items-center gap-1">
                  <Calendar className="icon-xs" /> Uploaded
                </span>
                <p className="text-foreground">{mediaItem.uploadedAt}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-caption flex items-center gap-1">
                  <HardDrive className="icon-xs" /> Size
                </span>
                <p className="text-foreground">{mediaItem.size}</p>
              </div>
              {mediaItem.dimensions && (
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground text-caption flex items-center gap-1">
                    <ImageIcon className="icon-xs" /> Dimensions
                  </span>
                  <p className="text-foreground">{mediaItem.dimensions}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-label text-muted-foreground uppercase tracking-wider">File URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaItem.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-background-alt border border-border rounded-input text-body-small text-foreground focus-visible:outline-none"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="ghost"
                  className={`p-2 rounded-button border transition ${
                    isCopied ? 'bg-success/10 border-success/20 text-success' : 'bg-surface border-border text-muted-foreground hover:bg-muted'
                  }`}
                  title="Copy URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-label text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Alt Text <span className="text-caption normal-case bg-muted px-1.5 py-0.5 rounded-badge text-muted-foreground border border-border">SEO</span>
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                  className="w-full px-3 py-2 border border-border rounded-input text-body-small bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
                />
                <p className="text-caption text-muted-foreground">Essential for SEO and screen readers.</p>
              </div>

              <div className="space-y-2">
                <label className="text-label text-muted-foreground uppercase tracking-wider">Caption</label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Caption text displayed below the image..."
                  className="w-full px-3 py-2 border border-border rounded-input text-body-small bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-label text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Tag className="icon-xs" /> Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Comma separated tags..."
                  className="w-full px-3 py-2 border border-border rounded-input text-body-small bg-background-alt text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
                />
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <label className="text-label text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="icon-xs" /> Used In
              </label>

              {hasReferences ? (
                <div className="bg-background-alt rounded-card border border-border divide-y divide-border">
                  {mediaItem.references?.map(ref => (
                    <div key={ref.id} className="p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="icon-xs text-muted-foreground flex-shrink-0" />
                        <span className="text-body-small text-foreground truncate" title={ref.title}>
                          {ref.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          window.location.hash = `#/admin/blog/${ref.id}`;
                        }}
                        className="text-button text-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-body-small text-muted-foreground italic bg-background-alt p-3 rounded-card border border-border border-dashed">
                  Not currently referenced in any known posts.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-background-alt border-t border-border flex flex-col gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || isReplacing}
              variant="primary"
              className="w-full py-2.5 flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleReplaceClick}
              disabled={isReplacing || isSaving}
              variant="secondary"
              className="w-full py-2.5 flex items-center justify-center gap-2"
            >
              {isReplacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isReplacing ? 'Replacing...' : 'Replace File'}
            </Button>

            {hasReferences && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning rounded-card text-body-small border border-warning/20">
                <AlertTriangle className="icon-sm flex-shrink-0 mt-0.5" />
                <p>Warning: This file is used in {mediaItem.references?.length} post(s). Deleting it will create broken links.</p>
              </div>
            )}

            <Button
              onClick={handleDelete}
              disabled={isReplacing}
              variant="destructive"
              className="w-full py-2.5 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

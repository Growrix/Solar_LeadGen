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
        return <Film className={`${className} text-red-500`} />;
      case 'document':
        return <FileText className={`${className} text-blue-500`} />;
      default:
        return <ImageIcon className={`${className} text-purple-500`} />;
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

      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={isEditing ? undefined : onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        {!isEditing && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full md:hidden"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        )}

        <div className="w-full md:w-2/3 bg-slate-900 flex flex-col relative transition-all duration-300">
          {isEditing && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 z-10">
              <h3 className="text-white font-medium text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Image
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
                  {isProcessingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Copy
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {mediaItem.type === 'image' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full">
                <img
                  src={mediaItem.url}
                  alt={mediaItem.name}
                  style={{
                    transform: `rotate(${transforms.rotate}deg) scaleX(${transforms.flipH ? -1 : 1}) scaleY(${transforms.flipV ? -1 : 1})`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className={`max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] object-contain shadow-2xl ${
                    isEditing ? 'ring-1 ring-slate-700' : ''
                  }`}
                />

                {isEditing && aspectRatio !== 'original' && (
                  <div
                    className={`absolute border-2 border-white pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] ${getCropStyle()}`}
                  >
                    <div className="absolute top-1/3 w-full h-px bg-white/30" />
                    <div className="absolute top-2/3 w-full h-px bg-white/30" />
                    <div className="absolute left-1/3 h-full w-px bg-white/30" />
                    <div className="absolute left-2/3 h-full w-px bg-white/30" />
                  </div>
                )}
              </div>
            ) : mediaItem.type === 'video' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full w-full h-full">
                <video
                  src={mediaItem.url}
                  controls
                  className="max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] shadow-2xl bg-black rounded-lg outline-none"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl max-h-[calc(90vh-140px)]">
                <iframe src={mediaItem.url} className="w-full h-full" title={mediaItem.name} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <FileIcon className="w-24 h-24 mb-4" />
                <p className="text-lg font-medium">{mediaItem.name}</p>
                <p className="text-sm opacity-60 mt-2">Preview not available for this file type</p>
              </div>
            )}

            {!isEditing && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                {mediaItem.type === 'image' && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm flex items-center gap-2 text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" /> Edit Image
                  </Button>
                )}
                <a
                  href={mediaItem.url}
                  download={mediaItem.name}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Download original file"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <a
                  href={mediaItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 text-sm"
                >
                  <Maximize2 className="w-4 h-4" /> View Original
                </a>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="bg-slate-800 border-t border-slate-700 p-2 md:p-4 flex flex-wrap justify-center gap-4 md:gap-8 overflow-x-auto">
              <div className="flex items-center gap-2">
                <Button
                  onClick={rotateRight}
                  variant="ghost"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-px h-8 bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Button
                  onClick={flipHorizontal}
                  variant={transforms.flipH ? 'primary' : 'ghost'}
                  className={`p-2 rounded-lg ${transforms.flipH ? 'bg-solar-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </Button>
                <Button
                  onClick={flipVertical}
                  variant={transforms.flipV ? 'primary' : 'ghost'}
                  className={`p-2 rounded-lg ${transforms.flipV ? 'bg-solar-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-5 h-5" />
                </Button>
              </div>

              <div className="w-px h-8 bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-slate-500 mr-1" />
                {(['original', '1:1', '16:9', '4:3'] as AspectRatio[]).map(ratio => (
                  <Button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    variant={aspectRatio === ratio ? 'secondary' : 'ghost'}
                    className={`px-2 py-1 text-xs font-medium rounded ${aspectRatio === ratio ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  >
                    {ratio === 'original' ? 'Orig' : ratio}
                  </Button>
                ))}
              </div>

              <div className="w-px h-8 bg-slate-700 hidden sm:block" />

              <Button
                onClick={() => {
                  setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
                  setAspectRatio('original');
                }}
                variant="ghost"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                title="Reset All"
              >
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <div className={`w-full md:w-1/3 bg-white flex flex-col border-l border-slate-200 ${isEditing ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div className="pr-8 flex-1">
              {isRenaming ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="text-lg font-bold text-slate-900 border-b-2 border-solar-500 focus:outline-none bg-transparent w-full py-0.5"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setRenameValue(mediaItem.name);
                      }
                    }}
                  />
                  <Button onClick={handleRenameSubmit} variant="primary" className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsRenaming(false);
                      setRenameValue(mediaItem.name);
                    }}
                    variant="secondary"
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  <h3
                    className="text-lg font-bold text-slate-900 break-words line-clamp-2 cursor-text"
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
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-slate-500 capitalize mt-1">{mediaItem.type}</p>
            </div>

            <Button onClick={onClose} variant="ghost" className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full hidden md:block">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Uploaded
                </span>
                <p className="font-medium text-slate-700">{mediaItem.uploadedAt}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Size
                </span>
                <p className="font-medium text-slate-700">{mediaItem.size}</p>
              </div>
              {mediaItem.dimensions && (
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Dimensions
                  </span>
                  <p className="font-medium text-slate-700">{mediaItem.dimensions}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">File URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaItem.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="ghost"
                  className={`p-2 rounded-lg border transition-all ${isCopied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  title="Copy URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  Alt Text <span className="text-xs normal-case font-normal bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">SEO</span>
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400">Essential for SEO and screen readers.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Caption text displayed below the image..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Comma separated tags..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-3 h-3" /> Used In
              </label>

              {hasReferences ? (
                <div className="bg-slate-50 rounded-lg border border-slate-100 divide-y divide-slate-100">
                  {mediaItem.references?.map(ref => (
                    <div key={ref.id} className="p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate" title={ref.title}>
                          {ref.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          window.location.hash = `#/admin/blog/${ref.id}`;
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic bg-slate-50/50 p-3 rounded-lg border border-slate-100 border-dashed">
                  Not currently referenced in any known posts.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
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
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
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

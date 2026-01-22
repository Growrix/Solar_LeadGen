'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Calendar, 
  HardDrive, 
  Maximize2,
  Download,
  Tag
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size?: string;
  uploadedAt: string;
  altText?: string;
  caption?: string;
  tags?: string[];
}

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onSave: (id: string, data: { altText: string; caption: string; tags: string[] }) => void;
  onDelete: (id: string) => void;
}

export function MediaDetailsModal({ 
  isOpen, 
  onClose, 
  mediaItem, 
  onSave,
  onDelete,
}: MediaDetailsModalProps) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mediaItem) {
      setAltText(mediaItem.altText || '');
      setCaption(mediaItem.caption || '');
      setTags(mediaItem.tags ? mediaItem.tags.join(', ') : '');
      setIsCopied(false);
      setIsSaving(false);
    }
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

  const handleDelete = () => {
    onDelete(mediaItem.id);
    onClose();
  };

  const FileIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
    switch (mediaItem.type) {
      case 'video': return <Film className={`${className} text-red-500`} />;
      case 'document': return <FileText className={`${className} text-blue-500`} />;
      default: return <ImageIcon className={`${className} text-purple-500`} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-2/3 bg-slate-900 flex flex-col relative">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
            {mediaItem.type === 'image' ? (
              <img 
                src={mediaItem.url} 
                alt={mediaItem.name} 
                className="max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] object-contain shadow-2xl"
              />
            ) : mediaItem.type === 'video' ? (
              <video 
                src={mediaItem.url} 
                controls 
                className="max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] shadow-2xl bg-black rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <FileIcon className="w-24 h-24 mb-4" />
                <p className="text-lg font-medium">{mediaItem.name}</p>
                <p className="text-sm opacity-60 mt-2">Preview not available for this file type</p>
              </div>
            )}

            <div className="absolute bottom-6 right-6 flex gap-2">
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
          </div>
        </div>

        <div className="w-full md:w-1/3 bg-white flex flex-col border-l border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div className="pr-8 flex-1">
              <h3 className="text-lg font-bold text-slate-900 break-words line-clamp-2" title={mediaItem.name}>
                {mediaItem.name}
              </h3>
              <p className="text-sm text-slate-500 capitalize mt-1">{mediaItem.type}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full hidden md:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Uploaded</span>
                <p className="font-medium text-slate-700">{mediaItem.uploadedAt}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1"><HardDrive className="w-3 h-3" /> Size</span>
                <p className="font-medium text-slate-700">{mediaItem.size || 'Unknown'}</p>
              </div>
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
                <button 
                  onClick={handleCopyUrl}
                  className={`p-2 rounded-lg border transition-all ${isCopied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  title="Copy URL"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
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
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400">Essential for SEO and screen readers.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caption</label>
                <textarea 
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption text displayed below the image..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Tags
                </label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma separated tags..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={handleDelete}
              className="w-full py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Move to Trash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

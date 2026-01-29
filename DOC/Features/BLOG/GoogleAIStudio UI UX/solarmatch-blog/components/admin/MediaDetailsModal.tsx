
import React, { useState, useEffect, useRef } from 'react';
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
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo2,
  Save,
  Pencil,
  Loader2,
  RefreshCw,
  Tag,
  Link as LinkIcon,
  AlertTriangle,
  Play,
  Download
} from 'lucide-react';
import { MediaItem } from '../../context/BlogContext';

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

const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  mediaItem, 
  onSave,
  onDelete,
  onReplace,
  onRename
}) => {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  
  // Rename State
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [transforms, setTransforms] = useState({
    rotate: 0,
    flipH: false,
    flipV: false,
    scale: 1,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');

  useEffect(() => {
    if (mediaItem) {
      setAltText(mediaItem.altText || '');
      setCaption(mediaItem.caption || '');
      setTags(mediaItem.tags ? mediaItem.tags.join(', ') : '');
      setIsCopied(false);
      setIsSaving(false);
      setIsReplacing(false);
      resetEditState();
      
      // Reset rename state
      setRenameValue(mediaItem.name);
      setIsRenaming(false);
    }
  }, [mediaItem, isOpen]);

  const resetEditState = () => {
    setIsEditing(false);
    setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
    setAspectRatio('original');
    setIsProcessingEdit(false);
  };

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

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsReplacing(true);
      setTimeout(() => {
        onReplace(mediaItem.id, file);
        setIsReplacing(false);
        // We don't close the modal automatically so the user can see the new file
      }, 1000);
    }
  };

  // Editor Handlers
  const rotateRight = () => {
    setTransforms(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }));
  };

  const flipHorizontal = () => {
    setTransforms(prev => ({ ...prev, flipH: !prev.flipH }));
  };

  const flipVertical = () => {
    setTransforms(prev => ({ ...prev, flipV: !prev.flipV }));
  };

  const saveEdits = () => {
    setIsProcessingEdit(true);
    // Simulate image processing
    setTimeout(() => {
      setIsProcessingEdit(false);
      setIsEditing(false);
      // In a real app, this would replace the mediaItem.url or upload a new version
    }, 1000);
  };

  const FileIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
    switch (mediaItem.type) {
      case 'video': return <Film className={`${className} text-red-500`} />;
      case 'document': return <FileText className={`${className} text-blue-500`} />;
      default: return <ImageIcon className={`${className} text-purple-500`} />;
    }
  };

  // Helper for crop overlay styles based on aspect ratio
  const getCropStyle = () => {
    switch(aspectRatio) {
      case '1:1': return 'aspect-square w-3/4';
      case '16:9': return 'aspect-video w-full';
      case '4:3': return 'aspect-[4/3] w-5/6';
      default: return 'w-full h-full border-none shadow-none';
    }
  };

  const hasReferences = mediaItem.references && mediaItem.references.length > 0;
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

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={isEditing ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
        
        {/* Close Button (Mobile) */}
        {!isEditing && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white hover:bg-black/40 rounded-full md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Left Side: Preview & Editor */}
        <div className={`w-full md:w-2/3 bg-slate-900 flex flex-col relative transition-all duration-300`}>
          
          {/* Editor Header (Only visible in edit mode) */}
          {isEditing && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 z-10">
              <h3 className="text-white font-medium text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Image
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={resetEditState}
                  disabled={isProcessingEdit}
                  className="px-3 py-1.5 text-slate-300 hover:text-white text-xs font-medium rounded hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEdits}
                  disabled={isProcessingEdit}
                  className="px-3 py-1.5 bg-solar-600 hover:bg-solar-700 text-white text-xs font-medium rounded shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isProcessingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Copy
                </button>
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {mediaItem.type === 'image' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full">
                <img 
                  src={mediaItem.url} 
                  alt={mediaItem.name} 
                  style={{
                    transform: `rotate(${transforms.rotate}deg) scaleX(${transforms.flipH ? -1 : 1}) scaleY(${transforms.flipV ? -1 : 1})`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className={`max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] object-contain shadow-2xl ${isEditing ? 'ring-1 ring-slate-700' : ''}`}
                />
                
                {/* Crop Overlay Guide (Visual Only) */}
                {isEditing && aspectRatio !== 'original' && (
                  <div className={`absolute border-2 border-white pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] ${getCropStyle()}`}>
                    {/* Grid Lines */}
                    <div className="absolute top-1/3 w-full h-px bg-white/30"></div>
                    <div className="absolute top-2/3 w-full h-px bg-white/30"></div>
                    <div className="absolute left-1/3 h-full w-px bg-white/30"></div>
                    <div className="absolute left-2/3 h-full w-px bg-white/30"></div>
                  </div>
                )}
              </div>
            ) : mediaItem.type === 'video' ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full w-full h-full">
                <video 
                  src={mediaItem.url} 
                  controls 
                  className="max-w-full max-h-[60vh] md:max-h-[calc(90vh-140px)] shadow-2xl bg-black rounded-lg outline-none"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : isPdf ? (
              <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl max-h-[calc(90vh-140px)]">
                 <iframe 
                   src={mediaItem.url} 
                   className="w-full h-full" 
                   title={mediaItem.name}
                 />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <FileIcon className="w-24 h-24 mb-4" />
                <p className="text-lg font-medium">{mediaItem.name}</p>
                <p className="text-sm opacity-60 mt-2">Preview not available for this file type</p>
              </div>
            )}

            {/* View Actions (Non-Edit Mode) */}
            {!isEditing && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                 {mediaItem.type === 'image' && (
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 text-sm font-medium"
                   >
                     <Pencil className="w-4 h-4" /> Edit Image
                   </button>
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

          {/* Editor Toolbar (Bottom) */}
          {isEditing && (
            <div className="bg-slate-800 border-t border-slate-700 p-2 md:p-4 flex flex-wrap justify-center gap-4 md:gap-8 overflow-x-auto">
               
               {/* Rotate Group */}
               <div className="flex items-center gap-2">
                 <button onClick={rotateRight} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Rotate 90°">
                   <RotateCw className="w-5 h-5" />
                 </button>
               </div>

               <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>

               {/* Flip Group */}
               <div className="flex items-center gap-2">
                 <button onClick={flipHorizontal} className={`p-2 rounded-lg transition-colors ${transforms.flipH ? 'bg-solar-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Flip Horizontal">
                   <FlipHorizontal className="w-5 h-5" />
                 </button>
                 <button onClick={flipVertical} className={`p-2 rounded-lg transition-colors ${transforms.flipV ? 'bg-solar-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Flip Vertical">
                   <FlipVertical className="w-5 h-5" />
                 </button>
               </div>

               <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>

               {/* Crop Group */}
               <div className="flex items-center gap-2">
                 <Crop className="w-5 h-5 text-slate-500 mr-1" />
                 {(['original', '1:1', '16:9', '4:3'] as AspectRatio[]).map(ratio => (
                   <button
                     key={ratio}
                     onClick={() => setAspectRatio(ratio)}
                     className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                       aspectRatio === ratio 
                       ? 'bg-slate-100 text-slate-900' 
                       : 'text-slate-400 hover:text-white hover:bg-slate-700'
                     }`}
                   >
                     {ratio === 'original' ? 'Orig' : ratio}
                   </button>
                 ))}
               </div>

               <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>

               {/* Reset */}
               <button onClick={() => {
                 setTransforms({ rotate: 0, flipH: false, flipV: false, scale: 1 });
                 setAspectRatio('original');
               }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" title="Reset All">
                 <Undo2 className="w-5 h-5" />
               </button>
            </div>
          )}
        </div>

        {/* Right Side: Details & Edit */}
        {/* We hide the right side on mobile when editing to give space to the editor */}
        <div className={`w-full md:w-1/3 bg-white flex flex-col border-l border-slate-200 ${isEditing ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div className="pr-8 flex-1">
              {isRenaming ? (
                <div className="flex items-center gap-2 w-full">
                  <input 
                    type="text" 
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="text-lg font-bold text-slate-900 border-b-2 border-solar-500 focus:outline-none bg-transparent w-full py-0.5"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setRenameValue(mediaItem.name);
                      }
                    }}
                  />
                  <button onClick={handleRenameSubmit} className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors" title="Save">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsRenaming(false); setRenameValue(mediaItem.name); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Cancel">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="group flex items-start gap-2">
                  <h3 className="text-lg font-bold text-slate-900 break-words line-clamp-2 cursor-text" title={mediaItem.name} onClick={() => setIsRenaming(true)}>
                    {mediaItem.name}
                  </h3>
                  <button 
                    onClick={() => { setIsRenaming(true); setRenameValue(mediaItem.name); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-opacity"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-500 capitalize mt-1">{mediaItem.type}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full hidden md:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Uploaded</span>
                <p className="font-medium text-slate-700">{mediaItem.uploadedAt}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1"><HardDrive className="w-3 h-3" /> Size</span>
                <p className="font-medium text-slate-700">{mediaItem.size}</p>
              </div>
              {mediaItem.dimensions && (
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Dimensions</span>
                  <p className="font-medium text-slate-700">{mediaItem.dimensions}</p>
                </div>
              )}
            </div>

            {/* URL Field */}
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

            {/* SEO Form */}
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
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
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma separated tags..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Usage / References */}
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
                        <span className="text-sm text-slate-700 truncate" title={ref.title}>{ref.title}</span>
                      </div>
                      <button 
                        onClick={() => window.location.hash = `#/admin/blog/${ref.id}`}
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

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving || isReplacing}
              className="w-full py-2.5 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={handleReplaceClick}
              disabled={isReplacing || isSaving}
              className="w-full py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isReplacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isReplacing ? 'Replacing...' : 'Replace File'}
            </button>
            
            {hasReferences && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Warning: This file is used in {mediaItem.references?.length} post(s). Deleting it will create broken links.</p>
              </div>
            )}

            <button 
              onClick={handleDelete}
              disabled={isReplacing}
              className="w-full py-2.5 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Trash2 className="w-4 h-4" /> Delete File
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MediaDetailsModal;

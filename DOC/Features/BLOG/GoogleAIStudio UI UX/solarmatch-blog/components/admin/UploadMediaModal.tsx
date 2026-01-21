
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  File as FileIcon, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Folder,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

interface FileWithMeta {
  file: File;
  id: string;
  preview: string;
  altText: string;
  caption: string;
  originalSize: string;
  optimizedSize?: string;
  isOptimized: boolean;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({ isOpen, onClose, onUpload }) => {
  const { folders, addMedia } = useBlog();
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      setError(null);
      // Default to root or remember last? Let's default to root.
      setTargetFolderId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles: FileWithMeta[] = Array.from(fileList).map(file => {
      const isImage = file.type.startsWith('image/');
      const sizeVal = file.size / (1024 * 1024);
      const originalSize = sizeVal < 0.1 ? (file.size / 1024).toFixed(0) + ' KB' : sizeVal.toFixed(1) + ' MB';
      
      let optimizedSize: string | undefined;
      let isOptimized = false;

      // Simulate compression for images (Auto-WebP)
      if (isImage) {
        // Simulate ~55% reduction
        const compressedVal = sizeVal * 0.45; 
        optimizedSize = compressedVal < 0.1 ? (compressedVal * 1024).toFixed(0) + ' KB' : compressedVal.toFixed(1) + ' MB';
        isOptimized = true;
      }

      return {
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: isImage ? URL.createObjectURL(file) : '',
        altText: '',
        caption: '',
        originalSize,
        optimizedSize,
        isOptimized
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const updateMeta = (id: string, field: 'altText' | 'caption', value: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleUploadClick = () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Add files to context logic mock
        files.forEach(f => {
           // Rename to .webp if optimized
           const finalName = f.isOptimized 
             ? f.file.name.replace(/\.[^/.]+$/, "") + ".webp" 
             : f.file.name;

           addMedia({
             id: Math.random().toString(),
             name: finalName,
             url: f.preview || 'https://picsum.photos/seed/new/800/600', // Mock fallback
             type: f.file.type.startsWith('image') ? 'image' : f.file.type.startsWith('video') ? 'video' : 'document',
             size: f.optimizedSize || f.originalSize, // Use optimized size if available
             uploadedAt: 'Just now',
             dimensions: '1024x1024',
             altText: f.altText,
             caption: f.caption,
             folderId: targetFolderId
           });
        });

        setTimeout(() => {
          onUpload();
          onClose();
        }, 500);
      }
    }, 50);
  };

  // Helper to render indent options
  const renderFolderOptions = (parentId: string | null = null, depth = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    if (childFolders.length === 0) return null;

    return childFolders.map(folder => (
      <React.Fragment key={folder.id}>
        <option value={folder.id}>
          {'\u00A0\u00A0'.repeat(depth)} 📁 {folder.name}
        </option>
        {renderFolderOptions(folder.id, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isUploading ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-solar-600" />
            Upload Media
          </h3>
          {!isUploading && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dropzone */}
          {!isUploading && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-solar-500 bg-solar-50' 
                  : 'border-slate-300 hover:border-solar-400 hover:bg-slate-50'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
                accept="image/*,video/*,application/pdf"
              />
              <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-solar-100 text-solar-600' : 'bg-slate-100 text-slate-400'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Automatic compression & WebP conversion enabled
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 animate-shake">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Upload Progress View */}
          {isUploading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <div className="w-full max-w-sm bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
                 <div 
                   className="bg-solar-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                   style={{ width: `${uploadProgress}%` }}
                 ></div>
               </div>
               <h4 className="text-lg font-semibold text-slate-900 mb-1">
                 Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
               </h4>
               <p className="text-slate-500 text-sm">
                 {uploadProgress < 100 ? 'Optimizing and compressing images...' : 'Finalizing...'}
               </p>
            </div>
          )}

          {/* File List */}
          {!isUploading && files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Selected Files ({files.length})</h4>
                <button 
                  onClick={() => setFiles([])} 
                  className="text-xs text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-3">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    {/* Preview */}
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
                      {fileItem.preview ? (
                        <img src={fileItem.preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="w-8 h-8 text-slate-400" />
                      )}
                      {fileItem.isOptimized && (
                        <div className="absolute bottom-0 inset-x-0 bg-green-500/90 text-[9px] text-white text-center font-medium py-0.5">
                          WebP
                        </div>
                      )}
                    </div>

                    {/* Meta Fields */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col">
                           <p className="text-sm font-medium text-slate-900 truncate pr-2" title={fileItem.file.name}>
                             {fileItem.file.name}
                           </p>
                           <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                             <span>{fileItem.originalSize}</span>
                             {fileItem.isOptimized && (
                               <>
                                 <ArrowRight className="w-3 h-3 text-slate-300" />
                                 <span className="text-green-600 font-medium flex items-center gap-1">
                                   <Zap className="w-3 h-3 fill-current" />
                                   {fileItem.optimizedSize}
                                 </span>
                               </>
                             )}
                           </div>
                         </div>
                         <button 
                           onClick={() => removeFile(fileItem.id)}
                           className="text-slate-400 hover:text-red-500 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      
                      {/* Meta Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Alt text (SEO)"
                          value={fileItem.altText}
                          onChange={(e) => updateMeta(fileItem.id, 'altText', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-solar-500 outline-none transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Caption (Optional)"
                          value={fileItem.caption}
                          onChange={(e) => updateMeta(fileItem.id, 'caption', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-solar-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Folder Selection */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Destination Folder</label>
                <div className="relative">
                   <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <select 
                    value={targetFolderId || 'root'}
                    onChange={(e) => setTargetFolderId(e.target.value === 'root' ? null : e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 outline-none bg-white appearance-none"
                   >
                     <option value="root">/ All Media (Root)</option>
                     {renderFolderOptions(null)}
                   </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-4 py-2 bg-solar-600 text-white rounded-lg font-medium hover:bg-solar-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" /> Upload
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadMediaModal;

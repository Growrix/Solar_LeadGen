'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  File as FileIcon, 
  Loader2, 
  Trash2, 
  AlertCircle,
  Folder,
  Zap,
  ArrowRight
} from 'lucide-react';

export interface FileWithMeta {
  file: File;
  id: string;
  preview: string;
  altText: string;
  caption: string;
  originalSize: string;
  optimizedSize?: string;
  isOptimized: boolean;
}

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileWithMeta[], targetFolderId: string | null) => void;
  folders: Array<{ id: string; name: string; parentId?: string | null }>;
  defaultFolderId: string | null;
}

export function UploadMediaModal({ isOpen, onClose, onUpload, folders, defaultFolderId }: UploadMediaModalProps) {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      setError(null);
      setTargetFolderId(defaultFolderId);
    }
  }, [isOpen, defaultFolderId]);

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

      if (isImage) {
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
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onUpload(files, targetFolderId);
          onClose();
        }, 500);
      }
    }, 50);
  };

  const renderFolderOptions = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const children = folders.filter(f => (f.parentId ?? null) === parentId);
    if (children.length === 0) return null;

    return children.map(folder => (
      <React.Fragment key={folder.id}>
        <option value={folder.id}>{'\u00A0\u00A0'.repeat(depth)} 📁 {folder.name}</option>
        {renderFolderOptions(folder.id, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm transition-opacity" 
        onClick={!isUploading ? onClose : undefined}
      />
      
      <div className="relative bg-surface rounded-modal shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-alt">
          <h3 className="text-heading-4 text-foreground flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Upload Media
          </h3>
          {!isUploading && (
            <button 
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!isUploading && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition
                ${isDragging 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border hover:border-primary/40 hover:bg-background-alt'}
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
              <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="text-heading-5 text-foreground">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </h4>
              <p className="text-body-small text-muted-foreground mt-1">
                Automatic compression & WebP conversion enabled
              </p>
            </div>
          )}

          {!isUploading && (
            <div className="flex items-center gap-3 bg-background-alt border border-border rounded-card p-4">
              <div className="flex items-center gap-2 text-body-small text-foreground">
                <Folder className="w-4 h-4 text-muted-foreground" /> Upload to
              </div>
              <div className="flex-1">
                <select
                  value={targetFolderId ?? 'root'}
                  onChange={(e) => setTargetFolderId(e.target.value === 'root' ? null : e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-input text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <option value="root">🏠 Root</option>
                  {renderFolderOptions(null)}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-body-small rounded-card border border-destructive/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isUploading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <div className="w-full max-w-sm bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
                 <div 
                   className="bg-primary h-2.5 rounded-full transition-colors duration-300 ease-out" 
                   style={{ width: `${uploadProgress}%` }}
                 ></div>
               </div>
               <h4 className="text-heading-4 text-foreground mb-1">
                 Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
               </h4>
               <p className="text-body text-muted-foreground">
                 {uploadProgress < 100 ? 'Optimizing and compressing images...' : 'Finalizing...'}
               </p>
            </div>
          )}

          {!isUploading && files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-heading-5 text-foreground">Selected Files ({files.length})</h4>
                <button 
                  onClick={() => setFiles([])} 
                  className="text-body-small text-destructive hover:underline"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-3">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex gap-4 p-3 bg-surface border border-border rounded-card shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-card flex-shrink-0 overflow-hidden flex items-center justify-center border border-border relative">
                      {fileItem.preview ? (
                        // next/image does not support blob: URLs reliably; use <img> for local previews.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fileItem.preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                      {fileItem.isOptimized && (
                        <div className="absolute bottom-0 inset-x-0 bg-success/90 text-caption text-background text-center py-0.5">
                          WebP
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col">
                           <p className="text-body text-foreground truncate pr-2" title={fileItem.file.name}>
                             {fileItem.file.name}
                           </p>
                           <div className="flex items-center gap-1.5 text-body-small text-muted-foreground mt-0.5">
                             <span>{fileItem.originalSize}</span>
                             {fileItem.isOptimized && (
                               <>
                                 <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                 <span className="text-success flex items-center gap-1">
                                   <Zap className="w-3 h-3 fill-current" />
                                   {fileItem.optimizedSize}
                                 </span>
                               </>
                             )}
                           </div>
                         </div>
                         <button 
                           onClick={() => removeFile(fileItem.id)}
                           className="text-muted-foreground hover:text-destructive transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Alt text (SEO)"
                          value={fileItem.altText}
                          onChange={(e) => updateMeta(fileItem.id, 'altText', e.target.value)}
                          className="w-full px-2 py-1.5 text-body-small border border-input rounded-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Caption (Optional)"
                          value={fileItem.caption}
                          onChange={(e) => updateMeta(fileItem.id, 'caption', e.target.value)}
                          className="w-full px-2 py-1.5 text-body-small border border-input rounded-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-background-alt border-t border-border flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-surface border border-border rounded-button text-button text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-background rounded-button text-button transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
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
}

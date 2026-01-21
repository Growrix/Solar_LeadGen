'use client';

import React, { useCallback, useState } from 'react';
import { AdminButton } from './AdminButton';

export interface AdminFileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export const AdminFileUploader: React.FC<AdminFileUploaderProps> = ({
  accept = '*',
  multiple = false,
  maxSize,
  onFilesSelected,
  disabled = false,
  label = 'Upload files',
  hint = 'Drag and drop files here, or click to browse',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (maxSize && file.size > maxSize) {
        setError(`File "${file.name}" exceeds maximum size of ${formatBytes(maxSize)}`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setError(null);
    }
    
    return validFiles;
  }, [maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const validFiles = validateFiles(multiple ? files : [files[0]]);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  }, [disabled, multiple, validateFiles, onFilesSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [validateFiles, onFilesSelected]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-[var(--admin-radius-lg)] cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-[var(--admin-primary)] bg-[var(--admin-primary-muted)]' 
            : 'border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-bg-hover)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--admin-secondary)] text-[var(--admin-fg-muted)] mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <p className="text-sm font-medium text-[var(--admin-fg-primary)] mb-1">
          {label}
        </p>
        <p className="text-xs text-[var(--admin-fg-muted)] text-center">
          {hint}
        </p>
        
        {maxSize && (
          <p className="text-xs text-[var(--admin-fg-muted)] mt-2">
            Max file size: {formatBytes(maxSize)}
          </p>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-[var(--admin-destructive)]">{error}</p>
      )}
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * File Upload Hook
 * Custom React hook for handling S3 file uploads with presigned URLs
 * 
 * Features:
 * - File validation (type, size)
 * - Upload progress tracking
 * - Error handling
 * - Multiple concurrent uploads
 */

import { useState, useCallback } from 'react';
import { uploadDocument, getErrorMessage } from '@/lib/api/installer';

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  key: string | null;
}

export interface UseFileUploadReturn {
  uploadState: UploadState;
  upload: (file: File, fileType: 'document' | 'logo') => Promise<string | null>;
  reset: () => void;
}

// File validation constants
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const ALLOWED_LOGO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/**
 * Custom hook for file uploads
 */
export function useFileUpload(): UseFileUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    key: null,
  });

  const validateFile = useCallback((file: File, fileType: 'document' | 'logo'): string | null => {
    // Check file type
    const allowedTypes = fileType === 'document' ? ALLOWED_DOCUMENT_TYPES : ALLOWED_LOGO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
    }

    // Check file size
    const maxSize = fileType === 'document' ? MAX_DOCUMENT_SIZE : MAX_LOGO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  const upload = useCallback(
    async (file: File, fileType: 'document' | 'logo'): Promise<string | null> => {
      // Validate file
      const validationError = validateFile(file, fileType);
      if (validationError) {
        setUploadState({
          uploading: false,
          progress: 0,
          error: validationError,
          key: null,
        });
        return null;
      }

      // Start upload
      setUploadState({
        uploading: true,
        progress: 0,
        error: null,
        key: null,
      });

      try {
        // Upload with progress tracking
        const key = await uploadDocument(
          file,
          fileType,
          (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress,
            }));
          }
        );

        // Success
        setUploadState({
          uploading: false,
          progress: 100,
          error: null,
          key,
        });

        return key;
      } catch (error) {
        // Error
        const errorMessage = getErrorMessage(error);
        setUploadState({
          uploading: false,
          progress: 0,
          error: errorMessage,
          key: null,
        });
        return null;
      }
    },
    [validateFile]
  );

  const reset = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      key: null,
    });
  }, []);

  return {
    uploadState,
    upload,
    reset,
  };
}

/**
 * Hook for managing multiple file uploads
 */
export interface MultiUploadState {
  [key: string]: UploadState;
}

export interface UseMultiFileUploadReturn {
  uploadStates: MultiUploadState;
  upload: (id: string, file: File, fileType: 'document' | 'logo') => Promise<string | null>;
  reset: (id: string) => void;
  resetAll: () => void;
}

export function useMultiFileUpload(): UseMultiFileUploadReturn {
  const [uploadStates, setUploadStates] = useState<MultiUploadState>({});

  const validateFile = useCallback((file: File, fileType: 'document' | 'logo'): string | null => {
    const allowedTypes = fileType === 'document' ? ALLOWED_DOCUMENT_TYPES : ALLOWED_LOGO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
    }

    const maxSize = fileType === 'document' ? MAX_DOCUMENT_SIZE : MAX_LOGO_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  const upload = useCallback(
    async (id: string, file: File, fileType: 'document' | 'logo'): Promise<string | null> => {
      // Validate file
      const validationError = validateFile(file, fileType);
      if (validationError) {
        setUploadStates(prev => ({
          ...prev,
          [id]: {
            uploading: false,
            progress: 0,
            error: validationError,
            key: null,
          },
        }));
        return null;
      }

      // Start upload
      setUploadStates(prev => ({
        ...prev,
        [id]: {
          uploading: true,
          progress: 0,
          error: null,
          key: null,
        },
      }));

      try {
        // Upload with progress tracking
        const key = await uploadDocument(
          file,
          fileType,
          (progress) => {
            setUploadStates(prev => ({
              ...prev,
              [id]: {
                ...prev[id],
                progress,
              },
            }));
          }
        );

        // Success
        setUploadStates(prev => ({
          ...prev,
          [id]: {
            uploading: false,
            progress: 100,
            error: null,
            key,
          },
        }));

        return key;
      } catch (error) {
        // Error
        const errorMessage = getErrorMessage(error);
        setUploadStates(prev => ({
          ...prev,
          [id]: {
            uploading: false,
            progress: 0,
            error: errorMessage,
            key: null,
          },
        }));
        return null;
      }
    },
    [validateFile]
  );

  const reset = useCallback((id: string) => {
    setUploadStates(prev => {
      const newStates = { ...prev };
      delete newStates[id];
      return newStates;
    });
  }, []);

  const resetAll = useCallback(() => {
    setUploadStates({});
  }, []);

  return {
    uploadStates,
    upload,
    reset,
    resetAll,
  };
}

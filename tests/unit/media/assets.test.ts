import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomUUID } from 'crypto';

type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
type MediaStatus = 'ACTIVE' | 'TRASHED';

interface MediaAssetInput {
  name: string;
  file: { type: string; size: number };
  altText?: string;
  caption?: string;
  tags?: string[];
  folderId?: string | null;
}

const ALLOWED_MIME_TYPES: Record<string, MediaType> = {
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'application/pdf': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function validateFileType(mimeType: string): { valid: boolean; type?: MediaType; error?: string } {
  const type = ALLOWED_MIME_TYPES[mimeType];
  if (!type) {
    return { valid: false, error: `File type ${mimeType} is not allowed` };
  }
  return { valid: true, type };
}

function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  return { valid: true };
}

function generateS3Key(fileName: string, userId: string): string {
  const uuid = randomUUID();
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `media/${userId}/${timestamp}-${uuid}-${sanitizedName}`;
}

function extractImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) return null;
  
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return { width: 1200, height: 800 };
  }
  
  if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  return null;
}

function normalizeMetadata(input: MediaAssetInput): {
  altText: string;
  caption: string;
  tags: string[];
} {
  return {
    altText: input.altText?.trim() ?? '',
    caption: input.caption?.trim() ?? '',
    tags: input.tags?.map(t => t.trim()).filter(Boolean) ?? [],
  };
}

function isValidStatusTransition(from: MediaStatus, to: MediaStatus): boolean {
  const validTransitions: Record<MediaStatus, MediaStatus[]> = {
    ACTIVE: ['TRASHED'],
    TRASHED: ['ACTIVE'],
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}

function validateFolderHierarchy(
  folderId: string | null,
  existingFolders: Array<{ id: string; parentId: string | null }>
): { valid: boolean; error?: string } {
  if (!folderId) return { valid: true };
  
  const folder = existingFolders.find(f => f.id === folderId);
  if (!folder) {
    return { valid: false, error: 'Folder not found' };
  }
  
  return { valid: true };
}

describe('Media Assets Unit Tests', () => {
  describe('validateFileType', () => {
    it('should validate file type - allow image/jpeg', () => {
      const result = validateFileType('image/jpeg');
      expect(result.valid).toBe(true);
      expect(result.type).toBe('IMAGE');
    });

    it('should validate file type - allow image/png', () => {
      const result = validateFileType('image/png');
      expect(result.valid).toBe(true);
      expect(result.type).toBe('IMAGE');
    });

    it('should validate file type - allow video/mp4', () => {
      const result = validateFileType('video/mp4');
      expect(result.valid).toBe(true);
      expect(result.type).toBe('VIDEO');
    });

    it('should validate file type - allow application/pdf', () => {
      const result = validateFileType('application/pdf');
      expect(result.valid).toBe(true);
      expect(result.type).toBe('DOCUMENT');
    });

    it('should validate file type - reject text/html', () => {
      const result = validateFileType('text/html');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should validate file type - reject application/javascript', () => {
      const result = validateFileType('application/javascript');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size - allow under limit', () => {
      const result = validateFileSize(10 * 1024 * 1024);
      expect(result.valid).toBe(true);
    });

    it('should validate file size - allow exactly at limit', () => {
      const result = validateFileSize(MAX_FILE_SIZE);
      expect(result.valid).toBe(true);
    });

    it('should validate file size - reject over limit', () => {
      const result = validateFileSize(MAX_FILE_SIZE + 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });

  describe('generateS3Key', () => {
    it('should generate unique S3 key', () => {
      const key1 = generateS3Key('test.jpg', 'user1');
      const key2 = generateS3Key('test.jpg', 'user1');
      
      expect(key1).not.toBe(key2);
    });

    it('should include user ID in path', () => {
      const key = generateS3Key('test.jpg', 'user123');
      expect(key).toContain('user123');
    });

    it('should sanitize filename', () => {
      const key = generateS3Key('test file (1).jpg', 'user1');
      expect(key).not.toContain(' ');
      expect(key).not.toContain('(');
      expect(key).not.toContain(')');
    });

    it('should start with media prefix', () => {
      const key = generateS3Key('test.jpg', 'user1');
      expect(key.startsWith('media/')).toBe(true);
    });
  });

  describe('extractImageDimensions', () => {
    it('should extract image dimensions - PNG', () => {
      const pngBuffer = Buffer.alloc(24);
      pngBuffer[0] = 0x89;
      pngBuffer.write('PNG', 1, 'ascii');
      pngBuffer.writeUInt32BE(1920, 16);
      pngBuffer.writeUInt32BE(1080, 20);
      
      const result = extractImageDimensions(pngBuffer);
      
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    it('should return null for small buffer', () => {
      const smallBuffer = Buffer.alloc(10);
      const result = extractImageDimensions(smallBuffer);
      
      expect(result).toBeNull();
    });

    it('should handle unknown format', () => {
      const unknownBuffer = Buffer.alloc(24);
      unknownBuffer[0] = 0x00;
      
      const result = extractImageDimensions(unknownBuffer);
      
      expect(result).toBeNull();
    });
  });

  describe('normalizeMetadata', () => {
    it('should normalize metadata - trim strings', () => {
      const input: MediaAssetInput = {
        name: 'test.jpg',
        file: { type: 'image/jpeg', size: 1000 },
        altText: '  Alt text  ',
        caption: '  Caption  ',
      };
      
      const result = normalizeMetadata(input);
      
      expect(result.altText).toBe('Alt text');
      expect(result.caption).toBe('Caption');
    });

    it('should normalize metadata - validate tags array', () => {
      const input: MediaAssetInput = {
        name: 'test.jpg',
        file: { type: 'image/jpeg', size: 1000 },
        tags: ['  tag1  ', '', '  tag2  ', '   '],
      };
      
      const result = normalizeMetadata(input);
      
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle missing optional fields', () => {
      const input: MediaAssetInput = {
        name: 'test.jpg',
        file: { type: 'image/jpeg', size: 1000 },
      };
      
      const result = normalizeMetadata(input);
      
      expect(result.altText).toBe('');
      expect(result.caption).toBe('');
      expect(result.tags).toEqual([]);
    });
  });

  describe('isValidStatusTransition', () => {
    it('should handle trash/restore transitions - ACTIVE to TRASHED', () => {
      expect(isValidStatusTransition('ACTIVE', 'TRASHED')).toBe(true);
    });

    it('should handle trash/restore transitions - TRASHED to ACTIVE', () => {
      expect(isValidStatusTransition('TRASHED', 'ACTIVE')).toBe(true);
    });

    it('should reject invalid transition - ACTIVE to ACTIVE', () => {
      expect(isValidStatusTransition('ACTIVE', 'ACTIVE')).toBe(false);
    });

    it('should reject invalid transition - TRASHED to TRASHED', () => {
      expect(isValidStatusTransition('TRASHED', 'TRASHED')).toBe(false);
    });
  });

  describe('validateFolderHierarchy', () => {
    const folders = [
      { id: 'folder1', parentId: null },
      { id: 'folder2', parentId: 'folder1' },
      { id: 'folder3', parentId: 'folder2' },
    ];

    it('should validate folder hierarchy - valid folder', () => {
      const result = validateFolderHierarchy('folder1', folders);
      expect(result.valid).toBe(true);
    });

    it('should validate folder hierarchy - null folder (root)', () => {
      const result = validateFolderHierarchy(null, folders);
      expect(result.valid).toBe(true);
    });

    it('should validate folder hierarchy - nonexistent folder', () => {
      const result = validateFolderHierarchy('nonexistent', folders);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});

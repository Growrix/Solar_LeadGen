import { describe, it, expect, beforeEach, vi } from 'vitest';

interface FolderInput {
  name: string;
  parentId?: string | null;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

function validateFolderInput(input: FolderInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim() === '') {
    errors.push('name is required');
  }
  
  if (input.name && input.name.length > 100) {
    errors.push('name must be 100 characters or less');
  }
  
  return { valid: errors.length === 0, errors };
}

function isUniqueNameInParent(
  name: string,
  parentId: string | null,
  existingFolders: Folder[],
  excludeId?: string
): boolean {
  const normalizedName = name.toLowerCase().trim();
  
  return !existingFolders.some(
    f => f.parentId === parentId && 
         f.name.toLowerCase().trim() === normalizedName &&
         f.id !== excludeId
  );
}

function getFolderPath(folderId: string, folders: Folder[]): Folder[] {
  const path: Folder[] = [];
  let currentId: string | null = folderId;
  
  while (currentId) {
    const folder = folders.find(f => f.id === currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parentId;
  }
  
  return path;
}

function isCircularReference(
  folderId: string,
  newParentId: string | null,
  folders: Folder[]
): boolean {
  if (!newParentId) return false;
  if (folderId === newParentId) return true;
  
  let currentId: string | null = newParentId;
  const visited = new Set<string>();
  
  while (currentId) {
    if (currentId === folderId) return true;
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    
    const folder = folders.find(f => f.id === currentId);
    currentId = folder?.parentId ?? null;
  }
  
  return false;
}

function getDescendantIds(folderId: string, folders: Folder[]): string[] {
  const descendants: string[] = [];
  const queue = [folderId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = folders.filter(f => f.parentId === current);
    
    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }
  
  return descendants;
}

describe('Media Folders Unit Tests', () => {
  const folders: Folder[] = [
    { id: 'folder1', name: 'Marketing', parentId: null },
    { id: 'folder2', name: 'Blog', parentId: null },
    { id: 'folder3', name: 'Hero', parentId: 'folder2' },
    { id: 'folder4', name: 'Thumbnails', parentId: 'folder2' },
    { id: 'folder5', name: 'Featured', parentId: 'folder3' },
  ];

  describe('validateFolderInput', () => {
    it('should validate folder name is required', () => {
      const input: FolderInput = { name: '' };
      const result = validateFolderInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should validate folder name - whitespace only', () => {
      const input: FolderInput = { name: '   ' };
      const result = validateFolderInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should pass validation with valid name', () => {
      const input: FolderInput = { name: 'New Folder' };
      const result = validateFolderInput(input);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject name over 100 characters', () => {
      const input: FolderInput = { name: 'a'.repeat(101) };
      const result = validateFolderInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name must be 100 characters or less');
    });
  });

  describe('isUniqueNameInParent', () => {
    it('should validate unique name per parent - allow unique name', () => {
      const result = isUniqueNameInParent('New Folder', null, folders);
      expect(result).toBe(true);
    });

    it('should validate unique name per parent - reject duplicate in same parent', () => {
      const result = isUniqueNameInParent('Marketing', null, folders);
      expect(result).toBe(false);
    });

    it('should validate unique name per parent - case insensitive', () => {
      const result = isUniqueNameInParent('MARKETING', null, folders);
      expect(result).toBe(false);
    });

    it('should allow same name in different parent', () => {
      const result = isUniqueNameInParent('Hero', 'folder1', folders);
      expect(result).toBe(true);
    });

    it('should exclude self when renaming', () => {
      const result = isUniqueNameInParent('Marketing', null, folders, 'folder1');
      expect(result).toBe(true);
    });
  });

  describe('getFolderPath', () => {
    it('should handle folder hierarchy - root folder', () => {
      const path = getFolderPath('folder1', folders);
      expect(path).toHaveLength(1);
      expect(path[0].name).toBe('Marketing');
    });

    it('should handle folder hierarchy - nested folder', () => {
      const path = getFolderPath('folder3', folders);
      expect(path).toHaveLength(2);
      expect(path.map(f => f.name)).toEqual(['Blog', 'Hero']);
    });

    it('should handle folder hierarchy - deeply nested', () => {
      const path = getFolderPath('folder5', folders);
      expect(path).toHaveLength(3);
      expect(path.map(f => f.name)).toEqual(['Blog', 'Hero', 'Featured']);
    });
  });

  describe('isCircularReference', () => {
    it('should validate no circular references - same folder', () => {
      const result = isCircularReference('folder1', 'folder1', folders);
      expect(result).toBe(true);
    });

    it('should validate no circular references - folder into own child', () => {
      const result = isCircularReference('folder2', 'folder3', folders);
      expect(result).toBe(true);
    });

    it('should validate no circular references - folder into own grandchild', () => {
      const result = isCircularReference('folder2', 'folder5', folders);
      expect(result).toBe(true);
    });

    it('should allow valid parent change', () => {
      const result = isCircularReference('folder3', 'folder1', folders);
      expect(result).toBe(false);
    });

    it('should allow moving to root', () => {
      const result = isCircularReference('folder3', null, folders);
      expect(result).toBe(false);
    });
  });

  describe('getDescendantIds', () => {
    it('should get all descendants of a folder', () => {
      const descendants = getDescendantIds('folder2', folders);
      expect(descendants).toContain('folder3');
      expect(descendants).toContain('folder4');
      expect(descendants).toContain('folder5');
      expect(descendants).toHaveLength(3);
    });

    it('should return empty for folder with no children', () => {
      const descendants = getDescendantIds('folder1', folders);
      expect(descendants).toHaveLength(0);
    });

    it('should get direct children only for shallow folder', () => {
      const descendants = getDescendantIds('folder3', folders);
      expect(descendants).toEqual(['folder5']);
    });
  });
});

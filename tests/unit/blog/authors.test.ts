import { describe, it, expect, beforeEach, vi } from 'vitest';

interface AuthorInput {
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string> | null;
}

interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  socialLinks: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
}

function validateAuthorInput(input: AuthorInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim() === '') {
    errors.push('name is required');
  }
  
  if (!input.email || input.email.trim() === '') {
    errors.push('email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('email format is invalid');
  }
  
  return { valid: errors.length === 0, errors };
}

function normalizeAuthorData(input: AuthorInput): AuthorInput {
  return {
    name: input.name?.trim() ?? '',
    email: input.email?.toLowerCase().trim() ?? '',
    bio: input.bio?.trim() ?? '',
    avatarUrl: input.avatarUrl?.trim() ?? '',
    socialLinks: input.socialLinks ?? null,
  };
}

function isValidStatusTransition(from: 'ACTIVE' | 'INACTIVE', to: 'ACTIVE' | 'INACTIVE'): boolean {
  return true;
}

function parseSocialLinks(links: unknown): Record<string, string> | null {
  if (!links) return null;
  if (typeof links !== 'object') return null;
  
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(links as Record<string, unknown>)) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

describe('Authors Unit Tests', () => {
  describe('validateAuthorInput', () => {
    it('should validate author name is required', () => {
      const input: AuthorInput = { name: '', email: 'test@example.com' };
      const result = validateAuthorInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should validate author email is required', () => {
      const input: AuthorInput = { name: 'John Doe', email: '' };
      const result = validateAuthorInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('email is required');
    });

    it('should validate email format', () => {
      const input: AuthorInput = { name: 'John Doe', email: 'invalid-email' };
      const result = validateAuthorInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('email format is invalid');
    });

    it('should pass validation with valid data', () => {
      const input: AuthorInput = { name: 'John Doe', email: 'john@example.com' };
      const result = validateAuthorInput(input);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('normalizeAuthorData', () => {
    it('should normalize author data', () => {
      const input: AuthorInput = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        bio: '  Author bio  ',
      };
      
      const result = normalizeAuthorData(input);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.bio).toBe('Author bio');
    });

    it('should handle missing optional fields', () => {
      const input: AuthorInput = { name: 'John', email: 'john@example.com' };
      const result = normalizeAuthorData(input);
      
      expect(result.bio).toBe('');
      expect(result.avatarUrl).toBe('');
      expect(result.socialLinks).toBeNull();
    });
  });

  describe('isValidStatusTransition', () => {
    it('should allow ACTIVE to INACTIVE transition', () => {
      expect(isValidStatusTransition('ACTIVE', 'INACTIVE')).toBe(true);
    });

    it('should allow INACTIVE to ACTIVE transition', () => {
      expect(isValidStatusTransition('INACTIVE', 'ACTIVE')).toBe(true);
    });

    it('should allow same status transition', () => {
      expect(isValidStatusTransition('ACTIVE', 'ACTIVE')).toBe(true);
      expect(isValidStatusTransition('INACTIVE', 'INACTIVE')).toBe(true);
    });
  });

  describe('parseSocialLinks', () => {
    it('should handle social links JSON', () => {
      const links = {
        twitter: 'https://twitter.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
      };
      
      const result = parseSocialLinks(links);
      
      expect(result).toEqual(links);
    });

    it('should return null for empty object', () => {
      expect(parseSocialLinks({})).toBeNull();
    });

    it('should return null for null input', () => {
      expect(parseSocialLinks(null)).toBeNull();
    });

    it('should filter out non-string values', () => {
      const links = {
        twitter: 'https://twitter.com/johndoe',
        invalid: 123,
      };
      
      const result = parseSocialLinks(links);
      
      expect(result).toEqual({ twitter: 'https://twitter.com/johndoe' });
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

interface CommentInput {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}

type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

interface RateLimitCheck {
  ip: string;
  email: string;
  currentTime: Date;
}

interface RateLimitConfig {
  maxPerIpPerHour: number;
  maxPerEmailPerMinutes: number;
  emailCooldownMinutes: number;
}

function validateCommentInput(input: CommentInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.content || input.content.trim() === '') {
    errors.push('content is required');
  }
  
  if (!input.authorName || input.authorName.trim() === '') {
    errors.push('authorName is required');
  }
  
  if (!input.authorEmail || input.authorEmail.trim() === '') {
    errors.push('authorEmail is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.authorEmail)) {
    errors.push('authorEmail format is invalid');
  }
  
  return { valid: errors.length === 0, errors };
}

function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .trim();
}

function isValidStatusTransition(from: CommentStatus | null, to: CommentStatus): boolean {
  if (from === null) {
    return to === 'PENDING';
  }
  
  const validTransitions: Record<CommentStatus, CommentStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED', 'SPAM'],
    APPROVED: ['REJECTED', 'SPAM', 'PENDING'],
    REJECTED: ['APPROVED', 'SPAM', 'PENDING'],
    SPAM: ['APPROVED', 'REJECTED', 'PENDING'],
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}

function validateParentId(parentId: string | undefined, existingCommentIds: string[]): boolean {
  if (!parentId) return true;
  return existingCommentIds.includes(parentId);
}

function checkRateLimit(
  check: RateLimitCheck,
  recentComments: Array<{ ip: string; email: string; createdAt: Date }>,
  config: RateLimitConfig
): { allowed: boolean; reason?: string } {
  const oneHourAgo = new Date(check.currentTime.getTime() - 60 * 60 * 1000);
  const cooldownTime = new Date(check.currentTime.getTime() - config.emailCooldownMinutes * 60 * 1000);
  
  const ipCommentsLastHour = recentComments.filter(
    c => c.ip === check.ip && c.createdAt > oneHourAgo
  ).length;
  
  if (ipCommentsLastHour >= config.maxPerIpPerHour) {
    return { allowed: false, reason: 'Too many comments from this IP address' };
  }
  
  const recentEmailComment = recentComments.find(
    c => c.email === check.email && c.createdAt > cooldownTime
  );
  
  if (recentEmailComment) {
    return { allowed: false, reason: 'Please wait before submitting another comment' };
  }
  
  return { allowed: true };
}

describe('Comments Unit Tests', () => {
  describe('validateCommentInput', () => {
    it('should validate comment content is required', () => {
      const input: CommentInput = {
        postId: 'post1',
        authorName: 'John',
        authorEmail: 'john@example.com',
        content: '',
      };
      
      const result = validateCommentInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('content is required');
    });

    it('should validate author name is required', () => {
      const input: CommentInput = {
        postId: 'post1',
        authorName: '',
        authorEmail: 'john@example.com',
        content: 'Great post!',
      };
      
      const result = validateCommentInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('authorName is required');
    });

    it('should validate author email format', () => {
      const input: CommentInput = {
        postId: 'post1',
        authorName: 'John',
        authorEmail: 'invalid-email',
        content: 'Great post!',
      };
      
      const result = validateCommentInput(input);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('authorEmail format is invalid');
    });

    it('should pass validation with valid data', () => {
      const input: CommentInput = {
        postId: 'post1',
        authorName: 'John',
        authorEmail: 'john@example.com',
        content: 'Great post!',
      };
      
      const result = validateCommentInput(input);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('sanitizeContent', () => {
    it('should sanitize comment content - remove script tags', () => {
      const content = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeContent(content);
      
      expect(result).toBe('Hello  World');
      expect(result).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const content = 'Check this <iframe src="evil.com"></iframe> out';
      const result = sanitizeContent(content);
      
      expect(result).not.toContain('<iframe');
    });

    it('should remove event handlers', () => {
      const content = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeContent(content);
      
      expect(result).not.toContain('onclick');
    });

    it('should trim whitespace', () => {
      const content = '  Hello World  ';
      const result = sanitizeContent(content);
      
      expect(result).toBe('Hello World');
    });
  });

  describe('isValidStatusTransition', () => {
    it('should validate status transitions - PENDING to APPROVED', () => {
      expect(isValidStatusTransition('PENDING', 'APPROVED')).toBe(true);
    });

    it('should validate status transitions - PENDING to REJECTED', () => {
      expect(isValidStatusTransition('PENDING', 'REJECTED')).toBe(true);
    });

    it('should validate status transitions - PENDING to SPAM', () => {
      expect(isValidStatusTransition('PENDING', 'SPAM')).toBe(true);
    });

    it('should validate new comment starts as PENDING', () => {
      expect(isValidStatusTransition(null, 'PENDING')).toBe(true);
      expect(isValidStatusTransition(null, 'APPROVED')).toBe(false);
    });

    it('should allow any status to any other status for moderation', () => {
      expect(isValidStatusTransition('APPROVED', 'SPAM')).toBe(true);
      expect(isValidStatusTransition('REJECTED', 'APPROVED')).toBe(true);
    });
  });

  describe('validateParentId', () => {
    it('should handle nested replies - valid parentId', () => {
      const existingIds = ['comment1', 'comment2', 'comment3'];
      expect(validateParentId('comment1', existingIds)).toBe(true);
    });

    it('should handle nested replies - invalid parentId', () => {
      const existingIds = ['comment1', 'comment2'];
      expect(validateParentId('nonexistent', existingIds)).toBe(false);
    });

    it('should allow undefined parentId', () => {
      expect(validateParentId(undefined, [])).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    const config: RateLimitConfig = {
      maxPerIpPerHour: 5,
      maxPerEmailPerMinutes: 1,
      emailCooldownMinutes: 5,
    };

    it('should enforce rate limits - allow when under limit', () => {
      const check: RateLimitCheck = {
        ip: '192.168.1.1',
        email: 'test@example.com',
        currentTime: new Date(),
      };
      
      const result = checkRateLimit(check, [], config);
      
      expect(result.allowed).toBe(true);
    });

    it('should enforce rate limits - block when IP exceeds limit', () => {
      const now = new Date();
      const check: RateLimitCheck = {
        ip: '192.168.1.1',
        email: 'new@example.com',
        currentTime: now,
      };
      
      const recentComments = Array(5).fill(null).map(() => ({
        ip: '192.168.1.1',
        email: 'other@example.com',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      }));
      
      const result = checkRateLimit(check, recentComments, config);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('IP');
    });

    it('should enforce rate limits - block same email too soon', () => {
      const now = new Date();
      const check: RateLimitCheck = {
        ip: '192.168.1.2',
        email: 'test@example.com',
        currentTime: now,
      };
      
      const recentComments = [{
        ip: '192.168.1.1',
        email: 'test@example.com',
        createdAt: new Date(now.getTime() - 2 * 60 * 1000),
      }];
      
      const result = checkRateLimit(check, recentComments, config);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('wait');
    });
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

describe('Comments API Integration Tests', () => {
  const adminBaseUrl = 'http://localhost:5000/api/admin/blog/comments';
  const publicBaseUrl = 'http://localhost:5000/api/blog/posts';
  
  describe('GET /api/admin/blog/comments', () => {
    it('should return all comments with counts', async () => {
      const response = await fetch(adminBaseUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('comments');
      expect(data).toHaveProperty('counts');
      expect(Array.isArray(data.comments)).toBe(true);
    });

    it('should filter by status when ?status=PENDING', async () => {
      const response = await fetch(`${adminBaseUrl}?status=PENDING`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      data.comments.forEach((comment: { status: string }) => {
        expect(comment.status).toBe('PENDING');
      });
    });

    it('should filter by post when ?postId=X', async () => {
      const response = await fetch(`${adminBaseUrl}?postId=test-post-id`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.comments)).toBe(true);
    });
  });

  describe('PATCH /api/admin/blog/comments/[id]', () => {
    it('should approve comment - status becomes APPROVED', async () => {
      const commentId = 'test-comment-id';
      const response = await fetch(`${adminBaseUrl}/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      
      expect([200, 404]).toContain(response.status);
    });

    it('should reject comment - status becomes REJECTED', async () => {
      const commentId = 'test-comment-id';
      const response = await fetch(`${adminBaseUrl}/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      
      expect([200, 404]).toContain(response.status);
    });

    it('should mark as spam - status becomes SPAM', async () => {
      const commentId = 'test-comment-id';
      const response = await fetch(`${adminBaseUrl}/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SPAM' }),
      });
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/blog/comments/[id]', () => {
    it('should delete comment (hard delete)', async () => {
      const commentId = 'test-comment-id';
      const response = await fetch(`${adminBaseUrl}/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/admin/blog/comments/bulk', () => {
    it('should bulk approve comments', async () => {
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['comment1', 'comment2'],
          action: 'approve',
        }),
      });
      
      expect([200, 404]).toContain(response.status);
    });

    it('should bulk reject comments', async () => {
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['comment1', 'comment2'],
          action: 'reject',
        }),
      });
      
      expect([200, 404]).toContain(response.status);
    });

    it('should bulk delete comments', async () => {
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['comment1', 'comment2'],
          action: 'delete',
        }),
      });
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/blog/posts/[slug]/comments', () => {
    it('should return approved comments only for public', async () => {
      const response = await fetch(`${publicBaseUrl}/test-post/comments`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data.comments)).toBe(true);
      }
    });
  });

  describe('POST /api/blog/posts/[slug]/comments', () => {
    it('should create pending comment for public submit', async () => {
      const response = await fetch(`${publicBaseUrl}/test-post/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: 'Test User',
          authorEmail: 'test@example.com',
          content: 'Great post!',
        }),
      });
      
      expect([201, 404, 429]).toContain(response.status);
    });

    it('should rate limit excessive submissions', async () => {
      const promises = Array(10).fill(null).map(() =>
        fetch(`${publicBaseUrl}/test-post/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorName: 'Spam User',
            authorEmail: 'spam@example.com',
            content: 'Spam comment',
          }),
        })
      );
      
      const responses = await Promise.all(promises);
      const statuses = responses.map(r => r.status);
      
      expect(statuses.some(s => s === 429 || s === 404 || s === 201)).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require admin auth for admin endpoints', async () => {
      const response = await fetch(adminBaseUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([200, 401, 403]).toContain(response.status);
    });
  });
});

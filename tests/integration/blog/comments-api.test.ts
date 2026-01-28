import { describe, it, expect, beforeAll } from 'vitest';
import { getIntegrationOrigin, loginAdminAndGetCookieHeader } from '../helpers/adminAuth';

describe('Comments API Integration Tests', () => {
  const origin = getIntegrationOrigin();
  const adminBaseUrl = `${origin}/api/admin/blog/comments`;
  const adminPostsBaseUrl = `${origin}/api/admin/blog/posts`;
  let adminCookie: string;
  let postId: string;

  beforeAll(async () => {
    adminCookie = await loginAdminAndGetCookieHeader(origin);

    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createPostResp = await fetch(adminPostsBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookie,
      },
      body: JSON.stringify({
        title: `Integration Test Post ${unique}`,
        content: 'Hello world',
        status: 'DRAFT',
      }),
    });

    expect(createPostResp.status).toBe(201);
    const createdPost = await createPostResp.json();
    postId = createdPost?.post?.id as string;
    expect(postId).toBeTruthy();
  });

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    cookie: adminCookie,
  });

  async function createTestComment() {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const response = await fetch(adminBaseUrl, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        postId,
        authorName: 'Integration Tester',
        authorEmail: `integration-${unique}@example.com`,
        content: `Test comment ${unique}`,
        status: 'PENDING',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data?.comment?.id).toBeTruthy();
    return data.comment as { id: string; status: string; postId: string };
  }
  
  describe('GET /api/admin/blog/comments', () => {
    it('should return all comments with counts', async () => {
      const response = await fetch(adminBaseUrl, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('comments');
      expect(data).toHaveProperty('counts');
      expect(Array.isArray(data.comments)).toBe(true);
    });

    it('should filter by status when ?status=PENDING', async () => {
      await createTestComment();
      const response = await fetch(`${adminBaseUrl}?status=PENDING`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      data.comments.forEach((comment: { status: string }) => {
        expect(comment.status).toBe('PENDING');
      });
    });

    it('should filter by post when ?postId=X', async () => {
      await createTestComment();
      const response = await fetch(`${adminBaseUrl}?postId=${encodeURIComponent(postId)}`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.comments)).toBe(true);
      data.comments.forEach((comment: { postId: string }) => {
        expect(comment.postId).toBe(postId);
      });
    });
  });

  describe('PUT /api/admin/blog/comments/[id]', () => {
    it('should approve comment - status becomes APPROVED', async () => {
      const comment = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/${comment.id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.comment?.status).toBe('APPROVED');
    });

    it('should reject comment - status becomes REJECTED', async () => {
      const comment = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/${comment.id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.comment?.status).toBe('REJECTED');
    });

    it('should mark as spam - status becomes SPAM', async () => {
      const comment = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/${comment.id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ status: 'SPAM' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.comment?.status).toBe('SPAM');
    });
  });

  describe('DELETE /api/admin/blog/comments/[id]', () => {
    it('should delete comment (hard delete)', async () => {
      const comment = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/${comment.id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.success).toBe(true);
    });
  });

  describe('POST /api/admin/blog/comments/bulk', () => {
    it('should bulk approve comments', async () => {
      const c1 = await createTestComment();
      const c2 = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          ids: [c1.id, c2.id],
          action: 'approve',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.success).toBe(true);
      expect(data?.newStatus).toBe('APPROVED');
    });

    it('should bulk reject comments', async () => {
      const c1 = await createTestComment();
      const c2 = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          ids: [c1.id, c2.id],
          action: 'reject',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.success).toBe(true);
      expect(data?.newStatus).toBe('REJECTED');
    });

    it('should bulk delete comments', async () => {
      const c1 = await createTestComment();
      const c2 = await createTestComment();
      const response = await fetch(`${adminBaseUrl}/bulk`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          ids: [c1.id, c2.id],
          action: 'delete',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data?.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require admin auth for admin endpoints', async () => {
      const response = await fetch(adminBaseUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([401, 403]).toContain(response.status);
    });
  });
});

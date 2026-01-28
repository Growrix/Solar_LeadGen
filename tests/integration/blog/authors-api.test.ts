import { describe, it, expect, beforeAll } from 'vitest';
import { getIntegrationOrigin, loginAdminAndGetCookieHeader } from '../helpers/adminAuth';

describe('Authors API Integration Tests', () => {
  const origin = getIntegrationOrigin();
  const baseUrl = `${origin}/api/admin/blog/authors`;
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await loginAdminAndGetCookieHeader(origin);
  });

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    cookie: adminCookie,
  });
  
  describe('GET /api/admin/blog/authors', () => {
    it('should return all authors', async () => {
      const response = await fetch(baseUrl, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('authors');
      expect(Array.isArray(data.authors)).toBe(true);
    });

    it('should filter by status when ?status=ACTIVE', async () => {
      const response = await fetch(`${baseUrl}?status=ACTIVE`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      data.authors.forEach((author: { status: string }) => {
        expect(author.status).toBe('ACTIVE');
      });
    });

    it('should search by name/email when ?q=john', async () => {
      const response = await fetch(`${baseUrl}?q=john`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.authors)).toBe(true);
    });
  });

  describe('POST /api/admin/blog/authors', () => {
    it('should create author with valid data', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: 'Test Author',
          email: `test-${Date.now()}@example.com`,
          bio: 'Test bio',
        }),
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.author).toHaveProperty('id');
      expect(data.author.name).toBe('Test Author');
    });

    it('should reject duplicate email with 409', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: 'First', email }),
      });

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: 'Second', email }),
      });
      
      expect(response.status).toBe(409);
    });

    it('should reject missing name with 400', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/admin/blog/authors/[id]', () => {
    it('should return single author', async () => {
      const createResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: 'Get Test',
          email: `get-${Date.now()}@example.com`,
        }),
      });
      
      const { author } = await createResponse.json();
      
      const response = await fetch(`${baseUrl}/${author.id}`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.author.id).toBe(author.id);
    });

    it('should return 404 for non-existent author', async () => {
      const response = await fetch(`${baseUrl}/nonexistent123`, {
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/blog/authors/[id]', () => {
    it('should update author fields', async () => {
      const createResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: 'Update Test',
          email: `update-${Date.now()}@example.com`,
        }),
      });
      
      const { author } = await createResponse.json();
      
      const response = await fetch(`${baseUrl}/${author.id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ name: 'Updated Name', bio: 'Updated bio' }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.author.name).toBe('Updated Name');
      expect(data.author.bio).toBe('Updated bio');
    });
  });

  describe('DELETE /api/admin/blog/authors/[id]', () => {
    it('should deactivate author (soft delete)', async () => {
      const createResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: 'Delete Test',
          email: `delete-${Date.now()}@example.com`,
        }),
      });
      
      const { author } = await createResponse.json();
      
      const response = await fetch(`${baseUrl}/${author.id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require admin auth - returns 401 without auth', async () => {
      const response = await fetch(baseUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([401, 403]).toContain(response.status);
    });
  });
});

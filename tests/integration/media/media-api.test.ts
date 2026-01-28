import { describe, it, expect, beforeAll } from 'vitest';
import { getIntegrationOrigin, loginAdminAndGetCookieHeader } from '../helpers/adminAuth';

describe('Media API Integration Tests', () => {
  const origin = getIntegrationOrigin();
  const assetsUrl = `${origin}/api/admin/media/assets`;
  const foldersUrl = `${origin}/api/admin/media/folders`;
  let adminCookie: string;

  beforeAll(async () => {
    adminCookie = await loginAdminAndGetCookieHeader(origin);
  });

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    cookie: adminCookie,
  });

  async function createTestAsset() {
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const response = await fetch(assetsUrl, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        name: `Test Asset ${unique}`,
        type: 'IMAGE',
        url: `https://example.com/media/${unique}.jpg`,
        s3Key: `media/test/${unique}.jpg`,
        mimeType: 'image/jpeg',
        size: 1234,
        dimensions: '100x100',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data?.asset?.id).toBeTruthy();
    return data.asset as { id: string; s3Key: string };
  }
  
  describe('GET /api/admin/media/assets', () => {
    it('should return assets', async () => {
      const response = await fetch(assetsUrl, { headers: adminHeaders() });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('assets');
      expect(Array.isArray(data.assets)).toBe(true);
    });

    it('should filter by folder when ?folderId=X', async () => {
      const response = await fetch(`${assetsUrl}?folderId=test-folder`, { headers: adminHeaders() });
      
      expect([200, 404]).toContain(response.status);
    });

    it('should show trash when ?status=TRASHED', async () => {
      const response = await fetch(`${assetsUrl}?status=TRASHED`, { headers: adminHeaders() });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      data.assets.forEach((asset: { status: string }) => {
        expect(asset.status).toBe('TRASHED');
      });
    });

    it('should filter by type when ?type=IMAGE', async () => {
      const response = await fetch(`${assetsUrl}?type=IMAGE`, { headers: adminHeaders() });
      
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/admin/media/assets', () => {
    it('should create asset with valid payload', async () => {
      const asset = await createTestAsset();
      expect(asset.id).toBeTruthy();
    });

    it('should reject missing required fields with 400', async () => {
      const response = await fetch(assetsUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: '' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/admin/media/assets/[id]', () => {
    it('should update metadata', async () => {
      const asset = await createTestAsset();
      const response = await fetch(`${assetsUrl}/${asset.id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ altText: 'Updated alt text', caption: 'Updated caption' }),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/admin/media/assets/[id]', () => {
    it('should trash, restore, and permanently delete', async () => {
      const asset = await createTestAsset();

      const trashResp = await fetch(`${assetsUrl}/${asset.id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      expect(trashResp.status).toBe(200);

      const restoreResp = await fetch(`${assetsUrl}/${asset.id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      expect(restoreResp.status).toBe(200);

      const permResp = await fetch(`${assetsUrl}/${asset.id}?permanent=true`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      expect(permResp.status).toBe(200);
    });
  });

  describe('Folders API', () => {
    it('GET /api/admin/media/folders should return folders', async () => {
      const response = await fetch(foldersUrl, { headers: adminHeaders() });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('folders');
    });

    it('POST /api/admin/media/folders should create folder', async () => {
      const response = await fetch(foldersUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: `Test Folder ${Date.now()}`,
        }),
      });
      
      expect(response.status).toBe(201);
    });

    it('PUT /api/admin/media/folders/[id] should rename folder', async () => {
      const createResp = await fetch(foldersUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: `Rename Folder ${Date.now()}` }),
      });
      expect(createResp.status).toBe(201);
      const created = await createResp.json();
      const folderId = created?.folder?.id as string;

      const response = await fetch(`${foldersUrl}/${folderId}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({
          name: 'Renamed Folder',
        }),
      });
      
      expect(response.status).toBe(200);
    });

    it('DELETE /api/admin/media/folders/[id] should delete folder', async () => {
      const createResp = await fetch(foldersUrl, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ name: `Delete Folder ${Date.now()}` }),
      });
      expect(createResp.status).toBe(201);
      const created = await createResp.json();
      const folderId = created?.folder?.id as string;

      const response = await fetch(`${foldersUrl}/${folderId}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Authentication', () => {
    it('should require admin auth', async () => {
      const response = await fetch(assetsUrl, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect([401, 403]).toContain(response.status);
    });
  });
});

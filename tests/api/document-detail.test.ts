import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('Document Detail API', () => {
  describe('GET /api/admin/document', () => {
    it('should require document ID', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/document`);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('ID');
    });

    it('should return 404 for non-existent document', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await fetch(`${BASE_URL}/api/admin/document?id=${fakeId}`);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('not found');
    });

    it('should have CORS headers', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/document?id=test`);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });
  });

  describe('DELETE /api/admin/document', () => {
    it('should require document ID', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/document`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('ID');
    });

    it('should return 404 for non-existent document', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await fetch(`${BASE_URL}/api/admin/document?id=${fakeId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/admin/document (reindex)', () => {
    it('should require document ID', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/document?action=reindex`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent document', async () => {
      // Use a valid UUID v4 format that doesn't exist
      const fakeId = '00000000-0000-4000-8000-000000000000';
      const response = await fetch(
        `${BASE_URL}/api/admin/document?id=${fakeId}&action=reindex`,
        { method: 'POST' }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('OPTIONS /api/admin/document', () => {
    it('should handle preflight requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/document`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(200);
    });
  });
});

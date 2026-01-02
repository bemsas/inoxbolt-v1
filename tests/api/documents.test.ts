import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('Documents API', () => {
  describe('GET /api/admin/documents', () => {
    it('should return documents list and stats', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/documents`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('documents');
      expect(data).toHaveProperty('stats');
      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.stats).toHaveProperty('totalDocuments');
      expect(data.stats).toHaveProperty('totalChunks');
    });

    it('should return proper stats structure', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/documents`);
      const data = await response.json();

      expect(typeof data.stats.totalDocuments).toBe('number');
      expect(typeof data.stats.totalChunks).toBe('number');
      expect(typeof data.stats.processingCount).toBe('number');
      expect(typeof data.stats.completedCount).toBe('number');
    });

    it('should have CORS headers', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/documents`);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });
  });

  describe('POST /api/admin/documents', () => {
    it('should reject non-multipart requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('multipart');
    });
  });

  describe('OPTIONS /api/admin/documents', () => {
    it('should handle preflight requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/documents`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(200);
    });
  });
});

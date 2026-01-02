import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('Init DB API', () => {
  describe('POST /api/admin/init-db', () => {
    it('should reject requests without secret', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/init-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should reject requests with wrong secret', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/init-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: 'wrong-secret' }),
      });

      expect(response.status).toBe(401);
    });

    it('should accept correct secret (idempotent)', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/init-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: 'init-inoxbolt-db-2024' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tables).toContain('documents');
      expect(data.tables).toContain('chunks');
    });
  });

  describe('GET /api/admin/init-db', () => {
    it('should reject GET requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/init-db`);

      expect(response.status).toBe(405);
    });
  });
});

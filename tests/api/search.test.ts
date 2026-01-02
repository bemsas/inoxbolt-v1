import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('Search API', () => {
  describe('POST /api/search', () => {
    it('should reject queries shorter than 2 characters', async () => {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'a' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('2 characters');
    });

    it('should accept valid search queries', async () => {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'bolt specifications' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('query');
      expect(data).toHaveProperty('totalResults');
      expect(Array.isArray(data.results)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'fastener', limit: 5 }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.results.length).toBeLessThanOrEqual(5);
    });

    it('should return results with proper structure', async () => {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'screw thread' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.results.length > 0) {
        const result = data.results[0];
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('snippet');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('document');
      }
    });

    it('should handle empty body gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/search', () => {
    it('should reject GET requests', async () => {
      const response = await fetch(`${BASE_URL}/api/search`);

      expect(response.status).toBe(405);
    });
  });
});

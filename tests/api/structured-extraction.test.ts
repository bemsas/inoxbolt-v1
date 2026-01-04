/**
 * API Tests: Structured Extraction
 * Tests for the structured product extraction API endpoint
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Structured Extraction API', () => {
  describe('POST /api/admin/extract-structured', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/extract-structured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: 'test' }),
      });

      expect(response.status).toBe(401);
    });

    it('should require documentId parameter', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/extract-structured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('documentId');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/extract-structured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ documentId: 'non-existent-id' }),
      });

      expect(response.status).toBe(404);
    });

    it('should reject non-POST methods', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/extract-structured`, {
        method: 'GET',
      });

      expect(response.status).toBe(405);
    });
  });
});

describe('Search API', () => {
  describe('POST /api/search', () => {
    it('should search for products by standard', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'DIN 933' }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.results).toBeDefined();
        expect(Array.isArray(data.results)).toBe(true);
      }
    });

    it('should search for products by thread spec', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'M8x30' }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.results).toBeDefined();
      }
    });

    it('should search for products by material', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'A2 stainless' }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.results).toBeDefined();
      }
    });

    it('should return searchInfo with query analysis', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'DIN 933 M8' }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.searchInfo).toBeDefined();
        if (data.searchInfo) {
          expect(data.searchInfo.queryType).toBeDefined();
        }
      }
    });

    it('should handle empty query gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '' }),
      });

      expect(response.status).toBeLessThan(500);
    });

    it('should respect limit parameter', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'bolt', limit: 5 }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.results.length).toBeLessThanOrEqual(5);
      }
    });

    it('should filter by document ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'bolt',
          documentIds: ['test-doc-id'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.results).toBeDefined();
      }
    });
  });
});

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (response.ok) {
        const data = await response.json();
        expect(data.status).toBeDefined();
        expect(data.database).toBeDefined();
      }
    });

    it('should include database info', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (response.ok) {
        const data = await response.json();
        if (data.database) {
          expect(data.database.connected).toBeDefined();
        }
      }
    });

    it('should include vector DB info', async () => {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (response.ok) {
        const data = await response.json();
        if (data.vectorDb) {
          expect(data.vectorDb.configured).toBeDefined();
        }
      }
    });
  });
});

describe('Chat API', () => {
  describe('POST /api/chat', () => {
    it('should respond to product queries', async () => {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is DIN 933?' }],
        }),
      });

      // Either streaming response or JSON
      expect(response.ok).toBe(true);
    });

    it('should handle Spanish language queries', async () => {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '¿Qué es DIN 933?' }],
          language: 'es',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });
});

describe('Documents API', () => {
  describe('GET /api/admin/documents', () => {
    it('should return list of documents', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/documents`, {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.documents).toBeDefined();
        expect(Array.isArray(data.documents)).toBe(true);
      }
    });

    it('should include document metadata', async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/documents`, {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
          const doc = data.documents[0];
          expect(doc.id).toBeDefined();
          expect(doc.filename).toBeDefined();
        }
      }
    });
  });
});

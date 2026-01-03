import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('AI Settings API', () => {
  describe('GET /api/admin/ai-settings', () => {
    it('should return current AI settings', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('temperature');
      expect(data).toHaveProperty('maxTokens');
      expect(data).toHaveProperty('contextChunks');
      expect(data).toHaveProperty('model');
    });

    it('should return settings within valid ranges', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`);
      const data = await response.json();

      expect(data.temperature).toBeGreaterThanOrEqual(0);
      expect(data.temperature).toBeLessThanOrEqual(2);
      expect(data.maxTokens).toBeGreaterThanOrEqual(100);
      expect(data.maxTokens).toBeLessThanOrEqual(4000);
      expect(data.contextChunks).toBeGreaterThanOrEqual(1);
      expect(data.contextChunks).toBeLessThanOrEqual(20);
      expect(['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']).toContain(data.model);
    });

    it('should have CORS headers', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });
  });

  describe('PUT /api/admin/ai-settings', () => {
    it('should update settings with valid data', async () => {
      const newSettings = {
        temperature: 0.8,
        maxTokens: 2000,
        contextChunks: 10,
        model: 'gpt-4o',
      };

      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.settings).toEqual(newSettings);

      // Restore defaults
      await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 0.7,
          maxTokens: 1500,
          contextChunks: 8,
          model: 'gpt-4o-mini',
        }),
      });
    });

    it('should reject temperature out of range (too high)', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 5,
          maxTokens: 1500,
          contextChunks: 8,
          model: 'gpt-4o-mini',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Temperature');
    });

    it('should reject temperature out of range (negative)', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: -1,
          maxTokens: 1500,
          contextChunks: 8,
          model: 'gpt-4o-mini',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Temperature');
    });

    it('should reject maxTokens below minimum', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 0.7,
          maxTokens: 50,
          contextChunks: 8,
          model: 'gpt-4o-mini',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('tokens');
    });

    it('should reject maxTokens above maximum', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 0.7,
          maxTokens: 10000,
          contextChunks: 8,
          model: 'gpt-4o-mini',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('tokens');
    });

    it('should reject contextChunks out of range', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 0.7,
          maxTokens: 1500,
          contextChunks: 50,
          model: 'gpt-4o-mini',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Context chunks');
    });

    it('should reject invalid model', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 0.7,
          maxTokens: 1500,
          contextChunks: 8,
          model: 'invalid-model',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('model');
    });
  });

  describe('OPTIONS /api/admin/ai-settings', () => {
    it('should handle preflight requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-methods')).toContain('GET');
      expect(response.headers.get('access-control-allow-methods')).toContain('PUT');
    });
  });

  describe('Invalid Methods', () => {
    it('should reject DELETE method', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.error).toContain('not allowed');
    });

    it('should reject POST method', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/ai-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(405);
    });
  });
});

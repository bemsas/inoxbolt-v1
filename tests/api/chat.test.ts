import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'https://inoxbolt-v1.vercel.app';

describe('Chat API', () => {
  describe('POST /api/chat', () => {
    it('should reject empty messages', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should accept valid chat messages', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is a hex bolt?' }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
    });

    it('should return session ID header', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });

      expect(response.status).toBe(200);
      const sessionId = response.headers.get('x-session-id');
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
    });

    it('should return sources header', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Tell me about fasteners' }),
      });

      expect(response.status).toBe(200);
      const sourcesHeader = response.headers.get('x-sources');
      expect(sourcesHeader).toBeTruthy();

      // Sources are base64 encoded to avoid header character issues
      const decodedSources = Buffer.from(sourcesHeader!, 'base64').toString('utf-8');
      const sources = JSON.parse(decodedSources);
      expect(Array.isArray(sources)).toBe(true);
    });

    it('should maintain session with sessionId', async () => {
      // First message - get session ID
      const response1 = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'My name is Test User' }),
      });

      expect(response1.status).toBe(200);
      const sessionId = response1.headers.get('x-session-id');

      // Second message with same session
      const response2 = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is my name?',
          sessionId: sessionId,
        }),
      });

      expect(response2.status).toBe(200);
    });

    it('should support language parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hola',
          language: 'es',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should stream response', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What are hex bolts?' }),
      });

      expect(response.status).toBe(200);

      // Read the stream
      const reader = response.body?.getReader();
      expect(reader).toBeTruthy();

      if (reader) {
        const { done, value } = await reader.read();
        expect(done).toBe(false);
        expect(value).toBeTruthy();
        reader.releaseLock();
      }
    });
  });

  describe('GET /api/chat', () => {
    it('should reject GET requests', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`);

      expect(response.status).toBe(405);
    });
  });
});

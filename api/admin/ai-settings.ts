import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export interface AISettings {
  temperature: number;
  maxTokens: number;
  contextChunks: number;
  model: string;
}

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.7,
  maxTokens: 1500,
  contextChunks: 8,
  model: 'gpt-4o-mini',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure the settings table exists
    await sql`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (req.method === 'GET') {
      const result = await sql`SELECT value FROM ai_settings WHERE key = 'chat_settings'`;

      if (result.rows.length === 0) {
        return res.status(200).json(DEFAULT_SETTINGS);
      }

      return res.status(200).json(result.rows[0].value);
    }

    if (req.method === 'PUT') {
      const settings: AISettings = req.body;

      // Validate settings
      if (settings.temperature < 0 || settings.temperature > 2) {
        return res.status(400).json({ error: 'Temperature must be between 0 and 2' });
      }
      if (settings.maxTokens < 100 || settings.maxTokens > 4000) {
        return res.status(400).json({ error: 'Max tokens must be between 100 and 4000' });
      }
      if (settings.contextChunks < 1 || settings.contextChunks > 20) {
        return res.status(400).json({ error: 'Context chunks must be between 1 and 20' });
      }

      const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'];
      if (!validModels.includes(settings.model)) {
        return res.status(400).json({ error: 'Invalid model selection' });
      }

      await sql`
        INSERT INTO ai_settings (key, value, updated_at)
        VALUES ('chat_settings', ${JSON.stringify(settings)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (key)
        DO UPDATE SET value = ${JSON.stringify(settings)}::jsonb, updated_at = CURRENT_TIMESTAMP
      `;

      return res.status(200).json({ success: true, settings });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('AI settings error:', error);
    return res.status(500).json({ error: 'Failed to process settings', details: String(error) });
  }
}

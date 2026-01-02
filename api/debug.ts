import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'NOT SET',
      UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL ? 'set' : 'NOT SET',
      UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN ? 'set (length: ' + process.env.UPSTASH_VECTOR_REST_TOKEN.length + ')' : 'NOT SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'set' : 'NOT SET',
    },
  };

  // Test Upstash Vector connection
  try {
    const { Index } = await import('@upstash/vector');
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    // Try to get index info
    const info = await vectorIndex.info();
    checks.upstash = {
      status: 'connected',
      info,
    };
  } catch (error) {
    checks.upstash = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  // Test OpenAI connection
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Just verify the client initializes
    checks.openai = {
      status: 'client initialized',
    };
  } catch (error) {
    checks.openai = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return res.status(200).json(checks);
}

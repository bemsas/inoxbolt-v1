import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const health: Record<string, any> = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check database connection
  try {
    const result = await sql`SELECT 1 as connected`;
    health.checks.database = { status: 'ok', connected: true };
  } catch (error) {
    health.checks.database = {
      status: 'error',
      error: String(error),
      hint: 'Check POSTGRES_URL environment variable'
    };
  }

  // Check if documents table exists
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'documents'
      ) as exists
    `;
    health.checks.documentsTable = {
      status: result.rows[0].exists ? 'ok' : 'missing',
      exists: result.rows[0].exists
    };
  } catch (error) {
    health.checks.documentsTable = { status: 'error', error: String(error) };
  }

  // Check documents count
  try {
    const result = await sql`SELECT COUNT(*) as count FROM documents`;
    health.checks.documentsCount = {
      status: 'ok',
      count: Number(result.rows[0].count)
    };
  } catch (error) {
    health.checks.documentsCount = { status: 'error', error: String(error) };
  }

  // Check Upstash Vector
  try {
    const { Index } = await import('@upstash/vector');
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
    const info = await vectorIndex.info();
    health.checks.vectorDB = {
      status: 'ok',
      vectorCount: info.vectorCount,
      dimension: info.dimension,
      namespaceCount: info.namespaceCount
    };
  } catch (error) {
    health.checks.vectorDB = {
      status: 'error',
      error: String(error),
      hint: 'Check UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN'
    };
  }

  // Check environment variables
  health.checks.envVars = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    UPSTASH_VECTOR_REST_URL: !!process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: !!process.env.UPSTASH_VECTOR_REST_TOKEN,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
  };

  // Overall status
  const hasError = Object.values(health.checks).some(
    (check: any) => check.status === 'error' || check.status === 'missing'
  );
  health.status = hasError ? 'unhealthy' : 'healthy';

  return res.status(hasError ? 500 : 200).json(health);
}

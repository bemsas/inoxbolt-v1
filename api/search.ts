import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

interface SearchRequest {
  query: string;
  limit?: number;
  supplier?: string;
  threshold?: number;
  productType?: string;
  material?: string;
  threadType?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: SearchRequest = req.body;
    const { query, limit = 10, supplier, threshold = 0.5, productType, material, threadType } = body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Dynamic imports to avoid bundling issues
    const { generateEmbedding } = await import('../lib/embeddings.js');
    const { searchChunks: searchChunksVector } = await import('../lib/vector/client.js');

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Search using Upstash Vector with filters
    const results = await searchChunksVector(queryEmbedding, limit, {
      supplier,
      productType,
      material,
      threadType,
    });

    // Filter by threshold
    const thresholdFiltered = results.filter((r) => r.score >= threshold);

    // Get unique document IDs to look up supplier info
    const documentIds = [...new Set(thresholdFiltered.map((r) => r.metadata.documentId))];

    // Fetch supplier info from database for documents missing supplier in vector metadata
    const supplierMap = new Map<string, string | null>();
    if (documentIds.length > 0) {
      try {
        // Vercel Postgres requires array to be passed as a string for ANY clause
        const { rows } = await sql`SELECT id, supplier FROM documents WHERE id = ANY(${documentIds as any}::text[])`;
        for (const row of rows) {
          supplierMap.set(row.id, row.supplier);
        }
      } catch (dbError) {
        console.error('Failed to fetch supplier info:', dbError);
      }
    }

    // Format response with supplier fallback from database
    const filteredResults = thresholdFiltered.map((r) => ({
        id: r.id,
        content: r.content,
        snippet: r.content.length > 200 ? r.content.substring(0, 200) + '...' : r.content,
        score: Math.round(r.score * 100),
        pageNumber: r.metadata.pageNumber,
        document: {
          id: r.metadata.documentId,
          filename: r.metadata.documentName,
          // Use vector metadata supplier, fallback to database
          supplier: r.metadata.supplier || supplierMap.get(r.metadata.documentId) || null,
        },
        // Product metadata for AI compatibility
        productType: r.metadata.productType,
        material: r.metadata.material,
        threadType: r.metadata.threadType,
        headType: r.metadata.headType,
        standard: r.metadata.standard,
      }));

    return res.status(200).json({
      results: filteredResults,
      query,
      totalResults: filteredResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed', details: String(error) });
  }
}

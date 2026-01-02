import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchChunks } from '../lib/db/client';
import { generateEmbedding } from '../lib/embeddings';

interface SearchRequest {
  query: string;
  limit?: number;
  supplier?: string;
  threshold?: number;
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
    const { query, limit = 10, supplier, threshold = 0.5 } = body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar chunks
    const results = await searchChunks(queryEmbedding, limit, supplier);

    // Filter by threshold and format response
    const filteredResults = results
      .filter((r) => r.similarity >= threshold)
      .map((r) => ({
        id: r.id,
        content: r.content,
        snippet: r.content.length > 200 ? r.content.substring(0, 200) + '...' : r.content,
        score: Math.round(r.similarity * 100),
        pageNumber: r.page_number,
        document: {
          id: r.document_id,
          filename: r.document_filename,
          supplier: r.document_supplier,
        },
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

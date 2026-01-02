import { searchChunks } from '../../lib/db/client';
import { generateEmbedding } from '../../lib/embeddings';

export const config = {
  runtime: 'edge',
};

interface SearchRequest {
  query: string;
  limit?: number;
  supplier?: string;
  threshold?: number;
}

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();
    const { query, limit = 10, supplier, threshold = 0.5 } = body;

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    return new Response(
      JSON.stringify({
        results: filteredResults,
        query,
        totalResults: filteredResults.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Search failed', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

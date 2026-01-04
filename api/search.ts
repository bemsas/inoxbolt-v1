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
    const { query, limit = 20, supplier, threshold = 0.4, productType, material, threadType } = body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Dynamic imports to avoid bundling issues
    const { generateEmbedding } = await import('../lib/embeddings.js');
    const { searchChunks: searchChunksVector } = await import('../lib/vector/client.js');
    const {
      classifyQuery,
      rerankResults,
      filterByExactStandard,
      getStandardSuggestions,
      QueryType
    } = await import('../lib/search-utils.js');

    // Step 1: Classify the query to determine search strategy
    const queryAnalysis = classifyQuery(query);
    console.log('Query analysis:', JSON.stringify(queryAnalysis));

    // Step 2: Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(query);

    // Step 3: Build filter based on query analysis
    const filters: Record<string, string | undefined> = {
      supplier,
      productType: productType || queryAnalysis.extractedProductType,
      material: material || queryAnalysis.extractedMaterial,
      threadType: threadType || queryAnalysis.extractedThread,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    // Step 4: Search using Upstash Vector
    // Fetch more results for reranking (3x requested limit)
    const vectorLimit = Math.min(limit * 3, 50);
    const results = await searchChunksVector(queryEmbedding, vectorLimit, filters);

    // Step 5: Apply lower threshold for hybrid search (we'll rerank anyway)
    const effectiveThreshold = queryAnalysis.requiresExactMatch ? 0.3 : threshold;
    const thresholdFiltered = results.filter((r) => r.score >= effectiveThreshold);

    // Step 6: Rerank results using hybrid scoring
    const reranked = rerankResults(
      thresholdFiltered.map(r => ({
        id: r.id,
        content: r.content,
        score: r.score,
        metadata: r.metadata
      })),
      queryAnalysis
    );

    // Step 7: Filter by exact standard if applicable
    const finalResults = filterByExactStandard(reranked, queryAnalysis);

    // Step 8: Take requested limit
    const limitedResults = finalResults.slice(0, limit);

    // Get unique document IDs to look up supplier info
    const documentIds = [...new Set(limitedResults.map((r) => r.metadata.documentId))];

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

    // Format response with hybrid scoring info
    const formattedResults = limitedResults.map((r) => ({
      id: r.id,
      content: r.content,
      snippet: r.content.length > 200 ? r.content.substring(0, 200) + '...' : r.content,
      score: r.hybridScore,
      vectorScore: Math.round(r.vectorScore * 100),
      exactMatch: r.exactStandardMatch,
      pageNumber: r.metadata.pageNumber,
      document: {
        id: r.metadata.documentId,
        filename: r.metadata.documentName,
        supplier: r.metadata.supplier || supplierMap.get(r.metadata.documentId) || null,
      },
      // Product metadata for filtering and display
      productType: r.metadata.productType,
      material: r.metadata.material,
      threadType: r.metadata.threadType,
      headType: r.metadata.headType,
      standard: r.metadata.standard,
      // Additional metadata
      dimensions: r.metadata.dimensions,
      finish: r.metadata.finish,
      priceInfo: r.metadata.priceInfo,
      packagingUnit: r.metadata.packagingUnit,
    }));

    // Get standard suggestions if searching for a standard
    let standardInfo = null;
    if (queryAnalysis.extractedStandard) {
      standardInfo = getStandardSuggestions(queryAnalysis.extractedStandard);
    }

    return res.status(200).json({
      results: formattedResults,
      query,
      totalResults: formattedResults.length,
      // Search metadata for debugging/UI
      searchInfo: {
        queryType: queryAnalysis.type,
        detectedStandard: queryAnalysis.extractedStandardDisplay,
        detectedThread: queryAnalysis.extractedThread,
        detectedMaterial: queryAnalysis.extractedMaterial,
        exactMatchRequired: queryAnalysis.requiresExactMatch,
        standardInfo,
        resultsBeforeRerank: thresholdFiltered.length,
        exactMatches: limitedResults.filter(r => r.exactStandardMatch).length,
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed', details: String(error) });
  }
}

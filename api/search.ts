import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * Search API Endpoint for B2B Fastener Platform
 * Uses hybrid search combining SQL exact matching with vector similarity
 * Implements Reciprocal Rank Fusion (RRF) for result scoring
 */

interface SearchRequest {
  query: string;
  limit?: number;
  supplier?: string;
  threshold?: number;
  productType?: string;
  material?: string;
  threadType?: string;
  includeEquivalents?: boolean;
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
    const {
      query,
      limit = 20,
      supplier,
      threshold = 0,
      productType,
      material,
      threadType,
      includeEquivalents = true,
    } = body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Import hybrid search system
    const { hybridSearch } = await import('../lib/hybrid-search.js');
    const { getStandardInfo } = await import('../lib/standard-equivalents.js');

    // Execute hybrid search
    const searchResponse = await hybridSearch(query, {
      limit,
      supplier,
      threshold,
      productType,
      material,
      threadType,
      includeEquivalents,
    });

    // Get unique document IDs to look up additional info
    const documentIds = Array.from(
      new Set(searchResponse.results.map((r) => r.documentId))
    );

    // Fetch supplier info from database for results missing supplier
    const supplierMap = new Map<string, string | null>();
    if (documentIds.length > 0) {
      try {
        const placeholders = documentIds.map((_, i) => `$${i + 1}`).join(', ');
        const result = await sql.query(
          `SELECT id, supplier FROM documents WHERE id IN (${placeholders})`,
          documentIds
        );
        for (const row of result.rows) {
          supplierMap.set(row.id, row.supplier);
        }
      } catch (dbError) {
        console.error('Failed to fetch supplier info:', dbError);
      }
    }

    // Get detailed standard info if a standard was detected
    let standardInfo = null;
    if (searchResponse.classification.detectedStandard) {
      const info = getStandardInfo(searchResponse.classification.detectedStandard);
      if (info) {
        standardInfo = {
          code: info.standard?.displayCode,
          description: info.standard?.description,
          productType: info.standard?.productType,
          equivalents: info.equivalents.map((e) => ({
            code: e.displayCode,
            description: e.description,
          })),
          similar: info.similar.map((s) => ({
            code: s.displayCode,
            description: s.description,
          })),
        };
      }
    }

    // Format response
    const formattedResults = searchResponse.results.map((r) => ({
      id: r.id,
      content: r.content,
      snippet:
        r.content.length > 200 ? r.content.substring(0, 200) + '...' : r.content,
      score: r.score,
      vectorScore: Math.round(r.vectorScore * 100),
      keywordScore: Math.round(r.keywordScore * 100),
      exactMatch: r.exactMatch,
      rank: r.rank,
      matchedOn: r.matchedOn,
      pageNumber: r.pageNumber,
      document: {
        id: r.documentId,
        filename: r.documentName,
        supplier: r.supplier || supplierMap.get(r.documentId) || null,
      },
      // Product metadata
      productType: r.productType,
      material: r.material,
      threadType: r.threadType,
      headType: r.headType,
      driveType: r.driveType,
      standard: r.standard,
      finish: r.finish,
    }));

    return res.status(200).json({
      results: formattedResults,
      query,
      totalResults: formattedResults.length,
      // Search classification and metadata
      searchInfo: {
        queryType: searchResponse.classification.queryType,
        detectedStandard: searchResponse.classification.detectedStandard,
        detectedThread: searchResponse.classification.detectedThread,
        detectedMaterial: searchResponse.classification.detectedMaterial,
        detectedCategory: searchResponse.classification.detectedCategory,
        confidence: searchResponse.classification.confidence,
        language: searchResponse.classification.language,
        standardInfo,
        // Performance metrics
        metrics: {
          sqlResults: searchResponse.searchMetrics.sqlResultCount,
          vectorResults: searchResponse.searchMetrics.vectorResultCount,
          fusedResults: searchResponse.searchMetrics.fusedResultCount,
          executionTimeMs: searchResponse.searchMetrics.executionTimeMs,
        },
        // Suggestions
        suggestions: searchResponse.suggestions,
        // Match summary
        exactMatches: formattedResults.filter((r) => r.exactMatch).length,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

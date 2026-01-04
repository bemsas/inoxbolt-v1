/**
 * Hybrid Search System for B2B Fastener Platform
 * Combines SQL exact matching with vector similarity using Reciprocal Rank Fusion (RRF)
 */

import { sql } from '@vercel/postgres';
import { generateEmbedding } from './embeddings.js';
import { searchChunks as searchVectorChunks } from './vector/client.js';
import {
  classifyQuery,
  QueryClassification,
  QueryType,
  buildSearchFilters,
  shouldUseExactMatch,
  shouldUseVectorSearch,
} from './query-classifier.js';
import {
  normalizeStandardCode,
  getEquivalentsFast,
  findStandard,
} from './standard-equivalents.js';

// =============================================================================
// TYPES
// =============================================================================

export interface HybridSearchOptions {
  limit?: number;
  supplier?: string;
  productType?: string;
  material?: string;
  threadType?: string;
  threshold?: number;        // Minimum score threshold (0-100)
  includeEquivalents?: boolean; // Include equivalent standard results
}

export interface SearchResultItem {
  id: string;
  content: string;
  score: number;              // Hybrid score (0-100)
  vectorScore: number;        // Vector similarity (0-1)
  keywordScore: number;       // Keyword/SQL match score (0-1)
  exactMatch: boolean;        // Exact standard match
  rank: number;               // Final rank position

  // Metadata
  documentId: string;
  documentName: string;
  supplier: string | null;
  pageNumber: number | null;

  // Product attributes
  standard?: string;
  threadType?: string;
  material?: string;
  productType?: string;
  headType?: string;
  driveType?: string;
  finish?: string;

  // Match details
  matchedOn: string[];        // What matched (standard, thread, material, etc.)
}

export interface HybridSearchResponse {
  results: SearchResultItem[];
  query: string;
  totalResults: number;
  classification: {
    queryType: QueryType;
    detectedStandard?: string;
    detectedThread?: string;
    detectedMaterial?: string;
    detectedCategory?: string;
    confidence: number;
    language: string;
  };
  searchMetrics: {
    sqlResultCount: number;
    vectorResultCount: number;
    fusedResultCount: number;
    executionTimeMs: number;
  };
  suggestions?: {
    equivalentStandards?: string[];
    relatedProducts?: string[];
  };
}

// =============================================================================
// RRF (RECIPROCAL RANK FUSION) CONSTANTS
// =============================================================================

const RRF_K = 60; // Constant for RRF formula (commonly 60)
const EXACT_MATCH_BOOST = 50; // Bonus points for exact standard match
const KEYWORD_WEIGHT = 0.4;   // Weight for keyword/SQL score
const VECTOR_WEIGHT = 0.4;    // Weight for vector similarity
const MATCH_BONUS_WEIGHT = 0.2; // Weight for match bonuses

// =============================================================================
// SQL-BASED EXACT SEARCH
// =============================================================================

interface SqlSearchResult {
  id: string;
  content: string;
  document_id: string;
  document_name: string;
  supplier: string | null;
  page_number: number | null;
  standard: string | null;
  thread_type: string | null;
  material: string | null;
  product_type: string | null;
  head_type: string | null;
  relevance_score: number;
}

async function sqlExactSearch(
  classification: QueryClassification,
  options: HybridSearchOptions
): Promise<SqlSearchResult[]> {
  const { extractedParams } = classification;
  const limit = options.limit || 20;

  // Build WHERE conditions
  const conditions: string[] = ["d.status = 'completed'"];
  const params: any[] = [];
  let paramIndex = 1;

  // Standard matching (with equivalents)
  if (extractedParams.standard) {
    const standards = [extractedParams.standard];
    if (options.includeEquivalents !== false) {
      const equivalents = getEquivalentsFast(extractedParams.standard);
      standards.push(...equivalents);
    }

    // Use ILIKE for case-insensitive matching with wildcards
    const standardConditions = standards.map((_, i) => {
      params.push(`%${standards[i]}%`);
      return `(c.content ILIKE $${paramIndex++} OR (c.metadata->>'standard')::text ILIKE $${paramIndex - 1})`;
    });
    conditions.push(`(${standardConditions.join(' OR ')})`);
  }

  // Thread matching
  if (extractedParams.thread) {
    params.push(`%${extractedParams.thread}%`);
    conditions.push(
      `(c.content ILIKE $${paramIndex++} OR (c.metadata->>'threadType')::text ILIKE $${paramIndex - 1})`
    );
  }

  // Material matching
  if (extractedParams.material) {
    params.push(`%${extractedParams.material}%`);
    conditions.push(
      `(c.content ILIKE $${paramIndex++} OR (c.metadata->>'material')::text ILIKE $${paramIndex - 1})`
    );
  }

  // Category/product type
  if (extractedParams.category || options.productType) {
    const cat = extractedParams.category || options.productType;
    params.push(`%${cat}%`);
    conditions.push(
      `((c.metadata->>'productType')::text ILIKE $${paramIndex++})`
    );
  }

  // Supplier filter
  if (options.supplier || extractedParams.supplier) {
    const sup = options.supplier || extractedParams.supplier;
    params.push(sup);
    conditions.push(`d.supplier = $${paramIndex++}`);
  }

  // Only proceed if we have actual search conditions
  if (conditions.length <= 1) {
    return [];
  }

  params.push(limit * 2); // Fetch more for reranking

  const queryText = `
    SELECT
      c.id,
      c.content,
      c.document_id,
      d.filename as document_name,
      d.supplier,
      c.page_number,
      (c.metadata->>'standard')::text as standard,
      (c.metadata->>'threadType')::text as thread_type,
      (c.metadata->>'material')::text as material,
      (c.metadata->>'productType')::text as product_type,
      (c.metadata->>'headType')::text as head_type,
      1.0 as relevance_score
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex}
  `;

  try {
    const result = await sql.query(queryText, params);
    return result.rows as SqlSearchResult[];
  } catch (error) {
    console.error('SQL search error:', error);
    return [];
  }
}

// =============================================================================
// VECTOR SIMILARITY SEARCH
// =============================================================================

interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: {
    documentId: string;
    documentName: string;
    supplier: string | null;
    pageNumber: number | null;
    standard?: string;
    threadType?: string;
    material?: string;
    productType?: string;
    headType?: string;
    [key: string]: any;
  };
}

async function vectorSimilaritySearch(
  query: string,
  options: HybridSearchOptions
): Promise<VectorSearchResult[]> {
  try {
    // Generate embedding for query
    const embedding = await generateEmbedding(query);

    // Build filters
    const filter: Record<string, string | undefined> = {};
    if (options.supplier) filter.supplier = options.supplier;
    if (options.productType) filter.productType = options.productType;
    if (options.material) filter.material = options.material;
    if (options.threadType) filter.threadType = options.threadType;

    // Remove undefined
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined) delete filter[key];
    });

    // Search with 3x limit for reranking
    const limit = (options.limit || 20) * 3;
    const results = await searchVectorChunks(
      embedding,
      limit,
      Object.keys(filter).length > 0 ? filter : undefined
    );

    return results.map(r => ({
      id: r.id,
      content: r.content,
      score: r.score,
      metadata: r.metadata,
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    return [];
  }
}

// =============================================================================
// KEYWORD SCORING
// =============================================================================

function calculateKeywordScore(
  content: string,
  metadata: Record<string, any>,
  classification: QueryClassification
): { score: number; matchedOn: string[] } {
  const { extractedParams } = classification;
  let score = 0;
  const matchedOn: string[] = [];
  const contentUpper = content.toUpperCase();

  // Standard matching (highest weight)
  if (extractedParams.standard) {
    const normalizedStandard = normalizeStandardCode(extractedParams.standard);
    const metaStandard = metadata.standard
      ? normalizeStandardCode(metadata.standard)
      : '';

    // Exact match in metadata
    if (metaStandard === normalizedStandard) {
      score += 0.5;
      matchedOn.push('standard');
    }
    // Equivalent match
    else {
      const equivalents = getEquivalentsFast(normalizedStandard);
      if (equivalents.includes(metaStandard)) {
        score += 0.35;
        matchedOn.push('equivalent_standard');
      }
    }

    // Also check content
    if (contentUpper.includes(normalizedStandard)) {
      score += 0.15;
      if (!matchedOn.includes('standard')) matchedOn.push('standard_content');
    }
  }

  // Thread matching
  if (extractedParams.thread) {
    const queryThread = extractedParams.thread.toUpperCase();
    const metaThread = (metadata.threadType || '').toUpperCase();

    if (metaThread === queryThread || metaThread.includes(queryThread)) {
      score += 0.15;
      matchedOn.push('thread');
    } else if (contentUpper.includes(queryThread)) {
      score += 0.1;
      matchedOn.push('thread_content');
    }
  }

  // Material matching
  if (extractedParams.material) {
    const queryMaterial = extractedParams.material.toUpperCase();
    const metaMaterial = (metadata.material || '').toUpperCase();

    if (metaMaterial === queryMaterial || metaMaterial.includes(queryMaterial)) {
      score += 0.1;
      matchedOn.push('material');
    }
  }

  // Product type matching
  if (extractedParams.category) {
    const queryCategory = extractedParams.category.toLowerCase();
    const metaType = (metadata.productType || '').toLowerCase();

    if (metaType === queryCategory || metaType.includes(queryCategory)) {
      score += 0.1;
      matchedOn.push('product_type');
    }
  }

  return {
    score: Math.min(1, score),
    matchedOn,
  };
}

// =============================================================================
// RECIPROCAL RANK FUSION (RRF)
// =============================================================================

interface FusionCandidate {
  id: string;
  content: string;
  sqlRank?: number;      // Rank from SQL results (1-based)
  vectorRank?: number;   // Rank from vector results (1-based)
  vectorScore: number;
  keywordScore: number;
  exactMatch: boolean;
  matchedOn: string[];
  metadata: Record<string, any>;
}

function computeRRFScore(
  sqlRank: number | undefined,
  vectorRank: number | undefined,
  keywordScore: number,
  exactMatch: boolean
): number {
  let rrfScore = 0;

  // RRF from SQL rank
  if (sqlRank !== undefined) {
    rrfScore += 1 / (RRF_K + sqlRank);
  }

  // RRF from vector rank
  if (vectorRank !== undefined) {
    rrfScore += 1 / (RRF_K + vectorRank);
  }

  // Normalize to 0-100 scale
  // Max possible RRF is 2 / (RRF_K + 1) when rank=1 in both
  const maxRRF = 2 / (RRF_K + 1);
  const normalizedRRF = (rrfScore / maxRRF) * 100;

  // Apply weights and bonuses
  let finalScore =
    normalizedRRF * 0.5 +
    keywordScore * 100 * KEYWORD_WEIGHT +
    (exactMatch ? EXACT_MATCH_BOOST : 0);

  return Math.min(100, Math.round(finalScore));
}

function fuseResults(
  sqlResults: SqlSearchResult[],
  vectorResults: VectorSearchResult[],
  classification: QueryClassification
): FusionCandidate[] {
  const candidateMap = new Map<string, FusionCandidate>();

  // Process SQL results
  sqlResults.forEach((result, index) => {
    const { score: keywordScore, matchedOn } = calculateKeywordScore(
      result.content,
      {
        standard: result.standard,
        threadType: result.thread_type,
        material: result.material,
        productType: result.product_type,
        headType: result.head_type,
      },
      classification
    );

    const exactMatch =
      classification.extractedParams.standard !== undefined &&
      result.standard !== null &&
      normalizeStandardCode(result.standard) ===
        normalizeStandardCode(classification.extractedParams.standard);

    candidateMap.set(result.id, {
      id: result.id,
      content: result.content,
      sqlRank: index + 1,
      vectorScore: 0,
      keywordScore,
      exactMatch,
      matchedOn,
      metadata: {
        documentId: result.document_id,
        documentName: result.document_name,
        supplier: result.supplier,
        pageNumber: result.page_number,
        standard: result.standard,
        threadType: result.thread_type,
        material: result.material,
        productType: result.product_type,
        headType: result.head_type,
      },
    });
  });

  // Process vector results
  vectorResults.forEach((result, index) => {
    const existing = candidateMap.get(result.id);

    const { score: keywordScore, matchedOn } = calculateKeywordScore(
      result.content,
      result.metadata,
      classification
    );

    const exactMatch =
      classification.extractedParams.standard !== undefined &&
      result.metadata.standard !== undefined &&
      normalizeStandardCode(result.metadata.standard) ===
        normalizeStandardCode(classification.extractedParams.standard);

    if (existing) {
      // Merge with existing
      existing.vectorRank = index + 1;
      existing.vectorScore = result.score;
      // Keep higher keyword score
      if (keywordScore > existing.keywordScore) {
        existing.keywordScore = keywordScore;
        existing.matchedOn = matchedOn;
      }
      existing.exactMatch = existing.exactMatch || exactMatch;
    } else {
      candidateMap.set(result.id, {
        id: result.id,
        content: result.content,
        vectorRank: index + 1,
        vectorScore: result.score,
        keywordScore,
        exactMatch,
        matchedOn,
        metadata: {
          documentId: result.metadata.documentId,
          documentName: result.metadata.documentName,
          supplier: result.metadata.supplier,
          pageNumber: result.metadata.pageNumber,
          standard: result.metadata.standard,
          threadType: result.metadata.threadType,
          material: result.metadata.material,
          productType: result.metadata.productType,
          headType: result.metadata.headType,
        },
      });
    }
  });

  return Array.from(candidateMap.values());
}

// =============================================================================
// MAIN HYBRID SEARCH FUNCTION
// =============================================================================

export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<HybridSearchResponse> {
  const startTime = Date.now();

  // Step 1: Classify the query
  const classification = classifyQuery(query);
  console.log('[HybridSearch] Classification:', JSON.stringify(classification));

  // Step 2: Determine search strategy
  const useExactMatch = shouldUseExactMatch(classification);
  const useVectorSearch = shouldUseVectorSearch(classification);

  // Step 3: Execute searches in parallel
  const [sqlResults, vectorResults] = await Promise.all([
    useExactMatch ? sqlExactSearch(classification, options) : Promise.resolve([]),
    useVectorSearch ? vectorSimilaritySearch(query, options) : Promise.resolve([]),
  ]);

  console.log(
    `[HybridSearch] SQL: ${sqlResults.length}, Vector: ${vectorResults.length}`
  );

  // Step 4: Fuse results using RRF
  const fusedCandidates = fuseResults(sqlResults, vectorResults, classification);

  // Step 5: Calculate final scores and sort
  const scoredResults = fusedCandidates.map((candidate) => {
    const hybridScore = computeRRFScore(
      candidate.sqlRank,
      candidate.vectorRank,
      candidate.keywordScore,
      candidate.exactMatch
    );

    return {
      ...candidate,
      score: hybridScore,
    };
  });

  // Sort by score, with exact matches first for standard searches
  scoredResults.sort((a, b) => {
    if (classification.requiresExactMatch) {
      if (a.exactMatch && !b.exactMatch) return -1;
      if (!a.exactMatch && b.exactMatch) return 1;
    }
    return b.score - a.score;
  });

  // Step 6: Apply threshold and limit
  const threshold = options.threshold || 0;
  const limit = options.limit || 20;

  const filteredResults = scoredResults
    .filter((r) => r.score >= threshold)
    .slice(0, limit);

  // Step 7: Format results
  const results: SearchResultItem[] = filteredResults.map((r, index) => ({
    id: r.id,
    content: r.content,
    score: r.score,
    vectorScore: r.vectorScore,
    keywordScore: r.keywordScore,
    exactMatch: r.exactMatch,
    rank: index + 1,
    documentId: r.metadata.documentId,
    documentName: r.metadata.documentName,
    supplier: r.metadata.supplier,
    pageNumber: r.metadata.pageNumber,
    standard: r.metadata.standard,
    threadType: r.metadata.threadType,
    material: r.metadata.material,
    productType: r.metadata.productType,
    headType: r.metadata.headType,
    driveType: r.metadata.driveType,
    finish: r.metadata.finish,
    matchedOn: r.matchedOn,
  }));

  // Step 8: Build suggestions
  let suggestions: HybridSearchResponse['suggestions'];
  if (classification.extractedParams.standard) {
    const equivalents = getEquivalentsFast(classification.extractedParams.standard);
    if (equivalents.length > 0) {
      suggestions = {
        equivalentStandards: equivalents,
      };
    }
  }

  const executionTimeMs = Date.now() - startTime;

  return {
    results,
    query,
    totalResults: results.length,
    classification: {
      queryType: classification.queryType,
      detectedStandard: classification.extractedParams.standardDisplay,
      detectedThread: classification.extractedParams.thread,
      detectedMaterial: classification.extractedParams.material,
      detectedCategory: classification.extractedParams.category,
      confidence: classification.confidence,
      language: classification.detectedLanguage,
    },
    searchMetrics: {
      sqlResultCount: sqlResults.length,
      vectorResultCount: vectorResults.length,
      fusedResultCount: fusedCandidates.length,
      executionTimeMs,
    },
    suggestions,
  };
}

// =============================================================================
// SIMPLIFIED SEARCH FUNCTION (backward compatible)
// =============================================================================

export async function search(
  query: string,
  limit: number = 20,
  supplier?: string
): Promise<SearchResultItem[]> {
  const response = await hybridSearch(query, { limit, supplier });
  return response.results;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { classifyQuery, QueryType, QueryClassification } from './query-classifier.js';

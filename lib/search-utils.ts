/**
 * Hybrid Search Utilities for B2B Fastener Search
 * Implements 2025 best practices: query classification, exact-match priority,
 * hybrid scoring (keyword + vector), and multi-factor reranking.
 */

/**
 * Query classification types for routing search strategy
 */
export enum QueryType {
  STANDARD_CODE = 'standard_code',      // "DIN 933", "ISO 4017"
  THREAD_SPEC = 'thread_spec',          // "M8x40", "M10"
  MATERIAL_SPEC = 'material_spec',      // "A2-70", "stainless steel"
  PRODUCT_TYPE = 'product_type',        // "hexagon bolt", "socket screw"
  SUPPLIER_NAME = 'supplier_name',      // "REYHER", "WURTH"
  MIXED = 'mixed',                      // Combination query
  GENERAL = 'general'                   // Free-form search
}

export interface QueryAnalysis {
  type: QueryType;
  extractedStandard?: string;           // Normalized: "DIN933" (no space)
  extractedStandardDisplay?: string;    // Display: "DIN 933"
  extractedThread?: string;             // "M8", "M8X40"
  extractedMaterial?: string;           // "A2", "8.8"
  extractedProductType?: string;        // "bolt", "nut"
  extractedSupplier?: string;           // "reyher"
  confidence: number;                   // 0-1
  requiresExactMatch: boolean;          // True for standard codes
}

/**
 * DIN/ISO standard equivalencies and relationships
 * Used for smart suggestions and cross-referencing
 */
export const STANDARD_RELATIONSHIPS: Record<string, {
  equivalent?: string[];
  similar?: string[];
  productType: string;
  description: string;
}> = {
  'DIN933': {
    equivalent: ['ISO4017'],
    similar: ['DIN931', 'ISO4014'],
    productType: 'hex_bolt',
    description: 'Hexagon head bolt, full thread'
  },
  'DIN931': {
    equivalent: ['ISO4014'],
    similar: ['DIN933', 'ISO4017'],
    productType: 'hex_bolt',
    description: 'Hexagon head bolt, partial thread'
  },
  'DIN912': {
    equivalent: ['ISO4762'],
    productType: 'socket_cap_screw',
    description: 'Socket head cap screw'
  },
  'DIN934': {
    equivalent: ['ISO4032', 'ISO4033'],
    productType: 'hex_nut',
    description: 'Hexagon nut'
  },
  'DIN985': {
    equivalent: ['ISO10511', 'ISO7040'],
    productType: 'lock_nut',
    description: 'Nyloc lock nut'
  },
  'DIN125': {
    equivalent: ['ISO7089', 'ISO7090'],
    productType: 'flat_washer',
    description: 'Flat washer'
  },
  'DIN127': {
    equivalent: ['ISO7091'],
    productType: 'spring_washer',
    description: 'Spring lock washer'
  },
  'DIN7991': {
    equivalent: ['ISO10642'],
    productType: 'countersunk_screw',
    description: 'Countersunk socket head cap screw'
  },
  'ISO4017': {
    equivalent: ['DIN933'],
    similar: ['ISO4014', 'DIN931'],
    productType: 'hex_bolt',
    description: 'Hexagon head bolt, full thread'
  },
  'ISO4014': {
    equivalent: ['DIN931'],
    similar: ['ISO4017', 'DIN933'],
    productType: 'hex_bolt',
    description: 'Hexagon head bolt, partial thread'
  },
  'ISO4762': {
    equivalent: ['DIN912'],
    productType: 'socket_cap_screw',
    description: 'Socket head cap screw'
  },
  'ISO7380': {
    productType: 'button_head_screw',
    description: 'Button head socket cap screw'
  },
  'ISO8765': {
    similar: ['DIN933', 'DIN931'],
    productType: 'hex_bolt',
    description: 'Hexagon head bolt, fine pitch'
  },
  'DIN916': {
    equivalent: ['ISO4029'],
    productType: 'set_screw',
    description: 'Socket set screw, cup point'
  },
  'DIN3568': {
    productType: 'pipe_clamp',
    description: 'Heavy pipe clamp'
  },
  'DIN741': {
    productType: 'wire_rope_clip',
    description: 'Wire rope clip'
  },
};

/**
 * Normalize a standard code for comparison
 * "DIN 933" -> "DIN933", "din933" -> "DIN933"
 */
export function normalizeStandard(standard: string): string {
  return standard.toUpperCase().replace(/\s+/g, '').trim();
}

/**
 * Extract standard code from query
 */
export function extractStandardFromQuery(query: string): { normalized: string; display: string } | null {
  // Match DIN, ISO, EN, ANSI standards with numbers
  const patterns = [
    /\b(DIN)\s*(\d+[A-Z]?)\b/i,
    /\b(ISO)\s*(\d+[A-Z]?)\b/i,
    /\b(EN)\s*(\d+[A-Z]?)\b/i,
    /\b(ANSI)\s*([A-Z]*\d+[A-Z]*)\b/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const prefix = match[1].toUpperCase();
      const number = match[2].toUpperCase();
      return {
        normalized: `${prefix}${number}`,
        display: `${prefix} ${number}`
      };
    }
  }
  return null;
}

/**
 * Extract thread specification from query
 */
export function extractThreadFromQuery(query: string): string | null {
  // Match M8, M8x40, M8X40, M 8 x 40
  const match = query.match(/\bM\s*(\d{1,2}(?:\.\d+)?)\s*(?:x\s*(\d+(?:\.\d+)?))?\b/i);
  if (match) {
    const diameter = match[1];
    const length = match[2];
    return length ? `M${diameter}X${length}` : `M${diameter}`;
  }
  return null;
}

/**
 * Extract material code from query
 */
export function extractMaterialFromQuery(query: string): string | null {
  const patterns: [RegExp, string][] = [
    [/\b(A2-\d+|A2)\b/i, 'A2'],
    [/\b(A4-\d+|A4)\b/i, 'A4'],
    [/\b304\b/i, 'A2'],
    [/\b316\b/i, 'A4'],
    [/\b8\.8\b/, '8.8'],
    [/\b10\.9\b/, '10.9'],
    [/\b12\.9\b/, '12.9'],
    [/\bbrass\b/i, 'brass'],
    [/\bzinc\b/i, 'zinc'],
    [/\bstainless\b/i, 'stainless'],
  ];

  for (const [pattern, material] of patterns) {
    if (pattern.test(query)) {
      return material;
    }
  }
  return null;
}

/**
 * Extract product type from query
 */
export function extractProductTypeFromQuery(query: string): string | null {
  const patterns: [RegExp, string][] = [
    [/\b(hex(?:agon)?\s*bolt|perno\s*hex)\b/i, 'bolt'],
    [/\b(socket\s*(?:cap)?\s*screw|allen\s*screw)\b/i, 'screw'],
    [/\b(hex(?:agon)?\s*nut|tuerca)\b/i, 'nut'],
    [/\b(flat\s*washer|arandela)\b/i, 'washer'],
    [/\b(spring\s*washer|lock\s*washer)\b/i, 'washer'],
    [/\bbolt\b/i, 'bolt'],
    [/\bscrew\b/i, 'screw'],
    [/\bnut\b/i, 'nut'],
    [/\bwasher\b/i, 'washer'],
    [/\bstud\b/i, 'stud'],
  ];

  for (const [pattern, type] of patterns) {
    if (pattern.test(query)) {
      return type;
    }
  }
  return null;
}

/**
 * Extract supplier name from query
 */
export function extractSupplierFromQuery(query: string): string | null {
  const suppliers = ['reyher', 'wurth', 'wuerth', 'bossard', 'fabory', 'hilti', 'fischer'];
  const lower = query.toLowerCase();

  for (const supplier of suppliers) {
    if (lower.includes(supplier)) {
      return supplier === 'wuerth' ? 'wurth' : supplier;
    }
  }
  return null;
}

/**
 * Classify the query to determine search strategy
 */
export function classifyQuery(query: string): QueryAnalysis {
  const trimmed = query.trim();

  // Extract all components
  const standard = extractStandardFromQuery(trimmed);
  const thread = extractThreadFromQuery(trimmed);
  const material = extractMaterialFromQuery(trimmed);
  const productType = extractProductTypeFromQuery(trimmed);
  const supplier = extractSupplierFromQuery(trimmed);

  // Determine primary type
  let type = QueryType.GENERAL;
  let confidence = 0.5;
  let requiresExactMatch = false;

  // Pure standard code search (highest priority)
  const isAlmostPureStandard = standard &&
    trimmed.replace(/\b(DIN|ISO|EN|ANSI)\s*\d+[A-Z]?\b/gi, '').trim().length < 10;

  if (isAlmostPureStandard) {
    type = QueryType.STANDARD_CODE;
    confidence = 0.95;
    requiresExactMatch = true;
  }
  // Thread specification search
  else if (thread && !standard && !productType) {
    type = QueryType.THREAD_SPEC;
    confidence = 0.8;
  }
  // Material search
  else if (material && !standard && !thread) {
    type = QueryType.MATERIAL_SPEC;
    confidence = 0.7;
  }
  // Product type search
  else if (productType && !standard) {
    type = QueryType.PRODUCT_TYPE;
    confidence = 0.7;
  }
  // Supplier search
  else if (supplier && !standard && !thread && !productType) {
    type = QueryType.SUPPLIER_NAME;
    confidence = 0.8;
  }
  // Mixed query (standard + other attributes)
  else if (standard && (thread || material || productType)) {
    type = QueryType.MIXED;
    confidence = 0.85;
    requiresExactMatch = true; // Standard should still be exact
  }

  return {
    type,
    extractedStandard: standard?.normalized,
    extractedStandardDisplay: standard?.display,
    extractedThread: thread || undefined,
    extractedMaterial: material || undefined,
    extractedProductType: productType || undefined,
    extractedSupplier: supplier || undefined,
    confidence,
    requiresExactMatch
  };
}

/**
 * Search result with scoring breakdown
 */
export interface ScoredResult {
  id: string;
  content: string;
  vectorScore: number;          // Original vector similarity 0-1
  keywordScore: number;         // Keyword/exact match score 0-1
  hybridScore: number;          // Combined score 0-100
  exactStandardMatch: boolean;  // Did standard match exactly?
  metadata: Record<string, any>;
  boosts: {
    standardMatch: number;
    threadMatch: number;
    materialMatch: number;
    supplierMatch: number;
  };
}

/**
 * Calculate keyword score based on metadata matches
 */
export function calculateKeywordScore(
  result: { metadata: Record<string, any>; content: string },
  analysis: QueryAnalysis
): { score: number; exactStandardMatch: boolean; boosts: ScoredResult['boosts'] } {
  let score = 0;
  let exactStandardMatch = false;
  const boosts = {
    standardMatch: 0,
    threadMatch: 0,
    materialMatch: 0,
    supplierMatch: 0,
  };

  const meta = result.metadata;

  // Standard matching (highest weight for B2B)
  if (analysis.extractedStandard && meta.standard) {
    const resultStandard = normalizeStandard(meta.standard);
    const queryStandard = analysis.extractedStandard;

    if (resultStandard === queryStandard) {
      // Exact match - maximum boost
      score += 0.5;
      boosts.standardMatch = 0.5;
      exactStandardMatch = true;
    } else {
      // Check if it's an equivalent standard
      const relationships = STANDARD_RELATIONSHIPS[queryStandard];
      if (relationships?.equivalent?.some(eq => normalizeStandard(eq) === resultStandard)) {
        score += 0.35;
        boosts.standardMatch = 0.35;
      }
      // Check if it's a similar (but different) standard - small penalty
      else if (relationships?.similar?.some(sim => normalizeStandard(sim) === resultStandard)) {
        score -= 0.1; // Penalize similar but wrong standards
        boosts.standardMatch = -0.1;
      }
    }
  }

  // Also check content for standard mentions
  if (analysis.extractedStandardDisplay && !exactStandardMatch) {
    const contentUpper = result.content.toUpperCase();
    if (contentUpper.includes(analysis.extractedStandard!)) {
      score += 0.2;
      boosts.standardMatch = Math.max(boosts.standardMatch, 0.2);
      exactStandardMatch = true;
    }
  }

  // Thread matching
  if (analysis.extractedThread && meta.threadType) {
    const resultThread = meta.threadType.toUpperCase().replace(/\s/g, '');
    const queryThread = analysis.extractedThread.toUpperCase();

    if (resultThread === queryThread || resultThread.startsWith(queryThread)) {
      score += 0.15;
      boosts.threadMatch = 0.15;
    }
  }

  // Material matching
  if (analysis.extractedMaterial && meta.material) {
    const resultMaterial = meta.material.toLowerCase();
    const queryMaterial = analysis.extractedMaterial.toLowerCase();

    if (resultMaterial === queryMaterial || resultMaterial.includes(queryMaterial)) {
      score += 0.1;
      boosts.materialMatch = 0.1;
    }
  }

  // Supplier matching
  if (analysis.extractedSupplier && meta.supplier) {
    const resultSupplier = meta.supplier.toLowerCase();
    const querySupplier = analysis.extractedSupplier.toLowerCase();

    if (resultSupplier === querySupplier || resultSupplier.includes(querySupplier)) {
      score += 0.1;
      boosts.supplierMatch = 0.1;
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    exactStandardMatch,
    boosts
  };
}

/**
 * Hybrid scoring configuration
 */
export interface HybridScoringConfig {
  vectorWeight: number;     // Weight for vector similarity (0-1)
  keywordWeight: number;    // Weight for keyword matching (0-1)
  exactMatchBoost: number;  // Bonus for exact standard match (0-1)
  penaltyWrongStandard: number; // Penalty for similar but wrong standard
}

const DEFAULT_CONFIG: HybridScoringConfig = {
  vectorWeight: 0.4,
  keywordWeight: 0.4,
  exactMatchBoost: 0.2,
  penaltyWrongStandard: 0.15
};

/**
 * Calculate hybrid score combining vector and keyword scores
 * Based on RRF (Reciprocal Rank Fusion) principles
 */
export function calculateHybridScore(
  vectorScore: number,
  keywordScore: number,
  exactStandardMatch: boolean,
  analysis: QueryAnalysis,
  config: HybridScoringConfig = DEFAULT_CONFIG
): number {
  let score = 0;

  // For standard code searches, heavily prioritize exact matches
  if (analysis.type === QueryType.STANDARD_CODE || analysis.requiresExactMatch) {
    if (exactStandardMatch) {
      // Exact match: keyword score dominates
      score = (config.keywordWeight + config.exactMatchBoost) * keywordScore * 100 +
              config.vectorWeight * vectorScore * 100;
    } else {
      // No exact match: penalize heavily
      score = config.vectorWeight * vectorScore * 100 * 0.5 +
              config.keywordWeight * keywordScore * 100;
    }
  } else {
    // General search: balanced scoring
    score = config.vectorWeight * vectorScore * 100 +
            config.keywordWeight * keywordScore * 100;

    if (exactStandardMatch) {
      score += config.exactMatchBoost * 100;
    }
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Rerank search results using hybrid scoring
 */
export function rerankResults(
  results: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>,
  analysis: QueryAnalysis,
  config?: HybridScoringConfig
): ScoredResult[] {
  const scoredResults: ScoredResult[] = results.map(result => {
    const { score: keywordScore, exactStandardMatch, boosts } =
      calculateKeywordScore(result, analysis);

    const hybridScore = calculateHybridScore(
      result.score,
      keywordScore,
      exactStandardMatch,
      analysis,
      config
    );

    return {
      id: result.id,
      content: result.content,
      vectorScore: result.score,
      keywordScore,
      hybridScore,
      exactStandardMatch,
      metadata: result.metadata,
      boosts
    };
  });

  // Sort by hybrid score descending
  scoredResults.sort((a, b) => {
    // For standard searches, exact matches ALWAYS come first
    if (analysis.requiresExactMatch) {
      if (a.exactStandardMatch && !b.exactStandardMatch) return -1;
      if (!a.exactStandardMatch && b.exactStandardMatch) return 1;
    }
    return b.hybridScore - a.hybridScore;
  });

  return scoredResults;
}

/**
 * Filter results to only show exact standard matches when appropriate
 */
export function filterByExactStandard(
  results: ScoredResult[],
  analysis: QueryAnalysis
): ScoredResult[] {
  // Only filter for standard code searches
  if (analysis.type !== QueryType.STANDARD_CODE || !analysis.requiresExactMatch) {
    return results;
  }

  const exactMatches = results.filter(r => r.exactStandardMatch);

  // If we have exact matches, only return those
  if (exactMatches.length >= 3) {
    return exactMatches;
  }

  // If few exact matches, include them first, then top semantic results
  const nonExact = results.filter(r => !r.exactStandardMatch).slice(0, 5);
  return [...exactMatches, ...nonExact];
}

/**
 * Get suggestions for related/equivalent standards
 */
export function getStandardSuggestions(standard: string): {
  equivalent: string[];
  similar: string[];
  description: string;
} | null {
  const normalized = normalizeStandard(standard);
  const info = STANDARD_RELATIONSHIPS[normalized];

  if (!info) return null;

  return {
    equivalent: info.equivalent || [],
    similar: info.similar || [],
    description: info.description
  };
}

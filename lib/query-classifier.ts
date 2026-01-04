/**
 * Query Classification System for B2B Fastener Search
 * Classifies search queries and extracts structured parameters
 */

import {
  findStandard,
  normalizeStandardCode,
  formatStandardForDisplay,
  getEquivalentsFast,
} from './standard-equivalents.js';

// =============================================================================
// QUERY TYPES
// =============================================================================

export enum QueryType {
  STANDARD_CODE = 'STANDARD_CODE',       // "DIN 933", "ISO 4017"
  THREAD_SPEC = 'THREAD_SPEC',           // "M8x40", "M10"
  MATERIAL_SPEC = 'MATERIAL_SPEC',       // "A2-70", "stainless steel"
  PRODUCT_TYPE = 'PRODUCT_TYPE',         // "hexagon bolt", "socket screw"
  NATURAL_LANGUAGE = 'NATURAL_LANGUAGE', // "bolts for outdoor use"
  MIXED = 'MIXED',                       // Combination (e.g., "DIN 933 M8 A2")
}

// =============================================================================
// EXTRACTED PARAMETERS
// =============================================================================

export interface ExtractedParams {
  // Standard codes
  standard?: string;              // Normalized: "DIN933"
  standardDisplay?: string;       // Display: "DIN 933"
  equivalentStandards?: string[]; // Related standards

  // Thread specification
  thread?: string;                // "M8" or "M8X40"
  threadDiameter?: number;        // 8
  threadPitch?: number;           // 1.25 (for fine)
  threadLength?: number;          // 40

  // Material
  material?: string;              // "A2-70", "8.8"
  materialBase?: string;          // "stainless", "steel"

  // Category/product type
  category?: string;              // "bolt", "nut", "washer"

  // Head/drive
  headType?: string;              // "hex", "socket"
  driveType?: string;             // "allen", "phillips"

  // Surface finish
  finish?: string;                // "zinc", "plain"

  // Supplier
  supplier?: string;              // "reyher", "wurth"
}

// =============================================================================
// CLASSIFICATION RESULT
// =============================================================================

export interface QueryClassification {
  queryType: QueryType;
  extractedParams: ExtractedParams;
  confidence: number;             // 0-1
  requiresExactMatch: boolean;    // True for standard codes
  normalizedQuery: string;        // Cleaned up query
  tokens: string[];               // Query split into tokens
  detectedLanguage: 'en' | 'es' | 'mixed';
}

// =============================================================================
// REGEX PATTERNS
// =============================================================================

const PATTERNS = {
  // DIN/ISO/EN standards with number
  standard: /\b(DIN|ISO|EN|ANSI|BS|UNI|NF)\s*(\d+[A-Z]?(?:-\d+)?)\b/gi,

  // Thread specifications: M6, M8x40, M10x1.25x50
  thread: /\bM(\d{1,2}(?:\.\d+)?)(x(\d+(?:\.\d+)?))?(?:x(\d+(?:\.\d+)?))?\b/gi,

  // Material grades
  materialStainless: /\b(A[24](?:-\d+)?|304|316|18\/8|1\.4301|1\.4401|1\.4404)\b/gi,
  materialSteel: /\b((?:clase\s*)?\d{1,2}\.\d{1,2})\b/gi,  // 8.8, 10.9, 12.9
  materialKeyword: /\b(stainless|inox(?:idable)?|acero|steel|brass|lat[o|ó]n|aluminum|aluminio|nylon|titanium|titanio|zinc(?:ado)?|galvanizado)\b/gi,

  // Product types (English)
  productTypeEn: /\b(hex(?:agon)?\s*bolt|socket\s*(?:cap\s*)?screw|hex(?:agon)?\s*nut|flat\s*washer|spring\s*washer|lock\s*(?:nut|washer)|threaded\s*rod|set\s*screw|machine\s*screw|cap\s*screw|stud|anchor|rivet|pin|insert|countersunk|button\s*head)\b/gi,

  // Product types (Spanish)
  productTypeEs: /\b(perno|tornillo|tuerca|arandela|varilla\s*roscada|taco|remache|pasador|inserto|avellanado|cabeza\s*allen|cabeza\s*hexagonal)\b/gi,

  // Generic product types
  productGeneric: /\b(bolt|screw|nut|washer|rod|anchor|rivet|pin)\b/gi,

  // Head types
  headType: /\b(hex(?:agonal)?|socket|allen|countersunk|flat\s*head|pan\s*head|button\s*head|cheese|flange|round|truss|dome)\b/gi,

  // Drive types
  driveType: /\b(phillips|slotted|torx|pozidri?v|robertson|security|hex|allen)\b/gi,

  // Surface finish
  finish: /\b(plain|zinc(?:\s*plat(?:ed|ing))?|galvanized|hot[\s-]?dip|phosphat(?:e|ed)|black\s*oxide|nickel|chrome|dacromet|geomet|cadmium|passivat(?:e|ed))\b/gi,

  // Suppliers
  supplier: /\b(reyher|w[uü]rth|bossard|fabory|hilti|fischer|spaenaur|mcmaster|fastenal|grainger)\b/gi,
};

// =============================================================================
// CATEGORY MAPPING
// =============================================================================

const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  // English
  'bolt': 'bolt',
  'hex bolt': 'bolt',
  'hexagon bolt': 'bolt',
  'socket screw': 'screw',
  'socket cap screw': 'screw',
  'cap screw': 'screw',
  'machine screw': 'screw',
  'set screw': 'screw',
  'countersunk': 'screw',
  'button head': 'screw',
  'screw': 'screw',
  'nut': 'nut',
  'hex nut': 'nut',
  'hexagon nut': 'nut',
  'lock nut': 'nut',
  'washer': 'washer',
  'flat washer': 'washer',
  'spring washer': 'washer',
  'lock washer': 'washer',
  'threaded rod': 'threaded_rod',
  'stud': 'threaded_rod',
  'anchor': 'anchor',
  'rivet': 'rivet',
  'pin': 'pin',
  'insert': 'insert',

  // Spanish
  'perno': 'bolt',
  'tornillo': 'screw',
  'tuerca': 'nut',
  'arandela': 'washer',
  'varilla roscada': 'threaded_rod',
  'taco': 'anchor',
  'remache': 'rivet',
  'pasador': 'pin',
  'inserto': 'insert',
  'cabeza allen': 'screw',
  'cabeza hexagonal': 'bolt',
  'avellanado': 'screw',
};

// =============================================================================
// MATERIAL NORMALIZATION
// =============================================================================

function normalizeMaterial(raw: string): { grade?: string; base?: string } {
  const upper = raw.toUpperCase().replace(/[\s-]/g, '');

  // Stainless grades
  if (/^A2(?:70)?$|^304$|^18\/8$|^1\.4301$/.test(upper)) {
    return { grade: 'A2-70', base: 'stainless' };
  }
  if (/^A250$/.test(upper)) {
    return { grade: 'A2-50', base: 'stainless' };
  }
  if (/^A4(?:70)?$|^316$|^1\.4401$/.test(upper)) {
    return { grade: 'A4-70', base: 'stainless' };
  }
  if (/^A480$|^316TI$|^1\.4404$/.test(upper)) {
    return { grade: 'A4-80', base: 'stainless' };
  }

  // Steel grades
  if (/^(?:CLASE)?4\.?8$/.test(upper)) {
    return { grade: '4.8', base: 'steel' };
  }
  if (/^(?:CLASE)?8\.?8$/.test(upper)) {
    return { grade: '8.8', base: 'steel' };
  }
  if (/^(?:CLASE)?10\.?9$/.test(upper)) {
    return { grade: '10.9', base: 'steel' };
  }
  if (/^(?:CLASE)?12\.?9$/.test(upper)) {
    return { grade: '12.9', base: 'steel' };
  }

  // Keyword-based
  const lower = raw.toLowerCase();
  if (/stainless|inox/.test(lower)) {
    return { base: 'stainless' };
  }
  if (/steel|acero/.test(lower)) {
    return { base: 'steel' };
  }
  if (/brass|lat[oó]n/.test(lower)) {
    return { grade: 'brass', base: 'brass' };
  }
  if (/aluminum|aluminio/.test(lower)) {
    return { grade: 'aluminum', base: 'aluminum' };
  }
  if (/nylon/.test(lower)) {
    return { grade: 'nylon', base: 'nylon' };
  }
  if (/titan/.test(lower)) {
    return { grade: 'titanium', base: 'titanium' };
  }

  return {};
}

// =============================================================================
// HEAD TYPE NORMALIZATION
// =============================================================================

function normalizeHeadType(raw: string): string | undefined {
  const lower = raw.toLowerCase();

  if (/hex(?:agonal)?/.test(lower)) return 'hex';
  if (/socket|allen/.test(lower)) return 'socket';
  if (/countersunk|flat\s*head|csk/.test(lower)) return 'countersunk';
  if (/pan/.test(lower)) return 'pan';
  if (/button/.test(lower)) return 'button';
  if (/cheese/.test(lower)) return 'cheese';
  if (/flange/.test(lower)) return 'flange';
  if (/dome|cap/.test(lower)) return 'dome';
  if (/round/.test(lower)) return 'round';
  if (/truss/.test(lower)) return 'truss';

  return undefined;
}

// =============================================================================
// DRIVE TYPE NORMALIZATION
// =============================================================================

function normalizeDriveType(raw: string): string | undefined {
  const lower = raw.toLowerCase();

  if (/phillips/.test(lower)) return 'phillips';
  if (/slotted/.test(lower)) return 'slotted';
  if (/torx/.test(lower)) return 'torx';
  if (/pozidri?v/.test(lower)) return 'pozidriv';
  if (/robertson/.test(lower)) return 'robertson';
  if (/allen|hex/.test(lower)) return 'allen';
  if (/security/.test(lower)) return 'security';

  return undefined;
}

// =============================================================================
// FINISH NORMALIZATION
// =============================================================================

function normalizeFinish(raw: string): string | undefined {
  const lower = raw.toLowerCase();

  if (/^plain$/.test(lower)) return 'plain';
  if (/zinc/.test(lower)) return 'zinc';
  if (/galvanized|hot[\s-]?dip/.test(lower)) return 'hot_dip';
  if (/phosphat/.test(lower)) return 'phosphate';
  if (/black\s*oxide/.test(lower)) return 'black_oxide';
  if (/nickel/.test(lower)) return 'nickel';
  if (/chrome/.test(lower)) return 'chrome';
  if (/dacromet/.test(lower)) return 'dacromet';
  if (/geomet/.test(lower)) return 'geomet';
  if (/cadmium/.test(lower)) return 'cadmium';
  if (/passivat/.test(lower)) return 'passivated';

  return undefined;
}

// =============================================================================
// LANGUAGE DETECTION
// =============================================================================

function detectLanguage(query: string): 'en' | 'es' | 'mixed' {
  const spanishWords = /\b(tornillo|tuerca|arandela|perno|varilla|inoxidable|acero|lat[oó]n|aluminio|galvanizado|avellanado|hexagonal)\b/i;
  const englishWords = /\b(bolt|screw|nut|washer|stainless|steel|brass|aluminum|galvanized|countersunk|hexagon)\b/i;

  const hasSpanish = spanishWords.test(query);
  const hasEnglish = englishWords.test(query);

  if (hasSpanish && hasEnglish) return 'mixed';
  if (hasSpanish) return 'es';
  return 'en';
}

// =============================================================================
// MAIN CLASSIFICATION FUNCTION
// =============================================================================

/**
 * Classify a search query and extract structured parameters
 */
export function classifyQuery(query: string): QueryClassification {
  const trimmed = query.trim();
  const tokens = trimmed.split(/\s+/);
  const normalizedQuery = trimmed.toLowerCase();
  const detectedLanguage = detectLanguage(trimmed);

  const extractedParams: ExtractedParams = {};
  let confidence = 0.5;
  let requiresExactMatch = false;

  // ==========================================================================
  // EXTRACT STANDARD CODES
  // ==========================================================================
  const standardMatches = Array.from(trimmed.matchAll(PATTERNS.standard));
  if (standardMatches.length > 0) {
    const match = standardMatches[0];
    const prefix = match[1].toUpperCase();
    const number = match[2].toUpperCase();
    const normalized = `${prefix}${number}`;

    extractedParams.standard = normalized;
    extractedParams.standardDisplay = formatStandardForDisplay(normalized);

    // Look up equivalent standards
    const equivalents = getEquivalentsFast(normalized);
    if (equivalents.length > 0) {
      extractedParams.equivalentStandards = equivalents;
    }

    // Infer category from standard
    const standardInfo = findStandard(normalized);
    if (standardInfo) {
      extractedParams.category = standardInfo.productType;
    }

    confidence = 0.9;
    requiresExactMatch = true;
  }

  // ==========================================================================
  // EXTRACT THREAD SPECIFICATION
  // ==========================================================================
  const threadMatches = Array.from(trimmed.matchAll(PATTERNS.thread));
  if (threadMatches.length > 0) {
    const match = threadMatches[0];
    const diameter = parseFloat(match[1]);
    let pitch: number | undefined;
    let length: number | undefined;

    // Parse second and third numbers
    if (match[3] && match[4]) {
      // M10x1.25x50 format
      pitch = parseFloat(match[3]);
      length = parseFloat(match[4]);
    } else if (match[3]) {
      // M8x40 or M10x1.25
      const secondNum = parseFloat(match[3]);
      // If <= 3, likely fine pitch; otherwise length
      if (secondNum <= 3 && secondNum < diameter / 3) {
        pitch = secondNum;
      } else {
        length = secondNum;
      }
    }

    extractedParams.threadDiameter = diameter;
    extractedParams.thread = length
      ? `M${diameter}X${length}`
      : `M${diameter}`;

    if (pitch) extractedParams.threadPitch = pitch;
    if (length) extractedParams.threadLength = length;

    confidence = Math.max(confidence, 0.8);
  }

  // ==========================================================================
  // EXTRACT MATERIAL
  // ==========================================================================
  // Check stainless patterns first
  const stainlessMatches = Array.from(trimmed.matchAll(PATTERNS.materialStainless));
  if (stainlessMatches.length > 0) {
    const { grade, base } = normalizeMaterial(stainlessMatches[0][0]);
    if (grade) extractedParams.material = grade;
    if (base) extractedParams.materialBase = base;
    confidence = Math.max(confidence, 0.7);
  }

  // Check steel grades
  const steelMatches = Array.from(trimmed.matchAll(PATTERNS.materialSteel));
  if (steelMatches.length > 0 && !extractedParams.material) {
    const { grade, base } = normalizeMaterial(steelMatches[0][0]);
    if (grade) extractedParams.material = grade;
    if (base) extractedParams.materialBase = base;
    confidence = Math.max(confidence, 0.7);
  }

  // Check material keywords
  const materialKeywordMatches = Array.from(trimmed.matchAll(PATTERNS.materialKeyword));
  if (materialKeywordMatches.length > 0 && !extractedParams.materialBase) {
    const { grade, base } = normalizeMaterial(materialKeywordMatches[0][0]);
    if (grade && !extractedParams.material) extractedParams.material = grade;
    if (base) extractedParams.materialBase = base;
  }

  // ==========================================================================
  // EXTRACT PRODUCT TYPE / CATEGORY
  // ==========================================================================
  if (!extractedParams.category) {
    // Check English patterns
    const productEnMatches = Array.from(trimmed.matchAll(PATTERNS.productTypeEn));
    if (productEnMatches.length > 0) {
      const matched = productEnMatches[0][0].toLowerCase();
      extractedParams.category = PRODUCT_CATEGORY_MAP[matched] || matched;
      confidence = Math.max(confidence, 0.7);
    }

    // Check Spanish patterns
    const productEsMatches = Array.from(trimmed.matchAll(PATTERNS.productTypeEs));
    if (productEsMatches.length > 0) {
      const matched = productEsMatches[0][0].toLowerCase();
      extractedParams.category = PRODUCT_CATEGORY_MAP[matched] || matched;
      confidence = Math.max(confidence, 0.7);
    }

    // Check generic patterns
    const genericMatches = Array.from(trimmed.matchAll(PATTERNS.productGeneric));
    if (genericMatches.length > 0 && !extractedParams.category) {
      const matched = genericMatches[0][0].toLowerCase();
      extractedParams.category = PRODUCT_CATEGORY_MAP[matched] || matched;
      confidence = Math.max(confidence, 0.6);
    }
  }

  // ==========================================================================
  // EXTRACT HEAD TYPE
  // ==========================================================================
  const headMatches = Array.from(trimmed.matchAll(PATTERNS.headType));
  if (headMatches.length > 0) {
    extractedParams.headType = normalizeHeadType(headMatches[0][0]);
  }

  // ==========================================================================
  // EXTRACT DRIVE TYPE
  // ==========================================================================
  const driveMatches = Array.from(trimmed.matchAll(PATTERNS.driveType));
  if (driveMatches.length > 0) {
    extractedParams.driveType = normalizeDriveType(driveMatches[0][0]);
  }

  // ==========================================================================
  // EXTRACT FINISH
  // ==========================================================================
  const finishMatches = Array.from(trimmed.matchAll(PATTERNS.finish));
  if (finishMatches.length > 0) {
    extractedParams.finish = normalizeFinish(finishMatches[0][0]);
  }

  // ==========================================================================
  // EXTRACT SUPPLIER
  // ==========================================================================
  const supplierMatches = Array.from(trimmed.matchAll(PATTERNS.supplier));
  if (supplierMatches.length > 0) {
    let supplier = supplierMatches[0][0].toLowerCase();
    // Normalize wurth variations
    if (supplier === 'wuerth' || supplier === 'würth') {
      supplier = 'wurth';
    }
    extractedParams.supplier = supplier;
  }

  // ==========================================================================
  // DETERMINE QUERY TYPE
  // ==========================================================================
  let queryType = QueryType.NATURAL_LANGUAGE;
  const paramsCount = Object.keys(extractedParams).filter(
    k => extractedParams[k as keyof ExtractedParams] !== undefined
  ).length;

  // Pure standard search
  const remainingAfterStandard = trimmed
    .replace(PATTERNS.standard, '')
    .trim()
    .length;

  if (extractedParams.standard && remainingAfterStandard < 10) {
    queryType = QueryType.STANDARD_CODE;
    confidence = 0.95;
    requiresExactMatch = true;
  }
  // Thread spec only
  else if (
    extractedParams.thread &&
    !extractedParams.standard &&
    !extractedParams.category &&
    paramsCount <= 2
  ) {
    queryType = QueryType.THREAD_SPEC;
    confidence = 0.8;
  }
  // Material spec only
  else if (
    extractedParams.material &&
    !extractedParams.standard &&
    !extractedParams.thread &&
    paramsCount <= 2
  ) {
    queryType = QueryType.MATERIAL_SPEC;
    confidence = 0.7;
  }
  // Product type only
  else if (
    extractedParams.category &&
    !extractedParams.standard &&
    !extractedParams.thread &&
    paramsCount <= 2
  ) {
    queryType = QueryType.PRODUCT_TYPE;
    confidence = 0.7;
  }
  // Multiple parameters = mixed query
  else if (paramsCount >= 2) {
    queryType = QueryType.MIXED;
    confidence = 0.85;
    // Mixed queries with standard should still require exact match
    if (extractedParams.standard) {
      requiresExactMatch = true;
    }
  }

  return {
    queryType,
    extractedParams,
    confidence,
    requiresExactMatch,
    normalizedQuery,
    tokens,
    detectedLanguage,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build a filter object for database/vector search from extracted params
 */
export function buildSearchFilters(
  params: ExtractedParams
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  if (params.category) filters.productType = params.category;
  if (params.material) filters.material = params.material;
  if (params.thread) filters.threadType = params.thread;
  if (params.standard) filters.standard = params.standard;
  if (params.supplier) filters.supplier = params.supplier;
  if (params.headType) filters.headType = params.headType;
  if (params.finish) filters.finish = params.finish;

  // Remove undefined
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) delete filters[key];
  });

  return filters;
}

/**
 * Generate search keywords from extracted params
 */
export function generateSearchKeywords(params: ExtractedParams): string[] {
  const keywords: string[] = [];

  if (params.standard) {
    keywords.push(params.standard);
    keywords.push(params.standardDisplay || params.standard);
  }
  if (params.equivalentStandards) {
    keywords.push(...params.equivalentStandards);
  }
  if (params.thread) keywords.push(params.thread);
  if (params.material) keywords.push(params.material);
  if (params.category) keywords.push(params.category);
  if (params.headType) keywords.push(params.headType);
  if (params.driveType) keywords.push(params.driveType);
  if (params.finish) keywords.push(params.finish);

  return Array.from(new Set(keywords));
}

/**
 * Determine if query should use SQL exact matching
 */
export function shouldUseExactMatch(classification: QueryClassification): boolean {
  return (
    classification.requiresExactMatch ||
    classification.queryType === QueryType.STANDARD_CODE ||
    (classification.queryType === QueryType.MIXED &&
      classification.extractedParams.standard !== undefined)
  );
}

/**
 * Determine if query should use vector/semantic search
 */
export function shouldUseVectorSearch(classification: QueryClassification): boolean {
  return (
    classification.queryType === QueryType.NATURAL_LANGUAGE ||
    classification.queryType === QueryType.PRODUCT_TYPE ||
    classification.confidence < 0.7
  );
}

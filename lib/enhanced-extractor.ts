/**
 * Enhanced Product Extractor (Vercel Serverless Compatible)
 * Uses advanced regex patterns and LLM for structured extraction without canvas
 */

import OpenAI from 'openai';
import type {
  StructuredProduct,
  ExtractedTable,
  FastenerCategory,
  MaterialGrade,
  ProductDimensions,
  PricingInfo,
} from './product-schema.js';
import {
  detectCategoryFromStandard,
  normalizeMaterialGrade,
  parseThreadSpec,
  generateProductName,
} from './product-schema.js';

// =============================================================================
// FASTENER CATALOG PATTERNS (Comprehensive 2025)
// =============================================================================

/**
 * Standard code patterns for fasteners
 */
const STANDARD_PATTERNS = {
  // DIN standards
  din: /\b(DIN)\s*(\d{2,5})(?:\s*-\s*(\d+))?\b/gi,
  // ISO standards
  iso: /\b(ISO)\s*(\d{4,5})(?:\s*-\s*(\d+))?\b/gi,
  // EN standards
  en: /\b(EN)\s*(\d{4,5})(?:\s*-\s*(\d+))?\b/gi,
  // ANSI standards
  ansi: /\b(ANSI)\s*([A-Z]?\d+(?:\.\d+)?)\b/gi,
};

/**
 * Thread specification patterns
 */
const THREAD_PATTERNS = {
  // Metric: M8, M8x30, M10x50, M12x1.5x80 (fine pitch)
  metric: /\bM(\d{1,2}(?:[.,]\d)?)\s*(?:x\s*(\d{1,3}(?:[.,]\d)?))?\s*(?:x\s*(\d{1,3}(?:[.,]\d)?))?\b/gi,
  // UNC: 1/4-20, 3/8-16
  unc: /\b(\d\/\d{1,2})\s*-\s*(\d{1,2})\s*UNC\b/gi,
  // UNF: 1/4-28, 3/8-24
  unf: /\b(\d\/\d{1,2})\s*-\s*(\d{1,2})\s*UNF\b/gi,
};

/**
 * Material patterns with variations
 */
const MATERIAL_PATTERNS = {
  // Stainless grades
  stainless: /\b(A[24](?:-[47]0)?|304|316(?:L|Ti)?|18[\/-]?8|V2A|V4A|1\.4301|1\.4401|1\.4404)\b/gi,
  // Steel grades
  steel: /\b([48]\.8|10\.9|12\.9|(?:class|grade|cl\.?)\s*[48]\.8|(?:class|grade|cl\.?)\s*10\.9|(?:class|grade|cl\.?)\s*12\.9)\b/gi,
  // Other materials
  other: /\b(brass|bronze|copper|aluminum|alu|titanium|nylon|PA|PE|PEEK|zinc|galvanized|verzinkt|phosphate|black oxide|plain)\b/gi,
};

/**
 * Price patterns for various formats
 */
const PRICE_PATTERNS = {
  // EUR format: 25,50 EUR or €25.50 or 25.50€
  eur: /(?:€|EUR)\s*([\d.,]+)|([\d.,]+)\s*(?:€|EUR)/gi,
  // With quantity: 100 St. 25,50 or S100 25.50
  withQty: /(?:S|VPE|PKG|Pack)?(\d{2,4})\s*(?:St\.?|Stk\.?|pcs|pieces)?\s*([\d.,]+)\s*(?:€|EUR)?/gi,
  // Price per 100/1000: /100 25.50 or per 100 25,50
  per100: /(?:\/|per)\s*(100|1000)\s*([\d.,]+)/gi,
};

/**
 * Head type patterns
 */
const HEAD_TYPE_PATTERNS = {
  hex: /\b(hex(?:agon)?|sechskant|6-?kant|6kt)\b/gi,
  socket: /\b(socket|zylinder(?:kopf)?|inbus|allen)\b/gi,
  pan: /\b(pan|linsenkopf|linsen|lens)\b/gi,
  countersunk: /\b(countersunk|flat|senkkopf|senk|csk|90°)\b/gi,
  button: /\b(button|flachkopf|halbrund|dome)\b/gi,
  flange: /\b(flange|flansch|collar)\b/gi,
};

// =============================================================================
// EXTRACTION FUNCTIONS
// =============================================================================

interface ExtractedProductData {
  standard?: string;
  threadSpec: string;
  material?: MaterialGrade;
  category?: FastenerCategory;
  headType?: string;
  pricing?: PricingInfo;
  rawLine: string;
  confidence: number;
}

/**
 * Extract all products from a text block
 */
export function extractProductsFromTextBlock(
  text: string,
  documentId: string,
  pageNumber: number,
  supplier?: string
): StructuredProduct[] {
  const products: StructuredProduct[] = [];
  const lines = text.split('\n');

  // Track current context (standard, material) across lines
  let currentStandard: string | undefined;
  let currentMaterial: MaterialGrade | undefined;
  let currentCategory: FastenerCategory | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 3) continue;

    // Check for standard header (updates context)
    const standardMatch = findStandard(line);
    if (standardMatch) {
      currentStandard = standardMatch;
      currentCategory = detectCategoryFromStandard(standardMatch);
    }

    // Check for material header
    const materialMatch = findMaterial(line);
    if (materialMatch && !findThread(line)) {
      // Material-only line, update context
      currentMaterial = materialMatch;
      continue;
    }

    // Try to extract product from line
    const extracted = extractProductFromLine(line, {
      contextStandard: currentStandard,
      contextMaterial: currentMaterial,
      contextCategory: currentCategory,
    });

    if (extracted) {
      const threadParsed = parseThreadSpec(extracted.threadSpec);

      const product: StructuredProduct = {
        id: `${documentId}-p${pageNumber}-${products.length}`,
        category: extracted.category || currentCategory || 'other',
        standard: extracted.standard || currentStandard,
        name: generateProductName({
          standard: extracted.standard || currentStandard,
          category: extracted.category || currentCategory,
          threadSpec: extracted.threadSpec,
          material: extracted.material || currentMaterial,
        }),
        threadSpec: extracted.threadSpec,
        dimensions: {
          threadDiameter: threadParsed?.diameter,
          length: threadParsed?.length,
        },
        headType: extracted.headType as any,
        material: extracted.material || currentMaterial || 'other',
        pricing: extracted.pricing,
        supplier,
        sourcePage: pageNumber,
        rawContent: extracted.rawLine,
        confidence: {
          overall: extracted.confidence,
          dimensions: threadParsed ? 0.95 : 0.5,
          material: extracted.material ? 0.9 : 0.4,
          pricing: extracted.pricing ? 0.85 : 0.2,
        },
      };

      products.push(product);
    }
  }

  return products;
}

/**
 * Extract product data from a single line
 */
function extractProductFromLine(
  line: string,
  context: {
    contextStandard?: string;
    contextMaterial?: MaterialGrade;
    contextCategory?: FastenerCategory;
  }
): ExtractedProductData | null {
  // Must have a thread specification
  const thread = findThread(line);
  if (!thread) return null;

  // Find other attributes
  const standard = findStandard(line);
  const material = findMaterial(line);
  const headType = findHeadType(line);
  const pricing = findPricing(line);

  // Calculate confidence based on what we found
  let confidence = 0.5; // Base for having thread
  if (standard) confidence += 0.15;
  if (material) confidence += 0.15;
  if (pricing) confidence += 0.15;
  if (headType) confidence += 0.05;

  // Determine category
  let category: FastenerCategory | undefined;
  if (standard) {
    category = detectCategoryFromStandard(standard);
  } else if (context.contextCategory) {
    category = context.contextCategory;
  }

  return {
    standard,
    threadSpec: thread,
    material: material || context.contextMaterial,
    category,
    headType,
    pricing,
    rawLine: line,
    confidence: Math.min(confidence, 0.95),
  };
}

// =============================================================================
// PATTERN MATCHING HELPERS
// =============================================================================

function findStandard(text: string): string | undefined {
  for (const [, pattern] of Object.entries(STANDARD_PATTERNS)) {
    const match = pattern.exec(text);
    pattern.lastIndex = 0; // Reset regex
    if (match) {
      return `${match[1].toUpperCase()} ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
  }
  return undefined;
}

function findThread(text: string): string | undefined {
  // Try metric first (most common)
  const metricPattern = /\bM(\d{1,2}(?:[.,]\d)?)\s*(?:x\s*(\d{1,3}(?:[.,]\d)?))?/i;
  const match = text.match(metricPattern);

  if (match) {
    const diameter = match[1].replace(',', '.');
    const length = match[2]?.replace(',', '.');
    return length ? `M${diameter}x${length}` : `M${diameter}`;
  }

  return undefined;
}

function findMaterial(text: string): MaterialGrade | undefined {
  // Check stainless first
  const stainlessMatch = text.match(MATERIAL_PATTERNS.stainless);
  if (stainlessMatch) {
    return normalizeMaterialGrade(stainlessMatch[0]);
  }

  // Check steel grades
  const steelMatch = text.match(MATERIAL_PATTERNS.steel);
  if (steelMatch) {
    return normalizeMaterialGrade(steelMatch[0]);
  }

  // Check other materials
  const otherMatch = text.match(MATERIAL_PATTERNS.other);
  if (otherMatch) {
    return normalizeMaterialGrade(otherMatch[0]);
  }

  return undefined;
}

function findHeadType(text: string): string | undefined {
  for (const [type, pattern] of Object.entries(HEAD_TYPE_PATTERNS)) {
    if (pattern.test(text)) {
      pattern.lastIndex = 0;
      return type;
    }
  }
  return undefined;
}

function findPricing(text: string): PricingInfo | undefined {
  // Try price with quantity first
  const qtyPattern = /(?:S|VPE|PKG)?(\d{2,4})\s*(?:St\.?|Stk\.?|pcs)?\s*([\d]+[.,][\d]{2})/i;
  const qtyMatch = text.match(qtyPattern);

  if (qtyMatch) {
    const qty = parseInt(qtyMatch[1], 10);
    const price = parseFloat(qtyMatch[2].replace(',', '.'));

    if (!isNaN(qty) && !isNaN(price) && qty > 0) {
      return {
        boxQuantity: qty,
        boxPrice: price,
        unitPrice: price / qty,
        currency: 'EUR',
      };
    }
  }

  // Try standalone price
  const pricePattern = /([\d]+[.,][\d]{2})\s*(?:€|EUR)/i;
  const priceMatch = text.match(pricePattern);

  if (priceMatch) {
    const price = parseFloat(priceMatch[1].replace(',', '.'));
    if (!isNaN(price)) {
      return {
        boxPrice: price,
        currency: 'EUR',
      };
    }
  }

  return undefined;
}

// =============================================================================
// TABLE DETECTION AND EXTRACTION
// =============================================================================

interface TableStructure {
  headerRow: number;
  columns: string[];
  dataRows: string[][];
  standard?: string;
}

/**
 * Detect and parse tables from text
 */
export function extractTablesFromText(text: string): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  const lines = text.split('\n');

  // Look for table-like structures (rows with consistent delimiters)
  const potentialTables = findTableBlocks(lines);

  for (const block of potentialTables) {
    const table = parseTableBlock(block.lines, block.startLine);
    if (table && table.rows.length > 0) {
      tables.push(table);
    }
  }

  return tables;
}

function findTableBlocks(lines: string[]): Array<{ lines: string[]; startLine: number }> {
  const blocks: Array<{ lines: string[]; startLine: number }> = [];
  let currentBlock: string[] = [];
  let blockStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line looks like table data (has numbers and consistent spacing)
    const hasTableCharacteristics =
      (line.includes('\t') || /\s{2,}/.test(line)) &&
      /\d/.test(line) &&
      line.length > 10;

    if (hasTableCharacteristics) {
      if (currentBlock.length === 0) {
        blockStart = i;
      }
      currentBlock.push(line);
    } else {
      if (currentBlock.length >= 3) {
        blocks.push({ lines: currentBlock, startLine: blockStart });
      }
      currentBlock = [];
    }
  }

  // Don't forget last block
  if (currentBlock.length >= 3) {
    blocks.push({ lines: currentBlock, startLine: blockStart });
  }

  return blocks;
}

function parseTableBlock(lines: string[], startLine: number): ExtractedTable | null {
  if (lines.length < 2) return null;

  // Detect delimiter (tab or multiple spaces)
  const delimiter = lines[0].includes('\t') ? '\t' : /\s{2,}/;

  // Parse all rows
  const rows = lines.map(line => line.split(delimiter).map(cell => cell.trim()).filter(Boolean));

  // Validate consistency
  const colCounts = rows.map(r => r.length);
  const mostCommonCols = mode(colCounts);
  const consistentRows = rows.filter(r => r.length === mostCommonCols);

  if (consistentRows.length < 2) return null;

  // Detect header (first row with text-heavy cells)
  const firstRow = consistentRows[0];
  const isHeader = firstRow.filter(cell => /^[a-zA-Z]/.test(cell)).length > firstRow.length / 2;

  let columns: Array<{ name: string; type: 'thread' | 'dimension' | 'material' | 'price' | 'quantity' | 'code' | 'text' }>;
  let dataRows: Array<Record<string, string | number>>;

  if (isHeader) {
    columns = firstRow.map(name => ({
      name,
      type: detectColumnType(name),
    }));
    dataRows = consistentRows.slice(1).map(row =>
      Object.fromEntries(columns.map((col, i) => [col.name, row[i] || '']))
    );
  } else {
    // Generate column names
    columns = firstRow.map((_, i) => ({
      name: `Column ${i + 1}`,
      type: detectColumnType(firstRow[i] || ''),
    }));
    dataRows = consistentRows.map(row =>
      Object.fromEntries(columns.map((col, i) => [col.name, row[i] || '']))
    );
  }

  // Look for standard in nearby lines
  const contextLines = lines.slice(0, 3).join(' ');
  const standard = findStandard(contextLines);

  return {
    id: `table-${startLine}`,
    pageNumber: 1,
    title: standard || 'Data Table',
    standard,
    columns,
    rows: dataRows,
    confidence: 0.7,
  };
}

function detectColumnType(header: string): 'thread' | 'dimension' | 'material' | 'price' | 'quantity' | 'code' | 'text' {
  const lower = header.toLowerCase();

  if (/thread|size|gewinde|m\d/i.test(lower)) return 'thread';
  if (/length|l[äa]nge|mm|dimension/i.test(lower)) return 'dimension';
  if (/material|werkstoff|grade/i.test(lower)) return 'material';
  if (/price|preis|€|eur/i.test(lower)) return 'price';
  if (/qty|quantity|pack|vpe|st[üu]ck|pcs/i.test(lower)) return 'quantity';
  if (/art|code|no\.?|nummer/i.test(lower)) return 'code';

  return 'text';
}

function mode(arr: number[]): number {
  const counts = new Map<number, number>();
  for (const n of arr) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  let maxCount = 0;
  let maxVal = arr[0];
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxVal = val;
    }
  }
  return maxVal;
}

// =============================================================================
// LLM-ASSISTED EXTRACTION (for complex cases)
// =============================================================================

const LLM_EXTRACTION_PROMPT = `Extract structured product data from this fastener catalog text.

Return JSON with this structure:
{
  "products": [
    {
      "standard": "DIN 933",
      "threadSpec": "M8x30",
      "material": "A2-70",
      "category": "bolt",
      "headType": "hex",
      "boxQuantity": 100,
      "boxPrice": 25.50
    }
  ]
}

RULES:
- threadSpec must be format M{diameter}x{length} (e.g., M8x30)
- material should be normalized: A2, A4, 8.8, 10.9, 12.9
- category: bolt, screw, nut, washer, anchor, rivet, pin, threaded_rod, insert, other
- Extract ALL products, not just examples

TEXT:
`;

/**
 * Use LLM to extract products from complex text
 */
export async function extractWithLLM(
  text: string,
  documentId: string,
  pageNumber: number,
  supplier?: string
): Promise<StructuredProduct[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, skipping LLM extraction');
    return [];
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Truncate text if too long
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) + '...' : text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective for extraction
      temperature: 0.1,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: LLM_EXTRACTION_PROMPT + truncatedText,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';

    // Parse JSON
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    const rawProducts = parsed.products || [];

    // Convert to StructuredProduct
    return rawProducts.map((raw: any, idx: number) => {
      const threadParsed = raw.threadSpec ? parseThreadSpec(raw.threadSpec) : null;

      const product: StructuredProduct = {
        id: `${documentId}-llm-p${pageNumber}-${idx}`,
        category: raw.category || detectCategoryFromStandard(raw.standard || '') || 'other',
        standard: raw.standard,
        name: generateProductName({
          standard: raw.standard,
          category: raw.category,
          threadSpec: raw.threadSpec,
          material: raw.material,
        }),
        threadSpec: raw.threadSpec || '',
        dimensions: {
          threadDiameter: threadParsed?.diameter,
          length: threadParsed?.length,
        },
        headType: raw.headType,
        material: raw.material ? normalizeMaterialGrade(raw.material) : 'other',
        pricing: raw.boxPrice ? {
          boxPrice: raw.boxPrice,
          boxQuantity: raw.boxQuantity,
          unitPrice: raw.boxQuantity ? raw.boxPrice / raw.boxQuantity : undefined,
          currency: 'EUR',
        } : undefined,
        supplier,
        sourcePage: pageNumber,
        confidence: {
          overall: 0.8,
          dimensions: threadParsed ? 0.9 : 0.5,
          material: raw.material ? 0.85 : 0.4,
          pricing: raw.boxPrice ? 0.85 : 0.2,
        },
      };

      return product;
    });
  } catch (error) {
    console.error('LLM extraction failed:', error);
    return [];
  }
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

export interface EnhancedExtractionResult {
  products: StructuredProduct[];
  tables: ExtractedTable[];
  processingTimeMs: number;
  extractionMethods: string[];
  confidence: number;
}

/**
 * Enhanced extraction combining multiple methods
 */
export async function enhancedExtract(
  text: string,
  documentId: string,
  pageNumber: number,
  supplier?: string,
  options: { useLLM?: boolean } = {}
): Promise<EnhancedExtractionResult> {
  const startTime = Date.now();
  const methods: string[] = [];

  // 1. Pattern-based extraction
  const patternProducts = extractProductsFromTextBlock(text, documentId, pageNumber, supplier);
  methods.push('pattern');

  // 2. Table extraction
  const tables = extractTablesFromText(text);
  methods.push('table');

  // 3. LLM extraction for remaining text (if enabled and few pattern results)
  let llmProducts: StructuredProduct[] = [];
  if (options.useLLM && patternProducts.length < 5) {
    llmProducts = await extractWithLLM(text, documentId, pageNumber, supplier);
    if (llmProducts.length > 0) {
      methods.push('llm');
    }
  }

  // Merge and deduplicate
  const allProducts = [...patternProducts, ...llmProducts];
  const seen = new Set<string>();
  const dedupedProducts = allProducts.filter(p => {
    const key = `${p.standard}-${p.threadSpec}-${p.material}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Calculate overall confidence
  const avgConfidence = dedupedProducts.length > 0
    ? dedupedProducts.reduce((s, p) => s + p.confidence.overall, 0) / dedupedProducts.length
    : 0;

  return {
    products: dedupedProducts,
    tables,
    processingTimeMs: Date.now() - startTime,
    extractionMethods: methods,
    confidence: avgConfidence,
  };
}

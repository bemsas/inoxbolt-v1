import { sql } from '@vercel/postgres';
import {
  ChunkMetadata,
  ParsedProduct,
  fixEncoding,
  extractProductDescription,
  extractAllThreadSizes,
  extractPriceRange,
  extractKeywords,
  extractProductMetadata,
} from './document-processor-utils';

// Re-export for external use
export type { ChunkMetadata, ParsedProduct };

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

const CONFIG = {
  // RAG Best Practices 2025: Use 512 tokens (~2000 chars) with 10-20% overlap
  CHUNK_SIZE: 2000,
  CHUNK_OVERLAP: 400, // 20% overlap for context continuity
  EMBEDDING_BATCH_SIZE: 50,
  VECTOR_UPSERT_BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function createLogger(documentId: string) {
  const log = (level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { documentId, ...context },
    };

    const formatted = `[${entry.timestamp}] [${level.toUpperCase()}] [doc:${documentId}] ${message}`;

    switch (level) {
      case 'error':
        console.error(formatted, context || '');
        break;
      case 'warn':
        console.warn(formatted, context || '');
        break;
      case 'debug':
        if (process.env.DEBUG) console.log(formatted, context || '');
        break;
      default:
        console.log(formatted, context || '');
    }

    return entry;
  };

  return {
    debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
    info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
    warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
  };
}

// =============================================================================
// SUPPLIER DETECTION
// =============================================================================

const SUPPLIER_PATTERNS: Record<string, RegExp> = {
  'reyher': /reyher/i,
  'wurth': /w[uü]rth|wuerth/i,
  'bossard': /bossard/i,
  'fabory': /fabory/i,
  'hilti': /hilti/i,
  'fischer': /fischer/i,
  'klimas': /klimas|wkret/i,
  'fastenal': /fastenal/i,
  'mcmaster': /mcmaster|mcmaster-carr/i,
  'grainger': /grainger/i,
};

export function detectSupplierFromFilename(filename: string): string | null {
  const normalizedName = filename.toLowerCase();

  for (const [supplier, pattern] of Object.entries(SUPPLIER_PATTERNS)) {
    if (pattern.test(normalizedName)) {
      return supplier;
    }
  }

  return null;
}

// =============================================================================
// SUPPLIER-SPECIFIC PRODUCT LINE PARSERS
// =============================================================================

interface SupplierParser {
  name: string;
  patterns: RegExp[];
  parse: (line: string) => ParsedProduct | null;
}

/**
 * REYHER Format Parser
 * Handles formats like: "M 8x40S100270,00" or "M8x40 S100 270,00"
 */
const reyherParser: SupplierParser = {
  name: 'reyher',
  patterns: [
    // Format: M8x40 S100 270,00 (with spaces)
    /M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+S\s*(\d+)\s+([\d.,]+)/i,
    // Format: M8x40S100270,00 (compact - need to split S and price)
    /M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*S(\d{2,3})(\d+[.,]\d{2})/i,
  ],
  parse: (line: string): ParsedProduct | null => {
    for (const pattern of reyherParser.patterns) {
      const match = line.match(pattern);
      if (match) {
        const diameter = match[1].replace(',', '.');
        const length = parseFloat(match[2].replace(',', '.'));
        const packagingQty = parseInt(match[3], 10);
        const price = parseFloat(match[4].replace(',', '.'));

        // Extract material if present at end of line
        const materialMatch = line.match(/\b(brass|zinc|stainless|A[24]|8\.8|10\.9|12\.9)\s*$/i);

        return {
          thread: `M${diameter}x${length}`,
          length,
          packagingCode: `S${packagingQty}`,
          packagingQty,
          price,
          material: materialMatch?.[1]?.toLowerCase(),
        };
      }
    }
    return null;
  },
};

/**
 * WURTH Format Parser
 * Handles formats like: "0890 108 040 | M8x40 | 100 St | 12.50 EUR"
 */
const wurthParser: SupplierParser = {
  name: 'wurth',
  patterns: [
    // Format with article number: 0890 108 040 | M8x40 | 100 St | 12.50 EUR
    /(\d{4}\s*\d{3}\s*\d{3})\s*\|?\s*M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*\|?\s*(\d+)\s*(?:St|Stk|pcs)?\s*\|?\s*([\d.,]+)\s*(?:EUR|€)?/i,
    // Simpler format: M8x40 100 12.50
    /M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+(\d+)\s*(?:St|Stk|pcs)?\s+([\d.,]+)/i,
  ],
  parse: (line: string): ParsedProduct | null => {
    // Try pattern with article number first
    const fullMatch = line.match(wurthParser.patterns[0]);
    if (fullMatch) {
      const diameter = fullMatch[2].replace(',', '.');
      const length = parseFloat(fullMatch[3].replace(',', '.'));
      const packagingQty = parseInt(fullMatch[4], 10);
      const price = parseFloat(fullMatch[5].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: fullMatch[1].replace(/\s/g, ''),
        packagingQty,
        price,
      };
    }

    // Try simpler pattern
    const simpleMatch = line.match(wurthParser.patterns[1]);
    if (simpleMatch) {
      const diameter = simpleMatch[1].replace(',', '.');
      const length = parseFloat(simpleMatch[2].replace(',', '.'));
      const packagingQty = parseInt(simpleMatch[3], 10);
      const price = parseFloat(simpleMatch[4].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: `PKG${packagingQty}`,
        packagingQty,
        price,
      };
    }
    return null;
  },
};

/**
 * BOSSARD Format Parser
 * Handles formats like: "BN 20181 M8x40 A2-70 100 25.40"
 */
const bossardParser: SupplierParser = {
  name: 'bossard',
  patterns: [
    // Format: BN 20181 M8x40 A2-70 100 25.40
    /BN\s*(\d+)\s+M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+(A[24](?:-\d+)?|8\.8|10\.9|12\.9)?\s*(\d+)\s+([\d.,]+)/i,
    // Format without BN: M8x40 A2 100pcs 25.40
    /M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+(A[24](?:-\d+)?|8\.8|10\.9|12\.9)\s*(\d+)\s*(?:pcs|St)?\s*([\d.,]+)/i,
  ],
  parse: (line: string): ParsedProduct | null => {
    const bnMatch = line.match(bossardParser.patterns[0]);
    if (bnMatch) {
      const diameter = bnMatch[2].replace(',', '.');
      const length = parseFloat(bnMatch[3].replace(',', '.'));
      const material = bnMatch[4]?.toUpperCase();
      const packagingQty = parseInt(bnMatch[5], 10);
      const price = parseFloat(bnMatch[6].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: `BN${bnMatch[1]}`,
        packagingQty,
        price,
        material: material?.toLowerCase(),
      };
    }

    const simpleMatch = line.match(bossardParser.patterns[1]);
    if (simpleMatch) {
      const diameter = simpleMatch[1].replace(',', '.');
      const length = parseFloat(simpleMatch[2].replace(',', '.'));
      const material = simpleMatch[3]?.toUpperCase();
      const packagingQty = parseInt(simpleMatch[4], 10);
      const price = parseFloat(simpleMatch[5].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: `PKG${packagingQty}`,
        packagingQty,
        price,
        material: material?.toLowerCase(),
      };
    }
    return null;
  },
};

/**
 * Generic DIN/ISO Format Parser
 * Handles standard formats like: "DIN 931 M8x40 8.8 verzinkt 100 15.00"
 */
const genericParser: SupplierParser = {
  name: 'generic',
  patterns: [
    // DIN/ISO with material and finish: DIN 931 M8x40 8.8 verzinkt 100 15.00
    /(DIN|ISO|EN)\s*(\d+)\s+M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+([A-Za-z0-9.-]+)\s*(?:[A-Za-z]+)?\s*(\d+)\s+([\d.,]+)/i,
    // Basic thread format: M8x40 100 15.00
    /M\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s+(\d+)\s+([\d.,]+)/i,
  ],
  parse: (line: string): ParsedProduct | null => {
    const dinMatch = line.match(genericParser.patterns[0]);
    if (dinMatch) {
      const diameter = dinMatch[3].replace(',', '.');
      const length = parseFloat(dinMatch[4].replace(',', '.'));
      const material = dinMatch[5];
      const packagingQty = parseInt(dinMatch[6], 10);
      const price = parseFloat(dinMatch[7].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: `${dinMatch[1]}${dinMatch[2]}`,
        packagingQty,
        price,
        material: material?.toLowerCase(),
      };
    }

    const simpleMatch = line.match(genericParser.patterns[1]);
    if (simpleMatch) {
      const diameter = simpleMatch[1].replace(',', '.');
      const length = parseFloat(simpleMatch[2].replace(',', '.'));
      const packagingQty = parseInt(simpleMatch[3], 10);
      const price = parseFloat(simpleMatch[4].replace(',', '.'));

      return {
        thread: `M${diameter}x${length}`,
        length,
        packagingCode: `PKG${packagingQty}`,
        packagingQty,
        price,
      };
    }
    return null;
  },
};

const SUPPLIER_PARSERS: Record<string, SupplierParser> = {
  reyher: reyherParser,
  wurth: wurthParser,
  wuerth: wurthParser,
  bossard: bossardParser,
  generic: genericParser,
};

/**
 * Parse a product line using the appropriate supplier parser
 */
export function parseProductLine(line: string, supplier?: string | null): ParsedProduct | null {
  // Try supplier-specific parser first
  if (supplier && SUPPLIER_PARSERS[supplier.toLowerCase()]) {
    const result = SUPPLIER_PARSERS[supplier.toLowerCase()].parse(line);
    if (result) return result;
  }

  // Fall back to trying all parsers
  for (const parser of Object.values(SUPPLIER_PARSERS)) {
    const result = parser.parse(line);
    if (result) return result;
  }

  return null;
}

// =============================================================================
// SMART CHUNKING WITH PRODUCT BOUNDARY DETECTION
// =============================================================================

interface ProductSection {
  header: string;
  content: string;
  startLine: number;
  endLine: number;
  standard?: string;
  productType?: string;
}

/**
 * Detect product section boundaries in catalogue text
 */
function detectProductSections(text: string): ProductSection[] {
  const lines = text.split('\n');
  const sections: ProductSection[] = [];

  // Patterns that indicate a new product section
  const sectionHeaderPatterns = [
    /^(DIN|ISO|EN)\s*\d+/i,                           // Standard headers
    /^(Hexagon|Socket|Pan|Countersunk|Button|Flange)\s+(bolt|screw|nut|washer)s?/i,
    /^(Sechskant|Zylinder|Senk|Linsen|Halbrund)/i,   // German headers
    /^[A-Z]{2,}\s+\d{4,}/i,                           // Article number patterns
    /^(ARTICLE|ARTIKEL|PRODUCT|PRODUKT)/i,            // Section markers
  ];

  let currentSection: ProductSection | null = null;
  let currentContent: string[] = [];
  let sectionStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this line starts a new section
    let isNewSection = false;
    let matchedHeader = '';

    for (const pattern of sectionHeaderPatterns) {
      const match = line.match(pattern);
      if (match) {
        isNewSection = true;
        matchedHeader = match[0];
        break;
      }
    }

    if (isNewSection) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        currentSection.content = currentContent.join('\n');
        currentSection.endLine = i - 1;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        header: matchedHeader,
        content: '',
        startLine: i,
        endLine: i,
      };
      currentContent = [line];
      sectionStartLine = i;

      // Extract standard from header
      const standardMatch = line.match(/\b(DIN|ISO|EN)\s*(\d+)\b/i);
      if (standardMatch) {
        currentSection.standard = `${standardMatch[1].toUpperCase()} ${standardMatch[2]}`;
      }

      // Detect product type
      const productMatch = line.match(/\b(bolt|screw|nut|washer|stud)s?\b/i);
      if (productMatch) {
        currentSection.productType = productMatch[1].toLowerCase();
      }
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // No section yet, start implicit section
      currentSection = {
        header: 'Unknown Section',
        content: '',
        startLine: i,
        endLine: i,
      };
      currentContent = [line];
    }
  }

  // Don't forget the last section
  if (currentSection && currentContent.length > 0) {
    currentSection.content = currentContent.join('\n');
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Smart chunking that respects product boundaries
 */
async function createSmartChunks(
  text: string,
  pageCount: number,
  supplier: string | null
): Promise<Array<{ content: string; pageNumber: number; chunkIndex: number; sectionHeader?: string }>> {
  const { RecursiveCharacterTextSplitter } = await import('@langchain/textsplitters');

  const sections = detectProductSections(text);
  const chunks: Array<{ content: string; pageNumber: number; chunkIndex: number; sectionHeader?: string }> = [];
  let globalChunkIndex = 0;

  // If no clear sections detected, fall back to standard chunking
  if (sections.length <= 1) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CONFIG.CHUNK_SIZE,
      chunkOverlap: CONFIG.CHUNK_OVERLAP,
      separators: ['\n\n\n', '\n\n', '\n', '. ', '; ', ', ', ' ', ''],
    });

    const splitDocs = await textSplitter.createDocuments([text]);
    return splitDocs.map((doc: { pageContent: string }, index: number) => ({
      content: doc.pageContent,
      pageNumber: Math.ceil(((index + 1) / splitDocs.length) * pageCount),
      chunkIndex: index,
    }));
  }

  // Process each section with smart chunking
  for (const section of sections) {
    const sectionText = section.content;

    // If section is small enough, keep it as one chunk
    if (sectionText.length <= CONFIG.CHUNK_SIZE) {
      chunks.push({
        content: sectionText,
        pageNumber: Math.ceil(((section.startLine + 1) / sections[sections.length - 1].endLine) * pageCount),
        chunkIndex: globalChunkIndex++,
        sectionHeader: section.header,
      });
    } else {
      // Split large sections while preserving context
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CONFIG.CHUNK_SIZE,
        chunkOverlap: CONFIG.CHUNK_OVERLAP,
        separators: ['\n\n', '\n', '. ', ' ', ''],
      });

      const sectionChunks = await textSplitter.createDocuments([sectionText]);

      for (const chunk of sectionChunks) {
        // Prepend section header for context
        const contentWithContext = section.header !== 'Unknown Section'
          ? `[${section.header}]\n${chunk.pageContent}`
          : chunk.pageContent;

        chunks.push({
          content: contentWithContext,
          pageNumber: Math.ceil(((section.startLine + 1) / sections[sections.length - 1].endLine) * pageCount),
          chunkIndex: globalChunkIndex++,
          sectionHeader: section.header,
        });
      }
    }
  }

  return chunks;
}

// =============================================================================
// METADATA VALIDATION
// =============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateMetadata(metadata: Partial<ChunkMetadata>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate thread type format
  if (metadata.threadType) {
    if (!/^M\d+(\.\d+)?(x\d+(\.\d+)?)?$/i.test(metadata.threadType)) {
      warnings.push(`Invalid thread format: ${metadata.threadType}`);
    }
  }

  // Validate price range makes sense
  if (metadata.priceInfo) {
    const priceMatch = metadata.priceInfo.match(/€([\d.]+)\s*-\s*€([\d.]+)/);
    if (priceMatch) {
      const min = parseFloat(priceMatch[1]);
      const max = parseFloat(priceMatch[2]);
      if (min > max) {
        errors.push(`Invalid price range: min (${min}) > max (${max})`);
      }
      if (min < 0 || max < 0) {
        errors.push('Negative price detected');
      }
      if (max > 10000) {
        warnings.push(`Unusually high price: ${max}`);
      }
    }
  }

  // Validate material codes
  const validMaterials = ['a2', 'a4', '8.8', '10.9', '12.9', 'brass', 'zinc', 'phosphate', 'plain'];
  if (metadata.material && !validMaterials.includes(metadata.material.toLowerCase())) {
    warnings.push(`Unrecognized material code: ${metadata.material}`);
  }

  // Validate standard format
  if (metadata.standard) {
    if (!/^(DIN|ISO|EN|ANSI)\s*\d*$/i.test(metadata.standard)) {
      warnings.push(`Non-standard format: ${metadata.standard}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// RETRY UTILITY
// =============================================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  logger: ReturnType<typeof createLogger>,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms`, {
          error: lastError.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`${operationName} failed after ${maxRetries} attempts`, {
    error: lastError?.message,
  });
  throw lastError;
}

// =============================================================================
// TEXT PREPROCESSING
// =============================================================================

/**
 * Format product tables for better parsing based on supplier
 */
function formatProductTables(text: string, supplier: string | null): string {
  let formatted = text;

  // REYHER: Convert "M 8x40S100270,00" to "M8x40 | S100 | 270.00"
  formatted = formatted.replace(
    /\bM\s*(\d+)\s*x\s*(\d+)\s*S(\d{2,3})(\d+[.,]\d{2})\b/g,
    'M$1x$2 | Package: $3pcs | Price: $4'
  );

  // WURTH: Normalize article number format
  formatted = formatted.replace(
    /(\d{4})\s+(\d{3})\s+(\d{3})/g,
    '$1$2$3'
  );

  // General: Normalize price formats
  formatted = formatted.replace(/(\d+),(\d{2})\s*EUR/g, '$1.$2 EUR');
  formatted = formatted.replace(/(\d+),(\d{2})\s*€/g, '$1.$2 EUR');

  return formatted;
}

export interface ProcessingResult {
  pageCount: number;
  chunksCreated: number;
  processingTimeMs: number;
  validationWarnings?: string[];
}

export interface ProcessingOptions {
  useSmartChunking?: boolean;
  validateMetadata?: boolean;
  enableDebugLogging?: boolean;
}

/**
 * Process a document with improved chunking, parsing, and error handling
 */
export async function processDocumentSync(
  documentId: string,
  blobUrl: string,
  documentName: string,
  supplier: string | null,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const startTime = Date.now();
  const logger = createLogger(documentId);
  const {
    useSmartChunking = true,
    validateMetadata: shouldValidate = true,
  } = options;

  const validationWarnings: string[] = [];

  logger.info('Starting document processing', { documentName, supplier, blobUrl });

  try {
    // Step 1: Fetch PDF from blob storage with retry
    logger.info('Fetching PDF from blob storage');
    const buffer = await withRetry(
      async () => {
        const response = await fetch(blobUrl);
        if (!response.ok) {
          throw new Error(`PDF fetch failed with status ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      },
      'PDF fetch',
      logger
    );

    // Step 2: Update status to processing
    logger.info('Updating document status to processing');
    await sql`UPDATE documents SET status = 'processing' WHERE id = ${documentId}`;

    // Step 3: Parse PDF with retry
    logger.info('Parsing PDF content');
    // @ts-expect-error - pdf-parse has no type declarations
    const pdfParse = (await import('pdf-parse')).default;

    const pdfData = await withRetry(
      async () => pdfParse(buffer),
      'PDF parsing',
      logger
    );
    const pageCount = pdfData.numpages;
    logger.info('PDF parsed successfully', { pageCount, textLength: pdfData.text.length });

    // Step 4: Clean and preprocess text
    logger.info('Preprocessing text content');
    let cleanedText = pdfData.text
      .replace(/\x00/g, '')
      .replace(/[\r\n]+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Fix encoding issues
    cleanedText = fixEncoding(cleanedText);

    // Format product tables based on supplier
    cleanedText = formatProductTables(cleanedText, supplier);

    logger.debug('Text preprocessing complete', { cleanedTextLength: cleanedText.length });

    // Step 5: Create chunks using smart or standard chunking
    logger.info('Creating document chunks', { useSmartChunking });
    const chunks = useSmartChunking
      ? await createSmartChunks(cleanedText, pageCount, supplier)
      : await createStandardChunks(cleanedText, pageCount);

    logger.info('Chunks created', { chunkCount: chunks.length });

    // Step 6: Create processing job
    const jobResult = await sql`
      INSERT INTO processing_jobs (document_id, total_pages, started_at)
      VALUES (${documentId}, ${pageCount}, NOW())
      RETURNING id
    `;
    const jobId = jobResult.rows[0].id;
    logger.info('Processing job created', { jobId });

    // Step 7: Generate embeddings and upsert to vector DB
    logger.info('Initializing embedding and vector services');
    const OpenAI = (await import('openai')).default;
    const { Index } = await import('@upstash/vector');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    let totalChunksProcessed = 0;

    for (let i = 0; i < chunks.length; i += CONFIG.EMBEDDING_BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + CONFIG.EMBEDDING_BATCH_SIZE);
      const batchTexts = batchChunks.map((c) => c.content);
      const batchStart = Date.now();

      logger.debug('Processing batch', {
        batchIndex: Math.floor(i / CONFIG.EMBEDDING_BATCH_SIZE),
        batchSize: batchChunks.length,
      });

      // Generate embeddings with retry
      const embeddings = await withRetry(
        async () => {
          const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: batchTexts,
          });
          return response.data.map((d) => d.embedding);
        },
        'Embedding generation',
        logger
      );

      // Prepare vector chunks with enhanced metadata and validation
      const vectorChunks = batchChunks.map((chunk, j) => {
        const chunkId = `${documentId}-${chunk.chunkIndex}`;
        const productMetadata = extractProductMetadata(chunk.content);
        const keywords = extractKeywords(chunk.content);

        // Validate metadata if enabled
        if (shouldValidate) {
          const validation = validateMetadata(productMetadata);
          if (validation.warnings.length > 0) {
            validation.warnings.forEach(w => {
              logger.warn(`Chunk ${chunk.chunkIndex}: ${w}`);
              validationWarnings.push(`Chunk ${chunk.chunkIndex}: ${w}`);
            });
          }
          if (!validation.isValid) {
            validation.errors.forEach(e => {
              logger.error(`Chunk ${chunk.chunkIndex} validation error: ${e}`);
            });
          }
        }

        return {
          id: chunkId,
          vector: embeddings[j],
          metadata: {
            documentId,
            documentName,
            supplier,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            sectionHeader: chunk.sectionHeader,
            keywords: keywords.join(' '),
            ...productMetadata,
          },
        };
      });

      // Upsert to vector DB with retry
      for (let k = 0; k < vectorChunks.length; k += CONFIG.VECTOR_UPSERT_BATCH_SIZE) {
        const batch = vectorChunks.slice(k, k + CONFIG.VECTOR_UPSERT_BATCH_SIZE);
        await withRetry(
          async () => vectorIndex.upsert(batch),
          'Vector upsert',
          logger
        );
      }

      totalChunksProcessed += batchChunks.length;

      // Update job progress
      await sql`
        UPDATE processing_jobs
        SET current_page = ${Math.min(i + CONFIG.EMBEDDING_BATCH_SIZE, chunks.length)},
            chunks_created = ${totalChunksProcessed}
        WHERE id = ${jobId}
      `;

      logger.debug('Batch complete', {
        batchIndex: Math.floor(i / CONFIG.EMBEDDING_BATCH_SIZE),
        batchDurationMs: Date.now() - batchStart,
        totalProcessed: totalChunksProcessed,
      });
    }

    // Step 8: Mark document as completed
    const processedAt = new Date().toISOString();
    await sql`
      UPDATE documents
      SET status = 'completed', page_count = ${pageCount}, processed_at = ${processedAt}
      WHERE id = ${documentId}
    `;

    await sql`
      UPDATE processing_jobs
      SET status = 'completed', completed_at = NOW(), chunks_created = ${chunks.length}
      WHERE id = ${jobId}
    `;

    const processingTimeMs = Date.now() - startTime;

    logger.info('Document processing completed successfully', {
      pageCount,
      chunksCreated: chunks.length,
      processingTimeMs,
      validationWarnings: validationWarnings.length,
    });

    return {
      pageCount,
      chunksCreated: chunks.length,
      processingTimeMs,
      validationWarnings: validationWarnings.length > 0 ? validationWarnings : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Document processing failed', { error: errorMessage });

    // Mark document as failed
    await sql`
      UPDATE documents SET status = 'failed', error_message = ${errorMessage}
      WHERE id = ${documentId}
    `;
    throw error;
  }
}

/**
 * Standard chunking fallback (no smart boundary detection)
 */
async function createStandardChunks(
  text: string,
  pageCount: number
): Promise<Array<{ content: string; pageNumber: number; chunkIndex: number; sectionHeader?: string }>> {
  const { RecursiveCharacterTextSplitter } = await import('@langchain/textsplitters');

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.CHUNK_SIZE,
    chunkOverlap: CONFIG.CHUNK_OVERLAP,
    separators: ['\n\n\n', '\n\n', '\n', '. ', '; ', ', ', ' ', ''],
  });

  const splitDocs = await textSplitter.createDocuments([text]);
  return splitDocs.map((doc: { pageContent: string }, index: number) => ({
    content: doc.pageContent,
    pageNumber: Math.ceil(((index + 1) / splitDocs.length) * pageCount),
    chunkIndex: index,
  }));
}

// =============================================================================
// BATCH PROCESSING FOR MULTIPLE DOCUMENTS
// =============================================================================

export interface BatchProcessingResult {
  successful: Array<{ documentId: string; result: ProcessingResult }>;
  failed: Array<{ documentId: string; error: string }>;
  totalTimeMs: number;
}

/**
 * Process multiple documents in parallel batches
 */
export async function processDocumentsBatch(
  documents: Array<{
    documentId: string;
    blobUrl: string;
    documentName: string;
    supplier: string | null;
  }>,
  concurrency: number = 3,
  options?: ProcessingOptions
): Promise<BatchProcessingResult> {
  const startTime = Date.now();
  const successful: Array<{ documentId: string; result: ProcessingResult }> = [];
  const failed: Array<{ documentId: string; error: string }> = [];

  // Process in batches of 'concurrency' size
  for (let i = 0; i < documents.length; i += concurrency) {
    const batch = documents.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(doc =>
        processDocumentSync(doc.documentId, doc.blobUrl, doc.documentName, doc.supplier, options)
          .then(result => ({ documentId: doc.documentId, result }))
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        const doc = batch[results.indexOf(result)];
        failed.push({
          documentId: doc.documentId,
          error: result.reason?.message || String(result.reason),
        });
      }
    }
  }

  return {
    successful,
    failed,
    totalTimeMs: Date.now() - startTime,
  };
}

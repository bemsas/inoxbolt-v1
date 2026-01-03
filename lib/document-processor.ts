import { sql } from '@vercel/postgres';

/**
 * Detect supplier from filename using known patterns
 */
export function detectSupplierFromFilename(filename: string): string | null {
  const normalizedName = filename.toLowerCase();

  // Known supplier patterns
  const supplierPatterns: Record<string, RegExp> = {
    'reyher': /reyher/i,
    'wurth': /w[uü]rth|wuerth/i,
    'bossard': /bossard/i,
    'fabory': /fabory/i,
    'hilti': /hilti/i,
    'fischer': /fischer/i,
    'klimas': /klimas|wkret/i,
    'fastenal': /fastenal/i,
  };

  for (const [supplier, pattern] of Object.entries(supplierPatterns)) {
    if (pattern.test(normalizedName)) {
      return supplier;
    }
  }

  return null;
}

// Re-export ChunkMetadata interface
export interface ChunkMetadata {
  documentId: string;
  documentName: string;
  supplier: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  productType?: string;
  material?: string;
  threadType?: string;
  headType?: string;
  standard?: string;
  // Enhanced metadata
  productName?: string;
  dimensions?: string;
  finish?: string;
  priceInfo?: string;
  packagingUnit?: string;
  description?: string;
}

/**
 * Fix common PDF encoding issues
 */
function fixEncoding(text: string): string {
  return text
    // Fix common UTF-8 encoding issues
    .replace(/Ã…/g, 'Å')  // Arrow symbol
    .replace(/Ã¥/g, 'å')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã©/g, 'é')
    .replace(/Ã±/g, 'ñ')
    .replace(/â€"/g, '–')  // En dash
    .replace(/â€"/g, '—')  // Em dash
    .replace(/â€™/g, "'")  // Right single quote
    .replace(/â€œ/g, '"')  // Left double quote
    .replace(/â€/g, '"')   // Right double quote
    .replace(/Â®/g, '®')   // Registered trademark
    .replace(/Â©/g, '©')   // Copyright
    .replace(/Â°/g, '°')   // Degree
    .replace(/Â /g, ' ')   // Non-breaking space
    // Clean up common PDF artifacts
    .replace(/\uf0b7/g, '•')  // Bullet point
    .replace(/\uf0d8/g, '→')  // Arrow
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Control characters
    .trim();
}

/**
 * Parse REYHER catalogue product line format
 * Example: "M 8x40S100270,00 brass" -> structured data
 */
interface ParsedProduct {
  thread: string;
  length: number;
  packagingCode: string;
  packagingQty: number;
  price: number;
  material?: string;
}

function parseProductLine(line: string): ParsedProduct | null {
  // Pattern: M 8x40S100270,00 or M 8x40 S100 270,00
  const pattern = /M\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*S?\s*(\d+)\s*([\d.,]+)\s*(brass|zinc|stainless|A[24]|8\.8|10\.9)?/i;
  const match = line.match(pattern);

  if (match) {
    const diameter = match[1];
    const length = parseFloat(match[2]);
    const packagingQty = parseInt(match[3], 10);
    const price = parseFloat(match[4].replace(',', '.'));
    const material = match[5]?.toLowerCase();

    return {
      thread: `M${diameter}x${length}`,
      length,
      packagingCode: 'S' + match[3],
      packagingQty,
      price,
      material,
    };
  }
  return null;
}

/**
 * Extract product description from section header
 */
function extractProductDescription(content: string): string | null {
  // Look for product name patterns in catalogue
  const patterns = [
    /^([A-Z][a-z]+(?:\s+[a-z]+)*\s+(?:bolt|screw|nut|washer|stud)s?)/im,
    /^(Hexagon\s+\w+\s*(?:bolt|screw|nut)s?)/im,
    /^(Socket\s+\w+\s*(?:bolt|screw|cap)s?)/im,
    /^(Flat\s+\w+\s*(?:washer|head)s?)/im,
    /^(Spring\s+\w+\s*(?:washer|lock)s?)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract all thread sizes from content
 */
function extractAllThreadSizes(content: string): string[] {
  const threads = content.match(/\bM\s*\d+(?:\.\d+)?(?:\s*x\s*\d+(?:\.\d+)?)?\b/gi) || [];
  const normalized = threads.map(t => t.replace(/\s+/g, '').toUpperCase());
  return [...new Set(normalized)];
}

/**
 * Extract price range from content
 */
function extractPriceRange(content: string): { min: number; max: number } | null {
  const prices = content.match(/(\d+[.,]\d{2})\s*(?:€|EUR)?/g);
  if (prices && prices.length > 0) {
    const numPrices = prices.map(p => parseFloat(p.replace(',', '.')));
    return {
      min: Math.min(...numPrices),
      max: Math.max(...numPrices),
    };
  }
  return null;
}

// Extract keywords for hybrid search (RAG 2025 best practice)
function extractKeywords(content: string): string[] {
  const keywords: string[] = [];

  // Extract DIN/ISO standards
  const standards = content.match(/\b(DIN\s*\d+|ISO\s*\d+|ANSI\s*[A-Z]*\d*)\b/gi) || [];
  keywords.push(...standards.map(s => s.replace(/\s+/g, '').toUpperCase()));

  // Extract thread sizes (M6, M8, M10, M8x30, etc.)
  const threads = content.match(/\bM\d{1,2}(?:x[\d.]+)?\b/gi) || [];
  keywords.push(...threads.map(t => t.toUpperCase()));

  // Extract material codes
  const materials = content.match(/\b(A2|A4|304|316|8\.8|10\.9|12\.9)\b/gi) || [];
  keywords.push(...materials);

  // Extract product names
  const products = content.match(/\b(bolt|nut|washer|screw|stud|hex|socket|flange|cap|spring|lock)\b/gi) || [];
  keywords.push(...products.map(p => p.toLowerCase()));

  return [...new Set(keywords)]; // Remove duplicates
}

// Extract product metadata from chunk content - Enhanced version
function extractProductMetadata(content: string): Partial<ChunkMetadata> {
  const metadata: Partial<ChunkMetadata> = {};

  // Extract product description/name
  const description = extractProductDescription(content);
  if (description) {
    metadata.productName = description;
    metadata.description = description;
  }

  // Detect product type
  const productPatterns: Record<string, RegExp> = {
    bolt: /\b(bolt|perno|tornillo|hex\s*bolt|hexagon\s*bolt)\b/i,
    nut: /\b(nut|tuerca|hex\s*nut)\b/i,
    washer: /\b(washer|arandela|flat\s*washer|spring\s*washer)\b/i,
    screw: /\b(screw|tornillo|cap\s*screw|machine\s*screw)\b/i,
    stud: /\b(stud|esparrago|threaded\s*stud)\b/i,
    anchor: /\b(anchor|ancla|expansion\s*anchor)\b/i,
    rivet: /\b(rivet|remache)\b/i,
  };

  for (const [type, pattern] of Object.entries(productPatterns)) {
    if (pattern.test(content)) {
      metadata.productType = type;
      break;
    }
  }

  // Detect thread type - get the first/main one
  const threadMatch = content.match(/\b(M\d{1,2}(?:x[\d.]+)?)\b/i);
  if (threadMatch) {
    metadata.threadType = threadMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // Extract all thread sizes for dimensions field
  const allThreads = extractAllThreadSizes(content);
  if (allThreads.length > 0) {
    metadata.dimensions = allThreads.slice(0, 10).join(', '); // Top 10 sizes
  }

  // Detect material with better patterns
  const materialPatterns: Record<string, RegExp> = {
    'A2': /\b(A2|304|18-8|stainless\s*304)\b/i,
    'A4': /\b(A4|316|stainless\s*316)\b/i,
    '8.8': /\b8\.8\b/,
    '10.9': /\b10\.9\b/,
    '12.9': /\b12\.9\b/,
    'brass': /\bbrass\b/i,
    'zinc': /\b(zinc|galvanized|verzinkt)\b/i,
    'phosphate': /\b(phosphate|phosphatiert)\b/i,
    'plain': /\bplain\b/i,
  };

  for (const [material, pattern] of Object.entries(materialPatterns)) {
    if (pattern.test(content)) {
      metadata.material = material;
      break;
    }
  }

  // Detect surface finish
  const finishPatterns: Record<string, RegExp> = {
    'zinc-plated': /\b(zinc\s*plated|verzinkt|galvanized)\b/i,
    'hot-dip-galvanized': /\b(hot\s*dip|feuerverzinkt)\b/i,
    'black-oxide': /\b(black\s*oxide|brüniert)\b/i,
    'passivated': /\b(passivated|passiviert)\b/i,
    'plain': /\b(plain|blank)\b/i,
  };

  for (const [finish, pattern] of Object.entries(finishPatterns)) {
    if (pattern.test(content)) {
      metadata.finish = finish;
      break;
    }
  }

  // Detect head type
  const headPatterns: Record<string, RegExp> = {
    'hex': /\b(hex|hexagon|sechskant|DIN\s*93[13]|ISO\s*401[47])\b/i,
    'socket': /\b(socket|allen|innensechskant|DIN\s*912|ISO\s*4762)\b/i,
    'pan': /\b(pan\s*head|linsenkopf)\b/i,
    'countersunk': /\b(countersunk|flat\s*head|senkkopf|DIN\s*965|ISO\s*10642)\b/i,
    'button': /\b(button\s*head|halbrundkopf|ISO\s*7380)\b/i,
    'flange': /\b(flange|flansch|DIN\s*6921)\b/i,
  };

  for (const [head, pattern] of Object.entries(headPatterns)) {
    if (pattern.test(content)) {
      metadata.headType = head;
      break;
    }
  }

  // Detect standard (DIN, ISO, EN)
  const standardMatch = content.match(/\b(DIN\s*\d+|ISO\s*\d+|EN\s*\d+|ANSI)\b/i);
  if (standardMatch) {
    metadata.standard = standardMatch[1].replace(/\s+/g, ' ').toUpperCase();
  }

  // Extract price info
  const priceRange = extractPriceRange(content);
  if (priceRange) {
    metadata.priceInfo = `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`;
  }

  // Detect packaging unit (S50, S100, S200, etc.)
  const packagingMatch = content.match(/\bS\s*(\d+)\b/);
  if (packagingMatch) {
    metadata.packagingUnit = `${packagingMatch[1]} pcs`;
  }

  return metadata;
}

export interface ProcessingResult {
  pageCount: number;
  chunksCreated: number;
  processingTimeMs: number;
}

export async function processDocumentSync(
  documentId: string,
  blobUrl: string,
  documentName: string,
  supplier: string | null
): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    // Step 1: Fetch PDF from blob storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error('PDF not found in blob storage');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 2: Update status to processing (direct SQL)
    await sql`UPDATE documents SET status = 'processing' WHERE id = ${documentId}`;

    // Step 3: Process PDF and extract chunks (dynamic import)
    // @ts-expect-error - pdf-parse has no type declarations
    const pdfParse = (await import('pdf-parse')).default;
    const { RecursiveCharacterTextSplitter } = await import('@langchain/textsplitters');

    const pdfData = await pdfParse(buffer);
    const pageCount = pdfData.numpages;

    // Clean and split text with encoding fixes
    let cleanedText = pdfData.text
      .replace(/\x00/g, '')
      .replace(/[\r\n]+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Fix encoding issues (Å -> Å, etc.)
    cleanedText = fixEncoding(cleanedText);

    // Format product tables for better parsing
    // Convert "M 8x40S100270,00" to "M8x40 | S100 | 270.00"
    cleanedText = cleanedText.replace(
      /\bM\s*(\d+)\s*x\s*(\d+)\s*S\s*(\d+)\s*([\d,]+)\b/g,
      'M$1x$2 | Package: $3pcs | Price: €$4'
    );

    // RAG Best Practices 2025: Use 512 tokens (~2000 chars) with 10-20% overlap
    // Semantic separators preserve document structure
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,  // ~512 tokens for better context
      chunkOverlap: 400, // 20% overlap for context continuity
      separators: [
        '\n\n\n',       // Major section breaks
        '\n\n',         // Paragraph breaks
        '\n',           // Line breaks
        '. ',           // Sentence boundaries
        '; ',           // Clause boundaries
        ', ',           // Minor breaks
        ' ',            // Words
        '',             // Characters (fallback)
      ],
    });

    const splitDocs = await textSplitter.createDocuments([cleanedText]);
    const chunks = splitDocs.map((doc: { pageContent: string }, index: number) => ({
      content: doc.pageContent,
      pageNumber: Math.ceil(((index + 1) / splitDocs.length) * pageCount),
      chunkIndex: index,
    }));

    // Step 4: Create processing job (direct SQL)
    const jobResult = await sql`
      INSERT INTO processing_jobs (document_id, total_pages, started_at)
      VALUES (${documentId}, ${pageCount}, NOW())
      RETURNING id
    `;
    const jobId = jobResult.rows[0].id;

    // Step 5: Generate embeddings and upsert to vector DB (dynamic imports)
    const OpenAI = (await import('openai')).default;
    const { Index } = await import('@upstash/vector');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    const batchSize = 50;
    let totalChunksProcessed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchTexts = batchChunks.map((c) => c.content);

      // Generate embeddings for this batch
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batchTexts,
      });
      const embeddings = embeddingResponse.data.map((d) => d.embedding);

      // Prepare chunks for vector DB with enhanced metadata
      const vectorChunks = batchChunks.map((chunk, j) => {
        const chunkId = `${documentId}-${chunk.chunkIndex}`;
        const productMetadata = extractProductMetadata(chunk.content);
        const keywords = extractKeywords(chunk.content);

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
            // RAG 2025: Keywords for hybrid search
            keywords: keywords.join(' '),
            ...productMetadata,
          },
        };
      });

      // Upsert to Upstash Vector in smaller batches
      for (let k = 0; k < vectorChunks.length; k += 100) {
        const batch = vectorChunks.slice(k, k + 100);
        await vectorIndex.upsert(batch);
      }

      totalChunksProcessed += batchChunks.length;

      // Update job progress
      await sql`
        UPDATE processing_jobs
        SET current_page = ${Math.min(i + batchSize, chunks.length)}, chunks_created = ${totalChunksProcessed}
        WHERE id = ${jobId}
      `;
    }

    // Step 6: Mark document as completed
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

    return {
      pageCount,
      chunksCreated: chunks.length,
      processingTimeMs,
    };
  } catch (error) {
    // Mark document as failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    await sql`
      UPDATE documents SET status = 'failed', error_message = ${errorMessage}
      WHERE id = ${documentId}
    `;
    throw error;
  }
}

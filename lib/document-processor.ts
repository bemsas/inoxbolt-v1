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

// Extract product metadata from chunk content using AI
function extractProductMetadata(content: string): Partial<ChunkMetadata> {
  const metadata: Partial<ChunkMetadata> = {};

  // Detect product type
  const productPatterns: Record<string, RegExp> = {
    bolt: /\b(bolt|perno|tornillo)\b/i,
    nut: /\b(nut|tuerca)\b/i,
    washer: /\b(washer|arandela)\b/i,
    screw: /\b(screw|tornillo)\b/i,
    stud: /\b(stud|esparrago)\b/i,
  };

  for (const [type, pattern] of Object.entries(productPatterns)) {
    if (pattern.test(content)) {
      metadata.productType = type;
      break;
    }
  }

  // Detect thread type (M6, M8, M10, etc.)
  const threadMatch = content.match(/\b(M\d{1,2}(?:x[\d.]+)?)\b/i);
  if (threadMatch) {
    metadata.threadType = threadMatch[1].toUpperCase();
  }

  // Detect material
  const materialPatterns: Record<string, RegExp> = {
    'stainless-steel-304': /\b(304|A2|18-8)\b/i,
    'stainless-steel-316': /\b(316|A4)\b/i,
    'carbon-steel': /\b(carbon steel|acero al carbono)\b/i,
    'brass': /\b(brass|latón)\b/i,
    'zinc-plated': /\b(zinc|galvaniz)/i,
  };

  for (const [material, pattern] of Object.entries(materialPatterns)) {
    if (pattern.test(content)) {
      metadata.material = material;
      break;
    }
  }

  // Detect head type
  const headPatterns: Record<string, RegExp> = {
    hex: /\b(hex|hexagon|DIN\s*933|DIN\s*931)\b/i,
    socket: /\b(socket|allen|DIN\s*912)\b/i,
    pan: /\b(pan head)\b/i,
    flat: /\b(flat head|countersunk|DIN\s*965)\b/i,
  };

  for (const [head, pattern] of Object.entries(headPatterns)) {
    if (pattern.test(content)) {
      metadata.headType = head;
      break;
    }
  }

  // Detect standard
  const standardMatch = content.match(/\b(DIN\s*\d+|ISO\s*\d+|ANSI)\b/i);
  if (standardMatch) {
    metadata.standard = standardMatch[1].replace(/\s+/g, ' ').toUpperCase();
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

    // Clean and split text
    const cleanedText = pdfData.text
      .replace(/\x00/g, '')
      .replace(/[\r\n]+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

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

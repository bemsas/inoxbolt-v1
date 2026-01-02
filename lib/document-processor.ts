import { processPDF } from './pdf-processor';
import { generateEmbedding, generateEmbeddings } from './embeddings';
import { updateDocumentStatus, createProcessingJob, updateProcessingJob } from './db/client';
import { upsertChunks, ChunkMetadata } from './vector/client';
import { nanoid } from 'nanoid';

// Extract product metadata from chunk content using AI
async function extractProductMetadata(content: string): Promise<Partial<ChunkMetadata>> {
  // Simple regex-based extraction for common patterns
  // In production, you could use GPT to extract structured data

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

    // Step 2: Update status to processing
    await updateDocumentStatus(documentId, 'processing');

    // Step 3: Process PDF and extract chunks
    const processingResult = await processPDF(buffer);

    // Step 4: Create processing job for tracking
    const job = await createProcessingJob(documentId, processingResult.pageCount);

    // Step 5: Generate embeddings and upsert to vector DB in batches
    const chunks = processingResult.chunks;
    const batchSize = 50; // Process 50 chunks at a time
    let totalChunksProcessed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchTexts = batchChunks.map((c) => c.content);

      // Generate embeddings for this batch
      const embeddings = await generateEmbeddings(batchTexts);

      // Prepare chunks for vector DB
      const vectorChunks = await Promise.all(
        batchChunks.map(async (chunk, j) => {
          const chunkId = `${documentId}-${chunk.chunkIndex}`;
          const productMetadata = await extractProductMetadata(chunk.content);

          return {
            id: chunkId,
            embedding: embeddings[j],
            content: chunk.content,
            metadata: {
              documentId,
              documentName,
              supplier,
              pageNumber: chunk.pageNumber,
              chunkIndex: chunk.chunkIndex,
              ...productMetadata,
            } as ChunkMetadata,
          };
        })
      );

      // Upsert to Upstash Vector
      await upsertChunks(vectorChunks);

      totalChunksProcessed += batchChunks.length;

      // Update job progress
      await updateProcessingJob(job.id, {
        current_page: Math.min(i + batchSize, chunks.length),
        chunks_created: totalChunksProcessed,
      });
    }

    // Step 6: Mark document as completed
    await updateDocumentStatus(documentId, 'completed', {
      page_count: processingResult.pageCount,
      processed_at: new Date(),
    });

    await updateProcessingJob(job.id, {
      status: 'completed',
      chunks_created: chunks.length,
    });

    const processingTimeMs = Date.now() - startTime;

    return {
      pageCount: processingResult.pageCount,
      chunksCreated: chunks.length,
      processingTimeMs,
    };
  } catch (error) {
    // Mark document as failed
    await updateDocumentStatus(documentId, 'failed', {
      error_message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

import { inngest } from './client';
import { processPDF } from '../pdf-processor';
import { generateEmbeddings } from '../embeddings';
import {
  updateDocumentStatus,
  createChunk,
  createProcessingJob,
  updateProcessingJob,
} from '../db/client';

// Process PDF document function
export const processDocument = inngest.createFunction(
  {
    id: 'process-document',
    name: 'Process PDF Document',
    retries: 3,
  },
  { event: 'document/uploaded' },
  async ({ event, step }) => {
    const { documentId, blobUrl } = event.data;

    // Step 1: Fetch PDF from blob storage
    const pdfBuffer = await step.run('fetch-pdf', async () => {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error('PDF not found in blob storage');
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });

    // Step 2: Update document status to processing
    await step.run('update-status-processing', async () => {
      await updateDocumentStatus(documentId, 'processing');
    });

    // Step 3: Process PDF and extract chunks
    const processingResult = await step.run('process-pdf', async () => {
      // Reconstruct Buffer from serialized data (Inngest serializes data between steps)
      const buffer = Buffer.isBuffer(pdfBuffer)
        ? pdfBuffer
        : Buffer.from((pdfBuffer as unknown as { data: number[] }).data);
      return await processPDF(buffer);
    });

    // Step 4: Create processing job for tracking
    const job = await step.run('create-job', async () => {
      return await createProcessingJob(documentId, processingResult.pageCount);
    });

    // Step 5: Generate embeddings in batches
    const chunks = processingResult.chunks;
    const batchSize = 100; // Process 100 chunks at a time

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchTexts = batchChunks.map((c) => c.content);

      // Generate embeddings for this batch
      const embeddings = await step.run(`generate-embeddings-${i}`, async () => {
        return await generateEmbeddings(batchTexts);
      });

      // Store chunks with embeddings
      await step.run(`store-chunks-${i}`, async () => {
        for (let j = 0; j < batchChunks.length; j++) {
          const chunk = batchChunks[j];
          await createChunk({
            document_id: documentId,
            content: chunk.content,
            embedding: embeddings[j],
            page_number: chunk.pageNumber,
            chunk_index: chunk.chunkIndex,
            token_count: chunk.tokenCount,
          });
        }

        // Update job progress
        await updateProcessingJob(job.id, {
          current_page: Math.min(i + batchSize, chunks.length),
          chunks_created: Math.min(i + batchSize, chunks.length),
        });
      });
    }

    // Step 6: Mark document as completed
    await step.run('mark-completed', async () => {
      await updateDocumentStatus(documentId, 'completed', {
        page_count: processingResult.pageCount,
        processed_at: new Date(),
      });
      await updateProcessingJob(job.id, {
        status: 'completed',
        chunks_created: chunks.length,
      });
    });

    return {
      success: true,
      documentId,
      pageCount: processingResult.pageCount,
      chunksCreated: chunks.length,
    };
  }
);

// Reprocess all documents function
export const reprocessAllDocuments = inngest.createFunction(
  {
    id: 'reprocess-all-documents',
    name: 'Reprocess All Documents',
  },
  { event: 'documents/reprocess-all' },
  async () => {
    // This would fetch all documents and trigger reprocessing
    // For now, this is a placeholder
    return { success: true, message: 'Reprocessing triggered' };
  }
);

// Export all functions for the Inngest handler
export const functions = [processDocument, reprocessAllDocuments];

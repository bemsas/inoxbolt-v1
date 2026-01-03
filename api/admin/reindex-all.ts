import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

interface Document {
  id: string;
  filename: string;
  supplier: string | null;
  blob_url: string | null;
}

/**
 * API endpoint to reindex all documents with the updated extraction logic
 * POST /api/admin/reindex-all
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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
    // Get all documents with blob URLs
    const { rows: documents } = await sql<Document>`
      SELECT id, filename, supplier, blob_url
      FROM documents
      WHERE blob_url IS NOT NULL
    `;

    if (documents.length === 0) {
      return res.status(200).json({
        message: 'No documents to reindex',
        processed: 0,
      });
    }

    const results: Array<{
      id: string;
      filename: string;
      status: 'success' | 'error';
      chunksCreated?: number;
      error?: string;
    }> = [];

    // Dynamic imports
    const { deleteDocumentChunks } = await import('../../lib/vector/client.js');
    const { processDocumentSync } = await import('../../lib/document-processor.js');

    for (const doc of documents) {
      try {
        // Reset document status
        await sql`UPDATE documents SET status = 'processing' WHERE id = ${doc.id}`;

        // Delete existing chunks
        try {
          await deleteDocumentChunks(doc.id);
        } catch (e) {
          console.log(`Vector chunk deletion skipped for ${doc.id}:`, e);
        }

        // Process document with new extraction logic
        const result = await processDocumentSync(
          doc.id,
          doc.blob_url!,
          doc.filename,
          doc.supplier
        );

        results.push({
          id: doc.id,
          filename: doc.filename,
          status: 'success',
          chunksCreated: result.chunksCreated,
        });
      } catch (error) {
        results.push({
          id: doc.id,
          filename: doc.filename,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return res.status(200).json({
      message: `Reindexed ${successCount} documents, ${errorCount} errors`,
      processed: documents.length,
      success: successCount,
      errors: errorCount,
      results,
    });
  } catch (error) {
    console.error('Reindex all error:', error);
    return res.status(500).json({
      error: 'Failed to reindex documents',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

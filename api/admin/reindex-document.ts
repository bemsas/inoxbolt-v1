import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

interface Document {
  id: string;
  filename: string;
  original_name: string;
  supplier: string | null;
  blob_url: string | null;
}

/**
 * API endpoint to reindex a single document
 * POST /api/admin/reindex-document
 * Body: { documentId: string }
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
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    // Get document
    const { rows } = await sql<Document>`
      SELECT id, filename, original_name, supplier, blob_url
      FROM documents
      WHERE id = ${documentId}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = rows[0];

    if (!doc.blob_url) {
      return res.status(400).json({ error: 'Document has no blob URL' });
    }

    // Reset document status
    await sql`UPDATE documents SET status = 'processing', error_message = NULL WHERE id = ${doc.id}`;

    // Dynamic imports
    const { deleteDocumentChunks } = await import('../../lib/vector/client.js');
    const { processDocumentSync } = await import('../../lib/document-processor.js');

    // Delete existing chunks
    try {
      await deleteDocumentChunks(doc.id);
      console.log(`Deleted existing chunks for ${doc.id}`);
    } catch (e) {
      console.log(`Vector chunk deletion skipped for ${doc.id}:`, e);
    }

    // Process document with improved extraction logic
    const result = await processDocumentSync(
      doc.id,
      doc.blob_url,
      doc.original_name || doc.filename,
      doc.supplier
    );

    return res.status(200).json({
      success: true,
      documentId: doc.id,
      filename: doc.original_name || doc.filename,
      pageCount: result.pageCount,
      chunksCreated: result.chunksCreated,
      processingTimeMs: result.processingTimeMs,
      message: `Successfully reindexed ${doc.original_name || doc.filename}`,
    });
  } catch (error) {
    console.error('Reindex document error:', error);

    // Update document status to failed
    try {
      const { documentId } = req.body;
      if (documentId) {
        await sql`UPDATE documents SET status = 'failed', error_message = ${String(error)} WHERE id = ${documentId}`;
      }
    } catch (e) {
      // Ignore status update errors
    }

    return res.status(500).json({
      error: 'Failed to reindex document',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

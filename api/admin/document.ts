import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { sql } from '@vercel/postgres';

// Document type
interface Document {
  id: string;
  filename: string;
  original_name: string;
  supplier: string | null;
  file_size_bytes: number | null;
  page_count: number | null;
  status: string;
  error_message: string | null;
  blob_url: string | null;
  created_at: Date;
  updated_at: Date;
  processed_at: Date | null;
}

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, action } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  if (!isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid document ID format' });
  }

  // GET - Get document details
  if (req.method === 'GET') {
    try {
      const result = await sql<Document>`SELECT * FROM documents WHERE id = ${id}`;
      const document = result.rows[0];

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      return res.status(200).json(document);
    } catch (error) {
      console.error('Get document error:', error);
      return res.status(500).json({ error: 'Failed to get document', details: String(error) });
    }
  }

  // DELETE - Delete document
  if (req.method === 'DELETE') {
    try {
      const result = await sql<Document>`SELECT * FROM documents WHERE id = ${id}`;
      const document = result.rows[0];

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete from blob storage
      if (document.blob_url) {
        await del(document.blob_url);
      }

      // Delete chunks from vector store (dynamic import)
      try {
        const { deleteDocumentChunks } = await import('../../lib/vector/client.js');
        await deleteDocumentChunks(id);
      } catch (e) {
        console.log('Vector chunk deletion skipped:', e);
      }

      // Delete from database (cascades to chunks)
      await sql`DELETE FROM documents WHERE id = ${id}`;

      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      return res.status(500).json({ error: 'Failed to delete document', details: String(error) });
    }
  }

  // POST - Reindex document (when action=reindex)
  if (req.method === 'POST' && action === 'reindex') {
    try {
      const result = await sql<Document>`SELECT * FROM documents WHERE id = ${id}`;
      const document = result.rows[0];

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (!document.blob_url) {
        return res.status(400).json({ error: 'Document has no associated file' });
      }

      // Reset document status
      await sql`UPDATE documents SET status = 'processing' WHERE id = ${id}`;

      // Delete existing chunks from vector store (dynamic import)
      try {
        const { deleteDocumentChunks } = await import('../../lib/vector/client.js');
        await deleteDocumentChunks(id);
      } catch (e) {
        console.log('Vector chunk deletion skipped:', e);
      }

      // Process document synchronously (dynamic import)
      const { processDocumentSync } = await import('../../lib/document-processor.js');
      const processingResult = await processDocumentSync(
        id,
        document.blob_url,
        document.filename,
        document.supplier
      );

      return res.status(200).json({
        message: 'Document reindexed successfully',
        chunksCreated: processingResult.chunksCreated,
        pageCount: processingResult.pageCount,
        processingTimeMs: processingResult.processingTimeMs
      });
    } catch (error) {
      console.error('Reindex error:', error);
      return res.status(500).json({ error: 'Failed to reindex document', details: String(error) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

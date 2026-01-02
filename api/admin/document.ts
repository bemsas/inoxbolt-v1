import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { getDocument, deleteDocument, updateDocumentStatus } from '../../lib/db/client';
import { inngest } from '../../lib/inngest/client';

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

  // GET - Get document details
  if (req.method === 'GET') {
    try {
      const document = await getDocument(id);

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
      const document = await getDocument(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete from blob storage
      if (document.blob_url) {
        await del(document.blob_url);
      }

      // Delete from database (cascades to chunks)
      await deleteDocument(id);

      return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      return res.status(500).json({ error: 'Failed to delete document', details: String(error) });
    }
  }

  // POST - Reindex document (when action=reindex)
  if (req.method === 'POST' && action === 'reindex') {
    try {
      const document = await getDocument(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (!document.blob_url) {
        return res.status(400).json({ error: 'Document has no associated file' });
      }

      // Reset document status
      await updateDocumentStatus(id, 'pending');

      // Trigger reprocessing
      await inngest.send({
        name: 'document/uploaded',
        data: {
          documentId: id,
          blobUrl: document.blob_url,
        },
      });

      return res.status(200).json({ message: 'Reindexing started' });
    } catch (error) {
      console.error('Reindex error:', error);
      return res.status(500).json({ error: 'Failed to reindex document', details: String(error) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

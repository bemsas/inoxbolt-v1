import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { Index } from '@upstash/vector';
import { detectSupplierFromFilename } from '../../lib/document-processor';

/**
 * API endpoint to detect and update supplier info for existing documents
 * POST /api/admin/update-suppliers - Update all documents with detected suppliers
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
    // Get all documents without supplier
    const { rows: documents } = await sql`
      SELECT id, filename, original_name
      FROM documents
      WHERE supplier IS NULL OR supplier = ''
    `;

    if (documents.length === 0) {
      return res.status(200).json({
        message: 'No documents need supplier updates',
        updated: 0,
      });
    }

    // Initialize vector index for metadata updates
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    const updates: Array<{ id: string; filename: string; supplier: string }> = [];

    for (const doc of documents) {
      // Try to detect supplier from filename or original_name
      const detectedSupplier = detectSupplierFromFilename(doc.filename) ||
                               detectSupplierFromFilename(doc.original_name || '');

      if (detectedSupplier) {
        // Update document in database
        await sql`
          UPDATE documents
          SET supplier = ${detectedSupplier}
          WHERE id = ${doc.id}
        `;

        updates.push({
          id: doc.id,
          filename: doc.filename,
          supplier: detectedSupplier,
        });

        // Update vector metadata for all chunks of this document
        // First, find all chunk IDs for this document
        try {
          // Query vectors with this document ID prefix
          const queryResult = await vectorIndex.query({
            vector: new Array(1536).fill(0), // Dummy vector for metadata query
            topK: 1000,
            filter: `documentId = '${doc.id}'`,
            includeMetadata: true,
          });

          // Update each chunk's metadata with the supplier
          for (const match of queryResult) {
            if (match.metadata) {
              await vectorIndex.upsert({
                id: match.id,
                vector: new Array(1536).fill(0), // Will be ignored if vector exists
                metadata: {
                  ...match.metadata,
                  supplier: detectedSupplier,
                },
              });
            }
          }
        } catch (vectorError) {
          console.error(`Failed to update vectors for document ${doc.id}:`, vectorError);
          // Continue with other documents even if vector update fails
        }
      }
    }

    return res.status(200).json({
      message: `Updated ${updates.length} documents with supplier info`,
      updated: updates.length,
      documents: updates,
    });
  } catch (error) {
    console.error('Error updating suppliers:', error);
    return res.status(500).json({
      error: 'Failed to update suppliers',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

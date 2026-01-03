import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * Detect supplier from filename using known patterns
 */
function detectSupplier(filename: string): string | null {
  const normalizedName = filename.toLowerCase();

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

    const updates: Array<{ id: string; filename: string; supplier: string }> = [];

    for (const doc of documents) {
      // Try to detect supplier from filename or original_name
      const detectedSupplier = detectSupplier(doc.filename) ||
                               detectSupplier(doc.original_name || '');

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

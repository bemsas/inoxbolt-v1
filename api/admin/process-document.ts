import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

interface ProcessRequest {
  blobUrl: string;
  filename: string;
  fileSize: number;
  supplier?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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
    const body: ProcessRequest = req.body;
    const { blobUrl, filename, fileSize, supplier } = body;

    if (!blobUrl || !filename) {
      return res.status(400).json({ error: 'blobUrl and filename are required' });
    }

    // Create document record in database
    const docResult = await sql`
      INSERT INTO documents (filename, original_name, supplier, file_size_bytes, blob_url)
      VALUES (${filename}, ${filename}, ${supplier || null}, ${fileSize || 0}, ${blobUrl})
      RETURNING *
    `;
    const document = docResult.rows[0];

    // Process document (dynamic import to avoid bundling issues)
    try {
      const { processDocumentSync } = await import('../../lib/document-processor.js');
      const result = await processDocumentSync(
        document.id,
        blobUrl,
        filename,
        supplier || null
      );

      return res.status(201).json({
        id: document.id,
        filename: filename,
        status: 'completed',
        pageCount: result.pageCount,
        chunksCreated: result.chunksCreated,
        processingTimeMs: result.processingTimeMs,
        message: 'Document uploaded and processed successfully.',
      });
    } catch (processingError) {
      console.error('Processing error:', processingError);
      return res.status(201).json({
        id: document.id,
        filename: filename,
        status: 'failed',
        error: processingError instanceof Error ? processingError.message : 'Processing failed',
        message: 'Document uploaded but processing failed.',
      });
    }
  } catch (error) {
    console.error('Process document error:', error);
    return res.status(500).json({
      error: 'Failed to process document',
      details: String(error),
    });
  }
}

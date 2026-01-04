import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { sql } from '@vercel/postgres';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs';
import { detectSupplierFromFilename } from '../../lib/document-processor';

// Helper to parse form data
function parseForm(req: VercelRequest): Promise<{ fields: Fields; files: Files }> {
  const form = new IncomingForm({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true,
  });
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // First check if documents table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'documents'
        ) as exists
      `;

      if (!tableCheck.rows[0].exists) {
        // Create documents table if it doesn't exist
        await sql`
          CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            supplier VARCHAR(100),
            file_size_bytes INTEGER,
            page_count INTEGER,
            status VARCHAR(50) DEFAULT 'pending',
            error_message TEXT,
            blob_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE
          )
        `;
        console.log('Created documents table');
      }

      // Direct SQL queries to avoid any import issues
      const docsResult = await sql<Document>`SELECT * FROM documents ORDER BY created_at DESC`;
      const documents = docsResult.rows;

      const totalDocs = await sql`SELECT COUNT(*) as count FROM documents`;
      const processing = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'processing'`;
      const completed = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'completed'`;

      // Get vector count from Upstash
      let totalChunks = 0;
      try {
        const { Index } = await import('@upstash/vector');
        const vectorIndex = new Index({
          url: process.env.UPSTASH_VECTOR_REST_URL!,
          token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
        });
        const vectorInfo = await vectorIndex.info();
        totalChunks = vectorInfo.vectorCount;
      } catch (vectorError) {
        console.error('Failed to get vector count:', vectorError);
      }

      const stats = {
        totalDocuments: Number(totalDocs.rows[0].count),
        totalChunks,
        processingCount: Number(processing.rows[0].count),
        completedCount: Number(completed.rows[0].count),
      };

      return res.status(200).json({
        documents,
        stats,
      });
    } catch (error) {
      console.error('List documents error:', error);
      return res.status(500).json({
        error: 'Failed to list documents',
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined,
        hint: 'Check if POSTGRES_URL environment variable is set correctly'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      // Parse multipart form data using formidable
      const { fields, files } = await parseForm(req);

      const uploadedFile = files.file;
      if (!uploadedFile || (Array.isArray(uploadedFile) && uploadedFile.length === 0)) {
        return res.status(400).json({ error: 'No file provided. Request must be multipart/form-data with a file field.' });
      }

      const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      const supplierField = fields.supplier;
      const originalName = file.originalFilename || 'document.pdf';

      // Auto-detect supplier from filename if not provided
      let supplier: string | undefined = Array.isArray(supplierField) ? supplierField[0] : supplierField;
      if (!supplier) {
        supplier = detectSupplierFromFilename(originalName) ?? undefined;
      }

      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'File size must be less than 100MB' });
      }

      // Read file from temp path
      const fileBuffer = fs.readFileSync(file.filepath);

      // Generate unique filename
      const extension = originalName.split('.').pop() || 'pdf';
      const filename = `${nanoid()}.${extension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });

      // Clean up temp file
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }

      // Create document record in database (direct SQL)
      const docResult = await sql<Document>`
        INSERT INTO documents (filename, original_name, supplier, file_size_bytes, blob_url)
        VALUES (${filename}, ${originalName}, ${supplier || null}, ${file.size}, ${blob.url})
        RETURNING *
      `;
      const document = docResult.rows[0];

      // Process document synchronously (dynamic import to avoid bundling issues)
      try {
        const { processDocumentSync } = await import('../../lib/document-processor.js');
        const result = await processDocumentSync(
          document.id,
          blob.url,
          originalName,
          supplier || null
        );

        return res.status(201).json({
          id: document.id,
          filename: document.original_name,
          status: 'completed',
          pageCount: result.pageCount,
          chunksCreated: result.chunksCreated,
          processingTimeMs: result.processingTimeMs,
          message: 'Document uploaded and processed successfully.',
        });
      } catch (processingError) {
        console.error('Processing error:', processingError);
        // Document is already marked as failed in processDocumentSync
        return res.status(201).json({
          id: document.id,
          filename: document.original_name,
          status: 'failed',
          error: processingError instanceof Error ? processingError.message : 'Processing failed',
          message: 'Document uploaded but processing failed.',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        error: 'Upload failed',
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

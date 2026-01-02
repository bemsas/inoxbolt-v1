import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { sql } from '@vercel/postgres';
import { Inngest } from 'inngest';

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
      // Direct SQL queries to avoid any import issues
      const docsResult = await sql<Document>`SELECT * FROM documents ORDER BY created_at DESC`;
      const documents = docsResult.rows;

      const totalDocs = await sql`SELECT COUNT(*) as count FROM documents`;
      const totalChunks = await sql`SELECT COUNT(*) as count FROM chunks`;
      const processing = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'processing'`;
      const completed = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'completed'`;

      const stats = {
        totalDocuments: Number(totalDocs.rows[0].count),
        totalChunks: Number(totalChunks.rows[0].count),
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
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  if (req.method === 'POST') {
    try {
      // For multipart form data, we need to handle it differently
      const contentType = req.headers['content-type'] || '';

      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
      }

      // Parse the raw body for file upload
      // Vercel handles multipart parsing automatically with req.body for JSON
      // For file uploads, we need to use the Web API Request
      const request = new Request(`https://${req.headers.host}${req.url}`, {
        method: 'POST',
        headers: req.headers as HeadersInit,
        body: req as unknown as BodyInit,
        // @ts-expect-error - duplex is required for streaming body
        duplex: 'half',
      });

      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const supplier = formData.get('supplier') as string | null;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validate file type
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'File size must be less than 50MB' });
      }

      // Generate unique filename
      const extension = file.name.split('.').pop() || 'pdf';
      const filename = `${nanoid()}.${extension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
        contentType: file.type,
      });

      // Create document record in database (direct SQL)
      const docResult = await sql<Document>`
        INSERT INTO documents (filename, original_name, supplier, file_size_bytes, blob_url)
        VALUES (${filename}, ${file.name}, ${supplier || null}, ${file.size}, ${blob.url})
        RETURNING *
      `;
      const document = docResult.rows[0];

      // Trigger Inngest processing (create client inline to avoid module-level init issues)
      const inngest = new Inngest({ id: 'inoxbolt' });
      await inngest.send({
        name: 'document/uploaded',
        data: {
          documentId: document.id,
          blobUrl: blob.url,
        },
      });

      return res.status(201).json({
        id: document.id,
        filename: document.original_name,
        status: document.status,
        message: 'Document uploaded successfully. Processing started.',
      });
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

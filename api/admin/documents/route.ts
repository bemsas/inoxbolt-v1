import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { createDocument, listDocuments, getStats } from '../../../lib/db/client';
import { inngest } from '../../../lib/inngest/client';

// GET /api/admin/documents - List all documents
export async function GET() {
  try {
    const documents = await listDocuments();
    const stats = await getStats();

    return new Response(
      JSON.stringify({
        documents,
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('List documents error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list documents', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/admin/documents - Upload new document
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const supplier = formData.get('supplier') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Only PDF files are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 50MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'pdf';
    const filename = `${nanoid()}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    // Create document record in database
    const document = await createDocument({
      filename,
      original_name: file.name,
      supplier: supplier || undefined,
      file_size_bytes: file.size,
      blob_url: blob.url,
    });

    // Trigger Inngest processing
    await inngest.send({
      name: 'document/uploaded',
      data: {
        documentId: document.id,
        blobUrl: blob.url,
      },
    });

    return new Response(
      JSON.stringify({
        id: document.id,
        filename: document.original_name,
        status: document.status,
        message: 'Document uploaded successfully. Processing started.',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

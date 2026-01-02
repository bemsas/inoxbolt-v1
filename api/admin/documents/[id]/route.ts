import { del } from '@vercel/blob';
import { getDocument, deleteDocument, updateDocumentStatus } from '../../../../lib/db/client';
import { inngest } from '../../../../lib/inngest/client';

export const config = {
  runtime: 'edge',
};

// GET /api/admin/documents/[id] - Get document details
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const document = await getDocument(params.id);

    if (!document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(document), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get document error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get document', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/admin/documents/[id] - Delete document
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const document = await getDocument(params.id);

    if (!document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete from blob storage
    if (document.blob_url) {
      await del(document.blob_url);
    }

    // Delete from database (cascades to chunks)
    await deleteDocument(params.id);

    return new Response(
      JSON.stringify({ message: 'Document deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Delete document error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete document', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/admin/documents/[id]/reindex - Reindex document
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const document = await getDocument(params.id);

    if (!document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!document.blob_url) {
      return new Response(
        JSON.stringify({ error: 'Document has no associated file' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reset document status
    await updateDocumentStatus(params.id, 'pending');

    // Trigger reprocessing
    await inngest.send({
      name: 'document/uploaded',
      data: {
        documentId: params.id,
        blobUrl: document.blob_url,
      },
    });

    return new Response(
      JSON.stringify({ message: 'Reindexing started' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reindex error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reindex document', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

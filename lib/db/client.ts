import { sql } from '@vercel/postgres';

export { sql };

// Document types
export interface Document {
  id: string;
  filename: string;
  original_name: string;
  supplier: string | null;
  file_size_bytes: number | null;
  page_count: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  blob_url: string | null;
  created_at: Date;
  updated_at: Date;
  processed_at: Date | null;
  metadata: Record<string, unknown>;
}

export interface Chunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[] | null;
  page_number: number | null;
  chunk_index: number | null;
  token_count: number | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface ProcessingJob {
  id: string;
  document_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  current_page: number;
  total_pages: number | null;
  chunks_created: number;
  error_message: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface ChatSession {
  id: string;
  session_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Array<{ chunkId: string; documentName: string; pageNumber: number }> | null;
  created_at: Date;
}

// Document operations
export async function createDocument(data: {
  filename: string;
  original_name: string;
  supplier?: string;
  file_size_bytes?: number;
  blob_url?: string;
}): Promise<Document> {
  const result = await sql<Document>`
    INSERT INTO documents (filename, original_name, supplier, file_size_bytes, blob_url)
    VALUES (${data.filename}, ${data.original_name}, ${data.supplier || null}, ${data.file_size_bytes || null}, ${data.blob_url || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getDocument(id: string): Promise<Document | null> {
  const result = await sql<Document>`
    SELECT * FROM documents WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function listDocuments(): Promise<Document[]> {
  const result = await sql<Document>`
    SELECT * FROM documents ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function updateDocumentStatus(
  id: string,
  status: Document['status'],
  extra?: { page_count?: number; error_message?: string; processed_at?: Date }
): Promise<void> {
  const processedAtStr = extra?.processed_at ? extra.processed_at.toISOString() : null;
  if (extra?.page_count !== undefined) {
    await sql`
      UPDATE documents
      SET status = ${status}, page_count = ${extra.page_count}, processed_at = ${processedAtStr}
      WHERE id = ${id}
    `;
  } else if (extra?.error_message) {
    await sql`
      UPDATE documents
      SET status = ${status}, error_message = ${extra.error_message}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE documents SET status = ${status} WHERE id = ${id}
    `;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  await sql`DELETE FROM documents WHERE id = ${id}`;
}

// Chunk operations
export async function createChunk(data: {
  document_id: string;
  content: string;
  embedding: number[];
  page_number?: number;
  chunk_index?: number;
  token_count?: number;
}): Promise<Chunk> {
  const embeddingStr = `[${data.embedding.join(',')}]`;
  const result = await sql<Chunk>`
    INSERT INTO chunks (document_id, content, embedding, page_number, chunk_index, token_count)
    VALUES (${data.document_id}, ${data.content}, ${embeddingStr}::vector, ${data.page_number || null}, ${data.chunk_index || null}, ${data.token_count || null})
    RETURNING id, document_id, content, page_number, chunk_index, token_count, metadata, created_at
  `;
  return result.rows[0];
}

export async function createChunksBatch(chunks: Array<{
  document_id: string;
  content: string;
  embedding: number[];
  page_number?: number;
  chunk_index?: number;
  token_count?: number;
}>): Promise<void> {
  // Insert chunks in batches for better performance
  for (const chunk of chunks) {
    await createChunk(chunk);
  }
}

export interface SearchResult {
  id: string;
  content: string;
  page_number: number | null;
  similarity: number;
  document_id: string;
  document_filename: string;
  document_supplier: string | null;
}

export async function searchChunks(
  embedding: number[],
  limit: number = 10,
  supplier?: string
): Promise<SearchResult[]> {
  const embeddingStr = `[${embedding.join(',')}]`;

  if (supplier) {
    const result = await sql<SearchResult>`
      SELECT
        c.id,
        c.content,
        c.page_number,
        1 - (c.embedding <=> ${embeddingStr}::vector) as similarity,
        c.document_id,
        d.filename as document_filename,
        d.supplier as document_supplier
      FROM chunks c
      JOIN documents d ON c.document_id = d.id
      WHERE d.supplier = ${supplier} AND d.status = 'completed'
      ORDER BY c.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;
    return result.rows;
  }

  const result = await sql<SearchResult>`
    SELECT
      c.id,
      c.content,
      c.page_number,
      1 - (c.embedding <=> ${embeddingStr}::vector) as similarity,
      c.document_id,
      d.filename as document_filename,
      d.supplier as document_supplier
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    WHERE d.status = 'completed'
    ORDER BY c.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;
  return result.rows;
}

// Processing job operations
export async function createProcessingJob(document_id: string, total_pages?: number): Promise<ProcessingJob> {
  const result = await sql<ProcessingJob>`
    INSERT INTO processing_jobs (document_id, total_pages, started_at)
    VALUES (${document_id}, ${total_pages || null}, NOW())
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateProcessingJob(
  id: string,
  data: { status?: ProcessingJob['status']; current_page?: number; chunks_created?: number; error_message?: string }
): Promise<void> {
  if (data.status === 'completed') {
    await sql`
      UPDATE processing_jobs
      SET status = ${data.status}, completed_at = NOW(), chunks_created = ${data.chunks_created || 0}
      WHERE id = ${id}
    `;
  } else if (data.status === 'failed') {
    await sql`
      UPDATE processing_jobs
      SET status = ${data.status}, error_message = ${data.error_message || null}
      WHERE id = ${id}
    `;
  } else if (data.current_page !== undefined) {
    await sql`
      UPDATE processing_jobs
      SET current_page = ${data.current_page}, chunks_created = ${data.chunks_created || 0}
      WHERE id = ${id}
    `;
  }
}

// Chat operations
export async function getOrCreateChatSession(sessionToken: string): Promise<ChatSession> {
  // Try to get existing session
  const existing = await sql<ChatSession>`
    SELECT * FROM chat_sessions WHERE session_token = ${sessionToken}
  `;

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  // Create new session
  const result = await sql<ChatSession>`
    INSERT INTO chat_sessions (session_token)
    VALUES (${sessionToken})
    RETURNING *
  `;
  return result.rows[0];
}

export async function addChatMessage(
  session_id: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: Array<{ chunkId: string; documentName: string; pageNumber: number }>
): Promise<ChatMessage> {
  const sourcesJson = sources ? JSON.stringify(sources) : null;
  const result = await sql<ChatMessage>`
    INSERT INTO chat_messages (session_id, role, content, sources)
    VALUES (${session_id}, ${role}, ${content}, ${sourcesJson}::jsonb)
    RETURNING *
  `;
  return result.rows[0];
}

export async function getChatHistory(session_id: string, limit: number = 20): Promise<ChatMessage[]> {
  const result = await sql<ChatMessage>`
    SELECT * FROM chat_messages
    WHERE session_id = ${session_id}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result.rows.reverse();
}

// Stats
export async function getStats(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  processingCount: number;
  completedCount: number;
}> {
  const docs = await sql`SELECT COUNT(*) as count FROM documents`;
  const chunks = await sql`SELECT COUNT(*) as count FROM chunks`;
  const processing = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'processing'`;
  const completed = await sql`SELECT COUNT(*) as count FROM documents WHERE status = 'completed'`;

  return {
    totalDocuments: Number(docs.rows[0].count),
    totalChunks: Number(chunks.rows[0].count),
    processingCount: Number(processing.rows[0].count),
    completedCount: Number(completed.rows[0].count),
  };
}

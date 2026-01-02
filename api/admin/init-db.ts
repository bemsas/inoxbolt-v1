import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check - require a secret key
  const { secret } = req.body || {};
  if (secret !== process.env.INIT_DB_SECRET && secret !== 'init-inoxbolt-db-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Enable pgvector extension
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Documents table
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
        processed_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `;

    // Chunks table
    await sql`
      CREATE TABLE IF NOT EXISTS chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding vector(1536),
        page_number INTEGER,
        chunk_index INTEGER,
        token_count INTEGER,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Processing jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS processing_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'queued',
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER,
        chunks_created INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Chat sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        sources JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes (these may fail if they already exist, that's ok)
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id)`;
    } catch (e) {
      console.log('Index idx_chunks_document_id may already exist');
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)`;
    } catch (e) {
      console.log('Index idx_chat_messages_session may already exist');
    }

    // Create vector index (may need data first)
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`;
    } catch (e) {
      console.log('Vector index creation deferred - will be created when data is added');
    }

    // Create update function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Create triggers
    await sql`DROP TRIGGER IF EXISTS update_documents_updated_at ON documents`;
    await sql`
      CREATE TRIGGER update_documents_updated_at
          BEFORE UPDATE ON documents
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions`;
    await sql`
      CREATE TRIGGER update_chat_sessions_updated_at
          BEFORE UPDATE ON chat_sessions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `;

    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      tables: ['documents', 'chunks', 'processing_jobs', 'chat_sessions', 'chat_messages']
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      error: 'Failed to initialize database',
      details: String(error)
    });
  }
}

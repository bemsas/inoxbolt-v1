import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

interface ChatRequest {
  message: string;
  sessionId?: string;
  language?: 'en' | 'es';
}

interface ChatSession {
  id: string;
  session_token: string;
  created_at: Date;
  updated_at: Date;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Array<{ chunkId: string; documentName: string; pageNumber: number }> | null;
  created_at: Date;
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
    const body: ChatRequest = req.body;
    const { message, sessionId, language = 'en' } = body;

    if (!message || message.trim().length < 1) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat session (direct SQL)
    const token = sessionId || nanoid();
    let session: ChatSession;

    const existingSession = await sql<ChatSession>`
      SELECT * FROM chat_sessions WHERE session_token = ${token}
    `;

    if (existingSession.rows[0]) {
      session = existingSession.rows[0];
    } else {
      const newSession = await sql<ChatSession>`
        INSERT INTO chat_sessions (session_token) VALUES (${token}) RETURNING *
      `;
      session = newSession.rows[0];
    }

    // Get chat history for context (direct SQL)
    const historyResult = await sql<ChatMessage>`
      SELECT * FROM chat_messages WHERE session_id = ${session.id} ORDER BY created_at DESC LIMIT 10
    `;
    const history = historyResult.rows.reverse();
    const historyFormatted = history.map((m: ChatMessage) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Save user message (direct SQL)
    await sql`
      INSERT INTO chat_messages (session_id, role, content) VALUES (${session.id}, 'user', ${message})
    `;

    // Dynamic imports to avoid bundling issues
    const { generateEmbedding, generateChatResponse } = await import('../lib/embeddings.js');
    const { searchChunks } = await import('../lib/vector/client.js');

    // Generate embedding for the query to find relevant context
    const queryEmbedding = await generateEmbedding(message);

    // Search for relevant chunks using Upstash Vector (top 5)
    const relevantChunks = await searchChunks(queryEmbedding, 5);

    // Build context from relevant chunks with product metadata
    const context = relevantChunks
      .map((chunk, i) => {
        const meta = chunk.metadata;
        const productInfo = [
          meta.productType && `Type: ${meta.productType}`,
          meta.threadType && `Thread: ${meta.threadType}`,
          meta.material && `Material: ${meta.material}`,
          meta.standard && `Standard: ${meta.standard}`,
        ]
          .filter(Boolean)
          .join(', ');

        return `[${i + 1}] From ${meta.documentName} (page ${meta.pageNumber || 'N/A'})${productInfo ? ` [${productInfo}]` : ''}:\n${chunk.content}`;
      })
      .join('\n\n');

    // Prepare sources for response
    const sources = relevantChunks.map((chunk) => ({
      chunkId: chunk.id,
      documentName: chunk.metadata.documentName,
      pageNumber: chunk.metadata.pageNumber || 0,
      excerpt: chunk.content.substring(0, 100) + '...',
    }));

    // Generate streaming response
    const stream = await generateChatResponse(message, context, historyFormatted, language);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Session-Id', token);
    res.setHeader('X-Sources', JSON.stringify(sources));
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream the response
    const reader = stream.getReader();
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        fullResponse += text;
        res.write(text);
      }
    } finally {
      reader.releaseLock();
    }

    // Save assistant message after stream completes (direct SQL)
    const sourcesJson = JSON.stringify(sources);
    await sql`
      INSERT INTO chat_messages (session_id, role, content, sources)
      VALUES (${session.id}, 'assistant', ${fullResponse}, ${sourcesJson}::jsonb)
    `;

    return res.end();
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat failed', details: String(error) });
  }
}

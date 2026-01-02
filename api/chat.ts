import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrCreateChatSession, addChatMessage, getChatHistory } from '../lib/db/client';
import { searchChunks } from '../lib/vector/client';
import { generateEmbedding, generateChatResponse } from '../lib/embeddings';
import { nanoid } from 'nanoid';

interface ChatRequest {
  message: string;
  sessionId?: string;
  language?: 'en' | 'es';
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

    // Get or create chat session
    const token = sessionId || nanoid();
    const session = await getOrCreateChatSession(token);

    // Get chat history for context
    const history = await getChatHistory(session.id, 10);
    const historyFormatted = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Save user message
    await addChatMessage(session.id, 'user', message);

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

    // Save assistant message after stream completes
    await addChatMessage(session.id, 'assistant', fullResponse, sources);

    return res.end();
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat failed', details: String(error) });
  }
}

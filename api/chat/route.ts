import { searchChunks, getOrCreateChatSession, addChatMessage, getChatHistory } from '../../lib/db/client';
import { generateEmbedding, generateChatResponse } from '../../lib/embeddings';
import { nanoid } from 'nanoid';

interface ChatRequest {
  message: string;
  sessionId?: string;
  language?: 'en' | 'es';
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, language = 'en' } = body;

    if (!message || message.trim().length < 1) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Search for relevant chunks (top 5)
    const relevantChunks = await searchChunks(queryEmbedding, 5);

    // Build context from relevant chunks
    const context = relevantChunks
      .map((chunk, i) => `[${i + 1}] From ${chunk.document_filename} (page ${chunk.page_number || 'N/A'}):\n${chunk.content}`)
      .join('\n\n');

    // Prepare sources for response
    const sources = relevantChunks.map((chunk) => ({
      chunkId: chunk.id,
      documentName: chunk.document_filename,
      pageNumber: chunk.page_number || 0,
      excerpt: chunk.content.substring(0, 100) + '...',
    }));

    // Generate streaming response
    const stream = await generateChatResponse(message, context, historyFormatted, language);

    // Create a TransformStream to collect the full response while streaming
    let fullResponse = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullResponse += text;
        controller.enqueue(chunk);
      },
      async flush() {
        // Save assistant message after stream completes
        await addChatMessage(session.id, 'assistant', fullResponse, sources);
      },
    });

    const responseStream = stream.pipeThrough(transformStream);

    // Return streaming response with session ID and sources in headers
    return new Response(responseStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': token,
        'X-Sources': JSON.stringify(sources),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Chat failed', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

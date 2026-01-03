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
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id, X-Sources');

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
      SELECT * FROM chat_messages WHERE session_id = ${session.id} ORDER BY created_at DESC LIMIT 6
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
    const OpenAI = (await import('openai')).default;
    const { Index } = await import('@upstash/vector');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for relevant chunks (top 8 for better context)
    const searchResults = await vectorIndex.query({
      vector: queryEmbedding,
      topK: 8,
      includeMetadata: true,
    });

    const relevantChunks = searchResults.map((result: any) => ({
      id: result.id,
      score: result.score,
      content: result.metadata?.content || '',
      metadata: result.metadata || {},
    }));

    // Build context from relevant chunks
    const context = relevantChunks
      .map((chunk: any, i: number) => {
        const meta = chunk.metadata;
        const productInfo = [
          meta.productType && `Type: ${meta.productType}`,
          meta.threadType && `Thread: ${meta.threadType}`,
          meta.material && `Material: ${meta.material}`,
          meta.standard && `Standard: ${meta.standard}`,
        ]
          .filter(Boolean)
          .join(', ');

        return `[${i + 1}] From "${meta.documentName}" (page ${meta.pageNumber || 'N/A'})${productInfo ? ` [${productInfo}]` : ''}:\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    // Prepare sources for response
    const sources = relevantChunks.map((chunk: any) => ({
      chunkId: chunk.id,
      documentName: chunk.metadata.documentName || 'Unknown',
      pageNumber: chunk.metadata.pageNumber || 0,
      excerpt: (chunk.content || '').substring(0, 150) + '...',
    }));

    // Build system prompt
    const systemPrompt = language === 'es'
      ? `Eres un asistente experto en productos de fijación industrial (tornillos, tuercas, pernos, arandelas) para Inoxbolt, un distribuidor B2B en las Islas Canarias.

CONTEXTO DE LOS CATÁLOGOS DE PRODUCTOS:
${context}

INSTRUCCIONES:
- Responde en español de manera profesional y técnica
- Usa la información del contexto para responder con precisión
- Menciona códigos de producto, estándares (DIN, ISO) y especificaciones cuando estén disponibles
- Si la información específica no está en el contexto, indica qué información tienes disponible y sugiere alternativas
- Sé conciso pero completo en tus respuestas
- Si mencionas precios, indica que son orientativos y pueden variar`
      : `You are an expert assistant for industrial fasteners (bolts, nuts, screws, washers) at Inoxbolt, a B2B distributor in the Canary Islands.

CONTEXT FROM PRODUCT CATALOGS:
${context}

INSTRUCTIONS:
- Respond professionally and technically
- Use the context information to answer precisely
- Mention product codes, standards (DIN, ISO) and specifications when available
- If specific information is not in the context, indicate what information you have and suggest alternatives
- Be concise but thorough in your responses
- If mentioning prices, indicate they are indicative and may vary`;

    const chatMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...historyFormatted,
      { role: 'user', content: message },
    ];

    // Set headers for streaming BEFORE starting the stream
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Session-Id', token);
    res.setHeader('X-Sources', JSON.stringify(sources));
    res.setHeader('Cache-Control', 'no-cache');

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Stream the response
    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }

    // Save assistant message after stream completes
    const sourcesJson = JSON.stringify(sources);
    await sql`
      INSERT INTO chat_messages (session_id, role, content, sources)
      VALUES (${session.id}, 'assistant', ${fullResponse}, ${sourcesJson}::jsonb)
    `;

    return res.end();
  } catch (error) {
    console.error('Chat error:', error);
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Chat failed', details: String(error) });
    }
    // If streaming already started, just end the response
    return res.end();
  }
}

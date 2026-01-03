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
    // Import OpenAI directly instead of from embeddings module
    const OpenAI = (await import('openai')).default;
    const { Index } = await import('@upstash/vector');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });

    // Generate embedding inline
    async function generateEmbedding(text: string): Promise<number[]> {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    }

    // Search chunks inline
    async function searchChunks(embedding: number[], topK: number): Promise<Array<{id: string; score: number; content: string; metadata: any}>> {
      const results = await vectorIndex.query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });
      return results.map((result: any) => ({
        id: result.id,
        score: result.score,
        content: result.metadata?.content || '',
        metadata: result.metadata,
      }));
    }

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

    // Generate streaming response inline
    const systemPrompt = language === 'es'
      ? `Eres un asistente experto en productos de fijación industrial (tornillos, tuercas, pernos) para Inoxbolt.

Usa el siguiente contexto de los catálogos de productos:

<context>
${context}
</context>

Directrices:
- Responde en español
- Sé preciso y técnico
- Si la información no está en el contexto, indícalo
- Menciona códigos de producto cuando sea relevante`
      : `You are an expert assistant for industrial fasteners (bolts, nuts, screws) at Inoxbolt.

Use the following context from product catalogs:

<context>
${context}
</context>

Guidelines:
- Be precise and technical
- If the information is not in the context, clearly state that
- Mention product codes when relevant`;

    const chatMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...historyFormatted.map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const fullResponse = chatResponse.choices[0]?.message?.content || '';

    // Save assistant message (direct SQL)
    const sourcesJson = JSON.stringify(sources);
    await sql`
      INSERT INTO chat_messages (session_id, role, content, sources)
      VALUES (${session.id}, 'assistant', ${fullResponse}, ${sourcesJson}::jsonb)
    `;

    // Return JSON response
    return res.status(200).json({
      response: fullResponse,
      sessionId: token,
      sources,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Chat failed', details: String(error) });
  }
}

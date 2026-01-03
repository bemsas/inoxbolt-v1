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

interface AISettings {
  temperature: number;
  maxTokens: number;
  contextChunks: number;
  model: string;
}

const DEFAULT_SETTINGS: AISettings = {
  temperature: 0.7,
  maxTokens: 1500,
  contextChunks: 8,
  model: 'gpt-4o-mini',
};

async function getAISettings(): Promise<AISettings> {
  try {
    const result = await sql`SELECT value FROM ai_settings WHERE key = 'chat_settings'`;
    if (result.rows.length > 0) {
      return result.rows[0].value as AISettings;
    }
  } catch (e) {
    // Table may not exist yet, use defaults
  }
  return DEFAULT_SETTINGS;
}

// RAG 2025 Best Practice: Extract keywords from user query for hybrid search
function extractQueryKeywords(query: string): string[] {
  const keywords: string[] = [];

  // Extract DIN/ISO standards
  const standards = query.match(/\b(DIN\s*\d+|ISO\s*\d+)\b/gi) || [];
  keywords.push(...standards.map(s => s.replace(/\s+/g, '')));

  // Extract thread sizes (M6, M8, M10, M8x30, etc.)
  const threads = query.match(/\bM\d{1,2}(?:x[\d.]+)?\b/gi) || [];
  keywords.push(...threads);

  // Extract material codes
  const materials = query.match(/\b(A2|A4|304|316|8\.8|10\.9|12\.9|stainless|inox|zinc|galvanized)\b/gi) || [];
  keywords.push(...materials);

  // Extract product types
  const products = query.match(/\b(bolt|nut|washer|screw|stud|hex|socket|flange|cap|spring|lock|perno|tornillo|tuerca|arandela)\b/gi) || [];
  keywords.push(...products);

  return [...new Set(keywords)];
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

    // Get AI settings from database
    const aiSettings = await getAISettings();

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

    // RAG 2025 Best Practice: Hybrid Search (Vector + Keyword matching)
    // Extract keywords from user query for boosting
    const queryKeywords = extractQueryKeywords(message);

    // Search for relevant chunks with extra results for reranking
    const searchResults = await vectorIndex.query({
      vector: queryEmbedding,
      topK: aiSettings.contextChunks * 2, // Fetch more for reranking
      includeMetadata: true,
    });

    // Apply hybrid scoring: combine vector similarity with keyword matching
    const scoredChunks = searchResults.map((result: any) => {
      const content = result.metadata?.content || '';
      const keywords = result.metadata?.keywords || '';

      // Calculate keyword boost
      let keywordBoost = 0;
      for (const keyword of queryKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          keywordBoost += 0.1;
        }
        if (keywords.toLowerCase().includes(keyword.toLowerCase())) {
          keywordBoost += 0.15;
        }
      }

      return {
        id: result.id,
        score: result.score + keywordBoost, // Hybrid score
        vectorScore: result.score,
        keywordBoost,
        content,
        metadata: result.metadata || {},
      };
    });

    // Rerank and take top chunks
    const relevantChunks = scoredChunks
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, aiSettings.contextChunks);

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
- Si mencionas precios, indica que son orientativos y pueden variar

PEDIDOS DE VOLUMEN/CANTIDAD:
- Para pedidos grandes (100+ piezas), menciona opciones de embalaje disponibles (cajas, bolsas)
- Sugiere tamaños de lote estándar del catálogo cuando sea relevante
- Si el cliente pide una cantidad específica, confirma disponibilidad y sugiere la unidad de venta más cercana

PREGUNTAS DE COMPATIBILIDAD:
- Para tornillos y tuercas, el tamaño de rosca debe coincidir (ej: M8 con M8)
- Las roscas métricas (M) son diferentes de las imperiales (UNC/UNF)
- Verifica material compatible: acero con acero, inoxidable con inoxidable para evitar corrosión galvánica
- Considera la clase de resistencia: tornillo 8.8 con tuerca clase 8, etc.
- Para arandelas, el diámetro interior debe coincidir con el diámetro del tornillo`
      : `You are an expert assistant for industrial fasteners (bolts, nuts, screws, washers) at Inoxbolt, a B2B distributor in the Canary Islands.

CONTEXT FROM PRODUCT CATALOGS:
${context}

INSTRUCTIONS:
- Respond professionally and technically
- Use the context information to answer precisely
- Mention product codes, standards (DIN, ISO) and specifications when available
- If specific information is not in the context, indicate what information you have and suggest alternatives
- Be concise but thorough in your responses
- If mentioning prices, indicate they are indicative and may vary

VOLUME/QUANTITY ORDERS:
- For large orders (100+ pieces), mention available packaging options (boxes, bags)
- Suggest standard lot sizes from the catalog when relevant
- If customer requests a specific quantity, confirm availability and suggest the nearest selling unit

COMPATIBILITY QUESTIONS:
- For bolts and nuts, thread size must match (e.g., M8 with M8)
- Metric threads (M) are different from imperial (UNC/UNF)
- Verify material compatibility: steel with steel, stainless with stainless to avoid galvanic corrosion
- Consider strength class: grade 8.8 bolt with class 8 nut, etc.
- For washers, inner diameter must match bolt diameter`;

    const chatMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...historyFormatted,
      { role: 'user', content: message },
    ];

    // Non-streaming approach for reliability (use dynamic settings)
    const completion = await openai.chat.completions.create({
      model: aiSettings.model,
      messages: chatMessages,
      stream: false,
      temperature: aiSettings.temperature,
      max_tokens: aiSettings.maxTokens,
    });

    const fullResponse = completion.choices[0]?.message?.content || 'No response generated';

    // Save assistant message
    const sourcesJson = JSON.stringify(sources);
    await sql`
      INSERT INTO chat_messages (session_id, role, content, sources)
      VALUES (${session.id}, 'assistant', ${fullResponse}, ${sourcesJson}::jsonb)
    `;

    // Set headers - encode sources as base64 to avoid header character issues
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Session-Id', token);
    // Base64 encode the sources to avoid invalid header characters
    const sourcesBase64 = Buffer.from(JSON.stringify(sources)).toString('base64');
    res.setHeader('X-Sources', sourcesBase64);
    res.setHeader('Cache-Control', 'no-cache');

    // Write full response at once (frontend will handle display)
    res.write(fullResponse);
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

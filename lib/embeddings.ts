import OpenAI from 'openai';

// Lazy initialization to avoid issues with environment variables
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not configured');
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // OpenAI allows up to 2048 embeddings per request
  const batchSize = 2048;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await getOpenAI().embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    embeddings.push(...response.data.map((d) => d.embedding));
  }

  return embeddings;
}

export async function generateChatResponse(
  message: string,
  context: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  language: 'en' | 'es' = 'en'
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt =
    language === 'es'
      ? `Eres un asistente experto en productos de fijación industrial (tornillos, tuercas, pernos) para Inoxbolt, un distribuidor B2B en las Islas Canarias.

Usa el siguiente contexto de los catálogos de productos para responder la pregunta del usuario:

<context>
${context}
</context>

Directrices:
- Responde en español
- Sé preciso y técnico cuando sea necesario
- Si la información no está en el contexto, indícalo claramente
- Menciona códigos de producto y especificaciones cuando sea relevante
- Sé conciso pero completo`
      : `You are an expert assistant for industrial fasteners (bolts, nuts, screws) at Inoxbolt, a B2B distributor in the Canary Islands.

Use the following context from product catalogs to answer the user's question:

<context>
${context}
</context>

Guidelines:
- Be precise and technical when needed
- If the information is not in the context, clearly state that
- Mention product codes and specifications when relevant
- Be concise but thorough`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: message },
  ];

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  // Convert OpenAI stream to ReadableStream
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });
}

import { Index } from '@upstash/vector';

// Initialize Upstash Vector client
// Requires UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN env vars
export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Metadata interface for product chunks
export interface ChunkMetadata {
  documentId: string;
  documentName: string;
  supplier: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  // Product-specific metadata for AI compatibility
  productType?: string; // bolt, nut, washer, screw, etc.
  material?: string; // stainless-steel-304, stainless-steel-316, carbon-steel, etc.
  threadType?: string; // M6, M8, M10, M12, etc.
  headType?: string; // hex, socket, pan, flat, etc.
  standard?: string; // DIN, ISO, ANSI, etc.
}

// Upsert a single chunk with embedding
export async function upsertChunk(
  id: string,
  embedding: number[],
  content: string,
  metadata: ChunkMetadata
): Promise<void> {
  await vectorIndex.upsert({
    id,
    vector: embedding,
    metadata: {
      ...metadata,
      content, // Store content in metadata for retrieval
    },
  });
}

// Upsert multiple chunks in batch
export async function upsertChunks(
  chunks: Array<{
    id: string;
    embedding: number[];
    content: string;
    metadata: ChunkMetadata;
  }>
): Promise<void> {
  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    vector: chunk.embedding,
    metadata: {
      ...chunk.metadata,
      content: chunk.content,
    },
  }));

  // Upstash allows up to 1000 vectors per batch
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await vectorIndex.upsert(batch);
  }
}

// Search for similar chunks
export async function searchChunks(
  embedding: number[],
  topK: number = 10,
  filter?: {
    supplier?: string;
    productType?: string;
    material?: string;
    threadType?: string;
  }
): Promise<
  Array<{
    id: string;
    score: number;
    content: string;
    metadata: ChunkMetadata;
  }>
> {
  // Build filter string for Upstash Vector
  const filterParts: string[] = [];
  if (filter?.supplier) {
    filterParts.push(`supplier = '${filter.supplier}'`);
  }
  if (filter?.productType) {
    filterParts.push(`productType = '${filter.productType}'`);
  }
  if (filter?.material) {
    filterParts.push(`material = '${filter.material}'`);
  }
  if (filter?.threadType) {
    filterParts.push(`threadType = '${filter.threadType}'`);
  }

  const filterStr = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

  const results = await vectorIndex.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: filterStr,
  });

  return results.map((result) => ({
    id: result.id as string,
    score: result.score,
    content: (result.metadata as any)?.content || '',
    metadata: result.metadata as unknown as ChunkMetadata,
  }));
}

// Delete chunks by document ID
export async function deleteChunksByDocument(documentId: string): Promise<void> {
  // Upstash Vector doesn't support filter-based delete directly
  // We need to query and then delete by IDs
  // For now, we'll use a prefix-based approach where chunk IDs include document ID
  // This is handled by the caller using the chunk ID format: `${documentId}-${chunkIndex}`

  // Alternative: Store all chunk IDs in the document record and delete them
  console.log(`Deleting chunks for document: ${documentId}`);
}

// Check compatibility between products
export async function findCompatibleProducts(
  productEmbedding: number[],
  productType: string,
  threadType?: string,
  topK: number = 10
): Promise<
  Array<{
    id: string;
    score: number;
    content: string;
    metadata: ChunkMetadata;
  }>
> {
  // Find products that would be compatible based on:
  // 1. Similar embedding (semantic similarity)
  // 2. Matching thread type
  // 3. Different product type (e.g., bolt -> nut, washer)

  const compatibleTypes: Record<string, string[]> = {
    bolt: ['nut', 'washer', 'locknut'],
    nut: ['bolt', 'screw', 'stud', 'washer'],
    washer: ['bolt', 'nut', 'screw'],
    screw: ['nut', 'washer'],
  };

  const targetTypes = compatibleTypes[productType] || [];

  // Search for compatible products
  const filterParts: string[] = [];

  if (targetTypes.length > 0) {
    const typeFilter = targetTypes.map((t) => `productType = '${t}'`).join(' OR ');
    filterParts.push(`(${typeFilter})`);
  }

  if (threadType) {
    filterParts.push(`threadType = '${threadType}'`);
  }

  const filterStr = filterParts.length > 0 ? filterParts.join(' AND ') : undefined;

  const results = await vectorIndex.query({
    vector: productEmbedding,
    topK,
    includeMetadata: true,
    filter: filterStr,
  });

  return results.map((result) => ({
    id: result.id as string,
    score: result.score,
    content: (result.metadata as any)?.content || '',
    metadata: result.metadata as unknown as ChunkMetadata,
  }));
}

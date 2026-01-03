import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CompatibilityRequest {
  query: string;
  productType?: string;
  threadType?: string;
  material?: string;
  limit?: number;
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
    const body: CompatibilityRequest = req.body;
    const { query, productType, threadType, material, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Dynamic imports to avoid bundling issues
    const { generateEmbedding } = await import('../lib/embeddings.js');
    const { findCompatibleProducts, searchChunks } = await import('../lib/vector/client.js');

    // Generate embedding for the product query
    const queryEmbedding = await generateEmbedding(query);

    // First, find the product being queried
    const sourceProducts = await searchChunks(queryEmbedding, 3, {
      productType,
      material,
      threadType,
    });

    if (sourceProducts.length === 0) {
      return res.status(200).json({
        sourceProduct: null,
        compatibleProducts: [],
        message: 'No matching products found for the query.',
      });
    }

    const sourceProduct = sourceProducts[0];
    const detectedProductType = sourceProduct.metadata.productType || productType;
    const detectedThreadType = sourceProduct.metadata.threadType || threadType;

    // Find compatible products
    const compatibleProducts = await findCompatibleProducts(
      queryEmbedding,
      detectedProductType || 'bolt',
      detectedThreadType,
      limit
    );

    // Calculate compatibility scores
    const compatibilityResults = compatibleProducts.map((product) => {
      // Calculate compatibility score based on multiple factors
      let compatibilityScore = product.score * 100; // Base semantic similarity

      // Boost for matching thread type
      if (detectedThreadType && product.metadata.threadType === detectedThreadType) {
        compatibilityScore += 20;
      }

      // Boost for compatible materials
      const sourceMaterial = sourceProduct.metadata.material;
      const targetMaterial = product.metadata.material;
      if (sourceMaterial && targetMaterial) {
        // Stainless steel products are compatible with each other
        if (sourceMaterial.includes('stainless') && targetMaterial.includes('stainless')) {
          compatibilityScore += 15;
        }
        // Same material type
        if (sourceMaterial === targetMaterial) {
          compatibilityScore += 10;
        }
      }

      // Cap at 100
      compatibilityScore = Math.min(Math.round(compatibilityScore), 100);

      return {
        id: product.id,
        content: product.content,
        snippet: product.content.length > 200 ? product.content.substring(0, 200) + '...' : product.content,
        compatibilityScore,
        semanticScore: Math.round(product.score * 100),
        document: {
          id: product.metadata.documentId,
          filename: product.metadata.documentName,
          supplier: product.metadata.supplier,
        },
        productType: product.metadata.productType,
        material: product.metadata.material,
        threadType: product.metadata.threadType,
        headType: product.metadata.headType,
        standard: product.metadata.standard,
        reasons: getCompatibilityReasons(sourceProduct.metadata, product.metadata),
      };
    });

    // Sort by compatibility score
    compatibilityResults.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.status(200).json({
      sourceProduct: {
        content: sourceProduct.content.substring(0, 300) + '...',
        productType: sourceProduct.metadata.productType,
        threadType: sourceProduct.metadata.threadType,
        material: sourceProduct.metadata.material,
        document: sourceProduct.metadata.documentName,
      },
      compatibleProducts: compatibilityResults,
      totalResults: compatibilityResults.length,
    });
  } catch (error) {
    console.error('Compatibility check error:', error);
    return res.status(500).json({ error: 'Compatibility check failed', details: String(error) });
  }
}

function getCompatibilityReasons(
  source: Record<string, any>,
  target: Record<string, any>
): string[] {
  const reasons: string[] = [];

  if (source.threadType && target.threadType === source.threadType) {
    reasons.push(`Matching thread type: ${source.threadType}`);
  }

  if (source.material && target.material) {
    if (source.material === target.material) {
      reasons.push(`Same material: ${source.material}`);
    } else if (source.material.includes('stainless') && target.material.includes('stainless')) {
      reasons.push('Compatible stainless steel materials');
    }
  }

  if (target.standard) {
    reasons.push(`Standard: ${target.standard}`);
  }

  if (reasons.length === 0) {
    reasons.push('Semantically similar product');
  }

  return reasons;
}

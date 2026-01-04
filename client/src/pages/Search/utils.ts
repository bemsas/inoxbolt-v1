/**
 * Search page utility functions
 * Extracted for testing and reuse
 */

import type { SearchResult } from '@/contexts/RAGContext';
import type { ProductInfo } from '@/types/product';

/**
 * Convert SearchResult to ProductInfo - uses API-provided metadata
 */
export function toProductInfo(result: SearchResult): ProductInfo {
  // Prefer API-provided metadata over re-extraction
  const content = result.content || result.snippet;

  // Fallback extraction only if API didn't provide metadata
  let standard = result.standard;
  let threadType = result.threadType;
  let material = result.material;

  if (!standard) {
    const standardMatch = content.match(/\b(DIN\s*\d+|ISO\s*\d+)\b/i);
    standard = standardMatch ? standardMatch[0].replace(/\s+/g, ' ').toUpperCase() : undefined;
  }

  if (!threadType) {
    const threadMatch = content.match(/\bM\d{1,2}(?:x[\d.]+)?\b/i);
    threadType = threadMatch ? threadMatch[0] : undefined;
  }

  if (!material) {
    const materialMatch = content.match(/\b(A[24]|304|316|8\.8|10\.9|12\.9)\b/i);
    material = materialMatch ? materialMatch[0].toUpperCase() : undefined;
  }

  return {
    id: result.id,
    name: result.productName || '',
    content: result.snippet || result.content,
    standard,
    threadType,
    material,
    headType: result.headType,
    supplier: result.document.supplier || undefined,
    pageNumber: result.pageNumber || undefined,
    documentName: result.document.filename,
    score: result.score,
    // Enhanced metadata
    productName: result.productName,
    dimensions: result.dimensions,
    finish: result.finish,
    priceInfo: result.priceInfo,
    packagingUnit: result.packagingUnit,
    productType: result.productType,
  };
}

/**
 * Filter results client-side based on filter state
 */
export interface FilterState {
  materials: string[];
  standards: string[];
  categories: string[];
  suppliers: string[];
  threadSizes: string[];
}

export function filterResults(
  results: SearchResult[],
  filters: FilterState
): SearchResult[] {
  if (!results.length) return [];

  return results.filter((result) => {
    const productInfo = toProductInfo(result);

    // Material filter
    if (filters.materials.length > 0 && productInfo.material) {
      if (!filters.materials.some(m => productInfo.material?.includes(m))) {
        return false;
      }
    }

    // Standard filter
    if (filters.standards.length > 0 && productInfo.standard) {
      if (!filters.standards.some(s => productInfo.standard?.includes(s))) {
        return false;
      }
    }

    // Supplier filter
    if (filters.suppliers.length > 0 && productInfo.supplier) {
      if (!filters.suppliers.includes(productInfo.supplier)) {
        return false;
      }
    }

    // Thread size filter
    if (filters.threadSizes.length > 0 && productInfo.threadType) {
      if (!filters.threadSizes.some(t => productInfo.threadType?.startsWith(t))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract available filter options from results
 */
export function extractFilterOptions(results: SearchResult[]): {
  materials: string[];
  standards: string[];
  suppliers: string[];
  threadSizes: string[];
} {
  const materials = new Set<string>();
  const standards = new Set<string>();
  const suppliers = new Set<string>();
  const threadSizes = new Set<string>();

  results.forEach((result) => {
    const productInfo = toProductInfo(result);
    if (productInfo.material) materials.add(productInfo.material);
    if (productInfo.standard) {
      const prefix = productInfo.standard.split(' ')[0];
      standards.add(prefix);
    }
    if (productInfo.supplier) suppliers.add(productInfo.supplier);
    if (productInfo.threadType) {
      const base = productInfo.threadType.match(/^M\d+/)?.[0];
      if (base) threadSizes.add(base);
    }
  });

  return {
    materials: Array.from(materials).sort(),
    standards: Array.from(standards).sort(),
    suppliers: Array.from(suppliers).sort(),
    threadSizes: Array.from(threadSizes).sort((a, b) => {
      const numA = parseInt(a.replace('M', ''));
      const numB = parseInt(b.replace('M', ''));
      return numA - numB;
    }),
  };
}

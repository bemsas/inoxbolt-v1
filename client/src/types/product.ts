/**
 * Product information extracted from search results and catalogue data
 */
export interface ProductInfo {
  id: string;
  name: string;
  content: string;
  standard?: string;
  threadType?: string;
  material?: string;
  headType?: string;
  price?: string;
  supplier?: string;
  pageNumber?: number;
  documentName?: string;
  score?: number;
  // Enhanced metadata from vector DB
  productName?: string;
  dimensions?: string;
  finish?: string;
  priceInfo?: string;
  packagingUnit?: string;
  productType?: string;
}

/**
 * DIN/ISO standard to product type and head type mapping
 */
export const STANDARD_INFO: Record<string, { type: string; head: string; drive?: string }> = {
  // Hex Head Bolts
  'DIN 933': { type: 'Hex Bolt', head: 'Hex' },
  'DIN 931': { type: 'Hex Bolt', head: 'Hex' },
  'ISO 4017': { type: 'Hex Bolt', head: 'Hex' },
  'ISO 4014': { type: 'Hex Bolt', head: 'Hex' },
  // Socket Cap Screws
  'DIN 912': { type: 'Socket Cap Screw', head: 'Socket', drive: 'Allen' },
  'ISO 4762': { type: 'Socket Cap Screw', head: 'Socket', drive: 'Allen' },
  // Countersunk
  'DIN 965': { type: 'Machine Screw', head: 'Countersunk', drive: 'Phillips' },
  'DIN 7991': { type: 'Socket Countersunk Screw', head: 'Countersunk', drive: 'Allen' },
  'ISO 10642': { type: 'Socket Countersunk Screw', head: 'Countersunk', drive: 'Allen' },
  // Button Head
  'ISO 7380': { type: 'Button Head Screw', head: 'Button', drive: 'Allen' },
  // Nuts
  'DIN 934': { type: 'Hex Nut', head: 'Hex' },
  'ISO 4032': { type: 'Hex Nut', head: 'Hex' },
  'ISO 4033': { type: 'Hex Nut', head: 'Hex' },
  'DIN 985': { type: 'Nyloc Nut', head: 'Hex' },
  'DIN 6923': { type: 'Flange Nut', head: 'Flange' },
  // Washers
  'DIN 125': { type: 'Flat Washer', head: 'Flat' },
  'DIN 127': { type: 'Spring Washer', head: 'Spring' },
  'DIN 9021': { type: 'Fender Washer', head: 'Flat' },
  // Set Screws
  'DIN 913': { type: 'Set Screw', head: 'Flat Point', drive: 'Allen' },
  'DIN 914': { type: 'Set Screw', head: 'Cone Point', drive: 'Allen' },
  'DIN 915': { type: 'Set Screw', head: 'Dog Point', drive: 'Allen' },
  'DIN 916': { type: 'Set Screw', head: 'Cup Point', drive: 'Allen' },
  // Studs
  'DIN 938': { type: 'Stud Bolt', head: 'Stud' },
  'DIN 939': { type: 'Stud Bolt', head: 'Stud' },
  'DIN 976': { type: 'Threaded Rod', head: 'Threaded' },
};

/**
 * Material codes with display names and colors
 */
export const MATERIAL_INFO: Record<string, { name: string; color: string }> = {
  'A2': { name: 'A2 (304 SS)', color: 'bg-emerald-100 text-emerald-800' },
  'A4': { name: 'A4 (316 SS)', color: 'bg-blue-100 text-blue-800' },
  '304': { name: '304 Stainless', color: 'bg-emerald-100 text-emerald-800' },
  '316': { name: '316 Stainless', color: 'bg-blue-100 text-blue-800' },
  '8.8': { name: 'Grade 8.8', color: 'bg-amber-100 text-amber-800' },
  '10.9': { name: 'Grade 10.9', color: 'bg-orange-100 text-orange-800' },
  '12.9': { name: 'Grade 12.9', color: 'bg-red-100 text-red-800' },
  'zinc': { name: 'Zinc Plated', color: 'bg-slate-100 text-slate-700' },
  'galvanized': { name: 'Galvanized', color: 'bg-slate-100 text-slate-700' },
  'brass': { name: 'Brass', color: 'bg-yellow-100 text-yellow-800' },
};

/**
 * Get product type info from DIN/ISO standard
 */
export function getStandardInfo(standard?: string): { type: string; head: string; drive?: string } | null {
  if (!standard) return null;

  // Normalize standard format (DIN912 -> DIN 912)
  const normalized = standard.toUpperCase().replace(/\s+/g, ' ').trim();

  // Try direct match
  if (STANDARD_INFO[normalized]) {
    return STANDARD_INFO[normalized];
  }

  // Try without space (DIN912)
  const withoutSpace = normalized.replace(/\s/g, '');
  for (const [key, info] of Object.entries(STANDARD_INFO)) {
    if (key.replace(/\s/g, '') === withoutSpace) {
      return info;
    }
  }

  return null;
}

/**
 * Parse and clean content from catalogue extraction
 * Fixes malformed prices, quantities, and formatting
 */
export function cleanProductContent(content: string): {
  cleanedContent: string;
  variants: Array<{ size: string; packaging?: number; price?: string }>;
} {
  if (!content) return { cleanedContent: '', variants: [] };

  const variants: Array<{ size: string; packaging?: number; price?: string }> = [];
  const lines = content.split(/[|\n]/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Parse variant lines like "M8x8 | Package: 20027pcs | Price: €,50"
    // Fix malformed patterns
    const sizeMatch = trimmed.match(/M\d+(?:\.\d+)?(?:x\d+)?/i);
    const packageMatch = trimmed.match(/(?:Package|Pkg|Pack)[:\s]*(\d+)/i);
    const priceMatch = trimmed.match(/(?:Price|€)[:\s]*€?(\d*),?(\d+)/i);

    if (sizeMatch) {
      const variant: { size: string; packaging?: number; price?: string } = {
        size: sizeMatch[0].toUpperCase(),
      };

      if (packageMatch) {
        // Fix concatenated numbers (20027 -> 200 likely, or extract properly)
        const pkgNum = parseInt(packageMatch[1]);
        // Common packaging sizes: 10, 25, 50, 100, 200, 500, 1000
        if (pkgNum > 1000 && pkgNum.toString().length >= 4) {
          // Likely concatenated, try to extract reasonable value
          const pkgStr = pkgNum.toString();
          variant.packaging = parseInt(pkgStr.substring(0, pkgStr.length - 2)) || pkgNum;
        } else {
          variant.packaging = pkgNum;
        }
      }

      if (priceMatch) {
        // Fix €,50 -> €0.50
        const euros = priceMatch[1] || '0';
        const cents = priceMatch[2] || '00';
        variant.price = `€${euros}.${cents.padStart(2, '0')}`;
      }

      variants.push(variant);
    }
  }

  // Build cleaned content
  let cleanedContent = content
    .replace(/\|/g, ' • ')
    .replace(/Package:\s*\d+pcs/gi, '')
    .replace(/Price:\s*€,?\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length
  if (cleanedContent.length > 200) {
    cleanedContent = cleanedContent.substring(0, 200) + '...';
  }

  return { cleanedContent, variants };
}

/**
 * Extract suggested quantity based on packaging or MOQ
 */
export function getSuggestedQuantity(product: Partial<ProductInfo>): number {
  // Try to extract from packagingUnit
  if (product.packagingUnit) {
    const match = product.packagingUnit.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) || 100;
    }
  }

  // Try to extract from content
  if (product.content) {
    const { variants } = cleanProductContent(product.content);
    if (variants.length > 0 && variants[0].packaging) {
      return variants[0].packaging;
    }
  }

  // Default MOQ for B2B
  return 100;
}

/**
 * Extract a readable product name from content or metadata
 */
export function extractProductName(product: Partial<ProductInfo>): string {
  // Use productName from API if available
  if (product.productName) {
    return product.productName;
  }

  // Try to build name from structured data
  const parts: string[] = [];

  // Get standard info for better product type
  const standardInfo = getStandardInfo(product.standard);

  if (product.standard) {
    parts.push(product.standard);
  }

  // Use head type from standard info or product
  const headType = product.headType || standardInfo?.head;
  if (headType && !parts.some(p => p.toLowerCase().includes(headType.toLowerCase()))) {
    parts.push(capitalizeFirst(headType));
  }

  // Add product type from standard info if no head type
  if (!headType && standardInfo?.type) {
    // Don't duplicate if already in parts
    if (!parts.some(p => standardInfo.type.includes(p))) {
      parts.push(standardInfo.type);
    }
  }

  if (product.threadType) {
    parts.push(product.threadType.toUpperCase());
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  // Fallback: extract from content (first line or first 50 chars)
  if (product.content) {
    const firstLine = product.content.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length <= 60) {
      return firstLine;
    }
    return product.content.substring(0, 50).trim() + '...';
  }

  // Last resort: use document name
  if (product.documentName) {
    return product.documentName.replace(/\.[^.]+$/, '');
  }

  return 'Product';
}

/**
 * Get material display info
 */
export function getMaterialInfo(material?: string): { name: string; color: string } | null {
  if (!material) return null;

  const normalized = material.toUpperCase().trim();

  // Check direct match
  if (MATERIAL_INFO[normalized]) {
    return MATERIAL_INFO[normalized];
  }

  // Check partial matches
  for (const [key, info] of Object.entries(MATERIAL_INFO)) {
    if (normalized.includes(key.toUpperCase())) {
      return info;
    }
  }

  // Return generic for unknown materials
  return { name: material, color: 'bg-gray-100 text-gray-700' };
}

/**
 * Format supplier name for display
 */
export function formatSupplier(supplier?: string | null): string {
  if (!supplier) return '';
  return supplier.toUpperCase();
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate WhatsApp message for product inquiry
 */
export function generateWhatsAppMessage(
  product: ProductInfo,
  quantity: number,
  unit: string,
  notes: string,
  company: string
): string {
  const productName = extractProductName(product);

  let message = `Hello, I would like to request a quote for:\n\n`;
  message += `*Product:* ${productName}\n`;
  if (product.material) message += `*Material:* ${product.material}\n`;
  if (product.supplier) message += `*Catalogue:* ${product.supplier}\n`;
  if (product.pageNumber) message += `*Reference:* Page ${product.pageNumber}\n`;
  message += `\n*Quantity:* ${quantity} ${unit}\n`;
  if (company) message += `*Company:* ${company}\n`;
  if (notes) message += `\n*Notes:* ${notes}\n`;
  message += `\nThank you!`;

  return message;
}

/**
 * Generate mailto link for product inquiry
 */
export function generateEmailSubject(product: ProductInfo): string {
  const productName = extractProductName(product);
  return `Quote Request: ${productName}`;
}

export function generateEmailBody(
  product: ProductInfo,
  quantity: number,
  unit: string,
  notes: string,
  company: string
): string {
  const productName = extractProductName(product);

  let body = `Hello,\n\nI would like to request a quote for:\n\n`;
  body += `Product: ${productName}\n`;
  if (product.material) body += `Material: ${product.material}\n`;
  if (product.supplier) body += `Catalogue: ${product.supplier}\n`;
  if (product.pageNumber) body += `Reference: Page ${product.pageNumber}\n`;
  body += `\nQuantity: ${quantity} ${unit}\n`;
  if (company) body += `Company: ${company}\n`;
  if (notes) body += `\nNotes: ${notes}\n`;
  body += `\nThank you!`;

  return body;
}

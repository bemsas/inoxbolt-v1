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
}

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
 * Extract a readable product name from content or metadata
 */
export function extractProductName(product: Partial<ProductInfo>): string {
  // Try to build name from structured data
  const parts: string[] = [];

  if (product.standard) {
    parts.push(product.standard);
  }

  if (product.headType) {
    parts.push(capitalizeFirst(product.headType));
  }

  // Add generic product type if we have thread info but no head type
  if (product.threadType && !product.headType) {
    parts.push('Fastener');
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

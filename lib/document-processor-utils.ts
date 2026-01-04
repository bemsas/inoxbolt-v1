/**
 * Document Processor Utilities
 * Extracted pure functions for testing and reuse
 */

export interface ChunkMetadata {
  documentId: string;
  documentName: string;
  supplier: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  productType?: string;
  material?: string;
  threadType?: string;
  headType?: string;
  standard?: string;
  productName?: string;
  dimensions?: string;
  finish?: string;
  priceInfo?: string;
  packagingUnit?: string;
  description?: string;
}

/**
 * Fix common PDF encoding issues
 */
export function fixEncoding(text: string): string {
  return text
    // Fix common UTF-8 encoding issues
    .replace(/Ã…/g, 'Å')  // Arrow symbol
    .replace(/Ã¥/g, 'å')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã©/g, 'é')
    .replace(/Ã±/g, 'ñ')
    .replace(/â€"/g, '–')  // En dash
    .replace(/â€"/g, '—')  // Em dash
    .replace(/â€™/g, "'")  // Right single quote
    .replace(/â€œ/g, '"')  // Left double quote
    .replace(/â€/g, '"')   // Right double quote
    .replace(/Â®/g, '®')   // Registered trademark
    .replace(/Â©/g, '©')   // Copyright
    .replace(/Â°/g, '°')   // Degree
    .replace(/Â /g, ' ')   // Non-breaking space
    // Clean up common PDF artifacts
    .replace(/\uf0b7/g, '•')  // Bullet point
    .replace(/\uf0d8/g, '→')  // Arrow
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Control characters
    .trim();
}

/**
 * Parse REYHER catalogue product line format
 */
export interface ParsedProduct {
  thread: string;
  length: number;
  packagingCode: string;
  packagingQty: number;
  price: number;
  material?: string;
}

export function parseProductLine(line: string): ParsedProduct | null {
  // Pattern: M 8x40S100270,00 or M 8x40 S100 270,00
  const pattern = /M\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*S?\s*(\d+)\s*([\d.,]+)\s*(brass|zinc|stainless|A[24]|8\.8|10\.9)?/i;
  const match = line.match(pattern);

  if (match) {
    const diameter = match[1];
    const length = parseFloat(match[2]);
    const packagingQty = parseInt(match[3], 10);
    const price = parseFloat(match[4].replace(',', '.'));
    const material = match[5]?.toLowerCase();

    return {
      thread: `M${diameter}x${length}`,
      length,
      packagingCode: 'S' + match[3],
      packagingQty,
      price,
      material,
    };
  }
  return null;
}

/**
 * Extract product description from section header
 */
export function extractProductDescription(content: string): string | null {
  const patterns = [
    /^([A-Z][a-z]+(?:\s+[a-z]+)*\s+(?:bolt|screw|nut|washer|stud)s?)/im,
    /^(Hexagon\s+\w+\s*(?:bolt|screw|nut)s?)/im,
    /^(Socket\s+\w+\s*(?:bolt|screw|cap)s?)/im,
    /^(Flat\s+\w+\s*(?:washer|head)s?)/im,
    /^(Spring\s+\w+\s*(?:washer|lock)s?)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract all thread sizes from content
 */
export function extractAllThreadSizes(content: string): string[] {
  const threads = content.match(/\bM\s*\d+(?:\.\d+)?(?:\s*x\s*\d+(?:\.\d+)?)?\b/gi) || [];
  const normalized = threads.map(t => t.replace(/\s+/g, '').toUpperCase());
  return [...new Set(normalized)];
}

/**
 * Extract price range from content
 */
export function extractPriceRange(content: string): { min: number; max: number } | null {
  const prices = content.match(/(\d+[.,]\d{2})\s*(?:€|EUR)?/g);
  if (prices && prices.length > 0) {
    const numPrices = prices.map(p => parseFloat(p.replace(',', '.')));
    return {
      min: Math.min(...numPrices),
      max: Math.max(...numPrices),
    };
  }
  return null;
}

/**
 * Extract keywords for hybrid search
 */
export function extractKeywords(content: string): string[] {
  const keywords: string[] = [];

  // Extract DIN/ISO standards
  const standards = content.match(/\b(DIN\s*\d+|ISO\s*\d+|ANSI\s*[A-Z]*\d*)\b/gi) || [];
  keywords.push(...standards.map(s => s.replace(/\s+/g, '').toUpperCase()));

  // Extract thread sizes
  const threads = content.match(/\bM\d{1,2}(?:x[\d.]+)?\b/gi) || [];
  keywords.push(...threads.map(t => t.toUpperCase()));

  // Extract material codes
  const materials = content.match(/\b(A2|A4|304|316|8\.8|10\.9|12\.9)\b/gi) || [];
  keywords.push(...materials);

  // Extract product names
  const products = content.match(/\b(bolt|nut|washer|screw|stud|hex|socket|flange|cap|spring|lock)\b/gi) || [];
  keywords.push(...products.map(p => p.toLowerCase()));

  return [...new Set(keywords)];
}

/**
 * Extract product metadata from chunk content
 */
export function extractProductMetadata(content: string): Partial<ChunkMetadata> {
  const metadata: Partial<ChunkMetadata> = {};

  // Extract product description/name
  const description = extractProductDescription(content);
  if (description) {
    metadata.productName = description;
    metadata.description = description;
  }

  // Detect product type
  const productPatterns: Record<string, RegExp> = {
    bolt: /\b(bolt|perno|tornillo|hex\s*bolt|hexagon\s*bolt)\b/i,
    nut: /\b(nut|tuerca|hex\s*nut)\b/i,
    washer: /\b(washer|arandela|flat\s*washer|spring\s*washer)\b/i,
    screw: /\b(screw|tornillo|cap\s*screw|machine\s*screw)\b/i,
    stud: /\b(stud|esparrago|threaded\s*stud)\b/i,
    anchor: /\b(anchor|ancla|expansion\s*anchor)\b/i,
    rivet: /\b(rivet|remache)\b/i,
  };

  for (const [type, pattern] of Object.entries(productPatterns)) {
    if (pattern.test(content)) {
      metadata.productType = type;
      break;
    }
  }

  // Detect thread type
  const threadMatch = content.match(/\b(M\d{1,2}(?:x[\d.]+)?)\b/i);
  if (threadMatch) {
    metadata.threadType = threadMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // Extract all thread sizes for dimensions
  const allThreads = extractAllThreadSizes(content);
  if (allThreads.length > 0) {
    metadata.dimensions = allThreads.slice(0, 10).join(', ');
  }

  // Detect material
  const materialPatterns: Record<string, RegExp> = {
    'A2': /\b(A2|304|18-8|stainless\s*304)\b/i,
    'A4': /\b(A4|316|stainless\s*316)\b/i,
    '8.8': /\b8\.8\b/,
    '10.9': /\b10\.9\b/,
    '12.9': /\b12\.9\b/,
    'brass': /\bbrass\b/i,
    'zinc': /\b(zinc|galvanized|verzinkt)\b/i,
    'phosphate': /\b(phosphate|phosphatiert)\b/i,
    'plain': /\bplain\b/i,
  };

  for (const [material, pattern] of Object.entries(materialPatterns)) {
    if (pattern.test(content)) {
      metadata.material = material;
      break;
    }
  }

  // Detect surface finish
  const finishPatterns: Record<string, RegExp> = {
    'zinc-plated': /\b(zinc\s*plated|verzinkt|galvanized)\b/i,
    'hot-dip-galvanized': /\b(hot\s*dip|feuerverzinkt)\b/i,
    'black-oxide': /\b(black\s*oxide|brüniert)\b/i,
    'passivated': /\b(passivated|passiviert)\b/i,
    'plain': /\b(plain|blank)\b/i,
  };

  for (const [finish, pattern] of Object.entries(finishPatterns)) {
    if (pattern.test(content)) {
      metadata.finish = finish;
      break;
    }
  }

  // Detect head type
  const headPatterns: Record<string, RegExp> = {
    'hex': /\b(hex|hexagon|sechskant|DIN\s*93[13]|ISO\s*401[47])\b/i,
    'socket': /\b(socket|allen|innensechskant|DIN\s*912|ISO\s*4762)\b/i,
    'pan': /\b(pan\s*head|linsenkopf)\b/i,
    'countersunk': /\b(countersunk|flat\s*head|senkkopf|DIN\s*965|ISO\s*10642)\b/i,
    'button': /\b(button\s*head|halbrundkopf|ISO\s*7380)\b/i,
    'flange': /\b(flange|flansch|DIN\s*6921)\b/i,
  };

  for (const [head, pattern] of Object.entries(headPatterns)) {
    if (pattern.test(content)) {
      metadata.headType = head;
      break;
    }
  }

  // Detect standard - extract ALL standards found, prioritize first one
  // Also normalize format: "DIN 933" (with space for display)
  const standardPatterns = [
    /\b(DIN)\s*(\d+[A-Z]?)\b/gi,
    /\b(ISO)\s*(\d+[A-Z]?)\b/gi,
    /\b(EN)\s*(\d+[A-Z]?)\b/gi,
  ];

  const foundStandards: string[] = [];
  for (const pattern of standardPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const prefix = match[1].toUpperCase();
      const number = match[2].toUpperCase();
      const normalized = `${prefix} ${number}`; // Normalized with space
      if (!foundStandards.includes(normalized)) {
        foundStandards.push(normalized);
      }
    }
  }

  if (foundStandards.length > 0) {
    // Use first found standard as primary, store all in keywords
    metadata.standard = foundStandards[0];
  }

  // Extract price info
  const priceRange = extractPriceRange(content);
  if (priceRange) {
    metadata.priceInfo = `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`;
  }

  // Detect packaging unit
  const packagingMatch = content.match(/\bS\s*(\d+)\b/);
  if (packagingMatch) {
    metadata.packagingUnit = `${packagingMatch[1]} pcs`;
  }

  return metadata;
}

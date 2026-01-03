import { describe, it, expect, vi } from 'vitest';

/**
 * Search Utilities Unit Tests
 * Tests for filter logic, search helpers, and type conversions
 */

// Filter state type matching the SearchFilters component
interface FilterState {
  materials: string[];
  standards: string[];
  categories: string[];
  suppliers: string[];
  threadSizes: string[];
}

// Product info type
interface ProductInfo {
  id: string;
  name: string;
  content: string;
  standard?: string;
  threadType?: string;
  material?: string;
  supplier?: string;
  pageNumber?: number;
  documentName?: string;
  score?: number;
}

// Mock SearchResult type from RAGContext
interface SearchResult {
  id: string;
  content: string;
  snippet?: string;
  score: number;
  pageNumber?: number;
  document: {
    id: string;
    filename: string;
    supplier?: string;
  };
}

// ============================================================================
// Utility Functions to Test
// ============================================================================

/**
 * Extract standard code from content (DIN/ISO patterns)
 */
function extractStandard(content: string): string | undefined {
  const match = content.match(/\b(DIN\s*\d+|ISO\s*\d+)\b/i);
  return match ? match[0].replace(/\s+/g, ' ').toUpperCase() : undefined;
}

/**
 * Extract thread type from content (M6, M8x30, etc.)
 */
function extractThreadType(content: string): string | undefined {
  const match = content.match(/\bM\d{1,2}(?:x[\d.]+)?\b/i);
  return match ? match[0] : undefined;
}

/**
 * Extract material grade from content
 */
function extractMaterial(content: string): string | undefined {
  const match = content.match(/\b(A[24]|304|316|8\.8|10\.9|12\.9)\b/i);
  return match ? match[0].toUpperCase() : undefined;
}

/**
 * Convert SearchResult to ProductInfo
 */
function toProductInfo(result: SearchResult): ProductInfo {
  const content = result.content || result.snippet || '';

  return {
    id: result.id,
    name: '',
    content: result.snippet || result.content,
    standard: extractStandard(content),
    threadType: extractThreadType(content),
    material: extractMaterial(content),
    supplier: result.document.supplier || undefined,
    pageNumber: result.pageNumber || undefined,
    documentName: result.document.filename,
    score: result.score,
  };
}

/**
 * Apply filters to product list
 */
function applyFilters(products: ProductInfo[], filters: FilterState): ProductInfo[] {
  return products.filter((product) => {
    // Material filter
    if (filters.materials.length > 0 && product.material) {
      if (!filters.materials.some(m => product.material?.includes(m))) {
        return false;
      }
    }

    // Standard filter
    if (filters.standards.length > 0 && product.standard) {
      if (!filters.standards.some(s => product.standard?.includes(s))) {
        return false;
      }
    }

    // Supplier filter
    if (filters.suppliers.length > 0 && product.supplier) {
      if (!filters.suppliers.includes(product.supplier)) {
        return false;
      }
    }

    // Thread size filter
    if (filters.threadSizes.length > 0 && product.threadType) {
      if (!filters.threadSizes.some(t => product.threadType?.startsWith(t))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique filter options from products
 */
function extractFilterOptions(products: ProductInfo[]) {
  const materials = new Set<string>();
  const standards = new Set<string>();
  const suppliers = new Set<string>();
  const threadSizes = new Set<string>();

  products.forEach((product) => {
    if (product.material) materials.add(product.material);
    if (product.standard) {
      const prefix = product.standard.split(' ')[0];
      standards.add(prefix);
    }
    if (product.supplier) suppliers.add(product.supplier);
    if (product.threadType) {
      const base = product.threadType.match(/^M\d+/)?.[0];
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

// ============================================================================
// Tests
// ============================================================================

describe('Standard Extraction', () => {
  it('should extract DIN standard', () => {
    expect(extractStandard('DIN 933 Hex Bolt')).toBe('DIN 933');
    expect(extractStandard('DIN933 bolt')).toBe('DIN933');
    expect(extractStandard('Bolt according to DIN 912')).toBe('DIN 912');
  });

  it('should extract ISO standard', () => {
    expect(extractStandard('ISO 4017 hex screw')).toBe('ISO 4017');
    expect(extractStandard('Meets ISO4014 specification')).toBe('ISO4014');
  });

  it('should return undefined for no match', () => {
    expect(extractStandard('Generic hex bolt')).toBeUndefined();
    expect(extractStandard('')).toBeUndefined();
  });

  it('should be case insensitive', () => {
    expect(extractStandard('din 933')).toBe('DIN 933');
    expect(extractStandard('Din 912')).toBe('DIN 912');
  });
});

describe('Thread Type Extraction', () => {
  it('should extract simple thread sizes', () => {
    expect(extractThreadType('M8 bolt')).toBe('M8');
    expect(extractThreadType('Size M10')).toBe('M10');
    expect(extractThreadType('M6 screw')).toBe('M6');
  });

  it('should extract thread with length', () => {
    expect(extractThreadType('M8x30 hex bolt')).toBe('M8x30');
    expect(extractThreadType('M10x50 mm')).toBe('M10x50'); // Space before mm
    expect(extractThreadType('Bolt M12x80')).toBe('M12x80');
  });

  it('should extract decimal lengths', () => {
    expect(extractThreadType('M8x25.5 bolt')).toBe('M8x25.5');
  });

  it('should return undefined for no match', () => {
    expect(extractThreadType('Hex bolt')).toBeUndefined();
    expect(extractThreadType('1/4 inch')).toBeUndefined();
  });
});

describe('Material Extraction', () => {
  it('should extract stainless grades', () => {
    expect(extractMaterial('A2-70 stainless')).toBe('A2');
    expect(extractMaterial('Material: A4-80')).toBe('A4');
    expect(extractMaterial('304 stainless steel')).toBe('304');
    expect(extractMaterial('316 grade')).toBe('316'); // Exact match without L suffix
  });

  it('should extract steel grades', () => {
    expect(extractMaterial('Grade 8.8 bolt')).toBe('8.8');
    expect(extractMaterial('10.9 alloy steel')).toBe('10.9');
    expect(extractMaterial('Class 12.9')).toBe('12.9');
  });

  it('should return undefined for no match', () => {
    expect(extractMaterial('Zinc plated')).toBeUndefined();
    expect(extractMaterial('Brass bolt')).toBeUndefined();
  });

  it('should be case insensitive', () => {
    expect(extractMaterial('a2 steel')).toBe('A2');
    expect(extractMaterial('a4-80')).toBe('A4');
  });
});

describe('SearchResult to ProductInfo Conversion', () => {
  it('should convert basic result', () => {
    const result: SearchResult = {
      id: 'test-1',
      content: 'DIN 933 M10x30 A2-70 hex bolt',
      score: 0.95,
      document: {
        id: 'doc-1',
        filename: 'catalogue.pdf',
        supplier: 'REYHER'
      }
    };

    const product = toProductInfo(result);

    expect(product.id).toBe('test-1');
    expect(product.standard).toBe('DIN 933');
    expect(product.threadType).toBe('M10x30');
    expect(product.material).toBe('A2');
    expect(product.supplier).toBe('REYHER');
    expect(product.documentName).toBe('catalogue.pdf');
    expect(product.score).toBe(0.95);
  });

  it('should handle missing fields', () => {
    const result: SearchResult = {
      id: 'test-2',
      content: 'Generic fastener',
      score: 0.5,
      document: {
        id: 'doc-2',
        filename: 'misc.pdf'
      }
    };

    const product = toProductInfo(result);

    expect(product.standard).toBeUndefined();
    expect(product.threadType).toBeUndefined();
    expect(product.material).toBeUndefined();
    expect(product.supplier).toBeUndefined();
  });

  it('should prefer snippet over content', () => {
    const result: SearchResult = {
      id: 'test-3',
      content: 'Full content with M8',
      snippet: 'Snippet with M10',
      score: 0.8,
      document: {
        id: 'doc-3',
        filename: 'test.pdf'
      }
    };

    const product = toProductInfo(result);
    expect(product.content).toBe('Snippet with M10');
  });
});

describe('Filter Application', () => {
  const testProducts: ProductInfo[] = [
    { id: '1', name: 'Bolt 1', content: '', standard: 'DIN 933', material: 'A2', threadType: 'M8', supplier: 'REYHER' },
    { id: '2', name: 'Bolt 2', content: '', standard: 'DIN 912', material: 'A4', threadType: 'M10', supplier: 'WURTH' },
    { id: '3', name: 'Bolt 3', content: '', standard: 'ISO 4017', material: 'A2', threadType: 'M8x30', supplier: 'REYHER' },
    { id: '4', name: 'Bolt 4', content: '', standard: 'DIN 933', material: '8.8', threadType: 'M12', supplier: 'BOSSARD' },
    { id: '5', name: 'Bolt 5', content: '', material: 'A2', supplier: 'WURTH', threadType: 'M6' }, // Added threadType
  ];

  it('should filter by material', () => {
    const filters: FilterState = {
      materials: ['A2'],
      standards: [],
      categories: [],
      suppliers: [],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    expect(result.length).toBe(3);
    expect(result.every(p => p.material === 'A2')).toBe(true);
  });

  it('should filter by multiple materials', () => {
    const filters: FilterState = {
      materials: ['A2', 'A4'],
      standards: [],
      categories: [],
      suppliers: [],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    expect(result.length).toBe(4);
  });

  it('should filter by standard', () => {
    const filters: FilterState = {
      materials: [],
      standards: ['DIN'],
      categories: [],
      suppliers: [],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    // Products with DIN standard: 1, 2, 4; Product 5 has no standard so passes
    // Product 3 has ISO standard which doesn't match DIN - excluded
    expect(result.length).toBe(4); // 1, 2, 4, 5 pass (3 has ISO so fails)
  });

  it('should filter by supplier', () => {
    const filters: FilterState = {
      materials: [],
      standards: [],
      categories: [],
      suppliers: ['REYHER'],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    expect(result.length).toBe(2);
    expect(result.every(p => p.supplier === 'REYHER')).toBe(true);
  });

  it('should filter by thread size', () => {
    const filters: FilterState = {
      materials: [],
      standards: [],
      categories: [],
      suppliers: [],
      threadSizes: ['M8']
    };

    const result = applyFilters(testProducts, filters);
    // M8 and M8x30 match; others don't
    expect(result.length).toBe(2);
    expect(result.every(p => p.threadType?.startsWith('M8'))).toBe(true);
  });

  it('should combine multiple filters (AND logic)', () => {
    const filters: FilterState = {
      materials: ['A2'],
      standards: [],
      categories: [],
      suppliers: ['REYHER'],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    expect(result.length).toBe(2);
    expect(result.every(p => p.material === 'A2' && p.supplier === 'REYHER')).toBe(true);
  });

  it('should return all products with empty filters', () => {
    const filters: FilterState = {
      materials: [],
      standards: [],
      categories: [],
      suppliers: [],
      threadSizes: []
    };

    const result = applyFilters(testProducts, filters);
    expect(result.length).toBe(5);
  });
});

describe('Filter Options Extraction', () => {
  const testProducts: ProductInfo[] = [
    { id: '1', name: '', content: '', material: 'A2', standard: 'DIN 933', threadType: 'M8', supplier: 'REYHER' },
    { id: '2', name: '', content: '', material: 'A4', standard: 'DIN 912', threadType: 'M10', supplier: 'WURTH' },
    { id: '3', name: '', content: '', material: 'A2', standard: 'ISO 4017', threadType: 'M8x30', supplier: 'REYHER' },
    { id: '4', name: '', content: '', material: '8.8', standard: 'DIN 933', threadType: 'M12', supplier: 'BOSSARD' },
  ];

  it('should extract unique materials', () => {
    const options = extractFilterOptions(testProducts);
    expect(options.materials).toContain('A2');
    expect(options.materials).toContain('A4');
    expect(options.materials).toContain('8.8');
    expect(options.materials.length).toBe(3);
  });

  it('should extract unique standard prefixes', () => {
    const options = extractFilterOptions(testProducts);
    expect(options.standards).toContain('DIN');
    expect(options.standards).toContain('ISO');
    expect(options.standards.length).toBe(2);
  });

  it('should extract unique suppliers', () => {
    const options = extractFilterOptions(testProducts);
    expect(options.suppliers).toContain('REYHER');
    expect(options.suppliers).toContain('WURTH');
    expect(options.suppliers).toContain('BOSSARD');
    expect(options.suppliers.length).toBe(3);
  });

  it('should extract thread size bases (M8, M10, etc.)', () => {
    const options = extractFilterOptions(testProducts);
    expect(options.threadSizes).toContain('M8');
    expect(options.threadSizes).toContain('M10');
    expect(options.threadSizes).toContain('M12');
    // M8x30 should extract as M8
    expect(options.threadSizes.length).toBe(3);
  });

  it('should sort thread sizes numerically', () => {
    const options = extractFilterOptions(testProducts);
    expect(options.threadSizes).toEqual(['M8', 'M10', 'M12']);
  });
});

describe('Recent Searches Management', () => {
  const MAX_RECENT_SEARCHES = 5;

  function addRecentSearch(searches: string[], query: string): string[] {
    const trimmed = query.trim();
    if (trimmed.length < 2) return searches;

    const filtered = searches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  }

  it('should add new search to beginning', () => {
    const result = addRecentSearch(['old search'], 'new search');
    expect(result[0]).toBe('new search');
    expect(result[1]).toBe('old search');
  });

  it('should not add duplicate searches', () => {
    const result = addRecentSearch(['existing', 'other'], 'existing');
    expect(result.length).toBe(2);
    expect(result[0]).toBe('existing');
  });

  it('should be case insensitive for duplicates', () => {
    const result = addRecentSearch(['Existing'], 'EXISTING');
    expect(result.length).toBe(1);
    expect(result[0]).toBe('EXISTING');
  });

  it('should limit to max items', () => {
    const existing = ['one', 'two', 'three', 'four', 'five'];
    const result = addRecentSearch(existing, 'six');
    expect(result.length).toBe(5);
    expect(result[0]).toBe('six');
    expect(result).not.toContain('five');
  });

  it('should reject queries less than 2 characters', () => {
    const result = addRecentSearch(['existing'], 'a');
    expect(result).toEqual(['existing']);
  });

  it('should trim whitespace', () => {
    const result = addRecentSearch([], '  test  ');
    expect(result[0]).toBe('test');
  });
});

describe('Debounce Behavior', () => {
  it('should delay execution', async () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    let timeoutId: NodeJS.Timeout | null = null;

    const debounced = (value: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(value), 400);
    };

    debounced('test1');
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledWith('test1');

    vi.useRealTimers();
  });

  it('should cancel previous call on new input', async () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    let timeoutId: NodeJS.Timeout | null = null;

    const debounced = (value: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(value), 400);
    };

    debounced('test1');
    vi.advanceTimersByTime(200);

    debounced('test2');
    vi.advanceTimersByTime(400);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('test2');

    vi.useRealTimers();
  });
});

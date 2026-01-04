/**
 * Unit Tests: Enhanced Extractor
 * Tests for pattern-based product extraction from PDF text
 */

import { describe, it, expect } from 'vitest';
import {
  extractProductsFromTextBlock,
  extractTablesFromText,
} from '../../lib/enhanced-extractor';

describe('Enhanced Extractor', () => {
  describe('extractProductsFromTextBlock', () => {
    it('should extract products with DIN standard and thread spec', () => {
      const text = `
        DIN 933 Hexagon head bolt
        M8x30 A2-70 S100 25.50
        M10x40 A2-70 S100 32.80
        M12x50 A4-80 S50 48.20
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1, 'reyher');

      expect(products.length).toBeGreaterThan(0);
      expect(products[0].standard).toBe('DIN 933');
      expect(products.some(p => p.threadSpec === 'M8x30')).toBe(true);
      expect(products.some(p => p.threadSpec === 'M10x40')).toBe(true);
    });

    it('should extract products with ISO standard', () => {
      const text = `
        ISO 4017 Hexagon head screw
        M6x20 A2 100pcs 18.90 EUR
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      expect(products.length).toBeGreaterThan(0);
      expect(products.some(p => p.standard?.includes('ISO 4017'))).toBe(true);
    });

    it('should extract material grades correctly', () => {
      const text = `
        DIN 912 Socket cap screw
        M8x25 A2-70 200 15.40
        M8x30 A4-80 100 22.60
        M8x35 8.8 verzinkt 500 8.90
        M8x40 10.9 phosphate 250 12.30
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      const materials = products.map(p => p.material);
      expect(materials).toContain('a2-70');
      expect(materials).toContain('a4-80');
    });

    it('should extract pricing information', () => {
      const text = `
        M10x50 S100 45.80 EUR
        M12x60 S50 58.20
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      expect(products.some(p => p.pricing?.boxPrice === 45.80)).toBe(true);
      expect(products.some(p => p.pricing?.boxQuantity === 100)).toBe(true);
    });

    it('should handle context from section headers', () => {
      const text = `
        DIN 934 Hexagon nut
        A2-70 stainless steel

        M6 S500 12.40
        M8 S200 15.80
        M10 S100 22.50
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      // All products should inherit the DIN 934 standard from header
      expect(products.every(p => p.standard === 'DIN 934' || p.category === 'nut')).toBe(true);
    });

    it('should assign correct categories', () => {
      const text = `
        DIN 933 Hex bolt M8x30
        DIN 912 Socket cap screw M6x20
        DIN 934 Hex nut M10
        DIN 125 Flat washer M8
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      const categories = products.map(p => p.category);
      expect(categories).toContain('bolt');
      expect(categories).toContain('screw');
      expect(categories).toContain('nut');
      expect(categories).toContain('washer');
    });

    it('should calculate confidence scores', () => {
      const text = `
        DIN 933 M8x30 A2-70 S100 25.50
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      expect(products[0].confidence.overall).toBeGreaterThan(0.5);
      expect(products[0].confidence.dimensions).toBeGreaterThan(0.8);
      expect(products[0].confidence.material).toBeGreaterThan(0.8);
      expect(products[0].confidence.pricing).toBeGreaterThan(0.8);
    });

    it('should handle German text', () => {
      const text = `
        DIN 931 Sechskantschraube mit Schaft
        M16x80 8.8 verzinkt S50 42.30
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);

      expect(products.length).toBeGreaterThan(0);
      expect(products[0].threadSpec).toBe('M16x80');
    });

    it('should handle empty or invalid text', () => {
      expect(extractProductsFromTextBlock('', 'doc-1', 1)).toEqual([]);
      expect(extractProductsFromTextBlock('no products here', 'doc-1', 1)).toEqual([]);
      expect(extractProductsFromTextBlock('just numbers 123 456', 'doc-1', 1)).toEqual([]);
    });

    it('should assign unique IDs to products', () => {
      const text = `
        M8x30 A2 100 25.50
        M8x40 A2 100 28.30
        M8x50 A2 100 31.20
      `;

      const products = extractProductsFromTextBlock(text, 'doc-1', 1);
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('extractTablesFromText', () => {
    it('should detect table-like structures', () => {
      const text = `
        Size    Length    Pack    Price
        M6      20        200     15.80
        M6      25        200     16.40
        M6      30        200     17.20
        M8      25        100     18.90
        M8      30        100     19.80
      `;

      const tables = extractTablesFromText(text);

      expect(tables.length).toBeGreaterThan(0);
      expect(tables[0].rows.length).toBeGreaterThan(0);
    });

    it('should detect column types', () => {
      const text = `
        Thread    Length    Material    Price EUR
        M8        30        A2          25.50
        M10       40        A4          32.80
      `;

      const tables = extractTablesFromText(text);

      if (tables.length > 0) {
        const columnTypes = tables[0].columns.map(c => c.type);
        expect(columnTypes).toContain('thread');
      }
    });

    it('should handle tab-separated data', () => {
      const text = `
        M8x30\t100\t25.50
        M8x40\t100\t28.30
        M8x50\t100\t31.20
      `;

      const tables = extractTablesFromText(text);

      expect(tables.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-tabular text', () => {
      const text = `
        This is just a paragraph of text without any tabular structure.
        It contains some words but no columns or rows.
      `;

      const tables = extractTablesFromText(text);

      expect(tables).toEqual([]);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle mixed language content', () => {
    const text = `
      DIN 933 Hexagon bolt / Sechskantschraube
      Tornillo hexagonal / Vis à tête hexagonale
      M8x30 A2-70
    `;

    const products = extractProductsFromTextBlock(text, 'doc-1', 1);

    expect(products.length).toBeGreaterThan(0);
    expect(products[0].threadSpec).toBe('M8x30');
  });

  it('should handle multiple standards on same line', () => {
    const text = `
      DIN 933 / ISO 4017 Hex bolt M10x50 A2
    `;

    const products = extractProductsFromTextBlock(text, 'doc-1', 1);

    expect(products.length).toBeGreaterThan(0);
    // Should capture at least one standard
    expect(products[0].standard).toMatch(/DIN 933|ISO 4017/);
  });

  it('should handle fine thread specifications', () => {
    const text = `
      M10x1.25x50 fine thread bolt A2
      M12x1.5x60 fine pitch screw A4
    `;

    const products = extractProductsFromTextBlock(text, 'doc-1', 1);

    expect(products.length).toBeGreaterThan(0);
  });

  it('should handle price formats with comma decimals', () => {
    const text = `
      M8x30 S100 25,50 EUR
      M10x40 S100 32,80
    `;

    const products = extractProductsFromTextBlock(text, 'doc-1', 1);

    expect(products.some(p => p.pricing?.boxPrice === 25.5)).toBe(true);
  });
});

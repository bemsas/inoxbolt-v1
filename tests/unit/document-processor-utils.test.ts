/**
 * Unit Tests: Document Processor Utils
 * Tests for metadata extraction and processing utilities
 */

import { describe, it, expect } from 'vitest';
import {
  fixEncoding,
  extractProductMetadata,
  extractKeywords,
  extractAllThreadSizes,
  extractPriceRange,
  parseThreadDimensions,
  detectProductCategory,
  normalizeMaterialCode,
  findEquivalentStandards,
} from '../../lib/document-processor-utils';

describe('Document Processor Utils', () => {
  describe('fixEncoding', () => {
    it('should fix common UTF-8 encoding issues', () => {
      expect(fixEncoding('Ã¤')).toBe('ä');
      expect(fixEncoding('Ã¶')).toBe('ö');
      expect(fixEncoding('Ã¼')).toBe('ü');
      expect(fixEncoding('Ã©')).toBe('é');
      expect(fixEncoding('Ã±')).toBe('ñ');
    });

    it('should fix special characters', () => {
      expect(fixEncoding('Â®')).toBe('®');
      expect(fixEncoding('Â©')).toBe('©');
      expect(fixEncoding('Â°')).toBe('°');
    });

    it('should remove control characters', () => {
      const input = 'hello\x00world\x0B';
      const result = fixEncoding(input);
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x0B');
    });

    it('should trim whitespace', () => {
      expect(fixEncoding('  text  ')).toBe('text');
    });
  });

  describe('extractProductMetadata', () => {
    it('should extract standard from content', () => {
      const content = 'DIN 933 Hexagon head bolt M8x30';
      const metadata = extractProductMetadata(content);
      expect(metadata.standard).toBe('DIN 933');
    });

    it('should extract ISO standard', () => {
      const content = 'ISO 4017 Hex bolt fully threaded';
      const metadata = extractProductMetadata(content);
      expect(metadata.standard).toBe('ISO 4017');
    });

    it('should extract thread type', () => {
      const content = 'Socket cap screw M10x50 A2';
      const metadata = extractProductMetadata(content);
      expect(metadata.threadType).toBe('M10X50');
    });

    it('should extract material', () => {
      const content = 'Hex bolt A4-80 stainless steel';
      const metadata = extractProductMetadata(content);
      expect(metadata.material).toBe('A4');
    });

    it('should detect product type', () => {
      const content = 'Hexagon bolt with full thread';
      const metadata = extractProductMetadata(content);
      expect(metadata.productType).toBe('bolt');
    });

    it('should detect head type', () => {
      const content = 'Socket head cap screw DIN 912';
      const metadata = extractProductMetadata(content);
      expect(metadata.headType).toBe('socket');
    });

    it('should extract price range', () => {
      const content = 'M8x30 S100 25,50 EUR M8x40 S100 28,30 EUR';
      const metadata = extractProductMetadata(content);
      expect(metadata.priceInfo).toBeDefined();
      expect(metadata.priceInfo).toMatch(/€[\d.]+\s*-\s*€[\d.]+/);
    });

    it('should extract packaging unit', () => {
      const content = 'M8x30 S100 zinc plated';
      const metadata = extractProductMetadata(content);
      expect(metadata.packagingUnit).toBe('100 pcs');
      expect(metadata.boxQuantity).toBe(100);
    });

    it('should calculate confidence score', () => {
      const content = 'DIN 933 M8x30 A2-70 S100 25.50';
      const metadata = extractProductMetadata(content);
      expect(metadata.confidence).toBeGreaterThan(0.5);
    });

    it('should find equivalent standards', () => {
      const content = 'DIN 933 Hex bolt';
      const metadata = extractProductMetadata(content);
      expect(metadata.equivalentStandards).toContain('ISO4017');
    });
  });

  describe('extractKeywords', () => {
    it('should extract DIN/ISO standards', () => {
      const content = 'DIN 933 and ISO 4017 hex bolt';
      const keywords = extractKeywords(content);
      expect(keywords).toContain('DIN933');
      expect(keywords).toContain('ISO4017');
    });

    it('should extract thread sizes', () => {
      const content = 'Available in M6, M8, M10x30';
      const keywords = extractKeywords(content);
      expect(keywords).toContain('M6');
      expect(keywords).toContain('M8');
      expect(keywords).toContain('M10X30');
    });

    it('should extract material codes', () => {
      const content = 'Material: A2-70 or A4-80 stainless';
      const keywords = extractKeywords(content);
      expect(keywords).toContain('A2');
      expect(keywords).toContain('A4');
    });

    it('should extract product names', () => {
      const content = 'Hex bolt with spring washer and hex nut';
      const keywords = extractKeywords(content);
      expect(keywords).toContain('bolt');
      expect(keywords).toContain('washer');
      expect(keywords).toContain('nut');
    });

    it('should deduplicate keywords', () => {
      const content = 'M8 bolt M8 bolt M8 bolt';
      const keywords = extractKeywords(content);
      const m8Count = keywords.filter(k => k === 'M8').length;
      expect(m8Count).toBe(1);
    });
  });

  describe('extractAllThreadSizes', () => {
    it('should extract multiple thread sizes', () => {
      const content = 'M6, M8, M10, M12 available';
      const threads = extractAllThreadSizes(content);
      expect(threads).toContain('M6');
      expect(threads).toContain('M8');
      expect(threads).toContain('M10');
      expect(threads).toContain('M12');
    });

    it('should normalize thread format', () => {
      const content = 'M 8 x 30 and M10x40';
      const threads = extractAllThreadSizes(content);
      expect(threads.some(t => t.includes('M8'))).toBe(true);
      expect(threads.some(t => t.includes('M10'))).toBe(true);
    });

    it('should deduplicate threads', () => {
      const content = 'M8 M8 M8x30 M8x30';
      const threads = extractAllThreadSizes(content);
      expect(threads.length).toBeLessThan(4);
    });
  });

  describe('extractPriceRange', () => {
    it('should extract price range from content', () => {
      const content = '15.50 EUR to 28.30 EUR';
      const range = extractPriceRange(content);
      expect(range).toBeDefined();
      expect(range?.min).toBe(15.5);
      expect(range?.max).toBe(28.3);
    });

    it('should handle comma decimal format', () => {
      const content = '15,50 EUR and 28,30';
      const range = extractPriceRange(content);
      expect(range).toBeDefined();
      expect(range?.min).toBe(15.5);
    });

    it('should return null for no prices', () => {
      const content = 'No prices here';
      const range = extractPriceRange(content);
      expect(range).toBeNull();
    });
  });

  describe('parseThreadDimensions', () => {
    it('should parse thread diameter only', () => {
      const result = parseThreadDimensions('M8');
      expect(result).toEqual({ diameter: 8, length: undefined });
    });

    it('should parse thread diameter and length', () => {
      const result = parseThreadDimensions('M10x50');
      expect(result).toEqual({ diameter: 10, length: 50 });
    });

    it('should handle decimal values', () => {
      const result = parseThreadDimensions('M6.5x25.5');
      expect(result?.diameter).toBe(6.5);
      expect(result?.length).toBe(25.5);
    });

    it('should return null for invalid format', () => {
      expect(parseThreadDimensions('')).toBeNull();
      expect(parseThreadDimensions('invalid')).toBeNull();
    });
  });

  describe('detectProductCategory', () => {
    it('should detect category from DIN bolt standards', () => {
      expect(detectProductCategory('DIN 933 hex bolt')).toBe('bolt');
      expect(detectProductCategory('DIN 931 hexagon head screw')).toBe('bolt');
    });

    it('should detect category from ISO standards', () => {
      expect(detectProductCategory('ISO 4762 socket cap screw')).toBe('screw');
      expect(detectProductCategory('ISO 4032 hex nut')).toBe('nut');
    });

    it('should detect from keywords', () => {
      expect(detectProductCategory('flat washer zinc plated')).toBe('washer');
      expect(detectProductCategory('expansion anchor concrete')).toBe('anchor');
    });

    it('should use productType if provided', () => {
      expect(detectProductCategory('some content', 'bolt')).toBe('bolt');
      expect(detectProductCategory('some content', 'nut')).toBe('nut');
    });

    it('should return other for unknown', () => {
      expect(detectProductCategory('random text')).toBe('other');
    });
  });

  describe('normalizeMaterialCode', () => {
    it('should normalize stainless grades', () => {
      expect(normalizeMaterialCode('A2')).toBe('A2-70');
      expect(normalizeMaterialCode('a4')).toBe('A4-70');
      expect(normalizeMaterialCode('304')).toBe('A2-70');
      expect(normalizeMaterialCode('316')).toBe('A4-70');
    });

    it('should normalize steel grades', () => {
      expect(normalizeMaterialCode('8.8')).toBe('8.8');
      expect(normalizeMaterialCode('88')).toBe('8.8');
      expect(normalizeMaterialCode('10.9')).toBe('10.9');
      expect(normalizeMaterialCode('109')).toBe('10.9');
    });

    it('should preserve unknown materials', () => {
      expect(normalizeMaterialCode('custom')).toBe('CUSTOM');
    });
  });

  describe('findEquivalentStandards', () => {
    it('should find DIN to ISO equivalents', () => {
      expect(findEquivalentStandards('DIN 933')).toContain('ISO4017');
      expect(findEquivalentStandards('DIN 931')).toContain('ISO4014');
      expect(findEquivalentStandards('DIN 912')).toContain('ISO4762');
    });

    it('should find ISO to DIN equivalents', () => {
      expect(findEquivalentStandards('ISO 4017')).toContain('DIN933');
      expect(findEquivalentStandards('ISO 4762')).toContain('DIN912');
    });

    it('should handle washer standards', () => {
      expect(findEquivalentStandards('DIN 125')).toContain('ISO7089');
    });

    it('should return empty for unknown standards', () => {
      expect(findEquivalentStandards('DIN 9999')).toBe('');
    });
  });
});

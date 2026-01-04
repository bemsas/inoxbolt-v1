/**
 * Unit Tests: Product Schema
 * Tests for fastener product type definitions and utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateThreadSpec,
  parseThreadSpec,
  detectCategoryFromStandard,
  normalizeMaterialGrade,
  generateProductName,
} from '../../lib/product-schema';

describe('Product Schema', () => {
  describe('validateThreadSpec', () => {
    it('should validate correct metric thread specs', () => {
      expect(validateThreadSpec('M8')).toBe(true);
      expect(validateThreadSpec('M8x30')).toBe(true);
      expect(validateThreadSpec('M10x50')).toBe(true);
      expect(validateThreadSpec('M12.5x100')).toBe(true);
      expect(validateThreadSpec('M6x20')).toBe(true);
    });

    it('should reject invalid thread specs', () => {
      expect(validateThreadSpec('')).toBe(false);
      expect(validateThreadSpec('8x30')).toBe(false);
      expect(validateThreadSpec('MM8')).toBe(false);
      expect(validateThreadSpec('M')).toBe(false);
      expect(validateThreadSpec('bolt')).toBe(false);
    });
  });

  describe('parseThreadSpec', () => {
    it('should parse thread diameter only', () => {
      const result = parseThreadSpec('M8');
      expect(result).toEqual({ diameter: 8, length: undefined });
    });

    it('should parse thread diameter and length', () => {
      const result = parseThreadSpec('M8x30');
      expect(result).toEqual({ diameter: 8, length: 30 });
    });

    it('should parse decimal values', () => {
      const result = parseThreadSpec('M10.5x45.5');
      expect(result).toEqual({ diameter: 10.5, length: 45.5 });
    });

    it('should return null for invalid specs', () => {
      expect(parseThreadSpec('')).toBeNull();
      expect(parseThreadSpec('invalid')).toBeNull();
      expect(parseThreadSpec('8x30')).toBeNull();
    });
  });

  describe('detectCategoryFromStandard', () => {
    it('should detect bolts from DIN/ISO standards', () => {
      expect(detectCategoryFromStandard('DIN 933')).toBe('bolt');
      expect(detectCategoryFromStandard('DIN 931')).toBe('bolt');
      expect(detectCategoryFromStandard('ISO 4017')).toBe('bolt');
      expect(detectCategoryFromStandard('ISO 4014')).toBe('bolt');
    });

    it('should detect screws from standards', () => {
      expect(detectCategoryFromStandard('DIN 912')).toBe('screw');
      expect(detectCategoryFromStandard('ISO 4762')).toBe('screw');
      expect(detectCategoryFromStandard('DIN 7991')).toBe('screw');
      expect(detectCategoryFromStandard('ISO 10642')).toBe('screw');
    });

    it('should detect nuts from standards', () => {
      expect(detectCategoryFromStandard('DIN 934')).toBe('nut');
      expect(detectCategoryFromStandard('ISO 4032')).toBe('nut');
      expect(detectCategoryFromStandard('ISO 4033')).toBe('nut');
      expect(detectCategoryFromStandard('DIN 985')).toBe('nut');
    });

    it('should detect washers from standards', () => {
      expect(detectCategoryFromStandard('DIN 125')).toBe('washer');
      expect(detectCategoryFromStandard('DIN 127')).toBe('washer');
      expect(detectCategoryFromStandard('ISO 7089')).toBe('washer');
      expect(detectCategoryFromStandard('ISO 7090')).toBe('washer');
    });

    it('should detect threaded rods', () => {
      expect(detectCategoryFromStandard('DIN 975')).toBe('threaded_rod');
      expect(detectCategoryFromStandard('DIN 976')).toBe('threaded_rod');
    });

    it('should detect pins', () => {
      expect(detectCategoryFromStandard('DIN 94')).toBe('pin');
      expect(detectCategoryFromStandard('ISO 8734')).toBe('pin');
    });

    it('should return other for unknown standards', () => {
      expect(detectCategoryFromStandard('DIN 9999')).toBe('other');
      expect(detectCategoryFromStandard('UNKNOWN')).toBe('other');
    });
  });

  describe('normalizeMaterialGrade', () => {
    it('should normalize stainless steel grades', () => {
      expect(normalizeMaterialGrade('A2')).toBe('a2-70');
      expect(normalizeMaterialGrade('A2-70')).toBe('a2-70');
      expect(normalizeMaterialGrade('304')).toBe('a2-70');
      expect(normalizeMaterialGrade('18/8')).toBe('a2-70');
      expect(normalizeMaterialGrade('A4')).toBe('a4-70');
      expect(normalizeMaterialGrade('316')).toBe('a4-70');
      expect(normalizeMaterialGrade('A4-80')).toBe('a4-80');
    });

    it('should normalize steel grades', () => {
      expect(normalizeMaterialGrade('8.8')).toBe('8.8');
      expect(normalizeMaterialGrade('88')).toBe('8.8');
      expect(normalizeMaterialGrade('10.9')).toBe('10.9');
      expect(normalizeMaterialGrade('12.9')).toBe('12.9');
      expect(normalizeMaterialGrade('4.8')).toBe('4.8');
    });

    it('should normalize other materials', () => {
      expect(normalizeMaterialGrade('brass')).toBe('brass');
      expect(normalizeMaterialGrade('BRASS')).toBe('brass');
      expect(normalizeMaterialGrade('bronze')).toBe('bronze');
      expect(normalizeMaterialGrade('aluminum')).toBe('aluminum');
      expect(normalizeMaterialGrade('ALU')).toBe('aluminum');
      expect(normalizeMaterialGrade('titanium')).toBe('titanium');
      expect(normalizeMaterialGrade('nylon')).toBe('nylon');
      expect(normalizeMaterialGrade('PA')).toBe('nylon');
    });

    it('should return other for unknown materials', () => {
      expect(normalizeMaterialGrade('unknown')).toBe('other');
      expect(normalizeMaterialGrade('xyz')).toBe('other');
    });
  });

  describe('generateProductName', () => {
    it('should generate name with all components', () => {
      const name = generateProductName({
        standard: 'DIN 933',
        category: 'bolt',
        headType: 'hex',
        threadSpec: 'M8x30',
        material: 'a2-70',
      });
      expect(name).toContain('DIN 933');
      expect(name).toContain('M8x30');
      expect(name).toContain('A2-70');
    });

    it('should generate name with partial components', () => {
      const name = generateProductName({
        standard: 'ISO 4017',
        threadSpec: 'M10x50',
      });
      expect(name).toContain('ISO 4017');
      expect(name).toContain('M10x50');
    });

    it('should handle missing components', () => {
      const name = generateProductName({});
      expect(name).toBe('Unknown Product');
    });

    it('should format head type correctly', () => {
      const name = generateProductName({
        headType: 'countersunk',
        category: 'screw',
      });
      expect(name).toMatch(/countersunk/i);
      expect(name).toMatch(/screw/i);
    });
  });
});

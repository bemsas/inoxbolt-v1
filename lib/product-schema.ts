/**
 * Product Schema for B2B Fastener Extraction (2025 Best Practices)
 * Structured data types for extracting product information from PDF catalogs
 */

// =============================================================================
// CORE PRODUCT TYPES
// =============================================================================

export type FastenerCategory =
  | 'bolt'
  | 'screw'
  | 'nut'
  | 'washer'
  | 'anchor'
  | 'rivet'
  | 'pin'
  | 'threaded_rod'
  | 'insert'
  | 'other';

export type HeadType =
  | 'hex'
  | 'socket'
  | 'pan'
  | 'countersunk'
  | 'button'
  | 'flange'
  | 'cheese'
  | 'fillister'
  | 'oval'
  | 'truss'
  | 'none';

export type DriveType =
  | 'hex'
  | 'phillips'
  | 'slotted'
  | 'torx'
  | 'allen'
  | 'pozi'
  | 'robertson'
  | 'spanner'
  | 'tri_wing'
  | 'none';

export type ThreadType = 'coarse' | 'fine' | 'extra_fine' | 'metric' | 'unc' | 'unf';

export type MaterialGrade =
  | 'a2'
  | 'a2-70'
  | 'a4'
  | 'a4-70'
  | 'a4-80'
  | '4.8'
  | '8.8'
  | '10.9'
  | '12.9'
  | 'brass'
  | 'bronze'
  | 'aluminum'
  | 'titanium'
  | 'nylon'
  | 'other';

export type FinishType =
  | 'plain'
  | 'zinc'
  | 'hot_dip_galvanized'
  | 'dacromet'
  | 'phosphate'
  | 'nickel'
  | 'chrome'
  | 'black_oxide'
  | 'passivated'
  | 'other';

// =============================================================================
// STRUCTURED PRODUCT DATA
// =============================================================================

/**
 * Extracted product dimensions
 */
export interface ProductDimensions {
  threadDiameter?: number;      // M8 = 8
  threadPitch?: number;         // Fine thread pitch
  length?: number;              // Total length in mm
  headDiameter?: number;        // Head diameter in mm
  headHeight?: number;          // Head height in mm
  threadLength?: number;        // Threaded portion length
  shankDiameter?: number;       // Unthreaded shank diameter
  across_flats?: number;        // Hex size (wrench size)
  across_corners?: number;      // Hex diagonal
}

/**
 * Mechanical properties
 */
export interface MechanicalProperties {
  tensileStrength?: number;     // MPa
  yieldStrength?: number;       // MPa
  proofLoad?: number;           // kN
  hardness?: string;            // HRC or HV value
  torque?: number;              // Recommended tightening torque Nm
}

/**
 * Pricing and packaging
 */
export interface PricingInfo {
  unitPrice?: number;           // Price per piece
  boxPrice?: number;            // Price per box
  boxQuantity?: number;         // Pieces per box
  moq?: number;                 // Minimum order quantity
  currency?: string;            // EUR, USD, etc.
  priceBreaks?: Array<{
    quantity: number;
    price: number;
  }>;
}

/**
 * Main structured product schema
 */
export interface StructuredProduct {
  // Identification
  id?: string;
  sku?: string;
  articleNumber?: string;

  // Classification
  category: FastenerCategory;
  standard?: string;            // DIN 933, ISO 4017, etc.
  equivalentStandards?: string[]; // Related standards

  // Description
  name: string;
  description?: string;

  // Technical specifications
  threadSpec: string;           // M8x30, M10x50, etc.
  dimensions: ProductDimensions;
  headType?: HeadType;
  driveType?: DriveType;
  threadType?: ThreadType;

  // Material
  material: MaterialGrade;
  materialDescription?: string; // "304 Stainless Steel"
  finish?: FinishType;

  // Mechanical
  mechanicalProperties?: MechanicalProperties;

  // Certifications
  certifications?: string[];    // CE, RoHS, REACH, etc.

  // Commercial
  pricing?: PricingInfo;
  supplier?: string;
  availability?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';
  leadTime?: string;            // "2-5 days"

  // Source reference
  sourceDocument?: string;
  sourcePage?: number;
  sourceImage?: string;         // URL to extracted product image

  // Confidence scores (0-1)
  confidence: {
    overall: number;
    dimensions: number;
    material: number;
    pricing: number;
  };

  // Raw extracted text for reference
  rawContent?: string;
}

// =============================================================================
// TABLE EXTRACTION SCHEMA
// =============================================================================

/**
 * Structure for extracted tables from PDF
 */
export interface ExtractedTable {
  id: string;
  pageNumber: number;

  // Table metadata
  title?: string;
  standard?: string;

  // Column definitions detected
  columns: Array<{
    name: string;
    type: 'thread' | 'dimension' | 'material' | 'price' | 'quantity' | 'code' | 'text';
    unit?: string;
  }>;

  // Rows of data
  rows: Array<Record<string, string | number>>;

  // Extraction quality
  confidence: number;
  warnings?: string[];
}

// =============================================================================
// EXTRACTION RESULT
// =============================================================================

/**
 * Result from structured extraction
 */
export interface ExtractionResult {
  documentId: string;
  documentName: string;
  supplier?: string;

  // Extracted data
  products: StructuredProduct[];
  tables: ExtractedTable[];

  // Images extracted
  productImages: Array<{
    id: string;
    url: string;
    pageNumber: number;
    productId?: string;
    description?: string;
  }>;

  // Processing metadata
  pageCount: number;
  processingTimeMs: number;
  extractionMethod: 'text_only' | 'vision' | 'hybrid';

  // Quality metrics
  overallConfidence: number;
  warnings: string[];
  errors: string[];
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

/**
 * Validate thread specification format
 */
export function validateThreadSpec(spec: string): boolean {
  // M followed by diameter, optionally x length
  const pattern = /^M\d+(\.\d+)?(x\d+(\.\d+)?)?$/i;
  return pattern.test(spec);
}

/**
 * Parse thread specification into components
 */
export function parseThreadSpec(spec: string): { diameter: number; length?: number } | null {
  const match = spec.match(/^M(\d+(?:\.\d+)?)(x(\d+(?:\.\d+)?))?$/i);
  if (!match) return null;

  return {
    diameter: parseFloat(match[1]),
    length: match[3] ? parseFloat(match[3]) : undefined,
  };
}

/**
 * Detect category from standard code
 */
export function detectCategoryFromStandard(standard: string): FastenerCategory {
  const upperStandard = standard.toUpperCase();

  // Bolt standards
  const boltStandards = ['DIN931', 'DIN933', 'ISO4014', 'ISO4017', 'DIN960', 'DIN961'];
  if (boltStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ').replace('ISO', 'ISO ')))) {
    return 'bolt';
  }

  // Screw standards
  const screwStandards = ['DIN912', 'DIN7984', 'DIN7991', 'ISO4762', 'ISO10642', 'DIN965', 'DIN966'];
  if (screwStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ').replace('ISO', 'ISO ')))) {
    return 'screw';
  }

  // Nut standards
  const nutStandards = ['DIN934', 'ISO4032', 'ISO4033', 'DIN985', 'DIN1587'];
  if (nutStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ').replace('ISO', 'ISO ')))) {
    return 'nut';
  }

  // Washer standards
  const washerStandards = ['DIN125', 'DIN127', 'DIN433', 'DIN440', 'ISO7089', 'ISO7090'];
  if (washerStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ').replace('ISO', 'ISO ')))) {
    return 'washer';
  }

  // Threaded rod
  const rodStandards = ['DIN975', 'DIN976'];
  if (rodStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ')))) {
    return 'threaded_rod';
  }

  // Pin standards
  const pinStandards = ['DIN94', 'DIN1481', 'ISO8734'];
  if (pinStandards.some(s => upperStandard.includes(s.replace('DIN', 'DIN ').replace('ISO', 'ISO ')))) {
    return 'pin';
  }

  return 'other';
}

/**
 * Normalize material grade to standard format
 */
export function normalizeMaterialGrade(raw: string): MaterialGrade {
  const upper = raw.toUpperCase().replace(/[-\s]/g, '');

  // Stainless grades
  if (upper === 'A2' || upper === 'A270' || upper === '304' || upper === '18/8') return 'a2-70';
  if (upper === 'A4' || upper === 'A470' || upper === '316') return 'a4-70';
  if (upper === 'A480' || upper === '316TI') return 'a4-80';

  // Steel grades
  if (upper === '48' || upper === '4.8') return '4.8';
  if (upper === '88' || upper === '8.8') return '8.8';
  if (upper === '109' || upper === '10.9') return '10.9';
  if (upper === '129' || upper === '12.9') return '12.9';

  // Other materials
  if (upper.includes('BRASS') || upper.includes('MS')) return 'brass';
  if (upper.includes('BRONZE')) return 'bronze';
  if (upper.includes('ALU')) return 'aluminum';
  if (upper.includes('TITAN')) return 'titanium';
  if (upper.includes('NYLON') || upper.includes('PA')) return 'nylon';

  return 'other';
}

/**
 * Generate product name from structured data
 */
export function generateProductName(product: Partial<StructuredProduct>): string {
  const parts: string[] = [];

  if (product.standard) parts.push(product.standard);
  if (product.headType && product.headType !== 'none') {
    parts.push(product.headType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }
  if (product.category) {
    parts.push(product.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }
  if (product.threadSpec) parts.push(product.threadSpec);
  if (product.material) parts.push(product.material.toUpperCase());

  return parts.join(' ') || 'Unknown Product';
}

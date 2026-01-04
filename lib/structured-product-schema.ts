/**
 * Structured Product Schema for B2B Fastener Search
 * Comprehensive TypeScript types for fastener products with full specifications
 */

// =============================================================================
// CATEGORY TYPES
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

// =============================================================================
// MATERIAL TYPES
// =============================================================================

export type MaterialBase =
  | 'stainless'
  | 'steel'
  | 'brass'
  | 'aluminum'
  | 'nylon'
  | 'bronze'
  | 'titanium'
  | 'copper';

export type MaterialGrade =
  | 'a2-70'    // Stainless 304, 70ksi tensile
  | 'a4-70'    // Stainless 316, 70ksi tensile
  | 'a4-80'    // Stainless 316Ti, 80ksi tensile
  | 'a2-50'    // Stainless 304, 50ksi tensile
  | '4.8'      // Low carbon steel
  | '8.8'      // Medium carbon steel, quenched and tempered
  | '10.9'     // Alloy steel, quenched and tempered
  | '12.9'     // Alloy steel, highest grade
  | 'brass'
  | 'bronze'
  | 'aluminum'
  | 'nylon'
  | 'titanium';

// =============================================================================
// HEAD AND DRIVE TYPES
// =============================================================================

export type HeadType =
  | 'hex'          // Hexagonal head (most common for bolts)
  | 'socket'       // Socket/cylinder head (Allen)
  | 'countersunk'  // Flat head, sits flush
  | 'pan'          // Rounded top, flat bottom
  | 'button'       // Low dome head
  | 'cheese'       // Cylindrical with flat top
  | 'flange'       // Built-in washer flange
  | 'oval'         // Countersunk with rounded top
  | 'round'        // Fully rounded dome
  | 'truss'        // Extra wide, low profile
  | 'none';        // No head (set screws, studs)

export type DriveType =
  | 'external'     // External hex (wrench)
  | 'allen'        // Internal hex (Allen key)
  | 'torx'         // Star-shaped
  | 'phillips'     // Cross-head (+)
  | 'slotted'      // Flat blade (-)
  | 'pozidriv'     // Enhanced Phillips
  | 'robertson'    // Square drive
  | 'security'     // Tamper-resistant variants
  | 'none';        // No drive (studs)

// =============================================================================
// SURFACE FINISH TYPES
// =============================================================================

export type SurfaceFinish =
  | 'plain'        // No coating (bright)
  | 'zinc'         // Zinc plated (electro-galvanized)
  | 'phosphate'    // Black phosphate coating
  | 'geomet'       // Zinc-flake coating (high corrosion resistance)
  | 'dacromet'     // Zinc-chromate flake coating
  | 'hot_dip'      // Hot-dip galvanized
  | 'nickel'       // Nickel plated
  | 'chrome'       // Chrome plated
  | 'black_oxide'  // Black oxide finish
  | 'passivated'   // Passivated stainless
  | 'ptfe'         // PTFE coated (lubricating)
  | 'cadmium';     // Cadmium plated (aerospace)

// =============================================================================
// THREAD SPECIFICATIONS
// =============================================================================

export type ThreadPitchType = 'coarse' | 'fine' | 'extra_fine';

export interface ThreadSpecification {
  diameter: number;           // M6 = 6, M8 = 8, etc. (mm)
  pitch?: number;             // Thread pitch in mm (null for coarse)
  pitchType: ThreadPitchType; // Coarse, fine, or extra fine
  length?: number;            // Total length in mm
  threadLength?: number;      // Length of threaded portion
}

// =============================================================================
// PRICING STRUCTURE
// =============================================================================

export interface PriceBreak {
  minQuantity: number;
  pricePerUnit: number;
}

export interface ProductPricing {
  pricePerUnit: number;       // Price for single piece
  currency: 'EUR' | 'USD' | 'GBP';
  boxQuantity: number;        // Standard packaging quantity
  boxPrice?: number;          // Price per box
  priceBreaks?: PriceBreak[]; // Volume discounts
  moq?: number;               // Minimum order quantity
}

// =============================================================================
// STRUCTURED PRODUCT (for search indexing)
// =============================================================================

export interface StructuredFastenerProduct {
  // Identification
  id: string;
  sku?: string;
  articleNumber?: string;

  // Classification
  category: FastenerCategory;

  // Standards
  dinStandard?: string;       // e.g., "DIN 933", "DIN 912"
  isoStandard?: string;       // e.g., "ISO 4017", "ISO 4762"
  equivalentStandards?: string[]; // Related standards

  // Thread specification
  threadDiameter: number;     // M6 = 6, M8 = 8, etc.
  threadPitch?: number;       // Pitch in mm (null = coarse)
  threadPitchType: ThreadPitchType;
  length?: number;            // Total length in mm

  // Material
  materialBase: MaterialBase;
  materialGrade: MaterialGrade;
  materialDescription?: string; // "304 Stainless Steel", "Alloy Steel"

  // Head and drive
  headType: HeadType;
  driveType: DriveType;

  // Surface treatment
  surfaceFinish: SurfaceFinish;

  // Commercial
  pricePerUnit?: number;
  boxQuantity?: number;
  supplier?: string;

  // Descriptions
  name: string;
  description?: string;

  // Source tracking
  sourceDocument?: string;
  sourcePage?: number;

  // Search optimization
  searchableText: string;     // Combined searchable text
  normalizedStandard?: string; // Normalized standard for exact matching
}

// =============================================================================
// SEARCH RESULT TYPE
// =============================================================================

export interface FastenerSearchResult {
  id: string;
  content: string;
  score: number;              // Hybrid score (0-100)
  vectorScore: number;        // Raw vector similarity (0-1)
  keywordScore: number;       // Keyword match score (0-1)
  exactMatch: boolean;        // Exact standard match

  // Product metadata
  category?: FastenerCategory;
  standard?: string;
  threadSpec?: string;        // "M8x30"
  material?: MaterialGrade;
  headType?: HeadType;

  // Document info
  document: {
    id: string;
    name: string;
    supplier: string | null;
    page?: number;
  };
}

// =============================================================================
// PARSING UTILITIES
// =============================================================================

/**
 * Parse a thread specification string into components
 * Examples: "M8", "M8x30", "M10x1.25x50"
 */
export function parseThreadSpec(spec: string): ThreadSpecification | null {
  // Pattern: M{diameter}[x{pitch}][x{length}]
  const match = spec.match(/^M(\d+(?:\.\d+)?)(x(\d+(?:\.\d+)?))?(x(\d+(?:\.\d+)?))?$/i);

  if (!match) return null;

  const diameter = parseFloat(match[1]);

  // Determine if second number is pitch or length
  let pitch: number | undefined;
  let length: number | undefined;

  if (match[3] && match[5]) {
    // Both present: M10x1.25x50
    pitch = parseFloat(match[3]);
    length = parseFloat(match[5]);
  } else if (match[3]) {
    // Only one number after diameter
    const secondNum = parseFloat(match[3]);
    // If <= 3, likely a fine pitch. If > 3, likely a length
    if (secondNum <= 3 && isFinePitch(diameter, secondNum)) {
      pitch = secondNum;
    } else {
      length = secondNum;
    }
  }

  // Determine pitch type
  let pitchType: ThreadPitchType = 'coarse';
  if (pitch !== undefined) {
    const coarsePitch = getCoarsePitch(diameter);
    if (pitch < coarsePitch) {
      pitchType = 'fine';
    }
  }

  return {
    diameter,
    pitch,
    pitchType,
    length,
  };
}

/**
 * Standard coarse pitch values for metric threads
 */
function getCoarsePitch(diameter: number): number {
  const coarsePitches: Record<number, number> = {
    3: 0.5,
    4: 0.7,
    5: 0.8,
    6: 1.0,
    8: 1.25,
    10: 1.5,
    12: 1.75,
    14: 2.0,
    16: 2.0,
    18: 2.5,
    20: 2.5,
    22: 2.5,
    24: 3.0,
    27: 3.0,
    30: 3.5,
  };
  return coarsePitches[diameter] || 1.5;
}

/**
 * Check if a pitch value is a valid fine pitch for a diameter
 */
function isFinePitch(diameter: number, pitch: number): boolean {
  const coarsePitch = getCoarsePitch(diameter);
  return pitch < coarsePitch && pitch >= 0.5;
}

/**
 * Format a thread specification for display
 */
export function formatThreadSpec(spec: ThreadSpecification): string {
  let result = `M${spec.diameter}`;

  if (spec.pitch !== undefined && spec.pitchType !== 'coarse') {
    result += `x${spec.pitch}`;
  }

  if (spec.length !== undefined) {
    result += `x${spec.length}`;
  }

  return result;
}

/**
 * Normalize material grade string to standard format
 */
export function normalizeMaterialGrade(raw: string): MaterialGrade {
  const upper = raw.toUpperCase().replace(/[-\s]/g, '');

  // Stainless grades
  if (upper === 'A2' || upper === 'A270' || upper === '304' || upper === '18/8' || upper.includes('A270')) {
    return 'a2-70';
  }
  if (upper === 'A250' || upper.includes('A250')) return 'a2-50';
  if (upper === 'A4' || upper === 'A470' || upper === '316' || upper.includes('A470')) {
    return 'a4-70';
  }
  if (upper === 'A480' || upper === '316TI' || upper.includes('A480')) return 'a4-80';

  // Steel grades
  if (upper === '48' || upper === '4.8') return '4.8';
  if (upper === '88' || upper === '8.8') return '8.8';
  if (upper === '109' || upper === '10.9') return '10.9';
  if (upper === '129' || upper === '12.9') return '12.9';

  // Other materials
  if (upper.includes('BRASS') || upper === 'MS') return 'brass';
  if (upper.includes('BRONZE')) return 'bronze';
  if (upper.includes('ALU')) return 'aluminum';
  if (upper.includes('NYLON') || upper === 'PA') return 'nylon';
  if (upper.includes('TITAN')) return 'titanium';

  return 'a2-70'; // Default to common stainless
}

/**
 * Detect material base from grade
 */
export function getMaterialBase(grade: MaterialGrade): MaterialBase {
  if (grade.startsWith('a2') || grade.startsWith('a4')) return 'stainless';
  if (['4.8', '8.8', '10.9', '12.9'].includes(grade)) return 'steel';
  if (grade === 'brass') return 'brass';
  if (grade === 'bronze') return 'bronze';
  if (grade === 'aluminum') return 'aluminum';
  if (grade === 'nylon') return 'nylon';
  if (grade === 'titanium') return 'titanium';
  return 'steel';
}

/**
 * Generate searchable text for a product
 */
export function generateSearchableText(product: Partial<StructuredFastenerProduct>): string {
  const parts: string[] = [];

  if (product.dinStandard) parts.push(product.dinStandard);
  if (product.isoStandard) parts.push(product.isoStandard);
  if (product.category) parts.push(product.category);
  if (product.name) parts.push(product.name);

  // Thread spec
  if (product.threadDiameter) {
    let threadStr = `M${product.threadDiameter}`;
    if (product.length) threadStr += `x${product.length}`;
    parts.push(threadStr);
  }

  // Material
  if (product.materialGrade) parts.push(product.materialGrade);
  if (product.materialDescription) parts.push(product.materialDescription);

  // Head and drive
  if (product.headType && product.headType !== 'none') parts.push(product.headType);
  if (product.driveType && product.driveType !== 'none') parts.push(product.driveType);

  // Finish
  if (product.surfaceFinish && product.surfaceFinish !== 'plain') {
    parts.push(product.surfaceFinish);
  }

  return parts.join(' ');
}

// =============================================================================
// CATEGORY DETECTION
// =============================================================================

/**
 * Detect product category from standard code
 */
export function detectCategoryFromStandard(standard: string): FastenerCategory {
  const normalized = standard.toUpperCase().replace(/\s+/g, '');

  // Bolt standards
  const boltPatterns = [
    /DIN93[13]/,      // DIN 931, DIN 933
    /ISO401[47]/,     // ISO 4014, ISO 4017
    /DIN96[01]/,      // DIN 960, DIN 961 (fine thread)
    /ISO8765/,        // ISO 8765 (fine thread)
  ];
  if (boltPatterns.some(p => p.test(normalized))) return 'bolt';

  // Socket screw standards
  const screwPatterns = [
    /DIN912/,         // Socket cap screw
    /DIN7984/,        // Low head socket cap
    /DIN7991/,        // Countersunk socket cap
    /ISO4762/,        // Socket cap screw
    /ISO10642/,       // Countersunk socket
    /DIN965/,         // Countersunk machine screw
    /DIN966/,         // Raised countersunk
    /ISO7380/,        // Button head
  ];
  if (screwPatterns.some(p => p.test(normalized))) return 'screw';

  // Nut standards
  const nutPatterns = [
    /DIN934/,         // Hex nut
    /DIN985/,         // Nyloc nut
    /DIN1587/,        // Dome nut
    /DIN6923/,        // Flange nut
    /ISO4032/,        // Hex nut style 1
    /ISO4033/,        // Hex nut style 2
    /ISO7040/,        // Prevailing torque nut
    /ISO10511/,       // Nyloc nut
  ];
  if (nutPatterns.some(p => p.test(normalized))) return 'nut';

  // Washer standards
  const washerPatterns = [
    /DIN125/,         // Flat washer
    /DIN127/,         // Spring washer
    /DIN433/,         // Small washer
    /DIN440/,         // Large washer
    /DIN6796/,        // Conical spring washer
    /ISO7089/,        // Flat washer
    /ISO7090/,        // Flat washer chamfered
    /ISO7091/,        // Plain washer (spring)
  ];
  if (washerPatterns.some(p => p.test(normalized))) return 'washer';

  // Threaded rod standards
  const rodPatterns = [
    /DIN975/,         // Threaded rod
    /DIN976/,         // Stud bolt
  ];
  if (rodPatterns.some(p => p.test(normalized))) return 'threaded_rod';

  // Pin standards
  const pinPatterns = [
    /DIN94/,          // Split pin
    /DIN1481/,        // Spring pin
    /DIN7/,           // Taper pin
    /ISO8734/,        // Parallel pin
  ];
  if (pinPatterns.some(p => p.test(normalized))) return 'pin';

  // Anchor/insert standards
  const anchorPatterns = [
    /DIN302/,         // Expansion anchor
  ];
  if (anchorPatterns.some(p => p.test(normalized))) return 'anchor';

  // Rivet standards
  const rivetPatterns = [
    /DIN660/,         // Round head rivet
    /DIN661/,         // Countersunk rivet
    /DIN7337/,        // Blind rivet
  ];
  if (rivetPatterns.some(p => p.test(normalized))) return 'rivet';

  return 'other';
}

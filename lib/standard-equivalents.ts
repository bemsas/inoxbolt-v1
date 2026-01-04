/**
 * DIN/ISO Standard Equivalents Mapping
 * Comprehensive mapping between DIN and ISO fastener standards
 */

// =============================================================================
// STANDARD RELATIONSHIP TYPES
// =============================================================================

export interface StandardInfo {
  code: string;                    // Normalized code (e.g., "DIN933")
  displayCode: string;             // Display format (e.g., "DIN 933")
  description: string;             // Human-readable description
  productType: string;             // bolt, nut, washer, etc.
  equivalent?: string[];           // Directly equivalent standards
  similar?: string[];              // Similar but not identical
  supersededBy?: string;           // If standard has been replaced
  keywords: string[];              // Search keywords
}

// =============================================================================
// COMPREHENSIVE STANDARD DATABASE
// =============================================================================

export const STANDARD_DATABASE: Record<string, StandardInfo> = {
  // =========================================================================
  // HEX BOLTS
  // =========================================================================
  'DIN933': {
    code: 'DIN933',
    displayCode: 'DIN 933',
    description: 'Hexagon head bolt, full thread',
    productType: 'bolt',
    equivalent: ['ISO4017'],
    similar: ['DIN931', 'ISO4014'],
    keywords: ['hex bolt', 'full thread', 'hexagon', 'perno hexagonal'],
  },
  'DIN931': {
    code: 'DIN931',
    displayCode: 'DIN 931',
    description: 'Hexagon head bolt, partial thread',
    productType: 'bolt',
    equivalent: ['ISO4014'],
    similar: ['DIN933', 'ISO4017'],
    keywords: ['hex bolt', 'partial thread', 'hexagon', 'perno'],
  },
  'DIN960': {
    code: 'DIN960',
    displayCode: 'DIN 960',
    description: 'Hexagon head bolt, partial thread, fine pitch',
    productType: 'bolt',
    equivalent: ['ISO8765'],
    similar: ['DIN961'],
    keywords: ['hex bolt', 'fine thread', 'fine pitch'],
  },
  'DIN961': {
    code: 'DIN961',
    displayCode: 'DIN 961',
    description: 'Hexagon head bolt, full thread, fine pitch',
    productType: 'bolt',
    similar: ['DIN960', 'ISO8676'],
    keywords: ['hex bolt', 'fine thread', 'full thread'],
  },
  'ISO4017': {
    code: 'ISO4017',
    displayCode: 'ISO 4017',
    description: 'Hexagon head screw, full thread',
    productType: 'bolt',
    equivalent: ['DIN933'],
    similar: ['ISO4014', 'DIN931'],
    keywords: ['hex bolt', 'full thread', 'hexagon'],
  },
  'ISO4014': {
    code: 'ISO4014',
    displayCode: 'ISO 4014',
    description: 'Hexagon head bolt, partial thread',
    productType: 'bolt',
    equivalent: ['DIN931'],
    similar: ['ISO4017', 'DIN933'],
    keywords: ['hex bolt', 'partial thread', 'hexagon'],
  },
  'ISO8765': {
    code: 'ISO8765',
    displayCode: 'ISO 8765',
    description: 'Hexagon head bolt, fine pitch thread',
    productType: 'bolt',
    equivalent: ['DIN960'],
    keywords: ['hex bolt', 'fine pitch', 'fine thread'],
  },

  // =========================================================================
  // SOCKET CAP SCREWS
  // =========================================================================
  'DIN912': {
    code: 'DIN912',
    displayCode: 'DIN 912',
    description: 'Socket head cap screw',
    productType: 'screw',
    equivalent: ['ISO4762'],
    similar: ['DIN7984'],
    keywords: ['socket cap', 'allen', 'cylinder head', 'SHCS', 'tornillo allen'],
  },
  'DIN7984': {
    code: 'DIN7984',
    displayCode: 'DIN 7984',
    description: 'Low head socket cap screw',
    productType: 'screw',
    similar: ['DIN912', 'ISO4762', 'ISO14580'],
    keywords: ['low head', 'socket cap', 'thin head'],
  },
  'DIN7991': {
    code: 'DIN7991',
    displayCode: 'DIN 7991',
    description: 'Countersunk socket head cap screw',
    productType: 'screw',
    equivalent: ['ISO10642'],
    keywords: ['countersunk', 'flat head', 'socket', 'CSK'],
  },
  'ISO4762': {
    code: 'ISO4762',
    displayCode: 'ISO 4762',
    description: 'Socket head cap screw',
    productType: 'screw',
    equivalent: ['DIN912'],
    keywords: ['socket cap', 'allen', 'SHCS'],
  },
  'ISO10642': {
    code: 'ISO10642',
    displayCode: 'ISO 10642',
    description: 'Countersunk socket head cap screw',
    productType: 'screw',
    equivalent: ['DIN7991'],
    keywords: ['countersunk', 'flat head', 'socket'],
  },
  'ISO7380': {
    code: 'ISO7380',
    displayCode: 'ISO 7380',
    description: 'Button head socket cap screw',
    productType: 'screw',
    keywords: ['button head', 'dome head', 'socket'],
  },

  // =========================================================================
  // SET SCREWS
  // =========================================================================
  'DIN913': {
    code: 'DIN913',
    displayCode: 'DIN 913',
    description: 'Socket set screw, flat point',
    productType: 'screw',
    equivalent: ['ISO4026'],
    keywords: ['set screw', 'grub screw', 'flat point'],
  },
  'DIN914': {
    code: 'DIN914',
    displayCode: 'DIN 914',
    description: 'Socket set screw, cone point',
    productType: 'screw',
    equivalent: ['ISO4027'],
    keywords: ['set screw', 'grub screw', 'cone point'],
  },
  'DIN915': {
    code: 'DIN915',
    displayCode: 'DIN 915',
    description: 'Socket set screw, dog point',
    productType: 'screw',
    equivalent: ['ISO4028'],
    keywords: ['set screw', 'grub screw', 'dog point'],
  },
  'DIN916': {
    code: 'DIN916',
    displayCode: 'DIN 916',
    description: 'Socket set screw, cup point',
    productType: 'screw',
    equivalent: ['ISO4029'],
    keywords: ['set screw', 'grub screw', 'cup point'],
  },

  // =========================================================================
  // MACHINE SCREWS
  // =========================================================================
  'DIN965': {
    code: 'DIN965',
    displayCode: 'DIN 965',
    description: 'Countersunk head screw, Phillips',
    productType: 'screw',
    equivalent: ['ISO7046'],
    keywords: ['countersunk', 'phillips', 'machine screw'],
  },
  'DIN966': {
    code: 'DIN966',
    displayCode: 'DIN 966',
    description: 'Raised countersunk head screw',
    productType: 'screw',
    equivalent: ['ISO7047'],
    keywords: ['raised countersunk', 'oval head'],
  },
  'DIN84': {
    code: 'DIN84',
    displayCode: 'DIN 84',
    description: 'Slotted cheese head screw',
    productType: 'screw',
    equivalent: ['ISO1207'],
    keywords: ['cheese head', 'slotted', 'machine screw'],
  },
  'DIN85': {
    code: 'DIN85',
    displayCode: 'DIN 85',
    description: 'Slotted pan head screw',
    productType: 'screw',
    equivalent: ['ISO1580'],
    keywords: ['pan head', 'slotted'],
  },

  // =========================================================================
  // NUTS
  // =========================================================================
  'DIN934': {
    code: 'DIN934',
    displayCode: 'DIN 934',
    description: 'Hexagon nut',
    productType: 'nut',
    equivalent: ['ISO4032', 'ISO4033'],
    similar: ['DIN439'],
    keywords: ['hex nut', 'hexagon nut', 'tuerca hexagonal'],
  },
  'DIN439': {
    code: 'DIN439',
    displayCode: 'DIN 439',
    description: 'Hexagon thin nut (jam nut)',
    productType: 'nut',
    equivalent: ['ISO4035'],
    keywords: ['thin nut', 'jam nut', 'low nut'],
  },
  'DIN985': {
    code: 'DIN985',
    displayCode: 'DIN 985',
    description: 'Prevailing torque hex nut with nylon insert (Nyloc)',
    productType: 'nut',
    equivalent: ['ISO10511', 'ISO7040'],
    keywords: ['nyloc', 'lock nut', 'prevailing torque', 'self-locking'],
  },
  'DIN1587': {
    code: 'DIN1587',
    displayCode: 'DIN 1587',
    description: 'Hexagon domed cap nut',
    productType: 'nut',
    equivalent: ['ISO1587'],
    keywords: ['dome nut', 'cap nut', 'acorn nut'],
  },
  'DIN6923': {
    code: 'DIN6923',
    displayCode: 'DIN 6923',
    description: 'Hexagon flange nut',
    productType: 'nut',
    equivalent: ['ISO4161'],
    keywords: ['flange nut', 'serrated flange'],
  },
  'DIN6334': {
    code: 'DIN6334',
    displayCode: 'DIN 6334',
    description: 'Hexagon coupling nut',
    productType: 'nut',
    keywords: ['coupling nut', 'extension nut', 'long nut'],
  },
  'ISO4032': {
    code: 'ISO4032',
    displayCode: 'ISO 4032',
    description: 'Hexagon nut, style 1',
    productType: 'nut',
    equivalent: ['DIN934'],
    keywords: ['hex nut', 'hexagon nut'],
  },
  'ISO4033': {
    code: 'ISO4033',
    displayCode: 'ISO 4033',
    description: 'Hexagon nut, style 2 (thicker)',
    productType: 'nut',
    equivalent: ['DIN934'],
    keywords: ['hex nut', 'thick nut'],
  },
  'ISO7040': {
    code: 'ISO7040',
    displayCode: 'ISO 7040',
    description: 'Prevailing torque type hexagon nut, all-metal',
    productType: 'nut',
    similar: ['DIN985', 'ISO10511'],
    keywords: ['lock nut', 'all metal lock'],
  },
  'ISO10511': {
    code: 'ISO10511',
    displayCode: 'ISO 10511',
    description: 'Prevailing torque hex nut, thin, with nylon insert',
    productType: 'nut',
    equivalent: ['DIN985'],
    keywords: ['nyloc', 'thin lock nut'],
  },

  // =========================================================================
  // WASHERS
  // =========================================================================
  'DIN125': {
    code: 'DIN125',
    displayCode: 'DIN 125',
    description: 'Plain washer, form A and B',
    productType: 'washer',
    equivalent: ['ISO7089', 'ISO7090'],
    keywords: ['flat washer', 'plain washer', 'arandela plana'],
  },
  'DIN127': {
    code: 'DIN127',
    displayCode: 'DIN 127',
    description: 'Spring lock washer',
    productType: 'washer',
    equivalent: ['ISO7091'],
    keywords: ['spring washer', 'lock washer', 'split washer', 'grower'],
  },
  'DIN433': {
    code: 'DIN433',
    displayCode: 'DIN 433',
    description: 'Plain washer, small series',
    productType: 'washer',
    equivalent: ['ISO7092'],
    keywords: ['small washer', 'narrow washer'],
  },
  'DIN440': {
    code: 'DIN440',
    displayCode: 'DIN 440',
    description: 'Plain washer for wood constructions',
    productType: 'washer',
    equivalent: ['ISO7094'],
    keywords: ['large washer', 'timber washer', 'construction washer'],
  },
  'DIN6796': {
    code: 'DIN6796',
    displayCode: 'DIN 6796',
    description: 'Conical spring washer (Belleville)',
    productType: 'washer',
    keywords: ['belleville washer', 'disc spring', 'conical washer'],
  },
  'DIN6798': {
    code: 'DIN6798',
    displayCode: 'DIN 6798',
    description: 'Serrated lock washer',
    productType: 'washer',
    keywords: ['serrated washer', 'tooth lock washer', 'star washer'],
  },
  'DIN9021': {
    code: 'DIN9021',
    displayCode: 'DIN 9021',
    description: 'Plain washer, large series',
    productType: 'washer',
    equivalent: ['ISO7093'],
    keywords: ['large washer', 'fender washer', 'penny washer'],
  },
  'ISO7089': {
    code: 'ISO7089',
    displayCode: 'ISO 7089',
    description: 'Plain washer, normal series, product grade A',
    productType: 'washer',
    equivalent: ['DIN125A'],
    keywords: ['flat washer', 'plain washer'],
  },
  'ISO7090': {
    code: 'ISO7090',
    displayCode: 'ISO 7090',
    description: 'Plain washer, chamfered, normal series',
    productType: 'washer',
    equivalent: ['DIN125B'],
    keywords: ['flat washer', 'chamfered washer'],
  },

  // =========================================================================
  // THREADED RODS AND STUDS
  // =========================================================================
  'DIN975': {
    code: 'DIN975',
    displayCode: 'DIN 975',
    description: 'Threaded rod',
    productType: 'threaded_rod',
    keywords: ['threaded rod', 'all-thread', 'varilla roscada'],
  },
  'DIN976': {
    code: 'DIN976',
    displayCode: 'DIN 976',
    description: 'Stud bolt (threaded both ends)',
    productType: 'threaded_rod',
    keywords: ['stud', 'stud bolt', 'double end stud'],
  },
  'DIN938': {
    code: 'DIN938',
    displayCode: 'DIN 938',
    description: 'Stud bolt, type B',
    productType: 'threaded_rod',
    equivalent: ['ISO4026'],
    keywords: ['stud', 'stud bolt'],
  },
  'DIN939': {
    code: 'DIN939',
    displayCode: 'DIN 939',
    description: 'Stud bolt, type A',
    productType: 'threaded_rod',
    keywords: ['stud', 'interference fit stud'],
  },

  // =========================================================================
  // PINS
  // =========================================================================
  'DIN94': {
    code: 'DIN94',
    displayCode: 'DIN 94',
    description: 'Split pin (cotter pin)',
    productType: 'pin',
    equivalent: ['ISO1234'],
    keywords: ['split pin', 'cotter pin'],
  },
  'DIN7': {
    code: 'DIN7',
    displayCode: 'DIN 7',
    description: 'Taper pin',
    productType: 'pin',
    equivalent: ['ISO2339'],
    keywords: ['taper pin', 'conical pin'],
  },
  'DIN1481': {
    code: 'DIN1481',
    displayCode: 'DIN 1481',
    description: 'Spring type straight pin, slotted',
    productType: 'pin',
    equivalent: ['ISO8752'],
    keywords: ['spring pin', 'roll pin', 'slotted pin'],
  },
  'ISO8734': {
    code: 'ISO8734',
    displayCode: 'ISO 8734',
    description: 'Parallel pin, hardened',
    productType: 'pin',
    equivalent: ['DIN6325'],
    keywords: ['dowel pin', 'parallel pin'],
  },

  // =========================================================================
  // ANCHORS AND INSERTS
  // =========================================================================
  'DIN302': {
    code: 'DIN302',
    displayCode: 'DIN 302',
    description: 'Expansion anchor',
    productType: 'anchor',
    keywords: ['anchor', 'expansion anchor', 'concrete anchor'],
  },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Normalize a standard code for lookup
 * "DIN 933" -> "DIN933", "iso4017" -> "ISO4017"
 */
export function normalizeStandardCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, '').trim();
}

/**
 * Format standard code for display
 * "DIN933" -> "DIN 933"
 */
export function formatStandardForDisplay(code: string): string {
  const normalized = normalizeStandardCode(code);
  return normalized.replace(/^(DIN|ISO|EN|ANSI)(\d)/, '$1 $2');
}

/**
 * Find a standard by code
 */
export function findStandard(code: string): StandardInfo | null {
  const normalized = normalizeStandardCode(code);
  return STANDARD_DATABASE[normalized] || null;
}

/**
 * Find equivalent standards for a given code
 */
export function findEquivalents(code: string): string[] {
  const info = findStandard(code);
  if (!info) return [];
  return info.equivalent || [];
}

/**
 * Find similar (but not equivalent) standards
 */
export function findSimilar(code: string): string[] {
  const info = findStandard(code);
  if (!info) return [];
  return info.similar || [];
}

/**
 * Find all related standards (equivalent + similar)
 */
export function findAllRelated(code: string): {
  equivalent: string[];
  similar: string[];
  all: string[];
} {
  const info = findStandard(code);
  if (!info) {
    return { equivalent: [], similar: [], all: [] };
  }

  const equivalent = info.equivalent || [];
  const similar = info.similar || [];
  const all = Array.from(new Set([...equivalent, ...similar]));

  return { equivalent, similar, all };
}

/**
 * Get comprehensive information about a standard
 */
export function getStandardInfo(code: string): {
  standard: StandardInfo | null;
  equivalents: StandardInfo[];
  similar: StandardInfo[];
} | null {
  const info = findStandard(code);
  if (!info) return null;

  const equivalents = (info.equivalent || [])
    .map(eq => STANDARD_DATABASE[eq])
    .filter((s): s is StandardInfo => s !== undefined);

  const similar = (info.similar || [])
    .map(sim => STANDARD_DATABASE[sim])
    .filter((s): s is StandardInfo => s !== undefined);

  return {
    standard: info,
    equivalents,
    similar,
  };
}

/**
 * Search standards by keyword
 */
export function searchStandardsByKeyword(keyword: string): StandardInfo[] {
  const lower = keyword.toLowerCase();
  const results: StandardInfo[] = [];

  for (const info of Object.values(STANDARD_DATABASE)) {
    // Check code
    if (info.code.toLowerCase().includes(lower)) {
      results.push(info);
      continue;
    }

    // Check description
    if (info.description.toLowerCase().includes(lower)) {
      results.push(info);
      continue;
    }

    // Check keywords
    if (info.keywords.some(kw => kw.toLowerCase().includes(lower))) {
      results.push(info);
      continue;
    }
  }

  return results;
}

/**
 * Get standards by product type
 */
export function getStandardsByProductType(productType: string): StandardInfo[] {
  return Object.values(STANDARD_DATABASE).filter(
    info => info.productType === productType
  );
}

/**
 * Check if two standards are equivalent
 */
export function areEquivalent(code1: string, code2: string): boolean {
  const norm1 = normalizeStandardCode(code1);
  const norm2 = normalizeStandardCode(code2);

  if (norm1 === norm2) return true;

  const info1 = STANDARD_DATABASE[norm1];
  if (info1?.equivalent?.includes(norm2)) return true;

  const info2 = STANDARD_DATABASE[norm2];
  if (info2?.equivalent?.includes(norm1)) return true;

  return false;
}

/**
 * Build a bidirectional equivalence map for quick lookups
 */
export function buildEquivalenceMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const [code, info] of Object.entries(STANDARD_DATABASE)) {
    if (!map.has(code)) {
      map.set(code, new Set());
    }

    // Add equivalents bidirectionally
    for (const eq of info.equivalent || []) {
      map.get(code)!.add(eq);

      if (!map.has(eq)) {
        map.set(eq, new Set());
      }
      map.get(eq)!.add(code);
    }
  }

  return map;
}

// Pre-build the equivalence map for performance
export const EQUIVALENCE_MAP = buildEquivalenceMap();

/**
 * Fast lookup for equivalent standards using pre-built map
 */
export function getEquivalentsFast(code: string): string[] {
  const normalized = normalizeStandardCode(code);
  const equivalents = EQUIVALENCE_MAP.get(normalized);
  return equivalents ? Array.from(equivalents) : [];
}

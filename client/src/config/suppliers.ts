/**
 * Supplier Configuration for InoxBolt
 * Contains metadata, branding, and logo information for known fastener suppliers
 */

export type SupplierId =
  | 'reyher'
  | 'wurth'
  | 'bossard'
  | 'fabory'
  | 'hilti'
  | 'fischer'
  | 'klimas'
  | 'fastenal'
  | 'other';

export interface SupplierConfig {
  /** Unique supplier identifier */
  id: SupplierId;
  /** Display name */
  name: string;
  /** Short name for badges */
  shortName: string;
  /** Path to logo asset (if available) */
  logoPath?: string;
  /** Brand primary color (hex) */
  primaryColor: string;
  /** Brand secondary color (hex) */
  secondaryColor: string;
  /** Background color for badges */
  badgeBackground: string;
  /** Text color for badges */
  badgeText: string;
  /** Official website URL */
  websiteUrl: string;
  /** Country of origin */
  country: string;
  /** Country flag emoji */
  countryFlag: string;
  /** Brief description */
  description: string;
  /** Specialization areas */
  specializations: string[];
  /** ISO country code */
  countryCode: string;
}

/**
 * Supplier configuration registry
 */
export const SUPPLIERS: Record<SupplierId, SupplierConfig> = {
  reyher: {
    id: 'reyher',
    name: 'F. REYHER Nchfg. GmbH & Co. KG',
    shortName: 'REYHER',
    logoPath: '/images/suppliers/reyher.svg',
    primaryColor: '#003366',
    secondaryColor: '#0066CC',
    badgeBackground: 'bg-blue-900',
    badgeText: 'text-white',
    websiteUrl: 'https://www.reyher.de',
    country: 'Germany',
    countryFlag: 'DE',
    countryCode: 'DE',
    description: 'Leading German fastener wholesaler with one of Europe\'s largest assortments',
    specializations: ['DIN/ISO fasteners', 'Stainless steel', 'Industrial bolts'],
  },
  wurth: {
    id: 'wurth',
    name: 'Wurth Group',
    shortName: 'WURTH',
    logoPath: '/images/suppliers/wurth.svg',
    primaryColor: '#CC0000',
    secondaryColor: '#FF3333',
    badgeBackground: 'bg-red-600',
    badgeText: 'text-white',
    websiteUrl: 'https://www.wurth.com',
    country: 'Germany',
    countryFlag: 'DE',
    countryCode: 'DE',
    description: 'Global leader in assembly and fastening materials for trade and industry',
    specializations: ['Automotive fasteners', 'Construction', 'Assembly technology'],
  },
  bossard: {
    id: 'bossard',
    name: 'Bossard Group',
    shortName: 'BOSSARD',
    logoPath: '/images/suppliers/bossard.svg',
    primaryColor: '#E31E24',
    secondaryColor: '#1A1A1A',
    badgeBackground: 'bg-red-500',
    badgeText: 'text-white',
    websiteUrl: 'https://www.bossard.com',
    country: 'Switzerland',
    countryFlag: 'CH',
    countryCode: 'CH',
    description: 'Swiss precision fastener specialist with Smart Factory solutions',
    specializations: ['Precision fasteners', 'Smart Factory', 'Engineering services'],
  },
  fabory: {
    id: 'fabory',
    name: 'Fabory Group',
    shortName: 'FABORY',
    logoPath: '/images/suppliers/fabory.svg',
    primaryColor: '#00529B',
    secondaryColor: '#F5A623',
    badgeBackground: 'bg-blue-700',
    badgeText: 'text-white',
    websiteUrl: 'https://www.fabory.com',
    country: 'Netherlands',
    countryFlag: 'NL',
    countryCode: 'NL',
    description: 'European fastener distributor with comprehensive MRO solutions',
    specializations: ['MRO supplies', 'Vendor management', 'Technical support'],
  },
  hilti: {
    id: 'hilti',
    name: 'Hilti Corporation',
    shortName: 'HILTI',
    logoPath: '/images/suppliers/hilti.svg',
    primaryColor: '#D4021D',
    secondaryColor: '#FFFFFF',
    badgeBackground: 'bg-red-700',
    badgeText: 'text-white',
    websiteUrl: 'https://www.hilti.com',
    country: 'Liechtenstein',
    countryFlag: 'LI',
    countryCode: 'LI',
    description: 'Premium construction fastening and anchoring systems',
    specializations: ['Construction anchors', 'Direct fastening', 'Fire protection'],
  },
  fischer: {
    id: 'fischer',
    name: 'fischer Group',
    shortName: 'FISCHER',
    logoPath: '/images/suppliers/fischer.svg',
    primaryColor: '#E30613',
    secondaryColor: '#1A1A1A',
    badgeBackground: 'bg-red-600',
    badgeText: 'text-white',
    websiteUrl: 'https://www.fischer.de',
    country: 'Germany',
    countryFlag: 'DE',
    countryCode: 'DE',
    description: 'World leader in anchoring and fixing systems',
    specializations: ['Wall anchors', 'Chemical anchors', 'Frame fixings'],
  },
  klimas: {
    id: 'klimas',
    name: 'KLIMAS Wkret-met',
    shortName: 'KLIMAS',
    logoPath: '/images/suppliers/klimas.svg',
    primaryColor: '#E30613',
    secondaryColor: '#1A1A1A',
    badgeBackground: 'bg-red-600',
    badgeText: 'text-white',
    websiteUrl: 'https://www.wkret-met.com',
    country: 'Poland',
    countryFlag: 'PL',
    countryCode: 'PL',
    description: 'Polish manufacturer of screws and fastening systems',
    specializations: ['Wood screws', 'Roofing fasteners', 'Insulation anchors'],
  },
  fastenal: {
    id: 'fastenal',
    name: 'Fastenal Company',
    shortName: 'FASTENAL',
    logoPath: '/images/suppliers/fastenal.svg',
    primaryColor: '#003F72',
    secondaryColor: '#00A3E0',
    badgeBackground: 'bg-blue-800',
    badgeText: 'text-white',
    websiteUrl: 'https://www.fastenal.com',
    country: 'United States',
    countryFlag: 'US',
    countryCode: 'US',
    description: 'North American industrial and construction supply distributor',
    specializations: ['Industrial supplies', 'Vending solutions', 'Safety products'],
  },
  other: {
    id: 'other',
    name: 'Other Supplier',
    shortName: 'OTHER',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    badgeBackground: 'bg-slate-500',
    badgeText: 'text-white',
    websiteUrl: '',
    country: 'Unknown',
    countryFlag: 'UN',
    countryCode: 'XX',
    description: 'Unspecified or other supplier',
    specializations: [],
  },
};

/**
 * Normalize supplier string to SupplierId
 */
export function normalizeSupplierName(supplierString?: string | null): SupplierId {
  if (!supplierString) return 'other';

  const normalized = supplierString.toLowerCase().trim();

  // Direct match
  if (normalized in SUPPLIERS) {
    return normalized as SupplierId;
  }

  // Pattern matching for common variations
  if (normalized.includes('reyher')) return 'reyher';
  if (normalized.includes('wurth') || normalized.includes('wuerth') || normalized.includes('würth')) return 'wurth';
  if (normalized.includes('bossard')) return 'bossard';
  if (normalized.includes('fabory')) return 'fabory';
  if (normalized.includes('hilti')) return 'hilti';
  if (normalized.includes('fischer')) return 'fischer';
  if (normalized.includes('klimas') || normalized.includes('wkret')) return 'klimas';
  if (normalized.includes('fastenal')) return 'fastenal';

  return 'other';
}

/**
 * Get supplier config by ID or string name
 */
export function getSupplierConfig(supplierIdOrName?: string | null): SupplierConfig {
  const id = normalizeSupplierName(supplierIdOrName);
  return SUPPLIERS[id];
}

/**
 * Get all configured suppliers
 */
export function getAllSuppliers(): SupplierConfig[] {
  return Object.values(SUPPLIERS).filter(s => s.id !== 'other');
}

/**
 * Get suppliers by country
 */
export function getSuppliersByCountry(countryCode: string): SupplierConfig[] {
  return Object.values(SUPPLIERS).filter(
    s => s.countryCode.toUpperCase() === countryCode.toUpperCase()
  );
}

/**
 * Check if a supplier has a logo configured
 */
export function hasSupplierLogo(supplierId: SupplierId): boolean {
  const config = SUPPLIERS[supplierId];
  return !!config?.logoPath;
}

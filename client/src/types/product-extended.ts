/**
 * Extended Product Types for B2B Product Information Page
 * Architecture Design for InoxBolt Fastener Wholesale Platform
 *
 * This file extends the base ProductInfo type with comprehensive
 * data structures for a full-featured product detail page.
 */

// =============================================================================
// BASE TYPES (Re-exported from original)
// =============================================================================

export type { ProductInfo } from './product';
export { MATERIAL_INFO, extractProductName, getMaterialInfo, formatSupplier } from './product';

// =============================================================================
// ENUMERATIONS & CONSTANTS
// =============================================================================

/**
 * Fastener product categories
 */
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

/**
 * Drive types for fasteners
 */
export type DriveType =
  | 'hex'
  | 'phillips'
  | 'pozidriv'
  | 'torx'
  | 'allen'
  | 'slotted'
  | 'square'
  | 'tri_wing'
  | 'spanner'
  | 'one_way';

/**
 * Surface finishes
 */
export type SurfaceFinish =
  | 'plain'
  | 'zinc_plated'
  | 'hot_dip_galvanized'
  | 'phosphate'
  | 'black_oxide'
  | 'passivated'
  | 'dacromet'
  | 'geomet'
  | 'ptfe'
  | 'chrome';

/**
 * Certification bodies/standards
 */
export type CertificationBody = 'DIN' | 'ISO' | 'ASTM' | 'CE' | 'TUV' | 'REACH' | 'RoHS';

/**
 * Supplier identifiers
 */
export type SupplierCode = 'REYHER' | 'KLIMAS' | 'WUERTH' | 'BOSSARD' | 'FASTENAL' | 'OTHER';

// =============================================================================
// EXTENDED DATA STRUCTURES
// =============================================================================

/**
 * Structured dimension specifications for fasteners
 */
export interface FastenerDimensions {
  /** Nominal diameter (e.g., M8, M10) */
  diameter: string;
  /** Thread pitch in mm */
  pitch?: number;
  /** Total length in mm */
  length?: number;
  /** Thread length in mm */
  threadLength?: number;
  /** Head diameter in mm */
  headDiameter?: number;
  /** Head height in mm */
  headHeight?: number;
  /** Key size for hex socket (Allen) in mm */
  keySize?: number;
  /** Across flats dimension for hex heads */
  acrossFlats?: number;
}

/**
 * Mechanical properties (strength grades)
 */
export interface MechanicalProperties {
  /** Property class (e.g., 8.8, 10.9, 12.9 for bolts) */
  propertyClass?: string;
  /** Tensile strength in MPa */
  tensileStrength?: number;
  /** Yield strength in MPa */
  yieldStrength?: number;
  /** Hardness (HRC or HV) */
  hardness?: string;
  /** Proof load in kN */
  proofLoad?: number;
}

/**
 * Material composition and properties
 */
export interface MaterialSpecification {
  /** Material code (A2, A4, 8.8, etc.) */
  code: string;
  /** Full material name */
  name: string;
  /** Material group */
  group: 'stainless_steel' | 'carbon_steel' | 'alloy_steel' | 'brass' | 'aluminum' | 'other';
  /** Specific grade (e.g., 304, 316, 1.4301) */
  grade?: string;
  /** Surface finish */
  finish?: SurfaceFinish;
  /** Corrosion resistance rating 1-5 */
  corrosionResistance?: number;
  /** Temperature range in Celsius */
  temperatureRange?: { min: number; max: number };
}

/**
 * Certification and compliance data
 */
export interface Certification {
  /** Certification type */
  type: CertificationBody;
  /** Standard number (e.g., DIN 933, ISO 4017) */
  standardNumber: string;
  /** Standard description */
  description?: string;
  /** Certificate document URL if available */
  certificateUrl?: string;
  /** Expiry date if applicable */
  validUntil?: string;
}

/**
 * Pricing structure with B2B tiers
 */
export interface PricingTier {
  /** Minimum quantity for this tier */
  minQuantity: number;
  /** Maximum quantity for this tier (null = unlimited) */
  maxQuantity: number | null;
  /** Unit price in EUR */
  unitPrice: number;
  /** Discount percentage from list price */
  discountPercent?: number;
}

export interface PricingData {
  /** Currency code */
  currency: 'EUR' | 'USD' | 'GBP';
  /** Base list price per unit */
  listPrice?: number;
  /** Minimum order quantity */
  moq: number;
  /** Standard packaging quantity */
  packagingQuantity: number;
  /** Available pricing tiers */
  tiers: PricingTier[];
  /** Price validity date */
  validUntil?: string;
  /** Lead time in business days */
  leadTimeDays?: number;
  /** Stock availability status */
  availability: 'in_stock' | 'limited' | 'on_order' | 'discontinued';
}

/**
 * Compatible product reference
 */
export interface CompatibleProduct {
  /** Product ID for linking */
  id: string;
  /** Product name/description */
  name: string;
  /** Compatibility type */
  type: 'nut' | 'washer' | 'lock_washer' | 'tool' | 'anchor' | 'accessory';
  /** Specific standard if applicable */
  standard?: string;
  /** Recommended flag */
  isRecommended?: boolean;
}

/**
 * Document/datasheet reference
 */
export interface ProductDocument {
  /** Document type */
  type: 'datasheet' | 'certificate' | 'drawing' | 'catalogue_page' | 'msds' | 'installation_guide';
  /** Document title */
  title: string;
  /** URL to document */
  url: string;
  /** File format */
  format: 'pdf' | 'dwg' | 'step' | 'iges' | 'png';
  /** File size in bytes */
  sizeBytes?: number;
  /** Language code */
  language?: 'en' | 'es' | 'de' | 'fr';
}

/**
 * Source catalogue reference
 */
export interface SourceReference {
  /** Supplier code */
  supplier: SupplierCode;
  /** Catalogue name/edition */
  catalogueName: string;
  /** Page number in catalogue */
  pageNumber: number;
  /** Supplier's article/part number */
  articleNumber?: string;
  /** Section within catalogue */
  section?: string;
  /** Year/edition */
  edition?: string;
  /** Direct link to catalogue page if available */
  catalogueUrl?: string;
}

/**
 * Product image with metadata
 */
export interface ProductImage {
  /** Image URL */
  url: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image type */
  type: 'primary' | 'technical_drawing' | 'dimension_diagram' | 'application' | 'packaging';
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Caption */
  caption?: string;
}

/**
 * Brand/manufacturer information
 */
export interface BrandInfo {
  /** Brand name */
  name: string;
  /** Brand logo URL */
  logoUrl?: string;
  /** Country of origin */
  countryOfOrigin?: string;
  /** Manufacturer website */
  website?: string;
  /** Quality certifications held */
  certifications?: string[];
}

// =============================================================================
// EXTENDED PRODUCT INFO (Main Type)
// =============================================================================

/**
 * Extended product information combining all data structures
 * This is the comprehensive type for a full product detail page
 */
export interface ExtendedProductInfo {
  // --- Core Identification ---
  /** Unique product ID */
  id: string;
  /** Product name/title */
  name: string;
  /** Short description */
  shortDescription?: string;
  /** Full description/content */
  content: string;
  /** Product category */
  category: FastenerCategory;
  /** Product SKU */
  sku?: string;
  /** EAN/barcode */
  ean?: string;

  // --- Brand & Manufacturer ---
  brand?: BrandInfo;

  // --- Technical Specifications ---
  /** Fastener dimensions */
  dimensions?: FastenerDimensions;
  /** Mechanical properties */
  mechanicalProperties?: MechanicalProperties;
  /** Material specification */
  material?: MaterialSpecification;
  /** Head type */
  headType?: string;
  /** Drive type */
  driveType?: DriveType;
  /** Thread type (coarse/fine) */
  threadType?: 'coarse' | 'fine' | 'unc' | 'unf';
  /** Left/right hand thread */
  threadDirection?: 'right' | 'left';

  // --- Standards & Certifications ---
  /** Primary standard (DIN/ISO) */
  primaryStandard?: string;
  /** All applicable certifications */
  certifications: Certification[];

  // --- Pricing & Availability ---
  pricing?: PricingData;

  // --- Compatibility ---
  compatibleProducts: CompatibleProduct[];
  /** Tool requirements */
  requiredTools?: string[];

  // --- Documentation ---
  documents: ProductDocument[];
  images: ProductImage[];

  // --- Source/Catalogue Reference ---
  sourceReference: SourceReference;

  // --- Related Products ---
  relatedProductIds: string[];

  // --- Search/Relevance ---
  /** Relevance score from search */
  score?: number;
  /** Search highlight snippets */
  highlights?: string[];

  // --- Metadata ---
  /** Created timestamp */
  createdAt?: string;
  /** Last updated timestamp */
  updatedAt?: string;
  /** Data quality score 0-100 */
  dataQuality?: number;
}

// =============================================================================
// COMPONENT PROPS INTERFACES
// =============================================================================

/**
 * Base props shared by all section components
 */
export interface BaseSectionProps {
  /** Optional CSS class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Compact display mode */
  compact?: boolean;
}

/**
 * ProductHeader section props
 */
export interface ProductHeaderProps extends BaseSectionProps {
  /** Brand information */
  brand?: BrandInfo;
  /** Product name */
  name: string;
  /** Short description */
  shortDescription?: string;
  /** Primary image */
  primaryImage?: ProductImage;
  /** Product category */
  category?: FastenerCategory;
  /** SKU */
  sku?: string;
  /** Availability status */
  availability?: PricingData['availability'];
  /** Actions slot */
  actions?: React.ReactNode;
}

/**
 * TechnicalSpecs section props
 */
export interface TechnicalSpecsProps extends BaseSectionProps {
  /** Fastener dimensions */
  dimensions?: FastenerDimensions;
  /** Material specification */
  material?: MaterialSpecification;
  /** Mechanical properties */
  mechanicalProperties?: MechanicalProperties;
  /** Primary standard */
  primaryStandard?: string;
  /** Head type */
  headType?: string;
  /** Drive type */
  driveType?: DriveType;
  /** Thread details */
  threadType?: string;
  threadDirection?: 'right' | 'left';
  /** Expandable details mode */
  expandable?: boolean;
}

/**
 * Certifications section props
 */
export interface CertificationsSectionProps extends BaseSectionProps {
  /** List of certifications */
  certifications: Certification[];
  /** Primary standard highlight */
  primaryStandard?: string;
  /** Show download links */
  showDownloads?: boolean;
}

/**
 * PricingSection props
 */
export interface PricingSectionProps extends BaseSectionProps {
  /** Full pricing data */
  pricing?: PricingData;
  /** Callback when quantity changes for price calculation */
  onQuantityChange?: (quantity: number) => void;
  /** Show quantity selector */
  showQuantitySelector?: boolean;
  /** Initial quantity */
  initialQuantity?: number;
}

/**
 * CompatibilitySection props
 */
export interface CompatibilitySectionProps extends BaseSectionProps {
  /** Compatible products list */
  compatibleProducts: CompatibleProduct[];
  /** Required tools */
  requiredTools?: string[];
  /** Callback when a compatible product is clicked */
  onProductClick?: (productId: string) => void;
}

/**
 * DocumentsSection props
 */
export interface DocumentsSectionProps extends BaseSectionProps {
  /** Available documents */
  documents: ProductDocument[];
  /** Images/drawings */
  images?: ProductImage[];
  /** Show image gallery */
  showGallery?: boolean;
}

/**
 * SourceReference section props
 */
export interface SourceReferenceSectionProps extends BaseSectionProps {
  /** Source reference data */
  sourceReference: SourceReference;
  /** Data quality indicator */
  dataQuality?: number;
  /** Show catalogue link */
  showCatalogueLink?: boolean;
}

/**
 * RelatedProducts section props
 */
export interface RelatedProductsSectionProps extends BaseSectionProps {
  /** Related product IDs */
  relatedProductIds: string[];
  /** Fetched related products (optional pre-loaded) */
  relatedProducts?: ExtendedProductInfo[];
  /** Callback when a product is clicked */
  onProductClick?: (productId: string) => void;
  /** Maximum items to display */
  maxItems?: number;
}

/**
 * QuoteRequestSection props
 */
export interface QuoteRequestSectionProps extends BaseSectionProps {
  /** Product for quote */
  product: ExtendedProductInfo;
  /** Pre-filled quantity */
  initialQuantity?: number;
  /** Callback on form submit */
  onSubmit?: (data: QuoteRequestData) => void;
  /** Available contact methods */
  contactMethods?: ('whatsapp' | 'email' | 'phone' | 'form')[];
}

/**
 * Quote request form data
 */
export interface QuoteRequestData {
  productId: string;
  quantity: number;
  unit: 'pcs' | 'boxes' | 'kg' | 'sets';
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  preferredContactMethod?: 'whatsapp' | 'email' | 'phone';
  deliveryLocation?: string;
  requiredDate?: string;
}

// =============================================================================
// PAGE COMPOSITION PROPS
// =============================================================================

/**
 * Full product page props
 */
export interface ProductPageProps {
  /** Product ID for data fetching */
  productId: string;
  /** Pre-loaded product data (optional for SSR) */
  initialData?: ExtendedProductInfo;
  /** Visible sections configuration */
  sections?: ProductPageSections;
  /** Layout variant */
  layout?: 'full' | 'compact' | 'modal';
}

/**
 * Section visibility configuration
 */
export interface ProductPageSections {
  header?: boolean;
  technicalSpecs?: boolean;
  certifications?: boolean;
  pricing?: boolean;
  compatibility?: boolean;
  documents?: boolean;
  sourceReference?: boolean;
  relatedProducts?: boolean;
  quoteRequest?: boolean;
}

/**
 * Default sections configuration
 */
export const DEFAULT_SECTIONS: ProductPageSections = {
  header: true,
  technicalSpecs: true,
  certifications: true,
  pricing: true,
  compatibility: true,
  documents: true,
  sourceReference: true,
  relatedProducts: true,
  quoteRequest: true,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert base ProductInfo to ExtendedProductInfo with extracted data
 * Now uses enhanced metadata from vector DB when available
 */
export function toExtendedProductInfo(
  base: import('./product').ProductInfo,
  additionalData?: Partial<ExtendedProductInfo>
): ExtendedProductInfo {
  // Use API-provided dimensions if available, otherwise extract from content
  let dimensions = base.dimensions ? parseDimensionsString(base.dimensions) : extractDimensions(base.content);

  // Determine category from API productType or infer from content
  const category = base.productType
    ? (base.productType as FastenerCategory)
    : inferCategory(base.name || base.productName || '', base.content);

  // Build material specification with finish from API
  const material = base.material ? {
    code: base.material,
    name: base.material,
    group: inferMaterialGroup(base.material),
    finish: base.finish ? (base.finish.replace(/-/g, '_') as SurfaceFinish) : undefined,
  } as MaterialSpecification : undefined;

  // Build source reference
  const sourceReference: SourceReference = {
    supplier: (base.supplier?.toUpperCase() as SupplierCode) || 'OTHER',
    catalogueName: base.documentName || 'Unknown Catalogue',
    pageNumber: base.pageNumber || 0,
  };

  // Build certifications from standard
  const certifications: Certification[] = [];
  if (base.standard) {
    const certType = base.standard.startsWith('DIN') ? 'DIN' :
                     base.standard.startsWith('ISO') ? 'ISO' : 'DIN';
    certifications.push({
      type: certType,
      standardNumber: base.standard,
    });
  }

  // Build pricing data from enhanced metadata
  const pricing: PricingData | undefined = base.priceInfo || base.packagingUnit ? {
    currency: 'EUR',
    moq: base.packagingUnit ? parseInt(base.packagingUnit) || 1 : 1,
    packagingQuantity: base.packagingUnit ? parseInt(base.packagingUnit) || 100 : 100,
    tiers: [],
    availability: 'in_stock',
  } : undefined;

  // Use productName from API if available
  const productName = base.productName || base.name || extractProductName(base);

  return {
    id: base.id,
    name: productName,
    shortDescription: base.priceInfo ? `${productName} - ${base.priceInfo}` : undefined,
    content: base.content,
    category,
    dimensions,
    material,
    headType: base.headType,
    threadType: base.threadType as ExtendedProductInfo['threadType'],
    primaryStandard: base.standard,
    certifications,
    pricing,
    compatibleProducts: [],
    documents: [],
    images: [],
    sourceReference,
    relatedProductIds: [],
    score: base.score,
    ...additionalData,
  };
}

/**
 * Parse dimensions string from API (e.g., "M8, M10, M12x30") into FastenerDimensions
 */
function parseDimensionsString(dimensionsStr: string): FastenerDimensions | undefined {
  if (!dimensionsStr) return undefined;

  const dimensions: FastenerDimensions = {} as FastenerDimensions;

  // Get first dimension as primary
  const firstDim = dimensionsStr.split(',')[0].trim();

  // Extract diameter
  const diameterMatch = firstDim.match(/M(\d+(?:\.\d+)?)/i);
  if (diameterMatch) {
    dimensions.diameter = `M${diameterMatch[1]}`;
  }

  // Extract length if present
  const lengthMatch = firstDim.match(/[xX](\d+)/);
  if (lengthMatch) {
    dimensions.length = parseInt(lengthMatch[1], 10);
  }

  return Object.keys(dimensions).length > 0 ? dimensions : undefined;
}

/**
 * Extract dimensions from content text
 */
function extractDimensions(content: string): FastenerDimensions | undefined {
  if (!content) return undefined;

  const dimensions: FastenerDimensions = {} as FastenerDimensions;

  // Extract diameter (M8, M10, etc.)
  const diameterMatch = content.match(/\bM(\d+(?:\.\d+)?)\b/i);
  if (diameterMatch) {
    dimensions.diameter = `M${diameterMatch[1]}`;
  }

  // Extract length (x30, x50, etc.)
  const lengthMatch = content.match(/\bM\d+\s*[xX]\s*(\d+)\b/i);
  if (lengthMatch) {
    dimensions.length = parseInt(lengthMatch[1], 10);
  }

  // Extract pitch if fine thread specified
  const pitchMatch = content.match(/pitch[:\s]+(\d+(?:\.\d+)?)\s*mm/i);
  if (pitchMatch) {
    dimensions.pitch = parseFloat(pitchMatch[1]);
  }

  return Object.keys(dimensions).length > 0 ? dimensions : undefined;
}

/**
 * Infer product category from name/content
 */
function inferCategory(name: string, content: string): FastenerCategory {
  const text = `${name} ${content}`.toLowerCase();

  if (text.includes('bolt') || text.includes('schr') || text.includes('perno')) return 'bolt';
  if (text.includes('screw') || text.includes('tornillo')) return 'screw';
  if (text.includes('nut') || text.includes('mutter') || text.includes('tuerca')) return 'nut';
  if (text.includes('washer') || text.includes('scheibe') || text.includes('arandela')) return 'washer';
  if (text.includes('anchor') || text.includes('anker')) return 'anchor';
  if (text.includes('rivet') || text.includes('niet')) return 'rivet';
  if (text.includes('pin') || text.includes('stift')) return 'pin';
  if (text.includes('rod') || text.includes('stange')) return 'threaded_rod';
  if (text.includes('insert') || text.includes('einsatz')) return 'insert';

  return 'other';
}

/**
 * Infer material group from code
 */
function inferMaterialGroup(code: string): MaterialSpecification['group'] {
  const upperCode = code.toUpperCase();

  if (upperCode.includes('A2') || upperCode.includes('A4') ||
      upperCode.includes('304') || upperCode.includes('316')) {
    return 'stainless_steel';
  }
  if (upperCode.includes('8.8') || upperCode.includes('10.9') ||
      upperCode.includes('12.9')) {
    return 'carbon_steel';
  }
  if (upperCode.includes('BRASS')) return 'brass';
  if (upperCode.includes('ALUM')) return 'aluminum';

  return 'other';
}

/**
 * Get placeholder image URL based on category
 */
export function getPlaceholderImage(category: FastenerCategory): string {
  const basePath = '/images/placeholders';
  const imageMap: Record<FastenerCategory, string> = {
    bolt: `${basePath}/bolt.svg`,
    screw: `${basePath}/screw.svg`,
    nut: `${basePath}/nut.svg`,
    washer: `${basePath}/washer.svg`,
    anchor: `${basePath}/anchor.svg`,
    rivet: `${basePath}/rivet.svg`,
    pin: `${basePath}/pin.svg`,
    threaded_rod: `${basePath}/threaded-rod.svg`,
    insert: `${basePath}/insert.svg`,
    other: `${basePath}/fastener.svg`,
  };
  return imageMap[category];
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(price);
}

/**
 * Calculate price for quantity based on tiers
 */
export function calculateTieredPrice(
  quantity: number,
  pricing: PricingData
): { unitPrice: number; totalPrice: number; tier: PricingTier | null } {
  const applicableTier = pricing.tiers.find(
    tier => quantity >= tier.minQuantity &&
           (tier.maxQuantity === null || quantity <= tier.maxQuantity)
  ) || pricing.tiers[0];

  if (!applicableTier) {
    return { unitPrice: 0, totalPrice: 0, tier: null };
  }

  return {
    unitPrice: applicableTier.unitPrice,
    totalPrice: applicableTier.unitPrice * quantity,
    tier: applicableTier,
  };
}

// Import for use in conversion function
import { extractProductName } from './product';

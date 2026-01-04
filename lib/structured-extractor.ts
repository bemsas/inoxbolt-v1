/**
 * Structured Product Extractor using Vision LLM (2025 Best Practices)
 * Uses OpenAI Vision API to extract structured product data from PDF pages
 */

import OpenAI from 'openai';
import type {
  StructuredProduct,
  ExtractedTable,
  ExtractionResult,
  FastenerCategory,
  MaterialGrade,
  HeadType,
  DriveType,
  ProductDimensions,
  PricingInfo,
} from './product-schema.js';
import {
  detectCategoryFromStandard,
  normalizeMaterialGrade,
  parseThreadSpec,
  generateProductName,
} from './product-schema.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  VISION_MODEL: 'gpt-4o', // Best for document understanding
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.1, // Low temperature for factual extraction
  MAX_PAGES_PER_BATCH: 5,
  IMAGE_DETAIL: 'high' as const,
};

// =============================================================================
// EXTRACTION PROMPTS
// =============================================================================

const PRODUCT_EXTRACTION_PROMPT = `You are a B2B fastener catalog data extraction specialist. Analyze this PDF page image and extract structured product information.

FOCUS ON:
1. Product specifications (DIN/ISO standards, thread sizes, materials)
2. Pricing tables with quantities and prices
3. Technical specifications (dimensions, mechanical properties)
4. Product images and their descriptions

OUTPUT FORMAT: Return a JSON object with this structure:
{
  "products": [
    {
      "standard": "DIN 933",
      "threadSpec": "M8x30",
      "category": "bolt",
      "headType": "hex",
      "driveType": "hex",
      "material": "a2-70",
      "dimensions": {
        "threadDiameter": 8,
        "length": 30
      },
      "pricing": {
        "boxQuantity": 100,
        "boxPrice": 25.50,
        "currency": "EUR"
      },
      "rawContent": "Original text from catalog"
    }
  ],
  "tables": [
    {
      "title": "Size and Price Table",
      "columns": ["Thread", "Length", "Pack", "Price"],
      "rows": [
        {"Thread": "M8", "Length": "30", "Pack": "100", "Price": "25.50"}
      ]
    }
  ],
  "pageType": "product_listing" | "specification_table" | "cover" | "index" | "other",
  "confidence": 0.85
}

RULES:
- Extract ALL products visible on the page
- For thread specifications, use format M{diameter}x{length} (e.g., M8x30)
- Normalize materials: A2, A4, 8.8, 10.9, 12.9
- Prices in EUR unless otherwise specified
- Include confidence score (0-1) based on data clarity
- If page has no products, return empty products array`;

const TABLE_EXTRACTION_PROMPT = `Analyze this catalog page and extract ALL tabular data.

FOCUS ON:
1. Product specification tables
2. Price lists with size variants
3. Dimension tables
4. Material/grade tables

OUTPUT FORMAT: Return JSON with extracted tables:
{
  "tables": [
    {
      "title": "Table title or product standard",
      "standard": "DIN 933" (if applicable),
      "columns": [
        {"name": "Size", "type": "thread"},
        {"name": "Length", "type": "dimension", "unit": "mm"},
        {"name": "Package", "type": "quantity"},
        {"name": "Price", "type": "price", "unit": "EUR"}
      ],
      "rows": [
        {"Size": "M6", "Length": "20", "Package": "200", "Price": "15.80"},
        {"Size": "M6", "Length": "25", "Package": "200", "Price": "16.20"}
      ],
      "confidence": 0.9
    }
  ]
}

IMPORTANT:
- Preserve exact values from tables (don't interpret or calculate)
- Include ALL rows, not just examples
- Detect column types: thread, dimension, material, price, quantity, code, text
- Note any merged cells or complex structures`;

// =============================================================================
// VISION API CLIENT
// =============================================================================

interface VisionExtractionResult {
  products: Array<Partial<StructuredProduct>>;
  tables: Array<Partial<ExtractedTable>>;
  pageType: string;
  confidence: number;
  rawResponse?: string;
}

/**
 * Extract structured data from a PDF page image using Vision LLM
 */
async function extractFromPageImage(
  openai: OpenAI,
  imageBase64: string,
  pageNumber: number,
  documentContext: {
    supplier?: string;
    documentName: string;
  }
): Promise<VisionExtractionResult> {
  try {
    const response = await openai.chat.completions.create({
      model: CONFIG.VISION_MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      messages: [
        {
          role: 'system',
          content: `You are extracting product data from a ${documentContext.supplier || 'fastener'} catalog named "${documentContext.documentName}". Page ${pageNumber}. Return valid JSON only.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: PRODUCT_EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: CONFIG.IMAGE_DETAIL,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());

    return {
      products: parsed.products || [],
      tables: parsed.tables || [],
      pageType: parsed.pageType || 'other',
      confidence: parsed.confidence || 0.5,
      rawResponse: content,
    };
  } catch (error) {
    console.error(`Vision extraction failed for page ${pageNumber}:`, error);
    return {
      products: [],
      tables: [],
      pageType: 'error',
      confidence: 0,
      rawResponse: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Extract detailed table data from page
 */
async function extractTablesFromPage(
  openai: OpenAI,
  imageBase64: string,
  pageNumber: number
): Promise<ExtractedTable[]> {
  try {
    const response = await openai.chat.completions.create({
      model: CONFIG.VISION_MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: TABLE_EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: CONFIG.IMAGE_DETAIL,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '{}';

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());

    return (parsed.tables || []).map((table: any, idx: number) => ({
      id: `table-${pageNumber}-${idx}`,
      pageNumber,
      title: table.title,
      standard: table.standard,
      columns: table.columns || [],
      rows: table.rows || [],
      confidence: table.confidence || 0.5,
    }));
  } catch (error) {
    console.error(`Table extraction failed for page ${pageNumber}:`, error);
    return [];
  }
}

// =============================================================================
// PRODUCT NORMALIZATION
// =============================================================================

/**
 * Normalize extracted product data to standard schema
 */
function normalizeProduct(
  raw: Partial<StructuredProduct>,
  pageNumber: number,
  documentId: string,
  supplier?: string
): StructuredProduct {
  // Parse thread spec
  const threadParsed = raw.threadSpec ? parseThreadSpec(raw.threadSpec) : null;

  // Determine category
  let category: FastenerCategory = raw.category || 'other';
  if (category === 'other' && raw.standard) {
    category = detectCategoryFromStandard(raw.standard);
  }

  // Normalize material
  let material: MaterialGrade = 'other';
  if (raw.material) {
    material = normalizeMaterialGrade(raw.material as string);
  }

  // Build dimensions
  const dimensions: ProductDimensions = {
    ...raw.dimensions,
    threadDiameter: threadParsed?.diameter || raw.dimensions?.threadDiameter,
    length: threadParsed?.length || raw.dimensions?.length,
  };

  // Build pricing
  const pricing: PricingInfo | undefined = raw.pricing
    ? {
        ...raw.pricing,
        currency: raw.pricing.currency || 'EUR',
      }
    : undefined;

  const product: StructuredProduct = {
    id: `${documentId}-p${pageNumber}-${Date.now()}`,
    category,
    standard: raw.standard,
    name: raw.name || generateProductName({ standard: raw.standard, category, threadSpec: raw.threadSpec, material }),
    threadSpec: raw.threadSpec || '',
    dimensions,
    headType: raw.headType,
    driveType: raw.driveType,
    material,
    materialDescription: raw.materialDescription,
    finish: raw.finish,
    mechanicalProperties: raw.mechanicalProperties,
    pricing,
    supplier,
    sourcePage: pageNumber,
    rawContent: raw.rawContent,
    confidence: {
      overall: 0.7, // Default, will be updated
      dimensions: dimensions.threadDiameter ? 0.9 : 0.3,
      material: material !== 'other' ? 0.9 : 0.3,
      pricing: pricing ? 0.8 : 0.2,
    },
  };

  // Calculate overall confidence
  product.confidence.overall =
    (product.confidence.dimensions + product.confidence.material + product.confidence.pricing) / 3;

  return product;
}

// =============================================================================
// TABLE TO PRODUCTS CONVERTER
// =============================================================================

/**
 * Convert extracted table rows to individual products
 */
function tableToProducts(
  table: ExtractedTable,
  documentId: string,
  supplier?: string
): StructuredProduct[] {
  const products: StructuredProduct[] = [];

  // Find column indices
  const threadCol = table.columns.findIndex(c => c.type === 'thread' || c.name.toLowerCase().includes('size'));
  const lengthCol = table.columns.findIndex(c => c.name.toLowerCase().includes('length') || c.name.toLowerCase() === 'l');
  const priceCol = table.columns.findIndex(c => c.type === 'price' || c.name.toLowerCase().includes('price'));
  const qtyCol = table.columns.findIndex(c => c.type === 'quantity' || c.name.toLowerCase().includes('pack'));
  const materialCol = table.columns.findIndex(c => c.type === 'material' || c.name.toLowerCase().includes('material'));

  for (const row of table.rows) {
    try {
      const values = Object.values(row);

      // Extract thread spec
      let threadSpec = '';
      if (threadCol >= 0 && values[threadCol]) {
        const thread = String(values[threadCol]);
        const length = lengthCol >= 0 && values[lengthCol] ? String(values[lengthCol]) : '';
        threadSpec = length ? `${thread}x${length}`.replace(/\s/g, '') : thread;
        if (!threadSpec.startsWith('M') && /^\d/.test(threadSpec)) {
          threadSpec = `M${threadSpec}`;
        }
      }

      if (!threadSpec) continue; // Skip rows without thread spec

      // Extract pricing
      let pricing: PricingInfo | undefined;
      if (priceCol >= 0 && values[priceCol]) {
        const priceStr = String(values[priceCol]).replace(/[^\d.,]/g, '').replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price)) {
          pricing = {
            boxPrice: price,
            currency: 'EUR',
          };

          if (qtyCol >= 0 && values[qtyCol]) {
            const qty = parseInt(String(values[qtyCol]).replace(/\D/g, ''), 10);
            if (!isNaN(qty)) {
              pricing.boxQuantity = qty;
              pricing.unitPrice = price / qty;
            }
          }
        }
      }

      // Extract material
      let material: MaterialGrade = 'other';
      if (materialCol >= 0 && values[materialCol]) {
        material = normalizeMaterialGrade(String(values[materialCol]));
      }

      // Determine category from table standard
      const category = table.standard ? detectCategoryFromStandard(table.standard) : 'other';

      const product: StructuredProduct = {
        id: `${documentId}-t${table.pageNumber}-${products.length}`,
        category,
        standard: table.standard,
        name: generateProductName({ standard: table.standard, category, threadSpec, material }),
        threadSpec,
        dimensions: parseThreadSpec(threadSpec) || {},
        material,
        pricing,
        supplier,
        sourcePage: table.pageNumber,
        confidence: {
          overall: table.confidence || 0.7,
          dimensions: 0.9,
          material: material !== 'other' ? 0.9 : 0.5,
          pricing: pricing ? 0.9 : 0.2,
        },
      };

      products.push(product);
    } catch (error) {
      console.warn('Failed to parse table row:', error);
    }
  }

  return products;
}

// =============================================================================
// PDF PAGE IMAGE EXTRACTION
// =============================================================================

/**
 * Convert PDF page to base64 image using pdf.js
 * Note: This requires canvas support in the environment
 */
async function pdfPageToImage(pdfBuffer: Buffer, pageNum: number): Promise<string | null> {
  try {
    // Dynamic import pdf.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const page = await pdf.getPage(pageNum);

    const scale = 2.0; // Higher resolution for better OCR
    const viewport = page.getViewport({ scale });

    // Create canvas
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context as any,
      viewport,
    }).promise;

    // Convert to base64
    return canvas.toBuffer('image/png').toString('base64');
  } catch (error) {
    console.error(`Failed to convert page ${pageNum} to image:`, error);
    return null;
  }
}

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

export interface StructuredExtractionOptions {
  useVision?: boolean;           // Enable Vision LLM extraction
  extractTables?: boolean;       // Extract detailed tables
  maxPages?: number;             // Limit pages to process
  skipCoverPages?: number;       // Skip first N pages (cover, TOC)
  onProgress?: (page: number, total: number) => void;
}

/**
 * Extract structured product data from PDF document
 */
export async function extractStructuredProducts(
  documentId: string,
  pdfBuffer: Buffer,
  documentName: string,
  supplier: string | null,
  options: StructuredExtractionOptions = {}
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const {
    useVision = true,
    extractTables = true,
    maxPages,
    skipCoverPages = 2,
    onProgress,
  } = options;

  const result: ExtractionResult = {
    documentId,
    documentName,
    supplier: supplier || undefined,
    products: [],
    tables: [],
    productImages: [],
    pageCount: 0,
    processingTimeMs: 0,
    extractionMethod: useVision ? 'vision' : 'text_only',
    overallConfidence: 0,
    warnings: [],
    errors: [],
  };

  try {
    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Parse PDF to get page count
    // @ts-expect-error - pdf-parse has no type declarations
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);
    result.pageCount = pdfData.numpages;

    const pagesToProcess = maxPages
      ? Math.min(pdfData.numpages, maxPages + skipCoverPages)
      : pdfData.numpages;

    console.log(`Processing ${pagesToProcess - skipCoverPages} pages (skipping first ${skipCoverPages})`);

    // Process pages
    for (let pageNum = skipCoverPages + 1; pageNum <= pagesToProcess; pageNum++) {
      onProgress?.(pageNum - skipCoverPages, pagesToProcess - skipCoverPages);

      if (useVision) {
        // Convert page to image
        const imageBase64 = await pdfPageToImage(pdfBuffer, pageNum);

        if (imageBase64) {
          // Extract products from page image
          const pageResult = await extractFromPageImage(openai, imageBase64, pageNum, {
            supplier: supplier || undefined,
            documentName,
          });

          // Process extracted products
          for (const rawProduct of pageResult.products) {
            const product = normalizeProduct(rawProduct, pageNum, documentId, supplier || undefined);
            result.products.push(product);
          }

          // Extract detailed tables if enabled
          if (extractTables && pageResult.pageType !== 'cover' && pageResult.pageType !== 'index') {
            const tables = await extractTablesFromPage(openai, imageBase64, pageNum);
            result.tables.push(...tables);

            // Convert tables to products
            for (const table of tables) {
              const tableProducts = tableToProducts(table, documentId, supplier || undefined);
              result.products.push(...tableProducts);
            }
          }
        } else {
          result.warnings.push(`Failed to render page ${pageNum} as image`);
        }
      }
    }

    // Calculate overall confidence
    if (result.products.length > 0) {
      result.overallConfidence =
        result.products.reduce((sum, p) => sum + p.confidence.overall, 0) / result.products.length;
    }

    // Deduplicate products by threadSpec + standard + material
    const seen = new Set<string>();
    result.products = result.products.filter(p => {
      const key = `${p.standard}-${p.threadSpec}-${p.material}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    result.processingTimeMs = Date.now() - startTime;

    console.log(
      `Extraction complete: ${result.products.length} products, ${result.tables.length} tables in ${result.processingTimeMs}ms`
    );

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    result.processingTimeMs = Date.now() - startTime;
    return result;
  }
}

// =============================================================================
// FALLBACK TEXT-BASED EXTRACTION
// =============================================================================

/**
 * Extract products from text content (fallback when vision is unavailable)
 */
export function extractProductsFromText(
  text: string,
  documentId: string,
  pageNumber: number,
  supplier?: string
): StructuredProduct[] {
  const products: StructuredProduct[] = [];

  // Pattern for product lines: standard + thread + material + price
  const productPatterns = [
    // DIN/ISO with thread and material: DIN 933 M8x30 A2-70
    /\b(DIN|ISO)\s*(\d+)\s+M(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s+(A[24](?:-\d+)?|8\.8|10\.9|12\.9)/gi,
    // Thread with packaging and price: M8x30 S100 25.50
    /\bM(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s+S(\d+)\s+([\d.,]+)/gi,
  ];

  for (const pattern of productPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
        let product: StructuredProduct;

        if (match[1] === 'DIN' || match[1] === 'ISO') {
          // Standard + thread + material pattern
          const standard = `${match[1]} ${match[2]}`;
          const threadSpec = `M${match[3]}x${match[4]}`;
          const material = normalizeMaterialGrade(match[5]);

          product = {
            id: `${documentId}-txt-${products.length}`,
            category: detectCategoryFromStandard(standard),
            standard,
            name: generateProductName({ standard, threadSpec, material }),
            threadSpec,
            dimensions: {
              threadDiameter: parseFloat(match[3]),
              length: parseFloat(match[4]),
            },
            material,
            supplier,
            sourcePage: pageNumber,
            confidence: { overall: 0.6, dimensions: 0.8, material: 0.8, pricing: 0.2 },
          };
        } else {
          // Thread + packaging + price pattern
          const threadSpec = `M${match[1]}x${match[2]}`;
          const packQty = parseInt(match[3], 10);
          const price = parseFloat(match[4].replace(',', '.'));

          product = {
            id: `${documentId}-txt-${products.length}`,
            category: 'other',
            name: generateProductName({ threadSpec }),
            threadSpec,
            dimensions: {
              threadDiameter: parseFloat(match[1]),
              length: parseFloat(match[2]),
            },
            material: 'other',
            pricing: {
              boxPrice: price,
              boxQuantity: packQty,
              unitPrice: price / packQty,
              currency: 'EUR',
            },
            supplier,
            sourcePage: pageNumber,
            confidence: { overall: 0.7, dimensions: 0.9, material: 0.3, pricing: 0.9 },
          };
        }

        products.push(product);
      } catch {
        // Skip malformed matches
      }
    }
  }

  return products;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  StructuredProduct,
  ExtractedTable,
  ExtractionResult,
  FastenerCategory,
  MaterialGrade,
  ProductDimensions,
  PricingInfo,
};

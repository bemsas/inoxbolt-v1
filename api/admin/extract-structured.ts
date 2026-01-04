/**
 * API Endpoint: Structured Product Extraction
 * POST /api/admin/extract-structured
 *
 * Extracts structured product data from PDF documents using Vision LLM
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import {
  extractStructuredProducts,
  extractProductsFromText,
  type ExtractionResult,
  type StructuredProduct,
} from '../../lib/structured-extractor.js';

export const config = {
  maxDuration: 300, // 5 minutes for large catalogs
};

interface ExtractRequest {
  documentId: string;
  useVision?: boolean;
  maxPages?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic auth check
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { documentId, useVision = false, maxPages } = req.body as ExtractRequest;

  if (!documentId) {
    return res.status(400).json({ error: 'documentId is required' });
  }

  try {
    console.log(`Starting structured extraction for document ${documentId}`);

    // Get document from database
    const docResult = await sql`
      SELECT id, filename, blob_url, supplier, status
      FROM documents
      WHERE id = ${documentId}
    `;

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = docResult.rows[0];

    if (!doc.blob_url) {
      return res.status(400).json({ error: 'Document has no blob URL' });
    }

    // Fetch PDF
    const pdfResponse = await fetch(doc.blob_url);
    if (!pdfResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch PDF from storage' });
    }
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    let result: ExtractionResult;

    if (useVision) {
      // Full vision-based extraction
      result = await extractStructuredProducts(
        documentId,
        pdfBuffer,
        doc.filename,
        doc.supplier,
        {
          useVision: true,
          extractTables: true,
          maxPages,
          onProgress: (page, total) => {
            console.log(`Processing page ${page}/${total}`);
          },
        }
      );
    } else {
      // Text-based extraction (faster, less accurate)
      // @ts-expect-error - pdf-parse has no type declarations
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(pdfBuffer);

      const products: StructuredProduct[] = extractProductsFromText(
        pdfData.text,
        documentId,
        1,
        doc.supplier
      );

      result = {
        documentId,
        documentName: doc.filename,
        supplier: doc.supplier,
        products,
        tables: [],
        productImages: [],
        pageCount: pdfData.numpages,
        processingTimeMs: 0,
        extractionMethod: 'text_only',
        overallConfidence: products.length > 0
          ? products.reduce((s, p) => s + p.confidence.overall, 0) / products.length
          : 0,
        warnings: [],
        errors: [],
      };
    }

    // Store extracted products in database (optional - for caching)
    if (result.products.length > 0) {
      // Create products table if not exists
      await sql`
        CREATE TABLE IF NOT EXISTS extracted_products (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL,
          category TEXT,
          standard TEXT,
          name TEXT,
          thread_spec TEXT,
          material TEXT,
          pricing JSONB,
          dimensions JSONB,
          confidence JSONB,
          source_page INTEGER,
          raw_content TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
        )
      `;

      // Clear existing products for this document
      await sql`DELETE FROM extracted_products WHERE document_id = ${documentId}`;

      // Insert new products (batch)
      for (const product of result.products.slice(0, 500)) { // Limit to 500 products
        await sql`
          INSERT INTO extracted_products (
            id, document_id, category, standard, name, thread_spec,
            material, pricing, dimensions, confidence, source_page, raw_content
          ) VALUES (
            ${product.id},
            ${documentId},
            ${product.category},
            ${product.standard || null},
            ${product.name},
            ${product.threadSpec},
            ${product.material},
            ${JSON.stringify(product.pricing || {})},
            ${JSON.stringify(product.dimensions || {})},
            ${JSON.stringify(product.confidence)},
            ${product.sourcePage || null},
            ${product.rawContent || null}
          )
        `;
      }

      console.log(`Stored ${Math.min(result.products.length, 500)} products in database`);
    }

    // Update document with extraction info
    await sql`
      UPDATE documents
      SET
        status = 'completed',
        processed_at = NOW()
      WHERE id = ${documentId}
    `;

    return res.status(200).json({
      success: true,
      documentId,
      extractionMethod: result.extractionMethod,
      productsExtracted: result.products.length,
      tablesExtracted: result.tables.length,
      pageCount: result.pageCount,
      processingTimeMs: result.processingTimeMs,
      overallConfidence: result.overallConfidence,
      warnings: result.warnings,
      errors: result.errors,
      // Sample products (first 10)
      sampleProducts: result.products.slice(0, 10).map(p => ({
        name: p.name,
        threadSpec: p.threadSpec,
        material: p.material,
        standard: p.standard,
        pricing: p.pricing,
        confidence: p.confidence.overall,
      })),
    });
  } catch (error) {
    console.error('Structured extraction failed:', error);
    return res.status(500).json({
      error: 'Extraction failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

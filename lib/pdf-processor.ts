import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';

export interface ProcessedChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  tokenCount: number;
}

export interface PDFProcessingResult {
  pageCount: number;
  chunks: ProcessedChunk[];
}

// Create text splitter with settings optimized for technical catalogs
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n\n', '\n', '. ', ', ', ' ', ''],
});

// Rough token count estimate (1 token ~ 4 chars for English)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Clean text by removing excessive whitespace and non-printable characters
function cleanText(text: string): string {
  return text
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\r\n]+/g, '\n') // Normalize line breaks
    .replace(/[ \t]+/g, ' ') // Normalize spaces
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
}

export async function processPDF(buffer: Buffer): Promise<PDFProcessingResult> {
  // Parse PDF
  const data = await pdf(buffer);
  const pageCount = data.numpages;

  // Clean the extracted text
  const cleanedText = cleanText(data.text);

  // Split into chunks
  const splitDocs = await textSplitter.createDocuments([cleanedText]);

  // Create processed chunks
  const chunks: ProcessedChunk[] = splitDocs.map((doc, index) => ({
    content: doc.pageContent,
    pageNumber: 1, // pdf-parse doesn't give per-page text, so we approximate
    chunkIndex: index,
    tokenCount: estimateTokenCount(doc.pageContent),
  }));

  return {
    pageCount,
    chunks,
  };
}

// Process PDF with page-by-page extraction for better accuracy
export async function processPDFByPage(buffer: Buffer): Promise<PDFProcessingResult> {
  const data = await pdf(buffer, {
    // Custom page render to track page numbers
    pagerender: function (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) {
      return pageData.getTextContent().then(function (textContent) {
        let text = '';
        for (const item of textContent.items) {
          text += item.str + ' ';
        }
        return text;
      });
    },
  });

  const pageCount = data.numpages;
  const allChunks: ProcessedChunk[] = [];

  // If we have page-separated text, process each page
  // Otherwise fall back to the full text processing
  const cleanedText = cleanText(data.text);
  const splitDocs = await textSplitter.createDocuments([cleanedText]);

  splitDocs.forEach((doc, index) => {
    allChunks.push({
      content: doc.pageContent,
      pageNumber: Math.ceil(((index + 1) / splitDocs.length) * pageCount), // Approximate page number
      chunkIndex: index,
      tokenCount: estimateTokenCount(doc.pageContent),
    });
  });

  return {
    pageCount,
    chunks: allChunks,
  };
}

// Process large PDFs in batches (for use with Inngest)
export async function processPDFChunked(
  buffer: Buffer,
  startChunk: number = 0,
  maxChunks: number = 50
): Promise<{
  pageCount: number;
  chunks: ProcessedChunk[];
  hasMore: boolean;
  nextStartChunk: number;
}> {
  const { pageCount, chunks } = await processPDF(buffer);

  const endChunk = Math.min(startChunk + maxChunks, chunks.length);
  const selectedChunks = chunks.slice(startChunk, endChunk);

  return {
    pageCount,
    chunks: selectedChunks,
    hasMore: endChunk < chunks.length,
    nextStartChunk: endChunk,
  };
}

import React, { useState, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SearchResult } from '@/contexts/RAGContext';
import { ProductCard, ProductDetailModal } from '@/components/product';
import type { ProductInfo } from '@/types/product';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  onAskAI: () => void;
  onClose: () => void;
}

/**
 * Convert SearchResult to ProductInfo for the ProductCard component
 */
function toProductInfo(result: SearchResult): ProductInfo {
  // Extract metadata from content using patterns
  const content = result.content || result.snippet;

  // Extract standard (DIN/ISO patterns)
  const standardMatch = content.match(/\b(DIN\s*\d+|ISO\s*\d+)\b/i);
  const standard = standardMatch ? standardMatch[0].replace(/\s+/g, ' ').toUpperCase() : undefined;

  // Extract thread type (M6, M8x30, etc.)
  const threadMatch = content.match(/\bM\d{1,2}(?:x[\d.]+)?\b/i);
  const threadType = threadMatch ? threadMatch[0] : undefined;

  // Extract material (A2, A4, 8.8, etc.)
  const materialMatch = content.match(/\b(A[24]|304|316|8\.8|10\.9|12\.9)\b/i);
  const material = materialMatch ? materialMatch[0].toUpperCase() : undefined;

  return {
    id: result.id,
    name: '', // Will be extracted by extractProductName
    content: result.snippet || result.content,
    standard,
    threadType,
    material,
    supplier: result.document.supplier || undefined,
    pageNumber: result.pageNumber || undefined,
    documentName: result.document.filename,
    score: result.score,
  };
}

export function SearchResults({ results, isSearching, error, onAskAI, onClose }: SearchResultsProps) {
  const { language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInquire = useCallback((product: ProductInfo) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  if (isSearching) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{language === 'es' ? 'Buscando...' : 'Searching...'}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
        <p className="text-red-500 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
        <p className="text-slate-500 text-sm text-center mb-3">
          {language === 'es' ? 'No se encontraron resultados' : 'No results found'}
        </p>
        <button
          onClick={() => {
            onAskAI();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-inox-teal text-white rounded-lg hover:bg-inox-teal/90 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          {language === 'es' ? 'Preguntar al Asistente IA' : 'Ask AI Assistant'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 max-h-[28rem] overflow-y-auto">
        <div className="p-2 space-y-2">
          {results.map((result) => {
            const productInfo = toProductInfo(result);
            return (
              <ProductCard
                key={result.id}
                product={productInfo}
                onInquire={handleInquire}
                variant="compact"
              />
            );
          })}
        </div>

        {/* Ask AI footer */}
        <div className="border-t border-slate-100 p-3 bg-slate-50 sticky bottom-0">
          <button
            onClick={() => {
              onAskAI();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-inox-teal text-white rounded-lg hover:bg-inox-teal/90 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            {language === 'es' ? 'Preguntar al Asistente IA' : 'Ask AI for more details'}
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
}

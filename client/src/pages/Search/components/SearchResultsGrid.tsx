import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from '@/components/product';
import type { ProductInfo } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsGridProps {
  results: ProductInfo[];
  isLoading: boolean;
  error: string | null;
  onInquire: (product: ProductInfo) => void;
  query: string;
}

function ResultSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function SearchResultsGrid({
  results,
  isLoading,
  error,
  onInquire,
  query,
}: SearchResultsGridProps) {
  const { language } = useLanguage();

  const t = {
    loading: language === 'es' ? 'Buscando productos...' : 'Searching products...',
    error: language === 'es' ? 'Error al buscar' : 'Search error',
    tryAgain: language === 'es' ? 'Por favor, intenta de nuevo' : 'Please try again',
    searchFor: language === 'es' ? 'Resultados para' : 'Results for',
  };

  // Loading state
  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-600 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-inox-teal" />
          <span>{t.loading}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{t.error}</p>
        <p className="text-red-600 text-sm mt-1">{t.tryAgain}</p>
      </div>
    );
  }

  // Empty state is handled by parent

  // Results
  return (
    <div>
      {/* Search query indicator */}
      {query && results.length > 0 && (
        <div className="mb-4 text-sm text-slate-500">
          {t.searchFor}: <span className="font-medium text-slate-700">"{query}"</span>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onInquire={onInquire}
            variant="default"
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoading && results.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t.loading}</span>
        </div>
      )}
    </div>
  );
}

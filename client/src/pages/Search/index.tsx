import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRAG } from '@/contexts/RAGContext';
import { toExtendedProductInfo } from '@/types/product-extended';
import type { ProductInfo } from '@/types/product';
import { SearchHero } from './components/SearchHero';
import { SearchFilters, FilterState } from './components/SearchFilters';
import { SearchResultsGrid } from './components/SearchResultsGrid';
import { ProductDetailModal } from '@/components/product';
import { toProductInfo, filterResults, extractFilterOptions } from './utils';

export default function SearchPage() {
  const { language } = useLanguage();
  const { performSearch, searchResults, isSearching, searchError, clearSearch } = useRAG();

  // Local search state
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    materials: [],
    standards: [],
    categories: [],
    suppliers: [],
    threadSizes: [],
  });

  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle search
  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim().length >= 2) {
      await performSearch(searchQuery);
      setHasSearched(true);
    } else {
      clearSearch();
      setHasSearched(false);
    }
  }, [performSearch, clearSearch]);

  // Filter results client-side using extracted utility
  const filteredResults = useMemo(() => {
    return filterResults(searchResults, filters);
  }, [searchResults, filters]);

  // Extract available filter options from results using utility
  const availableFilters = useMemo(() => {
    return extractFilterOptions(searchResults);
  }, [searchResults]);

  // Handle product inquiry
  const handleInquire = useCallback((product: ProductInfo) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      materials: [],
      standards: [],
      categories: [],
      suppliers: [],
      threadSizes: [],
    });
  }, []);

  const t = {
    title: language === 'es' ? 'Buscar Productos' : 'Search Products',
    subtitle: language === 'es'
      ? 'Encuentra tornillos, pernos, tuercas y más en nuestros catálogos'
      : 'Find screws, bolts, nuts and more in our catalogues',
    noResults: language === 'es' ? 'No se encontraron resultados' : 'No results found',
    tryDifferent: language === 'es'
      ? 'Intenta con otros términos de búsqueda'
      : 'Try different search terms',
    resultsCount: language === 'es' ? 'resultados' : 'results',
    filteredCount: language === 'es' ? 'mostrando' : 'showing',
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const resultsToShow = filteredResults.map(toProductInfo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-inox-teal rounded-lg flex items-center justify-center transform rotate-45">
                <div className="w-4 h-4 bg-white rounded-full transform -rotate-45"></div>
              </div>
              <span className="font-display font-bold text-xl text-slate-900">INOXBOLT</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <SearchHero
        query={query}
        onSearch={handleSearch}
        isSearching={isSearching}
        hasResults={searchResults.length > 0}
      />

      {/* Main Content */}
      {hasSearched && (
        <main className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {searchResults.length > 0 && (
              <aside className="lg:w-64 shrink-0">
                <SearchFilters
                  filters={filters}
                  availableFilters={availableFilters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                  resultCount={filteredResults.length}
                  totalCount={searchResults.length}
                />
              </aside>
            )}

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              {searchResults.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-slate-600">
                    {hasActiveFilters ? (
                      <>
                        {t.filteredCount} <strong>{filteredResults.length}</strong> {language === 'es' ? 'de' : 'of'} {searchResults.length} {t.resultsCount}
                      </>
                    ) : (
                      <>
                        <strong>{searchResults.length}</strong> {t.resultsCount}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <SearchResultsGrid
                results={resultsToShow}
                isLoading={isSearching}
                error={searchError}
                onInquire={handleInquire}
                query={query}
              />

              {/* No Results State */}
              {!isSearching && hasSearched && searchResults.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t.noResults}</h3>
                  <p className="text-slate-500">{t.tryDifferent}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
}

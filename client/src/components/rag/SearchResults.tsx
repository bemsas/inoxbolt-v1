import React from 'react';
import { FileText, MessageCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SearchResult } from '@/contexts/RAGContext';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  onAskAI: () => void;
  onClose: () => void;
}

export function SearchResults({ results, isSearching, error, onAskAI, onClose }: SearchResultsProps) {
  const { language } = useLanguage();

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
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        {results.map((result) => (
          <div
            key={result.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            onClick={onClose}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-inox-teal/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-inox-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {result.document.supplier && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {result.document.supplier}
                  </span>
                )}
                {result.pageNumber && (
                  <span className="text-xs text-slate-400">
                    {language === 'es' ? 'Pág.' : 'Page'} {result.pageNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 line-clamp-2">{result.snippet}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs font-semibold text-inox-teal">{result.score}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ask AI footer */}
      <div className="border-t border-slate-100 p-3 bg-slate-50">
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
  );
}

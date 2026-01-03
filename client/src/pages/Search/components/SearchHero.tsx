import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface SearchHeroProps {
  query: string;
  onSearch: (query: string) => void;
  isSearching: boolean;
  hasResults: boolean;
}

// Common fastener search terms for suggestions
const SUGGESTIONS = {
  en: [
    'DIN 933 hex bolt',
    'M8 stainless steel',
    'ISO 4017',
    'A2-70 screws',
    'M10x30 bolt',
    'hex socket cap screw',
    'DIN 912',
    'lock nut',
    'flat washer',
    'self-tapping screw',
  ],
  es: [
    'DIN 933 tornillo hexagonal',
    'M8 acero inoxidable',
    'ISO 4017',
    'tornillos A2-70',
    'perno M10x30',
    'tornillo allen',
    'DIN 912',
    'tuerca autoblocante',
    'arandela plana',
    'tornillo autorroscante',
  ],
};

const RECENT_SEARCHES_KEY = 'inoxbolt_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchHero({ query, onSearch, isSearching, hasResults }: SearchHeroProps) {
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        onSearch(inputValue);
        saveRecentSearch(inputValue);
      } else if (inputValue.trim().length === 0) {
        onSearch('');
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, onSearch, saveRecentSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    saveRecentSearch(suggestion);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length >= 2) {
      onSearch(inputValue);
      saveRecentSearch(inputValue);
      setIsFocused(false);
    }
  };

  const suggestions = SUGGESTIONS[language] || SUGGESTIONS.en;
  const showDropdown = isFocused && !hasResults && inputValue.length < 2;

  const t = {
    title: language === 'es' ? 'Buscar Productos' : 'Search Products',
    subtitle: language === 'es'
      ? 'Encuentra tornillos, pernos, tuercas y más en nuestros catálogos'
      : 'Find screws, bolts, nuts and more in our catalogues',
    placeholder: language === 'es'
      ? 'Buscar por nombre, código DIN/ISO, tamaño...'
      : 'Search by name, DIN/ISO code, size...',
    recentSearches: language === 'es' ? 'Búsquedas recientes' : 'Recent searches',
    popularSearches: language === 'es' ? 'Búsquedas populares' : 'Popular searches',
    clear: language === 'es' ? 'Limpiar' : 'Clear',
  };

  return (
    <section className={`relative transition-all duration-500 ${hasResults ? 'py-8' : 'py-16 md:py-24'}`}>
      {/* Background Pattern */}
      {!hasResults && (
        <div className="absolute inset-0 bg-gradient-to-br from-inox-teal/5 via-transparent to-inox-blue/5" />
      )}

      <div className="container relative">
        {/* Title - hide when results are shown */}
        {!hasResults && (
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        )}

        {/* Search Input */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div
              className={`relative flex items-center bg-white rounded-2xl border-2 transition-all duration-200 ${
                isFocused
                  ? 'border-inox-teal shadow-lg shadow-inox-teal/10'
                  : 'border-slate-200 shadow-md hover:border-slate-300'
              }`}
            >
              {/* Search Icon */}
              <div className="pl-5 pr-2">
                {isSearching ? (
                  <Loader2 className="w-6 h-6 text-inox-teal animate-spin" />
                ) : (
                  <Search className="w-6 h-6 text-slate-400" />
                )}
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="flex-1 py-4 md:py-5 text-lg bg-transparent outline-none placeholder-slate-400 text-slate-900"
                placeholder={t.placeholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              {/* Clear Button */}
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 mr-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}

              {/* Search Button */}
              <Button
                type="submit"
                size="lg"
                className="mr-2 px-6 bg-inox-teal hover:bg-inox-teal/90 text-white rounded-xl"
                disabled={inputValue.trim().length < 2}
              >
                <Search className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">
                  {language === 'es' ? 'Buscar' : 'Search'}
                </span>
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock className="w-4 h-4" />
                        {t.recentSearches}
                      </div>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        {t.clear}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(search)}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    {t.popularSearches}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 text-sm bg-inox-teal/10 hover:bg-inox-teal/20 text-inox-teal rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Quick Filter Tags */}
          {!hasResults && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-sm text-slate-500">
                {language === 'es' ? 'Búsquedas rápidas:' : 'Quick searches:'}
              </span>
              {['DIN 933', 'M8', 'A2-70', 'ISO 4017', 'DIN 912'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className="px-3 py-1 text-sm bg-white border border-slate-200 hover:border-inox-teal hover:text-inox-teal rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

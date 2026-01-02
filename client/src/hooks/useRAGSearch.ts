import { useState, useEffect, useCallback, useRef } from 'react';
import { useRAG } from '@/contexts/RAGContext';

interface UseRAGSearchOptions {
  debounceMs?: number;
  minChars?: number;
}

export function useRAGSearch(options: UseRAGSearchOptions = {}) {
  const { debounceMs = 300, minChars = 2 } = options;
  const { searchQuery, setSearchQuery, searchResults, isSearching, searchError, performSearch, clearSearch } = useRAG();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (localQuery.trim().length >= minChars) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(localQuery);
        performSearch(localQuery);
        setIsOpen(true);
      }, debounceMs);
    } else {
      setIsOpen(false);
      clearSearch();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuery, debounceMs, minChars, setSearchQuery, performSearch, clearSearch]);

  const handleQueryChange = useCallback((query: string) => {
    setLocalQuery(query);
  }, []);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearSearch();
    setIsOpen(false);
  }, [clearSearch]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    if (searchResults.length > 0 || localQuery.trim().length >= minChars) {
      setIsOpen(true);
    }
  }, [searchResults.length, localQuery, minChars]);

  return {
    query: localQuery,
    results: searchResults,
    isSearching,
    error: searchError,
    isOpen,
    setQuery: handleQueryChange,
    clear: handleClear,
    close: handleClose,
    open: handleOpen,
  };
}

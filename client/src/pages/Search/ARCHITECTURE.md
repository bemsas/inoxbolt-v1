# Search Page Architecture

## Overview

This document defines the technical architecture for the InoxBolt comprehensive search page. The search page enables users to find fastener products using semantic search powered by the existing RAG system, with advanced filtering capabilities.

---

## 1. File Structure

```
client/src/pages/Search/
├── ARCHITECTURE.md              # This document
├── index.tsx                    # Main SearchPage container (route entry)
├── SearchPage.tsx               # Page layout and state orchestration
├── components/
│   ├── SearchHero.tsx           # Large search input with prominent CTA
│   ├── SearchBar.tsx            # Reusable search input component
│   ├── SearchSuggestions.tsx    # Autocomplete dropdown with suggestions
│   ├── SearchFilters.tsx        # Filter sidebar/horizontal filters
│   ├── FilterChips.tsx          # Active filter display with remove
│   ├── SearchResults.tsx        # Results grid container
│   ├── SearchResultCard.tsx     # Individual result card (wraps ProductCard)
│   ├── RecentSearches.tsx       # Local storage based recent searches
│   ├── SearchEmpty.tsx          # Empty state component
│   ├── SearchLoading.tsx        # Loading skeleton state
│   └── SearchPagination.tsx     # Pagination controls
├── hooks/
│   ├── useSearch.ts             # Search state management hook
│   ├── useFilters.ts            # Filter state management hook
│   ├── useRecentSearches.ts     # Local storage recent searches hook
│   └── useDebounce.ts           # Debounce utility hook
├── types/
│   └── search.ts                # Search-specific TypeScript interfaces
└── utils/
    ├── filterUtils.ts           # Filter application logic
    └── searchUtils.ts           # Search helper functions
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
SearchPage (container)
├── Navbar (existing)
├── SearchHero
│   ├── SearchBar
│   │   └── SearchSuggestions (dropdown)
│   └── RecentSearches (collapsible)
├── main content area
│   ├── FilterChips (horizontal, above results)
│   ├── sidebar (desktop) / drawer (mobile)
│   │   └── SearchFilters
│   └── SearchResults
│       ├── SearchLoading (conditional)
│       ├── SearchEmpty (conditional)
│       ├── SearchResultCard[] (grid)
│       │   └── ProductCard (existing)
│       └── SearchPagination
└── Footer (existing)
```

### 2.2 Component Interfaces

```typescript
// ============================================================================
// SearchPage (Main Container)
// ============================================================================

interface SearchPageProps {
  /** Initial query from URL params */
  initialQuery?: string;
  /** Initial filters from URL params */
  initialFilters?: SearchFilters;
}

// ============================================================================
// SearchHero
// ============================================================================

interface SearchHeroProps {
  /** Current search query */
  query: string;
  /** Handler for query changes */
  onQueryChange: (query: string) => void;
  /** Handler for search submission */
  onSearch: (query: string) => void;
  /** Whether search is in progress */
  isSearching: boolean;
  /** Recent searches list */
  recentSearches: string[];
  /** Handler to clear recent searches */
  onClearRecentSearches: () => void;
  /** Handler when recent search is clicked */
  onRecentSearchClick: (query: string) => void;
}

// ============================================================================
// SearchBar
// ============================================================================

interface SearchBarProps {
  /** Current search query */
  value: string;
  /** Handler for input changes */
  onChange: (value: string) => void;
  /** Handler for search submission (Enter key or button) */
  onSubmit: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'default' | 'large';
  /** Whether to show search button */
  showButton?: boolean;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Children slot for suggestions dropdown */
  children?: React.ReactNode;
}

// ============================================================================
// SearchSuggestions
// ============================================================================

interface SearchSuggestion {
  /** Suggestion text */
  text: string;
  /** Type of suggestion */
  type: 'recent' | 'popular' | 'autocomplete';
  /** Category hint if applicable */
  category?: FastenerCategory;
  /** Match count hint */
  resultCount?: number;
}

interface SearchSuggestionsProps {
  /** List of suggestions */
  suggestions: SearchSuggestion[];
  /** Whether dropdown is visible */
  isOpen: boolean;
  /** Handler when suggestion is selected */
  onSelect: (suggestion: SearchSuggestion) => void;
  /** Handler to close dropdown */
  onClose: () => void;
  /** Currently highlighted index (keyboard nav) */
  highlightedIndex: number;
  /** Loading state for suggestions */
  isLoading?: boolean;
}

// ============================================================================
// SearchFilters
// ============================================================================

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface FilterGroup {
  id: string;
  label: string;
  labelEs: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options: FilterOption[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface SearchFiltersProps {
  /** Current filter state */
  filters: SearchFilters;
  /** Handler for filter changes */
  onFilterChange: (filters: SearchFilters) => void;
  /** Available filter options (dynamically populated) */
  filterGroups: FilterGroup[];
  /** Handler to clear all filters */
  onClearAll: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Layout mode */
  layout?: 'sidebar' | 'horizontal' | 'drawer';
}

// ============================================================================
// FilterChips
// ============================================================================

interface FilterChip {
  id: string;
  groupId: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  /** Active filter chips */
  chips: FilterChip[];
  /** Handler to remove a chip */
  onRemove: (chip: FilterChip) => void;
  /** Handler to clear all chips */
  onClearAll: () => void;
  /** Maximum chips to show before "+N more" */
  maxVisible?: number;
}

// ============================================================================
// SearchResults
// ============================================================================

interface SearchResultsProps {
  /** Search results */
  results: ProductInfo[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Total count (for pagination) */
  totalCount: number;
  /** Current page */
  currentPage: number;
  /** Results per page */
  pageSize: number;
  /** Handler for page change */
  onPageChange: (page: number) => void;
  /** Handler when product card is clicked */
  onProductClick: (product: ProductInfo) => void;
  /** Handler for product inquiry */
  onInquire: (product: ProductInfo) => void;
  /** Grid layout mode */
  gridMode?: 'compact' | 'default' | 'list';
}

// ============================================================================
// SearchResultCard
// ============================================================================

interface SearchResultCardProps {
  /** Product data */
  product: ProductInfo;
  /** Handler for card click */
  onClick: () => void;
  /** Handler for inquiry button */
  onInquire: () => void;
  /** Display variant */
  variant?: 'default' | 'compact' | 'list';
  /** Search highlight terms */
  highlightTerms?: string[];
}

// ============================================================================
// RecentSearches
// ============================================================================

interface RecentSearchesProps {
  /** List of recent searches */
  searches: string[];
  /** Handler when search is clicked */
  onSelect: (query: string) => void;
  /** Handler to clear all */
  onClearAll: () => void;
  /** Handler to remove single item */
  onRemove: (query: string) => void;
  /** Maximum items to display */
  maxItems?: number;
  /** Layout variant */
  variant?: 'list' | 'chips' | 'inline';
}

// ============================================================================
// SearchPagination
// ============================================================================

interface SearchPaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total results count */
  totalResults: number;
  /** Results per page */
  pageSize: number;
  /** Handler for page change */
  onPageChange: (page: number) => void;
  /** Handler for page size change */
  onPageSizeChange?: (size: number) => void;
  /** Show results count text */
  showResultsCount?: boolean;
}
```

---

## 3. State Management

### 3.1 Search State (useSearch hook)

```typescript
interface SearchState {
  /** Current search query */
  query: string;
  /** Debounced query for API calls */
  debouncedQuery: string;
  /** Search results */
  results: ProductInfo[];
  /** Loading state */
  isSearching: boolean;
  /** Error message */
  error: string | null;
  /** Total results count (for pagination) */
  totalCount: number;
  /** Current page */
  currentPage: number;
  /** Results per page */
  pageSize: number;
  /** Whether initial search has been performed */
  hasSearched: boolean;
}

interface SearchActions {
  /** Set search query */
  setQuery: (query: string) => void;
  /** Execute search */
  search: (query: string, filters?: SearchFilters, page?: number) => Promise<void>;
  /** Clear search state */
  clearSearch: () => void;
  /** Set current page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
}

// Hook signature
function useSearch(initialQuery?: string): SearchState & SearchActions;
```

### 3.2 Filter State (useFilters hook)

```typescript
interface SearchFilters {
  /** Material codes (A2, A4, 8.8, etc.) */
  materials: string[];
  /** Product categories */
  categories: FastenerCategory[];
  /** Standards (DIN, ISO) */
  standards: string[];
  /** Suppliers */
  suppliers: string[];
  /** Thread types (coarse, fine) */
  threadTypes: string[];
  /** Diameter range */
  diameterRange?: { min: number; max: number };
  /** Sort option */
  sortBy: 'relevance' | 'name' | 'standard' | 'supplier';
  /** Sort direction */
  sortOrder: 'asc' | 'desc';
}

interface FilterActions {
  /** Set a single filter group */
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  /** Toggle a value in a multi-select filter */
  toggleFilterValue: (key: keyof SearchFilters, value: string) => void;
  /** Clear a single filter group */
  clearFilter: (key: keyof SearchFilters) => void;
  /** Clear all filters */
  clearAllFilters: () => void;
  /** Check if any filters are active */
  hasActiveFilters: boolean;
  /** Get active filter count */
  activeFilterCount: number;
  /** Get filter chips for display */
  getFilterChips: () => FilterChip[];
}

// Hook signature
function useFilters(initialFilters?: Partial<SearchFilters>): SearchFilters & FilterActions;
```

### 3.3 Recent Searches (useRecentSearches hook)

```typescript
interface RecentSearchesState {
  /** List of recent searches (most recent first) */
  searches: string[];
}

interface RecentSearchesActions {
  /** Add a search to history */
  addSearch: (query: string) => void;
  /** Remove a single search */
  removeSearch: (query: string) => void;
  /** Clear all history */
  clearAll: () => void;
}

// Hook signature
function useRecentSearches(maxItems?: number): RecentSearchesState & RecentSearchesActions;
```

### 3.4 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SearchPage                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        State Orchestration                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │    │
│  │  │  useSearch   │  │  useFilters  │  │  useRecentSearches      │   │    │
│  │  │              │  │              │  │                         │   │    │
│  │  │ query        │  │ materials[]  │  │ searches[]              │   │    │
│  │  │ results[]    │  │ categories[] │  │ addSearch()             │   │    │
│  │  │ isSearching  │  │ standards[]  │  │ removeSearch()          │   │    │
│  │  │ error        │  │ suppliers[]  │  │ clearAll()              │   │    │
│  │  │ totalCount   │  │ sortBy       │  │                         │   │    │
│  │  │ currentPage  │  │              │  │                         │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        RAGContext Integration                        │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  useRAG()                                                     │   │    │
│  │  │  - performSearch(query) → SearchResult[]                      │   │    │
│  │  │  - searchResults                                              │   │    │
│  │  │  - isSearching                                                │   │    │
│  │  │  - searchError                                                │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

Data Flow:

1. User Input → SearchBar.onChange()
   ↓
2. useSearch.setQuery(value) → debounce (300ms)
   ↓
3. debouncedQuery changes → trigger search
   ↓
4. useSearch.search(query, filters)
   ├─→ RAGContext.performSearch(query)
   └─→ Apply client-side filters (filterUtils.applyFilters)
   ↓
5. Results update → SearchResults re-render
   ↓
6. User clicks result → ProductDetailModal opens
   ↓
7. Successful search → useRecentSearches.addSearch(query)
```

---

## 4. API Integration

### 4.1 RAGContext Integration Strategy

The search page will integrate with the existing `RAGContext` which provides:

```typescript
// From RAGContext.tsx
interface RAGContextType {
  performSearch: (query: string) => Promise<void>;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
}
```

**Integration approach:**

1. **Direct RAG Search**: Use `performSearch()` for initial semantic search
2. **Client-side Filtering**: Apply filters post-search on the result set
3. **Extended Search Hook**: Wrap RAGContext with additional pagination and filter logic

```typescript
// useSearch.ts implementation strategy
export function useSearch(initialQuery?: string) {
  const rag = useRAG();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12 });

  // Debounce query
  const debouncedQuery = useDebounce(query, 300);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      rag.performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Filter and paginate results
  const filteredResults = useMemo(() => {
    let results = convertToProductInfo(rag.searchResults);
    results = applyFilters(results, filters);
    return results;
  }, [rag.searchResults, filters]);

  const paginatedResults = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredResults.slice(start, start + pagination.pageSize);
  }, [filteredResults, pagination]);

  return {
    results: paginatedResults,
    totalCount: filteredResults.length,
    isSearching: rag.isSearching,
    error: rag.searchError,
    // ... other state
  };
}
```

### 4.2 Filter Application Strategy

Filters are applied client-side after RAG search returns results:

```typescript
// filterUtils.ts
export function applyFilters(
  results: ProductInfo[],
  filters: SearchFilters
): ProductInfo[] {
  return results.filter(product => {
    // Material filter
    if (filters.materials.length > 0) {
      if (!product.material) return false;
      const normalizedMaterial = product.material.toUpperCase();
      if (!filters.materials.some(m => normalizedMaterial.includes(m.toUpperCase()))) {
        return false;
      }
    }

    // Category filter (inferred from content)
    if (filters.categories.length > 0) {
      const category = inferCategory(product.name, product.content);
      if (!filters.categories.includes(category)) {
        return false;
      }
    }

    // Standard filter
    if (filters.standards.length > 0) {
      if (!product.standard) return false;
      if (!filters.standards.some(s => product.standard?.includes(s))) {
        return false;
      }
    }

    // Supplier filter
    if (filters.suppliers.length > 0) {
      if (!product.supplier) return false;
      if (!filters.suppliers.includes(product.supplier.toUpperCase())) {
        return false;
      }
    }

    // Thread type filter
    if (filters.threadTypes.length > 0) {
      if (!product.threadType) return false;
      if (!filters.threadTypes.includes(product.threadType.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export function sortResults(
  results: ProductInfo[],
  sortBy: SearchFilters['sortBy'],
  sortOrder: SearchFilters['sortOrder']
): ProductInfo[] {
  return [...results].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'relevance':
        comparison = (b.score || 0) - (a.score || 0);
        break;
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'standard':
        comparison = (a.standard || '').localeCompare(b.standard || '');
        break;
      case 'supplier':
        comparison = (a.supplier || '').localeCompare(b.supplier || '');
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}
```

### 4.3 Debounced Search

```typescript
// useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 5. Integration Points with Existing Code

### 5.1 Existing Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| `ProductCard` | `components/product/ProductCard.tsx` | Display search results |
| `ProductDetailModal` | `components/product/ProductDetailModal.tsx` | Product details view |
| `InquiryModal` | `components/product/InquiryModal.tsx` | Quote request |
| `Navbar` | `components/Navbar.tsx` | Page header |
| `Footer` | `components/Footer.tsx` | Page footer |
| All UI primitives | `components/ui/*` | Buttons, inputs, selects, etc. |

### 5.2 Contexts to Use

| Context | Purpose |
|---------|---------|
| `RAGContext` | Search API, results management |
| `LanguageContext` | EN/ES translations |
| `ThemeContext` | Light/dark mode (optional) |

### 5.3 Types to Import

```typescript
// From existing type files
import type { ProductInfo } from '@/types/product';
import type {
  ExtendedProductInfo,
  FastenerCategory,
  MaterialSpecification
} from '@/types/product-extended';
import type { SearchResult } from '@/contexts/RAGContext';
```

### 5.4 Routing Integration

Add to `client/src/App.tsx`:

```typescript
import SearchPage from './pages/Search';

// In Router component
<Route path="/search" component={SearchPage} />
```

---

## 6. URL State Synchronization

Search state should be reflected in URL for shareability:

```typescript
// URL structure
/search?q=M10+hex+bolt&materials=A2,A4&categories=bolt&page=2&sort=relevance

// URL state sync hook
function useSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback((updates: Partial<SearchState>) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.query !== undefined) {
      updates.query ? newParams.set('q', updates.query) : newParams.delete('q');
    }
    if (updates.filters?.materials) {
      updates.filters.materials.length > 0
        ? newParams.set('materials', updates.filters.materials.join(','))
        : newParams.delete('materials');
    }
    // ... other params

    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return { searchParams, updateParams };
}
```

---

## 7. Responsive Design Strategy

### 7.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, drawer filters, compact cards |
| Tablet | 640px - 1024px | 2-column grid, collapsible sidebar |
| Desktop | > 1024px | 3-4 column grid, persistent sidebar |

### 7.2 Layout Adaptations

```typescript
// Mobile (< 640px)
- SearchHero: Full width, large input
- Filters: Bottom sheet/drawer trigger button
- Results: Single column, compact variant
- Pagination: Simplified (prev/next only)

// Tablet (640px - 1024px)
- SearchHero: Full width, medium input
- Filters: Collapsible sidebar or horizontal chips
- Results: 2-column grid
- Pagination: Full controls

// Desktop (> 1024px)
- SearchHero: Contained width, large input
- Filters: Persistent sidebar (240px)
- Results: 3-4 column grid
- Pagination: Full controls with page size selector
```

---

## 8. Translations

Add to `LanguageContext.tsx`:

```typescript
const searchTranslations = {
  // Search
  'search.title': { en: 'Search Products', es: 'Buscar Productos' },
  'search.placeholder': { en: 'Search fasteners, bolts, nuts...', es: 'Buscar fijaciones, tornillos, tuercas...' },
  'search.button': { en: 'Search', es: 'Buscar' },
  'search.results': { en: 'results', es: 'resultados' },
  'search.results_for': { en: 'Results for', es: 'Resultados para' },
  'search.no_results': { en: 'No results found', es: 'No se encontraron resultados' },
  'search.try_different': { en: 'Try different keywords or remove filters', es: 'Prueba palabras diferentes o elimina filtros' },

  // Filters
  'filter.title': { en: 'Filters', es: 'Filtros' },
  'filter.clear_all': { en: 'Clear all', es: 'Limpiar todo' },
  'filter.material': { en: 'Material', es: 'Material' },
  'filter.category': { en: 'Category', es: 'Categoria' },
  'filter.standard': { en: 'Standard', es: 'Norma' },
  'filter.supplier': { en: 'Supplier', es: 'Proveedor' },
  'filter.thread_type': { en: 'Thread Type', es: 'Tipo de Rosca' },
  'filter.sort_by': { en: 'Sort by', es: 'Ordenar por' },

  // Sort options
  'sort.relevance': { en: 'Relevance', es: 'Relevancia' },
  'sort.name': { en: 'Name', es: 'Nombre' },
  'sort.standard': { en: 'Standard', es: 'Norma' },
  'sort.supplier': { en: 'Supplier', es: 'Proveedor' },

  // Recent searches
  'recent.title': { en: 'Recent Searches', es: 'Busquedas Recientes' },
  'recent.clear': { en: 'Clear history', es: 'Limpiar historial' },

  // Pagination
  'pagination.page': { en: 'Page', es: 'Pagina' },
  'pagination.of': { en: 'of', es: 'de' },
  'pagination.showing': { en: 'Showing', es: 'Mostrando' },
  'pagination.per_page': { en: 'per page', es: 'por pagina' },
};
```

---

## 9. Performance Considerations

### 9.1 Optimizations

1. **Debounced Search**: 300ms debounce on search input
2. **Memoized Filtering**: `useMemo` for filter/sort operations
3. **Virtualized Lists**: Consider for large result sets (>100 items)
4. **Lazy Loading**: Load filters dynamically based on results
5. **Image Optimization**: Lazy load product images

### 9.2 Code Splitting

```typescript
// Lazy load search page
const SearchPage = lazy(() => import('./pages/Search'));

// In router
<Route path="/search">
  <Suspense fallback={<SearchLoading />}>
    <SearchPage />
  </Suspense>
</Route>
```

---

## 10. Implementation Phases

### Phase 1: Core Search (MVP)
- SearchPage container
- SearchBar with debounce
- SearchResults grid
- RAGContext integration
- Basic ProductCard display

### Phase 2: Filters
- SearchFilters component
- useFilters hook
- FilterChips display
- Client-side filtering

### Phase 3: UX Enhancements
- SearchSuggestions autocomplete
- RecentSearches with localStorage
- SearchEmpty/SearchLoading states
- URL state synchronization

### Phase 4: Polish
- Responsive design refinements
- Animations/transitions
- Keyboard navigation
- Accessibility audit

---

## 11. Testing Strategy

### Unit Tests
- `useSearch` hook state management
- `useFilters` hook operations
- `filterUtils` functions
- `searchUtils` helpers

### Integration Tests
- Search flow with RAGContext mock
- Filter application and results
- URL synchronization

### E2E Tests
- Full search workflow
- Filter interactions
- Mobile responsiveness

---

## 12. Accessibility Requirements

- Keyboard navigation for search suggestions
- ARIA labels for filter controls
- Focus management for modals/drawers
- Screen reader announcements for results count
- High contrast mode support

---

## Appendix A: Filter Configuration

```typescript
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'material',
    label: 'Material',
    labelEs: 'Material',
    type: 'checkbox',
    collapsible: true,
    defaultExpanded: true,
    options: [
      { value: 'A2', label: 'A2 (304 SS)' },
      { value: 'A4', label: 'A4 (316 SS)' },
      { value: '8.8', label: 'Grade 8.8' },
      { value: '10.9', label: 'Grade 10.9' },
      { value: '12.9', label: 'Grade 12.9' },
      { value: 'zinc', label: 'Zinc Plated' },
      { value: 'brass', label: 'Brass' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    labelEs: 'Categoria',
    type: 'checkbox',
    collapsible: true,
    defaultExpanded: true,
    options: [
      { value: 'bolt', label: 'Bolts' },
      { value: 'screw', label: 'Screws' },
      { value: 'nut', label: 'Nuts' },
      { value: 'washer', label: 'Washers' },
      { value: 'anchor', label: 'Anchors' },
      { value: 'threaded_rod', label: 'Threaded Rods' },
    ],
  },
  {
    id: 'standard',
    label: 'Standard',
    labelEs: 'Norma',
    type: 'checkbox',
    collapsible: true,
    defaultExpanded: false,
    options: [
      { value: 'DIN', label: 'DIN' },
      { value: 'ISO', label: 'ISO' },
      { value: 'ASTM', label: 'ASTM' },
    ],
  },
  {
    id: 'threadType',
    label: 'Thread Type',
    labelEs: 'Tipo de Rosca',
    type: 'checkbox',
    collapsible: true,
    defaultExpanded: false,
    options: [
      { value: 'coarse', label: 'Coarse Thread' },
      { value: 'fine', label: 'Fine Thread' },
      { value: 'unc', label: 'UNC' },
      { value: 'unf', label: 'UNF' },
    ],
  },
  {
    id: 'sortBy',
    label: 'Sort By',
    labelEs: 'Ordenar Por',
    type: 'select',
    collapsible: false,
    options: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'name', label: 'Name A-Z' },
      { value: 'standard', label: 'Standard' },
      { value: 'supplier', label: 'Supplier' },
    ],
  },
];
```

---

## Appendix B: Type Conversion Utilities

```typescript
// Convert RAG SearchResult to ProductInfo
export function searchResultToProductInfo(result: SearchResult): ProductInfo {
  return {
    id: result.id,
    name: extractProductNameFromContent(result.content),
    content: result.content,
    standard: extractStandard(result.content),
    material: extractMaterial(result.content),
    threadType: extractThreadType(result.content),
    supplier: result.document.supplier || undefined,
    pageNumber: result.pageNumber || undefined,
    documentName: result.document.filename,
    score: Math.round(result.score * 100),
  };
}

// Batch convert
export function convertSearchResults(results: SearchResult[]): ProductInfo[] {
  return results.map(searchResultToProductInfo);
}
```

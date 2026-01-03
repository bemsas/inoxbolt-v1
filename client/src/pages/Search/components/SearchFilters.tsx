import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterState {
  materials: string[];
  standards: string[];
  categories: string[];
  suppliers: string[];
  threadSizes: string[];
}

interface AvailableFilters {
  materials: string[];
  standards: string[];
  suppliers: string[];
  threadSizes: string[];
}

interface SearchFiltersProps {
  filters: FilterState;
  availableFilters: AvailableFilters;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
}

// Material display names
const MATERIAL_NAMES: Record<string, { en: string; es: string }> = {
  A2: { en: 'A2 (304 Stainless)', es: 'A2 (Inox 304)' },
  A4: { en: 'A4 (316 Stainless)', es: 'A4 (Inox 316)' },
  '304': { en: '304 Stainless', es: 'Inox 304' },
  '316': { en: '316 Stainless', es: 'Inox 316' },
  '8.8': { en: '8.8 Carbon Steel', es: '8.8 Acero al Carbono' },
  '10.9': { en: '10.9 Alloy Steel', es: '10.9 Acero Aleado' },
  '12.9': { en: '12.9 Alloy Steel', es: '12.9 Acero Aleado' },
};

// Standard display names
const STANDARD_NAMES: Record<string, { en: string; es: string }> = {
  DIN: { en: 'DIN Standards', es: 'Normas DIN' },
  ISO: { en: 'ISO Standards', es: 'Normas ISO' },
  ASTM: { en: 'ASTM Standards', es: 'Normas ASTM' },
};

interface FilterGroupProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  getDisplayName?: (value: string) => string;
  defaultOpen?: boolean;
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  getDisplayName,
  defaultOpen = true,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (options.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-left">
        <span className="font-medium text-slate-900">{title}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selected.length}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4 space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={() => onChange(option)}
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">
              {getDisplayName ? getDisplayName(option) : option}
            </span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SearchFilters({
  filters,
  availableFilters,
  onChange,
  onClear,
  resultCount,
  totalCount,
}: SearchFiltersProps) {
  const { language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = {
    filters: language === 'es' ? 'Filtros' : 'Filters',
    clearAll: language === 'es' ? 'Limpiar todo' : 'Clear all',
    material: language === 'es' ? 'Material' : 'Material',
    standard: language === 'es' ? 'Norma' : 'Standard',
    supplier: language === 'es' ? 'Proveedor' : 'Supplier',
    threadSize: language === 'es' ? 'Tamaño de rosca' : 'Thread Size',
    showFilters: language === 'es' ? 'Mostrar filtros' : 'Show filters',
    hideFilters: language === 'es' ? 'Ocultar filtros' : 'Hide filters',
    results: language === 'es' ? 'resultados' : 'results',
  };

  const handleFilterChange = (
    filterKey: keyof FilterState,
    value: string
  ) => {
    const currentValues = filters[filterKey];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({
      ...filters,
      [filterKey]: newValues,
    });
  };

  const getMaterialDisplayName = (material: string) => {
    return MATERIAL_NAMES[material]?.[language] || material;
  };

  const getStandardDisplayName = (standard: string) => {
    return STANDARD_NAMES[standard]?.[language] || standard;
  };

  const activeFilterCount = Object.values(filters).reduce(
    (count, arr) => count + arr.length,
    0
  );

  const filterContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-700" />
          <span className="font-semibold text-slate-900">{t.filters}</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-inox-teal">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            {t.clearAll}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="py-3 border-b border-slate-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, values]) =>
              (values as string[]).map((value: string) => (
                <Badge
                  key={`${key}-${value}`}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-slate-200"
                  onClick={() =>
                    handleFilterChange(key as keyof FilterState, value)
                  }
                >
                  {value}
                  <X className="w-3 h-3" />
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className="divide-y divide-slate-100">
        <FilterGroup
          title={t.material}
          options={availableFilters.materials}
          selected={filters.materials}
          onChange={(value) => handleFilterChange('materials', value)}
          getDisplayName={getMaterialDisplayName}
        />

        <FilterGroup
          title={t.standard}
          options={availableFilters.standards}
          selected={filters.standards}
          onChange={(value) => handleFilterChange('standards', value)}
          getDisplayName={getStandardDisplayName}
        />

        <FilterGroup
          title={t.threadSize}
          options={availableFilters.threadSizes}
          selected={filters.threadSizes}
          onChange={(value) => handleFilterChange('threadSizes', value)}
        />

        <FilterGroup
          title={t.supplier}
          options={availableFilters.suppliers}
          selected={filters.suppliers}
          onChange={(value) => handleFilterChange('suppliers', value)}
          defaultOpen={false}
        />
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-slate-200 mt-4">
        <p className="text-sm text-slate-600">
          <strong>{resultCount}</strong> {language === 'es' ? 'de' : 'of'}{' '}
          <strong>{totalCount}</strong> {t.results}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {mobileOpen ? t.hideFilters : t.showFilters}
          </span>
          {activeFilterCount > 0 && (
            <Badge className="bg-inox-teal">{activeFilterCount}</Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filter Panel */}
      {mobileOpen && (
        <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4 mb-4">
          {filterContent}
        </div>
      )}

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
        {filterContent}
      </div>
    </>
  );
}

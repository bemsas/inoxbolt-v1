import React from 'react';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductHeaderProps, FastenerCategory } from '@/types/product-extended';
import { getPlaceholderImage } from '@/types/product-extended';
import { BrandBadge } from '../atoms/BrandBadge';
import { AvailabilityBadge } from '../atoms/AvailabilityBadge';

const CATEGORY_LABELS: Record<FastenerCategory, { en: string; es: string }> = {
  bolt: { en: 'Bolt', es: 'Perno' },
  screw: { en: 'Screw', es: 'Tornillo' },
  nut: { en: 'Nut', es: 'Tuerca' },
  washer: { en: 'Washer', es: 'Arandela' },
  anchor: { en: 'Anchor', es: 'Anclaje' },
  rivet: { en: 'Rivet', es: 'Remache' },
  pin: { en: 'Pin', es: 'Pasador' },
  threaded_rod: { en: 'Threaded Rod', es: 'Varilla Roscada' },
  insert: { en: 'Insert', es: 'Inserto' },
  other: { en: 'Fastener', es: 'Fijación' },
};

export function ProductHeader({
  brand,
  name,
  shortDescription,
  primaryImage,
  category = 'other',
  sku,
  availability,
  actions,
  className = '',
  isLoading,
  compact,
}: ProductHeaderProps) {
  const { language } = useLanguage();
  const imageUrl = primaryImage?.url || getPlaceholderImage(category);
  const categoryLabel = CATEGORY_LABELS[category]?.[language] || CATEGORY_LABELS[category]?.en;

  if (isLoading) {
    return (
      <header className={`flex gap-4 ${compact ? 'flex-row' : 'flex-col md:flex-row'} ${className}`}>
        <Skeleton className={compact ? 'w-20 h-20' : 'w-32 h-32 md:w-48 md:h-48'} />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`flex gap-4 ${compact ? 'flex-row' : 'flex-col md:flex-row'} ${className}`}>
      {/* Image */}
      <div className="shrink-0">
        <div
          className={`relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 ${
            compact ? 'w-20 h-20' : 'w-32 h-32 md:w-48 md:h-48'
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={primaryImage?.alt || name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Brand & Category */}
        <div className="flex flex-wrap items-center gap-2">
          {brand && <BrandBadge brand={brand} size="sm" />}
          {categoryLabel && (
            <Badge variant="outline" className="text-xs">
              {categoryLabel}
            </Badge>
          )}
        </div>

        {/* Name */}
        <h1
          className={`font-bold text-slate-900 leading-tight ${
            compact ? 'text-lg' : 'text-xl md:text-2xl'
          }`}
        >
          {name}
        </h1>

        {/* Description */}
        {shortDescription && !compact && (
          <p className="text-slate-600 text-sm md:text-base line-clamp-2">{shortDescription}</p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {sku && (
            <Badge variant="secondary" className="font-mono text-xs">
              SKU: {sku}
            </Badge>
          )}
          {availability && <AvailabilityBadge status={availability} />}
        </div>

        {/* Actions Slot */}
        {actions && <div className="pt-2">{actions}</div>}
      </div>
    </header>
  );
}

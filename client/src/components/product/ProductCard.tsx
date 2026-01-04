import React, { useState, useCallback, useRef } from 'react';
import { MessageSquare, FileText, Hexagon, Circle, CircleDot, DollarSign, Tag, Package, Ruler, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductInfo } from '@/types/product';
import { extractProductName, getMaterialInfo } from '@/types/product';
import { SupplierLogo } from './SupplierLogo';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductInfo;
  onInquire: (product: ProductInfo) => void;
  variant?: 'default' | 'compact' | 'grid';
  className?: string;
  isLoading?: boolean;
}

/**
 * Get appropriate icon for product type
 */
function getProductTypeIcon(product: ProductInfo): React.ReactNode {
  const productType = product.productType?.toLowerCase() || '';
  const headType = product.headType?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  const content = product.content?.toLowerCase() || '';

  const searchText = `${productType} ${headType} ${name} ${content}`;

  // Bolt/Screw detection
  if (searchText.includes('bolt') || searchText.includes('screw') || searchText.includes('tornillo') || searchText.includes('perno')) {
    return <Hexagon className="w-4 h-4 text-inox-blue" aria-hidden="true" />;
  }

  // Nut detection
  if (searchText.includes('nut') || searchText.includes('tuerca')) {
    return <Hexagon className="w-4 h-4 text-inox-orange" aria-hidden="true" />;
  }

  // Washer detection
  if (searchText.includes('washer') || searchText.includes('arandela')) {
    return <Circle className="w-4 h-4 text-inox-green" aria-hidden="true" />;
  }

  // Anchor detection
  if (searchText.includes('anchor') || searchText.includes('ancla') || searchText.includes('anclaje')) {
    return <CircleDot className="w-4 h-4 text-purple-600" aria-hidden="true" />;
  }

  // Default fastener icon
  return <Package className="w-4 h-4 text-slate-500" aria-hidden="true" />;
}

/**
 * Get confidence score color based on value
 */
function getConfidenceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-inox-teal';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-slate-400';
}

/**
 * ProductCard Skeleton for loading states
 */
export function ProductCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'grid' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 animate-pulse">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="p-3 rounded-lg bg-white border border-slate-200 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100">
          <Skeleton className="h-7 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="w-12 h-6 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="mt-4 flex justify-end">
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Confidence Score Indicator Component
 */
function ConfidenceIndicator({ score }: { score: number }) {
  const roundedScore = Math.round(score);
  const colorClass = getConfidenceColor(roundedScore);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center gap-1.5 cursor-help"
          role="img"
          aria-label={`Confidence score: ${roundedScore}%`}
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colorClass)}
              style={{ width: `${roundedScore}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">{roundedScore}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Match confidence: {roundedScore}%</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Price Indicator Component
 */
function PriceIndicator({ price }: { price: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-inox-teal/10 to-inox-green/10 border border-inox-teal/20">
      <DollarSign className="w-3 h-3 text-inox-teal" aria-hidden="true" />
      <span className="text-xs font-semibold text-inox-teal">{price}</span>
    </div>
  );
}

/**
 * Hover Preview Content
 */
function HoverPreviewContent({ product, productName, materialInfo }: {
  product: ProductInfo;
  productName: string;
  materialInfo: { name: string; color: string } | null;
}) {
  const { language } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="shrink-0 p-1.5 rounded-md bg-slate-100">
          {getProductTypeIcon(product)}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
            {productName}
          </h4>
          {product.standard && (
            <span className="text-xs text-slate-500">{product.standard}</span>
          )}
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {materialInfo && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-slate-600">{materialInfo.name}</span>
          </div>
        )}
        {product.threadType && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-slate-600">{product.threadType.toUpperCase()}</span>
          </div>
        )}
        {product.dimensions && (
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-slate-600">{product.dimensions}</span>
          </div>
        )}
        {product.finish && (
          <div className="flex items-center gap-1.5">
            <Circle className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-slate-600 capitalize">{product.finish.replace(/-/g, ' ')}</span>
          </div>
        )}
      </div>

      {/* Score */}
      {product.score !== undefined && product.score > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {language === 'es' ? 'Coincidencia' : 'Match'}
            </span>
            <ConfidenceIndicator score={product.score} />
          </div>
        </div>
      )}

      {/* Source */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        {product.supplier && (
          <SupplierLogo supplier={product.supplier} size="sm" variant="badge" />
        )}
        {product.pageNumber && (
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" aria-hidden="true" />
            {language === 'es' ? 'pag.' : 'p.'} {product.pageNumber}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProductCard({
  product,
  onInquire,
  variant = 'default',
  className = '',
  isLoading = false,
}: ProductCardProps) {
  const { language } = useLanguage();
  const productName = extractProductName(product);
  const materialInfo = getMaterialInfo(product.material);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleInquire = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onInquire(product);
  }, [onInquire, product]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInquire(e);
    }
  }, [handleInquire]);

  // Loading skeleton
  if (isLoading) {
    return <ProductCardSkeleton variant={variant} />;
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        ref={cardRef}
        role="article"
        aria-label={`Product: ${productName}`}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "group flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border transition-all duration-200",
          "hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-inox-teal/50 focus:border-inox-teal",
          isFocused ? "border-inox-teal ring-2 ring-inox-teal/50" : "border-slate-200",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Product Type Icon */}
          <div className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            {getProductTypeIcon(product)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-slate-900 truncate">
                {productName}
              </span>
              {materialInfo && (
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium transition-transform group-hover:scale-105",
                    materialInfo.color
                  )}
                >
                  {product.material}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              {product.supplier && (
                <SupplierLogo supplier={product.supplier} size="sm" variant="badge" />
              )}
              {product.supplier && product.pageNumber && (
                <span aria-hidden="true">-</span>
              )}
              {product.pageNumber && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" aria-hidden="true" />
                  <span>p.{product.pageNumber}</span>
                </span>
              )}
              {product.score !== undefined && product.score > 0 && (
                <>
                  <span aria-hidden="true">-</span>
                  <ConfidenceIndicator score={product.score} />
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleInquire}
          onKeyDown={handleKeyDown}
          aria-label={language === 'es' ? `Consultar sobre ${productName}` : `Inquire about ${productName}`}
          className="shrink-0 h-7 px-2 text-xs gap-1 hover:bg-inox-teal hover:text-white hover:border-inox-teal focus:ring-2 focus:ring-inox-teal/50 transition-all duration-200"
        >
          <MessageSquare className="w-3 h-3" aria-hidden="true" />
          {language === 'es' ? 'Consultar' : 'Inquire'}
        </Button>
      </div>
    );
  }

  // Grid variant (new compact grid view)
  if (variant === 'grid') {
    return (
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            ref={cardRef}
            role="article"
            aria-label={`Product: ${productName}`}
            tabIndex={0}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "group p-3 rounded-lg bg-white border transition-all duration-200 cursor-pointer",
              "hover:border-inox-teal/50 hover:shadow-md hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-inox-teal/50 focus:border-inox-teal",
              isFocused ? "border-inox-teal ring-2 ring-inox-teal/50 shadow-md" : "border-slate-200",
              className
            )}
          >
            {/* Header with icon and name */}
            <div className="flex items-start gap-2 mb-2">
              <div className="shrink-0 p-1 rounded bg-slate-50 group-hover:bg-inox-teal/10 transition-colors">
                {getProductTypeIcon(product)}
              </div>
              <h3 className="font-semibold text-sm text-slate-900 leading-tight line-clamp-2 group-hover:text-inox-blue transition-colors">
                {productName}
              </h3>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {product.standard && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                  {product.standard}
                </span>
              )}
              {materialInfo && (
                <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium", materialInfo.color)}>
                  {product.material}
                </span>
              )}
            </div>

            {/* Confidence score */}
            {product.score !== undefined && product.score > 0 && (
              <div className="mb-2">
                <ConfidenceIndicator score={product.score} />
              </div>
            )}

            {/* Price if available */}
            {product.priceInfo && (
              <div className="mb-2">
                <PriceIndicator price={product.priceInfo} />
              </div>
            )}

            {/* Action button */}
            <div className="pt-2 border-t border-slate-100">
              <Button
                size="sm"
                onClick={handleInquire}
                onKeyDown={handleKeyDown}
                aria-label={language === 'es' ? `Solicitar cotizacion para ${productName}` : `Request quote for ${productName}`}
                className="w-full h-7 text-xs gap-1 bg-inox-teal hover:bg-inox-teal/90 focus:ring-2 focus:ring-inox-teal/50 transition-all duration-200"
              >
                <MessageSquare className="w-3 h-3" aria-hidden="true" />
                {language === 'es' ? 'Cotizar' : 'Quote'}
              </Button>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-72" side="right" align="start">
          <HoverPreviewContent product={product} productName={productName} materialInfo={materialInfo} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Default variant with hover preview
  return (
    <HoverCard openDelay={400} closeDelay={150}>
      <HoverCardTrigger asChild>
        <div
          ref={cardRef}
          role="article"
          aria-label={`Product: ${productName}`}
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "group p-4 rounded-xl bg-white border transition-all duration-200",
            "hover:border-inox-teal/50 hover:shadow-lg hover:translate-y-[-2px]",
            "focus:outline-none focus:ring-2 focus:ring-inox-teal/50 focus:border-inox-teal",
            isFocused ? "border-inox-teal ring-2 ring-inox-teal/50 shadow-lg" : "border-slate-200",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Product name with icon */}
              <div className="flex items-start gap-2">
                <div className="shrink-0 p-1.5 rounded-lg bg-slate-50 group-hover:bg-inox-teal/10 transition-colors mt-0.5">
                  {getProductTypeIcon(product)}
                </div>
                <h3 className="font-semibold text-slate-900 leading-tight group-hover:text-inox-blue transition-colors">
                  {productName}
                </h3>
              </div>

              {/* Primary badges: Standard, Thread, Material */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {product.standard && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium group-hover:bg-slate-200 transition-colors">
                    {product.standard}
                  </span>
                )}
                {product.threadType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-inox-blue/10 text-inox-blue text-xs font-medium">
                    {product.threadType.toUpperCase()}
                  </span>
                )}
                {materialInfo && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-transform group-hover:scale-105",
                      materialInfo.color
                    )}
                  >
                    {materialInfo.name}
                  </span>
                )}
                {product.headType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                    {product.headType}
                  </span>
                )}
              </div>

              {/* Secondary info: Finish, Packaging */}
              {(product.finish || product.packagingUnit) && (
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  {product.finish && (
                    <span className="capitalize">{product.finish.replace(/-/g, ' ')}</span>
                  )}
                  {product.finish && product.packagingUnit && (
                    <span aria-hidden="true">-</span>
                  )}
                  {product.packagingUnit && (
                    <span>{product.packagingUnit}</span>
                  )}
                </div>
              )}

              {/* Price indicator - enhanced */}
              {product.priceInfo && (
                <div className="mt-3">
                  <PriceIndicator price={product.priceInfo} />
                </div>
              )}
            </div>

            {/* Confidence score visualization */}
            {product.score !== undefined && product.score > 0 && (
              <div className="shrink-0 flex flex-col items-end gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gradient-to-b from-emerald-50 to-emerald-100/50 cursor-help"
                      role="img"
                      aria-label={`Match score: ${Math.round(product.score)}%`}
                    >
                      <span className="text-lg font-bold text-emerald-700">
                        {Math.round(product.score)}
                      </span>
                      <Progress
                        value={product.score}
                        className="w-10 h-1"
                        aria-hidden="true"
                      />
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {language === 'es' ? 'coincid.' : 'match'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{language === 'es' ? 'Puntuacion de coincidencia basada en relevancia' : 'Match score based on relevance'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Source info - improved spacing */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {product.supplier && (
              <SupplierLogo supplier={product.supplier} size="sm" variant="badge" />
            )}
            {product.pageNumber && (
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3 h-3" aria-hidden="true" />
                {language === 'es' ? 'pag.' : 'p.'} {product.pageNumber}
              </span>
            )}
            {product.documentName && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[120px] hover:text-slate-700 cursor-help">
                    {product.documentName}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{product.documentName}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Content preview - only show if no structured metadata available */}
          {product.content && !product.standard && !product.threadType && (
            <p className="mt-3 text-sm text-slate-600 line-clamp-2">
              {product.content.substring(0, 150)}
              {product.content.length > 150 ? '...' : ''}
            </p>
          )}

          {/* Action button - improved */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleInquire}
              onKeyDown={handleKeyDown}
              aria-label={language === 'es' ? `Solicitar cotizacion para ${productName}` : `Request quote for ${productName}`}
              className="gap-2 bg-inox-teal hover:bg-inox-teal/90 focus:ring-2 focus:ring-inox-teal/50 focus:ring-offset-2 transition-all duration-200 group-hover:shadow-md"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              {language === 'es' ? 'Solicitar Cotizacion' : 'Request Quote'}
            </Button>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <HoverPreviewContent product={product} productName={productName} materialInfo={materialInfo} />
      </HoverCardContent>
    </HoverCard>
  );
}

export default ProductCard;

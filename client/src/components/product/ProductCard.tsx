import React from 'react';
import { MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductInfo } from '@/types/product';
import { extractProductName, getMaterialInfo } from '@/types/product';
import { SupplierLogo } from './SupplierLogo';

interface ProductCardProps {
  product: ProductInfo;
  onInquire: (product: ProductInfo) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ProductCard({
  product,
  onInquire,
  variant = 'default',
  className = '',
}: ProductCardProps) {
  const { language } = useLanguage();
  const productName = extractProductName(product);
  const materialInfo = getMaterialInfo(product.material);

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInquire(product);
  };

  if (variant === 'compact') {
    return (
      <div
        className={`group flex items-center justify-between gap-2 p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all ${className}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-900 truncate">
              {productName}
            </span>
            {materialInfo && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${materialInfo.color}`}
              >
                {product.material}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            {product.supplier && (
              <SupplierLogo supplier={product.supplier} size="sm" variant="badge" />
            )}
            {product.supplier && product.pageNumber && <span>•</span>}
            {product.pageNumber && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                p.{product.pageNumber}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleInquire}
          className="shrink-0 h-7 px-2 text-xs gap-1 hover:bg-inox-teal hover:text-white hover:border-inox-teal"
        >
          <MessageSquare className="w-3 h-3" />
          {language === 'es' ? 'Consultar' : 'Inquire'}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`group p-4 rounded-xl bg-white border border-slate-200 hover:border-inox-teal/50 hover:shadow-md transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 leading-tight">
            {productName}
          </h3>

          {/* Primary badges: Standard, Thread, Material */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.standard && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
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
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${materialInfo.color}`}
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

          {/* Secondary info: Finish, Packaging, Price */}
          {(product.finish || product.packagingUnit || product.priceInfo) && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              {product.finish && (
                <span className="capitalize">{product.finish.replace(/-/g, ' ')}</span>
              )}
              {product.finish && product.packagingUnit && <span>•</span>}
              {product.packagingUnit && (
                <span>{product.packagingUnit}</span>
              )}
              {(product.finish || product.packagingUnit) && product.priceInfo && <span>•</span>}
              {product.priceInfo && (
                <span className="font-medium text-inox-teal">{product.priceInfo}</span>
              )}
            </div>
          )}
        </div>

        {/* Score badge (if available) */}
        {product.score !== undefined && product.score > 0 && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            {Math.round(product.score)}%
          </span>
        )}
      </div>

      {/* Source info */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        {product.supplier && (
          <SupplierLogo supplier={product.supplier} size="sm" variant="badge" />
        )}
        {product.pageNumber && (
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {language === 'es' ? 'pag.' : 'p.'} {product.pageNumber}
          </span>
        )}
      </div>

      {/* Content preview - only show if no structured metadata available */}
      {product.content && !product.standard && !product.threadType && (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {product.content.substring(0, 150)}
          {product.content.length > 150 ? '...' : ''}
        </p>
      )}

      {/* Action button */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleInquire}
          className="gap-2 bg-inox-teal hover:bg-inox-teal/90"
        >
          <MessageSquare className="w-4 h-4" />
          {language === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
        </Button>
      </div>
    </div>
  );
}

export default ProductCard;

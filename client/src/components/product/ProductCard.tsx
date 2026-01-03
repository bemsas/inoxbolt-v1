import React from 'react';
import { MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductInfo } from '@/types/product';
import { extractProductName, getMaterialInfo, formatSupplier } from '@/types/product';

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
  const supplier = formatSupplier(product.supplier);

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
            {supplier && <span>{supplier}</span>}
            {supplier && product.pageNumber && <span>•</span>}
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

          {/* Metadata badges */}
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
          </div>
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
        {supplier && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 font-medium">
            {supplier}
          </span>
        )}
        {product.pageNumber && (
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {language === 'es' ? 'pág.' : 'p.'} {product.pageNumber}
          </span>
        )}
      </div>

      {/* Content preview (if available) */}
      {product.content && (
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

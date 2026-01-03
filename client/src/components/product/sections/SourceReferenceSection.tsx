import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SourceReferenceSectionProps } from '@/types/product-extended';
import { DataQualityIndicator } from '../atoms/DataQualityIndicator';
import { SupplierLogo } from '../SupplierLogo';
import { getSupplierConfig, normalizeSupplierName } from '@/config/suppliers';

export function SourceReferenceSection({
  sourceReference,
  dataQuality,
  showCatalogueLink = true,
  className = '',
  isLoading,
  compact,
}: SourceReferenceSectionProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'es' ? 'Fuente del Catálogo' : 'Catalogue Source',
    supplier: language === 'es' ? 'Proveedor' : 'Supplier',
    catalogue: language === 'es' ? 'Catálogo' : 'Catalogue',
    page: language === 'es' ? 'Página' : 'Page',
    articleNo: language === 'es' ? 'Artículo Nº' : 'Article No.',
    section: language === 'es' ? 'Sección' : 'Section',
    edition: language === 'es' ? 'Edición' : 'Edition',
    viewInCatalogue: language === 'es' ? 'Ver en catálogo' : 'View in Catalogue',
    visitSupplier: language === 'es' ? 'Visitar proveedor' : 'Visit Supplier',
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const supplierId = normalizeSupplierName(sourceReference.supplier);
  const supplierConfig = getSupplierConfig(supplierId);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
        <SupplierLogo supplier={supplierId} size="sm" variant="badge" />
        {sourceReference.pageNumber > 0 && (
          <span className="flex items-center gap-1 text-slate-500">
            <FileText className="w-3 h-3" />
            {t.page} {sourceReference.pageNumber}
          </span>
        )}
        {dataQuality !== undefined && (
          <DataQualityIndicator score={dataQuality} size="sm" showLabel={false} />
        )}
      </div>
    );
  }

  return (
    <Card className={`border-slate-200 ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Supplier Logo */}
          <div className="shrink-0 w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
            <SupplierLogo supplier={supplierId} size="lg" variant="logo" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">{supplierConfig.name}</h3>
              <span className="text-xs text-slate-400">{supplierConfig.countryFlag}</span>
              {dataQuality !== undefined && (
                <DataQualityIndicator score={dataQuality} size="sm" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-slate-500">{t.catalogue}:</div>
              <div className="text-slate-700 font-medium truncate">
                {sourceReference.catalogueName}
              </div>

              {sourceReference.pageNumber > 0 && (
                <>
                  <div className="text-slate-500">{t.page}:</div>
                  <div className="text-slate-700 font-medium">{sourceReference.pageNumber}</div>
                </>
              )}

              {sourceReference.articleNumber && (
                <>
                  <div className="text-slate-500">{t.articleNo}:</div>
                  <div className="text-slate-700 font-mono text-xs">
                    {sourceReference.articleNumber}
                  </div>
                </>
              )}

              {sourceReference.section && (
                <>
                  <div className="text-slate-500">{t.section}:</div>
                  <div className="text-slate-700">{sourceReference.section}</div>
                </>
              )}

              {sourceReference.edition && (
                <>
                  <div className="text-slate-500">{t.edition}:</div>
                  <div className="text-slate-700">{sourceReference.edition}</div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {showCatalogueLink && sourceReference.catalogueUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={sourceReference.catalogueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    {t.viewInCatalogue}
                  </a>
                </Button>
              )}
              {supplierConfig.websiteUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={supplierConfig.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t.visitSupplier}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

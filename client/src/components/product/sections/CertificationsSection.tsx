import React, { useState } from 'react';
import { ChevronDown, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CertificationsSectionProps } from '@/types/product-extended';
import { CertificationBadge } from '../atoms/CertificationBadge';

export function CertificationsSection({
  certifications,
  primaryStandard,
  showDownloads = true,
  className = '',
  isLoading,
  compact,
}: CertificationsSectionProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(!compact);

  const t = {
    title: language === 'es' ? 'Normas y Certificaciones' : 'Standards & Certifications',
    primaryStandard: language === 'es' ? 'Norma Principal' : 'Primary Standard',
    download: language === 'es' ? 'Descargar certificado' : 'Download certificate',
    noCertifications: language === 'es' ? 'Sin certificaciones disponibles' : 'No certifications available',
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!certifications || certifications.length === 0) {
    if (compact) return null;
    return (
      <div className={`text-sm text-slate-500 py-2 ${className}`}>
        {t.noCertifications}
      </div>
    );
  }

  // Find the primary certification
  const primaryCert = certifications.find(
    (c) => c.standardNumber === primaryStandard
  );
  const otherCerts = certifications.filter(
    (c) => c.standardNumber !== primaryStandard
  );

  const content = (
    <div className="space-y-4">
      {/* Primary Standard */}
      {primaryCert && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-inox-teal" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t.primaryStandard}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <CertificationBadge
              certification={primaryCert}
              showDescription
              className="text-base"
            />
            {showDownloads && primaryCert.certificateUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={primaryCert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t.download}
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Other Certifications */}
      {otherCerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {otherCerts.map((cert, index) => (
            <CertificationBadge
              key={`${cert.type}-${cert.standardNumber}-${index}`}
              certification={cert}
              onClick={
                showDownloads && cert.certificateUrl
                  ? () => window.open(cert.certificateUrl, '_blank')
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {certifications.slice(0, 5).map((cert, index) => (
            <CertificationBadge
              key={`${cert.type}-${cert.standardNumber}-${index}`}
              certification={cert}
            />
          ))}
          {certifications.length > 5 && (
            <span className="text-sm text-slate-500 self-center">
              +{certifications.length - 5}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
        <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{content}</CollapsibleContent>
    </Collapsible>
  );
}

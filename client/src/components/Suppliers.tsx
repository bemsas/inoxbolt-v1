import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllSuppliers, type SupplierConfig } from '@/config/suppliers';

// Featured suppliers to display on homepage
const FEATURED_SUPPLIER_IDS = ['reyher', 'klimas', 'wurth', 'bossard'];

export default function Suppliers() {
  const { t } = useLanguage();
  const allSuppliers = getAllSuppliers();
  const featuredSuppliers = allSuppliers.filter(s => FEATURED_SUPPLIER_IDS.includes(s.id));

  const certifications = ['DIN', 'ISO 9001', 'CE', 'ETA'];

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">
            {t('suppliers.title')}
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-12">
            {featuredSuppliers.map((supplier) => (
              <SupplierLogoDisplay key={supplier.id} supplier={supplier} />
            ))}
          </div>

          <p className="text-slate-400 text-sm font-medium">
            {t('suppliers.more')}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-12">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {certifications.map((cert) => (
              <div key={cert} className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 font-mono font-semibold text-sm">
                {cert}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Individual supplier logo display for homepage
 */
function SupplierLogoDisplay({ supplier }: { supplier: SupplierConfig }) {
  return (
    <a
      href={supplier.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3"
    >
      <div className="h-16 flex items-center grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100">
        {supplier.logoPath ? (
          <img
            src={supplier.logoPath}
            alt={supplier.name}
            className="h-8 w-auto object-contain"
            onError={(e) => {
              // Fallback to text if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className={`text-3xl font-black tracking-tighter ${supplier.logoPath ? 'hidden' : 'flex'}`}
          style={{ color: supplier.primaryColor }}
        >
          {supplier.shortName}
        </span>
      </div>
      <span
        className="text-xs font-medium text-slate-400 group-hover:text-current transition-colors"
        style={{ '--tw-text-opacity': 1 } as React.CSSProperties}
      >
        {supplier.country}
      </span>
    </a>
  );
}

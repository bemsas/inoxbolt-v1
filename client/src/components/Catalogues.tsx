import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, FileText } from 'lucide-react';

export default function Catalogues() {
  const { t } = useLanguage();

  const catalogues = [
    {
      id: 1,
      title: 'REYHER Main Catalogue',
      supplier: 'REYHER',
      supplierColor: 'bg-blue-600',
      pages: 973,
      file: '/catalogues/REYHER_Catalogue_2020_04_EN_Web_ks.pdf',
      cover: '/covers/reyher-main.jpg',
    },
    {
      id: 2,
      title: 'REYHER Fastener Guide',
      supplier: 'REYHER',
      supplierColor: 'bg-blue-600',
      pages: 102,
      file: '/catalogues/REYHER_Fastener_Guide_EN.pdf',
      cover: '/covers/reyher-guide.jpg',
    },
    {
      id: 3,
      title: 'KLIMAS Product Catalog 2024',
      supplier: 'KLIMAS',
      supplierColor: 'bg-red-600',
      pages: 152,
      file: '/catalogues/product_catalog-2024-en.pdf',
      cover: '/covers/klimas-2024.jpg',
    },
  ];

  return (
    <section id="catalogues" className="py-24 bg-slate-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            {t('catalogues.title')}
          </h2>
          <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {catalogues.map((cat) => (
            <div 
              key={cat.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Cover Image */}
              <div className="relative h-64 overflow-hidden bg-slate-200">
                <img 
                  src={cat.cover} 
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${cat.supplierColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                    {cat.supplier}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2 line-clamp-2">
                  {cat.title}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                  <FileText className="w-4 h-4" />
                  <span>{cat.pages} {t('catalogues.pages')}</span>
                </div>

                <div className="mt-auto">
                  <a 
                    href={cat.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-inox-teal hover:text-white text-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    {t('catalogues.download')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

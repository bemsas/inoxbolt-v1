import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Suppliers() {
  const { t } = useLanguage();

  const certifications = ['DIN', 'ISO 9001', 'CE', 'ETA'];

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">
            {t('suppliers.title')}
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 mb-12">
            {/* REYHER Logo Placeholder */}
            <div className="group flex flex-col items-center gap-3">
              <div className="h-16 flex items-center grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100">
                {/* Text-based logo fallback if image fails */}
                <span className="text-4xl font-black text-blue-900 tracking-tighter">REYHER</span>
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors">Germany</span>
            </div>

            {/* KLIMAS Logo Placeholder */}
            <div className="group flex flex-col items-center gap-3">
              <div className="h-16 flex items-center grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-600 text-white font-bold flex items-center justify-center text-2xl rounded-sm">K</div>
                  <div className="flex flex-col leading-none">
                    <span className="text-2xl font-black text-red-600">KLIMAS</span>
                    <span className="text-xs font-bold text-slate-800 tracking-widest">Wkręt-met</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-red-600 transition-colors">Poland</span>
            </div>
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

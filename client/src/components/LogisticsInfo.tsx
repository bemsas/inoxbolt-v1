import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plane, FileCheck, Clock } from 'lucide-react';

export default function LogisticsInfo() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            {t('logistics.title')}
          </h2>
          <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Canary Islands */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t('logistics.canary.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('logistics.canary.desc')}
            </p>
          </div>

          {/* Mainland & Europe */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Plane className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t('logistics.mainland.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('logistics.mainland.desc')}
            </p>
          </div>

          {/* SLA Promise */}
          <div className="bg-inox-teal/5 rounded-2xl p-8 border border-inox-teal/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-inox-teal/10 rounded-bl-full -mr-4 -mt-4" />
            <div className="w-14 h-14 bg-inox-teal text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-inox-teal/30">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t('logistics.sla.title')}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {t('logistics.sla.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

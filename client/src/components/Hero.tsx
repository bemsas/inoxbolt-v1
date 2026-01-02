import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, MapPin } from 'lucide-react';

interface HeroProps {
  onOpenModal: () => void;
}

export default function Hero({ onOpenModal }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20 lg:pt-0">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="order-2 lg:order-1 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <MapPin className="w-4 h-4 text-inox-teal" />
              {t('hero.location')}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              {t('hero.headline')}
              <span className="block text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-inox-teal to-inox-blue mt-4 font-bold">
                {t('hero.subheadline')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button 
                onClick={onOpenModal}
                className="group relative px-8 py-4 bg-inox-orange text-white font-semibold rounded-full shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <span className="relative z-10">{t('hero.cta')}</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="order-1 lg:order-2 relative h-[50vh] lg:h-[85vh] w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-inox-teal/20 to-inox-orange/20 rounded-[2rem] transform rotate-3 scale-95 opacity-50 blur-2xl" />
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
              <img 
                src="/images/hero-logistics.jpg" 
                alt="Modern automated warehouse with stainless steel fasteners" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
              {/* Overlay Gradient for better text contrast if needed, though text is now separate */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-bounce delay-1000 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Stock Status</p>
                  <p className="text-lg font-bold text-slate-900">Ready to Ship</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldCheck, Truck, Anchor, FileText } from 'lucide-react';

export default function ValueProps() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <div className="text-2xl font-bold text-inox-teal">2M+</div>,
      titleKey: 'value.premium.title',
      descKey: 'value.premium.desc',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100'
    },
    {
      icon: <div className="text-2xl font-bold text-inox-orange">EU</div>,
      titleKey: 'value.delivery.title',
      descKey: 'value.delivery.desc',
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    },
    {
      icon: <Anchor className="w-8 h-8 text-inox-blue" />,
      titleKey: 'value.canary.title',
      descKey: 'value.canary.desc',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      icon: <FileText className="w-8 h-8 text-inox-green" />,
      titleKey: 'value.tech.title',
      descKey: 'value.tech.desc',
      bg: 'bg-green-50',
      border: 'border-green-100'
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(/images/pattern-hex.png)', backgroundSize: '400px' }} />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            Why Choose Inoxbolt?
          </h2>
          <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border ${feature.border} hover:-translate-y-1`}
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

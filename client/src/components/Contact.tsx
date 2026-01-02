import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-slate-600">
            {t('contact.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Email */}
          <a href="mailto:enquiries@inoxbolt.es" className="group bg-slate-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-slate-100">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('contact.email')}</h3>
            <p className="text-slate-600 font-medium">enquiries@inoxbolt.es</p>
          </a>

          {/* Phone */}
          <a href="tel:+34000000000" className="group bg-slate-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-slate-100">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('contact.phone')}</h3>
            <p className="text-slate-600 font-medium">+34 000 000 000</p>
          </a>

          {/* Location */}
          <div className="group bg-slate-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-slate-100">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('contact.location')}</h3>
            <p className="text-slate-600 font-medium">Tenerife / Gran Canaria</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a 
            href="https://wa.me/34000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
            {t('contact.whatsapp')}
          </a>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-inox-teal rounded-lg flex items-center justify-center transform rotate-45">
                <div className="w-4 h-4 bg-slate-900 rounded-full transform -rotate-45"></div>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                INOXBOLT
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The Future of Fastening. Engineered for Construction. Serving Spain and the Canary Islands with precision and speed.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer.products')}</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-inox-teal transition-colors">Stainless Steel Bolts</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Structural Fixings</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Anchoring Systems</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Marine Grade (A4)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer.company')}</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-inox-teal transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('footer.legal')}</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-inox-teal transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-inox-teal transition-colors">Imprint</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} Inoxbolt. {t('footer.rights')}
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Menu, X, Globe } from 'lucide-react';
import { Link } from 'wouter';

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-inox-teal rounded-lg flex items-center justify-center transform rotate-45">
            <div className="w-4 h-4 bg-white rounded-full transform -rotate-45"></div>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-slate-900">
            INOXBOLT
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Search Link */}
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-medium text-slate-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            {language === 'es' ? 'Buscar productos' : 'Search products'}
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('catalogues')}
              className="text-sm font-medium hover:text-inox-teal transition-colors text-slate-700"
            >
              {t('nav.catalogues')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium hover:text-inox-teal transition-colors text-slate-700"
            >
              {t('nav.contact')}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Globe className="w-3 h-3" />
              {language === 'en' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-4">
          <Link
            href="/search"
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100"
          >
            {language === 'en' ? 'EN' : 'ES'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 p-4 flex flex-col gap-4 lg:hidden animate-in slide-in-from-top-5">
          <Link
            href="/search"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-inox-teal/10 text-inox-teal font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Search className="w-5 h-5" />
            {language === 'es' ? 'Buscar productos' : 'Search products'}
          </Link>
          <button
            onClick={() => scrollToSection('catalogues')}
            className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
          >
            {t('nav.catalogues')}
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
          >
            {t('nav.contact')}
          </button>
        </div>
      )}
    </nav>
  );
}

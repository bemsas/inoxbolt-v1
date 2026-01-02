import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRAG } from '@/contexts/RAGContext';
import { useRAGSearch } from '@/hooks/useRAGSearch';
import { Search, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchResults } from '@/components/rag/SearchResults';

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { setChatOpen } = useRAG();
  const { query, results, isSearching, error, isOpen, setQuery, clear, close, open } = useRAGSearch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const handleAskAI = () => {
    setChatOpen(true);
  };

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
          <span className={`font-display font-bold text-2xl tracking-tight text-slate-900`}>
            INOXBOLT
          </span>
        </div>

        {/* Desktop Search & Nav */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
          {/* Search Bar */}
          <div ref={searchRef} className={`relative group transition-all duration-300 ${scrolled ? 'w-64' : 'w-80 bg-white/10 backdrop-blur-sm border border-white/20'}`}>
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400`}>
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={open}
              className={`block w-full pl-10 pr-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-inox-teal transition-colors bg-slate-100 text-slate-900 placeholder-slate-500`}
              placeholder={t('nav.search_placeholder')}
            />
            {isOpen && (query.length >= 2 || results.length > 0) && (
              <SearchResults
                results={results}
                isSearching={isSearching}
                error={error}
                onAskAI={handleAskAI}
                onClose={close}
              />
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('catalogues')}
              className={`text-sm font-medium hover:text-inox-teal transition-colors text-slate-700`}
            >
              {t('nav.catalogues')}
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-medium hover:text-inox-teal transition-colors text-slate-700`}
            >
              {t('nav.contact')}
            </button>
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200`}
            >
              <Globe className="w-3 h-3" />
              {language === 'en' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-slate-700 bg-slate-100`}
          >
            {language === 'en' ? 'EN' : 'ES'}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg text-slate-900`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 p-4 flex flex-col gap-4 lg:hidden animate-in slide-in-from-top-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={open}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-inox-teal"
              placeholder={t('nav.search_placeholder')}
            />
            {isOpen && (query.length >= 2 || results.length > 0) && (
              <SearchResults
                results={results}
                isSearching={isSearching}
                error={error}
                onAskAI={handleAskAI}
                onClose={close}
              />
            )}
          </div>
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

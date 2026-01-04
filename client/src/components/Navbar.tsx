import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search,
  X,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
  Home,
  Package,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

// Product categories data
const productCategories = {
  stainless: {
    en: {
      title: 'Stainless Steel',
      description: 'A2/A4 grade fasteners for marine and corrosive environments',
      icon: '🔩',
      href: '/stainless-fasteners',
      products: [
        { name: 'DIN 933 - Hex Head Bolts', href: '/stainless-fasteners?standard=DIN933' },
        { name: 'DIN 912 - Socket Head Cap Screws', href: '/stainless-fasteners?standard=DIN912' },
        { name: 'DIN 934 - Hex Nuts', href: '/stainless-fasteners?standard=DIN934' },
        { name: 'DIN 125 - Flat Washers', href: '/stainless-fasteners?standard=DIN125' },
      ],
    },
    es: {
      title: 'Acero Inoxidable',
      description: 'Fijaciones A2/A4 para entornos marinos y corrosivos',
      icon: '🔩',
      href: '/stainless-fasteners',
      products: [
        { name: 'DIN 933 - Tornillos Hexagonales', href: '/stainless-fasteners?standard=DIN933' },
        { name: 'DIN 912 - Tornillos Allen', href: '/stainless-fasteners?standard=DIN912' },
        { name: 'DIN 934 - Tuercas Hexagonales', href: '/stainless-fasteners?standard=DIN934' },
        { name: 'DIN 125 - Arandelas Planas', href: '/stainless-fasteners?standard=DIN125' },
      ],
    },
  },
  structural: {
    en: {
      title: 'Structural Bolts',
      description: 'High-strength bolts for construction and heavy industry',
      icon: '🏗️',
      href: '/structural-bolts',
      products: [
        { name: 'DIN 6914 - HV Hex Bolts', href: '/structural-bolts?standard=DIN6914' },
        { name: 'DIN 6915 - HV Hex Nuts', href: '/structural-bolts?standard=DIN6915' },
        { name: 'DIN 6916 - HV Washers', href: '/structural-bolts?standard=DIN6916' },
        { name: 'EN 14399 - CE Marked Sets', href: '/structural-bolts?standard=EN14399' },
      ],
    },
    es: {
      title: 'Tornillos Estructurales',
      description: 'Tornillos de alta resistencia para construccion e industria',
      icon: '🏗️',
      href: '/structural-bolts',
      products: [
        { name: 'DIN 6914 - Tornillos HV', href: '/structural-bolts?standard=DIN6914' },
        { name: 'DIN 6915 - Tuercas HV', href: '/structural-bolts?standard=DIN6915' },
        { name: 'DIN 6916 - Arandelas HV', href: '/structural-bolts?standard=DIN6916' },
        { name: 'EN 14399 - Conjuntos CE', href: '/structural-bolts?standard=EN14399' },
      ],
    },
  },
};

// Translations for navbar
const navTranslations = {
  products: { en: 'Products', es: 'Productos' },
  viewAll: { en: 'View All', es: 'Ver Todo' },
  requestQuote: { en: 'Request Quote', es: 'Solicitar Presupuesto' },
  downloadCatalog: { en: 'Download Catalog', es: 'Descargar Catalogo' },
  getQuote: { en: 'Get Quote', es: 'Presupuesto' },
  search: { en: 'Search', es: 'Buscar' },
  searchProducts: { en: 'Search products...', es: 'Buscar productos...' },
  searchPlaceholder: { en: 'Search by code, standard, or description...', es: 'Buscar por codigo, norma o descripcion...' },
  home: { en: 'Home', es: 'Inicio' },
  quote: { en: 'Quote', es: 'Cotizar' },
  quickLinks: { en: 'Quick Links', es: 'Enlaces Rapidos' },
  browseCategories: { en: 'Browse Categories', es: 'Explorar Categorias' },
  close: { en: 'Close', es: 'Cerrar' },
};

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Get translation helper
  const nt = useCallback((key: keyof typeof navTranslations) => {
    return navTranslations[key][language];
  }, [language]);

  // Get category data based on language
  const getCategory = useCallback((key: 'stainless' | 'structural') => {
    return productCategories[key][language];
  }, [language]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && mobileSearchInputRef.current) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Mega menu hover handlers with delay
  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery]);

  // Scroll to section helper
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Close mega menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Main Navigation - Desktop */}
      <nav
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-white/80 backdrop-blur-sm py-4'
        )}
        role="navigation"
        aria-label={language === 'es' ? 'Navegacion principal' : 'Main navigation'}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="INOXBOLT - Home"
          >
            <div className="w-9 h-9 bg-inox-teal rounded-lg flex items-center justify-center transform rotate-45 transition-transform group-hover:rotate-[55deg]">
              <div className="w-4 h-4 bg-white rounded-full transform -rotate-45" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900">
              INOXBOLT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Search Bar - Expandable */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                className={cn(
                  'flex items-center transition-all duration-300 rounded-full border border-slate-200 bg-slate-50/80',
                  searchFocused ? 'w-72 shadow-md border-inox-teal/50' : 'w-52'
                )}
              >
                <Search className="h-4 w-4 ml-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={nt('searchProducts')}
                  className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                  aria-label={nt('search')}
                />
              </div>
            </form>

            {/* Products Mega Menu Trigger */}
            <div
              ref={megaMenuRef}
              className="relative"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  megaMenuOpen
                    ? 'text-inox-teal bg-inox-teal/5'
                    : 'text-slate-700 hover:text-inox-teal hover:bg-slate-50'
                )}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                {nt('products')}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    megaMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Mega Menu Dropdown */}
              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 mt-2 transition-all duration-200',
                  megaMenuOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                )}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
              >
                <div className="w-[640px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {nt('browseCategories')}
                    </h3>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    {/* Stainless Steel Column */}
                    <div className="p-5">
                      <Link
                        href={getCategory('stainless').href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        <span className="text-2xl">{getCategory('stainless').icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 group-hover:text-inox-teal transition-colors">
                            {getCategory('stainless').title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getCategory('stainless').description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-inox-teal transition-colors mt-1" />
                      </Link>

                      <div className="mt-3 space-y-1">
                        {getCategory('stainless').products.map((product) => (
                          <Link
                            key={product.href}
                            href={product.href}
                            className="block px-3 py-2 text-sm text-slate-600 hover:text-inox-teal hover:bg-slate-50 rounded-lg transition-colors"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={getCategory('stainless').href}
                        className="flex items-center gap-1 mt-4 px-3 py-2 text-sm font-medium text-inox-teal hover:underline"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        {nt('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Structural Bolts Column */}
                    <div className="p-5">
                      <Link
                        href={getCategory('structural').href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        <span className="text-2xl">{getCategory('structural').icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 group-hover:text-inox-teal transition-colors">
                            {getCategory('structural').title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getCategory('structural').description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-inox-teal transition-colors mt-1" />
                      </Link>

                      <div className="mt-3 space-y-1">
                        {getCategory('structural').products.map((product) => (
                          <Link
                            key={product.href}
                            href={product.href}
                            className="block px-3 py-2 text-sm text-slate-600 hover:text-inox-teal hover:bg-slate-50 rounded-lg transition-colors"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={getCategory('structural').href}
                        className="flex items-center gap-1 mt-4 px-3 py-2 text-sm font-medium text-inox-teal hover:underline"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        {nt('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Footer Quick Links */}
                  <div className="bg-slate-50/80 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                    <Link
                      href="/quote"
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-inox-teal transition-colors"
                      onClick={() => setMegaMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      {nt('requestQuote')}
                    </Link>
                    <button
                      onClick={() => {
                        scrollToSection('catalogues');
                        setMegaMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-inox-teal transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {nt('downloadCatalog')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalogues Link */}
            <button
              onClick={() => scrollToSection('catalogues')}
              className="text-sm font-medium text-slate-700 hover:text-inox-teal transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              {t('nav.catalogues')}
            </button>

            {/* Contact Link */}
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium text-slate-700 hover:text-inox-teal transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              {t('nav.contact')}
            </button>

            {/* Get Quote CTA */}
            <Button
              asChild
              className="bg-inox-teal hover:bg-inox-teal/90 text-white rounded-full px-5"
            >
              <Link href="/quote">
                <FileText className="w-4 h-4 mr-1.5" />
                {nt('getQuote')}
              </Link>
            </Button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Ingles'}
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'EN' : 'ES'}
            </button>
          </div>

          {/* Mobile - Language Toggle Only (nav is at bottom) */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Ingles'}
            >
              <Globe className="w-3.5 h-3.5" />
              {language === 'en' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
          'bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg'
        )}
        role="navigation"
        aria-label={language === 'es' ? 'Navegacion movil' : 'Mobile navigation'}
      >
        <div className="flex items-center justify-around py-2 px-4 safe-area-inset-bottom">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] min-h-[44px] rounded-xl transition-colors',
              location === '/'
                ? 'text-inox-teal bg-inox-teal/10'
                : 'text-slate-600 hover:text-inox-teal hover:bg-slate-50'
            )}
            aria-label={nt('home')}
            aria-current={location === '/' ? 'page' : undefined}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">{nt('home')}</span>
          </Link>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] min-h-[44px] rounded-xl transition-colors',
              'text-slate-600 hover:text-inox-teal hover:bg-slate-50'
            )}
            aria-label={nt('search')}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">{nt('search')}</span>
          </button>

          {/* Products */}
          <button
            onClick={() => setProductsDrawerOpen(true)}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] min-h-[44px] rounded-xl transition-colors',
              productsDrawerOpen
                ? 'text-inox-teal bg-inox-teal/10'
                : 'text-slate-600 hover:text-inox-teal hover:bg-slate-50'
            )}
            aria-label={nt('products')}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">{nt('products')}</span>
          </button>

          {/* Quote */}
          <Link
            href="/quote"
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] min-h-[44px] rounded-xl transition-colors',
              location === '/quote'
                ? 'text-inox-teal bg-inox-teal/10'
                : 'text-slate-600 hover:text-inox-teal hover:bg-slate-50'
            )}
            aria-label={nt('quote')}
            aria-current={location === '/quote' ? 'page' : undefined}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">{nt('quote')}</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side="top"
          className="h-[100dvh] p-0"
          hideCloseButton
        >
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    ref={mobileSearchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={nt('searchPlaceholder')}
                    className="flex-1 bg-transparent px-3 text-base outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-slate-200 rounded-full"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </form>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="shrink-0">
                  {nt('close')}
                </Button>
              </SheetClose>
            </div>

            {/* Quick Links */}
            <div className="flex-1 overflow-auto p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {nt('quickLinks')}
              </h3>
              <div className="space-y-2">
                <Link
                  href="/stainless-fasteners"
                  className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setSearchOpen(false)}
                >
                  <span className="text-xl">{getCategory('stainless').icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{getCategory('stainless').title}</div>
                    <div className="text-xs text-slate-500">{getCategory('stainless').description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
                <Link
                  href="/structural-bolts"
                  className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setSearchOpen(false)}
                >
                  <span className="text-xl">{getCategory('structural').icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{getCategory('structural').title}</div>
                    <div className="text-xs text-slate-500">{getCategory('structural').description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
                <Link
                  href="/search"
                  className="flex items-center gap-3 p-4 bg-inox-teal/10 hover:bg-inox-teal/20 rounded-xl transition-colors"
                  onClick={() => setSearchOpen(false)}
                >
                  <Search className="w-5 h-5 text-inox-teal" />
                  <div className="flex-1">
                    <div className="font-medium text-inox-teal">{nt('viewAll')} {nt('products')}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-inox-teal" />
                </Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Products Drawer */}
      <Drawer open={productsDrawerOpen} onOpenChange={setProductsDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left border-b border-slate-100">
            <DrawerTitle className="text-lg font-semibold">
              {nt('products')}
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-auto pb-8">
            {/* Stainless Steel Section */}
            <div className="p-4">
              <Link
                href={getCategory('stainless').href}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setProductsDrawerOpen(false)}
              >
                <span className="text-2xl">{getCategory('stainless').icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{getCategory('stainless').title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{getCategory('stainless').description}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              <div className="mt-2 ml-4 space-y-1">
                {getCategory('stainless').products.map((product) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="block px-4 py-3 text-sm text-slate-600 hover:text-inox-teal hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setProductsDrawerOpen(false)}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Structural Bolts Section */}
            <div className="p-4 pt-0">
              <Link
                href={getCategory('structural').href}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setProductsDrawerOpen(false)}
              >
                <span className="text-2xl">{getCategory('structural').icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{getCategory('structural').title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{getCategory('structural').description}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>

              <div className="mt-2 ml-4 space-y-1">
                {getCategory('structural').products.map((product) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="block px-4 py-3 text-sm text-slate-600 hover:text-inox-teal hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setProductsDrawerOpen(false)}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 pt-2 space-y-3 border-t border-slate-100 mt-4">
              <Link
                href="/quote"
                className="flex items-center justify-center gap-2 w-full py-4 bg-inox-teal text-white rounded-xl font-medium text-base"
                onClick={() => setProductsDrawerOpen(false)}
              >
                <FileText className="w-5 h-5" />
                {nt('requestQuote')}
              </Link>

              <button
                onClick={() => {
                  setProductsDrawerOpen(false);
                  scrollToSection('catalogues');
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-medium text-base hover:bg-slate-200 transition-colors"
              >
                <Download className="w-5 h-5" />
                {nt('downloadCatalog')}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <div className="h-[72px] lg:h-[80px]" />

      {/* Mobile bottom nav spacer */}
      <div className="h-[72px] lg:hidden" />
    </>
  );
}

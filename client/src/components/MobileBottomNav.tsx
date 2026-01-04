import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, Link } from 'wouter';
import {
  Home,
  Search,
  Package,
  FileText,
  Menu,
  X,
  Globe,
  Download,
  Phone,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Wrench
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';

interface NavItem {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: React.ElementType;
  href?: string;
  action?: 'products' | 'more';
}

const navItems: NavItem[] = [
  { id: 'home', labelEn: 'Home', labelEs: 'Inicio', icon: Home, href: '/' },
  { id: 'search', labelEn: 'Search', labelEs: 'Buscar', icon: Search, href: '/search' },
  { id: 'products', labelEn: 'Products', labelEs: 'Productos', icon: Package, action: 'products' },
  { id: 'quote', labelEn: 'Quote', labelEs: 'Presupuesto', icon: FileText, href: '/quote' },
  { id: 'more', labelEn: 'More', labelEs: 'Mas', icon: Menu, action: 'more' },
];

interface ProductCategory {
  id: string;
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  icon: React.ElementType;
  href: string;
}

const productCategories: ProductCategory[] = [
  {
    id: 'stainless',
    titleEn: 'Stainless Steel',
    titleEs: 'Acero Inoxidable',
    descEn: 'A2/A4 fasteners for marine and coastal environments',
    descEs: 'Fijaciones A2/A4 para ambientes marinos y costeros',
    icon: Sparkles,
    href: '/stainless-fasteners',
  },
  {
    id: 'structural',
    titleEn: 'Structural Bolts',
    titleEs: 'Tornillos Estructurales',
    descEn: 'High-strength bolts for construction projects',
    descEs: 'Tornillos de alta resistencia para proyectos de construccion',
    icon: Wrench,
    href: '/structural-bolts',
  },
  {
    id: 'all',
    titleEn: 'All Products',
    titleEs: 'Todos los Productos',
    descEn: 'Browse our complete catalog of 2M+ items',
    descEs: 'Explore nuestro catalogo completo de 2M+ articulos',
    icon: Package,
    href: '/search',
  },
];

export default function MobileBottomNav() {
  const { language, toggleLanguage } = useLanguage();
  const [location] = useLocation();
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    }, 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleNavClick = (item: NavItem) => {
    triggerHaptic();

    if (item.action === 'products') {
      setProductsDrawerOpen(true);
    } else if (item.action === 'more') {
      setMoreDrawerOpen(true);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      if (item.href === '/') {
        return location === '/';
      }
      return location.startsWith(item.href);
    }
    return false;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMoreDrawerOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white/95 backdrop-blur-lg border-t border-slate-200
          md:hidden
          transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const label = language === 'es' ? item.labelEs : item.labelEn;

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => triggerHaptic()}
                  className={`
                    flex flex-col items-center justify-center
                    min-w-[56px] min-h-[44px] py-2 px-3
                    rounded-xl transition-all duration-200
                    ${active
                      ? 'text-inox-teal bg-inox-teal/10'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 mb-0.5 ${active ? 'fill-inox-teal/20' : ''}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[56px] min-h-[44px] py-2 px-3
                  rounded-xl transition-all duration-200
                  text-slate-500 hover:text-slate-700 hover:bg-slate-50
                  active:scale-95
                `}
              >
                <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Products Drawer */}
      <Drawer open={productsDrawerOpen} onOpenChange={setProductsDrawerOpen}>
        <DrawerContent className="max-h-[60vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg font-display">
              {language === 'es' ? 'Categorias de Productos' : 'Product Categories'}
            </DrawerTitle>
            <DrawerDescription>
              {language === 'es'
                ? 'Explore nuestras categorias de productos'
                : 'Browse our product categories'
              }
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-3">
            {productCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  onClick={() => {
                    triggerHaptic();
                    setProductsDrawerOpen(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-inox-teal/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-inox-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {language === 'es' ? category.titleEs : category.titleEn}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {language === 'es' ? category.descEs : category.descEn}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      {/* More Drawer */}
      <Drawer open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen}>
        <DrawerContent className="max-h-[50vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg font-display">
              {language === 'es' ? 'Mas Opciones' : 'More Options'}
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 space-y-2">
            {/* Language Toggle */}
            <button
              onClick={() => {
                triggerHaptic();
                toggleLanguage();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-slate-900">
                  {language === 'es' ? 'Idioma' : 'Language'}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'es' ? 'Espanol (ES)' : 'English (EN)'}
                </p>
              </div>
              <span className="px-3 py-1 bg-inox-teal/10 text-inox-teal text-sm font-semibold rounded-full">
                {language === 'es' ? 'EN' : 'ES'}
              </span>
            </button>

            {/* Download Catalogue */}
            <button
              onClick={() => {
                triggerHaptic();
                scrollToSection('catalogues');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-slate-900">
                  {language === 'es' ? 'Descargar Catalogo' : 'Download Catalogue'}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'es' ? 'PDF con especificaciones' : 'PDF with specifications'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* Contact Us */}
            <button
              onClick={() => {
                triggerHaptic();
                scrollToSection('contact');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-slate-900">
                  {language === 'es' ? 'Contacto' : 'Contact Us'}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'es' ? 'Email, telefono, ubicacion' : 'Email, phone, location'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            {/* WhatsApp Link */}
            <a
              href="https://wa.me/34000000000?text=Hi%20Inoxbolt%2C%20I%27m%20interested%20in%20construction-grade%20fixings..."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic()}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-slate-900">WhatsApp</h3>
                <p className="text-sm text-slate-500">
                  {language === 'es' ? 'Chat directo con nosotros' : 'Chat directly with us'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#25D366]" />
            </a>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Spacer for bottom nav on mobile */}
      <div
        className="md:hidden"
        style={{
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}
      />
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Eye,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Share2,
  MessageCircle,
  Mail,
  Send,
  Check,
  Loader2,
  X,
  Home,
  ShoppingCart,
} from 'lucide-react';

// Bilingual translations for shared components
const sharedTranslations = {
  quickView: { en: 'Quick View', es: 'Vista Rapida' },
  addToQuote: { en: 'Add to Quote', es: 'Agregar a Cotizacion' },
  viewDetails: { en: 'View Details', es: 'Ver Detalles' },
  relatedProducts: { en: 'Related Products', es: 'Productos Relacionados' },
  youMayAlsoNeed: { en: 'You May Also Need', es: 'Tambien Puede Necesitar' },
  share: { en: 'Share', es: 'Compartir' },
  shareViaWhatsApp: { en: 'Share via WhatsApp', es: 'Compartir por WhatsApp' },
  shareViaEmail: { en: 'Share via Email', es: 'Compartir por Email' },
  copyLink: { en: 'Copy Link', es: 'Copiar Enlace' },
  linkCopied: { en: 'Link Copied!', es: 'Enlace Copiado!' },
  home: { en: 'Home', es: 'Inicio' },
  products: { en: 'Products', es: 'Productos' },
  getQuote: { en: 'Get Quote', es: 'Solicitar Cotizacion' },
  quickQuote: { en: 'Quick Quote', es: 'Cotizacion Rapida' },
  quickQuoteDesc: { en: 'Fill in your details and we will contact you within 2 hours', es: 'Complete sus datos y le contactaremos en 2 horas' },
  email: { en: 'Your email', es: 'Su correo electronico' },
  company: { en: 'Company / Project', es: 'Empresa / Proyecto' },
  requirements: { en: 'Your requirements...', es: 'Sus necesidades...' },
  submit: { en: 'Send Request', es: 'Enviar Solicitud' },
  submitting: { en: 'Sending...', es: 'Enviando...' },
  success: { en: 'Request sent! We will contact you shortly.', es: 'Solicitud enviada! Le contactaremos pronto.' },
  techSpecs: { en: 'Technical Specifications', es: 'Especificaciones Tecnicas' },
  materials: { en: 'Available in:', es: 'Disponible en:' },
  explore: { en: 'Explore', es: 'Explorar' },
  seeAll: { en: 'See All', es: 'Ver Todos' },
};

// ============ BREADCRUMB NAVIGATION ============
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { language } = useLanguage();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-slate-400 mb-8"
    >
      <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
        <span className="sr-only md:not-sr-only">
          {sharedTranslations.home[language as 'en' | 'es']}
        </span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-inox-teal">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============ JSON-LD STRUCTURED DATA ============
interface ProductStructuredData {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  category: string;
  offers?: {
    availability: string;
    priceCurrency?: string;
  };
}

export function ProductJsonLd({ products, pageTitle, pageDescription, pageUrl }: {
  products: ProductStructuredData[];
  pageTitle: string;
  pageDescription: string;
  pageUrl: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": pageUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image,
          "brand": product.brand ? {
            "@type": "Brand",
            "name": product.brand
          } : undefined,
          "category": product.category,
          "offers": product.offers ? {
            "@type": "Offer",
            "availability": product.offers.availability,
            "priceCurrency": product.offers.priceCurrency || "EUR"
          } : undefined
        }
      }))
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// ============ META TAGS COMPONENT ============
export function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website'
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: string;
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateNameMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateNameMeta('description', description);
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', url);
    updateMeta('og:type', type);
    if (image) {
      updateMeta('og:image', image);
    }

    // Twitter cards
    updateNameMeta('twitter:card', 'summary_large_image');
    updateNameMeta('twitter:title', title);
    updateNameMeta('twitter:description', description);
    if (image) {
      updateNameMeta('twitter:image', image);
    }
  }, [title, description, image, url, type]);

  return null;
}

// ============ STICKY CATEGORY NAVIGATION ============
export interface CategoryNavItem {
  id: string;
  label: { en: string; es: string };
  icon?: React.ReactNode;
}

export function StickyCategoryNav({
  categories,
  activeCategory,
  onCategoryClick
}: {
  categories: CategoryNavItem[];
  activeCategory: string;
  onCategoryClick: (id: string) => void;
}) {
  const { language } = useLanguage();
  const navRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={navRef}
      className={`sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 ${
        isSticky ? 'shadow-md' : ''
      }`}
    >
      <div className="container">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-inox-teal text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category.icon}
              {category.label[language as 'en' | 'es']}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ PRODUCT CARD SKELETON ============
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ============ LAZY LOADING IMAGE ============
export function LazyImage({
  src,
  alt,
  className,
  fallback
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {!loaded && <Skeleton className={className} />}
      <img
        ref={imgRef}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}

// ============ ENHANCED PRODUCT CARD ============
export interface ProductCardData {
  id: string;
  standard: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  materials: string[];
  image: string;
  searchQuery: string;
  specs?: { label: { en: string; es: string }; value: string }[];
}

interface EnhancedProductCardProps {
  product: ProductCardData;
  onQuickView?: (product: ProductCardData) => void;
  onAddToQuote?: (product: ProductCardData) => void;
}

export function EnhancedProductCard({
  product,
  onQuickView,
  onAddToQuote
}: EnhancedProductCardProps) {
  const { language } = useLanguage();
  const t = (key: keyof typeof sharedTranslations) =>
    sharedTranslations[key][language as 'en' | 'es'];
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-inox-teal/30 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0" />
        )}
        <img
          src={product.image}
          alt={product.name[language as 'en' | 'es']}
          className={`w-24 h-24 object-contain transition-all duration-300 ${
            imageLoaded ? 'opacity-60 group-hover:opacity-100 group-hover:scale-110' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-slate-900 text-white text-xs">
            {product.standard}
          </Badge>
        </div>

        {/* Hover Actions */}
        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-slate-100 text-slate-900"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView?.(product);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('quickView')}
          </Button>
          <Button
            size="sm"
            className="bg-inox-teal hover:bg-inox-blue text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToQuote?.(product);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('addToQuote')}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-inox-blue transition-colors">
          {product.name[language as 'en' | 'es']}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {product.description[language as 'en' | 'es']}
        </p>

        {/* Materials */}
        <div className="mb-4">
          <span className="text-xs text-slate-400 block mb-2">
            {t('materials')}
          </span>
          <div className="flex flex-wrap gap-1">
            {product.materials.map((material) => (
              <Badge
                key={material}
                variant="outline"
                className="text-xs bg-inox-teal/5 text-inox-teal border-inox-teal/20"
              >
                {material}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/search?q=${encodeURIComponent(product.searchQuery)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-inox-teal hover:text-inox-blue transition-colors group/link"
        >
          {t('explore')}
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ============ QUICK VIEW MODAL ============
interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductCardData | null;
  onAddToQuote?: (product: ProductCardData) => void;
}

export function QuickViewModal({ open, onClose, product, onAddToQuote }: QuickViewModalProps) {
  const { language } = useLanguage();
  const t = (key: keyof typeof sharedTranslations) =>
    sharedTranslations[key][language as 'en' | 'es'];

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-900 text-white text-xs">
              {product.standard}
            </Badge>
            {product.name[language as 'en' | 'es']}
          </DialogTitle>
          <DialogDescription>
            {product.description[language as 'en' | 'es']}
          </DialogDescription>
        </DialogHeader>

        {/* Product Image */}
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name[language as 'en' | 'es']}
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* Materials */}
        <div>
          <span className="text-sm text-slate-500 block mb-2">{t('materials')}</span>
          <div className="flex flex-wrap gap-2">
            {product.materials.map((material) => (
              <Badge
                key={material}
                variant="outline"
                className="text-sm bg-inox-teal/5 text-inox-teal border-inox-teal/20"
              >
                {material}
              </Badge>
            ))}
          </div>
        </div>

        {/* Technical Specs */}
        {product.specs && product.specs.length > 0 && (
          <div>
            <span className="text-sm text-slate-500 block mb-2">{t('techSpecs')}</span>
            <div className="grid grid-cols-2 gap-2">
              {product.specs.map((spec, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">
                    {spec.label[language as 'en' | 'es']}
                  </div>
                  <div className="font-semibold text-slate-900">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              onAddToQuote?.(product);
              onClose();
            }}
            className="w-full sm:w-auto bg-inox-teal hover:bg-inox-blue"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addToQuote')}
          </Button>
          <Link href={`/search?q=${encodeURIComponent(product.searchQuery)}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              {t('viewDetails')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ QUICK QUOTE MODAL ============
interface QuickQuoteModalProps {
  open: boolean;
  onClose: () => void;
  products: ProductCardData[];
  category: string;
}

export function QuickQuoteModal({ open, onClose, products, category }: QuickQuoteModalProps) {
  const { language } = useLanguage();
  const t = (key: keyof typeof sharedTranslations) =>
    sharedTranslations[key][language as 'en' | 'es'];

  const [formData, setFormData] = useState({
    email: '',
    company: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({ email: '', company: '', requirements: '' });
      onClose();
    }, 2000);
  };

  const productList = products.map(p => p.name[language as 'en' | 'es']).join(', ');

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-inox-teal" />
            {t('quickQuote')}
          </SheetTitle>
          <SheetDescription>{t('quickQuoteDesc')}</SheetDescription>
        </SheetHeader>

        {/* Selected Products */}
        {products.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-slate-500 mb-2">
              {language === 'es' ? 'Productos seleccionados:' : 'Selected products:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <Badge key={product.id} variant="outline" className="text-xs">
                  {product.standard}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900">{t('success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-inox-teal/10 rounded-lg border border-inox-teal/20 w-fit">
              <span className="text-sm font-medium text-inox-teal">{category}</span>
            </div>

            <div>
              <Input
                type="email"
                placeholder={t('email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder={t('company')}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Textarea
                placeholder={t('requirements')}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-inox-orange hover:bg-orange-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('submit')}
                </>
              )}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============ FLOATING GET QUOTE BUTTON (MOBILE) ============
export function FloatingQuoteButton({ onClick }: { onClick: () => void }) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 md:hidden px-6 py-3 bg-inox-orange text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <ShoppingCart className="w-5 h-5" />
      {sharedTranslations.getQuote[language as 'en' | 'es']}
    </button>
  );
}

// ============ SHARE PRODUCT ============
interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
}

export function ShareButton({ title, url, description }: ShareButtonProps) {
  const { language } = useLanguage();
  const t = (key: keyof typeof sharedTranslations) =>
    sharedTranslations[key][language as 'en' | 'es'];
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareViaWhatsApp = () => {
    const text = `${title}${description ? '\n' + description : ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = title;
    const body = `${description || ''}\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        {t('share')}
      </Button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          <button
            onClick={shareViaWhatsApp}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            {t('shareViaWhatsApp')}
          </button>
          <button
            onClick={shareViaEmail}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            {t('shareViaEmail')}
          </button>
          <button
            onClick={copyLink}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                {t('linkCopied')}
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                {t('copyLink')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============ COLLAPSIBLE SPECS SECTION (MOBILE) ============
interface CollapsibleSpecsProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSpecs({ title, children, defaultOpen = false }: CollapsibleSpecsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <span className="font-semibold text-slate-900">{title}</span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 px-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============ RELATED PRODUCTS SECTION ============
interface RelatedProductsProps {
  title: string;
  products: {
    name: { en: string; es: string };
    href: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-slate-50">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link
              key={index}
              href={product.href}
              className="group bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-inox-teal/30 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-inox-teal/10 text-inox-teal rounded-xl flex items-center justify-center mb-4 group-hover:bg-inox-teal group-hover:text-white transition-colors">
                {product.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-inox-teal transition-colors">
                {product.name[language as 'en' | 'es']}
              </h3>
              {product.badge && (
                <Badge variant="outline" className="text-xs">
                  {product.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CROSS-LINK BANNER ============
interface CrossLinkBannerProps {
  title: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  ctaText: { en: string; es: string };
  icon: React.ReactNode;
  bgColor?: string;
}

export function CrossLinkBanner({
  title,
  description,
  href,
  ctaText,
  icon,
  bgColor = 'bg-gradient-to-r from-inox-blue to-inox-teal'
}: CrossLinkBannerProps) {
  const { language } = useLanguage();

  return (
    <section className={`py-12 ${bgColor} text-white`}>
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">
                {title[language as 'en' | 'es']}
              </h3>
              <p className="text-white/80">
                {description[language as 'en' | 'es']}
              </p>
            </div>
          </div>
          <Link href={href}>
            <Button
              variant="secondary"
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg rounded-full"
            >
              {ctaText[language as 'en' | 'es']}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============ MOBILE PRODUCT CAROUSEL ============
interface MobileProductCarouselProps {
  products: ProductCardData[];
  onQuickView?: (product: ProductCardData) => void;
  onAddToQuote?: (product: ProductCardData) => void;
}

export function MobileProductCarousel({
  products,
  onQuickView,
  onAddToQuote
}: MobileProductCarouselProps) {
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      setCurrentIndex(Math.round(scrollPosition / cardWidth));
    }
  };

  return (
    <div className="md:hidden relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[calc(100vw-3rem)] snap-center"
          >
            <EnhancedProductCard
              product={product}
              onQuickView={onQuickView}
              onAddToQuote={onAddToQuote}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-inox-teal' : 'bg-slate-300'
            }`}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: index * scrollRef.current.offsetWidth,
                  behavior: 'smooth'
                });
              }
            }}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10 ${
          currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
        }`}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10 ${
          currentIndex === products.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
        }`}
        disabled={currentIndex === products.length - 1}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============ INTERSECTION OBSERVER HOOK ============
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

// ============ ACTIVE SECTION TRACKER ============
export function useActiveSectionTracker(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          },
          { rootMargin: '-50% 0px -50% 0px' }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sectionIds]);

  return activeSection;
}

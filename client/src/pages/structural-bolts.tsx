import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Truck,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Package,
  CheckCircle2,
  Factory,
  HardHat,
  Globe,
  MessageCircle,
  Send,
  Award,
  Gauge,
  Settings,
  CircleDot,
  Ruler,
  Anchor,
  Droplets,
  Eye,
  Plus,
} from 'lucide-react';

// Import shared components
import {
  Breadcrumbs,
  MetaTags,
  ProductJsonLd,
  StickyCategoryNav,
  EnhancedProductCard,
  ProductCardSkeleton,
  QuickViewModal,
  QuickQuoteModal,
  FloatingQuoteButton,
  ShareButton,
  CollapsibleSpecs,
  RelatedProducts,
  CrossLinkBanner,
  MobileProductCarousel,
  useActiveSectionTracker,
  type ProductCardData,
  type CategoryNavItem,
} from '@/components/product-family/ProductFamilyComponents';

// Translations for the structural bolts page
const translations = {
  meta: {
    title: {
      en: 'Structural Bolts & High-Strength Fasteners | InoxBolt - 8.8/10.9/12.9 Grade',
      es: 'Tornillos Estructurales de Alta Resistencia | InoxBolt - Clase 8.8/10.9/12.9',
    },
    description: {
      en: 'Premium high-strength structural fasteners 8.8, 10.9, 12.9 grade for steel construction, bridges, and industrial applications. DIN/ISO certified. Fast delivery Spain.',
      es: 'Tornilleria estructural de alta resistencia clases 8.8, 10.9, 12.9 para construccion metalica, puentes y aplicaciones industriales. Certificacion DIN/ISO. Entrega rapida.',
    },
  },
  hero: {
    title: {
      en: 'Structural Bolts & High-Strength Fasteners',
      es: 'Tornillos Estructurales de Alta Resistencia',
    },
    subtitle: {
      en: 'Premium fasteners for construction, steel structures, and heavy-duty industrial applications',
      es: 'Fijaciones premium para construccion, estructuras de acero y aplicaciones industriales pesadas',
    },
  },
  intro: {
    title: {
      en: 'High-Strength Structural Fastening Solutions',
      es: 'Soluciones de Fijacion Estructural de Alta Resistencia',
    },
    p1: {
      en: 'Our structural bolt range covers the most demanding applications in steel construction, bridge building, and heavy machinery. Available in strength grades 8.8, 10.9, and 12.9, these fasteners meet the highest European standards for structural integrity and safety.',
      es: 'Nuestra gama de tornillos estructurales cubre las aplicaciones mas exigentes en construccion de acero, puentes y maquinaria pesada. Disponibles en clases de resistencia 8.8, 10.9 y 12.9, estos elementos de fijacion cumplen los estandares europeos mas exigentes en integridad estructural y seguridad.',
    },
    p2: {
      en: 'All products are certified to DIN/ISO standards with full traceability and test certificates available. Surface treatments include hot-dip galvanizing, zinc flake coating (Geomet/Dacromet), and phosphate finishes for optimal corrosion protection.',
      es: 'Todos los productos estan certificados segun normas DIN/ISO con trazabilidad completa y certificados de ensayo disponibles. Los tratamientos superficiales incluyen galvanizado en caliente, recubrimiento de zinc laminar (Geomet/Dacromet) y acabados fosfatados para una proteccion optima contra la corrosion.',
    },
  },
  products: {
    title: {
      en: 'Key Product Lines',
      es: 'Lineas de Producto Principales',
    },
    viewAll: {
      en: 'View All Products',
      es: 'Ver Todos los Productos',
    },
    gradesAvailable: {
      en: 'Grades',
      es: 'Clases',
    },
    finishes: {
      en: 'Finishes',
      es: 'Acabados',
    },
  },
  technical: {
    title: {
      en: 'Technical Specifications',
      es: 'Especificaciones Tecnicas',
    },
    strengthComparison: {
      en: 'Strength Grade Comparison',
      es: 'Comparacion de Clases de Resistencia',
    },
    torqueSpecs: {
      en: 'Torque & Pre-load Values',
      es: 'Valores de Par y Precarga',
    },
    coatings: {
      en: 'Surface Coating Options',
      es: 'Opciones de Recubrimiento',
    },
  },
  applications: {
    title: {
      en: 'Applications',
      es: 'Aplicaciones',
    },
    steel: {
      title: { en: 'Steel Frame Construction', es: 'Construccion con Estructura de Acero' },
      desc: { en: 'Primary connections in steel buildings, warehouses, and industrial facilities', es: 'Conexiones principales en edificios de acero, naves y instalaciones industriales' },
    },
    bridges: {
      title: { en: 'Bridge Building', es: 'Construccion de Puentes' },
      desc: { en: 'High-strength connections for road, rail, and pedestrian bridges', es: 'Conexiones de alta resistencia para puentes de carretera, ferrocarril y peatonales' },
    },
    machinery: {
      title: { en: 'Industrial Machinery', es: 'Maquinaria Industrial' },
      desc: { en: 'Heavy equipment assembly and mechanical engineering applications', es: 'Montaje de equipos pesados y aplicaciones de ingenieria mecanica' },
    },
    automotive: {
      title: { en: 'Automotive & Transport', es: 'Automocion y Transporte' },
      desc: { en: 'Chassis, suspension, and structural components for vehicles', es: 'Chasis, suspension y componentes estructurales para vehiculos' },
    },
  },
  logistics: {
    title: {
      en: 'Stock & Delivery',
      es: 'Stock y Entrega',
    },
    stock: {
      title: { en: 'Large Stock Availability', es: 'Gran Disponibilidad de Stock' },
      desc: { en: 'Over 500,000 structural fasteners in stock for immediate dispatch', es: 'Mas de 500.000 fijaciones estructurales en stock para envio inmediato' },
    },
    discount: {
      title: { en: 'Volume Discounts', es: 'Descuentos por Volumen' },
      desc: { en: 'Competitive pricing for large project quantities - request a quote', es: 'Precios competitivos para grandes cantidades de proyecto - solicite presupuesto' },
    },
    delivery: {
      title: { en: 'Fast Delivery', es: 'Entrega Rapida' },
      desc: { en: '24-48h to mainland Spain, weekly shipments to Canary Islands', es: '24-48h a peninsula, envios semanales a Canarias' },
    },
  },
  quote: {
    title: {
      en: 'Request a Quote',
      es: 'Solicitar Presupuesto',
    },
    desc: {
      en: 'Get competitive pricing for your structural fastener requirements',
      es: 'Obtenga precios competitivos para sus necesidades de fijacion estructural',
    },
    email: { en: 'Email', es: 'Correo electronico' },
    company: { en: 'Company', es: 'Empresa' },
    message: { en: 'Requirements', es: 'Requisitos' },
    messagePlaceholder: {
      en: 'Describe your project requirements: quantities, sizes, grades, delivery location...',
      es: 'Describa sus requisitos de proyecto: cantidades, medidas, clases, lugar de entrega...',
    },
    submit: { en: 'Send Quote Request', es: 'Enviar Solicitud' },
    category: { en: 'Category', es: 'Categoria' },
    success: { en: 'Request sent! We will contact you within 24-48 hours.', es: '¡Solicitud enviada! Le contactaremos en 24-48 horas.' },
  },
  table: {
    grade: { en: 'Grade', es: 'Clase' },
    tensileStrength: { en: 'Tensile Strength', es: 'Resistencia a Traccion' },
    yieldStrength: { en: 'Yield Strength', es: 'Limite Elastico' },
    elongation: { en: 'Elongation', es: 'Alargamiento' },
    applications: { en: 'Typical Applications', es: 'Aplicaciones Tipicas' },
    size: { en: 'Size', es: 'Medida' },
    torque: { en: 'Torque (Nm)', es: 'Par (Nm)' },
    preload: { en: 'Preload (kN)', es: 'Precarga (kN)' },
    coating: { en: 'Coating', es: 'Recubrimiento' },
    thickness: { en: 'Thickness', es: 'Espesor' },
    corrosionResistance: { en: 'Corrosion Resistance', es: 'Resistencia a Corrosion' },
    color: { en: 'Color', es: 'Color' },
  },
  categories: {
    all: { en: 'All Products', es: 'Todos' },
    bolts: { en: 'Hex Bolts', es: 'Tornillos Hex' },
    hvSets: { en: 'HV Sets', es: 'Conjuntos HV' },
    nuts: { en: 'Nuts', es: 'Tuercas' },
    washers: { en: 'Washers', es: 'Arandelas' },
  },
  related: {
    title: { en: 'Complete Your Assembly', es: 'Complete Su Montaje' },
  },
};

// Category navigation items
const categories: CategoryNavItem[] = [
  { id: 'all', label: { en: 'All Products', es: 'Todos' }, icon: <Wrench className="w-4 h-4" /> },
  { id: 'bolts', label: { en: 'Hex Bolts', es: 'Tornillos Hex' }, icon: <Settings className="w-4 h-4" /> },
  { id: 'hvSets', label: { en: 'HV Sets', es: 'Conjuntos HV' }, icon: <Package className="w-4 h-4" /> },
  { id: 'nuts', label: { en: 'Nuts', es: 'Tuercas' }, icon: <CircleDot className="w-4 h-4" /> },
  { id: 'washers', label: { en: 'Washers', es: 'Arandelas' }, icon: <CircleDot className="w-4 h-4" /> },
];

// Product data with enhanced structure for ProductCardData
const products: ProductCardData[] = [
  {
    id: 'din-931',
    standard: 'DIN 931 / ISO 4014',
    name: { en: 'Hex Head Bolts (Partial Thread)', es: 'Tornillos Hexagonales (Rosca Parcial)' },
    description: {
      en: 'Partially threaded hex bolts for structural shear connections',
      es: 'Tornillos hexagonales de rosca parcial para conexiones estructurales a cortante',
    },
    materials: ['8.8', '10.9', '12.9'],
    image: '/images/products/hex-bolt-partial.jpg',
    searchQuery: 'DIN 931 structural',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M6-M64' },
      { label: { en: 'Length', es: 'Longitud' }, value: '30-500mm' },
    ],
  },
  {
    id: 'din-933',
    standard: 'DIN 933 / ISO 4017',
    name: { en: 'Hex Head Bolts (Full Thread)', es: 'Tornillos Hexagonales (Rosca Completa)' },
    description: {
      en: 'Fully threaded hex bolts for general structural applications',
      es: 'Tornillos hexagonales de rosca completa para aplicaciones estructurales generales',
    },
    materials: ['8.8', '10.9', '12.9'],
    image: '/images/products/hex-bolt-full.jpg',
    searchQuery: 'DIN 933 structural',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M6-M48' },
      { label: { en: 'Length', es: 'Longitud' }, value: '10-300mm' },
    ],
  },
  {
    id: 'din-912',
    standard: 'DIN 912 / ISO 4762',
    name: { en: 'Socket Head Cap Screws', es: 'Tornillos Allen Cilindricos' },
    description: {
      en: 'Internal hex drive for precision structural assemblies',
      es: 'Cabeza con hexagono interior para montajes estructurales de precision',
    },
    materials: ['10.9', '12.9'],
    image: '/images/products/socket-cap.jpg',
    searchQuery: 'DIN 912 high strength',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M3-M36' },
      { label: { en: 'Length', es: 'Longitud' }, value: '6-200mm' },
    ],
  },
  {
    id: 'din-6914',
    standard: 'DIN 6914',
    name: { en: 'HV Structural Hex Bolts', es: 'Tornillos Hexagonales Estructurales HV' },
    description: {
      en: 'High-strength preload bolts for structural steel connections',
      es: 'Tornillos de alta resistencia con precarga para conexiones de acero estructural',
    },
    materials: ['10.9'],
    image: '/images/products/hv-bolt.jpg',
    searchQuery: 'DIN 6914 HV bolt',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M12-M36' },
      { label: { en: 'Coating', es: 'Acabado' }, value: 'HDG/Geomet' },
    ],
  },
  {
    id: 'din-6915',
    standard: 'DIN 6915',
    name: { en: 'HV Structural Hex Nuts', es: 'Tuercas Hexagonales Estructurales HV' },
    description: {
      en: 'High-strength nuts designed for use with DIN 6914 bolts',
      es: 'Tuercas de alta resistencia disenadas para uso con tornillos DIN 6914',
    },
    materials: ['10'],
    image: '/images/products/hv-nut.jpg',
    searchQuery: 'DIN 6915 HV nut',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M12-M36' },
      { label: { en: 'Type', es: 'Tipo' }, value: 'HV Structural' },
    ],
  },
  {
    id: 'din-6916',
    standard: 'DIN 6916',
    name: { en: 'HV Structural Washers', es: 'Arandelas Estructurales HV' },
    description: {
      en: 'Hardened washers for HV structural bolt sets',
      es: 'Arandelas endurecidas para conjuntos de tornillos estructurales HV',
    },
    materials: ['300HV'],
    image: '/images/products/hv-washer.jpg',
    searchQuery: 'DIN 6916 HV washer',
    specs: [
      { label: { en: 'Size', es: 'Medida' }, value: 'M12-M36' },
      { label: { en: 'Hardness', es: 'Dureza' }, value: '300-370 HV' },
    ],
  },
  {
    id: 'din-7990',
    standard: 'DIN 7990',
    name: { en: 'Hexagon Fit Bolts for Steel Structures', es: 'Tornillos de Ajuste para Estructuras de Acero' },
    description: {
      en: 'Fit bolts for accurate hole-to-bolt clearance in steel structures',
      es: 'Tornillos de ajuste para tolerancia precisa entre agujero y tornillo en estructuras de acero',
    },
    materials: ['8.8', '10.9'],
    image: '/images/products/fit-bolt.jpg',
    searchQuery: 'DIN 7990 fit bolt',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M12-M30' },
      { label: { en: 'Fit', es: 'Ajuste' }, value: 'h11' },
    ],
  },
  {
    id: 'din-934-structural',
    standard: 'DIN 934 Class 8/10',
    name: { en: 'Structural Hex Nuts', es: 'Tuercas Hexagonales Estructurales' },
    description: {
      en: 'High-strength hex nuts for structural bolted connections',
      es: 'Tuercas hexagonales de alta resistencia para conexiones estructurales atornilladas',
    },
    materials: ['8', '10'],
    image: '/images/products/structural-nut.jpg',
    searchQuery: 'DIN 934 class 10',
    specs: [
      { label: { en: 'Thread', es: 'Rosca' }, value: 'M6-M64' },
      { label: { en: 'Class', es: 'Clase' }, value: '8/10' },
    ],
  },
];

// Map products to categories
const productCategories: Record<string, string[]> = {
  bolts: ['din-931', 'din-933', 'din-912', 'din-7990'],
  hvSets: ['din-6914', 'din-6915', 'din-6916'],
  nuts: ['din-934-structural'],
  washers: ['din-6916'],
};

// Strength grade comparison data
const strengthGrades = [
  {
    grade: '8.8',
    tensile: '800 MPa',
    yield: '640 MPa',
    elongation: '12%',
    applications: { en: 'General structural, machinery', es: 'Estructural general, maquinaria' },
  },
  {
    grade: '10.9',
    tensile: '1040 MPa',
    yield: '940 MPa',
    elongation: '9%',
    applications: { en: 'High-strength joints, bridges', es: 'Uniones alta resistencia, puentes' },
  },
  {
    grade: '12.9',
    tensile: '1220 MPa',
    yield: '1100 MPa',
    elongation: '8%',
    applications: { en: 'Critical connections, aerospace', es: 'Conexiones criticas, aeroespacial' },
  },
];

// Torque specifications (example for M16)
const torqueSpecs = [
  { size: 'M10', torque88: '45', torque109: '63', torque129: '74', preload88: '27', preload109: '38', preload129: '44' },
  { size: 'M12', torque88: '79', torque109: '110', torque129: '130', preload88: '39', preload109: '55', preload129: '64' },
  { size: 'M16', torque88: '190', torque109: '265', torque129: '310', preload88: '72', preload109: '100', preload129: '117' },
  { size: 'M20', torque88: '375', torque109: '520', torque129: '610', preload88: '113', preload109: '157', preload129: '184' },
  { size: 'M24', torque88: '650', torque109: '900', torque129: '1050', preload88: '163', preload109: '226', preload129: '265' },
];

// Coating options
const coatings = [
  {
    name: { en: 'Hot-Dip Galvanized (HDG)', es: 'Galvanizado en Caliente (HDG)' },
    thickness: '45-85 um',
    resistance: { en: 'Excellent', es: 'Excelente' },
    color: { en: 'Silver-grey', es: 'Gris plateado' },
  },
  {
    name: { en: 'Zinc Flake (Geomet)', es: 'Zinc Laminar (Geomet)' },
    thickness: '8-15 um',
    resistance: { en: 'Very Good', es: 'Muy Buena' },
    color: { en: 'Silver', es: 'Plateado' },
  },
  {
    name: { en: 'Electroplated Zinc', es: 'Zincado Electrolitico' },
    thickness: '5-12 um',
    resistance: { en: 'Good', es: 'Buena' },
    color: { en: 'Bright/Yellow', es: 'Brillante/Amarillo' },
  },
  {
    name: { en: 'Phosphate', es: 'Fosfatado' },
    thickness: '2-5 um',
    resistance: { en: 'Moderate', es: 'Moderada' },
    color: { en: 'Dark grey/Black', es: 'Gris oscuro/Negro' },
  },
];

// Related products for cross-linking
const relatedProducts = [
  {
    name: { en: 'DIN 6915 HV Nuts', es: 'Tuercas HV DIN 6915' },
    href: '/search?q=DIN6915+HV',
    icon: <CircleDot className="w-6 h-6" />,
    badge: 'Class 10',
  },
  {
    name: { en: 'DIN 6916 HV Washers', es: 'Arandelas HV DIN 6916' },
    href: '/search?q=DIN6916+HV',
    icon: <CircleDot className="w-6 h-6" />,
    badge: '300HV',
  },
  {
    name: { en: 'Anchor Bolts', es: 'Pernos de Anclaje' },
    href: '/search?q=anchor+bolt',
    icon: <Anchor className="w-6 h-6" />,
    badge: 'HDG',
  },
  {
    name: { en: 'Threaded Rods Class 8.8', es: 'Varillas Roscadas Clase 8.8' },
    href: '/search?q=DIN976+8.8',
    icon: <Ruler className="w-6 h-6" />,
    badge: '1m-3m',
  },
];

export default function StructuralBoltsPage() {
  const { language } = useLanguage();

  // State
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteProducts, setQuoteProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Section refs for tracking
  const sectionIds = ['products', 'technical', 'applications', 'logistics', 'quote'];
  const activeSection = useActiveSectionTracker(sectionIds);

  const t = (key: keyof typeof translations, subKey?: string, subSubKey?: string): string => {
    const section = translations[key] as Record<string, unknown>;
    if (subKey && subSubKey && section[subKey]) {
      const subSection = section[subKey] as Record<string, Record<'en' | 'es', string>>;
      if (subSection[subSubKey]) {
        return subSection[subSubKey][language] || subSection[subSubKey].en;
      }
    }
    if (subKey && section[subKey]) {
      const value = section[subKey] as Record<'en' | 'es', string>;
      if (typeof value === 'object' && 'en' in value) {
        return value[language] || value.en;
      }
    }
    return '';
  };

  // Filter products by category
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => productCategories[activeCategory]?.includes(p.id));

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 150;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
    setActiveCategory(id);
  };

  // Handle adding product to quote
  const handleAddToQuote = (product: ProductCardData) => {
    if (!quoteProducts.find((p) => p.id === product.id)) {
      setQuoteProducts([...quoteProducts, product]);
    }
    setQuoteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ email: '', company: '', message: '' });

    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://inoxbolt.es/structural-bolts';

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* SEO Meta Tags */}
      <MetaTags
        title={t('meta', 'title')}
        description={t('meta', 'description')}
        image="/images/og/structural-bolts.jpg"
        url={pageUrl}
      />

      {/* JSON-LD Structured Data */}
      <ProductJsonLd
        products={products.map((p) => ({
          name: p.name[language as 'en' | 'es'],
          description: p.description[language as 'en' | 'es'],
          image: p.image,
          brand: 'InoxBolt',
          category: 'Structural Bolts & High-Strength Fasteners',
          offers: {
            availability: 'https://schema.org/InStock',
            priceCurrency: 'EUR',
          },
        }))}
        pageTitle={t('meta', 'title')}
        pageDescription={t('meta', 'description')}
        pageUrl={pageUrl}
      />

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumb */}
              <div className="mb-8">
                <Breadcrumbs
                  items={[
                    { label: language === 'es' ? 'Productos' : 'Products', href: '/search' },
                    { label: t('hero', 'title') },
                  ]}
                />
              </div>

              <Badge className="mb-6 bg-inox-teal/20 text-inox-teal border-inox-teal/30 hover:bg-inox-teal/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                DIN/ISO Certified
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight">
                {t('hero', 'title')}
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
                {t('hero', 'subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/search?category=structural">
                  <Button className="bg-inox-orange hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-orange-500/20">
                    {language === 'es' ? 'Explorar Productos' : 'Explore Products'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#quote">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full">
                    {language === 'es' ? 'Solicitar Presupuesto' : 'Request Quote'}
                  </Button>
                </a>
              </div>

              {/* Share button */}
              <div className="mt-8 flex justify-center">
                <ShareButton
                  title={t('meta', 'title')}
                  url={pageUrl}
                  description={t('meta', 'description')}
                />
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Sticky Category Navigation */}
        <StickyCategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={scrollToSection}
        />

        {/* Introduction Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-inox-teal/10 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-inox-teal" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                  {t('intro', 'title')}
                </h2>
              </div>

              <div className="prose prose-lg max-w-none text-slate-600">
                <p className="mb-6 leading-relaxed">
                  {t('intro', 'p1')}
                </p>
                <p className="leading-relaxed">
                  {t('intro', 'p2')}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-inox-teal mb-2">8.8-12.9</div>
                  <div className="text-sm text-slate-600">{language === 'es' ? 'Clases de Resistencia' : 'Strength Grades'}</div>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-inox-teal mb-2">DIN/ISO</div>
                  <div className="text-sm text-slate-600">{language === 'es' ? 'Certificacion' : 'Certification'}</div>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-inox-teal mb-2">M6-M64</div>
                  <div className="text-sm text-slate-600">{language === 'es' ? 'Rango de Medidas' : 'Size Range'}</div>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="text-3xl font-bold text-inox-teal mb-2">500k+</div>
                  <div className="text-sm text-slate-600">{language === 'es' ? 'En Stock' : 'In Stock'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Lines Grid */}
        <section id="products" className="py-20 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('products', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            {/* Mobile Carousel */}
            <MobileProductCarousel
              products={filteredProducts}
              onQuickView={setQuickViewProduct}
              onAddToQuote={handleAddToQuote}
            />

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filteredProducts.map((product) => (
                    <EnhancedProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onAddToQuote={handleAddToQuote}
                    />
                  ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                href="/search?category=structural"
                className="inline-flex items-center gap-3 px-8 py-4 bg-inox-teal text-white font-semibold rounded-full shadow-lg shadow-inox-teal/20 hover:bg-inox-blue hover:scale-105 transition-all duration-300"
              >
                {t('products', 'viewAll')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section id="technical" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('technical', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="space-y-16">
              {/* Strength Grade Comparison - Desktop */}
              <div className="hidden md:block">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-inox-teal" />
                  {t('technical', 'strengthComparison')}
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">{translations.table.grade[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.tensileStrength[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.yieldStrength[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.elongation[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.applications[language as 'en' | 'es']}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {strengthGrades.map((grade) => (
                        <TableRow key={grade.grade}>
                          <TableCell className="font-bold text-inox-teal">{grade.grade}</TableCell>
                          <TableCell>{grade.tensile}</TableCell>
                          <TableCell>{grade.yield}</TableCell>
                          <TableCell>{grade.elongation}</TableCell>
                          <TableCell className="text-slate-600">{grade.applications[language as 'en' | 'es']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Strength Grade Comparison - Mobile Collapsible */}
              <div className="md:hidden space-y-4">
                <CollapsibleSpecs title={t('technical', 'strengthComparison')} defaultOpen>
                  <div className="space-y-3">
                    {strengthGrades.map((grade) => (
                      <div key={grade.grade} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-inox-teal text-white">{grade.grade}</Badge>
                          <span className="font-semibold text-slate-900">{grade.tensile}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500 block">{translations.table.yieldStrength[language as 'en' | 'es']}</span>
                            <span className="font-medium">{grade.yield}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">{translations.table.elongation[language as 'en' | 'es']}</span>
                            <span className="font-medium">{grade.elongation}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          {grade.applications[language as 'en' | 'es']}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSpecs>
              </div>

              {/* Torque Specifications - Desktop */}
              <div className="hidden md:block">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-inox-teal" />
                  {t('technical', 'torqueSpecs')}
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold" rowSpan={2}>{translations.table.size[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold text-center" colSpan={3}>{translations.table.torque[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold text-center" colSpan={3}>{translations.table.preload[language as 'en' | 'es']}</TableHead>
                      </TableRow>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold text-center">8.8</TableHead>
                        <TableHead className="font-bold text-center">10.9</TableHead>
                        <TableHead className="font-bold text-center">12.9</TableHead>
                        <TableHead className="font-bold text-center">8.8</TableHead>
                        <TableHead className="font-bold text-center">10.9</TableHead>
                        <TableHead className="font-bold text-center">12.9</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {torqueSpecs.map((spec) => (
                        <TableRow key={spec.size}>
                          <TableCell className="font-bold">{spec.size}</TableCell>
                          <TableCell className="text-center">{spec.torque88}</TableCell>
                          <TableCell className="text-center">{spec.torque109}</TableCell>
                          <TableCell className="text-center">{spec.torque129}</TableCell>
                          <TableCell className="text-center">{spec.preload88}</TableCell>
                          <TableCell className="text-center">{spec.preload109}</TableCell>
                          <TableCell className="text-center">{spec.preload129}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  * {language === 'es'
                    ? 'Valores de referencia para tornillos con coeficiente de friccion mu = 0.12. Consultar especificaciones del fabricante.'
                    : 'Reference values for bolts with friction coefficient mu = 0.12. Consult manufacturer specifications.'}
                </p>
              </div>

              {/* Torque Specifications - Mobile Collapsible */}
              <div className="md:hidden">
                <CollapsibleSpecs title={t('technical', 'torqueSpecs')}>
                  <div className="space-y-3">
                    {torqueSpecs.map((spec) => (
                      <div key={spec.size} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="font-bold text-lg text-slate-900 mb-3">{spec.size}</div>
                        <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <div className="text-xs text-slate-500">8.8</div>
                            <div className="font-medium">{spec.torque88} Nm</div>
                          </div>
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <div className="text-xs text-slate-500">10.9</div>
                            <div className="font-medium">{spec.torque109} Nm</div>
                          </div>
                          <div className="bg-slate-50 rounded p-2 text-center">
                            <div className="text-xs text-slate-500">12.9</div>
                            <div className="font-medium">{spec.torque129} Nm</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSpecs>
              </div>

              {/* Coating Options - Desktop */}
              <div className="hidden md:block">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-inox-teal" />
                  {t('technical', 'coatings')}
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">{translations.table.coating[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.thickness[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.corrosionResistance[language as 'en' | 'es']}</TableHead>
                        <TableHead className="font-bold">{translations.table.color[language as 'en' | 'es']}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coatings.map((coating, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{coating.name[language as 'en' | 'es']}</TableCell>
                          <TableCell>{coating.thickness}</TableCell>
                          <TableCell>{coating.resistance[language as 'en' | 'es']}</TableCell>
                          <TableCell>{coating.color[language as 'en' | 'es']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Coating Options - Mobile Collapsible */}
              <div className="md:hidden">
                <CollapsibleSpecs title={t('technical', 'coatings')}>
                  <div className="space-y-3">
                    {coatings.map((coating, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="font-semibold text-slate-900 mb-2">
                          {coating.name[language as 'en' | 'es']}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500 block text-xs">{translations.table.thickness[language as 'en' | 'es']}</span>
                            <span className="font-medium">{coating.thickness}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">{translations.table.corrosionResistance[language as 'en' | 'es']}</span>
                            <span className="font-medium">{coating.resistance[language as 'en' | 'es']}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">{translations.table.color[language as 'en' | 'es']}</span>
                            <span className="font-medium">{coating.color[language as 'en' | 'es']}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSpecs>
              </div>
            </div>
          </div>
        </section>

        {/* Applications Section */}
        <section id="applications" className="py-20 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('applications', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.applications.steel.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {translations.applications.steel.desc[language as 'en' | 'es']}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.applications.bridges.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {translations.applications.bridges.desc[language as 'en' | 'es']}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <Factory className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.applications.machinery.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {translations.applications.machinery.desc[language as 'en' | 'es']}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <HardHat className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.applications.automotive.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {translations.applications.automotive.desc[language as 'en' | 'es']}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Logistics Info */}
        <section id="logistics" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('logistics', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-inox-teal/10 text-inox-teal rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.logistics.stock.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600">
                  {translations.logistics.stock.desc[language as 'en' | 'es']}
                </p>
              </div>

              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-inox-teal/10 text-inox-teal rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.logistics.discount.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600">
                  {translations.logistics.discount.desc[language as 'en' | 'es']}
                </p>
              </div>

              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-inox-teal/10 text-inox-teal rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {translations.logistics.delivery.title[language as 'en' | 'es']}
                </h3>
                <p className="text-slate-600">
                  {translations.logistics.delivery.desc[language as 'en' | 'es']}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <RelatedProducts
          title={translations.related.title[language as 'en' | 'es']}
          products={relatedProducts}
        />

        {/* Cross-Link to Stainless Steel */}
        <CrossLinkBanner
          title={{
            en: 'Need Corrosion Resistance?',
            es: 'Necesita Resistencia a la Corrosion?',
          }}
          description={{
            en: 'Explore our A2/A4 stainless steel fasteners for marine, food, and chemical applications.',
            es: 'Explore nuestra tornilleria de acero inoxidable A2/A4 para aplicaciones marinas, alimentarias y quimicas.',
          }}
          href="/stainless-fasteners"
          ctaText={{
            en: 'View Stainless Fasteners',
            es: 'Ver Tornilleria Inoxidable',
          }}
          icon={<Droplets className="w-8 h-8" />}
        />

        {/* Inline Quote Form */}
        <section id="quote" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {t('quote', 'title')}
                </h2>
                <p className="text-lg text-slate-300">
                  {t('quote', 'desc')}
                </p>
              </div>

              {submitSuccess ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">
                    {language === 'es' ? 'Solicitud Enviada' : 'Request Sent'}
                  </h3>
                  <p className="text-slate-300">
                    {t('quote', 'success')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {translations.quote.email[language as 'en' | 'es']} *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {translations.quote.company[language as 'en' | 'es']}
                      </label>
                      <Input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                        placeholder={language === 'es' ? 'Nombre de empresa' : 'Company name'}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {translations.quote.category[language as 'en' | 'es']}
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-inox-teal/20 rounded-lg border border-inox-teal/30 w-fit">
                      <Wrench className="w-4 h-4 text-inox-teal" />
                      <span className="text-sm font-medium text-inox-teal">
                        {language === 'es' ? 'Tornillos Estructurales' : 'Structural Bolts'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {translations.quote.message[language as 'en' | 'es']} *
                    </label>
                    <Textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                      placeholder={translations.quote.messagePlaceholder[language as 'en' | 'es']}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-inox-orange hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </span>
                          {language === 'es' ? 'Enviando...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {translations.quote.submit[language as 'en' | 'es']}
                        </>
                      )}
                    </Button>

                    <a
                      href="https://wa.me/34000000000?text=Hello%2C%20I%27m%20interested%20in%20structural%20bolts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Get Quote Button (Mobile) */}
      <FloatingQuoteButton onClick={() => setQuoteModalOpen(true)} />

      {/* Quick View Modal */}
      <QuickViewModal
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        onAddToQuote={handleAddToQuote}
      />

      {/* Quick Quote Modal */}
      <QuickQuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        products={quoteProducts}
        category={language === 'es' ? 'Tornillos Estructurales' : 'Structural Bolts'}
      />
    </div>
  );
}

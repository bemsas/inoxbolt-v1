import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Waves,
  Utensils,
  Building2,
  Factory,
  Truck,
  Clock,
  Package,
  CheckCircle,
  Loader2,
  ChevronRight,
  Thermometer,
  Droplets,
  Hexagon,
} from 'lucide-react';

// Translations for stainless fasteners page
const translations = {
  // Meta & Hero
  'stainless.meta.title': {
    en: 'Stainless Steel Fasteners | InoxBolt - A2/A4 Grade Bolts & Screws',
    es: 'Tornilleria de Acero Inoxidable | InoxBolt - Pernos y Tornillos A2/A4',
  },
  'stainless.hero.title': {
    en: 'Stainless Steel Fasteners',
    es: 'Tornilleria de Acero Inoxidable',
  },
  'stainless.hero.subtitle': {
    en: 'Premium A2 & A4 grade fasteners for marine, food processing, chemical, and architectural applications. Maximum corrosion resistance for demanding environments.',
    es: 'Tornilleria de grado A2 y A4 premium para aplicaciones marinas, alimentarias, quimicas y arquitectonicas. Maxima resistencia a la corrosion para entornos exigentes.',
  },
  'stainless.hero.cta': {
    en: 'Request Quote',
    es: 'Solicitar Presupuesto',
  },
  'stainless.hero.browse': {
    en: 'Browse Products',
    es: 'Ver Productos',
  },

  // Introduction
  'stainless.intro.title': {
    en: 'Why Stainless Steel?',
    es: 'Por Que Acero Inoxidable?',
  },
  'stainless.intro.p1': {
    en: 'Stainless steel fasteners offer exceptional corrosion resistance, making them ideal for applications where exposure to moisture, chemicals, or salt is inevitable. We stock two primary grades: A2 (AISI 304) and A4 (AISI 316), each suited to different environments.',
    es: 'Los elementos de fijacion de acero inoxidable ofrecen una resistencia excepcional a la corrosion, siendo ideales para aplicaciones donde la exposicion a la humedad, quimicos o sal es inevitable. Disponemos de dos grados principales: A2 (AISI 304) y A4 (AISI 316), cada uno adaptado a diferentes entornos.',
  },
  'stainless.intro.p2': {
    en: 'A2 stainless steel (304) is perfect for general indoor and outdoor use, offering excellent resistance to atmospheric corrosion. A4 stainless steel (316) contains molybdenum for enhanced resistance to chlorides and acids, making it the preferred choice for marine, coastal, and chemical environments.',
    es: 'El acero inoxidable A2 (304) es perfecto para uso general interior y exterior, ofreciendo excelente resistencia a la corrosion atmosferica. El acero inoxidable A4 (316) contiene molibdeno para mayor resistencia a cloruros y acidos, siendo la opcion preferida para entornos marinos, costeros y quimicos.',
  },

  // Applications
  'stainless.applications.title': {
    en: 'Common Applications',
    es: 'Aplicaciones Comunes',
  },
  'stainless.app.marine': {
    en: 'Marine & Coastal',
    es: 'Marina y Costera',
  },
  'stainless.app.food': {
    en: 'Food Processing',
    es: 'Industria Alimentaria',
  },
  'stainless.app.chemical': {
    en: 'Chemical Plants',
    es: 'Plantas Quimicas',
  },
  'stainless.app.architecture': {
    en: 'Architecture',
    es: 'Arquitectura',
  },

  // Products Section
  'stainless.products.title': {
    en: 'Key Product Lines',
    es: 'Lineas de Producto Principales',
  },
  'stainless.products.viewAll': {
    en: 'View All Stainless Products',
    es: 'Ver Todos los Productos Inoxidables',
  },
  'stainless.products.materials': {
    en: 'Available in:',
    es: 'Disponible en:',
  },
  'stainless.products.explore': {
    en: 'Explore',
    es: 'Explorar',
  },

  // Technical Section
  'stainless.tech.title': {
    en: 'Technical Specifications',
    es: 'Especificaciones Tecnicas',
  },
  'stainless.tech.comparison': {
    en: 'A2 vs A4 Comparison',
    es: 'Comparativa A2 vs A4',
  },
  'stainless.tech.property': {
    en: 'Property',
    es: 'Propiedad',
  },
  'stainless.tech.grades': {
    en: 'Strength Grades',
    es: 'Grados de Resistencia',
  },
  'stainless.tech.grades.desc': {
    en: 'The number after the grade (70, 80) indicates tensile strength: 70 = 700 N/mm2, 80 = 800 N/mm2',
    es: 'El numero despues del grado (70, 80) indica resistencia a la traccion: 70 = 700 N/mm2, 80 = 800 N/mm2',
  },

  // Logistics
  'stainless.logistics.title': {
    en: 'Stock & Delivery',
    es: 'Stock y Entrega',
  },
  'stainless.logistics.stock': {
    en: 'Large Stock Availability',
    es: 'Gran Disponibilidad de Stock',
  },
  'stainless.logistics.stock.desc': {
    en: 'Over 50,000 SKUs in stainless steel fasteners ready for immediate dispatch',
    es: 'Mas de 50,000 referencias en tornilleria de acero inoxidable listas para envio inmediato',
  },
  'stainless.logistics.delivery': {
    en: 'Fast Delivery',
    es: 'Entrega Rapida',
  },
  'stainless.logistics.delivery.desc': {
    en: 'Express shipping to Mainland Spain (24-48h) and Canary Islands. Special logistics for Baleares.',
    es: 'Envio express a Peninsula (24-48h) e Islas Canarias. Logistica especial para Baleares.',
  },
  'stainless.logistics.moq': {
    en: 'Flexible Orders',
    es: 'Pedidos Flexibles',
  },
  'stainless.logistics.moq.desc': {
    en: 'No minimum order for stocked items. Bulk discounts available for large quantities.',
    es: 'Sin pedido minimo para articulos en stock. Descuentos por volumen para grandes cantidades.',
  },

  // Quote Form
  'stainless.quote.title': {
    en: 'Request a Stainless Steel Quote',
    es: 'Solicitar Presupuesto de Inoxidable',
  },
  'stainless.quote.desc': {
    en: 'Tell us your requirements and receive a binding quote within 2 hours during business days.',
    es: 'Cuentenos sus necesidades y reciba un presupuesto vinculante en 2 horas en dias laborables.',
  },
  'stainless.quote.email': {
    en: 'Your email',
    es: 'Su correo electronico',
  },
  'stainless.quote.company': {
    en: 'Company / Project',
    es: 'Empresa / Proyecto',
  },
  'stainless.quote.requirements': {
    en: 'Describe your stainless steel requirements (products, quantities, sizes)...',
    es: 'Describa sus necesidades de acero inoxidable (productos, cantidades, medidas)...',
  },
  'stainless.quote.submit': {
    en: 'Send Quote Request',
    es: 'Enviar Solicitud',
  },
  'stainless.quote.submitting': {
    en: 'Sending...',
    es: 'Enviando...',
  },
  'stainless.quote.success': {
    en: 'Request sent! We will contact you shortly.',
    es: 'Solicitud enviada! Le contactaremos pronto.',
  },
};

// Product data
const products = [
  {
    id: 'din933',
    standard: 'DIN 933 / ISO 4017',
    name: { en: 'Hex Head Bolts', es: 'Tornillos Hexagonales' },
    description: {
      en: 'Fully threaded hex head bolts for general assembly',
      es: 'Tornillos hexagonales de rosca completa para montaje general',
    },
    materials: ['A2-70', 'A4-70', 'A4-80'],
    image: '/images/placeholders/bolt.svg',
    searchQuery: 'DIN 933 stainless',
  },
  {
    id: 'din912',
    standard: 'DIN 912 / ISO 4762',
    name: { en: 'Socket Head Cap Screws', es: 'Tornillos Allen Cilindricos' },
    description: {
      en: 'Internal hex drive for precision assemblies',
      es: 'Cabeza con hexagono interior para montajes de precision',
    },
    materials: ['A2-70', 'A4-70', 'A4-80'],
    image: '/images/placeholders/screw.svg',
    searchQuery: 'DIN 912 stainless',
  },
  {
    id: 'din934',
    standard: 'DIN 934 / ISO 4032',
    name: { en: 'Hex Nuts', es: 'Tuercas Hexagonales' },
    description: {
      en: 'Standard hex nuts for bolted connections',
      es: 'Tuercas hexagonales estandar para uniones atornilladas',
    },
    materials: ['A2-70', 'A4-70', 'A4-80'],
    image: '/images/placeholders/nut.svg',
    searchQuery: 'DIN 934 stainless',
  },
  {
    id: 'din125',
    standard: 'DIN 125 / ISO 7089',
    name: { en: 'Flat Washers', es: 'Arandelas Planas' },
    description: {
      en: 'Load distribution washers for bolted joints',
      es: 'Arandelas de distribucion de carga para juntas atornilladas',
    },
    materials: ['A2', 'A4'],
    image: '/images/placeholders/washer.svg',
    searchQuery: 'DIN 125 stainless',
  },
  {
    id: 'din127',
    standard: 'DIN 127',
    name: { en: 'Spring Lock Washers', es: 'Arandelas Grower' },
    description: {
      en: 'Split lock washers for vibration resistance',
      es: 'Arandelas de presion para resistencia a vibraciones',
    },
    materials: ['A2', 'A4'],
    image: '/images/placeholders/washer.svg',
    searchQuery: 'DIN 127 stainless',
  },
  {
    id: 'din7991',
    standard: 'DIN 7991 / ISO 10642',
    name: { en: 'Countersunk Screws', es: 'Tornillos Avellanados' },
    description: {
      en: 'Flush-mount socket head countersunk screws',
      es: 'Tornillos avellanados Allen para montaje enrasado',
    },
    materials: ['A2-70', 'A4-70', 'A4-80'],
    image: '/images/placeholders/screw.svg',
    searchQuery: 'DIN 7991 stainless',
  },
  {
    id: 'din975',
    standard: 'DIN 975',
    name: { en: 'Threaded Rods', es: 'Varillas Roscadas' },
    description: {
      en: 'Full-length threaded rods for structural connections',
      es: 'Varillas roscadas de longitud completa para conexiones estructurales',
    },
    materials: ['A2-70', 'A4-70', 'A4-80'],
    image: '/images/placeholders/threaded_rod.svg',
    searchQuery: 'DIN 975 stainless',
  },
  {
    id: 'din7985',
    standard: 'DIN 7985',
    name: { en: 'Pan Head Screws', es: 'Tornillos de Cabeza Alomada' },
    description: {
      en: 'Phillips drive pan head machine screws',
      es: 'Tornillos de cabeza alomada con ranura Phillips',
    },
    materials: ['A2-70', 'A4-70'],
    image: '/images/placeholders/screw.svg',
    searchQuery: 'DIN 7985 stainless',
  },
];

// Technical comparison data
const technicalComparison = [
  {
    property: { en: 'Steel Grade', es: 'Grado de Acero' },
    a2: 'AISI 304',
    a4: 'AISI 316',
  },
  {
    property: { en: 'Chromium Content', es: 'Contenido de Cromo' },
    a2: '17-19%',
    a4: '16-18%',
  },
  {
    property: { en: 'Nickel Content', es: 'Contenido de Niquel' },
    a2: '8-10%',
    a4: '10-14%',
  },
  {
    property: { en: 'Molybdenum', es: 'Molibdeno' },
    a2: 'None',
    a4: '2-3%',
  },
  {
    property: { en: 'Corrosion Resistance', es: 'Resistencia a Corrosion' },
    a2: { en: 'Good', es: 'Buena' },
    a4: { en: 'Excellent', es: 'Excelente' },
  },
  {
    property: { en: 'Chloride Resistance', es: 'Resistencia a Cloruros' },
    a2: { en: 'Moderate', es: 'Moderada' },
    a4: { en: 'Excellent', es: 'Excelente' },
  },
  {
    property: { en: 'Temperature Range', es: 'Rango de Temperatura' },
    a2: '-200C to +300C',
    a4: '-200C to +400C',
  },
  {
    property: { en: 'Typical Applications', es: 'Aplicaciones Tipicas' },
    a2: { en: 'Indoor, general outdoor', es: 'Interior, exterior general' },
    a4: { en: 'Marine, chemical, food', es: 'Marina, quimica, alimentaria' },
  },
];

function useTranslation() {
  const { language } = useLanguage();
  return (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) return key;
    return translation[language as 'en' | 'es'] || key;
  };
}

export default function StainlessFastenersPage() {
  const { language } = useLanguage();
  const t = useTranslation();
  const [quoteForm, setQuoteForm] = useState({
    email: '',
    company: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after delay
    setTimeout(() => {
      setSubmitSuccess(false);
      setQuoteForm({ email: '', company: '', requirements: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* SEO Meta - would be handled by Next.js Head or similar */}
      <title>{t('stainless.meta.title')}</title>

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'url("/images/pattern-hex.png")',
                backgroundSize: '200px',
              }}
            />
          </div>

          <div className="container relative z-10 py-20 lg:py-28">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                <Link href="/" className="hover:text-white transition-colors">
                  {language === 'es' ? 'Inicio' : 'Home'}
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-inox-teal">
                  {t('stainless.hero.title')}
                </span>
              </nav>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-inox-teal/20 border border-inox-teal/30 text-inox-teal text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                {language === 'es' ? 'Resistencia a la Corrosion' : 'Corrosion Resistant'}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-6 leading-[1.1]">
                {t('stainless.hero.title')}
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
                {t('stainless.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="#quote-form"
                  className="group px-8 py-4 bg-inox-orange text-white font-semibold rounded-full shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  {t('stainless.hero.cta')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/search?category=stainless"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                  {t('stainless.hero.browse')}
                  <Hexagon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8 text-center">
                {t('stainless.intro.title')}
              </h2>
              <div className="prose prose-lg prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed mb-6">
                  {t('stainless.intro.p1')}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {t('stainless.intro.p2')}
                </p>
              </div>

              {/* Application Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-inox-teal/5 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Waves className="w-7 h-7" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t('stainless.app.marine')}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-inox-teal/5 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t('stainless.app.food')}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-inox-teal/5 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Factory className="w-7 h-7" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t('stainless.app.chemical')}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 hover:bg-inox-teal/5 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    {t('stainless.app.architecture')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Section */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('stainless.products.title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-inox-teal/30 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name[language as 'en' | 'es']}
                      className="w-24 h-24 object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-slate-900 text-white text-xs"
                      >
                        {product.standard}
                      </Badge>
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
                        {t('stainless.products.materials')}
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
                      {t('stainless.products.explore')}
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                href="/search?category=stainless"
                className="inline-flex items-center gap-3 px-8 py-4 bg-inox-teal text-white font-semibold rounded-full shadow-lg shadow-inox-teal/20 hover:bg-inox-blue hover:scale-105 transition-all duration-300"
              >
                {t('stainless.products.viewAll')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Technical Specifications Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('stainless.tech.title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Comparison Table */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-12">
                <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900">
                    {t('stainless.tech.comparison')}
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-900">
                        {t('stainless.tech.property')}
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-inox-teal" />
                          A2 (304)
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-inox-blue" />
                          A4 (316)
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicalComparison.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-slate-900">
                          {typeof row.property === 'string'
                            ? row.property
                            : row.property[language as 'en' | 'es']}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {typeof row.a2 === 'string'
                            ? row.a2
                            : row.a2[language as 'en' | 'es']}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {typeof row.a4 === 'string'
                            ? row.a4
                            : row.a4[language as 'en' | 'es']}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Strength Grades Info */}
              <div className="bg-gradient-to-r from-inox-teal/10 to-inox-blue/10 rounded-2xl p-8 border border-inox-teal/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-inox-teal text-white rounded-xl flex items-center justify-center shrink-0">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 mb-2">
                      {t('stainless.tech.grades')}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {t('stainless.tech.grades.desc')}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                        A2-70: 700 N/mm2
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                        A4-70: 700 N/mm2
                      </Badge>
                      <Badge className="bg-inox-blue/10 text-inox-blue border border-inox-blue/20">
                        A4-80: 800 N/mm2
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logistics Section */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('stainless.logistics.title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Stock */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-inox-teal/10 text-inox-teal rounded-xl flex items-center justify-center mb-6">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t('stainless.logistics.stock')}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('stainless.logistics.stock.desc')}
                </p>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-inox-orange/10 text-inox-orange rounded-xl flex items-center justify-center mb-6">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t('stainless.logistics.delivery')}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('stainless.logistics.delivery.desc')}
                </p>
              </div>

              {/* MOQ */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-inox-blue/10 text-inox-blue rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t('stainless.logistics.moq')}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t('stainless.logistics.moq.desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inline Quote Form Section */}
        <section
          id="quote-form"
          className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
        >
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  {t('stainless.quote.title')}
                </h2>
                <p className="text-slate-300 text-lg">
                  {t('stainless.quote.desc')}
                </p>
              </div>

              {submitSuccess ? (
                <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <p className="text-xl font-semibold text-white">
                    {t('stainless.quote.success')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input
                      type="email"
                      placeholder={t('stainless.quote.email')}
                      value={quoteForm.email}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, email: e.target.value })
                      }
                      required
                      className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder={t('stainless.quote.company')}
                      value={quoteForm.company}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, company: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20 outline-none transition-all"
                    />
                  </div>

                  {/* Pre-filled category badge */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-inox-teal/20 rounded-lg border border-inox-teal/30 w-fit">
                    <Droplets className="w-4 h-4 text-inox-teal" />
                    <span className="text-sm font-medium text-inox-teal">
                      {language === 'es' ? 'Categoria: Acero Inoxidable' : 'Category: Stainless Steel'}
                    </span>
                  </div>

                  <textarea
                    placeholder={t('stainless.quote.requirements')}
                    value={quoteForm.requirements}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        requirements: e.target.value,
                      })
                    }
                    rows={4}
                    required
                    className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20 outline-none transition-all resize-none"
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-inox-orange text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('stainless.quote.submitting')}
                      </>
                    ) : (
                      <>
                        {t('stainless.quote.submit')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

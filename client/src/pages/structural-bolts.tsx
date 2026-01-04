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
} from 'lucide-react';

// Translations for the structural bolts page
const translations = {
  hero: {
    title: {
      en: 'Structural Bolts & High-Strength Fasteners',
      es: 'Tornillos Estructurales de Alta Resistencia',
    },
    subtitle: {
      en: 'Premium fasteners for construction, steel structures, and heavy-duty industrial applications',
      es: 'Fijaciones premium para construcción, estructuras de acero y aplicaciones industriales pesadas',
    },
  },
  intro: {
    title: {
      en: 'High-Strength Structural Fastening Solutions',
      es: 'Soluciones de Fijación Estructural de Alta Resistencia',
    },
    p1: {
      en: 'Our structural bolt range covers the most demanding applications in steel construction, bridge building, and heavy machinery. Available in strength grades 8.8, 10.9, and 12.9, these fasteners meet the highest European standards for structural integrity and safety.',
      es: 'Nuestra gama de tornillos estructurales cubre las aplicaciones más exigentes en construcción de acero, puentes y maquinaria pesada. Disponibles en clases de resistencia 8.8, 10.9 y 12.9, estos elementos de fijación cumplen los estándares europeos más exigentes en integridad estructural y seguridad.',
    },
    p2: {
      en: 'All products are certified to DIN/ISO standards with full traceability and test certificates available. Surface treatments include hot-dip galvanizing, zinc flake coating (Geomet/Dacromet), and phosphate finishes for optimal corrosion protection.',
      es: 'Todos los productos están certificados según normas DIN/ISO con trazabilidad completa y certificados de ensayo disponibles. Los tratamientos superficiales incluyen galvanizado en caliente, recubrimiento de zinc laminar (Geomet/Dacromet) y acabados fosfatados para una protección óptima contra la corrosión.',
    },
  },
  products: {
    title: {
      en: 'Key Product Lines',
      es: 'Líneas de Producto Principales',
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
      es: 'Especificaciones Técnicas',
    },
    strengthComparison: {
      en: 'Strength Grade Comparison',
      es: 'Comparación de Clases de Resistencia',
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
      title: { en: 'Steel Frame Construction', es: 'Construcción con Estructura de Acero' },
      desc: { en: 'Primary connections in steel buildings, warehouses, and industrial facilities', es: 'Conexiones principales en edificios de acero, naves y instalaciones industriales' },
    },
    bridges: {
      title: { en: 'Bridge Building', es: 'Construcción de Puentes' },
      desc: { en: 'High-strength connections for road, rail, and pedestrian bridges', es: 'Conexiones de alta resistencia para puentes de carretera, ferrocarril y peatonales' },
    },
    machinery: {
      title: { en: 'Industrial Machinery', es: 'Maquinaria Industrial' },
      desc: { en: 'Heavy equipment assembly and mechanical engineering applications', es: 'Montaje de equipos pesados y aplicaciones de ingeniería mecánica' },
    },
    automotive: {
      title: { en: 'Automotive & Transport', es: 'Automoción y Transporte' },
      desc: { en: 'Chassis, suspension, and structural components for vehicles', es: 'Chasis, suspensión y componentes estructurales para vehículos' },
    },
  },
  logistics: {
    title: {
      en: 'Stock & Delivery',
      es: 'Stock y Entrega',
    },
    stock: {
      title: { en: 'Large Stock Availability', es: 'Gran Disponibilidad de Stock' },
      desc: { en: 'Over 500,000 structural fasteners in stock for immediate dispatch', es: 'Más de 500.000 fijaciones estructurales en stock para envío inmediato' },
    },
    discount: {
      title: { en: 'Volume Discounts', es: 'Descuentos por Volumen' },
      desc: { en: 'Competitive pricing for large project quantities - request a quote', es: 'Precios competitivos para grandes cantidades de proyecto - solicite presupuesto' },
    },
    delivery: {
      title: { en: 'Fast Delivery', es: 'Entrega Rápida' },
      desc: { en: '24-48h to mainland Spain, weekly shipments to Canary Islands', es: '24-48h a península, envíos semanales a Canarias' },
    },
  },
  quote: {
    title: {
      en: 'Request a Quote',
      es: 'Solicitar Presupuesto',
    },
    desc: {
      en: 'Get competitive pricing for your structural fastener requirements',
      es: 'Obtenga precios competitivos para sus necesidades de fijación estructural',
    },
    email: { en: 'Email', es: 'Correo electrónico' },
    company: { en: 'Company', es: 'Empresa' },
    message: { en: 'Requirements', es: 'Requisitos' },
    messagePlaceholder: {
      en: 'Describe your project requirements: quantities, sizes, grades, delivery location...',
      es: 'Describa sus requisitos de proyecto: cantidades, medidas, clases, lugar de entrega...',
    },
    submit: { en: 'Send Quote Request', es: 'Enviar Solicitud' },
    category: { en: 'Category', es: 'Categoría' },
  },
  table: {
    grade: { en: 'Grade', es: 'Clase' },
    tensileStrength: { en: 'Tensile Strength', es: 'Resistencia a Tracción' },
    yieldStrength: { en: 'Yield Strength', es: 'Límite Elástico' },
    elongation: { en: 'Elongation', es: 'Alargamiento' },
    applications: { en: 'Typical Applications', es: 'Aplicaciones Típicas' },
    size: { en: 'Size', es: 'Medida' },
    torque: { en: 'Torque (Nm)', es: 'Par (Nm)' },
    preload: { en: 'Preload (kN)', es: 'Precarga (kN)' },
    coating: { en: 'Coating', es: 'Recubrimiento' },
    thickness: { en: 'Thickness', es: 'Espesor' },
    corrosionResistance: { en: 'Corrosion Resistance', es: 'Resistencia a Corrosión' },
    color: { en: 'Color', es: 'Color' },
  },
};

// Product data
const products = [
  {
    id: 'din-931',
    standard: 'DIN 931 / ISO 4014',
    name: { en: 'Hex Head Bolts (Partial Thread)', es: 'Tornillos Hexagonales (Rosca Parcial)' },
    grades: ['8.8', '10.9', '12.9'],
    finishes: ['Zinc', 'HDG', 'Geomet'],
    image: '/images/products/hex-bolt-partial.jpg',
  },
  {
    id: 'din-933',
    standard: 'DIN 933 / ISO 4017',
    name: { en: 'Hex Head Bolts (Full Thread)', es: 'Tornillos Hexagonales (Rosca Completa)' },
    grades: ['8.8', '10.9', '12.9'],
    finishes: ['Zinc', 'HDG', 'Phosphate'],
    image: '/images/products/hex-bolt-full.jpg',
  },
  {
    id: 'din-912',
    standard: 'DIN 912 / ISO 4762',
    name: { en: 'Socket Head Cap Screws', es: 'Tornillos Allen Cilíndricos' },
    grades: ['10.9', '12.9'],
    finishes: ['Black Oxide', 'Zinc', 'Geomet'],
    image: '/images/products/socket-cap.jpg',
  },
  {
    id: 'din-6914',
    standard: 'DIN 6914',
    name: { en: 'HV Structural Hex Bolts', es: 'Tornillos Hexagonales Estructurales HV' },
    grades: ['10.9'],
    finishes: ['HDG', 'Geomet', 'Dacromet'],
    image: '/images/products/hv-bolt.jpg',
  },
  {
    id: 'din-6915',
    standard: 'DIN 6915',
    name: { en: 'HV Structural Hex Nuts', es: 'Tuercas Hexagonales Estructurales HV' },
    grades: ['10'],
    finishes: ['HDG', 'Geomet'],
    image: '/images/products/hv-nut.jpg',
  },
  {
    id: 'din-6916',
    standard: 'DIN 6916',
    name: { en: 'HV Structural Washers', es: 'Arandelas Estructurales HV' },
    grades: ['300HV'],
    finishes: ['HDG', 'Geomet'],
    image: '/images/products/hv-washer.jpg',
  },
  {
    id: 'din-7990',
    standard: 'DIN 7990',
    name: { en: 'Hexagon Fit Bolts for Steel Structures', es: 'Tornillos de Ajuste para Estructuras de Acero' },
    grades: ['8.8', '10.9'],
    finishes: ['HDG', 'Zinc'],
    image: '/images/products/fit-bolt.jpg',
  },
  {
    id: 'din-934-structural',
    standard: 'DIN 934 Class 8/10',
    name: { en: 'Structural Hex Nuts', es: 'Tuercas Hexagonales Estructurales' },
    grades: ['8', '10'],
    finishes: ['Zinc', 'HDG', 'Phosphate'],
    image: '/images/products/structural-nut.jpg',
  },
];

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
    applications: { en: 'Critical connections, aerospace', es: 'Conexiones críticas, aeroespacial' },
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
    thickness: '45-85 μm',
    resistance: { en: 'Excellent', es: 'Excelente' },
    color: { en: 'Silver-grey', es: 'Gris plateado' },
  },
  {
    name: { en: 'Zinc Flake (Geomet)', es: 'Zinc Laminar (Geomet)' },
    thickness: '8-15 μm',
    resistance: { en: 'Very Good', es: 'Muy Buena' },
    color: { en: 'Silver', es: 'Plateado' },
  },
  {
    name: { en: 'Electroplated Zinc', es: 'Zincado Electrolítico' },
    thickness: '5-12 μm',
    resistance: { en: 'Good', es: 'Buena' },
    color: { en: 'Bright/Yellow', es: 'Brillante/Amarillo' },
  },
  {
    name: { en: 'Phosphate', es: 'Fosfatado' },
    thickness: '2-5 μm',
    resistance: { en: 'Moderate', es: 'Moderada' },
    color: { en: 'Dark grey/Black', es: 'Gris oscuro/Negro' },
  },
];

export default function StructuralBoltsPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
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
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>

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
                  <div className="text-sm text-slate-600">{language === 'es' ? 'Certificación' : 'Certification'}</div>
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
        <section className="py-20 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('products', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/search?category=structural&standard=${encodeURIComponent(product.standard)}`}
                >
                  <Card className="group h-full hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-inox-teal/50 cursor-pointer overflow-hidden">
                    {/* Product Image Placeholder */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Wrench className="w-16 h-16 text-slate-300 group-hover:text-inox-teal/50 transition-colors" />
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs">
                          {product.standard.split(' / ')[0]}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold text-slate-900 group-hover:text-inox-teal transition-colors">
                        {product.name[language as 'en' | 'es']}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {product.standard}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-slate-500 block mb-1.5">{t('products', 'gradesAvailable')}:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.grades.map((grade) => (
                              <Badge key={grade} variant="outline" className="text-xs bg-slate-50">
                                {grade}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block mb-1.5">{t('products', 'finishes')}:</span>
                          <div className="flex flex-wrap gap-1">
                            {product.finishes.map((finish) => (
                              <Badge key={finish} variant="outline" className="text-xs bg-slate-50">
                                {finish}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center text-sm text-inox-teal font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('products', 'viewAll')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {t('technical', 'title')}
              </h2>
              <div className="w-20 h-1.5 bg-inox-teal mx-auto rounded-full" />
            </div>

            <div className="space-y-16">
              {/* Strength Grade Comparison */}
              <div>
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

              {/* Torque Specifications */}
              <div>
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
                    ? 'Valores de referencia para tornillos con coeficiente de fricción μ = 0.12. Consultar especificaciones del fabricante.'
                    : 'Reference values for bolts with friction coefficient μ = 0.12. Consult manufacturer specifications.'}
                </p>
              </div>

              {/* Coating Options */}
              <div>
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
            </div>
          </div>
        </section>

        {/* Applications Section */}
        <section className="py-20 bg-slate-50">
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
        <section className="py-20 bg-white">
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
                    {language === 'es'
                      ? 'Nos pondremos en contacto contigo en menos de 2 horas.'
                      : 'We will contact you within 2 hours.'}
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
                    <Input
                      type="text"
                      disabled
                      value={language === 'es' ? 'Tornillos Estructurales' : 'Structural Bolts'}
                      className="bg-inox-teal/20 border-inox-teal/30 text-inox-teal cursor-not-allowed"
                    />
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
    </div>
  );
}

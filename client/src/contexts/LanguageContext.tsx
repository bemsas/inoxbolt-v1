import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.catalogues': { en: 'Catalogues', es: 'Catálogos' },
  'nav.contact': { en: 'Contact', es: 'Contacto' },
  'nav.search_placeholder': { en: 'Search products, codes...', es: 'Buscar productos, códigos...' },
  
  // Hero
  'hero.headline': { en: 'WHOLESALE FASTENERS', es: 'FIJACIONES AL POR MAYOR.' },
  'hero.subheadline': { en: 'OVER 2 MILLION ITEMS IN STOCK', es: 'MÁS DE 2 MILLONES DE ARTÍCULOS' },
  'hero.description': { 
    en: 'Quick and easy ordering for construction and industry. We deliver anywhere in Europe, with specialized logistics for Mainland Spain and the Canary Islands. Ecommerce coming soon—order now via Email or WhatsApp.', 
    es: 'Pedidos rápidos y fáciles para construcción e industria. Entregamos en toda Europa, con logística especializada para España peninsular y Canarias. Ecommerce próximamente—pida ahora por Email o WhatsApp.' 
  },
  'hero.cta': { en: 'Start Order / Quote', es: 'Iniciar Pedido / Presupuesto' },
  'hero.location': { en: 'Delivery to Europe • Focus on Spain & Canary Islands', es: 'Envío a Europa • Enfoque en España y Canarias' },
  
  // Value Props
  'value.premium.title': { en: '2 Million+ Items', es: '2 Millones+ Artículos' },
  'value.premium.desc': { en: 'Massive wholesale inventory of bolts, nuts, and fixings ready for immediate dispatch', es: 'Inventario masivo al por mayor de tornillos, tuercas y fijaciones listos para envío inmediato' },
  'value.delivery.title': { en: 'European Logistics', es: 'Logística Europea' },
  'value.delivery.desc': { en: 'Fast delivery anywhere in Europe, with specialized routes for Mainland Spain and Canary Islands', es: 'Envío rápido a toda Europa, con rutas especializadas para España peninsular y Canarias' },
  'value.canary.title': { en: 'Canary Islands Specialist', es: 'Especialistas en Canarias' },
  'value.canary.desc': { en: 'Local expertise for coastal and volcanic construction requirements', es: 'Experiencia local para requisitos de construcción costera y volcánica' },
  'value.tech.title': { en: 'Technical Expertise', es: 'Experiencia Técnica' },
  'value.tech.desc': { en: 'DIN/ISO certified products with comprehensive technical documentation', es: 'Productos certificados DIN/ISO con documentación técnica completa' },
  
  // Logistics Section
  'logistics.title': { en: 'HASSLE-FREE LOGISTICS & TAXES', es: 'LOGÍSTICA Y IMPUESTOS SIN COMPLICACIONES' },
  'logistics.canary.title': { en: 'Canary Islands (IGIC)', es: 'Islas Canarias (IGIC)' },
  'logistics.canary.desc': { en: 'Local stock in Tenerife. No customs delays. We handle IGIC invoices directly.', es: 'Stock local en Tenerife. Sin retrasos de aduanas. Gestionamos facturas con IGIC directamente.' },
  'logistics.mainland.title': { en: 'Mainland Spain & Europe', es: 'Península y Europa' },
  'logistics.mainland.desc': { en: '24/48h express delivery for in-stock items. DDP (Delivered Duty Paid) service available.', es: 'Envío express 24/48h para artículos en stock. Servicio DDP (Entregado Derechos Pagados) disponible.' },
  'logistics.sla.title': { en: '2-Hour Quote Promise', es: 'Presupuesto en 2 Horas' },
  'logistics.sla.desc': { en: 'Send us your list. We reply with a binding quote and availability in under 2 hours during business days.', es: 'Envíenos su lista. Respondemos con presupuesto vinculante y disponibilidad en menos de 2 horas en días laborables.' },
  
  // Suppliers
  'suppliers.title': { en: 'TRUSTED GLOBAL SUPPLIERS', es: 'PROVEEDORES GLOBALES DE CONFIANZA' },
  'suppliers.more': { en: '+ More suppliers coming soon', es: '+ Más proveedores próximamente' },
  
  // Catalogues
  'catalogues.title': { en: 'BROWSE OUR CURRENT CATALOGUES', es: 'EXPLORA NUESTROS CATÁLOGOS' },
  'catalogues.download': { en: 'Download', es: 'Descargar' },
  'catalogues.pages': { en: 'pages', es: 'páginas' },
  
  // Contact
  'contact.title': { en: 'GET IN TOUCH', es: 'CONTÁCTANOS' },
  'contact.desc': { en: 'Have questions about our products or need a custom quote? Our team is ready to help.', es: '¿Tienes preguntas sobre nuestros productos o necesitas un presupuesto personalizado? Nuestro equipo está listo para ayudar.' },
  'contact.email': { en: 'Email', es: 'Correo' },
  'contact.phone': { en: 'Phone', es: 'Teléfono' },
  'contact.location': { en: 'Location', es: 'Ubicación' },
  'contact.whatsapp': { en: 'Chat on WhatsApp', es: 'Chat en WhatsApp' },
  
  // Modal
  'modal.title': { en: 'Request Quote / Order', es: 'Solicitar Presupuesto / Pedido' },
  'modal.desc': { en: 'Send us your requirements or project list. We reply quickly with a quote and availability.', es: 'Envíenos sus requisitos o lista de proyecto. Respondemos rápidamente con presupuesto y disponibilidad.' },
  'modal.email_placeholder': { en: 'Your email', es: 'Su correo electrónico' },
  'modal.company_placeholder': { en: 'Company / Project Name', es: 'Empresa / Nombre del Proyecto' },
  'modal.upload_label': { en: 'Upload Order List (PDF/Excel)', es: 'Subir Lista de Pedido (PDF/Excel)' },
  'modal.upload_help': { en: 'Drag & drop or click to upload', es: 'Arrastre o haga clic para subir' },
  'modal.submit': { en: 'Send Request', es: 'Enviar Solicitud' },
  'modal.submitting': { en: 'Submitting...', es: 'Enviando...' },
  'modal.success': { en: "You're on the list!", es: '¡Estás en la lista!' },
  
  // Footer
  'footer.rights': { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  'footer.products': { en: 'Products', es: 'Productos' },
  'footer.company': { en: 'Company', es: 'Empresa' },
  'footer.legal': { en: 'Legal', es: 'Legal' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

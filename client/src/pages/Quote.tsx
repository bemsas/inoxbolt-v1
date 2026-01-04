import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Building2,
  User,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Camera,
  Image,
  Zap,
  ArrowRight,
  Share2,
  MessageCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Translations for the quote page
const quoteTranslations = {
  // Page titles
  'quote.title': { en: 'Request a Quote', es: 'Solicitar Presupuesto' },
  'quote.subtitle': { en: 'Get a personalized quote for your B2B fastener needs. We respond within 48 hours (24h for urgent requests).', es: 'Obtén un presupuesto personalizado para tus necesidades de fijaciones B2B. Respondemos en 48 horas (24h para solicitudes urgentes).' },

  // Tab labels
  'quote.tab.quick': { en: 'Quick Quote', es: 'Presupuesto Rápido' },
  'quote.tab.full': { en: 'Full Request', es: 'Solicitud Completa' },

  // Quick quote
  'quote.quick.title': { en: 'Get a Quick Quote', es: 'Obtén un Presupuesto Rápido' },
  'quote.quick.subtitle': { en: 'Just 3 fields - we\'ll get back to you fast!', es: 'Solo 3 campos - te responderemos rápido!' },
  'quote.quick.email': { en: 'Email Address', es: 'Correo Electrónico' },
  'quote.quick.email_placeholder': { en: 'your.email@company.com', es: 'tu.correo@empresa.com' },
  'quote.quick.description': { en: 'What do you need?', es: '¿Qué necesitas?' },
  'quote.quick.description_placeholder': { en: 'Describe the products you need (e.g., 100 units DIN 933 M8x30 A2-70)', es: 'Describe los productos que necesitas (ej., 100 unidades DIN 933 M8x30 A2-70)' },
  'quote.quick.quantity': { en: 'Estimated Quantity', es: 'Cantidad Estimada' },
  'quote.quick.quantity_placeholder': { en: 'e.g., 100 units', es: 'Ej., 100 unidades' },
  'quote.quick.submit': { en: 'Get Quick Quote', es: 'Obtener Presupuesto' },

  // Progress steps
  'quote.step.company': { en: 'Company', es: 'Empresa' },
  'quote.step.contact': { en: 'Contact', es: 'Contacto' },
  'quote.step.delivery': { en: 'Delivery', es: 'Entrega' },
  'quote.step.products': { en: 'Products', es: 'Productos' },
  'quote.step.options': { en: 'Options', es: 'Opciones' },

  // Company details section
  'quote.company.title': { en: 'Company Details', es: 'Datos de la Empresa' },
  'quote.company.name': { en: 'Company Name', es: 'Nombre de la Empresa' },
  'quote.company.name_placeholder': { en: 'Enter company name', es: 'Introduce el nombre de la empresa' },
  'quote.company.vat': { en: 'CIF/NIF/VAT Number', es: 'CIF/NIF/IVA' },
  'quote.company.vat_placeholder': { en: 'e.g., ESB12345678', es: 'Ej., ESB12345678' },
  'quote.company.type': { en: 'Company Type', es: 'Tipo de Empresa' },
  'quote.company.type_placeholder': { en: 'Select company type', es: 'Selecciona tipo de empresa' },
  'quote.company.type_distributor': { en: 'Distributor', es: 'Distribuidor' },
  'quote.company.type_manufacturer': { en: 'Manufacturer', es: 'Fabricante' },
  'quote.company.type_construction': { en: 'Construction', es: 'Construcción' },
  'quote.company.type_maintenance': { en: 'Maintenance', es: 'Mantenimiento' },
  'quote.company.type_other': { en: 'Other', es: 'Otro' },
  'quote.company.website': { en: 'Website (optional)', es: 'Sitio Web (opcional)' },
  'quote.company.website_placeholder': { en: 'https://www.yourcompany.com', es: 'https://www.tuempresa.com' },

  // Contact person section
  'quote.contact.title': { en: 'Contact Person', es: 'Persona de Contacto' },
  'quote.contact.name': { en: 'Contact Name', es: 'Nombre de Contacto' },
  'quote.contact.name_placeholder': { en: 'Your full name', es: 'Tu nombre completo' },
  'quote.contact.email': { en: 'Email', es: 'Correo Electrónico' },
  'quote.contact.email_placeholder': { en: 'your.email@company.com', es: 'tu.correo@empresa.com' },
  'quote.contact.phone': { en: 'Phone/WhatsApp (optional)', es: 'Teléfono/WhatsApp (opcional)' },
  'quote.contact.phone_placeholder': { en: '+34 600 000 000', es: '+34 600 000 000' },
  'quote.contact.language': { en: 'Preferred Language', es: 'Idioma Preferido' },

  // Delivery details section
  'quote.delivery.title': { en: 'Delivery Details', es: 'Detalles de Entrega' },
  'quote.delivery.country': { en: 'Country', es: 'País' },
  'quote.delivery.country_spain': { en: 'Spain', es: 'España' },
  'quote.delivery.country_portugal': { en: 'Portugal', es: 'Portugal' },
  'quote.delivery.country_france': { en: 'France', es: 'Francia' },
  'quote.delivery.country_germany': { en: 'Germany', es: 'Alemania' },
  'quote.delivery.country_italy': { en: 'Italy', es: 'Italia' },
  'quote.delivery.country_other': { en: 'Other EU Country', es: 'Otro País UE' },
  'quote.delivery.region': { en: 'Region/Province', es: 'Región/Provincia' },
  'quote.delivery.region_placeholder': { en: 'Select region', es: 'Selecciona región' },
  'quote.delivery.region_peninsula': { en: 'Peninsula', es: 'Península' },
  'quote.delivery.region_baleares': { en: 'Balearic Islands', es: 'Islas Baleares' },
  'quote.delivery.region_canarias': { en: 'Canary Islands', es: 'Islas Canarias' },
  'quote.delivery.region_ceuta_melilla': { en: 'Ceuta/Melilla', es: 'Ceuta/Melilla' },
  'quote.delivery.postal': { en: 'Postal Code', es: 'Código Postal' },
  'quote.delivery.postal_placeholder': { en: 'e.g., 28001', es: 'Ej., 28001' },

  // Quote content section
  'quote.content.title': { en: 'Quote Content', es: 'Contenido del Presupuesto' },
  'quote.content.items': { en: 'Items to Quote', es: 'Artículos a Presupuestar' },
  'quote.content.items_placeholder': {
    en: '100 units DIN 933 M8x30 A2-70\n200 units DIN 934 M8 A2\n50 kg threaded rod M10 A4',
    es: '100 unidades DIN 933 M8x30 A2-70\n200 unidades DIN 934 M8 A2\n50 kg varilla roscada M10 A4'
  },
  'quote.content.items_description': { en: 'List your required products with quantities, specifications, and materials.', es: 'Lista tus productos requeridos con cantidades, especificaciones y materiales.' },
  'quote.content.upload': { en: 'Upload File', es: 'Subir Archivo' },
  'quote.content.upload_description': { en: 'Upload your order list (PDF, XLS, XLSX, CSV, JPG, PNG - max 10MB)', es: 'Sube tu lista de pedido (PDF, XLS, XLSX, CSV, JPG, PNG - máx 10MB)' },
  'quote.content.upload_drag': { en: 'Drag & drop files here', es: 'Arrastra archivos aquí' },
  'quote.content.upload_or': { en: 'or', es: 'o' },
  'quote.content.upload_browse': { en: 'Browse Files', es: 'Explorar Archivos' },
  'quote.content.upload_camera': { en: 'Take Photo', es: 'Tomar Foto' },
  'quote.content.file_selected': { en: 'File selected:', es: 'Archivo seleccionado:' },
  'quote.content.uploading': { en: 'Uploading...', es: 'Subiendo...' },

  // Additional options section
  'quote.options.title': { en: 'Additional Options', es: 'Opciones Adicionales' },
  'quote.options.urgency': { en: 'Response Urgency', es: 'Urgencia de Respuesta' },
  'quote.options.normal': { en: 'Normal (48h response)', es: 'Normal (respuesta 48h)' },
  'quote.options.urgent': { en: 'Urgent (24h response)', es: 'Urgente (respuesta 24h)' },
  'quote.options.consent': { en: 'I agree to the processing of my data according to the Privacy Policy and accept the Terms of Service.', es: 'Acepto el procesamiento de mis datos según la Política de Privacidad y acepto los Términos de Servicio.' },

  // Submit
  'quote.submit': { en: 'Request Quote', es: 'Solicitar Presupuesto' },
  'quote.submitting': { en: 'Submitting...', es: 'Enviando...' },

  // Success
  'quote.success.title': { en: 'Quote Request Submitted!', es: '¡Solicitud de Presupuesto Enviada!' },
  'quote.success.message': { en: 'Thank you for your request. Our sales team will contact you within the specified timeframe.', es: 'Gracias por tu solicitud. Nuestro equipo de ventas te contactará dentro del plazo especificado.' },
  'quote.success.ref': { en: 'Reference number:', es: 'Número de referencia:' },
  'quote.success.new': { en: 'Submit Another Quote', es: 'Enviar Otro Presupuesto' },
  'quote.success.next_steps': { en: 'What happens next?', es: '¿Qué sigue?' },
  'quote.success.step1': { en: 'Our team reviews your request', es: 'Nuestro equipo revisa tu solicitud' },
  'quote.success.step2': { en: 'We prepare a personalized quote', es: 'Preparamos un presupuesto personalizado' },
  'quote.success.step3': { en: 'You receive it via email', es: 'Lo recibes por correo electrónico' },
  'quote.success.share': { en: 'Share via WhatsApp', es: 'Compartir por WhatsApp' },

  // Errors
  'quote.error.title': { en: 'Submission Error', es: 'Error de Envío' },
  'quote.error.message': { en: 'There was an error submitting your request. Please try again.', es: 'Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.' },
  'quote.error.file_size': { en: 'File size exceeds 10MB limit', es: 'El archivo excede el límite de 10MB' },
  'quote.error.file_type': { en: 'Invalid file type. Allowed: PDF, XLS, XLSX, CSV, JPG, PNG', es: 'Tipo de archivo no válido. Permitidos: PDF, XLS, XLSX, CSV, JPG, PNG' },

  // Validation messages
  'quote.validation.company_required': { en: 'Company name is required', es: 'El nombre de la empresa es obligatorio' },
  'quote.validation.vat_required': { en: 'VAT number is required', es: 'El número de IVA es obligatorio' },
  'quote.validation.type_required': { en: 'Company type is required', es: 'El tipo de empresa es obligatorio' },
  'quote.validation.name_required': { en: 'Contact name is required', es: 'El nombre de contacto es obligatorio' },
  'quote.validation.email_required': { en: 'Email is required', es: 'El correo electrónico es obligatorio' },
  'quote.validation.email_invalid': { en: 'Invalid email address', es: 'Correo electrónico no válido' },
  'quote.validation.country_required': { en: 'Country is required', es: 'El país es obligatorio' },
  'quote.validation.consent_required': { en: 'You must accept the terms', es: 'Debes aceptar los términos' },
  'quote.validation.items_required': { en: 'Please provide items to quote or upload a file', es: 'Por favor proporciona artículos a presupuestar o sube un archivo' },
  'quote.validation.phone_invalid': { en: 'Please enter a valid phone number', es: 'Por favor introduce un número de teléfono válido' },
} as const;

// Company type suggestions based on keywords
const companyTypeSuggestions: Record<string, string[]> = {
  distributor: ['distribu', 'wholesale', 'mayorist', 'supply', 'suministro'],
  manufacturer: ['manufactur', 'fabrican', 'produc', 'industr', 'factory', 'fábrica'],
  construction: ['construct', 'build', 'obra', 'arquitect', 'ingenier'],
  maintenance: ['mainten', 'mantenim', 'repair', 'servic', 'técnic'],
};

// Form schema using zod
const quoteFormSchema = z.object({
  // Company details
  companyName: z.string().min(1, 'Company name is required'),
  vatNumber: z.string().min(1, 'VAT number is required'),
  companyType: z.string().min(1, 'Company type is required'),
  website: z.string().url().optional().or(z.literal('')),

  // Contact person
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['en', 'es']),

  // Delivery details
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  postalCode: z.string().optional(),

  // Quote content
  items: z.string().optional(),

  // Options
  urgency: z.enum(['normal', 'urgent']),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms',
  }),
});

// Quick quote schema
const quickQuoteSchema = z.object({
  email: z.string().email('Invalid email address'),
  description: z.string().min(10, 'Please provide more details'),
  quantity: z.string().min(1, 'Quantity is required'),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;
type QuickQuoteFormData = z.infer<typeof quickQuoteSchema>;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Form section identifiers
type FormSection = 'company' | 'contact' | 'delivery' | 'products' | 'options';

// Floating Label Input Component
function FloatingLabelInput({
  label,
  error,
  className,
  required,
  ...props
}: React.ComponentProps<'input'> & { label: string; error?: string; required?: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const isFloating = isFocused || hasValue;

  return (
    <div className={cn('relative', className)}>
      <input
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          'peer w-full min-h-[52px] md:min-h-[44px] px-4 pt-5 pb-2 text-base rounded-lg border bg-white transition-all duration-200 outline-none',
          error
            ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
            : 'border-slate-200 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20',
          'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        )}
        placeholder=" "
      />
      <label
        className={cn(
          'absolute left-4 transition-all duration-200 pointer-events-none',
          isFloating
            ? 'top-2 text-xs font-medium text-inox-teal'
            : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {error && (
        <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// Floating Label Textarea Component
function FloatingLabelTextarea({
  label,
  error,
  className,
  required,
  ...props
}: React.ComponentProps<'textarea'> & { label: string; error?: string; required?: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const isFloating = isFocused || hasValue;

  return (
    <div className={cn('relative', className)}>
      <textarea
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          'peer w-full min-h-[150px] px-4 pt-7 pb-3 text-base rounded-lg border bg-white transition-all duration-200 outline-none resize-y',
          error
            ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
            : 'border-slate-200 focus:border-inox-teal focus:ring-2 focus:ring-inox-teal/20',
          'disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
        )}
        placeholder=" "
      />
      <label
        className={cn(
          'absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1',
          isFloating
            ? 'top-2 text-xs font-medium text-inox-teal'
            : 'top-5 text-base text-slate-400'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {error && (
        <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// Phone number formatter
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');

  // If starts with +34 or 34, format as Spanish number
  if (cleaned.startsWith('+34') || cleaned.startsWith('34')) {
    const digits = cleaned.replace(/^\+?34/, '');
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 9));
    return '+34 ' + parts.join(' ');
  }

  // For other numbers, just add spaces every 3 digits
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.slice(0, 3);
    const rest = cleaned.slice(3);
    const parts = rest.match(/.{1,3}/g) || [];
    return countryCode + ' ' + parts.join(' ');
  }

  return cleaned;
}

// File preview component
function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    return () => setPreview(null);
  }, [file]);

  const getFileIcon = () => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.type === 'text/csv') return '📊';
    return '📎';
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-inox-teal/5 border border-inox-teal/20 rounded-lg">
      {preview ? (
        <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
      ) : (
        <span className="text-2xl">{getFileIcon()}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"
        aria-label="Remove file"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}

// Progress indicator component
function FormProgress({
  sections,
  currentSection,
  completedSections,
  onSectionClick
}: {
  sections: { id: FormSection; label: string; icon: React.ReactNode }[];
  currentSection: FormSection;
  completedSections: Set<FormSection>;
  onSectionClick: (section: FormSection) => void;
}) {
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  const progress = ((completedSections.size) / sections.length) * 100;

  return (
    <div className="mb-8">
      {/* Mobile: Compact progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">
            {sections[currentIndex]?.label}
          </span>
          <span className="text-sm text-slate-500">
            {currentIndex + 1}/{sections.length}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-200" />
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden md:flex items-center justify-between">
        {sections.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          const isCurrent = section.id === currentSection;
          const isPast = sections.findIndex(s => s.id === currentSection) > index;

          return (
            <React.Fragment key={section.id}>
              <button
                type="button"
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                  isCurrent && 'bg-inox-teal/10 text-inox-teal',
                  isCompleted && !isCurrent && 'text-green-600',
                  !isCurrent && !isCompleted && 'text-slate-400 hover:text-slate-600'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCurrent && 'bg-inox-teal text-white',
                  isCompleted && !isCurrent && 'bg-green-100 text-green-600',
                  !isCurrent && !isCompleted && 'bg-slate-100'
                )}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    section.icon
                  )}
                </div>
                <span className="text-sm font-medium hidden lg:inline">{section.label}</span>
              </button>
              {index < sections.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2',
                  isPast || isCompleted ? 'bg-inox-teal' : 'bg-slate-200'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Success animation component
function SuccessAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
      <div className="relative w-full h-full bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
      </div>
    </div>
  );
}

export default function QuotePage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSection, setCurrentSection] = useState<FormSection>('company');
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<FormSection>>(() => new Set<FormSection>(['company']));
  const [suggestedCompanyType, setSuggestedCompanyType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<Record<FormSection, HTMLDivElement | null>>({
    company: null,
    contact: null,
    delivery: null,
    products: null,
    options: null,
  });

  const t = (key: keyof typeof quoteTranslations): string => {
    const translation = quoteTranslations[key];
    if (!translation) return key;
    return translation[language] || translation.en;
  };

  // Form sections configuration
  const formSections: { id: FormSection; label: string; icon: React.ReactNode }[] = [
    { id: 'company', label: t('quote.step.company'), icon: <Building2 className="w-4 h-4" /> },
    { id: 'contact', label: t('quote.step.contact'), icon: <User className="w-4 h-4" /> },
    { id: 'delivery', label: t('quote.step.delivery'), icon: <MapPin className="w-4 h-4" /> },
    { id: 'products', label: t('quote.step.products'), icon: <FileText className="w-4 h-4" /> },
    { id: 'options', label: t('quote.step.options'), icon: <Clock className="w-4 h-4" /> },
  ];

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      companyName: '',
      vatNumber: '',
      companyType: '',
      website: '',
      contactName: '',
      email: '',
      phone: '',
      preferredLanguage: language as 'en' | 'es',
      country: 'spain',
      region: '',
      postalCode: '',
      items: '',
      urgency: 'normal',
      consent: false,
    },
    mode: 'onChange',
  });

  const quickForm = useForm<QuickQuoteFormData>({
    resolver: zodResolver(quickQuoteSchema),
    defaultValues: {
      email: '',
      description: '',
      quantity: '',
    },
    mode: 'onChange',
  });

  // Smart company type suggestion
  const handleCompanyNameChange = useCallback((value: string) => {
    const lowerValue = value.toLowerCase();
    for (const [type, keywords] of Object.entries(companyTypeSuggestions)) {
      if (keywords.some(keyword => lowerValue.includes(keyword))) {
        setSuggestedCompanyType(type);
        return;
      }
    }
    setSuggestedCompanyType(null);
  }, []);

  // Phone number formatting
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  }, []);

  // File handling with drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setFileError(null);

    if (file.size > MAX_FILE_SIZE) {
      setFileError(t('quote.error.file_size'));
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError(t('quote.error.file_type'));
      return;
    }

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Section navigation
  const scrollToSection = (sectionId: FormSection) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setCurrentSection(sectionId);
    setExpandedSections(prev => new Set<FormSection>([...Array.from(prev), sectionId]));
  };

  const toggleSection = (sectionId: FormSection) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
    setCurrentSection(sectionId);
  };

  // Mark section as complete based on form validation
  const updateSectionCompletion = useCallback(() => {
    const values = form.getValues();
    const newCompleted = new Set<FormSection>();

    // Company section
    if (values.companyName && values.vatNumber && values.companyType) {
      newCompleted.add('company');
    }

    // Contact section
    if (values.contactName && values.email && !form.formState.errors.email) {
      newCompleted.add('contact');
    }

    // Delivery section
    if (values.country) {
      newCompleted.add('delivery');
    }

    // Products section
    if (values.items || selectedFile) {
      newCompleted.add('products');
    }

    // Options section
    if (values.consent) {
      newCompleted.add('options');
    }

    setCompletedSections(newCompleted);
  }, [form, selectedFile]);

  // Watch form changes for section completion
  useEffect(() => {
    const subscription = form.watch(() => {
      updateSectionCompletion();
    });
    return () => subscription.unsubscribe();
  }, [form, updateSectionCompletion]);

  useEffect(() => {
    updateSectionCompletion();
  }, [selectedFile, updateSectionCompletion]);

  const onSubmit = async (data: QuoteFormData) => {
    // Validate that either items or file is provided
    if (!data.items?.trim() && !selectedFile) {
      form.setError('items', {
        type: 'manual',
        message: t('quote.validation.items_required'),
      });
      scrollToSection('products');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      const result = await response.json();
      setReferenceNumber(result.referenceNumber || `QR-${Date.now()}`);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Quote submission error:', error);
      setSubmitError(t('quote.error.message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onQuickSubmit = async (data: QuickQuoteFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isQuickQuote: true,
          urgency: 'normal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      const result = await response.json();
      setReferenceNumber(result.referenceNumber || `QR-${Date.now()}`);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Quick quote submission error:', error);
      setSubmitError(t('quote.error.message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewQuote = () => {
    setSubmitSuccess(false);
    setReferenceNumber(null);
    setSelectedFile(null);
    setCompletedSections(new Set());
    setCurrentSection('company');
    setExpandedSections(new Set<FormSection>(['company']));
    form.reset();
    quickForm.reset();
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `${language === 'es' ? 'Mi referencia de presupuesto InoxBolt' : 'My InoxBolt quote reference'}: ${referenceNumber}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container max-w-lg mx-auto px-4">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 pt-12 pb-8">
                <SuccessAnimation />
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
                  {t('quote.success.title')}
                </h2>
                <p className="text-slate-600 text-center px-6">
                  {t('quote.success.message')}
                </p>
              </div>

              <CardContent className="pt-6 pb-8">
                {referenceNumber && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-slate-500 mb-1">{t('quote.success.ref')}</p>
                    <p className="font-mono text-xl font-bold text-inox-teal">{referenceNumber}</p>
                  </div>
                )}

                {/* Next steps */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('quote.success.next_steps')}</h3>
                  <div className="space-y-3">
                    {[t('quote.success.step1'), t('quote.success.step2'), t('quote.success.step3')].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-inox-teal/10 flex items-center justify-center text-xs font-semibold text-inox-teal">
                          {i + 1}
                        </div>
                        <span className="text-sm text-slate-600">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleWhatsAppShare}
                    variant="outline"
                    className="w-full h-12 gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('quote.success.share')}
                  </Button>
                  <Button
                    onClick={handleNewQuote}
                    className="w-full h-12 bg-inox-teal hover:bg-teal-700"
                  >
                    {t('quote.success.new')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-24 pb-32 md:pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
              {t('quote.title')}
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              {t('quote.subtitle')}
            </p>
          </div>

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('quote.error.title')}</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'full')} className="w-full">
            <TabsList className="w-full h-auto p-1 mb-6 bg-slate-100">
              <TabsTrigger
                value="quick"
                className="flex-1 h-12 md:h-10 gap-2 text-sm md:text-base data-[state=active]:bg-white"
              >
                <Zap className="w-4 h-4" />
                {t('quote.tab.quick')}
              </TabsTrigger>
              <TabsTrigger
                value="full"
                className="flex-1 h-12 md:h-10 gap-2 text-sm md:text-base data-[state=active]:bg-white"
              >
                <FileText className="w-4 h-4" />
                {t('quote.tab.full')}
              </TabsTrigger>
            </TabsList>

            {/* Quick Quote Tab */}
            <TabsContent value="quick">
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{t('quote.quick.title')}</CardTitle>
                  <p className="text-sm text-slate-500">{t('quote.quick.subtitle')}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={quickForm.handleSubmit(onQuickSubmit)} className="space-y-5">
                    <div>
                      <FloatingLabelInput
                        label={t('quote.quick.email')}
                        type="email"
                        required
                        {...quickForm.register('email')}
                        error={quickForm.formState.errors.email?.message}
                      />
                    </div>

                    <div>
                      <FloatingLabelTextarea
                        label={t('quote.quick.description')}
                        required
                        {...quickForm.register('description')}
                        error={quickForm.formState.errors.description?.message}
                      />
                    </div>

                    <div>
                      <FloatingLabelInput
                        label={t('quote.quick.quantity')}
                        required
                        {...quickForm.register('quantity')}
                        error={quickForm.formState.errors.quantity?.message}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 text-lg font-semibold bg-inox-orange hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {t('quote.submitting')}
                        </>
                      ) : (
                        <>
                          {t('quote.quick.submit')}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Full Quote Tab */}
            <TabsContent value="full">
              {/* Progress indicator */}
              <FormProgress
                sections={formSections}
                currentSection={currentSection}
                completedSections={completedSections}
                onSectionClick={scrollToSection}
              />

              <Form {...form}>
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Company Details Section */}
                  <div ref={el => { sectionRefs.current.company = el; }}>
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('company')}
                        className="w-full"
                      >
                        <CardHeader className={cn(
                          "border-b transition-colors",
                          expandedSections.has('company') ? 'bg-slate-50/50' : 'bg-white',
                          currentSection === 'company' && 'ring-2 ring-inox-teal ring-inset'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                completedSections.has('company')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-inox-teal/10 text-inox-teal'
                              )}>
                                {completedSections.has('company') ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Building2 className="w-5 h-5" />
                                )}
                              </div>
                              <CardTitle className="text-lg text-left">{t('quote.company.title')}</CardTitle>
                            </div>
                            {expandedSections.has('company') ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </button>

                      {expandedSections.has('company') && (
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                              control={form.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.company.name')}
                                      required
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        handleCompanyNameChange(e.target.value);
                                      }}
                                      error={form.formState.errors.companyName?.message}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="vatNumber"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.company.vat')}
                                      required
                                      {...field}
                                      error={form.formState.errors.vatNumber?.message}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="companyType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">{t('quote.company.type')} *</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || suggestedCompanyType || ''}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full min-h-[52px] md:min-h-[44px]">
                                        <SelectValue placeholder={t('quote.company.type_placeholder')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="distributor">{t('quote.company.type_distributor')}</SelectItem>
                                      <SelectItem value="manufacturer">{t('quote.company.type_manufacturer')}</SelectItem>
                                      <SelectItem value="construction">{t('quote.company.type_construction')}</SelectItem>
                                      <SelectItem value="maintenance">{t('quote.company.type_maintenance')}</SelectItem>
                                      <SelectItem value="other">{t('quote.company.type_other')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {suggestedCompanyType && !field.value && (
                                    <p className="text-xs text-inox-teal mt-1">
                                      {language === 'es' ? 'Sugerido basado en el nombre' : 'Suggested based on name'}
                                    </p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.company.website')}
                                      type="url"
                                      {...field}
                                      error={form.formState.errors.website?.message}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* Contact Person Section */}
                  <div ref={el => { sectionRefs.current.contact = el; }}>
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('contact')}
                        className="w-full"
                      >
                        <CardHeader className={cn(
                          "border-b transition-colors",
                          expandedSections.has('contact') ? 'bg-slate-50/50' : 'bg-white',
                          currentSection === 'contact' && 'ring-2 ring-inox-teal ring-inset'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                completedSections.has('contact')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-inox-teal/10 text-inox-teal'
                              )}>
                                {completedSections.has('contact') ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <User className="w-5 h-5" />
                                )}
                              </div>
                              <CardTitle className="text-lg text-left">{t('quote.contact.title')}</CardTitle>
                            </div>
                            {expandedSections.has('contact') ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </button>

                      {expandedSections.has('contact') && (
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                              control={form.control}
                              name="contactName"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.contact.name')}
                                      required
                                      {...field}
                                      error={form.formState.errors.contactName?.message}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.contact.email')}
                                      type="email"
                                      required
                                      {...field}
                                      error={form.formState.errors.email?.message}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.contact.phone')}
                                      type="tel"
                                      {...field}
                                      onChange={(e) => handlePhoneChange(e, field.onChange)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="preferredLanguage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">{t('quote.contact.language')}</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex gap-4 pt-2"
                                    >
                                      <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-inox-teal transition-colors cursor-pointer min-h-[52px] md:min-h-[44px]">
                                        <RadioGroupItem value="es" id="lang-es" />
                                        <Label htmlFor="lang-es" className="font-normal cursor-pointer">Español</Label>
                                      </div>
                                      <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-inox-teal transition-colors cursor-pointer min-h-[52px] md:min-h-[44px]">
                                        <RadioGroupItem value="en" id="lang-en" />
                                        <Label htmlFor="lang-en" className="font-normal cursor-pointer">English</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* Delivery Details Section */}
                  <div ref={el => { sectionRefs.current.delivery = el; }}>
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('delivery')}
                        className="w-full"
                      >
                        <CardHeader className={cn(
                          "border-b transition-colors",
                          expandedSections.has('delivery') ? 'bg-slate-50/50' : 'bg-white',
                          currentSection === 'delivery' && 'ring-2 ring-inox-teal ring-inset'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                completedSections.has('delivery')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-inox-teal/10 text-inox-teal'
                              )}>
                                {completedSections.has('delivery') ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <MapPin className="w-5 h-5" />
                                )}
                              </div>
                              <CardTitle className="text-lg text-left">{t('quote.delivery.title')}</CardTitle>
                            </div>
                            {expandedSections.has('delivery') ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </button>

                      {expandedSections.has('delivery') && (
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">{t('quote.delivery.country')} *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="w-full min-h-[52px] md:min-h-[44px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="spain">{t('quote.delivery.country_spain')}</SelectItem>
                                      <SelectItem value="portugal">{t('quote.delivery.country_portugal')}</SelectItem>
                                      <SelectItem value="france">{t('quote.delivery.country_france')}</SelectItem>
                                      <SelectItem value="germany">{t('quote.delivery.country_germany')}</SelectItem>
                                      <SelectItem value="italy">{t('quote.delivery.country_italy')}</SelectItem>
                                      <SelectItem value="other">{t('quote.delivery.country_other')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {form.watch('country') === 'spain' && (
                              <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">{t('quote.delivery.region')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="w-full min-h-[52px] md:min-h-[44px]">
                                          <SelectValue placeholder={t('quote.delivery.region_placeholder')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="peninsula">{t('quote.delivery.region_peninsula')}</SelectItem>
                                        <SelectItem value="baleares">{t('quote.delivery.region_baleares')}</SelectItem>
                                        <SelectItem value="canarias">{t('quote.delivery.region_canarias')}</SelectItem>
                                        <SelectItem value="ceuta_melilla">{t('quote.delivery.region_ceuta_melilla')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <FloatingLabelInput
                                      label={t('quote.delivery.postal')}
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* Quote Content Section */}
                  <div ref={el => { sectionRefs.current.products = el; }}>
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('products')}
                        className="w-full"
                      >
                        <CardHeader className={cn(
                          "border-b transition-colors",
                          expandedSections.has('products') ? 'bg-slate-50/50' : 'bg-white',
                          currentSection === 'products' && 'ring-2 ring-inox-teal ring-inset'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                completedSections.has('products')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-inox-teal/10 text-inox-teal'
                              )}>
                                {completedSections.has('products') ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <CardTitle className="text-lg text-left">{t('quote.content.title')}</CardTitle>
                            </div>
                            {expandedSections.has('products') ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </button>

                      {expandedSections.has('products') && (
                        <CardContent className="pt-6 space-y-6">
                          <FormField
                            control={form.control}
                            name="items"
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <FloatingLabelTextarea
                                    label={t('quote.content.items')}
                                    {...field}
                                    error={form.formState.errors.items?.message}
                                  />
                                </FormControl>
                                <FormDescription className="mt-2">
                                  {t('quote.content.items_description')}
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          {/* File upload zone */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">{t('quote.content.upload')}</Label>

                            {/* Hidden file inputs */}
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                              className="hidden"
                            />
                            <input
                              type="file"
                              ref={cameraInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                            />

                            {!selectedFile ? (
                              <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                  'relative w-full rounded-xl border-2 border-dashed transition-all',
                                  isDragging
                                    ? 'border-inox-teal bg-inox-teal/5 scale-[1.02]'
                                    : fileError
                                      ? 'border-destructive bg-destructive/5'
                                      : 'border-slate-300 hover:border-inox-teal hover:bg-inox-teal/5'
                                )}
                              >
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <Upload className="w-6 h-6 text-slate-400" />
                                  </div>
                                  <p className="text-sm font-medium text-slate-600 mb-1">
                                    {t('quote.content.upload_drag')}
                                  </p>
                                  <p className="text-xs text-slate-400 mb-4">
                                    {t('quote.content.upload_or')}
                                  </p>

                                  {/* Action buttons */}
                                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="h-12 px-6 gap-2"
                                    >
                                      <Image className="w-4 h-4" />
                                      {t('quote.content.upload_browse')}
                                    </Button>
                                    {/* Camera button - only show on mobile */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => cameraInputRef.current?.click()}
                                      className="h-12 px-6 gap-2 sm:hidden"
                                    >
                                      <Camera className="w-4 h-4" />
                                      {t('quote.content.upload_camera')}
                                    </Button>
                                  </div>

                                  <p className="text-xs text-slate-400 mt-4">
                                    {t('quote.content.upload_description')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <FilePreview file={selectedFile} onRemove={removeFile} />
                                {isUploading && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500">
                                      <span>{t('quote.content.uploading')}</span>
                                      <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-1.5" />
                                  </div>
                                )}
                              </div>
                            )}

                            {fileError && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {fileError}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* Additional Options Section */}
                  <div ref={el => { sectionRefs.current.options = el; }}>
                    <Card className="border-0 shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('options')}
                        className="w-full"
                      >
                        <CardHeader className={cn(
                          "border-b transition-colors",
                          expandedSections.has('options') ? 'bg-slate-50/50' : 'bg-white',
                          currentSection === 'options' && 'ring-2 ring-inox-teal ring-inset'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                completedSections.has('options')
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-inox-teal/10 text-inox-teal'
                              )}>
                                {completedSections.has('options') ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                              </div>
                              <CardTitle className="text-lg text-left">{t('quote.options.title')}</CardTitle>
                            </div>
                            {expandedSections.has('options') ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </CardHeader>
                      </button>

                      {expandedSections.has('options') && (
                        <CardContent className="pt-6 space-y-6">
                          <FormField
                            control={form.control}
                            name="urgency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">{t('quote.options.urgency')}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                  >
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-inox-teal transition-colors cursor-pointer min-h-[56px]">
                                      <RadioGroupItem value="normal" id="urgency-normal" />
                                      <Label htmlFor="urgency-normal" className="font-normal cursor-pointer flex-1">
                                        {t('quote.options.normal')}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-inox-orange transition-colors cursor-pointer min-h-[56px]">
                                      <RadioGroupItem value="urgent" id="urgency-urgent" />
                                      <Label htmlFor="urgency-urgent" className="font-normal cursor-pointer flex-1 text-inox-orange">
                                        {t('quote.options.urgent')}
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="consent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 min-h-[56px]">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-0.5"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal text-sm text-slate-600 cursor-pointer">
                                    {t('quote.options.consent')} *
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      )}
                    </Card>
                  </div>

                  {/* Desktop Submit Button */}
                  <div className="hidden md:flex justify-center pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-12 py-6 text-lg font-semibold bg-inox-orange hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {t('quote.submitting')}
                        </>
                      ) : (
                        <>
                          {t('quote.submit')}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Sticky Submit Button */}
      {activeTab === 'full' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold bg-inox-orange hover:bg-orange-600 shadow-lg shadow-orange-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t('quote.submitting')}
              </>
            ) : (
              <>
                {t('quote.submit')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}

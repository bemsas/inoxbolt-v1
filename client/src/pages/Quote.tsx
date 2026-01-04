import React, { useState, useRef } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertCircle
} from 'lucide-react';

// Translations for the quote page
const quoteTranslations = {
  // Page titles
  'quote.title': { en: 'Request a Quote', es: 'Solicitar Presupuesto' },
  'quote.subtitle': { en: 'Get a personalized quote for your B2B fastener needs. We respond within 48 hours (24h for urgent requests).', es: 'Obtén un presupuesto personalizado para tus necesidades de fijaciones B2B. Respondemos en 48 horas (24h para solicitudes urgentes).' },

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
  'quote.content.upload_drag': { en: 'Drag & drop or click to upload', es: 'Arrastra o haz clic para subir' },
  'quote.content.file_selected': { en: 'File selected:', es: 'Archivo seleccionado:' },

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
} as const;

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

type QuoteFormData = z.infer<typeof quoteFormSchema>;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function QuotePage() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: keyof typeof quoteTranslations): string => {
    const translation = quoteTranslations[key];
    if (!translation) return key;
    return translation[language] || translation.en;
  };

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
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(t('quote.error.file_size'));
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError(t('quote.error.file_type'));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: QuoteFormData) => {
    // Validate that either items or file is provided
    if (!data.items?.trim() && !selectedFile) {
      form.setError('items', {
        type: 'manual',
        message: t('quote.validation.items_required'),
      });
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

  const handleNewQuote = () => {
    setSubmitSuccess(false);
    setReferenceNumber(null);
    setSelectedFile(null);
    form.reset();
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container max-w-2xl mx-auto px-4">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {t('quote.success.title')}
                </h2>
                <p className="text-slate-600 mb-6">
                  {t('quote.success.message')}
                </p>
                {referenceNumber && (
                  <p className="text-sm text-slate-500 mb-8">
                    {t('quote.success.ref')} <span className="font-mono font-semibold text-inox-teal">{referenceNumber}</span>
                  </p>
                )}
                <Button onClick={handleNewQuote} variant="outline" size="lg">
                  {t('quote.success.new')}
                </Button>
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

      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('quote.title')}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Details Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-inox-teal/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-inox-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('quote.company.title')}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.company.name')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.company.name_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.company.vat')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.company.vat_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.company.type')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.company.website')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.company.website_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Person Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-inox-teal/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-inox-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('quote.contact.title')}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.contact.name')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.contact.name_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.contact.email')} *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('quote.contact.email_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.contact.phone')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.contact.phone_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.contact.language')}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6 pt-2"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="es" id="lang-es" />
                                <Label htmlFor="lang-es" className="font-normal cursor-pointer">ES</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="en" id="lang-en" />
                                <Label htmlFor="lang-en" className="font-normal cursor-pointer">EN</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Details Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-inox-teal/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-inox-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('quote.delivery.title')}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('quote.delivery.country')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
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
                            <FormLabel>{t('quote.delivery.region')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
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
                        <FormItem>
                          <FormLabel>{t('quote.delivery.postal')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('quote.delivery.postal_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quote Content Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-inox-teal/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-inox-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('quote.content.title')}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quote.content.items')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('quote.content.items_placeholder')}
                            className="min-h-[150px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('quote.content.items_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>{t('quote.content.upload')}</Label>
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full px-4 py-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                        fileError
                          ? 'border-destructive bg-destructive/5'
                          : selectedFile
                            ? 'border-inox-teal bg-inox-teal/5'
                            : 'border-slate-300 hover:border-inox-teal hover:bg-inox-teal/5'
                      }`}>
                        {selectedFile ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-inox-teal" />
                            <span className="text-sm font-medium text-slate-700">
                              {t('quote.content.file_selected')} {selectedFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                              }}
                              className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                              <X className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm font-medium text-slate-600">
                              {t('quote.content.upload_drag')}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                              {t('quote.content.upload_description')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {fileError && (
                      <p className="text-sm text-destructive">{fileError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Options Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-inox-teal/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-inox-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('quote.options.title')}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quote.options.urgency')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row gap-4"
                          >
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-inox-teal transition-colors cursor-pointer flex-1">
                              <RadioGroupItem value="normal" id="urgency-normal" />
                              <Label htmlFor="urgency-normal" className="font-normal cursor-pointer flex-1">
                                {t('quote.options.normal')}
                              </Label>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-inox-orange transition-colors cursor-pointer flex-1">
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
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
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
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
                    t('quote.submit')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  Mail,
  FileText,
  ExternalLink,
  Send,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRAG } from '@/contexts/RAGContext';
import type { ProductInfo } from '@/types/product';
import {
  extractProductName,
  generateWhatsAppMessage,
  generateEmailSubject,
  generateEmailBody,
  getSuggestedQuantity,
  cleanProductContent,
  getStandardInfo,
  STANDARD_INFO,
} from '@/types/product';
import { toExtendedProductInfo, FastenerCategory } from '@/types/product-extended';

/**
 * Convert product type string to FastenerCategory
 */
function inferCategoryFromStandard(productType: string): FastenerCategory {
  const lower = productType.toLowerCase();
  if (lower.includes('bolt')) return 'bolt';
  if (lower.includes('screw')) return 'screw';
  if (lower.includes('nut')) return 'nut';
  if (lower.includes('washer')) return 'washer';
  if (lower.includes('anchor')) return 'anchor';
  if (lower.includes('rivet')) return 'rivet';
  if (lower.includes('rod')) return 'threaded_rod';
  if (lower.includes('stud')) return 'bolt';
  if (lower.includes('pin')) return 'pin';
  return 'other';
}

// Import modular sections
import { ProductHeader } from './sections/ProductHeader';
import { TechnicalSpecs } from './sections/TechnicalSpecs';
import { CertificationsSection } from './sections/CertificationsSection';
import { SourceReferenceSection } from './sections/SourceReferenceSection';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductInfo | null;
}

const WHATSAPP_NUMBER = '34000000000';
const EMAIL_ADDRESS = 'enquiries@inoxbolt.es';

const UNITS = {
  en: [
    { value: 'pcs', label: 'Pieces' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'kg', label: 'Kilograms' },
  ],
  es: [
    { value: 'pcs', label: 'Unidades' },
    { value: 'boxes', label: 'Cajas' },
    { value: 'kg', label: 'Kilogramos' },
  ],
};

export function ProductDetailModal({ open, onClose, product }: ProductDetailModalProps) {
  const { language } = useLanguage();
  const { setChatOpen, sendMessage } = useRAG();
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('pcs');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');

  // Convert ProductInfo to ExtendedProductInfo for section components
  const extendedProduct = useMemo(() => {
    if (!product) return null;
    return toExtendedProductInfo(product);
  }, [product]);

  // Get standard info for product type
  const standardInfo = useMemo(() => {
    if (!product?.standard) return null;
    return getStandardInfo(product.standard);
  }, [product?.standard]);

  // Clean content for display
  const contentDisplay = useMemo(() => {
    if (!product?.content) return null;
    return cleanProductContent(product.content);
  }, [product?.content]);

  // Set suggested quantity when product changes
  useMemo(() => {
    if (product) {
      const suggested = getSuggestedQuantity(product);
      setQuantity(String(suggested));
    }
  }, [product?.id]);

  if (!product || !extendedProduct) return null;

  // Use standard info to enhance product name
  const productName = extractProductName({
    ...product,
    headType: product.headType || standardInfo?.head,
  });

  // Determine product type label for display
  const productTypeLabel = standardInfo?.type || extendedProduct.category || 'Fastener';

  const units = UNITS[language] || UNITS.en;

  const handleAskAI = () => {
    const question =
      language === 'es'
        ? `Dame más información sobre: ${productName}${product.material ? `, material ${product.material}` : ''}${product.supplier ? ` del catálogo ${product.supplier}` : ''}`
        : `Tell me more about: ${productName}${product.material ? `, material ${product.material}` : ''}${product.supplier ? ` from ${product.supplier} catalogue` : ''}`;

    onClose();
    setChatOpen(true);
    setTimeout(() => {
      sendMessage(question, language);
    }, 100);
  };

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(
      product,
      parseInt(quantity) || 1,
      units.find((u) => u.value === unit)?.label || unit,
      notes,
      company
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = generateEmailSubject(product);
    const body = generateEmailBody(
      product,
      parseInt(quantity) || 1,
      units.find((u) => u.value === unit)?.label || unit,
      notes,
      company
    );
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const t = {
    productDetails: language === 'es' ? 'Detalles del Producto' : 'Product Details',
    description: language === 'es' ? 'Descripción' : 'Description',
    askAI: language === 'es' ? 'Preguntar al Asistente IA' : 'Ask AI Assistant',
    askAIDesc:
      language === 'es'
        ? 'Obtén más detalles, especificaciones técnicas o productos compatibles'
        : 'Get more details, technical specs, or compatible products',
    requestQuote: language === 'es' ? 'Solicitar Cotización' : 'Request Quote',
    requestQuoteDesc:
      language === 'es'
        ? 'Envía una solicitud de cotización por WhatsApp o Email'
        : 'Send a quote request via WhatsApp or Email',
    quantity: language === 'es' ? 'Cantidad' : 'Quantity',
    unitLabel: language === 'es' ? 'Unidad' : 'Unit',
    notes: language === 'es' ? 'Notas (opcional)' : 'Notes (optional)',
    notesPlaceholder:
      language === 'es'
        ? 'Requisitos especiales, entrega, etc.'
        : 'Special requirements, delivery, etc.',
    company: language === 'es' ? 'Empresa (opcional)' : 'Company (optional)',
    sendWhatsApp: language === 'es' ? 'Enviar por WhatsApp' : 'Send via WhatsApp',
    sendEmail: language === 'es' ? 'Enviar por Email' : 'Send via Email',
    back: language === 'es' ? 'Volver' : 'Back',
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-inox-teal" />
            {t.productDetails}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {/* Product Header Section */}
          <ProductHeader
            name={productName}
            brand={extendedProduct.brand}
            category={standardInfo ? inferCategoryFromStandard(standardInfo.type) : extendedProduct.category}
            availability={extendedProduct.pricing?.availability}
            compact
            className="pb-4"
          />

          <Separator className="my-4" />

          {/* Technical Specs Section */}
          <TechnicalSpecs
            dimensions={extendedProduct.dimensions}
            material={extendedProduct.material}
            mechanicalProperties={extendedProduct.mechanicalProperties}
            primaryStandard={extendedProduct.primaryStandard}
            headType={extendedProduct.headType || standardInfo?.head}
            driveType={extendedProduct.driveType || (standardInfo?.drive as any)}
            compact
            expandable
            className="pb-4"
          />

          {/* Certifications Section */}
          {extendedProduct.certifications.length > 0 && (
            <>
              <Separator className="my-4" />
              <CertificationsSection
                certifications={extendedProduct.certifications}
                primaryStandard={extendedProduct.primaryStandard}
                showDownloads={false}
                compact
                className="pb-4"
              />
            </>
          )}

          {/* Product Variants (if available) */}
          {contentDisplay && contentDisplay.variants.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  {language === 'es' ? 'Tamaños Disponibles' : 'Available Sizes'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {contentDisplay.variants.slice(0, 6).map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-900">{variant.size}</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-500">
                        {variant.packaging && (
                          <span>{variant.packaging} pcs</span>
                        )}
                        {variant.price && (
                          <span className="text-inox-teal font-medium">{variant.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {contentDisplay.variants.length > 6 && (
                  <p className="text-xs text-slate-500 mt-2">
                    +{contentDisplay.variants.length - 6} {language === 'es' ? 'más tamaños' : 'more sizes'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Source Reference Section */}
          <Separator className="my-4" />
          <SourceReferenceSection
            sourceReference={extendedProduct.sourceReference}
            dataQuality={extendedProduct.dataQuality}
            showCatalogueLink={false}
            compact
            className="pb-4"
          />

          <Separator className="my-4" />

          {/* Actions */}
          {!showQuoteForm ? (
            <div className="space-y-3 pb-6">
              {/* Ask AI Button */}
              <button
                onClick={handleAskAI}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-inox-teal/20 hover:border-inox-teal hover:bg-inox-teal/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-inox-teal/10 flex items-center justify-center group-hover:bg-inox-teal/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-inox-teal" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">{t.askAI}</p>
                  <p className="text-sm text-slate-500">{t.askAIDesc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-inox-teal transition-colors" />
              </button>

              {/* Request Quote Button */}
              <button
                onClick={() => setShowQuoteForm(true)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-inox-blue hover:bg-inox-blue/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-inox-blue/10 transition-colors">
                  <Send className="w-6 h-6 text-slate-600 group-hover:text-inox-blue" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">{t.requestQuote}</p>
                  <p className="text-sm text-slate-500">{t.requestQuoteDesc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-inox-blue transition-colors" />
              </button>
            </div>
          ) : (
            /* Quote Form - B2B Optimized */
            <div className="space-y-4 pb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuoteForm(false)}
                className="mb-2"
              >
                ← {t.back}
              </Button>

              {/* Product Summary */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="font-semibold text-sm text-slate-900">{productName}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600">
                  {product.material && (
                    <span className="bg-white px-2 py-0.5 rounded border">{product.material}</span>
                  )}
                  {product.supplier && (
                    <span className="bg-white px-2 py-0.5 rounded border">{product.supplier}</span>
                  )}
                  {standardInfo?.type && (
                    <span className="bg-inox-teal/10 text-inox-teal px-2 py-0.5 rounded">
                      {standardInfo.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity and Unit - Enhanced with MOQ hint */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="quantity">{t.quantity}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step={getSuggestedQuantity(product)}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 text-lg font-semibold"
                  />
                  {product.packagingUnit && (
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es' ? 'Unidad de embalaje' : 'Packaging unit'}: {product.packagingUnit}
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <Label htmlFor="unit">{t.unitLabel}</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Quantity Buttons */}
              <div className="flex flex-wrap gap-2">
                {[100, 250, 500, 1000].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setQuantity(String(qty))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      quantity === String(qty)
                        ? 'bg-inox-teal text-white border-inox-teal'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-inox-teal hover:text-inox-teal'
                    }`}
                  >
                    {qty} {language === 'es' ? 'uds' : 'pcs'}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="mt-1 min-h-[60px]"
                />
              </div>

              {/* Company */}
              <div>
                <Label htmlFor="company">{t.company}</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1"
                  placeholder={language === 'es' ? 'Nombre de su empresa' : 'Your company name'}
                />
              </div>

              {/* Lead time hint */}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span>📦</span>
                {language === 'es'
                  ? 'Típicamente 2-5 días hábiles para stock. Consultaremos disponibilidad.'
                  : 'Typically 2-5 business days for stock items. We will confirm availability.'}
              </p>

              {/* Send buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleWhatsApp}
                  disabled={!quantity || parseInt(quantity) < 1}
                  className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.sendWhatsApp}
                </Button>
                <Button
                  onClick={handleEmail}
                  disabled={!quantity || parseInt(quantity) < 1}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t.sendEmail}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailModal;

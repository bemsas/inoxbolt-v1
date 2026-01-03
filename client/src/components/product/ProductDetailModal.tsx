import React, { useState } from 'react';
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
  getMaterialInfo,
  generateWhatsAppMessage,
  generateEmailSubject,
  generateEmailBody,
} from '@/types/product';

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

  if (!product) return null;

  const productName = extractProductName(product);
  const materialInfo = getMaterialInfo(product.material);
  const units = UNITS[language] || UNITS.en;

  const handleAskAI = () => {
    // Open chat and send a question about this product
    const question =
      language === 'es'
        ? `Dame más información sobre: ${productName}${product.material ? `, material ${product.material}` : ''}${product.supplier ? ` del catálogo ${product.supplier}` : ''}`
        : `Tell me more about: ${productName}${product.material ? `, material ${product.material}` : ''}${product.supplier ? ` from ${product.supplier} catalogue` : ''}`;

    onClose();
    setChatOpen(true);
    // Small delay to ensure chat is open before sending
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
    source: language === 'es' ? 'Fuente' : 'Source',
    page: language === 'es' ? 'Página' : 'Page',
    material: language === 'es' ? 'Material' : 'Material',
    standard: language === 'es' ? 'Norma' : 'Standard',
    thread: language === 'es' ? 'Rosca' : 'Thread',
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
          {/* Product Header */}
          <div className="space-y-4 pb-4">
            <h2 className="text-xl font-bold text-slate-900">{productName}</h2>

            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2">
              {product.standard && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
                  <span className="text-xs text-slate-500">{t.standard}:</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {product.standard}
                  </span>
                </div>
              )}
              {product.threadType && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-inox-blue/10">
                  <span className="text-xs text-inox-blue/70">{t.thread}:</span>
                  <span className="text-sm font-semibold text-inox-blue">
                    {product.threadType.toUpperCase()}
                  </span>
                </div>
              )}
              {materialInfo && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${materialInfo.color}`}
                >
                  <span className="text-xs opacity-70">{t.material}:</span>
                  <span className="text-sm font-semibold">{materialInfo.name}</span>
                </div>
              )}
            </div>

            {/* Source info */}
            {(product.supplier || product.pageNumber) && (
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>
                  {t.source}: <strong>{product.supplier || 'Catalogue'}</strong>
                  {product.pageNumber && (
                    <>
                      {' '}
                      • {t.page} {product.pageNumber}
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Full content/description */}
          {product.content && (
            <div className="pb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">{t.description}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.content}
              </p>
            </div>
          )}

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
            /* Quote Form */
            <div className="space-y-4 pb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuoteForm(false)}
                className="mb-2"
              >
                ← {t.back}
              </Button>

              {/* Quantity and Unit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="quantity">{t.quantity}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1"
                  />
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

              {/* Notes */}
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="mt-1 min-h-[80px]"
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
                />
              </div>

              {/* Send buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleWhatsApp}
                  disabled={!quantity}
                  className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.sendWhatsApp}
                </Button>
                <Button
                  onClick={handleEmail}
                  disabled={!quantity}
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

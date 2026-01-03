import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ProductInfo } from '@/types/product';
import {
  extractProductName,
  getMaterialInfo,
  generateWhatsAppMessage,
  generateEmailSubject,
  generateEmailBody,
} from '@/types/product';

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductInfo | null;
}

const WHATSAPP_NUMBER = '34000000000'; // Replace with actual number
const EMAIL_ADDRESS = 'enquiries@inoxbolt.es';

const UNITS = {
  en: [
    { value: 'pcs', label: 'Pieces' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'sets', label: 'Sets' },
  ],
  es: [
    { value: 'pcs', label: 'Unidades' },
    { value: 'boxes', label: 'Cajas' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'sets', label: 'Juegos' },
  ],
};

export function InquiryModal({ open, onClose, product }: InquiryModalProps) {
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('pcs');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with new product
  useEffect(() => {
    if (open) {
      setQuantity('100');
      setUnit('pcs');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const productName = extractProductName(product);
  const materialInfo = getMaterialInfo(product.material);
  const units = UNITS[language] || UNITS.en;

  const handleWhatsApp = () => {
    setIsSubmitting(true);
    const message = generateWhatsAppMessage(
      product,
      parseInt(quantity) || 1,
      units.find((u) => u.value === unit)?.label || unit,
      notes,
      company
    );
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const handleEmail = () => {
    setIsSubmitting(true);
    const subject = generateEmailSubject(product);
    const body = generateEmailBody(
      product,
      parseInt(quantity) || 1,
      units.find((u) => u.value === unit)?.label || unit,
      notes,
      company
    );
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const t = {
    title: language === 'es' ? 'Solicitar Cotización' : 'Request Quote',
    description:
      language === 'es'
        ? 'Complete los detalles para solicitar una cotización'
        : 'Fill in the details to request a quote',
    productLabel: language === 'es' ? 'Producto' : 'Product',
    materialLabel: language === 'es' ? 'Material' : 'Material',
    sourceLabel: language === 'es' ? 'Fuente' : 'Source',
    quantityLabel: language === 'es' ? 'Cantidad' : 'Quantity',
    unitLabel: language === 'es' ? 'Unidad' : 'Unit',
    notesLabel: language === 'es' ? 'Notas (opcional)' : 'Notes (optional)',
    notesPlaceholder:
      language === 'es'
        ? 'Ej: Necesito entrega en Tenerife, certificados requeridos...'
        : 'E.g., Need delivery to Tenerife, certificates required...',
    emailLabel: language === 'es' ? 'Email (opcional)' : 'Email (optional)',
    companyLabel: language === 'es' ? 'Empresa (opcional)' : 'Company (optional)',
    whatsappBtn: language === 'es' ? 'Enviar por WhatsApp' : 'Send via WhatsApp',
    emailBtn: language === 'es' ? 'Enviar por Email' : 'Send via Email',
    page: language === 'es' ? 'pág.' : 'p.',
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-inox-teal" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {/* Product Summary */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              {t.productLabel}
            </span>
            <p className="font-semibold text-slate-900">{productName}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {materialInfo && (
              <div>
                <span className="text-xs text-slate-500">{t.materialLabel}:</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${materialInfo.color}`}
                >
                  {materialInfo.name}
                </span>
              </div>
            )}
            {(product.supplier || product.pageNumber) && (
              <div>
                <span className="text-xs text-slate-500">{t.sourceLabel}:</span>
                <span className="ml-1 text-slate-700">
                  {product.supplier}
                  {product.pageNumber && ` • ${t.page} ${product.pageNumber}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Quantity and Unit */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="quantity">{t.quantityLabel}</Label>
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
            <Label htmlFor="notes">{t.notesLabel}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Contact Info */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="company">{t.companyLabel}</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            onClick={handleWhatsApp}
            disabled={isSubmitting || !quantity}
            className="w-full sm:w-auto gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
          >
            <MessageCircle className="w-4 h-4" />
            {t.whatsappBtn}
          </Button>
          <Button
            onClick={handleEmail}
            disabled={isSubmitting || !quantity}
            variant="outline"
            className="w-full sm:w-auto gap-2"
          >
            <Mail className="w-4 h-4" />
            {t.emailBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InquiryModal;

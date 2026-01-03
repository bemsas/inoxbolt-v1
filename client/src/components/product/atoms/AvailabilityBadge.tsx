import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import type { PricingData } from '@/types/product-extended';
import { useLanguage } from '@/contexts/LanguageContext';

interface AvailabilityBadgeProps {
  status: PricingData['availability'];
  leadTimeDays?: number;
  className?: string;
}

const STATUS_CONFIG = {
  in_stock: {
    icon: CheckCircle,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: { en: 'In Stock', es: 'En Stock' },
  },
  limited: {
    icon: AlertCircle,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: { en: 'Limited Stock', es: 'Stock Limitado' },
  },
  on_order: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: { en: 'On Order', es: 'Bajo Pedido' },
  },
  discontinued: {
    icon: XCircle,
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    label: { en: 'Discontinued', es: 'Descontinuado' },
  },
};

export function AvailabilityBadge({ status, leadTimeDays, className = '' }: AvailabilityBadgeProps) {
  const { language } = useLanguage();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-medium ${config.color} ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label[language] || config.label.en}</span>
      {status === 'on_order' && leadTimeDays && (
        <span className="text-xs opacity-75">
          ({leadTimeDays} {language === 'es' ? 'días' : 'days'})
        </span>
      )}
    </div>
  );
}

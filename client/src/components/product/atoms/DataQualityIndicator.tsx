import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataQualityIndicatorProps {
  score: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function DataQualityIndicator({
  score,
  showLabel = true,
  size = 'md',
  className = '',
}: DataQualityIndicatorProps) {
  const { language } = useLanguage();

  const getConfig = () => {
    if (score >= 80) {
      return {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        label: language === 'es' ? 'Datos completos' : 'Complete data',
      };
    }
    if (score >= 50) {
      return {
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        label: language === 'es' ? 'Datos parciales' : 'Partial data',
      };
    }
    return {
      icon: XCircle,
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
      label: language === 'es' ? 'Datos limitados' : 'Limited data',
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: { icon: 'w-3.5 h-3.5', text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-2.5 py-1.5' },
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md ${config.bgColor} ${sizeClasses[size].padding} ${className}`}
      title={`${language === 'es' ? 'Calidad de datos' : 'Data quality'}: ${score}%`}
    >
      <Icon className={`${sizeClasses[size].icon} ${config.color}`} />
      {showLabel && (
        <span className={`${sizeClasses[size].text} font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
      <span className={`${sizeClasses[size].text} ${config.color} opacity-75`}>
        {score}%
      </span>
    </div>
  );
}

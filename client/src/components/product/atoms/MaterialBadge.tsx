import React from 'react';
import type { MaterialSpecification } from '@/types/product-extended';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaterialBadgeProps {
  material: MaterialSpecification;
  size?: 'sm' | 'md' | 'lg';
  showGroup?: boolean;
  className?: string;
}

const GROUP_COLORS: Record<MaterialSpecification['group'], string> = {
  stainless_steel: 'bg-teal-100 text-teal-800 border-teal-200',
  carbon_steel: 'bg-slate-100 text-slate-700 border-slate-300',
  alloy_steel: 'bg-amber-100 text-amber-800 border-amber-200',
  brass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aluminum: 'bg-sky-100 text-sky-800 border-sky-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const GROUP_LABELS: Record<MaterialSpecification['group'], { en: string; es: string }> = {
  stainless_steel: { en: 'Stainless Steel', es: 'Acero Inoxidable' },
  carbon_steel: { en: 'Carbon Steel', es: 'Acero al Carbono' },
  alloy_steel: { en: 'Alloy Steel', es: 'Acero Aleado' },
  brass: { en: 'Brass', es: 'Latón' },
  aluminum: { en: 'Aluminum', es: 'Aluminio' },
  other: { en: 'Other', es: 'Otro' },
};

export function MaterialBadge({
  material,
  size = 'md',
  showGroup = false,
  className = '',
}: MaterialBadgeProps) {
  const { language } = useLanguage();
  const colorClass = GROUP_COLORS[material.group];
  const groupLabel = GROUP_LABELS[material.group][language] || GROUP_LABELS[material.group].en;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      <span className="font-bold">{material.code}</span>
      {showGroup && (
        <>
          <span className="opacity-50">•</span>
          <span className="opacity-75">{groupLabel}</span>
        </>
      )}
      {material.grade && (
        <span className="text-xs opacity-60">({material.grade})</span>
      )}
    </div>
  );
}

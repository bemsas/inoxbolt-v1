import React from 'react';
import { Award, Shield, FileCheck } from 'lucide-react';
import type { Certification, CertificationBody } from '@/types/product-extended';

interface CertificationBadgeProps {
  certification: Certification;
  showDescription?: boolean;
  onClick?: () => void;
  className?: string;
}

const CERT_ICONS: Record<CertificationBody, typeof Award> = {
  DIN: FileCheck,
  ISO: FileCheck,
  ASTM: FileCheck,
  CE: Shield,
  TUV: Award,
  REACH: Shield,
  RoHS: Shield,
};

const CERT_COLORS: Record<CertificationBody, string> = {
  DIN: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  ISO: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  ASTM: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  CE: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  TUV: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
  REACH: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  RoHS: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
};

export function CertificationBadge({
  certification,
  showDescription = false,
  onClick,
  className = '',
}: CertificationBadgeProps) {
  const Icon = CERT_ICONS[certification.type] || FileCheck;
  const colorClass = CERT_COLORS[certification.type] || 'bg-slate-50 text-slate-700 border-slate-200';

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${colorClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold leading-tight">
          {certification.standardNumber}
        </span>
        {showDescription && certification.description && (
          <span className="text-xs opacity-75 leading-tight">
            {certification.description}
          </span>
        )}
      </div>
    </div>
  );

  return badge;
}

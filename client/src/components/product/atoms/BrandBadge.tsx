import React from 'react';
import type { BrandInfo } from '@/types/product-extended';

interface BrandBadgeProps {
  brand: BrandInfo;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandBadge({ brand, size = 'md', className = '' }: BrandBadgeProps) {
  const sizeClasses = {
    sm: 'h-5 text-xs px-2',
    md: 'h-6 text-sm px-2.5',
    lg: 'h-8 text-base px-3',
  };

  const logoSizes = {
    sm: 'h-4 w-auto',
    md: 'h-5 w-auto',
    lg: 'h-6 w-auto',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 ${sizeClasses[size]} ${className}`}
    >
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className={`${logoSizes[size]} object-contain`}
        />
      ) : (
        <span className="font-semibold text-slate-700">{brand.name}</span>
      )}
      {brand.logoUrl && (
        <span className="font-medium text-slate-600">{brand.name}</span>
      )}
    </div>
  );
}

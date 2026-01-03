import React from 'react';

interface SpecRowProps {
  label: string;
  value: string | number | undefined | null;
  unit?: string;
  highlight?: boolean;
  className?: string;
}

export function SpecRow({ label, value, unit, highlight = false, className = '' }: SpecRowProps) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between py-2 border-b border-slate-100 last:border-0 ${
        highlight ? 'bg-inox-teal/5' : ''
      } ${className}`}
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-inox-teal' : 'text-slate-900'}`}>
        {value}
        {unit && <span className="text-slate-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

interface SpecGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export function SpecGrid({ children, columns = 1, className = '' }: SpecGridProps) {
  return (
    <div
      className={`grid gap-x-6 ${columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} ${className}`}
    >
      {children}
    </div>
  );
}

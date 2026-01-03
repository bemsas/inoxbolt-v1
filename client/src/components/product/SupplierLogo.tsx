import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SupplierId,
  getSupplierConfig,
  normalizeSupplierName,
} from '@/config/suppliers';

export type SupplierLogoSize = 'sm' | 'md' | 'lg';

interface SupplierLogoProps {
  /** Supplier ID or name string */
  supplier: string | SupplierId | null | undefined;
  /** Size variant */
  size?: SupplierLogoSize;
  /** Show link to supplier website */
  showLink?: boolean;
  /** Show country flag */
  showCountry?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Use compact badge style instead of full logo */
  variant?: 'logo' | 'badge' | 'minimal';
}

/**
 * Size configurations for logo display
 */
const SIZE_CONFIG: Record<SupplierLogoSize, {
  logo: string;
  badge: string;
  text: string;
  icon: string;
  padding: string;
}> = {
  sm: {
    logo: 'h-4 w-auto',
    badge: 'h-5 px-1.5 gap-1',
    text: 'text-[10px]',
    icon: 'w-2.5 h-2.5',
    padding: 'py-0.5',
  },
  md: {
    logo: 'h-5 w-auto',
    badge: 'h-6 px-2 gap-1.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
    padding: 'py-0.5',
  },
  lg: {
    logo: 'h-6 w-auto',
    badge: 'h-8 px-2.5 gap-2',
    text: 'text-sm',
    icon: 'w-3.5 h-3.5',
    padding: 'py-1',
  },
};

/**
 * Inline SVG placeholder logos for suppliers
 * These are simplified text-based representations
 */
function SupplierPlaceholderLogo({
  supplierId,
  size,
}: {
  supplierId: SupplierId;
  size: SupplierLogoSize;
}) {
  const config = getSupplierConfig(supplierId);
  const sizeClass = SIZE_CONFIG[size].logo;

  // Custom styled text logos for each supplier
  const logoStyles: Record<SupplierId, React.ReactNode> = {
    reyher: (
      <span className={cn('font-black tracking-tighter', sizeClass)} style={{ color: config.primaryColor }}>
        REYHER
      </span>
    ),
    wurth: (
      <span className={cn('font-black tracking-tight', sizeClass)} style={{ color: config.primaryColor }}>
        WURTH
      </span>
    ),
    bossard: (
      <span className={cn('font-bold tracking-wide uppercase', sizeClass)} style={{ color: config.primaryColor }}>
        BOSSARD
      </span>
    ),
    fabory: (
      <span className={cn('font-bold tracking-normal', sizeClass)} style={{ color: config.primaryColor }}>
        FABORY
      </span>
    ),
    hilti: (
      <span className={cn('font-black tracking-tight italic', sizeClass)} style={{ color: config.primaryColor }}>
        HILTI
      </span>
    ),
    fischer: (
      <span className={cn('font-bold tracking-tight lowercase', sizeClass)} style={{ color: config.primaryColor }}>
        fischer
      </span>
    ),
    klimas: (
      <div className="flex items-center gap-1">
        <span
          className={cn('font-black', size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base')}
          style={{ color: config.primaryColor }}
        >
          KLIMAS
        </span>
      </div>
    ),
    fastenal: (
      <span className={cn('font-bold tracking-tight', sizeClass)} style={{ color: config.primaryColor }}>
        FASTENAL
      </span>
    ),
    other: (
      <span className={cn('font-medium text-slate-500', sizeClass)}>
        SUPPLIER
      </span>
    ),
  };

  return <>{logoStyles[supplierId] || logoStyles.other}</>;
}

/**
 * SupplierLogo component
 * Displays supplier branding with fallback to styled text badge
 */
export function SupplierLogo({
  supplier,
  size = 'md',
  showLink = false,
  showCountry = false,
  className = '',
  variant = 'badge',
}: SupplierLogoProps) {
  const supplierId = normalizeSupplierName(supplier);
  const config = getSupplierConfig(supplierId);
  const sizeConfig = SIZE_CONFIG[size];

  // Minimal variant - just the name
  if (variant === 'minimal') {
    return (
      <span className={cn('font-medium text-slate-600', sizeConfig.text, className)}>
        {config.shortName}
      </span>
    );
  }

  // Logo variant - attempt image, fallback to text
  if (variant === 'logo') {
    const logoContent = (
      <div className={cn('flex items-center', className)}>
        {config.logoPath ? (
          <img
            src={config.logoPath}
            alt={config.name}
            className={cn(sizeConfig.logo, 'object-contain')}
            onError={(e) => {
              // Hide broken image and show fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback placeholder (hidden if image loads) */}
        <div className={config.logoPath ? 'hidden' : 'flex items-center'}>
          <SupplierPlaceholderLogo supplierId={supplierId} size={size} />
        </div>
        {showCountry && (
          <span className={cn('ml-1.5 text-slate-400', sizeConfig.text)}>
            ({config.countryFlag})
          </span>
        )}
      </div>
    );

    if (showLink && config.websiteUrl) {
      return (
        <a
          href={config.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
          title={`Visit ${config.name}`}
        >
          {logoContent}
          <ExternalLink className={cn('text-slate-400', sizeConfig.icon)} />
        </a>
      );
    }

    return logoContent;
  }

  // Badge variant (default) - colored background badge
  const badgeContent = (
    <div
      className={cn(
        'inline-flex items-center rounded font-semibold',
        config.badgeBackground,
        config.badgeText,
        sizeConfig.badge,
        sizeConfig.padding,
        className
      )}
    >
      <span className={sizeConfig.text}>{config.shortName}</span>
      {showCountry && (
        <span className={cn('opacity-75', sizeConfig.text)}>
          {config.countryFlag}
        </span>
      )}
      {showLink && config.websiteUrl && (
        <ExternalLink className={cn('opacity-75', sizeConfig.icon)} />
      )}
    </div>
  );

  if (showLink && config.websiteUrl) {
    return (
      <a
        href={config.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex hover:opacity-90 transition-opacity"
        title={`Visit ${config.name}`}
      >
        {badgeContent}
      </a>
    );
  }

  return badgeContent;
}

/**
 * SupplierInfo component - Extended display with description
 */
interface SupplierInfoProps {
  supplier: string | SupplierId | null | undefined;
  showDescription?: boolean;
  showSpecializations?: boolean;
  className?: string;
}

export function SupplierInfo({
  supplier,
  showDescription = false,
  showSpecializations = false,
  className = '',
}: SupplierInfoProps) {
  const supplierId = normalizeSupplierName(supplier);
  const config = getSupplierConfig(supplierId);

  if (supplierId === 'other') {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <SupplierLogo supplier={supplierId} size="md" variant="logo" />
        <span className="text-xs text-slate-500">{config.country}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-slate-600">{config.description}</p>
      )}
      {showSpecializations && config.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {config.specializations.map((spec) => (
            <span
              key={spec}
              className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded"
            >
              {spec}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupplierLogo;

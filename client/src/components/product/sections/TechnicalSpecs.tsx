import React, { useState } from 'react';
import { ChevronDown, Ruler, Atom, Wrench, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TechnicalSpecsProps, DriveType } from '@/types/product-extended';
import { MaterialBadge } from '../atoms/MaterialBadge';
import { SpecRow, SpecGrid } from '../atoms/SpecRow';

const DRIVE_LABELS: Record<DriveType, { en: string; es: string }> = {
  hex: { en: 'Hex', es: 'Hexagonal' },
  phillips: { en: 'Phillips', es: 'Phillips' },
  pozidriv: { en: 'Pozidriv', es: 'Pozidriv' },
  torx: { en: 'Torx', es: 'Torx' },
  allen: { en: 'Allen/Hex Socket', es: 'Allen/Hexagonal' },
  slotted: { en: 'Slotted', es: 'Ranurado' },
  square: { en: 'Square', es: 'Cuadrado' },
  tri_wing: { en: 'Tri-Wing', es: 'Tri-Wing' },
  spanner: { en: 'Spanner', es: 'Spanner' },
  one_way: { en: 'One-Way', es: 'Unidireccional' },
};

export function TechnicalSpecs({
  dimensions,
  material,
  mechanicalProperties,
  primaryStandard,
  headType,
  driveType,
  threadType,
  threadDirection,
  className = '',
  isLoading,
  compact,
  expandable = true,
}: TechnicalSpecsProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(!compact);

  const t = {
    title: language === 'es' ? 'Especificaciones Técnicas' : 'Technical Specifications',
    dimensions: language === 'es' ? 'Dimensiones' : 'Dimensions',
    material: language === 'es' ? 'Material' : 'Material',
    mechanical: language === 'es' ? 'Propiedades Mecánicas' : 'Mechanical Properties',
    configuration: language === 'es' ? 'Configuración' : 'Configuration',
    diameter: language === 'es' ? 'Diámetro' : 'Diameter',
    length: language === 'es' ? 'Longitud' : 'Length',
    pitch: language === 'es' ? 'Paso' : 'Pitch',
    threadLength: language === 'es' ? 'Longitud rosca' : 'Thread Length',
    headDiameter: language === 'es' ? 'Diámetro cabeza' : 'Head Diameter',
    headHeight: language === 'es' ? 'Altura cabeza' : 'Head Height',
    keySize: language === 'es' ? 'Tamaño llave' : 'Key Size',
    acrossFlats: language === 'es' ? 'Entre caras' : 'Across Flats',
    tensile: language === 'es' ? 'Resistencia tracción' : 'Tensile Strength',
    yield: language === 'es' ? 'Límite elástico' : 'Yield Strength',
    hardness: language === 'es' ? 'Dureza' : 'Hardness',
    proofLoad: language === 'es' ? 'Carga de prueba' : 'Proof Load',
    propertyClass: language === 'es' ? 'Clase' : 'Property Class',
    headType: language === 'es' ? 'Tipo de cabeza' : 'Head Type',
    driveType: language === 'es' ? 'Tipo de accionamiento' : 'Drive Type',
    threadType: language === 'es' ? 'Tipo de rosca' : 'Thread Type',
    threadDirection: language === 'es' ? 'Dirección rosca' : 'Thread Direction',
    standard: language === 'es' ? 'Norma' : 'Standard',
    right: language === 'es' ? 'Derecha' : 'Right-hand',
    left: language === 'es' ? 'Izquierda' : 'Left-hand',
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDimensions = dimensions && Object.keys(dimensions).length > 0;
  const hasMechanical = mechanicalProperties && Object.keys(mechanicalProperties).length > 0;
  const hasConfiguration = headType || driveType || threadType || threadDirection || primaryStandard;

  const content = (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {/* Dimensions Card */}
      {hasDimensions && (
        <Card className="border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ruler className="w-4 h-4 text-slate-500" />
              {t.dimensions}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <SpecGrid>
              <SpecRow label={t.diameter} value={dimensions?.diameter} highlight />
              <SpecRow label={t.length} value={dimensions?.length} unit="mm" />
              <SpecRow label={t.pitch} value={dimensions?.pitch} unit="mm" />
              <SpecRow label={t.threadLength} value={dimensions?.threadLength} unit="mm" />
              <SpecRow label={t.headDiameter} value={dimensions?.headDiameter} unit="mm" />
              <SpecRow label={t.headHeight} value={dimensions?.headHeight} unit="mm" />
              <SpecRow label={t.keySize} value={dimensions?.keySize} unit="mm" />
              <SpecRow label={t.acrossFlats} value={dimensions?.acrossFlats} unit="mm" />
            </SpecGrid>
          </CardContent>
        </Card>
      )}

      {/* Material Card */}
      {material && (
        <Card className="border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Atom className="w-4 h-4 text-slate-500" />
              {t.material}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <MaterialBadge material={material} showGroup size="lg" className="mb-3" />
            {material.finish && (
              <SpecRow
                label={language === 'es' ? 'Acabado' : 'Finish'}
                value={material.finish.replace(/_/g, ' ')}
              />
            )}
            {material.corrosionResistance && (
              <SpecRow
                label={language === 'es' ? 'Resistencia corrosión' : 'Corrosion Resistance'}
                value={`${'★'.repeat(material.corrosionResistance)}${'☆'.repeat(5 - material.corrosionResistance)}`}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Mechanical Properties Card */}
      {hasMechanical && (
        <Card className="border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-500" />
              {t.mechanical}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <SpecGrid>
              <SpecRow
                label={t.propertyClass}
                value={mechanicalProperties?.propertyClass}
                highlight
              />
              <SpecRow
                label={t.tensile}
                value={mechanicalProperties?.tensileStrength}
                unit="MPa"
              />
              <SpecRow label={t.yield} value={mechanicalProperties?.yieldStrength} unit="MPa" />
              <SpecRow label={t.hardness} value={mechanicalProperties?.hardness} />
              <SpecRow label={t.proofLoad} value={mechanicalProperties?.proofLoad} unit="kN" />
            </SpecGrid>
          </CardContent>
        </Card>
      )}

      {/* Configuration Card */}
      {hasConfiguration && (
        <Card className="border-slate-200">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-500" />
              {t.configuration}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <SpecGrid>
              <SpecRow label={t.standard} value={primaryStandard} highlight />
              <SpecRow label={t.headType} value={headType} />
              <SpecRow
                label={t.driveType}
                value={driveType ? (DRIVE_LABELS[driveType]?.[language] || driveType) : undefined}
              />
              <SpecRow label={t.threadType} value={threadType} />
              <SpecRow
                label={t.threadDirection}
                value={threadDirection === 'left' ? t.left : threadDirection === 'right' ? t.right : undefined}
              />
            </SpecGrid>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (!expandable) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
        <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{content}</CollapsibleContent>
    </Collapsible>
  );
}

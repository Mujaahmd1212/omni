import React, { useMemo } from 'react';
import { generateBarcodeSvg } from '../../lib/barcode';

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  includeText?: boolean;
  barColor?: string;
  textColor?: string;
  className?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  width = 200,
  height = 64,
  includeText = true,
  barColor = '#0f172a',
  textColor = '#0f172a',
  className = ''
}) => {
  const svgString = useMemo(() => {
    if (!value) return '';
    return generateBarcodeSvg({
      text: value,
      width,
      height,
      includeText,
      barColor,
      textColor
    });
  }, [value, width, height, includeText, barColor, textColor]);

  if (!value) {
    return <span className="text-xs text-slate-400 italic">No Barcode</span>;
  }

  return (
    <div
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

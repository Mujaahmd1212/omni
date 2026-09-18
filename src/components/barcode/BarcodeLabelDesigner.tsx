import React, { useState } from 'react';
import { Printer, X, Sliders, CheckSquare, Square, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { BarcodeSvg } from './BarcodeSvg';

interface BarcodeLabelDesignerProps {
  product: Product;
  variantId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeLabelDesigner: React.FC<BarcodeLabelDesignerProps> = ({
  product,
  variantId,
  isOpen,
  onClose
}) => {
  const { currentEnterprise } = useApp();
  const [printQuantity, setPrintQuantity] = useState<number>(10);
  const [labelSize, setLabelSize] = useState<'50x30' | '40x25' | '60x40' | 'a4_sheet'>('50x30');

  // Label configuration flags
  const [showBusinessName, setShowBusinessName] = useState<boolean>(true);
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);
  const [showBarcodeText, setShowBarcodeText] = useState<boolean>(true);
  const [showSellingPrice, setShowSellingPrice] = useState<boolean>(true);
  const [showWholesalePrice, setShowWholesalePrice] = useState<boolean>(false);
  const [showBatchInfo, setShowBatchInfo] = useState<boolean>(Boolean(product.batchNumber));

  if (!isOpen) return null;

  const variant = variantId ? product.variants.find(v => v.id === variantId) : null;
  const barcodeValue = variant ? variant.barcode : product.barcode;
  const skuValue = variant ? variant.sku : product.sku;
  const priceValue = variant ? variant.sellingPrice : product.sellingPrice;
  const displayName = variant ? `${product.name} (${variant.name})` : product.name;

  const handlePrint = () => {
    window.print();
  };

  const labelItems = Array.from({ length: Math.max(1, Math.min(200, printQuantity)) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Barcode Label Designer & Thermal Print</h2>
              <p className="text-xs text-slate-400">Configure sticker layout, thermal dimensions & label count</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Controls */}
          <div className="md:col-span-5 p-5 border-r border-slate-800 overflow-y-auto space-y-5 bg-slate-900/50">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Print Quantity (Labels)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <div className="flex gap-1">
                  {[1, 10, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setPrintQuantity(qty)}
                      className={`px-2 py-1.5 text-xs font-medium rounded border ${
                        printQuantity === qty
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Generates {printQuantity} identical barcode labels for this item.
              </p>
            </div>

            {/* Label Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Thermal Roll / Sticker Size
              </label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="50x30">50mm x 30mm (Standard Retail Thermal Roll)</option>
                <option value="40x25">40mm x 25mm (Compact Jewelry / Cable Label)</option>
                <option value="60x40">60mm x 40mm (Warehouse & Hardware Box)</option>
                <option value="a4_sheet">A4 Sheet (3-Column 24 Stickers)</option>
              </select>
            </div>

            {/* Content Inclusions */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Include on Label
              </label>

              {[
                { label: 'Business Name', checked: showBusinessName, set: setShowBusinessName },
                { label: 'Product Title', checked: showProductName, set: setShowProductName },
                { label: 'Product SKU', checked: showSku, set: setShowSku },
                { label: 'Barcode Human Readable Text', checked: showBarcodeText, set: setShowBarcodeText },
                { label: 'Selling Price', checked: showSellingPrice, set: setShowSellingPrice },
                { label: 'Wholesale Price', checked: showWholesalePrice, set: setShowWholesalePrice },
                { label: 'Batch No & Expiry Date', checked: showBatchInfo, set: setShowBatchInfo, disabled: !product.batchNumber }
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && opt.set(!opt.checked)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium border transition-colors ${
                    opt.checked
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span>{opt.label}</span>
                  {opt.checked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              ))}
            </div>

          </div>

          {/* Right Live Preview */}
          <div className="md:col-span-7 p-6 flex flex-col bg-slate-950 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Eye className="w-4 h-4 text-indigo-400" />
                Live Thermal Label Sheet Preview ({printQuantity} labels)
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                {labelSize}
              </span>
            </div>

            {/* Printable Container */}
            <div
              id="printable-barcode-sheet"
              className="flex-1 p-4 bg-slate-900/80 border border-slate-800 rounded-xl overflow-y-auto flex flex-wrap gap-3 items-start content-start"
            >
              {labelItems.map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white text-slate-950 p-2.5 rounded shadow-sm border border-slate-200 flex flex-col justify-between"
                  style={{
                    width: labelSize === '40x25' ? '180px' : labelSize === '60x40' ? '240px' : '200px',
                    minHeight: labelSize === '40x25' ? '110px' : labelSize === '60x40' ? '150px' : '125px'
                  }}
                >
                  {/* Top: Business Name */}
                  {showBusinessName && (
                    <div className="text-[10px] font-bold text-center tracking-tight text-slate-800 uppercase border-b border-slate-200 pb-0.5 mb-1 truncate">
                      {currentEnterprise.name}
                    </div>
                  )}

                  {/* Middle: Product & SKU */}
                  <div className="text-center">
                    {showProductName && (
                      <div className="text-[11px] font-bold leading-tight line-clamp-2 text-slate-900">
                        {displayName}
                      </div>
                    )}
                    {showSku && (
                      <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                        SKU: {skuValue}
                      </div>
                    )}
                  </div>

                  {/* Barcode Graphic */}
                  <div className="my-1 flex justify-center">
                    <BarcodeSvg
                      value={barcodeValue}
                      width={170}
                      height={46}
                      includeText={showBarcodeText}
                      barColor="#000000"
                      textColor="#000000"
                    />
                  </div>

                  {/* Bottom: Pricing & Batch */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[10px]">
                    {showSellingPrice && (
                      <span className="font-extrabold text-slate-900 font-mono text-xs">
                        ${priceValue.toFixed(2)}
                      </span>
                    )}

                    {showWholesalePrice && product.wholesalePrice && (
                      <span className="text-[9px] text-slate-600 font-mono">
                        WS: ${product.wholesalePrice.toFixed(2)}
                      </span>
                    )}

                    {showBatchInfo && product.batchNumber && (
                      <span className="text-[9px] text-slate-600 font-mono">
                        B: {product.batchNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Direct thermal printer ready. POS navigation and headers will be excluded during print.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}
          </button>
        </div>

      </div>
    </div>
  );
};

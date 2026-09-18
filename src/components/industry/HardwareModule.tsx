import React, { useState } from 'react';
import { 
  Wrench, 
  Calculator, 
  Layers, 
  ArrowRight, 
  Check, 
  Hammer, 
  Ruler, 
  Boxes, 
  DollarSign, 
  Percent,
  Scissors,
  PaintBucket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HardwareModule: React.FC = () => {
  const { currentEnterprise } = useApp();

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'converters' | 'pricing' | 'estimation'>('converters');

  // 1. Dimensional Converter State
  const [convType, setConvType] = useState<'length' | 'area' | 'volume' | 'weight' | 'quantity'>('length');
  const [inputValue, setInputValue] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>('meters');
  const [toUnit, setToUnit] = useState<string>('feet');

  // Quantity / Case pack state
  const [totalItems, setTotalItems] = useState<number>(345);
  const [packSize, setPackSize] = useState<number>(24);

  // 2. Cut to Length & Pricing State
  const [stockLength, setStockLength] = useState<number>(6.0); // e.g. 6m rebar or pipe
  const [cutLength, setCutLength] = useState<number>(0.85);
  const [bladeKerf, setBladeKerf] = useState<number>(0.003); // 3mm blade waste
  const [pricePerUnit, setPricePerUnit] = useState<number>(18.50);
  const [cutFee, setCutFee] = useState<number>(0.75);

  // 3. Material Estimator State
  const [estimatorType, setEstimatorType] = useState<'concrete' | 'drywall' | 'paint' | 'tiles'>('concrete');
  
  // Concrete
  const [slabLength, setSlabLength] = useState<number>(5); // meters
  const [slabWidth, setSlabWidth] = useState<number>(4); // meters
  const [slabThickness, setSlabThickness] = useState<number>(0.15); // 15 cm
  
  // Drywall
  const [wallLength, setWallLength] = useState<number>(12); // meters
  const [wallHeight, setWallHeight] = useState<number>(2.7); // meters
  const [studSpacing, setStudSpacing] = useState<number>(0.4); // 400mm or 16in

  // Paint
  const [roomArea, setRoomArea] = useState<number>(65); // sq meters
  const [paintCoats, setPaintCoats] = useState<number>(2);

  // Tiles
  const [floorLength, setFloorLength] = useState<number>(6);
  const [floorWidth, setFloorWidth] = useState<number>(5);
  const [tileWastePercent, setTileWastePercent] = useState<number>(12);
  const [tileBoxSqM, setTileBoxSqM] = useState<number>(1.44);

  // Calculation Logic
  const calculateConversion = (): number => {
    if (convType === 'length') {
      let inM = inputValue;
      if (fromUnit === 'feet') inM = inputValue * 0.3048;
      if (fromUnit === 'inches') inM = inputValue * 0.0254;
      if (fromUnit === 'cm') inM = inputValue * 0.01;
      if (fromUnit === 'yards') inM = inputValue * 0.9144;

      if (toUnit === 'meters') return inM;
      if (toUnit === 'feet') return inM / 0.3048;
      if (toUnit === 'inches') return inM / 0.0254;
      if (toUnit === 'cm') return inM / 0.01;
      if (toUnit === 'yards') return inM / 0.9144;
    } else if (convType === 'area') {
      let inSqM = inputValue;
      if (fromUnit === 'sq_feet') inSqM = inputValue * 0.092903;
      if (fromUnit === 'sq_yards') inSqM = inputValue * 0.836127;
      if (fromUnit === 'acres') inSqM = inputValue * 4046.86;

      if (toUnit === 'sq_meters') return inSqM;
      if (toUnit === 'sq_feet') return inSqM / 0.092903;
      if (toUnit === 'sq_yards') return inSqM / 0.836127;
      if (toUnit === 'acres') return inSqM / 4046.86;
    } else if (convType === 'volume') {
      let inLiters = inputValue;
      if (fromUnit === 'cu_meters') inLiters = inputValue * 1000;
      if (fromUnit === 'cu_feet') inLiters = inputValue * 28.3168;
      if (fromUnit === 'gallons') inLiters = inputValue * 3.78541;

      if (toUnit === 'liters') return inLiters;
      if (toUnit === 'cu_meters') return inLiters / 1000;
      if (toUnit === 'cu_feet') return inLiters / 28.3168;
      if (toUnit === 'gallons') return inLiters / 3.78541;
    } else if (convType === 'weight') {
      let inKg = inputValue;
      if (fromUnit === 'lbs') inKg = inputValue * 0.453592;
      if (fromUnit === 'metric_tons') inKg = inputValue * 1000;
      if (fromUnit === 'ounces') inKg = inputValue * 0.0283495;

      if (toUnit === 'kg') return inKg;
      if (toUnit === 'lbs') return inKg / 0.453592;
      if (toUnit === 'metric_tons') return inKg / 1000;
      if (toUnit === 'ounces') return inKg / 0.0283495;
    }
    return inputValue;
  };

  // Cut calculation
  const cutsPossible = Math.floor(stockLength / (cutLength + bladeKerf));
  const offcutRemaining = Math.max(0, stockLength - cutsPossible * (cutLength + bladeKerf));
  const cutTotalFee = cutsPossible * cutFee;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Hardware & Building Material Calculators</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold">
                Industry Tool Suite
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dimensional measurement converters, cut-to-length estimation, and material job estimators
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('converters')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'converters' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Measurement & Quantity
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'pricing' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cut & Bulk Pricing
          </button>
          <button
            onClick={() => setActiveTab('estimation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'estimation' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Material Estimators
          </button>
        </div>
      </div>

      {/* TAB 1: MEASUREMENT & QUANTITY CONVERTERS */}
      {activeTab === 'converters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dimensional Converter Card */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Ruler className="w-4 h-4 text-amber-400" />
              Dimensional & Unit Converter
            </h2>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2">
              {(['length', 'area', 'volume', 'weight'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setConvType(type);
                    if (type === 'length') { setFromUnit('meters'); setToUnit('feet'); }
                    if (type === 'area') { setFromUnit('sq_meters'); setToUnit('sq_feet'); }
                    if (type === 'volume') { setFromUnit('cu_meters'); setToUnit('liters'); }
                    if (type === 'weight') { setFromUnit('kg'); setToUnit('lbs'); }
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    convType === type
                      ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">From Value</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full mt-2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                >
                  {convType === 'length' && (
                    <>
                      <option value="meters">Meters (m)</option>
                      <option value="feet">Feet (ft)</option>
                      <option value="inches">Inches (in)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="yards">Yards (yd)</option>
                    </>
                  )}
                  {convType === 'area' && (
                    <>
                      <option value="sq_meters">Square Meters (m²)</option>
                      <option value="sq_feet">Square Feet (ft²)</option>
                      <option value="sq_yards">Square Yards (yd²)</option>
                      <option value="acres">Acres</option>
                    </>
                  )}
                  {convType === 'volume' && (
                    <>
                      <option value="cu_meters">Cubic Meters (m³)</option>
                      <option value="liters">Liters (L)</option>
                      <option value="cu_feet">Cubic Feet (ft³)</option>
                      <option value="gallons">US Gallons (gal)</option>
                    </>
                  )}
                  {convType === 'weight' && (
                    <>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="metric_tons">Metric Tons (t)</option>
                      <option value="ounces">Ounces (oz)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Converted Value</label>
                <div className="px-3 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-lg">
                  {calculateConversion().toFixed(3)}
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full mt-2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
                >
                  {convType === 'length' && (
                    <>
                      <option value="feet">Feet (ft)</option>
                      <option value="meters">Meters (m)</option>
                      <option value="inches">Inches (in)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="yards">Yards (yd)</option>
                    </>
                  )}
                  {convType === 'area' && (
                    <>
                      <option value="sq_feet">Square Feet (ft²)</option>
                      <option value="sq_meters">Square Meters (m²)</option>
                      <option value="sq_yards">Square Yards (yd²)</option>
                      <option value="acres">Acres</option>
                    </>
                  )}
                  {convType === 'volume' && (
                    <>
                      <option value="liters">Liters (L)</option>
                      <option value="cu_meters">Cubic Meters (m³)</option>
                      <option value="cu_feet">Cubic Feet (ft³)</option>
                      <option value="gallons">US Gallons (gal)</option>
                    </>
                  )}
                  {convType === 'weight' && (
                    <>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="metric_tons">Metric Tons (t)</option>
                      <option value="ounces">Ounces (oz)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Case Pack Calculator (Col 5) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Boxes className="w-4 h-4 text-amber-400" />
              Bulk Pack & Case Break Calculator
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Quantity Needed (Pieces)</label>
                <input
                  type="number"
                  min="1"
                  value={totalItems}
                  onChange={(e) => setTotalItems(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Items Per Case / Box</label>
                <input
                  type="number"
                  min="1"
                  value={packSize}
                  onChange={(e) => setPackSize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Full Cases to Order:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {Math.floor(totalItems / Math.max(1, packSize))} Boxes
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Loose / Broken Remainder:</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">
                    {totalItems % Math.max(1, packSize)} Loose Pcs
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Recommended Total Stock to Pull:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {Math.ceil(totalItems / Math.max(1, packSize))} Full Boxes
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRICING & CUT-TO-LENGTH */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cut-to-length pricing */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Scissors className="w-4 h-4 text-amber-400" />
              Cut-to-Length Estimation (Pipes, Timber, Rebar)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Standard Bar Length (Meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stockLength}
                  onChange={(e) => setStockLength(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Cut Length (Meters)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cutLength}
                  onChange={(e) => setCutLength(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blade Kerf / Cut Waste (Meters)</label>
                <input
                  type="number"
                  step="0.001"
                  value={bladeKerf}
                  onChange={(e) => setBladeKerf(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Fee Per Cut ($)</label>
                <input
                  type="number"
                  step="0.25"
                  value={cutFee}
                  onChange={(e) => setCutFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Cuts Possible</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">{cutsPossible} pcs</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Offcut Scrap</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{offcutRemaining.toFixed(3)} m</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total Cutting Fee</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">${cutTotalFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bulk Tier Discounts */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Bulk Volume Tier Discounts
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Tier 1: Retail Single Units</span>
                  <p className="text-[11px] text-slate-400">1 - 9 units (Standard markup)</p>
                </div>
                <span className="font-mono font-bold text-white">$12.50 / unit</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Tier 2: Contractor Bulk</span>
                  <p className="text-[11px] text-emerald-400">10 - 49 units (12% volume savings)</p>
                </div>
                <span className="font-mono font-bold text-emerald-400">$11.00 / unit</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">Tier 3: Pallet / Wholesale</span>
                  <p className="text-[11px] text-indigo-300">50+ units (21% wholesale rate)</p>
                </div>
                <span className="font-mono font-bold text-indigo-300">$9.80 / unit</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MATERIAL ESTIMATORS */}
      {activeTab === 'estimation' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {(['concrete', 'drywall', 'paint', 'tiles'] as const).map(t => (
              <button
                key={t}
                onClick={() => setEstimatorType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  estimatorType === t
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} Estimator
              </button>
            ))}
          </div>

          {/* Concrete Estimator */}
          {estimatorType === 'concrete' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Hammer className="w-4 h-4 text-amber-400" />
                Concrete Slab Volume & Bag Calculator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Length (Meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabLength}
                    onChange={(e) => setSlabLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Width (Meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabWidth}
                    onChange={(e) => setSlabWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thickness (Meters, e.g. 0.15 = 15cm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={slabThickness}
                    onChange={(e) => setSlabThickness(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {(() => {
                const volM3 = slabLength * slabWidth * slabThickness;
                const bags50kg = Math.ceil(volM3 * 22); // roughly 22-24 bags 50kg per m3
                return (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Total Concrete Volume</span>
                      <span className="text-2xl font-bold font-mono text-white mt-1 block">{volM3.toFixed(2)} m³</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Estimated 50kg Cement Bags Needed</span>
                      <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{bags50kg} Bags</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Paint Estimator */}
          {estimatorType === 'paint' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <PaintBucket className="w-4 h-4 text-amber-400" />
                Paint & Primer Coverage Estimator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Wall Area (m²)</label>
                  <input
                    type="number"
                    value={roomArea}
                    onChange={(e) => setRoomArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Number of Coats</label>
                  <select
                    value={paintCoats}
                    onChange={(e) => setPaintCoats(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 Coat (Touch up)</option>
                    <option value={2}>2 Coats (Standard)</option>
                    <option value={3}>3 Coats (Raw Plaster / Deep Color)</option>
                  </select>
                </div>
              </div>

              {(() => {
                // Avg coverage is ~10 m² per liter
                const litersNeeded = (roomArea * paintCoats) / 10;
                const cans5L = Math.ceil(litersNeeded / 5);
                return (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Total Paint Required</span>
                      <span className="text-2xl font-bold font-mono text-white mt-1 block">{litersNeeded.toFixed(1)} Liters</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">5-Liter Cans Recommended</span>
                      <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{cans5L} Cans</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Tiles Estimator */}
          {estimatorType === 'tiles' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-amber-400" />
                Flooring & Wall Tile Square Footage Estimator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Length (m)</label>
                  <input
                    type="number"
                    value={floorLength}
                    onChange={(e) => setFloorLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room Width (m)</label>
                  <input
                    type="number"
                    value={floorWidth}
                    onChange={(e) => setFloorWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cutting Waste (%)</label>
                  <input
                    type="number"
                    value={tileWastePercent}
                    onChange={(e) => setTileWastePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Box Coverage (m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tileBoxSqM}
                    onChange={(e) => setTileBoxSqM(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {(() => {
                const baseArea = floorLength * floorWidth;
                const totalArea = baseArea * (1 + tileWastePercent / 100);
                const boxes = Math.ceil(totalArea / Math.max(0.1, tileBoxSqM));
                return (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Base Floor Area</span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">{baseArea.toFixed(1)} m²</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Total w/ {tileWastePercent}% Waste</span>
                      <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{totalArea.toFixed(1)} m²</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Boxes of Tiles</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{boxes} Boxes</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Drywall Estimator */}
          {estimatorType === 'drywall' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-amber-400" />
                Drywall Boards & Stud Framing Calculator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wall Length (m)</label>
                  <input
                    type="number"
                    value={wallLength}
                    onChange={(e) => setWallLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wall Height (m)</label>
                  <input
                    type="number"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stud Spacing (m, e.g. 0.4m = 16in)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={studSpacing}
                    onChange={(e) => setStudSpacing(parseFloat(e.target.value) || 0.4)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {(() => {
                const totalArea = wallLength * wallHeight;
                // Standard 1.2m x 2.4m sheet = 2.88 m²
                const sheetsNeeded = Math.ceil((totalArea * 1.1) / 2.88);
                const studsNeeded = Math.ceil(wallLength / Math.max(0.2, studSpacing)) + 1;
                return (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Drywall Sheets (1.2m × 2.4m)</span>
                      <span className="text-2xl font-bold font-mono text-white mt-1 block">{sheetsNeeded} Sheets</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Vertical Studs</span>
                      <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{studsNeeded} Studs</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

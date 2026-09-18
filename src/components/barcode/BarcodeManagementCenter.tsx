import React, { useState, useMemo } from 'react';
import {
  Barcode,
  Search,
  Filter,
  Printer,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { BarcodeSvg } from './BarcodeSvg';
import { BarcodeLabelDesigner } from './BarcodeLabelDesigner';
import { generateUniqueBarcode } from '../../lib/barcode';

export const BarcodeManagementCenter: React.FC = () => {
  const { currentEnterprise, currentUser } = useApp();
  const [products, setProducts] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeFilter, setBarcodeFilter] = useState<'all' | 'with_barcode' | 'missing_barcode'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals state
  const [designerProduct, setDesignerProduct] = useState<Product | null>(null);
  const [regenConfirmProduct, setRegenConfirmProduct] = useState<Product | null>(null);
  const [manualBarcodeProduct, setManualBarcodeProduct] = useState<Product | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [manualCodeError, setManualCodeError] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Reload products when enterprise changes
  const reload = () => {
    setProducts(db.getProducts(currentEnterprise.id));
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategory !== 'all' && p.categoryName !== selectedCategory) {
        return false;
      }

      if (barcodeFilter === 'with_barcode' && !p.barcode) return false;
      if (barcodeFilter === 'missing_barcode' && p.barcode) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, barcodeFilter]);

  // Bulk selection helpers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Generate barcode for single product
  const handleGenerateBarcode = (product: Product) => {
    let newCode = generateUniqueBarcode();
    while (db.isBarcodeAssigned(currentEnterprise.id, newCode, product.id)) {
      newCode = generateUniqueBarcode();
    }

    const res = db.saveProduct({
      ...product,
      barcode: newCode,
      barcodeType: 'CODE128'
    }, currentUser.id);

    if (res.success) {
      setStatusMessage({ text: `Generated barcode ${newCode} for ${product.name}`, type: 'success' });
      reload();
    }
  };

  // Bulk Generate Barcodes for missing products
  const handleBulkGenerate = () => {
    const missing = products.filter(p => !p.barcode);
    if (missing.length === 0) {
      setStatusMessage({ text: 'All products currently have barcodes assigned.', type: 'success' });
      return;
    }

    let count = 0;
    missing.forEach(p => {
      let code = generateUniqueBarcode();
      while (db.isBarcodeAssigned(currentEnterprise.id, code, p.id)) {
        code = generateUniqueBarcode();
      }
      db.saveProduct({ ...p, barcode: code, barcodeType: 'CODE128' }, currentUser.id);
      count++;
    });

    setStatusMessage({ text: `Bulk generated ${count} new unique barcodes successfully!`, type: 'success' });
    reload();
  };

  // Barcode Regeneration with confirmation
  const handleRegenerateConfirm = () => {
    if (!regenConfirmProduct) return;
    const res = db.regenerateProductBarcode(currentEnterprise.id, regenConfirmProduct.id, undefined, currentUser.id);
    if (res.success) {
      setStatusMessage({
        text: `Regenerated barcode to ${res.newBarcode}. Notice: Previously printed labels are now obsolete.`,
        type: 'success'
      });
      reload();
    }
    setRegenConfirmProduct(null);
  };

  // Manual Barcode assignment with duplicate protection
  const handleManualBarcodeSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcodeProduct) return;

    const trimmed = manualCodeInput.trim();
    if (!trimmed) {
      setManualCodeError('Barcode cannot be empty.');
      return;
    }

    // Duplicate check in DB
    const isDup = db.isBarcodeAssigned(currentEnterprise.id, trimmed, manualBarcodeProduct.id);
    if (isDup) {
      setManualCodeError(`Barcode "${trimmed}" is already assigned to another product in your catalog.`);
      return;
    }

    const res = db.saveProduct({
      ...manualBarcodeProduct,
      barcode: trimmed
    }, currentUser.id);

    if (res.success) {
      setStatusMessage({ text: `Barcode "${trimmed}" assigned to ${manualBarcodeProduct.name}`, type: 'success' });
      setManualBarcodeProduct(null);
      setManualCodeInput('');
      setManualCodeError('');
      reload();
    } else {
      setManualCodeError(res.error || 'Failed to assign barcode.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Barcode Management Center</h1>
              <p className="text-xs text-slate-400">
                Generate, manage, regenerate, and design vector labels for {currentEnterprise.name}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBulkGenerate}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            Bulk Generate Missing
          </button>
          
          {selectedProductIds.length > 0 && (
            <button
              onClick={() => {
                const prod = products.find(p => p.id === selectedProductIds[0]);
                if (prod) setDesignerProduct(prod);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Labels ({selectedProductIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name, SKU, or barcode number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Barcode Status Filter */}
        <div className="md:col-span-4 flex items-center gap-1.5">
          <button
            onClick={() => setBarcodeFilter('all')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
              barcodeFilter === 'all'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All ({products.length})
          </button>
          
          <button
            onClick={() => setBarcodeFilter('with_barcode')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
              barcodeFilter === 'with_barcode'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            With Barcode ({products.filter(p => p.barcode).length})
          </button>

          <button
            onClick={() => setBarcodeFilter('missing_barcode')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
              barcodeFilter === 'missing_barcode'
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Missing ({products.filter(p => !p.barcode).length})
          </button>
        </div>
      </div>

      {/* Barcode Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                  />
                </th>
                <th className="p-3 font-semibold">Product Name</th>
                <th className="p-3 font-semibold">SKU</th>
                <th className="p-3 font-semibold">Barcode & Graphic</th>
                <th className="p-3 font-semibold">Format</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Price: ${p.sellingPrice.toFixed(2)}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {p.sku}
                    </td>
                    <td className="p-3">
                      {p.barcode ? (
                        <div className="flex flex-col gap-1 items-start bg-white/95 p-1.5 rounded w-fit border border-slate-200">
                          <BarcodeSvg
                            value={p.barcode}
                            width={130}
                            height={34}
                            includeText={true}
                            barColor="#000"
                            textColor="#000"
                          />
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          No Barcode Assigned
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {p.barcodeType || 'CODE128'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {p.categoryName}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.stock <= p.minStock
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* If missing barcode -> Generate / Enter */}
                        {!p.barcode ? (
                          <>
                            <button
                              onClick={() => handleGenerateBarcode(p)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors"
                              title="Generate Unique Code 128"
                            >
                              Generate
                            </button>
                            <button
                              onClick={() => {
                                setManualBarcodeProduct(p);
                                setManualCodeInput('');
                                setManualCodeError('');
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
                              title="Enter custom barcode"
                            >
                              Enter
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Print Label Designer */}
                            <button
                              onClick={() => setDesignerProduct(p)}
                              className="p-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                              title="Print Thermal Labels"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Regenerate Barcode */}
                            <button
                              onClick={() => setRegenConfirmProduct(p)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                              title="Regenerate Barcode"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thermal Label Designer Modal */}
      {designerProduct && (
        <BarcodeLabelDesigner
          product={designerProduct}
          isOpen={true}
          onClose={() => setDesignerProduct(null)}
        />
      )}

      {/* Confirmation Modal for Barcode Regeneration */}
      {regenConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Regenerate Barcode?</h3>
                <p className="text-xs text-slate-400 font-mono">Current: {regenConfirmProduct.barcode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg">
              Regenerating this barcode will create a new unique symbol and immediately invalidate any previously printed thermal labels or shelf tags.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegenConfirmProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-lg shadow-amber-600/20 transition-all"
              >
                Yes, Regenerate Barcode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Barcode Assignment Modal with Duplicate Check */}
      {manualBarcodeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleManualBarcodeSave}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enter Product Barcode</h3>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">{manualBarcodeProduct.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Scan with Handheld Reader or Type Barcode
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. 2004819204812"
                value={manualCodeInput}
                onChange={(e) => {
                  setManualCodeInput(e.target.value);
                  setManualCodeError('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              {manualCodeError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {manualCodeError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setManualBarcodeProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
              >
                Save & Assign
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

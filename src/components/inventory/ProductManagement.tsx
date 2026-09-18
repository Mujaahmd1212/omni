import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Barcode,
  Edit2,
  Printer,
  AlertTriangle,
  Layers,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { BarcodeSvg } from '../barcode/BarcodeSvg';
import { BarcodeLabelDesigner } from '../barcode/BarcodeLabelDesigner';
import { generateUniqueBarcode } from '../../lib/barcode';

export const ProductManagement: React.FC = () => {
  const { currentEnterprise, currentUser, isModuleEnabled } = useApp();
  const [products, setProducts] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [designerProduct, setDesignerProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    barcodeType: 'CODE128' as 'CODE128' | 'EAN13',
    categoryName: '',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'pcs',
    genericName: '',
    batchNumber: '',
    expiryDate: '',
    imeiNumber: '',
    variants: [] as ProductVariant[]
  });

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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedCategory !== 'all' && p.categoryName !== selectedCategory) return false;
      if (lowStockOnly && p.stock > p.minStock) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, lowStockOnly]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    const autoBarcode = generateUniqueBarcode();
    setFormData({
      name: '',
      sku: 'SKU-' + Math.floor(10000 + Math.random() * 90000),
      barcode: autoBarcode,
      barcodeType: 'CODE128',
      categoryName: categories[0] || 'General',
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      stock: 0,
      minStock: 5,
      unit: 'pcs',
      genericName: '',
      batchNumber: '',
      expiryDate: '',
      imeiNumber: '',
      variants: []
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      barcodeType: product.barcodeType || 'CODE128',
      categoryName: product.categoryName,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice || 0,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      genericName: product.genericName || '',
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate || '',
      imeiNumber: product.imeiNumber || '',
      variants: product.variants ? [...product.variants] : []
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Generate new barcode in form
  const handleGenerateBarcodeInForm = () => {
    let newCode = generateUniqueBarcode();
    while (db.isBarcodeAssigned(currentEnterprise.id, newCode, editingProduct?.id)) {
      newCode = generateUniqueBarcode();
    }
    setFormData(prev => ({ ...prev, barcode: newCode }));
  };

  // Add variant in form
  const handleAddVariant = () => {
    const vId = 'var-' + Date.now().toString(36);
    const vBarcode = generateUniqueBarcode();
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: vId,
          productId: editingProduct?.id || '',
          name: 'New Variant (e.g. Red / XL)',
          sku: `${formData.sku}-${prev.variants.length + 1}`,
          barcode: vBarcode,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          stock: 10
        }
      ]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setFormError('SKU is required.');
      return;
    }
    if (formData.sellingPrice <= 0) {
      setFormError('Selling price must be greater than zero.');
      return;
    }

    const payload = {
      enterpriseId: currentEnterprise.id,
      categoryId: 'cat-general',
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode.trim(),
      barcodeType: formData.barcodeType,
      categoryName: formData.categoryName.trim(),
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
      maxStock: (Number(formData.minStock) * 10) || 500,
      unit: formData.unit,
      status: 'active' as const,
      genericName: formData.genericName || undefined,
      batchNumber: formData.batchNumber || undefined,
      expiryDate: formData.expiryDate || undefined,
      imeiNumber: formData.imeiNumber || undefined,
      variants: formData.variants,
      ...(editingProduct ? { id: editingProduct.id } : {})
    };

    const res = db.saveProduct(payload, currentUser.id);

    if (!res.success) {
      setFormError(res.error || 'Failed to save product.');
      return;
    }

    setIsFormOpen(false);
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Products & Catalog</h1>
            <p className="text-xs text-slate-400">
              Manage inventory catalog, SKU variants, barcodes & pricing for {currentEnterprise.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
              lowStockOnly
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Alerts Only
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Product & SKU</th>
                <th className="p-3 font-semibold">Barcode</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Cost Price</th>
                <th className="p-3 font-semibold">Selling Price</th>
                <th className="p-3 font-semibold">Current Stock</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white leading-tight">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        SKU: {p.sku}
                      </div>
                      {p.genericName && (
                        <div className="text-[10px] text-teal-400 italic">
                          Generic: {p.genericName}
                        </div>
                      )}
                      {p.variants && p.variants.length > 0 && (
                        <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          {p.variants.length} Variants
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {p.barcode ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono text-xs text-slate-200">{p.barcode}</span>
                          <div className="bg-white p-1 rounded border border-slate-200 inline-block">
                            <BarcodeSvg
                              value={p.barcode}
                              width={110}
                              height={28}
                              includeText={false}
                              barColor="#000"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-400 italic text-[11px]">Missing Barcode</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      {p.categoryName}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      ${p.costPrice.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono font-bold text-white text-sm">
                      ${p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-200'
                        }`}>
                          {p.stock} {p.unit}
                        </span>
                        {isLow && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" title="Low stock threshold reached" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDesignerProduct(p)}
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Print Barcode Labels"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                </h2>
                <p className="text-xs text-slate-400">
                  Tenant isolated to: <span className="text-indigo-400 font-semibold">{currentEnterprise.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              {formError && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DeWalt 20V Cordless Drill Kit"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Power Tools"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode Section with Instant Auto-generator & Format */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-indigo-400" />
                    Barcode & Symbology
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBarcodeInForm}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Generate Unique Code
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Scan with reader or type barcode..."
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={formData.barcodeType}
                      onChange={(e) => setFormData({ ...formData, barcodeType: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none font-mono"
                    >
                      <option value="CODE128">Code 128</option>
                      <option value="EAN13">EAN-13</option>
                    </select>
                  </div>
                </div>

                {formData.barcode && (
                  <div className="pt-2 flex justify-center">
                    <div className="bg-white p-2 rounded shadow-sm inline-block border border-slate-200">
                      <BarcodeSvg
                        value={formData.barcode}
                        width={180}
                        height={40}
                        includeText={true}
                        barColor="#000"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-indigo-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wholesale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit of Measure</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Box</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="m">Meter (m)</option>
                    <option value="sq_m">Square Meter (m²)</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Industry-specific optional attributes */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold">Industry Fields (Optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Generic Name (Pharmacy)"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Batch No (e.g. B-9481)"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Label Designer */}
      {designerProduct && (
        <BarcodeLabelDesigner
          product={designerProduct}
          isOpen={true}
          onClose={() => setDesignerProduct(null)}
        />
      )}

    </div>
  );
};

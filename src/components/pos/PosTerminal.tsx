import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Barcode,
  Search,
  ShoppingCart,
  Trash2,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Banknote,
  Percent,
  Plus,
  Minus,
  UserCheck,
  Tag,
  AlertCircle,
  CheckCircle2,
  Layers,
  Utensils,
  Receipt,
  Keyboard,
  ArrowRight
} from 'lucide-react';
import { Product, ProductVariant, CartItem, Sale, Customer, RestaurantTable } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { ReceiptModal } from './ReceiptModal';

export const PosTerminal: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser, isModuleEnabled, isFeatureEnabled } = useApp();

  // Products & Customers
  const [products, setProducts] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers(currentEnterprise.id));
  const [tables, setTables] = useState<RestaurantTable[]>(() =>
    isModuleEnabled('restaurant') ? db.getRestaurantTables(currentEnterprise.id, currentBranch.id) : []
  );

  // Cart & Active Transaction State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');
  const [diningType, setDiningType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState<number>(0);
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(() =>
    isModuleEnabled('restaurant') ? 10 : 0
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState<string | null>(null);

  // Modals state
  const [activeVariantProduct, setActiveVariantProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'digital' | 'credit' | 'split'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [heldSales, setHeldSales] = useState<{ id: string; name: string; items: CartItem[]; customerId?: string; time: string }[]>([]);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Refresh data on enterprise or branch switch
  useEffect(() => {
    setProducts(db.getProducts(currentEnterprise.id));
    setCustomers(db.getCustomers(currentEnterprise.id));
    if (isModuleEnabled('restaurant')) {
      setTables(db.getRestaurantTables(currentEnterprise.id, currentBranch.id));
    }
  }, [currentEnterprise.id, currentBranch.id, isModuleEnabled]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = selectedCategory === 'all' || p.categoryName === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Selected customer details
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Calculate Subtotal, Taxes, Discounts, and Total
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const lineBase = item.price * item.quantity;
      const discountVal = item.discountType === 'percent'
        ? (lineBase * item.discount) / 100
        : item.discount;
      return acc + (lineBase - discountVal);
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * globalDiscountPercent) / 100;
  }, [subtotal, globalDiscountPercent]);

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (currentEnterprise.taxRate || 0)) / 100;
  const serviceCharge = (taxableAmount * serviceChargePercent) / 100;
  const total = Math.max(0, taxableAmount + taxAmount + serviceCharge);

  // Set default cash tendered to total when opening checkout
  useEffect(() => {
    if (isCheckoutOpen) {
      setCashTendered(Math.ceil(total));
    }
  }, [isCheckoutOpen, total]);

  // --- Add Product to Cart ---
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    // If product has variants and none was selected, open variant modal
    if (product.variants && product.variants.length > 0 && !variant) {
      setActiveVariantProduct(product);
      return;
    }

    const itemPrice = variant ? variant.sellingPrice : product.sellingPrice;
    const itemSku = variant ? variant.sku : product.sku;
    const itemBarcode = variant ? variant.barcode : product.barcode;
    const itemStock = variant ? variant.stock : product.stock;

    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.productId === product.id && (variant ? item.variantId === variant.id : !item.variantId)
      );

      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }

      const newItem: CartItem = {
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        variantName: variant?.name,
        sku: itemSku,
        barcode: itemBarcode,
        price: itemPrice,
        quantity: 1,
        unit: product.unit,
        discount: 0,
        discountType: 'percent',
        taxRate: currentEnterprise.taxRate || 0,
        serialOrImei: product.serialNumber || product.imeiNumber,
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate
      };
      return [...prev, newItem];
    });

    setActiveVariantProduct(null);
  };

  // --- Barcode Scanner Listener ---
  // High-speed scan via USB/Bluetooth hardware barcode scanners
  const handleBarcodeSubmit = (codeToScan?: string) => {
    const code = (codeToScan || barcodeInput).trim();
    if (!code) return;

    const match = db.getProductByBarcode(currentEnterprise.id, code);
    if (match) {
      handleAddToCart(match.product, match.variant);
      setBarcodeScanFeedback(`Added: ${match.product.name}`);
      setBarcodeInput('');
    } else {
      setBarcodeScanFeedback(`No product found for barcode "${code}"`);
    }

    setTimeout(() => {
      setBarcodeScanFeedback(null);
    }, 2500);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        handleHoldSale();
      } else if (e.key === 'F8' && cart.length > 0) {
        e.preventDefault();
        setCart([]);
      } else if (e.key === 'F9' && cart.length > 0) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      } else if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
        setActiveVariantProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Adjust item quantity in cart
  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  };

  // Update item discount
  const updateItemDiscount = (index: number, discount: number) => {
    setCart(prev => {
      const next = [...prev];
      next[index].discount = Math.max(0, Math.min(100, discount));
      return next;
    });
  };

  // Hold active sale
  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const name = selectedCustomer ? selectedCustomer.name : `Order #${heldSales.length + 1}`;
    setHeldSales(prev => [
      ...prev,
      {
        id: 'held-' + Date.now(),
        name,
        items: [...cart],
        customerId: selectedCustomerId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCart([]);
    setSelectedCustomerId('');
    setSelectedTableNumber('');
  };

  // Resume held sale
  const handleResumeSale = (heldId: string) => {
    const item = heldSales.find(h => h.id === heldId);
    if (!item) return;
    setCart(item.items);
    if (item.customerId) setSelectedCustomerId(item.customerId);
    setHeldSales(prev => prev.filter(h => h.id !== heldId));
  };

  // Complete checkout
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const invoiceNumber = `INV-${currentEnterprise.code.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const change = Math.max(0, cashTendered - total);

    const saleData = {
      enterpriseId: currentEnterprise.id,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      invoiceNumber,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: cart,
      subtotal,
      discountAmount,
      taxAmount,
      serviceCharge,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? cashTendered : total,
      changeDue: paymentMethod === 'cash' ? change : 0,
      status: 'completed' as const,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      tableNumber: selectedTableNumber || undefined,
      diningType: isModuleEnabled('restaurant') ? diningType : undefined,
      notes: orderNotes || undefined
    };

    // Atomic DB execution
    const res = db.completeSale(saleData);

    if (res.success) {
      // If restaurant module is on, also send order to KDS
      if (isModuleEnabled('restaurant') && isFeatureEnabled('restaurantKds')) {
        db.createKitchenOrder({
          enterpriseId: currentEnterprise.id,
          branchId: currentBranch.id,
          orderNumber: `KDS-${invoiceNumber.slice(-4)}`,
          tableNumber: selectedTableNumber || 'Takeaway',
          diningType,
          items: cart.map(i => ({ name: i.name, qty: i.quantity })),
          status: 'pending',
          createdAt: 'Just now'
        });
      }

      setCompletedSale(res.sale);
      setCart([]);
      setSelectedCustomerId('');
      setSelectedTableNumber('');
      setOrderNotes('');
      setGlobalDiscountPercent(0);
      setIsCheckoutOpen(false);
      // Refresh products to show updated stock
      setProducts(db.getProducts(currentEnterprise.id));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] gap-4 overflow-hidden">
      
      {/* LEFT SECTION: PRODUCT CATALOG & BARCODE SEARCH (65% width) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        
        {/* Top Control Bar: Barcode Fast Scan & Search */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center gap-3">
          
          {/* Barcode Quick Scan Input (Focused for USB Scanners) */}
          <div className="relative flex-1 min-w-[220px]">
            <Barcode className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode (or press F2)..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBarcodeSubmit();
                }
              }}
              className="w-full pl-9 pr-20 py-2 bg-slate-950 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono shadow-inner"
            />
            <button
              type="button"
              onClick={() => handleBarcodeSubmit()}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
            >
              Scan
            </button>
          </div>

          {/* Product Name/SKU Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Held Sales Counter / Drawer Button */}
          {heldSales.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">{heldSales.length} Held</span>
              <div className="flex gap-1 ml-1">
                {heldSales.map((held) => (
                  <button
                    key={held.id}
                    onClick={() => handleResumeSale(held.id)}
                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold transition-colors"
                    title={`Resume ${held.name} (${held.time})`}
                  >
                    Resume
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Scan Feedback Notification */}
        {barcodeScanFeedback && (
          <div className="px-4 py-1.5 bg-indigo-950/70 border-b border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{barcodeScanFeedback}</span>
          </div>
        )}

        {/* Category Browsing Tabs */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-slate-800/80 overflow-x-auto bg-slate-950/40 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid (Responsive & Touch-Friendly) */}
        <div className="flex-1 p-3.5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            const isOutOfStock = p.stock <= 0;

            return (
              <button
                key={p.id}
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(p)}
                className={`flex flex-col justify-between text-left p-3 rounded-xl border transition-all duration-150 ${
                  isOutOfStock
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]">
                      {p.sku}
                    </span>
                    {hasVariants && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {p.variants.length} Variants
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {p.name}
                  </h3>
                  {p.genericName && (
                    <p className="text-[10px] text-teal-400 italic truncate mt-0.5">
                      {p.genericName}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Stock: <span className={p.stock <= p.minStock ? 'text-rose-400 font-bold' : 'text-slate-300'}>{p.stock}</span> {p.unit}
                    </div>
                    <div className="text-sm font-extrabold text-white font-mono">
                      ${p.sellingPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 space-y-2">
              <Barcode className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No matching products found in catalog.</p>
            </div>
          )}
        </div>

        {/* Bottom Keyboard Shortcuts Cheat-sheet */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F2</kbd> Scan Barcode</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F4</kbd> Hold Sale</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F8</kbd> Clear Cart</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">F9</kbd> Pay / Checkout</span>
          </div>
          <span className="font-mono text-slate-400">{currentBranch.name}</span>
        </div>

      </div>

      {/* RIGHT SECTION: ACTIVE CART & ORDER SUMMARY (35% width) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">Active Order</h2>
              <span className="text-[11px] text-slate-400">{cart.length} distinct item{cart.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleHoldSale}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Hold current sale (F4)"
                >
                  <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                  Hold
                </button>
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Clear entire cart (F8)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Customer & Restaurant Table Selectors */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 space-y-2 text-xs">
          
          {/* Customer Selection */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Walk-in Customer (Standard)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.loyaltyPoints} pts | Bal: ${c.outstandingBalance})
                </option>
              ))}
            </select>
          </div>

          {/* Restaurant Module Specific: Tables & Dining Type */}
          {isModuleEnabled('restaurant') && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Table...</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.number}>
                    Table {t.number} ({t.capacity}p - {t.zone})
                  </option>
                ))}
              </select>

              <select
                value={diningType}
                onChange={(e) => setDiningType(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="dine_in">Dine-In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          )}
        </div>

        {/* Itemized Cart List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.map((item, index) => {
            const lineTotal = (item.price * item.quantity) * (1 - (item.discount || 0) / 100);

            return (
              <div
                key={index}
                className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[10px] text-indigo-300 font-medium">
                        Variant: {item.variantName}
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      ${item.price.toFixed(2)} / {item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-white font-mono">
                      ${lineTotal.toFixed(2)}
                    </div>
                    {item.discount > 0 && (
                      <span className="text-[9px] text-emerald-400">-{item.discount}% off</span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Discount */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(index, -1)}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(index, 1)}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Discount Input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Disc%:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount || ''}
                      onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-right text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-slate-700" />
              <p className="text-xs">Cart is empty. Click products or scan barcode to add.</p>
            </div>
          )}
        </div>

        {/* Order Totals Summary */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
          
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
          </div>

          {/* Global Order Discount */}
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Global Discount (%):
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={globalDiscountPercent || ''}
              onChange={(e) => setGlobalDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              placeholder="0"
              className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-right text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tax Rate */}
          <div className="flex justify-between text-slate-400">
            <span>Tax ({currentEnterprise.taxRate}%):</span>
            <span className="font-mono text-slate-200">${taxAmount.toFixed(2)}</span>
          </div>

          {/* Service Charge (Restaurant) */}
          {isModuleEnabled('restaurant') && (
            <div className="flex justify-between text-slate-400">
              <span>Service Charge ({serviceChargePercent}%):</span>
              <span className="font-mono text-slate-200">${serviceCharge.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-white">TOTAL DUE:</span>
              <p className="text-[10px] text-slate-400">Inclusive of taxes</p>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ${total.toFixed(2)}
            </div>
          </div>

          {/* Pay Button (F9) */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-[0.99]'
            }`}
          >
            <span>Proceed to Payment (F9)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* MODAL 1: VARIANT SELECTOR */}
      {activeVariantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Select Product Variant</h3>
                <p className="text-xs text-slate-400">{activeVariantProduct.name}</p>
              </div>
              <button onClick={() => setActiveVariantProduct(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {activeVariantProduct.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleAddToCart(activeVariantProduct, v)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 flex items-center justify-between text-left transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      SKU: {v.sku} | Barcode: {v.barcode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-white font-mono">
                      ${v.sellingPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Stock: {v.stock}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHECKOUT & PAYMENT */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Checkout & Payment</h3>
                <p className="text-xs text-slate-400">Total: ${total.toFixed(2)}</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Payment Methods */}
            <div className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'bank_transfer', label: 'Bank Transfer', icon: Receipt },
                    { id: 'digital', label: 'Digital / QR', icon: Barcode },
                    { id: 'credit', label: 'Customer Credit', icon: UserCheck }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === m.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Tendered & Change Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">
                      Cash Received ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-1.5 bg-slate-900 border border-indigo-500 rounded-lg text-sm text-right text-white font-mono font-bold focus:outline-none"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold transition-colors"
                      >
                        ${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCashTendered(total)}
                      className="flex-1 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 rounded text-xs font-mono font-bold transition-colors"
                    >
                      Exact
                    </button>
                  </div>

                  {/* Change Due Display */}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400">Change Due:</span>
                    <span className={`font-mono text-base ${cashTendered >= total ? 'text-emerald-400 font-extrabold' : 'text-rose-400'}`}>
                      ${Math.max(0, cashTendered - total).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Optional Sale Notes / Receipt Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchase order PO#841 or special instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                Back to Cart
              </button>
              
              <button
                type="button"
                onClick={handleCompleteSale}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Transaction (${total.toFixed(2)})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: THERMAL RECEIPT & PRINT PREVIEW */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          isOpen={true}
          onClose={() => setCompletedSale(null)}
        />
      )}

    </div>
  );
};

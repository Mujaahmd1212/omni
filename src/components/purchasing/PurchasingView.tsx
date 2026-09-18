import React, { useState } from 'react';
import {
  Truck,
  Plus,
  PackageCheck,
  Building2,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const PurchasingView: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser } = useApp();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers(currentEnterprise.id));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => db.getPurchaseOrders(currentEnterprise.id));
  const [products] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);

  // New PO State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poProductId, setPoProductId] = useState<string>(products[0]?.id || '');
  const [poQuantity, setPoQuantity] = useState<number>(25);
  const [poUnitCost, setPoUnitCost] = useState<number>(products[0]?.costPrice || 10);

  // New Supplier State
  const [newSupName, setNewSupName] = useState<string>('');
  const [newSupContact, setNewSupContact] = useState<string>('');
  const [newSupPhone, setNewSupPhone] = useState<string>('');
  const [newSupEmail, setNewSupEmail] = useState<string>('');
  const [newSupAddress, setNewSupAddress] = useState<string>('');

  const reload = () => {
    setSuppliers(db.getSuppliers(currentEnterprise.id));
    setPurchaseOrders(db.getPurchaseOrders(currentEnterprise.id));
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    db.saveSupplier({
      enterpriseId: currentEnterprise.id,
      companyName: newSupName.trim(),
      contactPerson: newSupContact.trim() || 'Purchasing Agent',
      phone: newSupPhone.trim() || 'N/A',
      email: newSupEmail.trim() || 'vendor@example.com',
      address: newSupAddress.trim() || 'Vendor Address',
      paymentTerms: 'Net 30',
      outstandingBalance: 0
    });

    setIsSupplierModalOpen(false);
    setNewSupName('');
    reload();
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    const prod = products.find(p => p.id === poProductId);
    if (!sup || !prod) return;

    const totalAmount = poQuantity * poUnitCost;
    const poNumber = `PO-${currentEnterprise.code.slice(0, 3)}-${Date.now().toString().slice(-5)}`;

    db.createPurchaseOrder({
      enterpriseId: currentEnterprise.id,
      branchId: currentBranch.id,
      supplierId: sup.id,
      supplierName: sup.companyName,
      orderNumber: poNumber,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: poQuantity,
          unitCost: poUnitCost,
          total: totalAmount
        }
      ],
      totalAmount,
      status: 'ordered'
    });

    setIsPoModalOpen(false);
    reload();
  };

  const handleReceiveGoods = (poId: string) => {
    const success = db.receivePurchaseOrder(poId, currentEnterprise.id, currentUser.name);
    if (success) {
      reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Purchasing & Vendor Management</h1>
            <p className="text-xs text-slate-400">
              Procurement orders, supplier ledgers, and 1-click automatic stock receipt integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            Add Supplier
          </button>
          
          <button
            onClick={() => setIsPoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Grid: Purchase Orders (Left 65%) & Suppliers Ledger (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Purchase Orders Table */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              Purchase Orders ({purchaseOrders.length})
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">PO Number</th>
                  <th className="p-3 font-semibold">Supplier</th>
                  <th className="p-3 font-semibold">Items</th>
                  <th className="p-3 font-semibold">Total Cost</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-300">
                      {po.orderNumber}
                      <div className="text-[10px] text-slate-500 font-sans">{new Date(po.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {po.supplierName}
                    </td>
                    <td className="p-3">
                      {po.items.map((it, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300">
                          <span className="font-semibold text-white">{it.quantity}x</span> {it.productName}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-mono font-extrabold text-white">
                      ${po.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        po.status === 'received'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {po.status === 'received' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {po.status !== 'received' ? (
                        <button
                          onClick={() => handleReceiveGoods(po.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 ml-auto"
                          title="Increments product inventory automatically"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Receive Goods
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Inventory Updated</span>
                      )}
                    </td>
                  </tr>
                ))}

                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No purchase orders issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Approved Suppliers ({suppliers.length})
            </h2>
          </div>

          <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-white">{s.companyName}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Bal: ${s.outstandingBalance.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{s.email}</span>
                    </div>
                  )}
                  {s.contactPerson && (
                    <div className="text-[10px] text-slate-500">
                      Contact: {s.contactPerson}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {suppliers.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs">
                No registered suppliers found.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: NEW PURCHASE ORDER */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreatePo}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Create New Purchase Order</h2>
              <button onClick={() => setIsPoModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.companyName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Product to Order</label>
              <select
                value={poProductId}
                onChange={(e) => {
                  setPoProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setPoUnitCost(p.costPrice);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} | In Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={poUnitCost}
                  onChange={(e) => setPoUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Total Purchase Cost:</span>
              <span className="font-mono text-white">${(poQuantity * poUnitCost).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPoModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSupplier}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Add Approved Supplier</h2>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Supplier Name *</label>
              <input
                type="text"
                required
                value={newSupName}
                onChange={(e) => setNewSupName(e.target.value)}
                placeholder="e.g. Apex Tools & Fasteners Ltd"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="555-0199"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={newSupEmail}
                onChange={(e) => setNewSupEmail(e.target.value)}
                placeholder="orders@supplier.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Warehouse Address</label>
              <input
                type="text"
                value={newSupAddress}
                onChange={(e) => setNewSupAddress(e.target.value)}
                placeholder="100 Logistics Park, Industrial Zone"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

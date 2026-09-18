import React, { useState } from 'react';
import { History, Plus, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { InventoryMovement, Product } from '../../types';

export const InventoryMovements: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser } = useApp();
  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    db.getInventoryMovements(currentEnterprise.id)
  );
  const [products] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Adjustment Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantityDelta, setQuantityDelta] = useState<number>(1);
  const [reason, setReason] = useState<string>('Physical Count Reconciliation');

  const reload = () => {
    setMovements(db.getInventoryMovements(currentEnterprise.id));
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantityDelta === 0) return;

    db.adjustStock(
      currentEnterprise.id,
      currentBranch.id,
      selectedProductId,
      quantityDelta,
      reason,
      currentUser.name
    );

    setIsAdjustOpen(false);
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Inventory Movement Audit Trail</h1>
            <p className="text-xs text-slate-400">
              Complete chronological record of all stock increments, decrements, adjustments & transfers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdjustOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Manual Stock Adjustment
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Product Name</th>
                <th className="p-3.5 font-semibold">Movement Type</th>
                <th className="p-3.5 font-semibold">Qty Change</th>
                <th className="p-3.5 font-semibold">Before / After Stock</th>
                <th className="p-3.5 font-semibold">Reference / Reason</th>
                <th className="p-3.5 font-semibold text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map((m) => {
                const isPositive = m.quantityChange > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      {m.productName}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.type === 'sale' ? 'bg-slate-800 text-slate-300' :
                        m.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        m.type === 'return' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {m.previousStock} → <span className="font-bold text-white">{m.newStock}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div className="font-medium">{m.reason || m.referenceId || '-'}</div>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-400">
                      {m.performedBy}
                    </td>
                  </tr>
                );
              })}

              {movements.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No inventory movements recorded yet. Movements are logged automatically on sales, purchases, and transfers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUSTMENT MODAL */}
      {isAdjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleAdjustSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Manual Stock Level Adjustment</h2>
              <button onClick={() => setIsAdjustOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Quantity Change (+ to add, - to subtract)
              </label>
              <input
                type="number"
                required
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason for Adjustment</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Physical Count Reconciliation">Physical Count Reconciliation</option>
                <option value="Damaged in Warehouse">Damaged in Warehouse</option>
                <option value="Expired / Spoiled Goods">Expired / Spoiled Goods</option>
                <option value="Supplier Return">Supplier Return</option>
                <option value="Customer Return (Untracked)">Customer Return (Untracked)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Confirm Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

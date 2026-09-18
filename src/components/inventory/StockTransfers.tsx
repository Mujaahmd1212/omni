import React, { useState } from 'react';
import { ArrowRightLeft, Plus, CheckCircle2, Building2, Package, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { StockTransfer, Product } from '../../types';

export const StockTransfers: React.FC = () => {
  const { currentEnterprise, branches, currentUser } = useApp();
  const [transfers, setTransfers] = useState<StockTransfer[]>(() =>
    db.getStockTransfers(currentEnterprise.id)
  );
  const [products] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fromBranchId, setFromBranchId] = useState<string>(branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState<string>(branches[1]?.id || branches[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');

  const reload = () => {
    setTransfers(db.getStockTransfers(currentEnterprise.id));
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromBranchId || !toBranchId || fromBranchId === toBranchId) {
      alert('Source and destination branches must be distinct.');
      return;
    }
    if (!selectedProductId || quantity <= 0) {
      alert('Select a valid product and transfer quantity.');
      return;
    }

    db.transferStock(
      currentEnterprise.id,
      fromBranchId,
      toBranchId,
      [{ productId: selectedProductId, quantity }],
      currentUser.name,
      notes
    );

    setIsModalOpen(false);
    setNotes('');
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Branch Stock Transfers</h1>
            <p className="text-xs text-slate-400">
              Inter-branch inventory movements with automatic real-time deduction and balance updates
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Initiate Branch Transfer
        </button>
      </div>

      {/* Transfers List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Transfer Ref</th>
                <th className="p-3.5 font-semibold">Source Branch</th>
                <th className="p-3.5 font-semibold">Destination Branch</th>
                <th className="p-3.5 font-semibold">Items Transferred</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Initiated By</th>
                <th className="p-3.5 font-semibold text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-300">
                    {t.transferNumber}
                  </td>
                  <td className="p-3.5 font-medium text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {t.fromBranchName}
                  </td>
                  <td className="p-3.5 font-medium text-white">
                    {t.toBranchName}
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      {t.items.map((item, i) => (
                        <div key={i} className="text-[11px] text-slate-300">
                          <span className="font-semibold text-white">{item.quantity}x</span> {item.productName}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {t.createdBy}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {transfers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    No stock transfers recorded yet for this enterprise.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRANSFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTransfer}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Initiate Inter-Branch Transfer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Branch (Outflow)</label>
                <select
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Branch (Inflow)</label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Product to Transfer</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} | In Stock: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transfer Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transfer Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Urgent stock replenishment for weekend rush"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Execute Stock Transfer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

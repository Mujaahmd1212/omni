import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  CreditCard,
  Building2
} from 'lucide-react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { ReceiptModal } from '../pos/ReceiptModal';

export const SalesHistory: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser } = useApp();
  const [sales, setSales] = useState<Sale[]>(() => db.getSales(currentEnterprise.id));

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Modals
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [refundConfirmSale, setRefundConfirmSale] = useState<Sale | null>(null);
  const [refundReason, setRefundReason] = useState<string>('Customer returned items');

  const reload = () => {
    setSales(db.getSales(currentEnterprise.id));
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchSearch =
        s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;

      return true;
    });
  }, [sales, searchQuery, statusFilter, branchFilter]);

  const handleExecuteRefund = () => {
    if (!refundConfirmSale) return;

    const res = db.refundSale(
      refundConfirmSale.id,
      currentEnterprise.id,
      refundReason,
      currentUser.name
    );

    if (res.success) {
      setRefundConfirmSale(null);
      reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Invoices & Transactions</h1>
            <p className="text-xs text-slate-400">
              Transaction history, receipt reprints, and inventory-restoring refund management
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, or cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="refunded">Refunded Only</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono flex justify-between items-center">
            <span>Total Records:</span>
            <span className="font-bold text-white">{filteredSales.length}</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Invoice #</th>
                <th className="p-3.5 font-semibold">Date & Time</th>
                <th className="p-3.5 font-semibold">Branch</th>
                <th className="p-3.5 font-semibold">Customer / Table</th>
                <th className="p-3.5 font-semibold">Items</th>
                <th className="p-3.5 font-semibold">Total Amount</th>
                <th className="p-3.5 font-semibold">Payment</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-300">
                    {s.invoiceNumber}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {s.branchName}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-white">
                      {s.customerName || 'Walk-in Customer'}
                    </div>
                    {s.tableNumber && (
                      <span className="text-[10px] text-amber-400">Table: {s.tableNumber}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {s.items.length} item{s.items.length === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-extrabold text-white text-sm">
                    ${s.total.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Reprint Receipt */}
                      <button
                        onClick={() => setActiveReceiptSale(s)}
                        className="p-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                        title="Reprint Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Refund Button */}
                      {s.status === 'completed' && (
                        <button
                          onClick={() => setRefundConfirmSale(s)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                          title="Refund Transaction & Restore Inventory"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    No sales invoices match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {activeReceiptSale && (
        <ReceiptModal
          sale={activeReceiptSale}
          isOpen={true}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* REFUND CONFIRMATION MODAL */}
      {refundConfirmSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Refund Transaction</h3>
                <p className="text-xs text-slate-400 font-mono">Invoice: {refundConfirmSale.invoiceNumber}</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg">
              Refunding this transaction will automatically restore <strong className="text-white">{refundConfirmSale.items.length} items</strong> back to catalog inventory stock and log an immutable return movement.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason for Refund</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Customer changed mind / returned items">Customer changed mind / returned items</option>
                <option value="Defective / Damaged product">Defective / Damaged product</option>
                <option value="Incorrect item rung by cashier">Incorrect item rung by cashier</option>
                <option value="Overcharged price correction">Overcharged price correction</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRefundConfirmSale(null)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30"
              >
                Confirm Full Refund (${refundConfirmSale.total.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

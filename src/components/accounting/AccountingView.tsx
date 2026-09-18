import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Receipt, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ExpenseRecord, Sale, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const AccountingView: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser } = useApp();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => db.getExpenses(currentEnterprise.id));
  const [sales] = useState<Sale[]>(() => db.getSales(currentEnterprise.id));
  const [products] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseCategory, setExpenseCategory] = useState<string>('Utilities');
  const [expenseAmount, setExpenseAmount] = useState<number>(50);
  const [expenseDescription, setExpenseDescription] = useState<string>('');

  const reload = () => {
    setExpenses(db.getExpenses(currentEnterprise.id));
  };

  // Financial Computations
  const totalRevenue = useMemo(() => {
    return sales.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  // Approximate COGS from product costPrice
  const totalCogs = useMemo(() => {
    let sum = 0;
    sales.filter(s => s.status === 'completed').forEach(s => {
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cost = prod ? prod.costPrice : item.price * 0.6;
        sum += cost * item.quantity;
      });
    });
    return sum;
  }, [sales, products]);

  const grossProfit = totalRevenue - totalCogs;

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  const netProfit = grossProfit - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    db.addExpense({
      enterpriseId: currentEnterprise.id,
      branchId: currentBranch.id,
      category: expenseCategory as any,
      amount: Number(expenseAmount),
      description: expenseDescription.trim(),
      date: new Date().toISOString(),
      recordedBy: currentUser.name,
      paymentMethod: 'Cash'
    });

    setIsExpenseModalOpen(false);
    setExpenseDescription('');
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Accounting & Financials</h1>
            <p className="text-xs text-slate-400">
              Cash reconciliation, operating expenses, and real-time Profit & Loss statement
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Record Operating Expense
        </button>
      </div>

      {/* P&L Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Sales Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${totalRevenue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500">From {sales.length} completed transactions</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cost of Goods (COGS)</span>
            <ArrowDownRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-300 font-mono">
            ${totalCogs.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500">Inventory acquisition costs</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Operating Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-300 font-mono">
            ${totalExpenses.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500">Rent, wages, utilities, logistics</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 bg-gradient-to-br from-indigo-950/40 to-slate-900">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
            <span>Net Business Profit</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${netProfit.toFixed(2)}
          </div>
          <p className="text-[10px] text-indigo-300/60">Gross profit minus operating expenses</p>
        </div>

      </div>

      {/* Expenses Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-400" />
            Operating Expense Records ({expenses.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Date</th>
                <th className="p-3.5 font-semibold">Category</th>
                <th className="p-3.5 font-semibold">Description</th>
                <th className="p-3.5 font-semibold">Recorded By</th>
                <th className="p-3.5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-white">
                    {e.description || '-'}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {e.recordedBy}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-rose-400 text-sm">
                    -${e.amount.toFixed(2)}
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    No operating expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddExpense}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Record Operating Expense</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expense Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Utilities">Utilities & Electricity</option>
                <option value="Rent & Lease">Store Rent & Lease</option>
                <option value="Staff Wages">Staff Wages / Overtime</option>
                <option value="Packaging & Bags">Packaging, Bags & Thermal Paper</option>
                <option value="Delivery & Logistics">Delivery Fuel & Logistics</option>
                <option value="Maintenance">Equipment Repairs & Maintenance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Memo</label>
              <input
                type="text"
                placeholder="e.g. Monthly commercial high-speed internet bill"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

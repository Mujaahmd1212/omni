import React, { useState } from 'react';
import { Users, Plus, Award, CreditCard, Phone, Mail, Search, CheckCircle2 } from 'lucide-react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const CustomersView: React.FC = () => {
  const { currentEnterprise } = useApp();
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers(currentEnterprise.id));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  // New Customer Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [creditLimit, setCreditLimit] = useState<number>(500);

  const reload = () => {
    setCustomers(db.getCustomers(currentEnterprise.id));
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    db.saveCustomer({
      enterpriseId: currentEnterprise.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || '',
      address: 'Main Store Customer',
      totalSpent: 0,
      loyaltyPoints: 0,
      outstandingBalance: 0,
      creditLimit: Number(creditLimit) || 500
    });

    setIsAddOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    reload();
  };

  const handleSettleBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCustomer || settleAmount <= 0) return;

    const newBalance = Math.max(0, settleCustomer.outstandingBalance - settleAmount);
    db.saveCustomer({
      ...settleCustomer,
      outstandingBalance: newBalance
    });

    setSettleCustomer(null);
    setSettleAmount(0);
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Customer Accounts & Loyalty</h1>
            <p className="text-xs text-slate-400">
              Customer directories, rewards points, and customer store credit ledgers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search customer by name, phone number, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Customer Name</th>
                <th className="p-3.5 font-semibold">Contact Info</th>
                <th className="p-3.5 font-semibold">Total Spent</th>
                <th className="p-3.5 font-semibold">Loyalty Points</th>
                <th className="p-3.5 font-semibold">Credit Balance</th>
                <th className="p-3.5 font-semibold">Credit Limit</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">
                    {c.name}
                  </td>
                  <td className="p-3.5 space-y-0.5 text-slate-400">
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    ${c.totalSpent.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      <Award className="w-3.5 h-3.5" />
                      {c.loyaltyPoints} pts
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className={`font-bold ${c.outstandingBalance > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      ${c.outstandingBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    ${c.creditLimit ? c.creditLimit.toFixed(2) : '500.00'}
                  </td>
                  <td className="p-3.5 text-right">
                    {c.outstandingBalance > 0 ? (
                      <button
                        onClick={() => {
                          setSettleCustomer(c);
                          setSettleAmount(c.outstandingBalance);
                        }}
                        className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 transition-all"
                      >
                        Settle Credit
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">Cleared</span>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    No customers found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER CUSTOMER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Register New Customer</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Miller"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0182"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Credit Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SETTLE CREDIT MODAL */}
      {settleCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSettleBalance}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Settle Customer Store Credit</h2>
              <button onClick={() => setSettleCustomer(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl space-y-1">
              <div className="text-white font-bold">{settleCustomer.name}</div>
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Outstanding Balance:</span>
                <span className="text-rose-400 font-bold">${settleCustomer.outstandingBalance.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Received Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={settleCustomer.outstandingBalance}
                value={settleAmount}
                onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-emerald-400 focus:outline-none focus:border-indigo-500 text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSettleCustomer(null)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

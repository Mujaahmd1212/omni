import React, { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle2, Clock, Search, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const PharmacyModule: React.FC = () => {
  const { currentEnterprise } = useApp();
  const [products] = useState<Product[]>(() => db.getProducts(currentEnterprise.id));
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sample Pharmacy Batches
  const sampleBatches = [
    { id: 'b-1', drugName: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', batchNo: 'B-9482', mfgDate: '2025-01-10', expDate: '2026-11-30', stock: 450, status: 'good' },
    { id: 'b-2', drugName: 'Paracetamol 500mg Tab', genericName: 'Acetaminophen', batchNo: 'B-8102', mfgDate: '2024-04-12', expDate: '2026-04-30', stock: 120, status: 'near_expiry' },
    { id: 'b-3', drugName: 'Cetirizine 10mg Film', genericName: 'Cetirizine HCl', batchNo: 'B-7721', mfgDate: '2023-08-01', expDate: '2025-08-01', stock: 15, status: 'expired' },
    { id: 'b-4', drugName: 'Azithromycin 250mg', genericName: 'Azithromycin Dihydrate', batchNo: 'B-9901', mfgDate: '2025-03-01', expDate: '2027-03-01', stock: 300, status: 'good' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Pharmacy & Prescription FEFO System</h1>
            <p className="text-xs text-slate-400">
              First-Expiry-First-Out batch tracking, generic substitution, and regulatory compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1 Batch Expired</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>1 Batch Near Expiry</span>
          </div>
        </div>
      </div>

      {/* FEFO Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Active Pharmaceutical Batches (FEFO Prioritized)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Medicine Brand Name</th>
                <th className="p-3.5 font-semibold">Generic Active Ingredient</th>
                <th className="p-3.5 font-semibold">Batch No</th>
                <th className="p-3.5 font-semibold">Mfg Date</th>
                <th className="p-3.5 font-semibold">Expiry Date (FEFO)</th>
                <th className="p-3.5 font-semibold">Current Stock</th>
                <th className="p-3.5 font-semibold text-right">Batch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">
                    {b.drugName}
                  </td>
                  <td className="p-3.5 text-teal-300 italic font-medium">
                    {b.genericName}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {b.batchNo}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {b.mfgDate}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[11px]">
                    <span className={b.status === 'expired' ? 'text-rose-400' : b.status === 'near_expiry' ? 'text-amber-400' : 'text-slate-200'}>
                      {b.expDate}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    {b.stock} units
                  </td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      b.status === 'good'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : b.status === 'near_expiry'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {b.status === 'good' && <CheckCircle2 className="w-3 h-3" />}
                      {b.status === 'near_expiry' && <Clock className="w-3 h-3" />}
                      {b.status === 'expired' && <AlertTriangle className="w-3 h-3" />}
                      {b.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

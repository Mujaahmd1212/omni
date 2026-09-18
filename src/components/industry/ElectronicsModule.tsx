import React, { useState } from 'react';
import { Smartphone, Plus, Wrench, Search, Clock, CheckCircle2, User, DollarSign } from 'lucide-react';
import { RepairTicket } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const ElectronicsModule: React.FC = () => {
  const { currentEnterprise, currentBranch } = useApp();
  const [tickets, setTickets] = useState<RepairTicket[]>(() =>
    db.getRepairTickets(currentEnterprise.id, currentBranch.id)
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deviceModel, setDeviceModel] = useState<string>('');
  const [imei, setImei] = useState<string>('');
  const [issue, setIssue] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<number>(120);

  const reload = () => {
    setTickets(db.getRepairTickets(currentEnterprise.id, currentBranch.id));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !deviceModel) return;

    db.saveRepairTicket({
      enterpriseId: currentEnterprise.id,
      branchId: currentBranch.id,
      ticketNumber: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deviceType: 'Smartphone',
      brandModel: deviceModel.trim(),
      serialOrImei: imei.trim(),
      issueDescription: issue.trim(),
      totalEstimate: Number(estimatedCost),
      laborCharge: 70,
      partsCharge: Number(estimatedCost) - 70,
      technicianName: 'Alex Technician',
      status: 'diagnosing',
      receivedDate: new Date().toISOString()
    });

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeviceModel('');
    setImei('');
    setIssue('');
    reload();
  };

  const handleAdvanceStatus = (ticket: RepairTicket) => {
    const nextStatus: RepairTicket['status'] =
      ticket.status === 'diagnosing' ? 'in_repair' :
      ticket.status === 'in_repair' ? 'ready' : 'delivered';

    db.saveRepairTicket({
      ...ticket,
      status: nextStatus
    });
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Mobile & Electronics Repair Workbench</h1>
            <p className="text-xs text-slate-400">
              IMEI/Serial registry, hardware repair job cards, and technician labor estimation
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Repair Ticket
        </button>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            Device Repair Tickets ({tickets.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Job Ticket #</th>
                <th className="p-3.5 font-semibold">Device & IMEI</th>
                <th className="p-3.5 font-semibold">Customer</th>
                <th className="p-3.5 font-semibold">Reported Issue</th>
                <th className="p-3.5 font-semibold">Technician</th>
                <th className="p-3.5 font-semibold">Est. Cost</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-sky-300">
                    {t.ticketNumber}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{t.brandModel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">IMEI: {t.serialOrImei}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{t.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.customerPhone}</div>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs truncate">
                    {t.issueDescription}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {t.technicianName}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">
                    ${t.totalEstimate.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      t.status === 'ready' || t.status === 'delivered'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.status === 'in_repair'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {t.status?.replace('_', ' ') || 'unknown'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {t.status !== 'delivered' && (
                      <button
                        onClick={() => handleAdvanceStatus(t)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Advance Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Create Device Repair Job Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Jason Clarke"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="555-0144"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Model *</label>
                <input
                  type="text"
                  required
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. iPhone 14 Pro"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">IMEI / Serial No</label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="354892019281920"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reported Issue & Symptoms</label>
              <input
                type="text"
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Broken OLED display, battery swollen, no power"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
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
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30"
              >
                Create Job Card
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

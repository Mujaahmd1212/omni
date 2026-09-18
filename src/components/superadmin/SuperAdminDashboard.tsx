import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  Sliders,
  Check,
  X,
  Plus,
  Database,
  History,
  CheckCircle2,
  Sparkles,
  Copy
} from 'lucide-react';
import { Enterprise, EnterpriseCategory, AuditLog } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

export const SuperAdminDashboard: React.FC = () => {
  const { enterprises, reloadAppData, setEnterprise } = useApp();
  const [localEnterprises, setLocalEnterprises] = useState<Enterprise[]>(() => db.getEnterprises());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  // Onboarding Form State
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    category: 'grocery' as EnterpriseCategory,
    phone: '555-0900',
    email: 'admin@newstore.com',
    address: '88 Market Boulevard',
    currency: 'USD',
    taxRate: 8,
    branchName: 'Downtown Central Store',
    adminName: 'Owner Manager',
    adminEmail: 'owner@newstore.com',
    selectedModules: {
      corePos: true,
      inventory: true,
      purchasing: true,
      customers: true,
      suppliers: true,
      accounting: true,
      barcodeSystem: true,
      restaurant: false,
      pharmacy: false,
      hardwareStore: false,
      computerMobile: false,
      clothingShoe: false,
      hotel: false
    },
    selectedFeatures: {
      barcodeScanning: true,
      barcodePrinting: true,
      offlineBilling: true,
      multiBranchTransfer: true,
      holdResumeCart: true,
      customerCreditLedger: true,
      customerLoyaltyPoints: true,
      hardwareUnitConversion: false,
      hardwareBulkDiscount: false,
      pharmacyFefoExpiry: false,
      pharmacyGenericMatch: false,
      pharmacyPrescription: false,
      restaurantTableLayout: false,
      restaurantKds: false,
      restaurantSplitBill: false,
      computerImeiRegistry: false,
      computerRepairTickets: false,
      clothingVariantsMatrix: false,
      hotelRoomRack: false,
      hotelHousekeeping: false
    }
  });

  const reload = () => {
    const ents = db.getEnterprises();
    setLocalEnterprises(ents);
    setAuditLogs(db.getAuditLogs());
    reloadAppData();
  };

  // Toggle module on an enterprise
  const handleToggleModule = (enterprise: Enterprise, modKey: keyof Enterprise['modules']) => {
    const updatedModules = {
      ...enterprise.modules,
      [modKey]: !enterprise.modules[modKey]
    };
    db.updateEnterpriseModules(enterprise.id, updatedModules, enterprise.features);
    reload();
  };

  // Handle Category Change in Onboarding to Auto-Suggest Modules
  const handleCategorySelect = (cat: EnterpriseCategory) => {
    const baseModules = {
      corePos: true,
      inventory: true,
      purchasing: true,
      customers: true,
      suppliers: true,
      accounting: true,
      barcodeSystem: true,
      restaurant: cat === 'restaurant',
      pharmacy: cat === 'pharmacy',
      hardwareStore: cat === 'hardware',
      computerMobile: cat === 'electronics',
      clothingShoe: cat === 'clothing',
      hotel: cat === 'hotel'
    };

    const baseFeatures = {
      barcodeScanning: true,
      barcodePrinting: true,
      offlineBilling: true,
      multiBranchTransfer: true,
      holdResumeCart: true,
      customerCreditLedger: true,
      customerLoyaltyPoints: true,
      hardwareUnitConversion: cat === 'hardware',
      hardwareBulkDiscount: cat === 'hardware',
      pharmacyFefoExpiry: cat === 'pharmacy',
      pharmacyGenericMatch: cat === 'pharmacy',
      pharmacyPrescription: cat === 'pharmacy',
      restaurantTableLayout: cat === 'restaurant',
      restaurantKds: cat === 'restaurant',
      restaurantSplitBill: cat === 'restaurant',
      computerImeiRegistry: cat === 'electronics',
      computerRepairTickets: cat === 'electronics',
      clothingVariantsMatrix: cat === 'clothing',
      hotelRoomRack: cat === 'hotel',
      hotelHousekeeping: cat === 'hotel'
    };

    setOnboardingData(prev => ({
      ...prev,
      category: cat,
      selectedModules: baseModules,
      selectedFeatures: baseFeatures
    }));
  };

  const handleLaunchEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingData.name.trim()) return;

    const res = db.createEnterpriseWithDefaults(onboardingData);
    setIsOnboardingOpen(false);
    reload();
    // Switch to new enterprise
    setEnterprise(res.enterprise.id);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Platform Control</h1>
            <p className="text-xs text-slate-400">
              Multi-tenant architecture management, feature-flag matrix, and database provisioning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            PostgreSQL / Supabase DDL
          </button>
          
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Onboard New Enterprise
          </button>
        </div>
      </div>

      {/* Super Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Enterprises (Tenants)</span>
          <div className="text-2xl font-black text-white font-mono">{localEnterprises.length}</div>
          <span className="text-[10px] text-emerald-400 font-medium">100% active & isolated</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Provisioned Branches</span>
          <div className="text-2xl font-black text-white font-mono">
            {db.getBranches().length}
          </div>
          <span className="text-[10px] text-purple-300 font-medium">Across all retail categories</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Monthly Recurring Revenue</span>
          <div className="text-2xl font-black text-white font-mono">$1,840.00</div>
          <span className="text-[10px] text-emerald-400 font-medium">Active Pro & Enterprise plans</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Platform Users</span>
          <div className="text-2xl font-black text-white font-mono">{db.getUsers().length}</div>
          <span className="text-[10px] text-slate-500">Owners, Managers, Cashiers</span>
        </div>
      </div>

      {/* FEATURE CONTROL MATRIX (Live Toggle Grid) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Enterprise Feature Control Matrix (Live Permission Toggles)
            </h2>
            <p className="text-[11px] text-slate-400">
              Super admin toggles immediately enable or disable modules per enterprise in real time
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Enterprise</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 text-center">POS</th>
                <th className="p-3 text-center">Inventory</th>
                <th className="p-3 text-center">Purchasing</th>
                <th className="p-3 text-center">Barcodes</th>
                <th className="p-3 text-center">Restaurant</th>
                <th className="p-3 text-center">Pharmacy</th>
                <th className="p-3 text-center">Hardware</th>
                <th className="p-3 text-center">Electronics</th>
                <th className="p-3 text-center">Hotel</th>
                <th className="p-3 text-right">Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {localEnterprises.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-white">{ent.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{ent.code}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize text-[11px]">
                      {ent.category}
                    </span>
                  </td>

                  {/* Module Toggle Checkboxes */}
                  {(['corePos', 'inventory', 'purchasing', 'barcodeSystem', 'restaurant', 'pharmacy', 'hardwareStore', 'computerMobile', 'hotel'] as const).map(mod => {
                    const isEnabled = Boolean(ent.modules?.[mod]);
                    return (
                      <td key={mod} className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleModule(ent, mod)}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-all ${
                            isEnabled
                              ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                          title={`Click to toggle ${mod} for ${ent.name}`}
                        >
                          {isEnabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3 h-3" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="p-3 text-right">
                    <button
                      onClick={() => setEnterprise(ent.id)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Login As
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SYSTEM AUDIT TRAIL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            System-Wide Platform Audit Logs (Recent Actions)
          </h2>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Action</th>
                <th className="p-3 font-semibold">Entity</th>
                <th className="p-3 font-semibold">Details</th>
                <th className="p-3 font-semibold text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.slice(0, 10).map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {a.timestamp}
                  </td>
                  <td className="p-3 font-bold text-indigo-300">
                    {a.action}
                  </td>
                  <td className="p-3 text-slate-400">
                    {a.entity}
                  </td>
                  <td className="p-3 text-white">
                    {a.details}
                  </td>
                  <td className="p-3 text-right text-slate-400">
                    {a.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ONBOARDING WIZARD */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <form
            onSubmit={handleLaunchEnterprise}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Onboard New Enterprise Tenant</h2>
              </div>
              <button onClick={() => setIsOnboardingOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Category Select Buttons */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Select Business Category (Auto-configures recommended industry modules)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'grocery', label: 'Grocery / Supermarket' },
                  { id: 'pharmacy', label: 'Pharmacy & Drugstore' },
                  { id: 'hardware', label: 'Hardware & Tools' },
                  { id: 'restaurant', label: 'Restaurant & Cafe' },
                  { id: 'electronics', label: 'Electronics & Mobile' },
                  { id: 'clothing', label: 'Clothing & Footwear' },
                  { id: 'hotel', label: 'Hotel & Hospitality' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategorySelect(c.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      onboardingData.category === c.id
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hypermarket Ltd"
                  value={onboardingData.name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Branch Name</label>
                <input
                  type="text"
                  required
                  value={onboardingData.branchName}
                  onChange={(e) => setOnboardingData({ ...onboardingData, branchName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Enterprise Admin Name</label>
                <input
                  type="text"
                  required
                  value={onboardingData.adminName}
                  onChange={(e) => setOnboardingData({ ...onboardingData, adminName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={onboardingData.adminEmail}
                  onChange={(e) => setOnboardingData({ ...onboardingData, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Pre-Selected Modules Checkboxes */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-slate-300 font-semibold">
                Enabled Platform Modules for this Tenant
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(onboardingData.selectedModules).map(([key, enabled]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOnboardingData({
                      ...onboardingData,
                      selectedModules: {
                        ...onboardingData.selectedModules,
                        [key]: !enabled
                      }
                    })}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between text-[11px] font-medium transition-colors ${
                      enabled
                        ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    {enabled ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30"
              >
                Provision & Launch Enterprise
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: POSTGRESQL / SUPABASE DDL EXPORT */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Database className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">PostgreSQL / Supabase Production DDL & RLS Policies</h2>
              </div>
              <button onClick={() => setIsSqlModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-slate-400">
              Deploy this schema directly into your Supabase SQL Editor, Amazon RDS, or Google Cloud SQL instance. Includes tenant isolation Row Level Security (RLS) policies and composite indexes.
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 select-all">
              <pre>{db.generatePostgresqlDdl()}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Close
              </button>
              
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(db.generatePostgresqlDdl());
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {sqlCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {sqlCopied ? 'Copied to Clipboard!' : 'Copy Schema SQL'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

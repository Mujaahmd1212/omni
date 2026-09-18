import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Percent, 
  Receipt, 
  Barcode, 
  Store, 
  Plus, 
  Check, 
  Layers, 
  ShieldCheck,
  CreditCard,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { Branch } from '../../types';

export const EnterpriseSettingsView: React.FC = () => {
  const { currentEnterprise, branches, reloadAppData } = useApp();

  // Form State
  const [name, setName] = useState(currentEnterprise.name);
  const [logoUrl, setLogoUrl] = useState(currentEnterprise.logoUrl || '');
  const [phone, setPhone] = useState(currentEnterprise.phone);
  const [email, setEmail] = useState(currentEnterprise.email);
  const [address, setAddress] = useState(currentEnterprise.address);
  const [vatNumber, setVatNumber] = useState(currentEnterprise.vatNumber || '');
  const [currency, setCurrency] = useState(currentEnterprise.currency || 'USD');
  const [taxRate, setTaxRate] = useState(currentEnterprise.taxRate ?? 10);
  
  // Extra POS & Receipt configs
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for shopping with us! Please come again.');
  const [barcodePrefix, setBarcodePrefix] = useState('POS-');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  const handleSaveEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveEnterprise({
      ...currentEnterprise,
      name: name.trim(),
      logoUrl: logoUrl.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      vatNumber: vatNumber.trim() || undefined,
      currency,
      taxRate: Number(taxRate) || 0
    });
    reloadAppData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    db.createBranch({
      enterpriseId: currentEnterprise.id,
      name: branchName.trim(),
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      address: branchAddress.trim() || address,
      phone: branchPhone.trim() || phone,
      isHeadquarters: false,
      status: 'active'
    });

    setIsBranchModalOpen(false);
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    reloadAppData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Settings</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold capitalize">
                {currentEnterprise.category}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure company profile, financial defaults, POS terminal behavior, and store branch network
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
            <Check className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveEnterprise} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Company Profile (Col 7) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Store className="w-4 h-4 text-indigo-400" />
              Business Profile & Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Category</label>
                <input
                  type="text"
                  disabled
                  value={currentEnterprise.category.toUpperCase()}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Headquarters Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tax ID / VAT Registration</label>
                <input
                  type="text"
                  placeholder="e.g. VAT-982341-US"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Logo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Financial & Currency Settings (Col 5) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Currency & Tax Configuration
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operating Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="KES">KES (KSh) - Kenyan Shilling</option>
                  <option value="ZAR">ZAR (R) - South African Rand</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Sales Tax / VAT Rate (%)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-slate-300 font-semibold mb-2">Accepted Payment Methods</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {['Cash', 'Credit Card', 'Debit Card', 'Mobile Money', 'Bank Transfer', 'Store Credit'].map(pm => (
                    <label key={pm} className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-indigo-600" />
                      <span>{pm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* POS, Receipt & Barcode Defaults */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Receipt className="w-4 h-4 text-amber-400" />
              Receipt, Invoice & Barcode Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Barcode Standard</label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CODE128">CODE128 (Universal)</option>
                  <option value="EAN13">EAN-13 (Standard Retail)</option>
                  <option value="UPCA">UPC-A</option>
                  <option value="EAN8">EAN-8</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Receipt Footer Note</label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="autoprint"
                  checked={autoPrintReceipt}
                  onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <label htmlFor="autoprint" className="text-slate-300 text-xs cursor-pointer flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  Automatically prompt print receipt upon completing checkout
                </label>
              </div>
            </div>
          </div>

          {/* Branch Network (Col 5) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                Store Branch Network ({branches.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-indigo-500/30"
              >
                <Plus className="w-3 h-3" />
                Add Branch
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {branches.map(b => (
                <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center font-bold text-white">
                    <span>{b.name}</span>
                    {b.isHeadquarters ? (
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                        HQ Main
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {b.code}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {b.address || 'Address not specified'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400">
            Changes to enterprise details, currency, and tax will immediately reflect across all branch registers.
          </p>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs"
          >
            <Save className="w-4 h-4" />
            Save Enterprise Settings
          </button>
        </div>
      </form>

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBranch}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                Add New Store Branch
              </h2>
              <button 
                type="button" 
                onClick={() => setIsBranchModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Name *</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Uptown Mall Register Branch"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Address *</label>
              <input
                type="text"
                required
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                placeholder="e.g. 742 Evergreen Terrace"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Phone</label>
              <input
                type="text"
                value={branchPhone}
                onChange={(e) => setBranchPhone(e.target.value)}
                placeholder="555-0988"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Create Branch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

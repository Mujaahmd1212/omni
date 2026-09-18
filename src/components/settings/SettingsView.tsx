import React, { useState } from 'react';
import { Settings, Building2, Users, Shield, Plus, Check, Save } from 'lucide-react';
import { User, Branch } from '../../types';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';

type RoleOption = 'enterprise_admin' | 'branch_manager' | 'cashier' | 'inventory_clerk' | 'kitchen_staff';

export const SettingsView: React.FC = () => {
  const { currentEnterprise, currentBranch, currentUser, reloadAppData } = useApp();
  const [branches, setBranches] = useState<Branch[]>(() => db.getBranches(currentEnterprise.id));
  const [users, setUsers] = useState<User[]>(() => db.getUsers(currentEnterprise.id));

  // Enterprise form state
  const [entName, setEntName] = useState<string>(currentEnterprise.name);
  const [entPhone, setEntPhone] = useState<string>(currentEnterprise.phone);
  const [entEmail, setEntEmail] = useState<string>(currentEnterprise.email);
  const [currency, setCurrency] = useState<string>(currentEnterprise.currency);
  const [taxRate, setTaxRate] = useState<number>(currentEnterprise.taxRate);

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // New Branch State
  const [branchName, setBranchName] = useState<string>('');
  const [branchAddress, setBranchAddress] = useState<string>('');
  const [branchPhone, setBranchPhone] = useState<string>('');

  // New User State
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<RoleOption>('cashier');
  const [userBranchId, setUserBranchId] = useState<string>(currentBranch.id);

  const reload = () => {
    setBranches(db.getBranches(currentEnterprise.id));
    setUsers(db.getUsers(currentEnterprise.id));
    reloadAppData();
  };

  const handleSaveEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveEnterprise({
      ...currentEnterprise,
      name: entName.trim(),
      phone: entPhone.trim(),
      email: entEmail.trim(),
      currency,
      taxRate: Number(taxRate) || 0
    });
    reload();
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    db.saveBranch({
      enterpriseId: currentEnterprise.id,
      name: branchName.trim(),
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      address: branchAddress.trim(),
      phone: branchPhone.trim(),
      isHeadquarters: false,
      status: 'active'
    });

    setIsBranchModalOpen(false);
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    reload();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const roleTitles: Record<string, string> = {
      enterprise_admin: 'Enterprise Admin',
      branch_manager: 'Branch Manager',
      cashier: 'Cashier',
      inventory_clerk: 'Inventory Clerk',
      kitchen_staff: 'Kitchen Staff'
    };

    db.saveUser({
      enterpriseId: currentEnterprise.id,
      branchId: userBranchId,
      name: userName.trim(),
      email: userEmail.trim(),
      roleId: `role-${userRole}`,
      roleTitle: roleTitles[userRole] || 'Staff',
      status: 'active'
    });

    setIsUserModalOpen(false);
    setUserName('');
    setUserEmail('');
    reload();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Configuration & Access Control</h1>
            <p className="text-xs text-slate-400">
              Company profile, multi-branch network, and role-based staff permissions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Enterprise Profile Card (Left 60%) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Company Information & Financial Defaults
          </h2>

          <form onSubmit={handleSaveEnterprise} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Enterprise Name</label>
                <input
                  type="text"
                  required
                  value={entName}
                  onChange={(e) => setEntName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Business Category</label>
                <div className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-400 capitalize">
                  {currentEnterprise.category}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Contact Phone</label>
                <input
                  type="text"
                  value={entPhone}
                  onChange={(e) => setEntPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Official Email</label>
                <input
                  type="email"
                  value={entEmail}
                  onChange={(e) => setEntEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Operating Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Company Settings
              </button>
            </div>
          </form>
        </div>

        {/* Branch Network (Right 40%) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Branches ({branches.length})
              </h2>
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Branch
              </button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {branches.map(b => (
                <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center font-bold text-white">
                    <span>{b.name}</span>
                    {b.isMainBranch && (
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                        HQ Main
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{b.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Staff Accounts & Role Permissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Authorized Staff Users & Roles ({users.length})
          </h2>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Staff Account
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">User Name</th>
                <th className="p-3.5 font-semibold">Email</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Assigned Branch</th>
                <th className="p-3.5 font-semibold">POS PIN</th>
                <th className="p-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">
                    {u.name}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {u.email}
                  </td>
                  <td className="p-3.5">
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium text-[11px] border border-indigo-500/20">
                      {u.roleTitle}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {branches.find(b => b.id === u.branchId)?.name || 'All Branches'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    ••••
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD BRANCH */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateBranch}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Add New Store Branch</h2>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Name *</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Westside Mall Location"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Address *</label>
              <input
                type="text"
                required
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                placeholder="e.g. 450 Westside Ave, Suite 12"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Phone</label>
              <input
                type="text"
                value={branchPhone}
                onChange={(e) => setBranchPhone(e.target.value)}
                placeholder="555-0988"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
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

      {/* MODAL 2: ADD STAFF USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3.5 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Create Staff Account</h2>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Maria Gonzalez"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="maria@company.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Role / Permissions</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as RoleOption)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="enterprise_admin">Enterprise Admin (Full Access)</option>
                <option value="branch_manager">Branch Manager</option>
                <option value="cashier">Cashier (POS & Sales only)</option>
                <option value="inventory_clerk">Inventory Clerk (Stock & Transfers)</option>
                <option value="kitchen_staff">Kitchen Staff (KDS only)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Branch</label>
              <select
                value={userBranchId}
                onChange={(e) => setUserBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Register Account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

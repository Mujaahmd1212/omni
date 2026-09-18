import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Check, 
  X, 
  Key, 
  Lock, 
  Store, 
  Clock, 
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/storage';
import { User, Role, PermissionCode } from '../../types';

export const StaffAccessView: React.FC = () => {
  const { currentEnterprise, branches, reloadAppData } = useApp();

  const [users, setUsers] = useState<User[]>(() => db.getUsers(currentEnterprise.id));
  const [roles, setRoles] = useState<Role[]>(() => db.getRoles());
  const [auditLogs, setAuditLogs] = useState(() => db.getAuditLogs(currentEnterprise.id));

  // Active Tab: Users | Roles & Permissions | Activity Logs
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');

  // Add User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoleTitle, setUserRoleTitle] = useState('Cashier');
  const [userRoleId, setUserRoleId] = useState('role-cashier');
  const [userBranchId, setUserBranchId] = useState(branches[0]?.id || '');
  const [userPin, setUserPin] = useState('1234');

  // Custom Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionCode[]>([
    'sales.view',
    'sales.create',
    'products.view'
  ]);

  const reload = () => {
    setUsers(db.getUsers(currentEnterprise.id));
    setRoles(db.getRoles());
    setAuditLogs(db.getAuditLogs(currentEnterprise.id));
    reloadAppData();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    db.createUser({
      enterpriseId: currentEnterprise.id,
      branchId: userBranchId || null,
      name: userName.trim(),
      email: userEmail.trim(),
      roleId: userRoleId,
      roleTitle: userRoleTitle,
      status: 'active',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    db.addAuditLog({
      enterpriseId: currentEnterprise.id,
      branchId: userBranchId || undefined,
      userId: 'usr-admin',
      userName: 'Enterprise Admin',
      action: 'STAFF_REGISTERED',
      entity: 'User',
      recordId: userEmail,
      details: `Created new staff login for ${userName} assigned to ${userRoleTitle}`
    });

    setIsUserModalOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPin('1234');
    reload();
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    db.saveUser({
      ...user,
      status: newStatus
    });

    db.addAuditLog({
      enterpriseId: currentEnterprise.id,
      userId: 'usr-admin',
      userName: 'Enterprise Admin',
      action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      entity: 'User',
      recordId: user.id,
      details: `Account status for ${user.name} (${user.email}) changed to ${newStatus}`
    });

    reload();
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    db.createRole({
      enterpriseId: currentEnterprise.id,
      title: roleTitle.trim(),
      description: roleDescription.trim() || 'Custom Enterprise Role',
      permissions: selectedPermissions,
      isSystem: false
    }, 'Enterprise Admin');

    setIsRoleModalOpen(false);
    setRoleTitle('');
    setRoleDescription('');
    reload();
  };

  const permissionCategories = [
    {
      group: 'Sales & Checkout',
      perms: [
        { code: 'sales.view', label: 'View Sales History' },
        { code: 'sales.create', label: 'Create & Process Sales' },
        { code: 'sales.edit', label: 'Edit Draft Sales' },
        { code: 'sales.refund', label: 'Issue Cash/Card Refunds' }
      ]
    },
    {
      group: 'Product & Inventory',
      perms: [
        { code: 'products.view', label: 'View Products Catalog' },
        { code: 'products.create', label: 'Add New Products' },
        { code: 'products.edit', label: 'Edit Prices & Info' },
        { code: 'inventory.adjust', label: 'Perform Stock Adjustments' },
        { code: 'inventory.transfer', label: 'Initiate Branch Transfers' }
      ]
    },
    {
      group: 'Procurement & Suppliers',
      perms: [
        { code: 'purchases.view', label: 'View Purchase Orders' },
        { code: 'purchases.create', label: 'Create Purchase Orders' },
        { code: 'suppliers.view', label: 'View Supplier Directory' }
      ]
    },
    {
      group: 'Reports & Customers',
      perms: [
        { code: 'reports.view', label: 'View Financial & Sales Reports' },
        { code: 'reports.export', label: 'Export Reports to Excel/PDF' },
        { code: 'customers.view', label: 'View Customer Accounts & Credit' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Staff & Access Control</h1>
            <p className="text-xs text-slate-400">
              Manage authorized employees, assign store branches, configure custom roles, and monitor activity logs
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'roles' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Roles & Permissions ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Authorized Staff Accounts
              </h2>
              <p className="text-[11px] text-slate-400">
                Staff can log in with their corporate email or fast 4-digit POS register PIN
              </p>
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Staff Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Employee</th>
                  <th className="p-3.5 font-semibold">Email</th>
                  <th className="p-3.5 font-semibold">Assigned Role</th>
                  <th className="p-3.5 font-semibold">Branch Location</th>
                  <th className="p-3.5 font-semibold">POS PIN</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const branchName = branches.find(b => b.id === u.branchId)?.name || 'All Branches / HQ';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-300 text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium text-[11px] border border-indigo-500/20">
                          {u.roleTitle}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-500" />
                          {branchName}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">••••</td>
                      <td className="p-3.5">
                        {u.status === 'active' ? (
                          <span className="text-emerald-400 text-xs font-semibold inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-rose-400 text-xs font-semibold inline-flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Configured Roles & Access Policies</h2>
              <p className="text-xs text-slate-400">Roles enforce granular permissions across sales, inventory, and reports</p>
            </div>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Custom Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(r => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{r.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                  </div>
                  {r.isSystem && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      System
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Permissions ({r.permissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {r.permissions.slice(0, 8).map(p => (
                      <span key={p} className="text-[10px] bg-slate-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                        {p}
                      </span>
                    ))}
                    {r.permissions.length > 8 && (
                      <span className="text-[10px] text-slate-500 font-mono px-1">
                        +{r.permissions.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Staff Activity & Security Audit Trail
            </h2>
            <p className="text-[11px] text-slate-400">
              Immutable audit log tracking all register logins, sales voids, and permission changes
            </p>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[450px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No activity logs recorded yet.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-850/50 transition-colors flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.userName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-indigo-500/20">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Staff Account */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Add Staff Member
              </h2>
              <button 
                type="button" 
                onClick={() => setIsUserModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="rachel@company.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assign Role</label>
              <select
                value={userRoleId}
                onChange={(e) => {
                  setUserRoleId(e.target.value);
                  const found = roles.find(r => r.id === e.target.value);
                  if (found) setUserRoleTitle(found.title);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Store Branch</label>
              <select
                value={userBranchId}
                onChange={(e) => setUserBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">POS 4-Digit Quick PIN</label>
              <input
                type="password"
                maxLength={4}
                value={userPin}
                onChange={(e) => setUserPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
              />
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
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create Custom Role */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCustomRole}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Define Custom Role & Permissions
              </h2>
              <button 
                type="button" 
                onClick={() => setIsRoleModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Role Title *</label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Lead Floor Supervisor"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="e.g. Can issue refunds and approve stock adjustments"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Select Permissions</label>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {permissionCategories.map(cat => (
                  <div key={cat.group} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-indigo-300 text-[11px] block mb-2">{cat.group}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {cat.perms.map(p => {
                        const checked = selectedPermissions.includes(p.code as PermissionCode);
                        return (
                          <label key={p.code} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([...selectedPermissions, p.code as PermissionCode]);
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter(x => x !== p.code));
                                }
                              }}
                              className="rounded accent-indigo-600"
                            />
                            <span>{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

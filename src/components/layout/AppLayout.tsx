import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  ArrowLeftRight,
  History,
  Barcode,
  Receipt,
  Truck,
  Users,
  DollarSign,
  BarChart3,
  Utensils,
  ChefHat,
  Pill,
  Wrench,
  Smartphone,
  BedDouble,
  Settings,
  ShieldAlert,
  ChevronDown,
  Building2,
  Store,
  LogOut,
  Menu,
  X,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    currentEnterprise,
    currentBranch,
    currentUser,
    currentView,
    setCurrentView,
    enterprises,
    branches,
    setEnterprise,
    setBranch
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [enterpriseDropdownOpen, setEnterpriseDropdownOpen] = useState<boolean>(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState<boolean>(false);

  // Fullscreen POS mode check
  const isPosView = currentView === 'pos';

  const navItems = [
    { id: 'pos', label: 'Point of Sale (POS)', icon: ShoppingCart, moduleKey: 'corePos' },
    { id: 'products', label: 'Product Catalog', icon: Package, moduleKey: 'inventory' },
    { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight, moduleKey: 'inventory' },
    { id: 'movements', label: 'Movement Audit Log', icon: History, moduleKey: 'inventory' },
    { id: 'barcodes', label: 'Barcode Management', icon: Barcode, moduleKey: 'barcodeSystem' },
    { id: 'sales', label: 'Sales & Receipts', icon: Receipt, moduleKey: 'corePos' },
    { id: 'purchasing', label: 'Purchasing & POs', icon: Truck, moduleKey: 'purchasing' },
    { id: 'customers', label: 'Customers & Loyalty', icon: Users, moduleKey: 'customers' },
    { id: 'accounting', label: 'Accounting & P&L', icon: DollarSign, moduleKey: 'accounting' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, moduleKey: 'corePos' }
  ];

  // Industry Specific items (only shown if module is enabled in tenant)
  const industryNavItems = [
    { id: 'restaurant', label: 'Table Floor Plan', icon: Utensils, show: Boolean(currentEnterprise.modules?.restaurant) },
    { id: 'kds', label: 'Kitchen Display (KDS)', icon: ChefHat, show: Boolean(currentEnterprise.modules?.restaurant) },
    { id: 'pharmacy', label: 'Pharmacy FEFO Batches', icon: Pill, show: Boolean(currentEnterprise.modules?.pharmacy) },
    { id: 'hardware', label: 'Hardware Calculators', icon: Wrench, show: Boolean(currentEnterprise.modules?.hardwareStore) },
    { id: 'electronics', label: 'Repair Job Cards', icon: Smartphone, show: Boolean(currentEnterprise.modules?.computerMobile) },
    { id: 'hotel', label: 'Hotel Room Rack', icon: BedDouble, show: Boolean(currentEnterprise.modules?.hotel) }
  ].filter(i => i.show);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* TOP HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('pos')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>OmniPOS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                  SaaS Multi-Tenant
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Enterprise Cloud Engine</div>
            </div>
          </div>
        </div>

        {/* Center: Tenant & Branch Selectors */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* Enterprise Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setEnterpriseDropdownOpen(!enterpriseDropdownOpen);
                setBranchDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700/70 hover:border-slate-600 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[140px] truncate">{currentEnterprise.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                {currentEnterprise.category}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {enterpriseDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Enterprise (Tenant)
                </div>
                {enterprises.map(ent => (
                  <button
                    key={ent.id}
                    onClick={() => {
                      setEnterprise(ent.id);
                      setEnterpriseDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentEnterprise.id === ent.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{ent.name}</div>
                      <div className="text-[10px] opacity-70 capitalize">{ent.category}</div>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">{ent.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setBranchDropdownOpen(!branchDropdownOpen);
                setEnterpriseDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700/70 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-300 transition-all shadow-sm"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[120px] truncate">{currentBranch.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {branchDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Store Branches
                </div>
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBranch(b.id);
                      setBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      currentBranch.id === b.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{b.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: User profile & Super Admin Quick Nav */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setCurrentView('pos')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isPosView
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Launch POS</span>
          </button>

          <button
            onClick={() => setCurrentView('superadmin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'superadmin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Super Admin</span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
              {(currentUser?.name || 'US').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">
                {currentUser?.roleTitle || (currentUser as any)?.role?.replace?.('_', ' ') || 'Staff'}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* BODY WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:flex w-64 bg-slate-900/90 border-r border-slate-800 flex-col justify-between shrink-0 p-3 space-y-4 overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Core Modules Group */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Core Operations
              </div>
              <nav className="space-y-0.5 mt-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Industry Specific Modules Group */}
            {industryNavItems.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Industry Modules ({currentEnterprise.category})
                </div>
                <nav className="space-y-0.5 mt-1">
                  {industryNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Admin Management Group */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Platform Admin
              </div>
              <nav className="space-y-0.5 mt-1">
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'settings'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Enterprise Settings & Staff</span>
                </button>

                <button
                  onClick={() => setCurrentView('superadmin')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'superadmin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                      : 'text-purple-300 hover:text-white hover:bg-purple-950/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Super Admin Control</span>
                </button>
              </nav>
            </div>

          </div>

          {/* Tenant Footer Badge */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
            <div className="text-slate-400">Current Isolated Tenant:</div>
            <div className="font-bold text-white truncate">{currentEnterprise.name}</div>
            <div className="text-[10px] text-emerald-400 font-mono">Row Level Security: Active</div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto z-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <nav className="space-y-1">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}

                  {industryNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings & Staff</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('superadmin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Super Admin Control</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};

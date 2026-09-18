import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Enterprise,
  Branch,
  User,
  Role,
  PermissionCode,
  EnterpriseModules,
  EnterpriseFeatures,
  Sale
} from '../types';
import { db } from '../db/storage';

export type AppView =
  | 'pos'
  | 'products'
  | 'barcodes'
  | 'inventory'
  | 'transfers'
  | 'movements'
  | 'sales'
  | 'purchasing'
  | 'customers'
  | 'suppliers'
  | 'restaurant'
  | 'kds'
  | 'pharmacy'
  | 'hardware'
  | 'electronics'
  | 'hotel'
  | 'accounting'
  | 'reports'
  | 'enterprise_settings'
  | 'staff_access'
  | 'settings' // backwards compatibility
  | 'superadmin';

import { SuperAdminSection } from '../types';

interface AppContextType {
  currentEnterprise: Enterprise;
  enterprises: Enterprise[];
  currentBranch: Branch;
  branches: Branch[];
  currentUser: User;
  users: User[];
  roles: Role[];
  isSuperAdmin: boolean;
  isSuperAdminMode: boolean;
  isSuperAdminActingInTenant: boolean;
  superAdminSection: SuperAdminSection;
  setSuperAdminSection: (section: SuperAdminSection) => void;
  currentView: AppView;
  isOffline: boolean;
  pendingOfflineCount: number;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  setCurrentView: (view: AppView) => void;
  setEnterprise: (enterpriseId: string) => void;
  setBranch: (branchId: string) => void;
  setUser: (userId: string) => void;
  toggleSuperAdminMode: (active?: boolean) => void;
  switchToEnterpriseWorkspace: (enterpriseId: string, branchId?: string) => void;
  returnToSuperAdminPlatform: () => void;
  toggleOfflineSimulation: () => void;
  syncOfflineQueue: () => void;
  hasPermission: (perm: PermissionCode) => boolean;
  isModuleEnabled: (mod: keyof EnterpriseModules) => boolean;
  isFeatureEnabled: (feat: keyof EnterpriseFeatures) => boolean;
  reloadAppData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>(() => db.getEnterprises());
  const [activeEntId, setActiveEntId] = useState<string>('ent-hardware');
  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(true); // Default to Super Admin Platform view for platform creator
  const [isSuperAdminActingInTenant, setIsSuperAdminActingInTenant] = useState<boolean>(false);
  const [superAdminSection, setSuperAdminSection] = useState<SuperAdminSection>('dashboard');
  const [currentView, setCurrentView] = useState<AppView>('superadmin');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Sale[]>([]);

  // Users & Roles
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const roles = useMemo(() => db.getRoles(), []);

  // Default active user is the platform creator & master super admin
  const [activeUserId, setActiveUserId] = useState<string>('usr-super-admin');

  const currentUser = useMemo(() => {
    return users.find(u => u.id === activeUserId) || users.find(u => u.roleId === 'role-super-admin') || users[0];
  }, [users, activeUserId]);

  const isSuperAdmin = useMemo(() => {
    return (
      currentUser?.id === 'usr-super-admin' ||
      currentUser?.roleId === 'role-super-admin' ||
      currentUser?.email === 'mujaicloud1212@gmail.com'
    );
  }, [currentUser]);

  // Current enterprise
  const currentEnterprise = useMemo(() => {
    return enterprises.find(e => e.id === activeEntId) || enterprises[0];
  }, [enterprises, activeEntId]);

  // Branches of current enterprise
  const branches = useMemo(() => {
    return db.getBranches(currentEnterprise.id);
  }, [currentEnterprise.id]);

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    return branches[0]?.id || 'br-hdw-1';
  });

  const currentBranch = useMemo(() => {
    return branches.find(b => b.id === activeBranchId) || branches[0] || {
      id: 'br-default',
      enterpriseId: currentEnterprise.id,
      name: 'Default Store Branch',
      code: 'DFT-01',
      address: 'Main St',
      phone: '555-0100',
      isHeadquarters: true,
      status: 'active'
    };
  }, [branches, activeBranchId, currentEnterprise]);

  const activeRole = useMemo(() => {
    return roles.find(r => r.id === currentUser.roleId) || roles[0];
  }, [roles, currentUser]);

  const reloadAppData = () => {
    setEnterprises(db.getEnterprises());
    setUsers(db.getUsers());
  };

  const setEnterprise = (enterpriseId: string) => {
    setActiveEntId(enterpriseId);
    const newBranches = db.getBranches(enterpriseId);
    if (newBranches.length > 0) {
      setActiveBranchId(newBranches[0].id);
    }
  };

  const setBranch = (branchId: string) => {
    setActiveBranchId(branchId);
  };

  const setUser = (userId: string) => {
    setActiveUserId(userId);
    const u = users.find(user => user.id === userId);
    if (u?.enterpriseId && u.enterpriseId !== activeEntId) {
      setActiveEntId(u.enterpriseId);
      const b = db.getBranches(u.enterpriseId);
      if (b.length > 0) setActiveBranchId(b[0].id);
    }
    if (u?.roleId === 'role-super-admin' || u?.email === 'mujaicloud1212@gmail.com') {
      setIsSuperAdminMode(true);
      setCurrentView('superadmin');
    } else {
      setIsSuperAdminMode(false);
      setIsSuperAdminActingInTenant(false);
      if (currentView === 'superadmin') {
        setCurrentView('pos');
      }
    }
  };

  const toggleSuperAdminMode = (active?: boolean) => {
    const next = active !== undefined ? active : !isSuperAdminMode;
    setIsSuperAdminMode(next);
    if (next) {
      setIsSuperAdminActingInTenant(false);
      setCurrentView('superadmin');
      setActiveUserId('usr-super-admin');
    } else {
      setCurrentView('pos');
    }
  };

  const switchToEnterpriseWorkspace = (enterpriseId: string, branchId?: string) => {
    const targetEnt = enterprises.find(e => e.id === enterpriseId);
    if (!targetEnt) return;

    setActiveEntId(enterpriseId);
    const targetBranches = db.getBranches(enterpriseId);
    const chosenBranch = branchId || (targetBranches.length > 0 ? targetBranches[0].id : null);
    if (chosenBranch) {
      setActiveBranchId(chosenBranch);
    }

    // Record Super Admin enterprise-access activity in audit logs
    db.logSuperAdminEnterpriseAccess(enterpriseId, chosenBranch, currentUser);

    setIsSuperAdminMode(false);
    setIsSuperAdminActingInTenant(true);
    setCurrentView('pos');
  };

  const returnToSuperAdminPlatform = () => {
    setIsSuperAdminMode(true);
    setIsSuperAdminActingInTenant(false);
    setCurrentView('superadmin');
    setActiveUserId('usr-super-admin');
  };

  const toggleOfflineSimulation = () => {
    setIsOffline(prev => !prev);
  };

  const syncOfflineQueue = () => {
    // In production/simulated mode: process pending transactions
    setOfflineQueue([]);
    setIsOffline(false);
  };

  const hasPermission = (perm: PermissionCode): boolean => {
    if (isSuperAdminMode || currentUser.roleId === 'role-super-admin') return true;
    return activeRole.permissions.includes(perm);
  };

  const isModuleEnabled = (mod: keyof EnterpriseModules): boolean => {
    if (isSuperAdminMode) return true;
    return Boolean(currentEnterprise?.modules?.[mod]);
  };

  const isFeatureEnabled = (feat: keyof EnterpriseFeatures): boolean => {
    if (isSuperAdminMode) return true;
    return Boolean(currentEnterprise?.features?.[feat]);
  };

  // Browser online/offline event detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentEnterprise,
        enterprises,
        currentBranch,
        branches,
        currentUser,
        users,
        roles,
        isSuperAdmin,
        isSuperAdminMode,
        isSuperAdminActingInTenant,
        superAdminSection,
        setSuperAdminSection,
        currentView,
        isOffline,
        pendingOfflineCount: offlineQueue.length,
        globalSearch,
        setGlobalSearch,
        setCurrentView,
        setEnterprise,
        setBranch,
        setUser,
        toggleSuperAdminMode,
        switchToEnterpriseWorkspace,
        returnToSuperAdminPlatform,
        toggleOfflineSimulation,
        syncOfflineQueue,
        hasPermission,
        isModuleEnabled,
        isFeatureEnabled,
        reloadAppData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

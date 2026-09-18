/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Core Operational Components
import { PosTerminal } from './components/pos/PosTerminal';
import { ProductManagement } from './components/inventory/ProductManagement';
import { StockTransfers } from './components/inventory/StockTransfers';
import { InventoryMovements } from './components/inventory/InventoryMovements';
import { BarcodeManagementCenter } from './components/barcode/BarcodeManagementCenter';
import { SalesHistory } from './components/sales/SalesHistory';
import { PurchasingView } from './components/purchasing/PurchasingView';
import { CustomersView } from './components/customers/CustomersView';
import { AccountingView } from './components/accounting/AccountingView';
import { ReportsView } from './components/reports/ReportsView';

// Modular Industry Components
import { RestaurantModule } from './components/industry/RestaurantModule';
import { KitchenDisplaySystem } from './components/industry/KitchenDisplaySystem';
import { PharmacyModule } from './components/industry/PharmacyModule';
import { HardwareModule } from './components/industry/HardwareModule';
import { ElectronicsModule } from './components/industry/ElectronicsModule';
import { HotelModule } from './components/industry/HotelModule';

// Platform Admin Components
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'pos':
        return <PosTerminal />;
      case 'products':
        return <ProductManagement />;
      case 'transfers':
        return <StockTransfers />;
      case 'movements':
        return <InventoryMovements />;
      case 'barcodes':
        return <BarcodeManagementCenter />;
      case 'sales':
        return <SalesHistory />;
      case 'purchasing':
        return <PurchasingView />;
      case 'customers':
        return <CustomersView />;
      case 'accounting':
        return <AccountingView />;
      case 'reports':
        return <ReportsView />;

      // Industry Modules
      case 'restaurant':
        return <RestaurantModule />;
      case 'kds':
        return <KitchenDisplaySystem />;
      case 'pharmacy':
        return <PharmacyModule />;
      case 'hardware':
        return <HardwareModule />;
      case 'electronics':
        return <ElectronicsModule />;
      case 'hotel':
        return <HotelModule />;

      // Admin Management
      case 'settings':
        return <SettingsView />;
      case 'superadmin':
        return <SuperAdminDashboard />;

      default:
        return <PosTerminal />;
    }
  };

  return <AppLayout>{renderView()}</AppLayout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import {
  Enterprise,
  Branch,
  Role,
  User,
  Product,
  Customer,
  Supplier,
  SubscriptionPlan,
  RestaurantTable,
  KitchenOrder,
  MedicineBatch,
  RepairTicket,
  HotelRoom,
  Sale,
  CartItem,
  InventoryMovement,
  StockTransfer,
  PurchaseOrder,
  AuditLog,
  BarcodeRecord,
  ExpenseRecord,
  CashRegisterSession,
  EnterpriseCategory,
  PlatformSettings,
  PlatformIntegrations,
  SystemModule,
  SupportTicket,
  BackupRecord
} from '../types';

import {
  INITIAL_ROLES,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_ENTERPRISES,
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_TABLES,
  INITIAL_KITCHEN_ORDERS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_HOTEL_ROOMS,
  INITIAL_SALES,
  INITIAL_AUDIT_LOGS
} from './initialData';

import { generateUniqueBarcode } from '../lib/barcode';

const STORAGE_PREFIX = 'omnipos_v1_';

class PosDatabase {
  private enterprises: Enterprise[] = [];
  private branches: Branch[] = [];
  private roles: Role[] = [];
  private users: User[] = [];
  private products: Product[] = [];
  private customers: Customer[] = [];
  private suppliers: Supplier[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private sales: Sale[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private stockTransfers: StockTransfer[] = [];
  private auditLogs: AuditLog[] = [];
  private subscriptionPlans: SubscriptionPlan[] = [];
  private restaurantTables: RestaurantTable[] = [];
  private kitchenOrders: KitchenOrder[] = [];
  private repairTickets: RepairTicket[] = [];
  private hotelRooms: HotelRoom[] = [];
  private expenses: ExpenseRecord[] = [];
  private cashSessions: CashRegisterSession[] = [];
  private barcodes: BarcodeRecord[] = [];
  private platformSettings: PlatformSettings | null = null;
  private platformIntegrations: PlatformIntegrations | null = null;
  private systemModules: SystemModule[] = [];
  private supportTickets: SupportTicket[] = [];
  private backupRecords: BackupRecord[] = [];

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    this.enterprises = this.getStored('enterprises', INITIAL_ENTERPRISES);
    this.branches = this.getStored('branches', INITIAL_BRANCHES);
    this.roles = this.getStored('roles', INITIAL_ROLES);
    this.users = this.getStored('users', INITIAL_USERS);
    
    // Ensure Super Admin account has master creator credentials
    const superAdmin = this.users.find(u => u.id === 'usr-super-admin' || u.roleId === 'role-super-admin');
    if (superAdmin) {
      superAdmin.email = 'mujaicloud1212@gmail.com';
      superAdmin.name = 'Platform Creator & Super Admin';
      superAdmin.roleId = 'role-super-admin';
      superAdmin.roleTitle = 'Master Super Admin';
      superAdmin.enterpriseId = null;
      superAdmin.branchId = null;
    } else {
      this.users.unshift({
        id: 'usr-super-admin',
        enterpriseId: null,
        branchId: null,
        name: 'Platform Creator & Super Admin',
        email: 'mujaicloud1212@gmail.com',
        roleId: 'role-super-admin',
        roleTitle: 'Master Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        lastLogin: '2026-03-17 08:30'
      });
    }
    this.save('users', this.users);

    this.products = this.getStored('products', INITIAL_PRODUCTS);
    this.customers = this.getStored('customers', INITIAL_CUSTOMERS);
    this.suppliers = this.getStored('suppliers', INITIAL_SUPPLIERS);
    this.sales = this.getStored('sales', INITIAL_SALES);
    this.subscriptionPlans = this.getStored('subscriptionPlans', INITIAL_SUBSCRIPTION_PLANS);
    this.restaurantTables = this.getStored('restaurantTables', INITIAL_TABLES);
    this.kitchenOrders = this.getStored('kitchenOrders', INITIAL_KITCHEN_ORDERS);
    this.repairTickets = this.getStored('repairTickets', INITIAL_REPAIR_TICKETS);
    this.hotelRooms = this.getStored('hotelRooms', INITIAL_HOTEL_ROOMS);
    this.auditLogs = this.getStored('auditLogs', INITIAL_AUDIT_LOGS);
    this.stockTransfers = this.getStored('stockTransfers', []);
    this.purchaseOrders = this.getStored('purchaseOrders', []);
    this.inventoryMovements = this.getStored('inventoryMovements', []);
    this.expenses = this.getStored('expenses', []);
    this.cashSessions = this.getStored('cashSessions', []);
    this.barcodes = this.getStored('barcodes', []);

    // Default Platform Settings
    const defaultPlatformSettings: PlatformSettings = {
      platformName: 'OmniPOS Cloud Platform',
      platformLogoUrl: '',
      defaultCurrency: 'USD',
      supportedCategories: [
        'grocery', 'pharmacy', 'hardware', 'restaurant', 'hotel', 
        'computer', 'mobile', 'electronics', 'clothing', 'shoes', 
        'furniture', 'bakery', 'cosmetics', 'wholesale', 'general_retail'
      ],
      defaultTaxRate: 10,
      defaultPaymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Money', 'Bank Transfer', 'Store Credit'],
      emailSettings: {
        smtpHost: 'smtp.sendgrid.net',
        smtpPort: 587,
        senderName: 'OmniPOS System Admin',
        senderEmail: 'notifications@omnipos-saas.com',
        encryption: 'tls'
      },
      smsSettings: {
        provider: 'twilio',
        senderId: 'OMNIPOS',
        enabled: true
      },
      notificationSettings: {
        systemAlerts: true,
        subscriptionExpirations: true,
        newEnterpriseSignups: true,
        failedLogins: true
      },
      defaultInvoiceSettings: {
        prefix: 'INV-',
        receiptFooter: 'Thank you for your business. Please retain this receipt.',
        showTaxBreakdown: true
      },
      defaultBarcodeSettings: {
        format: 'CODE128',
        prefix: 'POS-',
        autoPrint: false
      }
    };
    this.platformSettings = this.getStored('platformSettings', defaultPlatformSettings);

    // Default Integrations
    const defaultIntegrations: PlatformIntegrations = {
      stripe: { enabled: true, testMode: true, publicKey: 'pk_test_51MzPOS...production' },
      paypal: { enabled: false, clientId: '' },
      sendgrid: { enabled: true, apiKeySet: true },
      twilioSms: { enabled: true, sidSet: true },
      whatsapp: { enabled: true, businessNumber: '+1 800 555 0199' },
      supabaseCloud: { enabled: true, projectUrl: 'https://omnipos-db.supabase.co', rlsEnforced: true },
      accountingWebhook: { enabled: true, endpointUrl: 'https://api.omnipos.io/v1/webhooks/accounting' }
    };
    this.platformIntegrations = this.getStored('platformIntegrations', defaultIntegrations);

    // Default System Modules
    const defaultModules: SystemModule[] = [
      { id: 'mod-pos', name: 'Core POS & Barcode Checkout', category: 'core', version: 'v3.2.0', description: 'Real-time cart, rapid barcode scanning, tax calculations, receipt printer', isAvailable: true, dependencies: [], status: 'active' },
      { id: 'mod-inventory', name: 'Multi-Branch Inventory & Warehousing', category: 'core', version: 'v3.1.4', description: 'Product catalog, barcode batch generator, SKU variants, stock transfers', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-purchasing', name: 'Purchase Orders & Supplier Invoicing', category: 'core', version: 'v2.8.0', description: 'Procurement workflows, receiving logs, supplier payables tracking', isAvailable: true, dependencies: ['mod-inventory'], status: 'active' },
      { id: 'mod-customers', name: 'CRM, Accounts & Loyalty Rewards', category: 'core', version: 'v2.5.1', description: 'Customer profiles, credit balance ledger, reward points tiering', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-accounting', name: 'Cash Register, P&L & Finance', category: 'core', version: 'v2.9.0', description: 'End-of-day register shifts, petty expenses, tax reports, P&L balance', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-hardware', name: 'Hardware & Dimension Calculators', category: 'industry', version: 'v2.1.0', description: 'Length/area/volume/weight converters, bulk tiered discounts, cutting estimators', isAvailable: true, dependencies: ['mod-pos', 'mod-inventory'], status: 'active' },
      { id: 'mod-restaurant', name: 'Restaurant Tables & Kitchen Display (KDS)', category: 'industry', version: 'v3.0.1', description: 'Floor map, bill splitting, kitchen tickets, takeout/delivery workflows', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-pharmacy', name: 'Pharmacy Expiry & FEFO Batch Controls', category: 'industry', version: 'v2.4.0', description: 'Expiry alarms, batch FEFO auto-dispensing, drug schedule validation', isAvailable: true, dependencies: ['mod-pos', 'mod-inventory'], status: 'active' },
      { id: 'mod-electronics', name: 'Computer & Mobile Repair Diagnostics', category: 'industry', version: 'v2.2.0', description: 'IMEI/serial number tracking, diagnostic work orders, customer repair tickets', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-hotel', name: 'Hotel Room Rack & Guest Folio', category: 'industry', version: 'v2.0.0', description: 'Room reservation calendar, night audit, guest charges billing', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
      { id: 'mod-clothing', name: 'Clothing & Shoe Matrix (Size/Color)', category: 'industry', version: 'v1.8.0', description: 'Two-dimensional variant matrix, seasonal markdown controls', isAvailable: true, dependencies: ['mod-pos', 'mod-inventory'], status: 'active' },
      { id: 'mod-grocery', name: 'Supermarket Fast Scales & Deli Counter', category: 'industry', version: 'v1.5.0', description: 'Embedded weight barcodes, tare deductions, perishable tracking', isAvailable: true, dependencies: ['mod-pos'], status: 'active' },
    ];
    this.systemModules = this.getStored('systemModules', defaultModules);

    // Support Tickets
    const defaultTickets: SupportTicket[] = [
      { id: 'tkt-101', enterpriseId: 'ent-hardware', enterpriseName: 'ABC Hardware & Supplies', contactName: 'Marcus Vance', subject: 'Need assistance setting up Zebra ZD421 barcode printer template', priority: 'medium', status: 'open', category: 'Hardware / Barcode', createdAt: '2026-03-16 11:20', messagesCount: 3 },
      { id: 'tkt-102', enterpriseId: 'ent-grocery', enterpriseName: 'FreshMart Supermarket', contactName: 'Sarah Jenkins', subject: 'Inquiry regarding FEFO batch sync on third branch register', priority: 'low', status: 'in_progress', category: 'Inventory Sync', createdAt: '2026-03-15 14:05', messagesCount: 5 },
      { id: 'tkt-103', enterpriseId: 'ent-pharmacy', enterpriseName: 'Metro Health Pharmacy', contactName: 'Dr. Raymond Kim', subject: 'Requesting custom prescription print layout for state compliance', priority: 'high', status: 'resolved', category: 'Compliance', createdAt: '2026-03-12 09:40', messagesCount: 7 }
    ];
    this.supportTickets = this.getStored('supportTickets', defaultTickets);

    // Backup snapshots
    const defaultBackups: BackupRecord[] = [
      { id: 'bkp-20260317-0400', timestamp: '2026-03-17 04:00:12', sizeMb: 284.6, type: 'automated_daily', status: 'completed', location: 's3://omnipos-backups/eu-central-1/daily-2026-03-17.sql.gz', checksum: 'sha256:7f8a91c0b39e...' },
      { id: 'bkp-20260316-0400', timestamp: '2026-03-16 04:00:08', sizeMb: 281.2, type: 'automated_daily', status: 'completed', location: 's3://omnipos-backups/eu-central-1/daily-2026-03-16.sql.gz', checksum: 'sha256:3a4b92d8f1e2...' },
      { id: 'bkp-20260315-1830', timestamp: '2026-03-15 18:30:45', sizeMb: 279.8, type: 'manual_snapshot', status: 'completed', location: 's3://omnipos-backups/eu-central-1/manual-post-migration.sql.gz', checksum: 'sha256:e9d4a821c43f...' }
    ];
    this.backupRecords = this.getStored('backupRecords', defaultBackups);
  }

  private getStored<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to local persistence:`, e);
    }
  }

  public resetToDemoDefaults() {
    localStorage.clear();
    this.loadAll();
    window.location.reload();
  }

  // --- ENTERPRISES ---
  public getEnterprises(): Enterprise[] {
    return [...this.enterprises];
  }

  public getEnterprise(id: string): Enterprise | undefined {
    return this.enterprises.find(e => e.id === id);
  }

  public updateEnterprise(enterprise: Enterprise, userId: string = 'usr-admin'): void {
    const idx = this.enterprises.findIndex(e => e.id === enterprise.id);
    if (idx !== -1) {
      const old = this.enterprises[idx];
      this.enterprises[idx] = { ...enterprise, updatedAt: new Date().toISOString() };
      this.save('enterprises', this.enterprises);
      this.addAuditLog({
        enterpriseId: enterprise.id,
        userId,
        userName: 'Admin',
        action: 'ENTERPRISE_UPDATED',
        entity: 'Enterprise',
        recordId: enterprise.id,
        details: `Enterprise settings updated for ${enterprise.name}`,
        previousValue: JSON.stringify(old),
        newValue: JSON.stringify(enterprise)
      });
    }
  }

  public updateEnterpriseModules(
    enterpriseId: string,
    modules: Enterprise['modules'],
    features: Enterprise['features'],
    userId: string = 'usr-super-admin'
  ): void {
    const ent = this.getEnterprise(enterpriseId);
    if (!ent) return;

    ent.modules = { ...modules };
    ent.features = { ...features };
    ent.updatedAt = new Date().toISOString();
    this.save('enterprises', this.enterprises);

    this.addAuditLog({
      enterpriseId,
      userId,
      userName: 'Alexander Cross',
      action: 'MODULES_FEATURES_CONFIGURED',
      entity: 'EnterpriseModule',
      recordId: enterpriseId,
      details: `Super Admin reconfigured module permissions for ${ent.name}`
    });
  }

  public createEnterpriseWithDefaults(
    data: {
      name: string;
      category: EnterpriseCategory;
      phone: string;
      email: string;
      address: string;
      currency: string;
      taxRate: number;
      branchName: string;
      adminName: string;
      adminEmail: string;
      selectedModules: Enterprise['modules'];
      selectedFeatures: Enterprise['features'];
    }
  ): { enterprise: Enterprise; branch: Branch; user: User } {
    const entId = 'ent-' + Date.now().toString(36);
    const branchId = 'br-' + Date.now().toString(36);
    const userId = 'usr-' + Date.now().toString(36);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const code = data.name.slice(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const newEnt: Enterprise = {
      id: entId,
      name: data.name,
      slug,
      code,
      category: data.category,
      phone: data.phone,
      email: data.email,
      address: data.address,
      currency: data.currency || 'USD',
      taxRate: data.taxRate ?? 10,
      status: 'active',
      subscriptionPlanId: 'plan-pro',
      modules: data.selectedModules,
      features: data.selectedFeatures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBranch: Branch = {
      id: branchId,
      enterpriseId: entId,
      name: data.branchName || 'Headquarters Branch',
      code: code + '-HQ',
      address: data.address,
      phone: data.phone,
      isHeadquarters: true,
      status: 'active'
    };

    const newUser: User = {
      id: userId,
      enterpriseId: entId,
      branchId: branchId,
      name: data.adminName || 'Admin Manager',
      email: data.adminEmail,
      roleId: 'role-owner',
      roleTitle: 'Enterprise Owner',
      status: 'active',
      lastLogin: new Date().toISOString()
    };

    this.enterprises.push(newEnt);
    this.branches.push(newBranch);
    this.users.push(newUser);

    this.save('enterprises', this.enterprises);
    this.save('branches', this.branches);
    this.save('users', this.users);

    this.addAuditLog({
      enterpriseId: entId,
      branchId,
      userId,
      userName: data.adminName,
      action: 'ENTERPRISE_ONBOARDED',
      entity: 'Enterprise',
      recordId: entId,
      details: `New enterprise ${data.name} onboarded with category ${data.category}`
    });

    return { enterprise: newEnt, branch: newBranch, user: newUser };
  }

  // --- BRANCHES (Tenant Isolated) ---
  public getBranches(enterpriseId?: string | null): Branch[] {
    if (!enterpriseId) return [...this.branches];
    return this.branches.filter(b => b.enterpriseId === enterpriseId);
  }

  public createBranch(branch: Omit<Branch, 'id'>, userId: string = 'usr-admin'): Branch {
    const id = 'br-' + Date.now().toString(36);
    const newBranch: Branch = { ...branch, id };
    this.branches.push(newBranch);
    this.save('branches', this.branches);
    this.addAuditLog({
      enterpriseId: branch.enterpriseId,
      branchId: id,
      userId,
      userName: 'Admin',
      action: 'BRANCH_CREATED',
      entity: 'Branch',
      recordId: id,
      details: `Created branch ${branch.name} (${branch.code})`
    });
    return newBranch;
  }

  // --- USERS & ROLES ---
  public getUsers(enterpriseId?: string | null): User[] {
    if (!enterpriseId) return [...this.users];
    return this.users.filter(u => u.enterpriseId === enterpriseId || u.enterpriseId === null);
  }

  public getRoles(): Role[] {
    return [...this.roles];
  }

  public createUser(user: Omit<User, 'id'>): User {
    const id = 'usr-' + Date.now().toString(36);
    const newUser: User = { ...user, id };
    this.users.push(newUser);
    this.save('users', this.users);
    return newUser;
  }

  // --- PRODUCTS & INVENTORY (Tenant Isolated) ---
  public getProducts(enterpriseId: string): Product[] {
    return this.products.filter(p => p.enterpriseId === enterpriseId);
  }

  public getProductByBarcode(enterpriseId: string, barcode: string): { product: Product; variant?: Product['variants'][0] } | null {
    const trimmed = barcode.trim();
    const product = this.products.find(p => p.enterpriseId === enterpriseId && p.barcode === trimmed);
    if (product) return { product };

    // Search variants
    for (const p of this.products) {
      if (p.enterpriseId === enterpriseId && p.variants) {
        const variant = p.variants.find(v => v.barcode === trimmed);
        if (variant) return { product: p, variant };
      }
    }
    return null;
  }

  public isBarcodeAssigned(enterpriseId: string, barcode: string, excludeProductId?: string): boolean {
    const trimmed = barcode.trim();
    // Check products
    const inProd = this.products.some(p => p.enterpriseId === enterpriseId && p.barcode === trimmed && p.id !== excludeProductId);
    if (inProd) return true;

    // Check variants
    for (const p of this.products) {
      if (p.enterpriseId === enterpriseId && p.variants) {
        if (p.variants.some(v => v.barcode === trimmed && v.productId !== excludeProductId)) {
          return true;
        }
      }
    }
    return false;
  }

  public saveProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, userId: string): { success: boolean; error?: string; product?: Product } {
    const isNew = !product.id;
    const prodId = product.id || 'prod-' + Date.now().toString(36);

    // Duplicate barcode check
    if (product.barcode && this.isBarcodeAssigned(product.enterpriseId, product.barcode, product.id)) {
      return { success: false, error: `Barcode "${product.barcode}" is already assigned to another product in your catalog.` };
    }

    const fullProduct: Product = {
      ...product,
      id: prodId,
      variants: product.variants || [],
      createdAt: isNew ? new Date().toISOString() : (this.products.find(p => p.id === prodId)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      this.products.push(fullProduct);
      this.addAuditLog({
        enterpriseId: product.enterpriseId,
        userId,
        userName: 'User',
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        recordId: prodId,
        details: `Created product ${fullProduct.name} with SKU ${fullProduct.sku}`
      });
    } else {
      const idx = this.products.findIndex(p => p.id === prodId);
      if (idx !== -1) {
        this.products[idx] = fullProduct;
        this.addAuditLog({
          enterpriseId: product.enterpriseId,
          userId,
          userName: 'User',
          action: 'PRODUCT_UPDATED',
          entity: 'Product',
          recordId: prodId,
          details: `Updated product ${fullProduct.name}`
        });
      }
    }

    this.save('products', this.products);
    return { success: true, product: fullProduct };
  }

  public regenerateProductBarcode(enterpriseId: string, productId: string, variantId?: string, userId: string = 'usr-admin'): { success: boolean; newBarcode?: string } {
    const product = this.products.find(p => p.id === productId && p.enterpriseId === enterpriseId);
    if (!product) return { success: false };

    let uniqueBarcode = generateUniqueBarcode();
    while (this.isBarcodeAssigned(enterpriseId, uniqueBarcode)) {
      uniqueBarcode = generateUniqueBarcode();
    }

    const oldBarcode = variantId
      ? product.variants.find(v => v.id === variantId)?.barcode
      : product.barcode;

    if (variantId) {
      const vIdx = product.variants.findIndex(v => v.id === variantId);
      if (vIdx !== -1) {
        product.variants[vIdx].barcode = uniqueBarcode;
      }
    } else {
      product.barcode = uniqueBarcode;
    }

    product.updatedAt = new Date().toISOString();
    this.save('products', this.products);

    this.addAuditLog({
      enterpriseId,
      userId,
      userName: 'User',
      action: 'BARCODE_REGENERATED',
      entity: 'Barcode',
      recordId: productId,
      details: `Regenerated barcode for ${product.name} (Previous: ${oldBarcode} -> New: ${uniqueBarcode})`,
      previousValue: oldBarcode,
      newValue: uniqueBarcode
    });

    return { success: true, newBarcode: uniqueBarcode };
  }

  public adjustStock(
    enterpriseId: string,
    branchId: string,
    productId: string,
    quantityChange: number,
    reason: string,
    performedBy: string,
    variantId?: string
  ): void {
    const prod = this.products.find(p => p.id === productId && p.enterpriseId === enterpriseId);
    if (!prod) return;

    const previousStock = variantId
      ? prod.variants.find(v => v.id === variantId)?.stock || 0
      : prod.stock;

    const newStock = Math.max(0, previousStock + quantityChange);

    if (variantId) {
      const v = prod.variants.find(v => v.id === variantId);
      if (v) v.stock = newStock;
    } else {
      prod.stock = newStock;
    }

    prod.updatedAt = new Date().toISOString();
    this.save('products', this.products);

    // Record movement
    const movement: InventoryMovement = {
      id: 'mov-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      enterpriseId,
      branchId,
      productId,
      productName: prod.name,
      variantId,
      type: 'adjustment',
      quantityChange,
      previousStock,
      newStock,
      reason,
      performedBy,
      timestamp: new Date().toISOString()
    };
    this.inventoryMovements.unshift(movement);
    this.save('inventoryMovements', this.inventoryMovements);

    this.addAuditLog({
      enterpriseId,
      branchId,
      userId: performedBy,
      userName: performedBy,
      action: 'STOCK_ADJUSTMENT',
      entity: 'Inventory',
      recordId: productId,
      details: `Adjusted stock for ${prod.name} by ${quantityChange > 0 ? '+' : ''}${quantityChange} (${reason})`
    });
  }

  // --- ATOMIC SALE COMPLETION ---
  public completeSale(
    saleData: Omit<Sale, 'id' | 'createdAt'>
  ): { success: boolean; sale: Sale; error?: string } {
    const saleId = 'sale-' + Date.now().toString(36);
    const fullSale: Sale = {
      ...saleData,
      id: saleId,
      createdAt: new Date().toISOString()
    };

    // 1. Check & Deduct Inventory
    for (const item of fullSale.items) {
      const prod = this.products.find(p => p.id === item.productId && p.enterpriseId === fullSale.enterpriseId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updatedAt = new Date().toISOString();

        // Add inventory movement
        const movement: InventoryMovement = {
          id: 'mov-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          enterpriseId: fullSale.enterpriseId,
          branchId: fullSale.branchId,
          productId: item.productId,
          productName: item.name,
          variantId: item.variantId,
          type: 'sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          referenceId: fullSale.invoiceNumber,
          performedBy: fullSale.cashierName,
          timestamp: new Date().toISOString()
        };
        this.inventoryMovements.unshift(movement);
      }
    }

    // 2. Customer loyalty / balance update
    if (fullSale.customerId) {
      const cust = this.customers.find(c => c.id === fullSale.customerId && c.enterpriseId === fullSale.enterpriseId);
      if (cust) {
        cust.totalSpent += fullSale.total;
        cust.loyaltyPoints += Math.floor(fullSale.total);
        if (fullSale.paymentMethod === 'credit') {
          cust.outstandingBalance += fullSale.total;
        }
      }
    }

    // 3. Save sale
    this.sales.unshift(fullSale);
    this.save('sales', this.sales);
    this.save('products', this.products);
    this.save('inventoryMovements', this.inventoryMovements);
    this.save('customers', this.customers);

    // 4. Record audit log
    this.addAuditLog({
      enterpriseId: fullSale.enterpriseId,
      branchId: fullSale.branchId,
      userId: fullSale.cashierId,
      userName: fullSale.cashierName,
      action: 'SALE_COMPLETED',
      entity: 'Sale',
      recordId: saleId,
      details: `Completed invoice #${fullSale.invoiceNumber} for ${fullSale.customerName || 'Walk-in'} ($${fullSale.total.toFixed(2)}) via ${fullSale.paymentMethod}`
    });

    return { success: true, sale: fullSale };
  }

  public refundSale(saleId: string, enterpriseId: string, reason: string, performedBy: string): { success: boolean } {
    const sale = this.sales.find(s => s.id === saleId && s.enterpriseId === enterpriseId);
    if (!sale || sale.status === 'refunded') return { success: false };

    // Restore stock
    for (const item of sale.items) {
      const prod = this.products.find(p => p.id === item.productId && p.enterpriseId === enterpriseId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock += item.quantity;
        prod.updatedAt = new Date().toISOString();

        const movement: InventoryMovement = {
          id: 'mov-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          enterpriseId,
          branchId: sale.branchId,
          productId: item.productId,
          productName: item.name,
          type: 'return',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          reason,
          referenceId: sale.invoiceNumber,
          performedBy,
          timestamp: new Date().toISOString()
        };
        this.inventoryMovements.unshift(movement);
      }
    }

    sale.status = 'refunded';
    this.save('sales', this.sales);
    this.save('products', this.products);
    this.save('inventoryMovements', this.inventoryMovements);

    this.addAuditLog({
      enterpriseId,
      branchId: sale.branchId,
      userId: performedBy,
      userName: performedBy,
      action: 'SALE_REFUNDED',
      entity: 'Sale',
      recordId: saleId,
      details: `Refunded invoice #${sale.invoiceNumber} ($${sale.total.toFixed(2)}) - Reason: ${reason}`
    });

    return { success: true };
  }

  // --- SALES (Tenant Isolated) ---
  public getSales(enterpriseId: string, branchId?: string | null): Sale[] {
    return this.sales.filter(s => {
      if (s.enterpriseId !== enterpriseId) return false;
      if (branchId && s.branchId !== branchId) return false;
      return true;
    });
  }

  // --- STOCK TRANSFERS ---
  public transferStock(
    enterpriseId: string,
    fromBranchId: string,
    toBranchId: string,
    items: { productId: string; quantity: number }[],
    createdBy: string,
    notes?: string
  ): StockTransfer {
    const fromBranch = this.branches.find(b => b.id === fromBranchId);
    const toBranch = this.branches.find(b => b.id === toBranchId);

    const detailedItems = items.map(item => {
      const prod = this.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : '',
        quantity: item.quantity
      };
    });

    const transfer: StockTransfer = {
      id: 'trans-' + Date.now().toString(36),
      enterpriseId,
      transferNumber: 'TRF-' + Math.floor(1000 + Math.random() * 9000),
      fromBranchId,
      fromBranchName: fromBranch ? fromBranch.name : 'Branch A',
      toBranchId,
      toBranchName: toBranch ? toBranch.name : 'Branch B',
      items: detailedItems,
      status: 'completed',
      notes,
      createdBy,
      createdAt: new Date().toISOString()
    };

    // Log movements for both branches
    for (const item of detailedItems) {
      this.inventoryMovements.unshift({
        id: 'mov-out-' + Date.now().toString(36),
        enterpriseId,
        branchId: fromBranchId,
        productId: item.productId,
        productName: item.productName,
        type: 'transfer_out',
        quantityChange: -item.quantity,
        previousStock: 0,
        newStock: 0,
        reason: `Transfer to ${transfer.toBranchName} (${transfer.transferNumber})`,
        referenceId: transfer.transferNumber,
        performedBy: createdBy,
        timestamp: new Date().toISOString()
      });

      this.inventoryMovements.unshift({
        id: 'mov-in-' + Date.now().toString(36),
        enterpriseId,
        branchId: toBranchId,
        productId: item.productId,
        productName: item.productName,
        type: 'transfer_in',
        quantityChange: item.quantity,
        previousStock: 0,
        newStock: 0,
        reason: `Transfer from ${transfer.fromBranchName} (${transfer.transferNumber})`,
        referenceId: transfer.transferNumber,
        performedBy: createdBy,
        timestamp: new Date().toISOString()
      });
    }

    this.stockTransfers.unshift(transfer);
    this.save('stockTransfers', this.stockTransfers);
    this.save('inventoryMovements', this.inventoryMovements);

    this.addAuditLog({
      enterpriseId,
      branchId: fromBranchId,
      userId: createdBy,
      userName: createdBy,
      action: 'STOCK_TRANSFER',
      entity: 'StockTransfer',
      recordId: transfer.id,
      details: `Completed transfer ${transfer.transferNumber} of ${detailedItems.length} items from ${transfer.fromBranchName} to ${transfer.toBranchName}`
    });

    return transfer;
  }

  public getStockTransfers(enterpriseId: string): StockTransfer[] {
    return this.stockTransfers.filter(t => t.enterpriseId === enterpriseId);
  }

  public getInventoryMovements(enterpriseId: string): InventoryMovement[] {
    return this.inventoryMovements.filter(m => m.enterpriseId === enterpriseId);
  }

  // --- CUSTOMERS & SUPPLIERS (Tenant Isolated) ---
  public getCustomers(enterpriseId: string): Customer[] {
    return this.customers.filter(c => c.enterpriseId === enterpriseId);
  }

  public saveCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string }): Customer {
    const isNew = !customer.id;
    const custId = customer.id || 'cust-' + Date.now().toString(36);
    const fullCustomer: Customer = {
      ...customer,
      id: custId,
      createdAt: isNew ? new Date().toISOString() : (this.customers.find(c => c.id === custId)?.createdAt || new Date().toISOString())
    };

    if (isNew) {
      this.customers.push(fullCustomer);
    } else {
      const idx = this.customers.findIndex(c => c.id === custId);
      if (idx !== -1) this.customers[idx] = fullCustomer;
    }
    this.save('customers', this.customers);
    return fullCustomer;
  }

  public getSuppliers(enterpriseId: string): Supplier[] {
    return this.suppliers.filter(s => s.enterpriseId === enterpriseId);
  }

  public saveSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'> & { id?: string }): Supplier {
    const isNew = !supplier.id;
    const supId = supplier.id || 'sup-' + Date.now().toString(36);
    const fullSupplier: Supplier = {
      ...supplier,
      id: supId,
      createdAt: isNew ? new Date().toISOString() : (this.suppliers.find(s => s.id === supId)?.createdAt || new Date().toISOString())
    };

    if (isNew) {
      this.suppliers.push(fullSupplier);
    } else {
      const idx = this.suppliers.findIndex(s => s.id === supId);
      if (idx !== -1) this.suppliers[idx] = fullSupplier;
    }
    this.save('suppliers', this.suppliers);
    return fullSupplier;
  }

  // --- PURCHASING (Tenant Isolated) ---
  public getPurchaseOrders(enterpriseId: string): PurchaseOrder[] {
    return this.purchaseOrders.filter(p => p.enterpriseId === enterpriseId);
  }

  public createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt'>): PurchaseOrder {
    const id = 'po-' + Date.now().toString(36);
    const newPO: PurchaseOrder = {
      ...po,
      id,
      createdAt: new Date().toISOString()
    };
    this.purchaseOrders.unshift(newPO);
    this.save('purchaseOrders', this.purchaseOrders);
    return newPO;
  }

  public receivePurchaseOrder(poId: string, enterpriseId: string, performedBy: string): boolean {
    const po = this.purchaseOrders.find(p => p.id === poId && p.enterpriseId === enterpriseId);
    if (!po || po.status === 'received') return false;

    // Increase stock for each item
    for (const item of po.items) {
      const prod = this.products.find(p => p.id === item.productId && p.enterpriseId === enterpriseId);
      if (prod) {
        const prevStock = prod.stock;
        prod.stock += item.quantity;
        prod.updatedAt = new Date().toISOString();

        this.inventoryMovements.unshift({
          id: 'mov-po-' + Date.now().toString(36),
          enterpriseId,
          branchId: po.branchId,
          productId: item.productId,
          productName: item.productName,
          type: 'purchase',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: prod.stock,
          reason: `Goods receipt for PO #${po.orderNumber}`,
          referenceId: po.orderNumber,
          performedBy,
          timestamp: new Date().toISOString()
        });
      }
    }

    po.status = 'received';
    po.receivedDate = new Date().toISOString();

    this.save('purchaseOrders', this.purchaseOrders);
    this.save('products', this.products);
    this.save('inventoryMovements', this.inventoryMovements);

    this.addAuditLog({
      enterpriseId,
      branchId: po.branchId,
      userId: performedBy,
      userName: performedBy,
      action: 'PO_RECEIVED',
      entity: 'PurchaseOrder',
      recordId: poId,
      details: `Goods received for PO #${po.orderNumber} ($${po.totalAmount.toFixed(2)})`
    });

    return true;
  }

  // --- INDUSTRY MODULES (Tenant Isolated) ---
  // Restaurant
  public getRestaurantTables(enterpriseId: string, branchId?: string): RestaurantTable[] {
    return this.restaurantTables.filter(t => t.enterpriseId === enterpriseId && (!branchId || t.branchId === branchId));
  }

  public updateTableStatus(tableId: string, status: RestaurantTable['status'], total?: number): void {
    const tbl = this.restaurantTables.find(t => t.id === tableId);
    if (tbl) {
      tbl.status = status;
      if (total !== undefined) tbl.activeOrderTotal = total;
      this.save('restaurantTables', this.restaurantTables);
    }
  }

  public getKitchenOrders(enterpriseId: string, branchId?: string): KitchenOrder[] {
    return this.kitchenOrders.filter(k => k.enterpriseId === enterpriseId && (!branchId || k.branchId === branchId));
  }

  public createKitchenOrder(order: Omit<KitchenOrder, 'id'>): KitchenOrder {
    const id = 'kds-' + Date.now().toString(36);
    const newOrder = { ...order, id };
    this.kitchenOrders.unshift(newOrder);
    this.save('kitchenOrders', this.kitchenOrders);
    return newOrder;
  }

  public updateKitchenOrderStatus(orderId: string, status: KitchenOrder['status']): void {
    const o = this.kitchenOrders.find(k => k.id === orderId);
    if (o) {
      o.status = status;
      this.save('kitchenOrders', this.kitchenOrders);
    }
  }

  // Electronics & Mobile Repairs
  public getRepairTickets(enterpriseId: string, branchId?: string): RepairTicket[] {
    return this.repairTickets.filter(r => r.enterpriseId === enterpriseId && (!branchId || r.branchId === branchId));
  }

  public saveRepairTicket(ticket: Omit<RepairTicket, 'id'> & { id?: string }): RepairTicket {
    const isNew = !ticket.id;
    const ticketId = ticket.id || 'rep-' + Date.now().toString(36);
    const fullTicket: RepairTicket = { ...ticket, id: ticketId };

    if (isNew) {
      this.repairTickets.unshift(fullTicket);
    } else {
      const idx = this.repairTickets.findIndex(r => r.id === ticketId);
      if (idx !== -1) this.repairTickets[idx] = fullTicket;
    }
    this.save('repairTickets', this.repairTickets);
    return fullTicket;
  }

  // Hotel
  public getHotelRooms(enterpriseId: string): HotelRoom[] {
    return this.hotelRooms.filter(h => h.enterpriseId === enterpriseId);
  }

  public updateRoomStatus(roomId: string, status: HotelRoom['status'], guest?: string): void {
    const r = this.hotelRooms.find(h => h.id === roomId);
    if (r) {
      r.status = status;
      if (guest !== undefined) r.currentGuestName = guest;
      this.save('hotelRooms', this.hotelRooms);
    }
  }

  // --- EXPENSES & CASH MANAGEMENT ---
  public getExpenses(enterpriseId: string, branchId?: string): ExpenseRecord[] {
    return this.expenses.filter(e => e.enterpriseId === enterpriseId && (!branchId || e.branchId === branchId));
  }

  public addExpense(expense: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const id = 'exp-' + Date.now().toString(36);
    const newExp = { ...expense, id };
    this.expenses.unshift(newExp);
    this.save('expenses', this.expenses);
    return newExp;
  }

  // --- AUDIT LOGS ---
  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...log,
      id: 'aud-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.save('auditLogs', this.auditLogs);
  }

  public getAuditLogs(enterpriseId?: string | null): AuditLog[] {
    if (!enterpriseId) return [...this.auditLogs];
    return this.auditLogs.filter(a => a.enterpriseId === enterpriseId);
  }

  // --- SUBSCRIPTIONS ---
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.subscriptionPlans];
  }

  public updateSubscriptionPlan(plan: SubscriptionPlan): void {
    const idx = this.subscriptionPlans.findIndex(p => p.id === plan.id);
    if (idx !== -1) {
      this.subscriptionPlans[idx] = plan;
      this.save('subscriptionPlans', this.subscriptionPlans);
    }
  }

  // --- ENTERPRISES, BRANCHES & USERS ---
  public saveEnterprise(enterprise: Enterprise): void {
    const idx = this.enterprises.findIndex(e => e.id === enterprise.id);
    if (idx !== -1) {
      this.enterprises[idx] = enterprise;
    } else {
      this.enterprises.push(enterprise);
    }
    this.save('enterprises', this.enterprises);
  }

  public saveBranch(branch: Omit<Branch, 'id'> & { id?: string }): Branch {
    const id = branch.id || 'br-' + Date.now().toString(36);
    const fullBranch: Branch = { ...branch, id };
    const idx = this.branches.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.branches[idx] = fullBranch;
    } else {
      this.branches.push(fullBranch);
    }
    this.save('branches', this.branches);
    return fullBranch;
  }

  public saveUser(user: Omit<User, 'id'> & { id?: string }): User {
    const id = user.id || 'usr-' + Date.now().toString(36);
    const fullUser: User = { ...user, id };
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = fullUser;
    } else {
      this.users.push(fullUser);
    }
    this.save('users', this.users);
    return fullUser;
  }

  public deleteUser(userId: string, adminName: string): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    const user = this.users[idx];
    this.users.splice(idx, 1);
    this.save('users', this.users);
    this.addAuditLog({
      enterpriseId: user.enterpriseId || 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'USER_DELETED',
      entity: 'User',
      recordId: userId,
      details: `Removed user account ${user.name} (${user.email})`
    });
    return true;
  }

  public setEnterpriseStatus(enterpriseId: string, status: 'active' | 'suspended', adminName: string): void {
    const ent = this.enterprises.find(e => e.id === enterpriseId);
    if (!ent) return;
    const oldStatus = ent.status;
    ent.status = status;
    ent.updatedAt = new Date().toISOString();
    this.save('enterprises', this.enterprises);
    this.addAuditLog({
      enterpriseId,
      userId: 'usr-super-admin',
      userName: adminName,
      action: status === 'suspended' ? 'ENTERPRISE_SUSPENDED' : 'ENTERPRISE_REACTIVATED',
      entity: 'Enterprise',
      recordId: enterpriseId,
      details: `Super Admin ${adminName} updated status of enterprise ${ent.name} from ${oldStatus} to ${status}`
    });
  }

  public setBranchStatus(branchId: string, status: 'active' | 'inactive', adminName: string): void {
    const br = this.branches.find(b => b.id === branchId);
    if (!br) return;
    br.status = status;
    this.save('branches', this.branches);
    this.addAuditLog({
      enterpriseId: br.enterpriseId,
      branchId,
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'BRANCH_STATUS_CHANGED',
      entity: 'Branch',
      recordId: branchId,
      details: `Branch ${br.name} (${br.code}) status changed to ${status}`
    });
  }

  public logSuperAdminEnterpriseAccess(enterpriseId: string, branchId: string | null, adminUser: User): void {
    const ent = this.enterprises.find(e => e.id === enterpriseId);
    const branch = branchId ? this.branches.find(b => b.id === branchId) : null;
    const entName = ent?.name || enterpriseId;
    const brName = branch?.name || 'HQ / All Branches';

    this.addAuditLog({
      enterpriseId,
      branchId: branchId || undefined,
      userId: adminUser.id,
      userName: adminUser.name,
      action: 'SUPER_ADMIN_ENTERPRISE_ACCESS',
      entity: 'EnterpriseWorkspace',
      recordId: enterpriseId,
      details: `Super Admin ${adminUser.name} (${adminUser.email}) switched context into tenant workspace: ${entName} [Branch: ${brName}]`
    });
  }

  // --- PLATFORM SETTINGS & INTEGRATIONS ---
  public getPlatformSettings(): PlatformSettings {
    if (!this.platformSettings) {
      this.loadAll();
    }
    return this.platformSettings!;
  }

  public savePlatformSettings(settings: PlatformSettings, adminName: string): void {
    this.platformSettings = settings;
    this.save('platformSettings', settings);
    this.addAuditLog({
      enterpriseId: 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'PLATFORM_SETTINGS_UPDATED',
      entity: 'PlatformSettings',
      recordId: 'global',
      details: `Super Admin ${adminName} updated platform system settings and defaults`
    });
  }

  public getPlatformIntegrations(): PlatformIntegrations {
    if (!this.platformIntegrations) {
      this.loadAll();
    }
    return this.platformIntegrations!;
  }

  public savePlatformIntegrations(integrations: PlatformIntegrations, adminName: string): void {
    this.platformIntegrations = integrations;
    this.save('platformIntegrations', integrations);
    this.addAuditLog({
      enterpriseId: 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'INTEGRATIONS_CONFIGURED',
      entity: 'PlatformIntegrations',
      recordId: 'global',
      details: `Super Admin ${adminName} updated payment gateways, notification webhooks, and cloud connectors`
    });
  }

  // --- SYSTEM MODULES ---
  public getSystemModules(): SystemModule[] {
    return [...this.systemModules];
  }

  public toggleSystemModule(moduleId: string, adminName: string): void {
    const mod = this.systemModules.find(m => m.id === moduleId);
    if (!mod) return;
    mod.isAvailable = !mod.isAvailable;
    this.save('systemModules', this.systemModules);
    this.addAuditLog({
      enterpriseId: 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: mod.isAvailable ? 'SYSTEM_MODULE_ACTIVATED' : 'SYSTEM_MODULE_DEACTIVATED',
      entity: 'SystemModule',
      recordId: moduleId,
      details: `System module ${mod.name} (${mod.version}) availability set to ${mod.isAvailable}`
    });
  }

  // --- SUPPORT TICKETS ---
  public getSupportTickets(): SupportTicket[] {
    return [...this.supportTickets];
  }

  public addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'messagesCount'>): SupportTicket {
    const id = 'tkt-' + Date.now().toString(36);
    const newTicket: SupportTicket = {
      ...ticket,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messagesCount: 1
    };
    this.supportTickets.unshift(newTicket);
    this.save('supportTickets', this.supportTickets);
    return newTicket;
  }

  public updateSupportTicketStatus(ticketId: string, status: SupportTicket['status'], adminName: string): void {
    const ticket = this.supportTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    ticket.status = status;
    this.save('supportTickets', this.supportTickets);
    this.addAuditLog({
      enterpriseId: ticket.enterpriseId,
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'TICKET_STATUS_UPDATED',
      entity: 'SupportTicket',
      recordId: ticketId,
      details: `Support ticket #${ticketId} status updated to ${status}`
    });
  }

  // --- BACKUP & RECOVERY ---
  public getBackupRecords(): BackupRecord[] {
    return [...this.backupRecords];
  }

  public triggerBackup(type: BackupRecord['type'], adminName: string): BackupRecord {
    const id = 'bkp-' + new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const newBackup: BackupRecord = {
      id,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sizeMb: Math.round((280 + Math.random() * 10) * 10) / 10,
      type,
      status: 'completed',
      location: `s3://omnipos-backups/eu-central-1/${id}.sql.gz`,
      checksum: 'sha256:' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    };
    this.backupRecords.unshift(newBackup);
    this.save('backupRecords', this.backupRecords);
    this.addAuditLog({
      enterpriseId: 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'PLATFORM_BACKUP_COMPLETED',
      entity: 'DatabaseBackup',
      recordId: id,
      details: `Super Admin ${adminName} executed backup snapshot (${type}, ${newBackup.sizeMb} MB)`
    });
    return newBackup;
  }

  public createRole(role: Omit<Role, 'id'>, adminName: string): Role {
    const id = 'role-' + Date.now().toString(36);
    const newRole: Role = { ...role, id };
    this.roles.push(newRole);
    this.save('roles', this.roles);
    this.addAuditLog({
      enterpriseId: role.enterpriseId || 'platform',
      userId: 'usr-super-admin',
      userName: adminName,
      action: 'ROLE_CREATED',
      entity: 'Role',
      recordId: id,
      details: `Created role ${role.title} with ${role.permissions.length} permissions`
    });
    return newRole;
  }

  // --- POSTGRESQL / SUPABASE DDL EXPORT GENERATOR ---
  public generatePostgresqlDdl(): string {
    return `-- ==========================================================
-- OmniPOS Cloud: Enterprise Multi-Tenant PostgreSQL Schema
-- Suitable for Supabase, PostgreSQL 14+, AWS RDS, or Cloud SQL
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enterprises (Tenants)
CREATE TABLE IF NOT EXISTS enterprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  tax_rate NUMERIC(5, 2) DEFAULT 0.00,
  vat_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enterprise Modules & Feature Flags
CREATE TABLE IF NOT EXISTS enterprise_modules (
  enterprise_id UUID PRIMARY KEY REFERENCES enterprises(id) ON DELETE CASCADE,
  core_pos BOOLEAN DEFAULT TRUE,
  inventory BOOLEAN DEFAULT TRUE,
  purchasing BOOLEAN DEFAULT TRUE,
  customers BOOLEAN DEFAULT TRUE,
  suppliers BOOLEAN DEFAULT TRUE,
  accounting BOOLEAN DEFAULT TRUE,
  barcode_system BOOLEAN DEFAULT TRUE,
  restaurant BOOLEAN DEFAULT FALSE,
  pharmacy BOOLEAN DEFAULT FALSE,
  hardware_store BOOLEAN DEFAULT FALSE,
  computer_mobile BOOLEAN DEFAULT FALSE,
  clothing_shoe BOOLEAN DEFAULT FALSE,
  hotel BOOLEAN DEFAULT FALSE
);

-- 3. Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  is_headquarters BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active'
);
CREATE INDEX idx_branches_enterprise ON branches(enterprise_id);

-- 4. Users & RBAC
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  permissions TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID REFERENCES enterprises(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role_id VARCHAR(50) REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Products & Barcodes
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  barcode VARCHAR(100) NOT NULL,
  barcode_type VARCHAR(20) DEFAULT 'CODE128',
  category_name VARCHAR(100),
  cost_price NUMERIC(12, 2) DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL,
  wholesale_price NUMERIC(12, 2),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_enterprise_barcode UNIQUE (enterprise_id, barcode)
);
CREATE INDEX idx_products_barcode ON products(enterprise_id, barcode);
CREATE INDEX idx_products_sku ON products(enterprise_id, sku);

-- 6. Sales & Receipts
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id),
  invoice_number VARCHAR(100) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  cashier_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sales_enterprise ON sales(enterprise_id, created_at);

-- 7. Inventory Movements (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id),
  product_id UUID NOT NULL REFERENCES products(id),
  type VARCHAR(50) NOT NULL,
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id VARCHAR(100),
  performed_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policy Example
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY enterprise_isolation_policy_products ON products
  FOR ALL
  USING (enterprise_id = current_setting('app.current_enterprise_id')::UUID);
`;
  }
}

export const db = new PosDatabase();

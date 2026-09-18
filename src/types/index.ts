export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPCA';

export type EnterpriseCategory = 
  | 'grocery'
  | 'pharmacy'
  | 'hardware'
  | 'restaurant'
  | 'hotel'
  | 'computer'
  | 'mobile'
  | 'electronics'
  | 'clothing'
  | 'shoes'
  | 'furniture'
  | 'bakery'
  | 'cosmetics'
  | 'wholesale'
  | 'general_retail'
  | 'other';

export interface EnterpriseModules {
  corePos: boolean;
  inventory: boolean;
  purchasing: boolean;
  customers: boolean;
  suppliers: boolean;
  accounting: boolean;
  barcodeSystem: boolean;
  restaurant: boolean;
  pharmacy: boolean;
  hardwareStore: boolean;
  computerMobile: boolean;
  clothingShoe: boolean;
  hotel: boolean;
}

export interface EnterpriseFeatures {
  // Restaurant features
  restaurantTables: boolean;
  restaurantKds: boolean;
  restaurantRecipes: boolean;
  restaurantSplitBills: boolean;
  restaurantTakeaway: boolean;
  // Pharmacy features
  pharmacyBatchTracking: boolean;
  pharmacyExpiryTracking: boolean;
  pharmacyPrescriptions: boolean;
  pharmacyFefo: boolean;
  // Hardware features
  hardwareUnitConversions: boolean;
  hardwareBulkWpricing: boolean;
  // Computer / Mobile features
  electronicsImeiTracking: boolean;
  electronicsSerialNumbers: boolean;
  electronicsRepairService: boolean;
  // Clothing / Shoes
  clothingVariantMatrix: boolean;
  // Hotel features
  hotelRooms: boolean;
  hotelReservations: boolean;
  hotelHousekeeping: boolean;
  hotelRoomBilling: boolean;
  // Finance
  cashRegisterShift: boolean;
  expenseTracking: boolean;
}

export interface Enterprise {
  id: string;
  name: string;
  slug: string;
  code: string;
  category: EnterpriseCategory;
  logoUrl?: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRate: number;
  vatNumber?: string;
  status: 'active' | 'suspended' | 'archived';
  subscriptionPlanId: string;
  modules: EnterpriseModules;
  features: EnterpriseFeatures;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  enterpriseId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isHeadquarters: boolean;
  status: 'active' | 'inactive';
}

export type PermissionCode =
  | 'sales.view'
  | 'sales.create'
  | 'sales.edit'
  | 'sales.delete'
  | 'sales.refund'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.adjust'
  | 'inventory.transfer'
  | 'purchases.view'
  | 'purchases.create'
  | 'purchases.edit'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'suppliers.view'
  | 'suppliers.create'
  | 'suppliers.edit'
  | 'reports.view'
  | 'reports.export'
  | 'barcode.generate'
  | 'barcode.print'
  | 'barcode.regenerate'
  | 'settings.view'
  | 'settings.manage'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete';

export interface Role {
  id: string;
  enterpriseId?: string; // null for platform super admin
  title: string;
  description: string;
  permissions: PermissionCode[];
  isSystem: boolean;
}

export interface User {
  id: string;
  enterpriseId: string | null; // null for Super Admin
  branchId: string | null; // null means all branches or Super Admin
  name: string;
  email: string;
  roleId: string;
  roleTitle: string;
  avatar?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { Size: 'XL', Color: 'Black' }
}

export interface Product {
  id: string;
  enterpriseId: string;
  name: string;
  sku: string;
  barcode: string;
  barcodeType: BarcodeFormat;
  categoryId: string;
  categoryName: string;
  brand?: string;
  supplierId?: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string; // 'pcs', 'kg', 'meter', 'liter', 'box', etc.
  imageUrl?: string;
  description?: string;
  status: 'active' | 'inactive';
  variants: ProductVariant[];
  // Industry specific attributes
  genericName?: string; // Pharmacy
  dosageForm?: string; // Pharmacy (tablet, syrup, etc.)
  batchNumber?: string; // Pharmacy/Food
  expiryDate?: string; // Pharmacy/Food
  isPrescriptionRequired?: boolean; // Pharmacy
  serialNumber?: string; // Electronics
  imeiNumber?: string; // Mobile
  warrantyMonths?: number; // Electronics/Mobile
  dimensions?: { length?: number; width?: number; thickness?: number; unit?: string }; // Hardware
  createdAt: string;
  updatedAt: string;
}

export interface BarcodeRecord {
  id: string;
  enterpriseId: string;
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  barcode: string;
  barcodeType: BarcodeFormat;
  printCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  enterpriseId: string;
  branchId: string;
  productId: string;
  productName: string;
  variantId?: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string;
  performedBy: string;
  timestamp: string;
}

export interface StockTransfer {
  id: string;
  enterpriseId: string;
  transferNumber: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
  unit: string;
  discount: number; // percentage or fixed
  discountType: 'percent' | 'fixed';
  taxRate: number;
  note?: string;
  serialOrImei?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Sale {
  id: string;
  enterpriseId: string;
  branchId: string;
  branchName: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital' | 'split' | 'credit';
  paymentSplits?: { method: string; amount: number }[];
  amountPaid: number;
  changeDue: number;
  status: 'completed' | 'held' | 'refunded' | 'exchanged';
  heldName?: string;
  cashierId: string;
  cashierName: string;
  tableNumber?: string; // for restaurant
  diningType?: 'dine_in' | 'takeaway' | 'delivery';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  enterpriseId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  outstandingBalance: number;
  creditLimit: number;
  notes?: string;
  totalSpent: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  enterpriseId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  paymentTerms: string;
  outstandingBalance: number;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  enterpriseId: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'partial' | 'cancelled';
  notes?: string;
  receivedDate?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  enterpriseId: string;
  branchId?: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  recordId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  features: string[];
  description: string;
}

// Industry specific interfaces
export interface RestaurantTable {
  id: string;
  enterpriseId: string;
  branchId: string;
  number: string;
  capacity: number;
  zone: 'Main Dining' | 'Patio' | 'VIP Lounge' | 'Bar Area';
  status: 'available' | 'occupied' | 'reserved' | 'billing';
  activeOrderTotal?: number;
  activeOrderTime?: string;
}

export interface KitchenOrder {
  id: string;
  enterpriseId: string;
  branchId: string;
  orderNumber: string;
  tableNumber: string;
  diningType: 'dine_in' | 'takeaway' | 'delivery';
  items: {
    name: string;
    qty: number;
    notes?: string;
    isDone?: boolean;
  }[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: string;
}

export interface MedicineBatch {
  id: string;
  enterpriseId: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchaseCost: number;
  isExpired: boolean;
  isNearExpiry: boolean; // within 90 days
}

export interface RepairTicket {
  id: string;
  enterpriseId: string;
  branchId: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceType: 'Laptop' | 'Smartphone' | 'Desktop' | 'Tablet' | 'Other';
  brandModel: string;
  serialOrImei: string;
  issueDescription: string;
  technicianName: string;
  status: 'received' | 'diagnosing' | 'in_repair' | 'waiting_parts' | 'ready' | 'delivered';
  laborCharge: number;
  partsCharge: number;
  totalEstimate: number;
  receivedDate: string;
  completedDate?: string;
}

export interface HotelRoom {
  id: string;
  enterpriseId: string;
  roomNumber: string;
  type: 'Single Standard' | 'Deluxe Ocean View' | 'Executive Suite' | 'Family Villa';
  capacity: number;
  pricePerNight: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  currentGuestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  folioBalance?: number;
}

export interface ExpenseRecord {
  id: string;
  enterpriseId: string;
  branchId: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Maintenance' | 'Marketing' | 'Other';
  description: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  date: string;
}

export interface CashRegisterSession {
  id: string;
  enterpriseId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  openingCash: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export type SuperAdminSection =
  | 'dashboard'
  | 'enterprises'
  | 'branches'
  | 'users'
  | 'enterprise_modules'
  | 'subscriptions'
  | 'system_modules'
  | 'platform_settings'
  | 'security_audit'
  | 'system_health'
  | 'backup_recovery'
  | 'support_communication'
  | 'platform_reports'
  | 'integrations'
  | 'admin_settings';

export interface PlatformSettings {
  platformName: string;
  platformLogoUrl: string;
  defaultCurrency: string;
  supportedCategories: EnterpriseCategory[];
  defaultTaxRate: number;
  defaultPaymentMethods: string[];
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    senderName: string;
    senderEmail: string;
    encryption: 'tls' | 'ssl' | 'none';
  };
  smsSettings: {
    provider: 'twilio' | 'aws_sns' | 'vonage';
    senderId: string;
    enabled: boolean;
  };
  notificationSettings: {
    systemAlerts: boolean;
    subscriptionExpirations: boolean;
    newEnterpriseSignups: boolean;
    failedLogins: boolean;
  };
  defaultInvoiceSettings: {
    prefix: string;
    receiptFooter: string;
    showTaxBreakdown: boolean;
  };
  defaultBarcodeSettings: {
    format: BarcodeFormat;
    prefix: string;
    autoPrint: boolean;
  };
}

export interface SystemModule {
  id: string;
  name: string;
  category: 'core' | 'industry';
  version: string;
  description: string;
  isAvailable: boolean;
  dependencies: string[];
  status: 'active' | 'beta' | 'maintenance';
}

export interface PlatformIntegrations {
  stripe: { enabled: boolean; testMode: boolean; publicKey: string };
  paypal: { enabled: boolean; clientId: string };
  sendgrid: { enabled: boolean; apiKeySet: boolean };
  twilioSms: { enabled: boolean; sidSet: boolean };
  whatsapp: { enabled: boolean; businessNumber: string };
  supabaseCloud: { enabled: boolean; projectUrl: string; rlsEnforced: boolean };
  accountingWebhook: { enabled: boolean; endpointUrl: string };
}

export interface SupportTicket {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  contactName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  createdAt: string;
  messagesCount: number;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  sizeMb: number;
  type: 'automated_daily' | 'manual_snapshot' | 'pre_migration';
  status: 'completed' | 'in_progress' | 'failed';
  location: string;
  checksum: string;
}


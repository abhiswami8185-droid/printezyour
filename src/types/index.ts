// TypeScript interfaces for PrintezYour Platform

export type PermissionKey =
  | 'dashboard.view'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.activate'
  | 'users.deactivate'
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'roles.permissions'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.pricing'
  | 'products.inventory'
  | 'products.activate'
  | 'products.archive'
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.status'
  | 'orders.cancel'
  | 'orders.refund'
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.edit'
  | 'inventory.adjust'
  | 'inventory.consume'
  | 'inventory.purchase'
  | 'purchases.view'
  | 'purchases.create'
  | 'purchases.edit'
  | 'purchases.receive'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'quotes.view'
  | 'quotes.create'
  | 'quotes.edit'
  | 'quotes.approve'
  | 'quotes.convert'
  | 'reports.view'
  | 'reports.export'
  | 'settings.view'
  | 'settings.edit'
  | 'content.view'
  | 'content.edit'
  | 'audit.view';

export type UserRole = string; // Supports SUPER_ADMIN, ADMIN, MANAGER, STAFF, or custom created role IDs
export type Role = UserRole;

export interface RoleDefinition {
  id: string; // 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'role-...'
  name: string;
  description: string;
  isSystem: boolean; // Cannot delete core system roles
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string; // role ID
  roleName?: string;
  passwordHash?: string;
  phone?: string;
  mobile?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  active: boolean;
  notes?: string;
  grantedPermissions?: PermissionKey[]; // Individual overrides (added permissions)
  revokedPermissions?: PermissionKey[]; // Individual overrides (removed permissions)
  effectivePermissions?: PermissionKey[]; // Computed runtime permissions
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Payment Pending'
  | 'Payment Received'
  | 'Artwork Pending'
  | 'Artwork Approved'
  | 'In Production'
  | 'Quality Check'
  | 'Ready'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Pickup Ready'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Advance Paid' | 'Fully Paid' | 'Failed' | 'Refunded';

export type PaymentMethod = 'UPI / QR Code' | 'Cash on Delivery' | 'Bank Transfer (NEFT/RTGS)' | 'Cheque' | 'Online Gateway (Ready)';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDesc?: string;
  fullDesc?: string;
  description?: string;
  features?: string[];
  materialsAvailable?: string[];
  materials?: string[];
  typicalTurnaround?: string;
  turnaroundTime?: string;
  imageUrl?: string;
  image?: string;
  pricingModel?: string;
  active: boolean;
  displayOrder: number;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  priceModifier: number; // additional price in INR
  isDefault?: boolean;
  inventoryItemId?: string; // variant-specific inventory link
}

export interface ProductOptionGroup {
  id: string;
  name: string; // e.g. "Paper GSM", "Finishing", "Printing Side", "Size"
  type?: 'select' | 'radio';
  values?: ProductOptionValue[];
  options?: ProductOptionValue[];
}

export interface QuantityTier {
  minQty?: number;
  unitPrice?: number; // in INR
  quantity?: number;
  discountPercentage?: number;
}

export interface ProductMaterialRequirement {
  id: string;
  inventoryItemId: string;
  inventoryItemName?: string;
  inventorySku?: string;
  quantityRequired: number; // e.g. 10
  unit: string; // e.g. "Sheets", "Roll", "Reams", "Kg", "Bottle", "Pcs"
  forProductQuantity: number; // e.g. 500 (meaning 10 sheets per 500 cards)
  optionValueId?: string; // variant-specific requirement
  notes?: string;
}

export interface ProductPriceHistory {
  id: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export type ProductAvailabilityStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'MADE_TO_ORDER'
  | 'QUOTE_ONLY'
  | 'DISABLED';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  category: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  images: string[];
  image?: string;
  popularBadge?: string;
  basePrice: number;
  priceType: 'fixed' | 'quantity_tiered' | 'quote_only';
  minQuantity: number;
  quantityTiers: QuantityTier[];
  options: ProductOptionGroup[];
  optionGroups?: ProductOptionGroup[];
  materialRequirements?: ProductMaterialRequirement[];
  stockMode?: 'inventory_calculated' | 'made_to_order' | 'quote_only' | 'disabled';
  manualStatus?: ProductAvailabilityStatus;
  priceHistory?: ProductPriceHistory[];
  requiresArtwork: boolean;
  productionTime: string; // e.g. "2-3 Business Days"
  turnaroundTime?: string;
  deliveryInfo: string;
  isFeatured: boolean;
  isActive: boolean;
  isArchived?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  gstRate: number; // e.g. 18% or 12%
  features?: string[];
  updatedAt?: string;
}

export interface CartItemOption {
  groupName: string;
  valueName: string;
  priceModifier: number;
}
export type SelectedOption = CartItemOption;

export interface CartItem {
  id: string; // unique cart line ID
  productId: string;
  productName: string;
  category: string;
  image: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: CartItemOption[];
  artworkFile?: {
    name: string;
    url: string;
    size: number;
  };
  customNotes?: string;
  lineTotal: number;
}

export interface OrderCustomerInfo {
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  company?: string;
  billingAddress: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  image: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: CartItemOption[];
  artworkFile?: {
    name: string;
    url: string;
    size: number;
  };
  customNotes?: string;
  subtotal: number;
}

export interface Order {
  id: string; // PY-XXXXXX
  customer: OrderCustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryType: 'Delivery' | 'Pickup';
  specialInstructions?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
  whatsappNotified: boolean;
  inventoryDeducted?: boolean;
}

export type StockMovementType =
  | 'purchase'
  | 'received'
  | 'consumed'
  | 'adjustment'
  | 'damaged'
  | 'returned'
  | 'wastage';

export interface StockMovement {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string; // e.g. PO or Order ID
  date: string;
  recordedBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string; // Paper, Flex/Vinyl, Board, Ink, Packaging, Accessories
  unit: string; // Sheets, Meters, Roll, Kg, Pcs, Box
  currentStock: number;
  minStock: number;
  reorderLevel: number;
  purchasePrice: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  notes?: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  category: string;
}

export interface PurchaseItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Purchase {
  id: string; // PO-XXXXXX
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  date: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partial';
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  notes?: string;
  invoiceNumber?: string;
  receivedAt?: string;
}
export type PurchaseOrder = Purchase;

export interface QuoteRequest {
  id: string; // QR-XXXXXX
  customerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  company?: string;
  serviceCategory: string;
  productRequirement: string;
  quantity: number;
  sizeSpecs?: string;
  materialPreference?: string;
  finishPreference?: string;
  artworkUrl?: string;
  artworkFileName?: string;
  deliveryNeededBy?: string;
  status: 'New' | 'Under Review' | 'Quoted' | 'Quotation Sent' | 'Accepted' | 'Rejected' | 'Converted to Order';
  quotedPrice?: number;
  adminNotes?: string;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalOrders: number;
  totalSpent: number;
  pendingAmount: number;
  lastOrderDate?: string;
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  brandName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  workingHoursWeekday: string;
  workingHoursSaturday: string;
  workingHoursSunday: string;
  gstin: string;
  defaultGstPercent: number;
  deliveryChargeStandard: number;
  freeDeliveryThreshold: number;
  upiId: string;
  enableWhatsAppNotifications: boolean;
  whatsappApiKey?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  user: string;
  role: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ip?: string;
}

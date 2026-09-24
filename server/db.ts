import fs from 'fs';
import path from 'path';
import {
  Category,
  ServiceItem,
  Product,
  InventoryItem,
  Supplier,
  Customer,
  Order,
  QuoteRequest,
  Purchase,
  StockMovement,
  BusinessSettings,
  User,
  AuditLog,
  RoleDefinition,
  PermissionKey,
  MediaItem
} from '../src/types';
import {
  initialCategories,
  initialServices,
  initialProducts,
  initialInventory,
  initialSuppliers,
  initialCustomers,
  initialOrders,
  initialQuotes,
  initialSettings,
  initialUsers
} from './seedData';
import { ALL_PERMISSIONS, computeEffectivePermissions, hashPassword, verifyPassword } from './auth';

export const defaultRoles: RoleDefinition[] = [
  {
    id: 'SUPER_ADMIN',
    name: 'Super Admin / Owner',
    description: 'Full business ownership, configuration, and unrestricted access',
    isSystem: true,
    permissions: [...ALL_PERMISSIONS],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ADMIN',
    name: 'General / Store Admin',
    description: 'Store operations, product catalog, orders, quotes, and customer management',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'products.view',
      'products.create',
      'products.edit',
      'products.pricing',
      'products.inventory',
      'products.activate',
      'orders.view',
      'orders.create',
      'orders.edit',
      'orders.status',
      'orders.cancel',
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.adjust',
      'inventory.consume',
      'inventory.purchase',
      'purchases.view',
      'purchases.create',
      'purchases.edit',
      'purchases.receive',
      'customers.view',
      'customers.create',
      'customers.edit',
      'quotes.view',
      'quotes.create',
      'quotes.edit',
      'quotes.approve',
      'quotes.convert',
      'reports.view',
      'reports.export',
      'settings.view',
      'content.view',
      'audit.view',
      'media.view',
      'media.upload',
      'media.edit',
      'media.delete',
      'media.reorder'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'MANAGER',
    name: 'Production & Sales Manager',
    description: 'Production workflows, stock adjustments, and order progress tracking',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'products.view',
      'orders.view',
      'orders.edit',
      'orders.status',
      'inventory.view',
      'inventory.adjust',
      'inventory.consume',
      'purchases.view',
      'customers.view',
      'quotes.view',
      'quotes.edit',
      'quotes.approve',
      'quotes.convert',
      'reports.view'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'STAFF',
    name: 'Press Operator / Staff',
    description: 'Press floor operations, job status inspection, and receiving inventory',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'orders.view',
      'orders.status',
      'inventory.view',
      'purchases.view',
      'purchases.receive',
      'quotes.view'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'OPERATOR',
    name: 'Machine / Press Operator',
    description: 'Floor press operations, job status progression, and machine execution',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'orders.view',
      'orders.status',
      'inventory.view'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export interface DatabaseSchema {
  categories: Category[];
  services: ServiceItem[];
  products: Product[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  purchases: Purchase[];
  customers: Customer[];
  orders: Order[];
  quotes: QuoteRequest[];
  settings: BusinessSettings;
  roles: RoleDefinition[];
  users: User[];
  auditLogs: AuditLog[];
  media: MediaItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

class DatabaseManager {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDirectories();
    this.data = this.loadDatabase();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  private getDefaultData(): DatabaseSchema {
    const defaultPasswordHash = hashPassword('Printez@2026');
    const seededUsers = initialUsers.map(u => ({
      ...u,
      passwordHash: defaultPasswordHash,
      grantedPermissions: [],
      revokedPermissions: []
    }));

    return {
      categories: [...initialCategories],
      services: [...initialServices],
      products: [...initialProducts],
      inventory: [...initialInventory],
      stockMovements: [],
      suppliers: [...initialSuppliers],
      purchases: [],
      customers: [...initialCustomers],
      orders: [...initialOrders],
      quotes: [...initialQuotes],
      settings: { ...initialSettings },
      roles: [...defaultRoles],
      users: seededUsers,
      auditLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          user: 'System Boot',
          role: 'SUPER_ADMIN',
          action: 'INIT_DB',
          details: 'PrintezYour database initialized with authentic services and products'
        }
      ],
      media: []
    };
  }

  private loadDatabase(): DatabaseSchema {
    const defaults = this.getDefaultData();
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all top-level keys exist in case of schema evolution
        const defaultPasswordHash = hashPassword('Printez@2026');

        const existingRoles: RoleDefinition[] =
          parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0
            ? parsed.roles
            : [...defaultRoles];

        // Ensure all core system roles exist
        for (const sysRole of defaultRoles) {
          if (!existingRoles.some(r => r.id === sysRole.id)) {
            existingRoles.push(sysRole);
          }
        }

        const rawUsers: User[] = parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0
          ? parsed.users
          : defaults.users;

        const users: User[] = rawUsers
          .filter(u => u.id !== 'usr-2' && u.id !== 'usr-3' && u.email !== 'admin@printezyour.com' && u.email !== 'staff@printezyour.com')
          .map(u => ({
            ...u,
            username: u.username || (u.email === 'superadmin@printezyour.com' ? 'superadmin' : undefined),
            passwordHash: u.passwordHash || defaultPasswordHash,
            grantedPermissions: u.grantedPermissions || [],
            revokedPermissions: u.revokedPermissions || []
          }));

        // Ensure superadmin exists and is active
        const hasSuperAdmin = users.some(u => u.role === 'SUPER_ADMIN' && u.active);
        if (!hasSuperAdmin) {
          users.unshift({
            id: 'usr-1',
            name: 'Abhi Swami (Owner / Director)',
            email: 'superadmin@printezyour.com',
            username: 'superadmin',
            role: 'SUPER_ADMIN',
            phone: '+91 8557049897',
            passwordHash: defaultPasswordHash,
            active: true,
            grantedPermissions: [],
            revokedPermissions: [],
            createdAt: '2024-01-01T00:00:00Z'
          });
        }

        const schema: DatabaseSchema = {
          categories: parsed.categories || defaults.categories,
          services: parsed.services || defaults.services,
          products: parsed.products || defaults.products,
          inventory: parsed.inventory || defaults.inventory,
          stockMovements: parsed.stockMovements || defaults.stockMovements,
          suppliers: parsed.suppliers || defaults.suppliers,
          purchases: parsed.purchases || defaults.purchases,
          customers: parsed.customers || defaults.customers,
          orders: parsed.orders || defaults.orders,
          quotes: parsed.quotes || defaults.quotes,
          settings: parsed.settings || defaults.settings,
          roles: existingRoles,
          users,
          auditLogs: parsed.auditLogs || defaults.auditLogs,
          media: Array.isArray(parsed.media) ? parsed.media : []
        };
        this.saveImmediate(schema);
        return schema;
      }
    } catch (err) {
      console.error('Error reading database file, using defaults:', err);
    }
    this.saveImmediate(defaults);
    return defaults;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file atomically:', err);
    }
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveImmediate(this.data);
      this.isSaving = false;
    }, 50);
  }

  // --- Audit Logging ---
  public logAudit(
    user: string,
    role: string,
    action: string,
    details: string,
    meta?: {
      userId?: string;
      targetType?: string;
      targetId?: string;
      previousValue?: string;
      newValue?: string;
      ip?: string;
    }
  ) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details,
      userId: meta?.userId,
      targetType: meta?.targetType,
      targetId: meta?.targetId,
      previousValue: meta?.previousValue,
      newValue: meta?.newValue,
      ip: meta?.ip
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return log;
  }

  public getAuditLogs(limit = 200): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Services ---
  public getServices(): ServiceItem[] {
    return this.data.services.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getServiceBySlug(slug: string): ServiceItem | undefined {
    return this.data.services.find(s => s.slug === slug || s.id === slug);
  }

  public createService(item: Omit<ServiceItem, 'id'>): ServiceItem {
    const newService: ServiceItem = {
      ...item,
      id: `srv-${Date.now()}`
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.save();
    return this.data.services[idx];
  }

  public deleteService(id: string): boolean {
    const prev = this.data.services.length;
    this.data.services = this.data.services.filter(s => s.id !== id);
    if (this.data.services.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Products ---
  public getProducts(categorySlug?: string): Product[] {
    if (!categorySlug || categorySlug === 'all') {
      return this.data.products;
    }
    return this.data.products.filter(
      p => p.categoryId === categorySlug || p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );
  }

  public getProductBySlugOrId(identifier: string): Product | undefined {
    return this.data.products.find(p => p.slug === identifier || p.id === identifier);
  }

  public createProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      materialRequirements: productData.materialRequirements || [],
      stockMode: productData.stockMode || 'inventory_calculated',
      priceHistory: productData.priceHistory || [
        {
          id: `ph-${Date.now()}`,
          oldPrice: productData.basePrice,
          newPrice: productData.basePrice,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
          reason: 'Initial product release'
        }
      ],
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.products[idx];

    // Maintain price history audit trail if base rate changed
    if (updates.basePrice !== undefined && updates.basePrice !== existing.basePrice) {
      existing.priceHistory = existing.priceHistory || [];
      existing.priceHistory.unshift({
        id: `ph-${Date.now()}`,
        oldPrice: existing.basePrice,
        newPrice: updates.basePrice,
        changedBy: (updates as any).updatedBy || 'Admin',
        changedAt: new Date().toISOString(),
        reason: (updates as any).priceChangeReason || 'Catalog rate adjustment'
      });
    }

    this.data.products[idx] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): { success: boolean; archived: boolean; message: string } {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) {
      return { success: false, archived: false, message: 'Product not found' };
    }

    // Safety rule: check if product is referenced in historical orders
    const isReferencedInOrders = this.data.orders.some(o =>
      o.items.some(item => item.productId === id || item.productId === prod.slug)
    );

    if (isReferencedInOrders) {
      // Archive / Inactive rather than breaking historical orders
      prod.isActive = false;
      prod.isArchived = true;
      prod.updatedAt = new Date().toISOString();
      this.save();
      return {
        success: true,
        archived: true,
        message: `Product "${prod.name}" has historical customer orders. It has been securely archived and marked inactive to protect historical order records.`
      };
    }

    // Safe to permanently delete if no historical orders exist
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return {
      success: true,
      archived: false,
      message: `Product "${prod.name}" was permanently deleted.`
    };
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  }

  public createOrder(orderInput: {
    customer: Order['customer'];
    items: Order['items'];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryType: Order['deliveryType'];
    specialInstructions?: string;
    paymentMethod: Order['paymentMethod'];
  }): Order {
    // Generate unique PY-XXXXXX ID
    const randomSix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `PY-${randomSix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      customer: orderInput.customer,
      items: orderInput.items,
      subtotal: orderInput.subtotal,
      discountAmount: orderInput.discountAmount || 0,
      taxAmount: orderInput.taxAmount,
      deliveryFee: orderInput.deliveryFee || 0,
      totalAmount: orderInput.totalAmount,
      deliveryType: orderInput.deliveryType,
      specialInstructions: orderInput.specialInstructions || '',
      paymentStatus: orderInput.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Pending',
      paymentMethod: orderInput.paymentMethod,
      orderStatus: 'New',
      statusHistory: [
        {
          status: 'New',
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          updatedBy: 'Customer (Online)',
          notes: 'Order placed through online platform'
        }
      ],
      createdAt: now,
      updatedAt: now,
      whatsappNotified: false
    };

    this.data.orders.unshift(newOrder);

    // Auto-update or create customer record
    this.syncCustomerFromOrder(orderInput.customer, orderInput.totalAmount);

    this.save();
    return newOrder;
  }

  private syncCustomerFromOrder(c: Order['customer'], amount: number) {
    let existing = this.data.customers.find(
      cust => cust.mobile === c.mobile || cust.email === c.email
    );
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += amount;
      existing.lastOrderDate = new Date().toISOString().split('T')[0];
      if (c.company) existing.company = c.company;
      existing.address = c.deliveryAddress;
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: c.name,
        mobile: c.mobile,
        whatsapp: c.whatsapp || c.mobile,
        email: c.email,
        company: c.company,
        address: c.deliveryAddress,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
        totalOrders: 1,
        totalSpent: amount,
        pendingAmount: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      this.data.customers.push(newCust);
    }
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['orderStatus'],
    updatedBy: string,
    notes?: string
  ): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      updatedBy,
      notes: notes || `Status marked as ${status}`
    });

    // Lifecycle Raw Inventory Consumption:
    // When production starts ("In Production"), consume BOM raw materials
    if (status === 'In Production' && !order.inventoryDeducted) {
      for (const item of order.items) {
        const prod = this.data.products.find(
          p => p.id === item.productId || p.slug === item.productId
        );
        if (
          prod &&
          prod.materialRequirements &&
          prod.materialRequirements.length > 0 &&
          prod.stockMode !== 'quote_only'
        ) {
          for (const req of prod.materialRequirements) {
            const batchSize = req.forProductQuantity > 0 ? req.forProductQuantity : 1;
            const unitsNeeded = (item.quantity / batchSize) * req.quantityRequired;
            this.adjustInventoryStock(
              req.inventoryItemId,
              -unitsNeeded,
              'consumed',
              `Production consumed for Order ${order.id} (${item.productName}) - ${item.quantity} units`,
              updatedBy,
              order.id
            );
          }
        }
      }
      order.inventoryDeducted = true;
    }

    // If order is cancelled after production materials were deducted, restore inventory
    if ((status === 'Cancelled' || status === 'Rejected') && order.inventoryDeducted) {
      for (const item of order.items) {
        const prod = this.data.products.find(
          p => p.id === item.productId || p.slug === item.productId
        );
        if (
          prod &&
          prod.materialRequirements &&
          prod.materialRequirements.length > 0 &&
          prod.stockMode !== 'quote_only'
        ) {
          for (const req of prod.materialRequirements) {
            const batchSize = req.forProductQuantity > 0 ? req.forProductQuantity : 1;
            const unitsNeeded = (item.quantity / batchSize) * req.quantityRequired;
            this.adjustInventoryStock(
              req.inventoryItemId,
              unitsNeeded,
              'returned',
              `Stock restored: Order ${order.id} cancelled (${item.productName})`,
              updatedBy,
              order.id
            );
          }
        }
      }
      order.inventoryDeducted = false;
    }

    this.save();
    return order;
  }

  public updateOrderPayment(
    orderId: string,
    paymentStatus: Order['paymentStatus']
  ): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Quotations ---
  public getQuotes(): QuoteRequest[] {
    return [...this.data.quotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createQuote(input: Omit<QuoteRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): QuoteRequest {
    const randomFour = Math.floor(1000 + Math.random() * 9000);
    const id = `QR-${randomFour}`;
    const now = new Date().toISOString();
    const newQuote: QuoteRequest = {
      ...input,
      id,
      status: 'New',
      createdAt: now,
      updatedAt: now
    };
    this.data.quotes.unshift(newQuote);
    this.save();
    return newQuote;
  }

  public updateQuote(id: string, updates: Partial<QuoteRequest>): QuoteRequest | null {
    const quote = this.data.quotes.find(q => q.id === id);
    if (!quote) return null;
    Object.assign(quote, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return quote;
  }

  public convertQuoteToOrder(quoteId: string, finalPrice: number): Order | null {
    const quote = this.data.quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const order = this.createOrder({
      customer: {
        name: quote.customerName,
        mobile: quote.phone,
        whatsapp: quote.whatsapp || quote.phone,
        email: quote.email,
        company: quote.company,
        billingAddress: 'Address on file / Chandigarh',
        deliveryAddress: 'Address on file / Chandigarh',
        city: 'Chandigarh',
        state: 'Chandigarh',
        pincode: '160002'
      },
      items: [
        {
          id: `item-q-${Date.now()}`,
          productId: 'custom-quote',
          productName: `Custom Printing: ${quote.serviceCategory}`,
          category: quote.serviceCategory,
          image: quote.artworkUrl || '/images/services/offset-printing.jpg',
          quantity: quote.quantity || 1,
          unitPrice: finalPrice / (quote.quantity || 1),
          selectedOptions: [
            { groupName: 'Requirements', valueName: quote.productRequirement, priceModifier: 0 },
            ...(quote.sizeSpecs ? [{ groupName: 'Size Specs', valueName: quote.sizeSpecs, priceModifier: 0 }] : []),
            ...(quote.materialPreference ? [{ groupName: 'Material', valueName: quote.materialPreference, priceModifier: 0 }] : [])
          ],
          customNotes: quote.adminNotes,
          subtotal: finalPrice
        }
      ],
      subtotal: finalPrice,
      discountAmount: 0,
      taxAmount: Math.round(finalPrice * 0.18),
      deliveryFee: 0,
      totalAmount: Math.round(finalPrice * 1.18),
      deliveryType: 'Delivery',
      specialInstructions: `Converted from Quote ${quote.id}`,
      paymentMethod: 'UPI / QR Code'
    });

    quote.status = 'Converted to Order';
    quote.convertedOrderId = order.id;
    quote.quotedPrice = finalPrice;
    quote.updatedAt = new Date().toISOString();
    this.save();

    return order;
  }

  // --- Inventory & Stock ---
  public getInventory(): InventoryItem[] {
    return this.data.inventory;
  }

  public getStockMovements(itemId?: string): StockMovement[] {
    if (itemId) {
      return this.data.stockMovements.filter(m => m.itemId === itemId);
    }
    return this.data.stockMovements;
  }

  public adjustInventoryStock(
    itemId: string,
    quantityDelta: number,
    type: StockMovement['type'],
    reason: string,
    recordedBy: string,
    referenceId?: string
  ): InventoryItem | null {
    const item = this.data.inventory.find(i => i.id === itemId);
    if (!item) return null;

    const previousStock = item.currentStock;
    item.currentStock = Math.max(0, item.currentStock + quantityDelta);
    item.updatedAt = new Date().toISOString().split('T')[0];

    if (item.currentStock === 0) {
      item.status = 'Out of Stock';
    } else if (item.currentStock <= item.minStock) {
      item.status = 'Low Stock';
    } else {
      item.status = 'In Stock';
    }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId,
      type,
      quantity: quantityDelta,
      previousStock,
      newStock: item.currentStock,
      reason,
      referenceId,
      date: new Date().toISOString(),
      recordedBy
    };
    this.data.stockMovements.unshift(movement);
    this.save();
    return item;
  }

  public createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'updatedAt'>): InventoryItem {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.data.inventory.push(newItem);
    this.save();
    return newItem;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const item = this.data.inventory.find(i => i.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    this.save();
    return item;
  }

  // --- Suppliers & Purchases ---
  public getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  public createSupplier(supplierData: Omit<Supplier, 'id'>): Supplier {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`
    };
    this.data.suppliers.push(newSup);
    this.save();
    return newSup;
  }

  public getPurchases(): Purchase[] {
    return this.data.purchases;
  }

  public createPurchase(purchaseData: Omit<Purchase, 'id'>): Purchase {
    const randomFour = Math.floor(1000 + Math.random() * 9000);
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `PO-${randomFour}`
    };
    this.data.purchases.unshift(newPurchase);
    this.save();
    return newPurchase;
  }

  public receivePurchase(purchaseId: string, recordedBy: string): Purchase | null {
    const po = this.data.purchases.find(p => p.id === purchaseId);
    if (!po || po.status === 'Received') return null;

    po.status = 'Received';
    po.receivedAt = new Date().toISOString();

    // Auto-increment inventory stock for all items in the purchase order!
    for (const item of po.items) {
      this.adjustInventoryStock(
        item.itemId,
        item.quantity,
        'received',
        `Stock received from Purchase Order ${po.id}`,
        recordedBy,
        po.id
      );
    }

    this.save();
    return po;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  // --- Settings ---
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Roles & Permissions Management ---
  public getRoles(): RoleDefinition[] {
    return this.data.roles;
  }

  public getRoleById(id: string): RoleDefinition | undefined {
    return this.data.roles.find(r => r.id === id);
  }

  public createRole(
    roleData: { name: string; description: string; permissions: PermissionKey[] },
    actorUser = 'Super Admin'
  ): RoleDefinition {
    const slugId = `role-${roleData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newRole: RoleDefinition = {
      id: slugId,
      name: roleData.name.trim(),
      description: roleData.description.trim(),
      isSystem: false,
      permissions: roleData.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.roles.push(newRole);
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'ROLE_CREATED',
      `Created custom role "${newRole.name}" with ${newRole.permissions.length} permissions`,
      { targetType: 'Role', targetId: newRole.id }
    );
    this.save();
    return newRole;
  }

  public updateRole(
    id: string,
    updates: { name?: string; description?: string; permissions?: PermissionKey[] },
    actorUser = 'Super Admin'
  ): RoleDefinition | null {
    const roleIndex = this.data.roles.findIndex(r => r.id === id);
    if (roleIndex === -1) return null;

    const existing = this.data.roles[roleIndex];
    const prevPermsCount = existing.permissions.length;

    const updated: RoleDefinition = {
      ...existing,
      name: existing.isSystem ? existing.name : (updates.name ? updates.name.trim() : existing.name),
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      permissions: existing.id === 'SUPER_ADMIN' ? [...ALL_PERMISSIONS] : (updates.permissions || existing.permissions),
      updatedAt: new Date().toISOString()
    };

    this.data.roles[roleIndex] = updated;
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'ROLE_UPDATED',
      `Updated role "${updated.name}". Permissions: ${prevPermsCount} -> ${updated.permissions.length}`,
      { targetType: 'Role', targetId: id }
    );
    this.save();
    return updated;
  }

  public deleteRole(id: string, actorUser = 'Super Admin'): { success: boolean; message: string } {
    const role = this.data.roles.find(r => r.id === id);
    if (!role) return { success: false, message: 'Role not found' };
    if (role.isSystem) return { success: false, message: 'Core system roles cannot be deleted' };

    const assignedUsers = this.data.users.filter(u => u.role === id && u.active);
    if (assignedUsers.length > 0) {
      return {
        success: false,
        message: `Cannot delete role "${role.name}" because it is currently assigned to ${assignedUsers.length} active user(s). Reassign them first.`
      };
    }

    this.data.roles = this.data.roles.filter(r => r.id !== id);
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'ROLE_DELETED',
      `Deleted custom role "${role.name}" (${id})`,
      { targetType: 'Role', targetId: id }
    );
    this.save();
    return { success: true, message: `Role "${role.name}" deleted successfully` };
  }

  // --- Users & Access Management ---
  public getUsers(): User[] {
    return this.data.users.map(u => {
      const roleDef = this.data.roles.find(r => r.id === u.role);
      const effectivePermissions = computeEffectivePermissions(u, this.data.roles);
      const { passwordHash, ...rest } = u;
      return {
        ...rest,
        roleName: roleDef ? roleDef.name : u.role,
        effectivePermissions
      } as User;
    });
  }

  public getUserById(id: string): User | undefined {
    const u = this.data.users.find(user => user.id === id);
    if (!u) return undefined;
    const roleDef = this.data.roles.find(r => r.id === u.role);
    const effectivePermissions = computeEffectivePermissions(u, this.data.roles);
    const { passwordHash, ...rest } = u;
    return {
      ...rest,
      roleName: roleDef ? roleDef.name : u.role,
      effectivePermissions
    } as User;
  }

  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const trimmed = email.trim().toLowerCase();
    const u = this.data.users.find(
      user => user.email.toLowerCase() === trimmed ||
              (user.username && user.username.toLowerCase() === trimmed) ||
              (trimmed === 'superadmin' && user.role === 'SUPER_ADMIN')
    );
    if (!u) return undefined;
    const roleDef = this.data.roles.find(r => r.id === u.role);
    const effectivePermissions = computeEffectivePermissions(u, this.data.roles);
    return {
      ...u,
      roleName: roleDef ? roleDef.name : u.role,
      effectivePermissions
    };
  }

  public createUser(
    userData: {
      name: string;
      email: string;
      username?: string;
      password?: string;
      role: string;
      mobile?: string;
      phone?: string;
      employeeId?: string;
      department?: string;
      designation?: string;
      notes?: string;
      active?: boolean;
      grantedPermissions?: PermissionKey[];
      revokedPermissions?: PermissionKey[];
    },
    actorUser = 'Super Admin'
  ): { success: boolean; user?: User; message?: string } {
    const emailNorm = userData.email.trim().toLowerCase();
    const existing = this.data.users.find(u => u.email.toLowerCase() === emailNorm);
    if (existing) {
      return { success: false, message: 'A user with this email address already exists' };
    }

    const passwordHash = hashPassword(userData.password || 'Printez@2026');
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name.trim(),
      email: emailNorm,
      username: userData.username?.trim() || emailNorm.split('@')[0],
      role: userData.role || 'STAFF',
      mobile: userData.mobile || userData.phone || '',
      phone: userData.phone || userData.mobile || '',
      employeeId: userData.employeeId || '',
      department: userData.department || 'Operations',
      designation: userData.designation || 'Staff',
      notes: userData.notes || '',
      active: userData.active !== undefined ? userData.active : true,
      passwordHash,
      grantedPermissions: userData.grantedPermissions || [],
      revokedPermissions: userData.revokedPermissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'USER_CREATED',
      `Created user "${newUser.name}" (${newUser.email}) with role "${newUser.role}"`,
      { targetType: 'User', targetId: newUser.id }
    );
    this.save();

    const { passwordHash: _, ...safeUser } = newUser;
    const roleDef = this.data.roles.find(r => r.id === newUser.role);
    return {
      success: true,
      user: {
        ...safeUser,
        roleName: roleDef?.name || newUser.role,
        effectivePermissions: computeEffectivePermissions(newUser, this.data.roles)
      }
    };
  }

  public updateUser(
    id: string,
    updates: Partial<User>,
    actorUser = 'Super Admin'
  ): { success: boolean; user?: User; message?: string } {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    const targetUser = this.data.users[userIndex];

    if (targetUser.role === 'SUPER_ADMIN' && updates.role && updates.role !== 'SUPER_ADMIN') {
      const activeSuperAdmins = this.data.users.filter(u => u.role === 'SUPER_ADMIN' && u.active && u.id !== id);
      if (activeSuperAdmins.length === 0) {
        return { success: false, message: 'Cannot demote the last active Super Admin' };
      }
    }

    const updatedUser: User = {
      ...targetUser,
      name: updates.name !== undefined ? updates.name : targetUser.name,
      email: updates.email !== undefined ? updates.email.trim().toLowerCase() : targetUser.email,
      username: updates.username !== undefined ? updates.username : targetUser.username,
      role: updates.role !== undefined ? updates.role : targetUser.role,
      mobile: updates.mobile !== undefined ? updates.mobile : (updates.phone !== undefined ? updates.phone : targetUser.mobile),
      phone: updates.phone !== undefined ? updates.phone : (updates.mobile !== undefined ? updates.mobile : targetUser.phone),
      employeeId: updates.employeeId !== undefined ? updates.employeeId : targetUser.employeeId,
      department: updates.department !== undefined ? updates.department : targetUser.department,
      designation: updates.designation !== undefined ? updates.designation : targetUser.designation,
      notes: updates.notes !== undefined ? updates.notes : targetUser.notes,
      updatedAt: new Date().toISOString()
    };

    this.data.users[userIndex] = updatedUser;
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'USER_UPDATED',
      `Updated user profile for "${updatedUser.name}" (${updatedUser.id})`,
      { targetType: 'User', targetId: id }
    );
    this.save();

    const { passwordHash: _, ...safeUser } = updatedUser;
    const roleDef = this.data.roles.find(r => r.id === updatedUser.role);
    return {
      success: true,
      user: {
        ...safeUser,
        roleName: roleDef?.name || updatedUser.role,
        effectivePermissions: computeEffectivePermissions(updatedUser, this.data.roles)
      }
    };
  }

  public setUserPermissions(
    id: string,
    granted: PermissionKey[],
    revoked: PermissionKey[],
    actorUser = 'Super Admin'
  ): { success: boolean; user?: User; message?: string } {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    const targetUser = this.data.users[userIndex];
    if (targetUser.role === 'SUPER_ADMIN') {
      return { success: false, message: 'Super Admin holds full permissions unconditionally' };
    }

    targetUser.grantedPermissions = granted;
    targetUser.revokedPermissions = revoked;
    targetUser.updatedAt = new Date().toISOString();

    this.data.users[userIndex] = targetUser;
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'USER_PERMISSIONS_OVERRIDDEN',
      `Updated permissions for "${targetUser.name}": +${granted.length} extra, -${revoked.length} revoked`,
      { targetType: 'User', targetId: id }
    );
    this.save();

    const { passwordHash: _, ...safeUser } = targetUser;
    const roleDef = this.data.roles.find(r => r.id === targetUser.role);
    return {
      success: true,
      user: {
        ...safeUser,
        roleName: roleDef?.name || targetUser.role,
        effectivePermissions: computeEffectivePermissions(targetUser, this.data.roles)
      }
    };
  }

  public setUserStatus(
    id: string,
    active: boolean,
    actorUser = 'Super Admin'
  ): { success: boolean; message: string; user?: User } {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    const targetUser = this.data.users[userIndex];

    if (!active && targetUser.role === 'SUPER_ADMIN') {
      const activeSuperAdmins = this.data.users.filter(u => u.role === 'SUPER_ADMIN' && u.active && u.id !== id);
      if (activeSuperAdmins.length === 0) {
        return { success: false, message: 'Cannot deactivate the last active Super Admin' };
      }
    }

    targetUser.active = active;
    targetUser.updatedAt = new Date().toISOString();
    this.data.users[userIndex] = targetUser;

    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      `${active ? 'Activated' : 'Deactivated'} user "${targetUser.name}" (${id})`,
      { targetType: 'User', targetId: id }
    );
    this.save();

    const { passwordHash: _, ...safeUser } = targetUser;
    return {
      success: true,
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user: safeUser as User
    };
  }

  public resetUserPassword(
    id: string,
    newPassword: string,
    actorUser = 'Super Admin'
  ): { success: boolean; message: string } {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    const targetUser = this.data.users[userIndex];
    targetUser.passwordHash = hashPassword(newPassword);
    targetUser.updatedAt = new Date().toISOString();
    this.data.users[userIndex] = targetUser;

    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'PASSWORD_RESET',
      `Password reset for user "${targetUser.name}" (${id})`,
      { targetType: 'User', targetId: id }
    );
    this.save();
    return { success: true, message: `Password reset successfully for ${targetUser.name}` };
  }

  public changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User account not found' };

    const targetUser = this.data.users[userIndex];
    if (!verifyPassword(currentPassword, targetUser.passwordHash || '')) {
      return { success: false, message: 'Current password is incorrect' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long' };
    }

    targetUser.passwordHash = hashPassword(newPassword);
    targetUser.updatedAt = new Date().toISOString();
    this.data.users[userIndex] = targetUser;

    this.logAudit(
      targetUser.name,
      targetUser.role,
      'PASSWORD_CHANGED',
      `User "${targetUser.name}" changed their own password`,
      { targetType: 'User', targetId: targetUser.id }
    );
    this.save();
    return { success: true, message: 'Your password has been changed successfully' };
  }

  public deleteUser(id: string, actorUser = 'Super Admin'): { success: boolean; message: string } {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return { success: false, message: 'User not found' };

    const targetUser = this.data.users[userIndex];
    if (targetUser.role === 'SUPER_ADMIN') {
      const activeSuperAdmins = this.data.users.filter(u => u.role === 'SUPER_ADMIN' && u.active && u.id !== id);
      if (activeSuperAdmins.length === 0) {
        return { success: false, message: 'Cannot delete the last active Super Admin' };
      }
    }

    this.data.users.splice(userIndex, 1);
    this.logAudit(
      actorUser,
      'SUPER_ADMIN',
      'USER_DELETED',
      `Deleted user account "${targetUser.name}" (${id})`,
      { targetType: 'User', targetId: id }
    );
    this.save();
    return { success: true, message: `User "${targetUser.name}" deleted successfully` };
  }

  // --- Analytics & Reports ---
  public getDashboardMetrics() {
    const orders = this.data.orders;
    const quotes = this.data.quotes;
    const inventory = this.data.inventory;

    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.orderStatus === 'New').length;
    const inProduction = orders.filter(o => o.orderStatus === 'In Production' || o.orderStatus === 'Artwork Approved').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled' || o.orderStatus === 'Rejected').length;

    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Rejected')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingPayments = orders
      .filter(o => o.paymentStatus === 'Pending')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
    const activeQuotes = quotes.filter(q => q.status === 'New' || q.status === 'Under Review').length;

    // Daily Sales (Last 7 days)
    const dailySalesMap: { [date: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      dailySalesMap[str] = 0;
    }
    orders.forEach(o => {
      const dStr = o.createdAt.split('T')[0];
      if (dailySalesMap[dStr] !== undefined && o.orderStatus !== 'Cancelled') {
        dailySalesMap[dStr] += o.totalAmount;
      }
    });

    const salesChart = Object.keys(dailySalesMap).map(date => ({
      date: date.substring(5), // MM-DD
      sales: dailySalesMap[date]
    }));

    return {
      totalOrders,
      newOrders,
      inProduction,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      pendingPayments,
      totalCustomers: this.data.customers.length,
      lowStockItems,
      activeQuotes,
      salesChart,
      recentOrders: orders.slice(0, 5)
    };
  }

  // --- Media Showcase & Asset Management ---
  public getMedia(section?: string, activeOnly?: boolean): MediaItem[] {
    let list = this.data.media || [];
    if (section) {
      list = list.filter(m => m.section === section);
    }
    if (activeOnly) {
      list = list.filter(m => m.active);
    }
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getMediaById(id: string): MediaItem | undefined {
    return (this.data.media || []).find(m => m.id === id);
  }

  public createMediaItem(itemData: Partial<MediaItem>, actor: string = 'Admin'): MediaItem {
    if (!this.data.media) this.data.media = [];
    const maxOrder = this.data.media.reduce((max, m) => Math.max(max, m.displayOrder || 0), 0);
    const now = new Date().toISOString();
    const newItem: MediaItem = {
      id: itemData.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: itemData.title || 'Showcase Media',
      url: itemData.url || '',
      thumbnailUrl: itemData.thumbnailUrl || itemData.url || '',
      type: itemData.type || (itemData.url?.match(/\.(mp4|webm)$/i) ? 'video' : 'image'),
      mimeType: itemData.mimeType || (itemData.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      fileSize: itemData.fileSize || 0,
      width: itemData.width,
      height: itemData.height,
      duration: itemData.duration,
      section: itemData.section || 'home_showcase',
      active: itemData.active !== undefined ? itemData.active : true,
      displayOrder: itemData.displayOrder !== undefined ? itemData.displayOrder : maxOrder + 1,
      caption: itemData.caption || '',
      uploadedBy: actor,
      createdAt: now,
      updatedAt: now
    };

    this.data.media.push(newItem);
    this.logAudit(actor, 'ADMIN', 'UPLOAD_MEDIA', `Uploaded ${newItem.type} showcase item: ${newItem.title}`, {
      targetType: 'MediaItem',
      targetId: newItem.id
    });
    this.saveImmediate(this.data);
    return newItem;
  }

  public updateMediaItem(id: string, updates: Partial<MediaItem>, actor: string = 'Admin'): MediaItem | null {
    if (!this.data.media) this.data.media = [];
    const idx = this.data.media.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const oldItem = this.data.media[idx];
    const updated: MediaItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.media[idx] = updated;

    let action = 'UPDATE_MEDIA';
    let detail = `Updated media item: ${updated.title}`;
    if (updates.active !== undefined && updates.active !== oldItem.active) {
      action = updates.active ? 'ACTIVATE_MEDIA' : 'DEACTIVATE_MEDIA';
      detail = `${updates.active ? 'Activated' : 'Deactivated'} showcase media item: ${updated.title}`;
    }
    this.logAudit(actor, 'ADMIN', action, detail, {
      targetType: 'MediaItem',
      targetId: id
    });
    this.saveImmediate(this.data);
    return updated;
  }

  public deleteMediaItem(id: string, actor: string = 'Admin'): { success: boolean; message: string } {
    if (!this.data.media) this.data.media = [];
    const item = this.data.media.find(m => m.id === id);
    if (!item) {
      return { success: false, message: 'Media item not found' };
    }

    this.data.media = this.data.media.filter(m => m.id !== id);
    this.data.media
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach((m, idx) => {
        m.displayOrder = idx + 1;
      });

    this.logAudit(actor, 'ADMIN', 'DELETE_MEDIA', `Deleted ${item.type} showcase item: ${item.title}`, {
      targetType: 'MediaItem',
      targetId: id
    });
    this.saveImmediate(this.data);
    return { success: true, message: 'Media deleted successfully' };
  }

  public reorderMedia(orderedIds: string[], actor: string = 'Admin'): MediaItem[] {
    if (!this.data.media) this.data.media = [];
    orderedIds.forEach((id, index) => {
      const item = this.data.media.find(m => m.id === id);
      if (item) {
        item.displayOrder = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });

    this.logAudit(actor, 'ADMIN', 'REORDER_MEDIA', `Reordered showcase media (${orderedIds.length} items)`, {
      targetType: 'MediaItem'
    });
    this.saveImmediate(this.data);
    return this.getMedia('home_showcase');
  }

  public replaceMediaFile(
    id: string,
    newFile: { url: string; mimeType: string; fileSize: number; type: 'image' | 'video' },
    actor: string = 'Admin'
  ): MediaItem | null {
    if (!this.data.media) this.data.media = [];
    const item = this.data.media.find(m => m.id === id);
    if (!item) return null;

    const oldUrl = item.url;
    item.url = newFile.url;
    item.thumbnailUrl = newFile.url;
    item.mimeType = newFile.mimeType;
    item.fileSize = newFile.fileSize;
    item.type = newFile.type;
    item.updatedAt = new Date().toISOString();

    this.logAudit(actor, 'ADMIN', 'REPLACE_MEDIA_FILE', `Replaced asset file for showcase item: ${item.title}`, {
      targetType: 'MediaItem',
      targetId: id,
      previousValue: oldUrl,
      newValue: newFile.url
    });
    this.saveImmediate(this.data);
    return item;
  }

  public updateProductMedia(
    productId: string,
    action: 'set_primary' | 'add_gallery' | 'remove_image' | 'reorder_gallery' | 'replace_image',
    payload: {
      imageUrl?: string;
      imageUrls?: string[];
      oldImageUrl?: string;
      newImageUrl?: string;
      images?: string[];
    },
    actor: string = 'Admin'
  ): Product | null {
    const prod = this.getProductBySlugOrId(productId);
    if (!prod) return null;

    let images = Array.isArray(prod.images) ? [...prod.images] : [];
    if (images.length === 0 && prod.image) {
      images = [prod.image];
    }

    let detail = '';

    switch (action) {
      case 'set_primary': {
        const targetImg = payload.imageUrl || '';
        if (targetImg) {
          images = [targetImg, ...images.filter(img => img !== targetImg)];
          prod.image = targetImg;
          prod.images = images;
          detail = `Set primary image for product: ${prod.name}`;
        }
        break;
      }
      case 'add_gallery': {
        const toAdd = payload.imageUrls || (payload.imageUrl ? [payload.imageUrl] : []);
        toAdd.forEach(img => {
          if (img && !images.includes(img)) {
            images.push(img);
          }
        });
        if (!prod.image && images.length > 0) {
          prod.image = images[0];
        }
        prod.images = images;
        detail = `Added ${toAdd.length} gallery image(s) to product: ${prod.name}`;
        break;
      }
      case 'remove_image': {
        const toRemove = payload.imageUrl || '';
        images = images.filter(img => img !== toRemove);
        if (prod.image === toRemove) {
          prod.image = images[0] || '';
        }
        prod.images = images;
        detail = `Removed image from product: ${prod.name}`;
        break;
      }
      case 'reorder_gallery': {
        if (Array.isArray(payload.images) && payload.images.length > 0) {
          prod.images = payload.images;
          prod.image = payload.images[0] || prod.image;
          detail = `Reordered gallery images for product: ${prod.name}`;
        }
        break;
      }
      case 'replace_image': {
        const { oldImageUrl, newImageUrl } = payload;
        if (newImageUrl) {
          if (oldImageUrl) {
            images = images.map(img => (img === oldImageUrl ? newImageUrl : img));
            if (!images.includes(newImageUrl)) {
              images.unshift(newImageUrl);
            }
          } else {
            images = [newImageUrl, ...images.filter(img => img !== newImageUrl)];
          }
          if (prod.image === oldImageUrl || !prod.image) {
            prod.image = newImageUrl;
          }
          prod.images = images;
          detail = `Replaced image for product: ${prod.name}`;
        }
        break;
      }
    }

    prod.updatedAt = new Date().toISOString();
    this.logAudit(actor, 'ADMIN', 'UPDATE_PRODUCT_MEDIA', detail || `Updated media for product: ${prod.name}`, {
      targetType: 'Product',
      targetId: prod.id
    });
    this.saveImmediate(this.data);
    return prod;
  }
}

export const db = new DatabaseManager();

import {
  Category,
  ServiceItem,
  Product,
  Order,
  QuoteRequest,
  InventoryItem,
  Supplier,
  Purchase,
  Customer,
  BusinessSettings,
  User,
  UserRole,
  RoleDefinition,
  PermissionKey,
  AuditLog
} from '../types';

let currentAuthToken: string = '';
try {
  currentAuthToken = localStorage.getItem('printezyour_admin_token') || '';
} catch (e) {
  currentAuthToken = '';
}

export const setAuthToken = (token: string) => {
  currentAuthToken = token || '';
  try {
    if (token) {
      localStorage.setItem('printezyour_admin_token', token);
    } else {
      localStorage.removeItem('printezyour_admin_token');
    }
  } catch (e) {
    // Ignore storage issues
  }
};

export const getAuthToken = () => currentAuthToken;

const getHeaders = (_role?: UserRole): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
};

export const api = {
  // --- Auth ---
  async login(email: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(err.error || 'Authentication failed');
    }
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data as { success: boolean; user: User; token: string };
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders()
      });
    } finally {
      setAuthToken('');
    }
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  },

  // --- Users Access Management ---
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users', {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch users');
    }
    return res.json();
  },

  async createUser(userData: any): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  async updateUser(id: string, updates: any): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update user');
    }
    return res.json();
  },

  async setUserPermissions(id: string, grantedPermissions: PermissionKey[], revokedPermissions: PermissionKey[]): Promise<User> {
    const res = await fetch(`/api/users/${id}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ grantedPermissions, revokedPermissions })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to set user permissions');
    }
    return res.json();
  },

  async setUserStatus(id: string, active: boolean): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await fetch(`/api/users/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ active })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change user status');
    }
    return res.json();
  },

  async resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset password');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user');
    }
    return res.json();
  },

  // --- Roles & Permissions Management ---
  async getRoles(): Promise<RoleDefinition[]> {
    const res = await fetch('/api/roles', {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch roles');
    }
    return res.json();
  },

  async getPermissions(): Promise<PermissionKey[]> {
    const res = await fetch('/api/permissions');
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
  },

  async createRole(roleData: { name: string; description: string; permissions: PermissionKey[] }): Promise<RoleDefinition> {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create role');
    }
    return res.json();
  },

  async updateRole(id: string, roleData: { name?: string; description?: string; permissions?: PermissionKey[] }): Promise<RoleDefinition> {
    const res = await fetch(`/api/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roleData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update role');
    }
    return res.json();
  },

  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete role');
    }
    return res.json();
  },

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs', {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch audit logs');
    }
    return res.json();
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Omit<Category, 'id'>, role?: UserRole): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>, role?: UserRole): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCategory(id: string, role?: UserRole): Promise<{ success: boolean }> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(role)
    });
    return res.json();
  },

  // --- Services ---
  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async getService(slug: string): Promise<ServiceItem> {
    const res = await fetch(`/api/services/${slug}`);
    if (!res.ok) throw new Error('Service not found');
    return res.json();
  },

  async createService(srv: Omit<ServiceItem, 'id'>, role?: UserRole): Promise<ServiceItem> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(srv)
    });
    return res.json();
  },

  async updateService(id: string, updates: Partial<ServiceItem>, role?: UserRole): Promise<ServiceItem> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async updateServiceImage(id: string, imageUrl: string, role?: UserRole): Promise<ServiceItem> {
    const res = await fetch(`/api/services/${id}/image`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ imageUrl })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update service photo');
    }
    return res.json();
  },

  // --- Products ---
  async getProducts(category?: string): Promise<Product[]> {
    const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(slugOrId: string): Promise<Product> {
    const res = await fetch(`/api/products/${slugOrId}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(prod: Omit<Product, 'id'>, role?: UserRole): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(prod)
    });
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>, role?: UserRole): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async updateProductImage(id: string, imageUrl: string, role?: UserRole): Promise<Product> {
    const res = await fetch(`/api/products/${id}/image`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ imageUrl })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product photo');
    }
    return res.json();
  },

  async deleteProduct(id: string, role?: UserRole): Promise<{ success: boolean; archived?: boolean; message?: string }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(role)
    });
    return res.json();
  },

  // --- Orders ---
  async getOrders(role?: UserRole): Promise<Order[]> {
    const res = await fetch('/api/orders', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async trackOrder(orderId: string, phone?: string): Promise<Order> {
    const res = await fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, phone })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Tracking failed');
    }
    return res.json();
  },

  async createOrder(orderData: any): Promise<{ order: Order; whatsapp: any }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['orderStatus'],
    notes?: string,
    updatedBy?: string,
    role?: UserRole
  ): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ status, notes, updatedBy })
    });
    return res.json();
  },

  async updateOrderPayment(
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    role?: UserRole
  ): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ paymentStatus })
    });
    return res.json();
  },

  // --- Quotes ---
  async getQuotes(role?: UserRole): Promise<QuoteRequest[]> {
    const res = await fetch('/api/quotes', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load quotes');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async submitQuote(quoteData: any): Promise<QuoteRequest> {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    return res.json();
  },

  async updateQuote(id: string, updates: Partial<QuoteRequest>, role?: UserRole): Promise<QuoteRequest> {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async convertQuoteToOrder(id: string, finalPrice: number, role?: UserRole): Promise<Order> {
    const res = await fetch(`/api/quotes/${id}/convert`, {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify({ finalPrice })
    });
    return res.json();
  },

  // --- Inventory ---
  async getInventory(role?: UserRole): Promise<InventoryItem[]> {
    const res = await fetch('/api/inventory', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load inventory');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async adjustStock(
    itemId: string,
    quantityDelta: number,
    type: string,
    reason: string,
    recordedBy: string,
    referenceId?: string,
    role?: UserRole
  ): Promise<InventoryItem> {
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify({ itemId, quantityDelta, type, reason, recordedBy, referenceId })
    });
    return res.json();
  },

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'updatedAt'>, role?: UserRole): Promise<InventoryItem> {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(item)
    });
    return res.json();
  },

  // --- Suppliers & Purchases ---
  async getSuppliers(role?: UserRole): Promise<Supplier[]> {
    const res = await fetch('/api/suppliers', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load suppliers');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createSupplier(sup: Omit<Supplier, 'id'>, role?: UserRole): Promise<Supplier> {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(sup)
    });
    return res.json();
  },

  async getPurchases(role?: UserRole): Promise<Purchase[]> {
    const res = await fetch('/api/purchases', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load purchases');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createPurchase(purchase: Omit<Purchase, 'id'>, role?: UserRole): Promise<Purchase> {
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(purchase)
    });
    return res.json();
  },

  async receivePurchase(id: string, recordedBy: string, role?: UserRole): Promise<Purchase> {
    const res = await fetch(`/api/purchases/${id}/receive`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ recordedBy })
    });
    return res.json();
  },

  // --- Customers ---
  async getCustomers(role?: UserRole): Promise<Customer[]> {
    const res = await fetch('/api/customers', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load customers');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  // --- Dashboard Metrics ---
  async getDashboardMetrics(role?: UserRole) {
    const res = await fetch('/api/reports/dashboard', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  // --- Settings ---
  async getSettings(): Promise<BusinessSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>, role?: UserRole): Promise<BusinessSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // --- Aliases & Administrative Helpers ---
  async getAdminDashboardMetrics(role?: UserRole) {
    return this.getDashboardMetrics(role);
  },

  async getAdminOrders(role?: UserRole): Promise<Order[]> {
    return this.getOrders(role);
  },

  async getAdminQuotes(role?: UserRole): Promise<QuoteRequest[]> {
    return this.getQuotes(role);
  },

  async getPurchaseOrders(role?: UserRole): Promise<Purchase[]> {
    return this.getPurchases(role);
  },

  async adjustInventory(
    itemId: string,
    quantityDelta: number,
    reason: string,
    recordedBy: string,
    notes?: string,
    role?: UserRole
  ): Promise<InventoryItem> {
    const type = quantityDelta >= 0 ? 'received' : 'consumed';
    return this.adjustStock(itemId, quantityDelta, type, reason, recordedBy, notes, role);
  },

  async createPurchaseOrder(
    purchaseData: {
      supplierName: string;
      items: any[];
      totalAmount: number;
      notes?: string;
    },
    role?: UserRole
  ): Promise<Purchase> {
    const payload = {
      supplierId: 'sup-direct',
      supplierName: purchaseData.supplierName,
      items: purchaseData.items.map(i => ({
        itemId: i.inventoryItemId || i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        tax: 0,
        total: i.quantity * i.unitPrice
      })),
      subtotal: purchaseData.totalAmount,
      tax: 0,
      totalAmount: purchaseData.totalAmount,
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'Pending' as const,
      status: 'Ordered' as const,
      notes: purchaseData.notes
    };
    return this.createPurchase(payload, role);
  },

  async receivePurchaseOrder(id: string, role?: UserRole): Promise<Purchase> {
    return this.receivePurchase(id, 'Admin', role);
  },

  // --- Artwork File Upload ---
  async uploadArtwork(file: File): Promise<{
    name: string;
    filename: string;
    size: number;
    mimetype: string;
    url: string;
  }> {
    const formData = new FormData();
    formData.append('artwork', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'File upload failed');
    }
    const data = await res.json();
    return data.file;
  },

  // --- Environment & Site Configuration ---
  async getConfig(): Promise<{
    publicSiteUrl: string;
    adminSiteUrl: string;
    isProduction: boolean;
    isCustomDomainConfigured: boolean;
  }> {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) {
        throw new Error('Failed to fetch site config');
      }
      return await res.json();
    } catch {
      // Return safe defaults in case of transient failure
      return {
        publicSiteUrl: window.location?.origin || 'http://localhost:3000',
        adminSiteUrl: `${window.location?.origin || 'http://localhost:3000'}/#/admin`,
        isProduction: false,
        isCustomDomainConfigured: false
      };
    }
  }
};

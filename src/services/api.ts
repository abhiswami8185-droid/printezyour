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
import { getPublicSiteUrl, getAdminSiteUrl } from '../config/site';

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

export const getCustomApiUrl = (): string => {
  try {
    return localStorage.getItem('printezyour_backend_url') || '';
  } catch {
    return '';
  }
};

export const setCustomApiUrl = (url: string) => {
  try {
    if (url) {
      localStorage.setItem('printezyour_backend_url', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('printezyour_backend_url');
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Returns the currently active backend API base URL for diagnostics and UI display.
 */
export const getActiveApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.endsWith('.run.app') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return window.location.origin;
    }
  }

  const customUrl = getCustomApiUrl();
  if (customUrl) {
    return customUrl;
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed && !trimmed.includes('example.com')) {
      return trimmed;
    }
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.endsWith('.github.io')) {
      return 'https://printezyour.ai.studio';
    }
  }

  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
};

/**
 * Resolves the backend API URL.
 * If running in full-stack dev/preview/monolith (same container as Express),
 * always resolves to the clean relative endpoint '/api/...' on the same origin.
 * If running in decoupled mode (e.g. GitHub Pages static hosting),
 * routes to the designated production backend URL (with custom override support).
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : ('/' + endpoint);

  // 1. Browser runtime check: if inside AI Studio preview or local dev (Express + Vite monolith),
  // always use relative paths so requests hit the local Express backend on the same origin.
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.endsWith('.run.app') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return cleanEndpoint;
    }
  }

  // 2. Custom runtime override set by user in localStorage
  const customUrl = getCustomApiUrl();
  if (customUrl) {
    return customUrl + cleanEndpoint;
  }

  // 3. Build-time environment variable VITE_API_URL
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed && !trimmed.includes('example.com')) {
      return trimmed + cleanEndpoint;
    }
  }

  // 4. Decoupled static hosting on GitHub Pages fallback
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.endsWith('.github.io')) {
      return 'https://printezyour.ai.studio' + cleanEndpoint;
    }
  }

  return cleanEndpoint;
};

type SessionExpiredHandler = (message: string) => void;
const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

export const onSessionExpired = (handler: SessionExpiredHandler) => {
  sessionExpiredHandlers.add(handler);
  return () => {
    sessionExpiredHandlers.delete(handler);
  };
};

export const triggerSessionExpired = (message: string = 'Your admin session expired due to inactivity. Please log in again.') => {
  sessionExpiredHandlers.forEach(handler => {
    try {
      handler(message);
    } catch {
      // ignore
    }
  });
};

const apiFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  const resolvedUrl = getApiUrl(url);
  const cleanEndpoint = url.startsWith('/') ? url : ('/' + url);

  try {
    const res = await fetch(resolvedUrl, init);

    // Check for session expiration on authenticated endpoints
    if (res.status === 401 && !cleanEndpoint.includes('/api/auth/login')) {
      try {
        const cloned = res.clone();
        const data = await cloned.json();
        if (data && data.code === 'SESSION_EXPIRED') {
          triggerSessionExpired(data.error || 'Your admin session expired due to inactivity. Please log in again.');
        }
      } catch {
        // ignore json parse error
      }
    }

    // If an external endpoint returns 5xx server error, try fallback to relative (only if not static host)
    if (!res.ok && resolvedUrl !== cleanEndpoint && res.status >= 500) {
      const isStaticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
      if (!isStaticHost) {
        try {
          const fallbackRes = await fetch(cleanEndpoint, init);
          if (fallbackRes.ok) return fallbackRes;
        } catch {
          // use original res
        }
      }
    }
    return res;
  } catch (err) {
    // If external fetch threw a network error (e.g. Failed to fetch, DNS failure, CORS failure),
    // and resolvedUrl was not the relative endpoint, fallback immediately to the same-origin relative path only if not static host.
    if (resolvedUrl !== cleanEndpoint) {
      const isStaticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io');
      if (!isStaticHost) {
        try {
          const fallbackRes = await fetch(cleanEndpoint, init);
          return fallbackRes;
        } catch {
          // throw original error if relative also fails
        }
      }
    }
    throw err;
  }
};

export const api = {
  // --- Auth ---
  async login(email: string, password?: string) {
    const resolvedUrl = getApiUrl('/api/auth/login');
    let res: Response;
    try {
      res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (networkErr: any) {
      throw new Error(`Unable to reach backend server at ${resolvedUrl}. Please check your connection or backend server status.`);
    }

    if (!res.ok) {
      let errorMsg = 'Authentication failed';
      try {
        const err = await res.json();
        if (err && err.error) {
          errorMsg = err.error;
        }
      } catch {
        if (res.status === 405) {
          errorMsg = `Endpoint returned HTTP 405 Method Not Allowed. The static host at ${window.location.origin} does not support backend API routes. Please configure VITE_API_URL with your live backend server.`;
        } else if (res.status === 404) {
          errorMsg = `Backend endpoint /api/auth/login not found on ${resolvedUrl}.`;
        } else {
          errorMsg = `Authentication server error (HTTP ${res.status})`;
        }
      }
      throw new Error(errorMsg);
    }
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data as { success: boolean; user: User; token: string; expiresAt?: number; timeoutMinutes?: number };
  },

  async extendSession(): Promise<{ success: boolean; expiresAt?: number; user?: User }> {
    const res = await apiFetch('/api/auth/extend-session', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to extend session');
    }
    return res.json();
  },

  async logout(reason: 'USER_LOGOUT' | 'SESSION_EXPIRED' = 'USER_LOGOUT') {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason })
      });
    } finally {
      setAuthToken('');
    }
  },

  async getMe(): Promise<{ user: User; expiresAt?: number }> {
    const res = await apiFetch('/api/auth/me', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch('/api/auth/change-password', {
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
    const res = await apiFetch('/api/users', {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch users');
    }
    return res.json();
  },

  async createUser(userData: any): Promise<User> {
    const res = await apiFetch('/api/users', {
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
    const res = await apiFetch(`/api/users/${id}`, {
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
    const res = await apiFetch(`/api/users/${id}/permissions`, {
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
    const res = await apiFetch(`/api/users/${id}/status`, {
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
    const res = await apiFetch(`/api/users/${id}/reset-password`, {
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
    const res = await apiFetch(`/api/users/${id}`, {
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
    const res = await apiFetch('/api/roles', {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch roles');
    }
    return res.json();
  },

  async getPermissions(): Promise<PermissionKey[]> {
    const res = await apiFetch('/api/permissions');
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
  },

  async createRole(roleData: { name: string; description: string; permissions: PermissionKey[] }): Promise<RoleDefinition> {
    const res = await apiFetch('/api/roles', {
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
    const res = await apiFetch(`/api/roles/${id}`, {
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
    const res = await apiFetch(`/api/roles/${id}`, {
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
    const res = await apiFetch('/api/audit-logs', {
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
    const res = await apiFetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Omit<Category, 'id'>, role?: UserRole): Promise<Category> {
    const res = await apiFetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>, role?: UserRole): Promise<Category> {
    const res = await apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCategory(id: string, role?: UserRole): Promise<{ success: boolean }> {
    const res = await apiFetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(role)
    });
    return res.json();
  },

  // --- Services ---
  async getServices(): Promise<ServiceItem[]> {
    const res = await apiFetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async getService(slug: string): Promise<ServiceItem> {
    const res = await apiFetch(`/api/services/${slug}`);
    if (!res.ok) throw new Error('Service not found');
    return res.json();
  },

  async createService(srv: Omit<ServiceItem, 'id'>, role?: UserRole): Promise<ServiceItem> {
    const res = await apiFetch('/api/services', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(srv)
    });
    return res.json();
  },

  async updateService(id: string, updates: Partial<ServiceItem>, role?: UserRole): Promise<ServiceItem> {
    const res = await apiFetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async updateServiceImage(id: string, imageUrl: string, role?: UserRole): Promise<ServiceItem> {
    const res = await apiFetch(`/api/services/${id}/image`, {
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
    const res = await apiFetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(slugOrId: string): Promise<Product> {
    const res = await apiFetch(`/api/products/${slugOrId}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(prod: Omit<Product, 'id'>, role?: UserRole): Promise<Product> {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(prod)
    });
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>, role?: UserRole): Promise<Product> {
    const res = await apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async updateProductImage(id: string, imageUrl: string, role?: UserRole): Promise<Product> {
    const res = await apiFetch(`/api/products/${id}/image`, {
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
    const res = await apiFetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(role)
    });
    return res.json();
  },

  // --- Orders ---
  async getOrders(role?: UserRole): Promise<Order[]> {
    const res = await apiFetch('/api/orders', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getOrder(id: string): Promise<Order> {
    const res = await apiFetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async trackOrder(orderId: string, phone?: string): Promise<Order> {
    const res = await apiFetch('/api/orders/track', {
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
    const res = await apiFetch('/api/orders', {
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
    const res = await apiFetch(`/api/orders/${orderId}/status`, {
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
    const res = await apiFetch(`/api/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ paymentStatus })
    });
    return res.json();
  },

  // --- Quotes ---
  async getQuotes(role?: UserRole): Promise<QuoteRequest[]> {
    const res = await apiFetch('/api/quotes', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load quotes');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async submitQuote(quoteData: any): Promise<QuoteRequest> {
    const res = await apiFetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    return res.json();
  },

  async updateQuote(id: string, updates: Partial<QuoteRequest>, role?: UserRole): Promise<QuoteRequest> {
    const res = await apiFetch(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async convertQuoteToOrder(id: string, finalPrice: number, role?: UserRole): Promise<Order> {
    const res = await apiFetch(`/api/quotes/${id}/convert`, {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify({ finalPrice })
    });
    return res.json();
  },

  // --- Inventory ---
  async getInventory(role?: UserRole): Promise<InventoryItem[]> {
    const res = await apiFetch('/api/inventory', { headers: getHeaders(role) });
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
    const res = await apiFetch('/api/inventory/adjust', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify({ itemId, quantityDelta, type, reason, recordedBy, referenceId })
    });
    return res.json();
  },

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'updatedAt'>, role?: UserRole): Promise<InventoryItem> {
    const res = await apiFetch('/api/inventory', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(item)
    });
    return res.json();
  },

  // --- Suppliers & Purchases ---
  async getSuppliers(role?: UserRole): Promise<Supplier[]> {
    const res = await apiFetch('/api/suppliers', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load suppliers');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createSupplier(sup: Omit<Supplier, 'id'>, role?: UserRole): Promise<Supplier> {
    const res = await apiFetch('/api/suppliers', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(sup)
    });
    return res.json();
  },

  async getPurchases(role?: UserRole): Promise<Purchase[]> {
    const res = await apiFetch('/api/purchases', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load purchases');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async createPurchase(purchase: Omit<Purchase, 'id'>, role?: UserRole): Promise<Purchase> {
    const res = await apiFetch('/api/purchases', {
      method: 'POST',
      headers: getHeaders(role),
      body: JSON.stringify(purchase)
    });
    return res.json();
  },

  async receivePurchase(id: string, recordedBy: string, role?: UserRole): Promise<Purchase> {
    const res = await apiFetch(`/api/purchases/${id}/receive`, {
      method: 'PUT',
      headers: getHeaders(role),
      body: JSON.stringify({ recordedBy })
    });
    return res.json();
  },

  // --- Customers ---
  async getCustomers(role?: UserRole): Promise<Customer[]> {
    const res = await apiFetch('/api/customers', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load customers');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  // --- Dashboard Metrics ---
  async getDashboardMetrics(role?: UserRole) {
    const res = await apiFetch('/api/reports/dashboard', { headers: getHeaders(role) });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  // --- Settings ---
  async getSettings(): Promise<BusinessSettings> {
    const res = await apiFetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>, role?: UserRole): Promise<BusinessSettings> {
    const res = await apiFetch('/api/settings', {
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
    const res = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'File upload failed');
    }
    const data = await res.json();
    return {
      ...data.file,
      url: getApiUrl(data.file.url)
    };
  },

  // --- Environment & Site Configuration ---
  async getConfig(): Promise<{
    publicSiteUrl: string;
    adminSiteUrl: string;
    isProduction: boolean;
    isCustomDomainConfigured: boolean;
  }> {
    try {
      const res = await apiFetch('/api/config');
      if (!res.ok) {
        throw new Error('Failed to fetch site config');
      }
      return await res.json();
    } catch {
      // Return safe defaults using site configuration helpers in case of transient failure
      return {
        publicSiteUrl: getPublicSiteUrl(),
        adminSiteUrl: getAdminSiteUrl(),
        isProduction: false,
        isCustomDomainConfigured: false
      };
    }
  }
};

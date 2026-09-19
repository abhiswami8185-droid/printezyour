import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { whatsapp } from '../whatsapp';
import { PermissionKey, User } from '../../src/types';
import {
  generateToken,
  validateSessionToken,
  revokeSessionToken,
  verifyPassword,
  ALL_PERMISSIONS
} from '../auth';
import { getSiteConfig } from '../config/site';

export const apiRouter = express.Router();

// Public system site configuration endpoint (resolves safe dev defaults or production domains)
apiRouter.get('/config', (req, res) => {
  res.json(getSiteConfig(req));
});

// Configure Multer for Artwork Uploads
const uploadDir = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.ai', '.psd', '.cdr', '.eps', '.zip', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Please upload PDF, AI, PSD, CDR, ZIP, PNG, WebP, or JPG.`));
    }
  }
});

// ----------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------

// Extend Express Request type with authUser
export interface AuthenticatedRequest extends express.Request {
  authUser?: User & { isSuperAdmin: boolean };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.headers['x-admin-token'] as string | undefined)?.trim();

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  const userId = validateSessionToken(token);
  if (!userId) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }

  const user = db.getUserById(userId);
  if (!user) {
    res.status(401).json({ error: 'User account not found' });
    return;
  }

  if (!user.active) {
    res.status(403).json({ error: 'Account has been deactivated. Please contact your system administrator.' });
    return;
  }

  req.authUser = {
    ...user,
    isSuperAdmin: user.role === 'SUPER_ADMIN' || user.role.toLowerCase() === 'owner'
  };
  next();
};

export const requirePermission = (permission: PermissionKey) => {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    // Ensure authenticated first
    if (!req.authUser) {
      authenticateToken(req, res, () => {
        verifyUserPermission(req, res, next, permission);
      });
      return;
    }
    verifyUserPermission(req, res, next, permission);
  };
};

function verifyUserPermission(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
  permission: PermissionKey
) {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  // Super Admin / Owner has unrestricted access
  if (user.isSuperAdmin || user.role === 'SUPER_ADMIN') {
    return next();
  }

  const effective = user.effectivePermissions || [];
  if (effective.includes(permission)) {
    return next();
  }

  res.status(403).json({
    error: `Access denied. Your role or permissions do not permit '${permission}'`,
    requiredPermission: permission
  });
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email/Username and password are required' });
    return;
  }

  const user = db.getUserByEmail(email.trim());
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
    return;
  }

  if (!user.active) {
    res.status(403).json({ error: 'This user account is currently deactivated. Contact the system administrator.' });
    return;
  }

  const isMatch = verifyPassword(password, user.passwordHash || '');

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials. Password does not match our records.' });
    return;
  }

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;

  db.logAudit(
    user.name,
    user.role,
    'LOGIN',
    `Authenticated to administrative console from ${req.ip || 'web'}`,
    { userId: user.id, targetType: 'User', targetId: user.id, ip: req.ip }
  );

  res.json({
    success: true,
    token,
    user: safeUser
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.authUser
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.headers['x-admin-token'] as string | undefined)?.trim();
  if (token) {
    revokeSessionToken(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.post('/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }
  const result = db.changeUserPassword(user.id, currentPassword, newPassword);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

// ----------------------------------------------------
// USERS MANAGEMENT ROUTES
// ----------------------------------------------------

apiRouter.get('/users', requirePermission('users.view'), (_req, res) => {
  res.json(db.getUsers());
});

apiRouter.post('/users', requirePermission('users.create'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.createUser(req.body, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.status(201).json(result.user);
});

apiRouter.put('/users/:id', requirePermission('users.edit'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.updateUser(req.params.id, req.body, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result.user);
});

apiRouter.put('/users/:id/permissions', requirePermission('roles.permissions'), (req: AuthenticatedRequest, res) => {
  const { grantedPermissions, revokedPermissions } = req.body;
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.setUserPermissions(
    req.params.id,
    grantedPermissions || [],
    revokedPermissions || [],
    actor
  );
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result.user);
});

apiRouter.put('/users/:id/status', requirePermission('users.activate'), (req: AuthenticatedRequest, res) => {
  const { active } = req.body;
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.setUserStatus(req.params.id, Boolean(active), actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

apiRouter.post('/users/:id/reset-password', requirePermission('users.edit'), (req: AuthenticatedRequest, res) => {
  const { newPassword } = req.body;
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.resetUserPassword(req.params.id, newPassword, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

apiRouter.delete('/users/:id', requirePermission('users.delete'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.deleteUser(req.params.id, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

// ----------------------------------------------------
// ROLES & PERMISSIONS MANAGEMENT ROUTES
// ----------------------------------------------------

apiRouter.get('/roles', requirePermission('roles.view'), (_req, res) => {
  res.json(db.getRoles());
});

apiRouter.get('/permissions', requirePermission('roles.view'), (_req, res) => {
  res.json(ALL_PERMISSIONS);
});

apiRouter.post('/roles', requirePermission('roles.create'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const newRole = db.createRole(req.body, actor);
  res.status(201).json(newRole);
});

apiRouter.put('/roles/:id', requirePermission('roles.edit'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const updated = db.updateRole(req.params.id, req.body, actor);
  if (!updated) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/roles/:id', requirePermission('roles.delete'), (req: AuthenticatedRequest, res) => {
  const actor = req.authUser?.name || 'Super Admin';
  const result = db.deleteRole(req.params.id, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }
  res.json(result);
});

// ----------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------

apiRouter.get('/audit-logs', requirePermission('audit.view'), (_req, res) => {
  res.json(db.getAuditLogs());
});

// ----------------------------------------------------
// PUBLIC & STOREFRONT ENDPOINTS: CATEGORIES & SERVICES
// ----------------------------------------------------

apiRouter.get('/categories', (_req, res) => {
  res.json(db.getCategories());
});

apiRouter.post('/categories', requirePermission('products.create'), (req: AuthenticatedRequest, res) => {
  const cat = db.createCategory(req.body);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'CREATE_CATEGORY', `Created category: ${cat.name}`);
  res.status(201).json(cat);
});

apiRouter.put('/categories/:id', requirePermission('products.edit'), (req: AuthenticatedRequest, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'UPDATE_CATEGORY', `Updated category: ${updated.name}`);
  res.json(updated);
});

apiRouter.delete('/categories/:id', requirePermission('products.delete'), (_req, res) => {
  const success = db.deleteCategory(_req.params.id);
  res.json({ success });
});

apiRouter.get('/services', (_req, res) => {
  res.json(db.getServices());
});

apiRouter.get('/services/:slug', (req, res) => {
  const srv = db.getServiceBySlug(req.params.slug);
  if (!srv) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(srv);
});

apiRouter.post('/services', requirePermission('content.edit'), (req: AuthenticatedRequest, res) => {
  const srv = db.createService(req.body);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'CREATE_SERVICE', `Created service: ${srv.name}`);
  res.status(201).json(srv);
});

apiRouter.put('/services/:id', requirePermission('content.edit'), (req, res) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(updated);
});

apiRouter.put('/services/:id/image', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.authUser;
  if (!user || (!user.isSuperAdmin && !user.effectivePermissions?.includes('products.edit') && !user.effectivePermissions?.includes('content.edit'))) {
    res.status(403).json({ error: 'Permission denied: requires products.edit or content.edit' });
    return;
  }
  const { imageUrl } = req.body;
  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required' });
    return;
  }
  const updated = db.updateService(req.params.id, {
    imageUrl,
    image: imageUrl
  });
  if (!updated) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'UPDATE_SERVICE_IMAGE', `Updated image for service: ${updated.name}`);
  res.json(updated);
});

// ----------------------------------------------------
// PRODUCTS (PUBLIC READ + SECURED ADMIN WRITE)
// ----------------------------------------------------

apiRouter.get('/products', (req, res) => {
  const category = req.query.category as string;
  res.json(db.getProducts(category));
});

apiRouter.get('/products/:slugOrId', (req, res) => {
  const prod = db.getProductBySlugOrId(req.params.slugOrId);
  if (!prod) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(prod);
});

apiRouter.post('/products', requirePermission('products.create'), (req: AuthenticatedRequest, res) => {
  const prod = db.createProduct(req.body);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'CREATE_PRODUCT', `Created product: ${prod.name}`);
  res.status(201).json(prod);
});

apiRouter.put('/products/:id', requirePermission('products.edit'), (req: AuthenticatedRequest, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'UPDATE_PRODUCT', `Updated product: ${updated.name}`);
  res.json(updated);
});

apiRouter.put('/products/:id/image', requirePermission('products.edit'), (req: AuthenticatedRequest, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required' });
    return;
  }
  const prod = db.getProductBySlugOrId(req.params.id);
  if (!prod) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  const existingImages = Array.isArray(prod.images) ? [...prod.images] : [];
  const updatedImages = [imageUrl, ...existingImages.filter(img => img !== imageUrl)];
  const updated = db.updateProduct(prod.id, {
    images: updatedImages,
    image: imageUrl,
    updatedAt: new Date().toISOString()
  });
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'UPDATE_PRODUCT_IMAGE', `Updated image for product: ${prod.name}`);
  res.json(updated);
});

apiRouter.delete('/products/:id', requirePermission('products.delete'), (req: AuthenticatedRequest, res) => {
  const result = db.deleteProduct(req.params.id);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'SUPER_ADMIN', 'DELETE_PRODUCT', result.message);
  res.json(result);
});

// ----------------------------------------------------
// ORDERS (PUBLIC CREATION & TRACKING + SECURED ADMIN VIEW/STATUS)
// ----------------------------------------------------

apiRouter.get('/orders', requirePermission('orders.view'), (_req, res) => {
  res.json(db.getOrders());
});

apiRouter.get('/orders/:id', requirePermission('orders.view'), (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

// Public Track Order endpoint (verifies phone or order id)
apiRouter.post('/orders/track', (req, res) => {
  const { orderId, phone } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }
  const order = db.getOrderById(orderId);
  if (!order) {
    res.status(404).json({ error: 'No order found with this Order ID' });
    return;
  }

  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanOrderPhone = order.customer.mobile.replace(/[^0-9]/g, '');
    if (!cleanOrderPhone.includes(cleanPhone) && !cleanPhone.includes(cleanOrderPhone)) {
      res.status(401).json({ error: 'Phone number does not match order records' });
      return;
    }
  }

  res.json(order);
});

// Public Place Order endpoint (Customer)
apiRouter.post('/orders', async (req, res) => {
  try {
    const newOrder = db.createOrder(req.body);

    // Prepare WhatsApp Notification
    const waResult = await whatsapp.notifyOrder(newOrder);

    db.logAudit('Customer', 'PUBLIC', 'ORDER_PLACED', `New order ${newOrder.id} placed for ₹${newOrder.totalAmount}`, {
      targetType: 'Order',
      targetId: newOrder.id
    });

    res.status(201).json({
      order: newOrder,
      whatsapp: waResult
    });
  } catch (err: any) {
    console.error('Failed to create order:', err);
    res.status(500).json({ error: err.message || 'Could not process order' });
  }
});

apiRouter.put('/orders/:id/status', requirePermission('orders.status'), (req: AuthenticatedRequest, res) => {
  const { status, notes, updatedBy } = req.body;
  const actor = updatedBy || req.authUser?.name || 'Staff';
  const updated = db.updateOrderStatus(
    req.params.id,
    status,
    actor,
    notes
  );
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  db.logAudit(actor, req.authUser?.role || 'STAFF', 'ORDER_STATUS_CHANGE', `Order ${updated.id} status changed to ${status}`, {
    targetType: 'Order',
    targetId: updated.id,
    newValue: status
  });
  res.json(updated);
});

apiRouter.put('/orders/:id/payment', requirePermission('orders.edit'), (req: AuthenticatedRequest, res) => {
  const { paymentStatus } = req.body;
  const updated = db.updateOrderPayment(req.params.id, paymentStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'PAYMENT_STATUS_CHANGE', `Order ${updated.id} payment updated to ${paymentStatus}`, {
    targetType: 'Order',
    targetId: updated.id,
    newValue: paymentStatus
  });
  res.json(updated);
});

// ----------------------------------------------------
// QUOTATIONS
// ----------------------------------------------------

apiRouter.get('/quotes', requirePermission('quotes.view'), (_req, res) => {
  res.json(db.getQuotes());
});

// Public Quote Request endpoint
apiRouter.post('/quotes', (req, res) => {
  const quote = db.createQuote(req.body);
  db.logAudit('Customer', 'PUBLIC', 'QUOTE_REQUESTED', `New quote request ${quote.id} from ${quote.customerName}`, {
    targetType: 'Quote',
    targetId: quote.id
  });
  res.status(201).json(quote);
});

apiRouter.put('/quotes/:id', requirePermission('quotes.edit'), (req, res) => {
  const updated = db.updateQuote(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Quote not found' });
    return;
  }
  res.json(updated);
});

apiRouter.post('/quotes/:id/convert', requirePermission('quotes.convert'), (req: AuthenticatedRequest, res) => {
  const { finalPrice } = req.body;
  const order = db.convertQuoteToOrder(req.params.id, Number(finalPrice) || 0);
  if (!order) {
    res.status(404).json({ error: 'Quote not found or could not convert' });
    return;
  }
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'QUOTE_CONVERTED', `Quote ${req.params.id} converted into Order ${order.id}`, {
    targetType: 'Order',
    targetId: order.id
  });
  res.json(order);
});

// ----------------------------------------------------
// INVENTORY & STOCK
// ----------------------------------------------------

apiRouter.get('/inventory', requirePermission('inventory.view'), (_req, res) => {
  res.json(db.getInventory());
});

apiRouter.get('/inventory/movements', requirePermission('inventory.view'), (req, res) => {
  const itemId = req.query.itemId as string;
  res.json(db.getStockMovements(itemId));
});

apiRouter.post('/inventory/adjust', requirePermission('inventory.adjust'), (req: AuthenticatedRequest, res) => {
  const { itemId, quantityDelta, type, reason, recordedBy, referenceId } = req.body;
  const actor = recordedBy || req.authUser?.name || 'Admin';
  const updated = db.adjustInventoryStock(
    itemId,
    Number(quantityDelta),
    type,
    reason,
    actor,
    referenceId
  );
  if (!updated) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  db.logAudit(actor, req.authUser?.role || 'STAFF', 'STOCK_ADJUSTMENT', `Item ${updated.name} adjusted by ${quantityDelta} (${type})`, {
    targetType: 'InventoryItem',
    targetId: itemId
  });
  res.json(updated);
});

apiRouter.post('/inventory', requirePermission('inventory.create'), (req: AuthenticatedRequest, res) => {
  const item = db.createInventoryItem(req.body);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'CREATE_INVENTORY_ITEM', `New raw material: ${item.name}`, {
    targetType: 'InventoryItem',
    targetId: item.id
  });
  res.status(201).json(item);
});

apiRouter.put('/inventory/:id', requirePermission('inventory.edit'), (req, res) => {
  const updated = db.updateInventoryItem(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json(updated);
});

// ----------------------------------------------------
// SUPPLIERS & PURCHASES
// ----------------------------------------------------

apiRouter.get('/suppliers', requirePermission('purchases.view'), (_req, res) => {
  res.json(db.getSuppliers());
});

apiRouter.post('/suppliers', requirePermission('purchases.create'), (req, res) => {
  const sup = db.createSupplier(req.body);
  res.status(201).json(sup);
});

apiRouter.get('/purchases', requirePermission('purchases.view'), (_req, res) => {
  res.json(db.getPurchases());
});

apiRouter.post('/purchases', requirePermission('purchases.create'), (req: AuthenticatedRequest, res) => {
  const po = db.createPurchase(req.body);
  db.logAudit(req.authUser?.name || 'Admin', req.authUser?.role || 'ADMIN', 'CREATE_PURCHASE_ORDER', `Created PO ${po.id} for ₹${po.totalAmount}`, {
    targetType: 'PurchaseOrder',
    targetId: po.id
  });
  res.status(201).json(po);
});

apiRouter.put('/purchases/:id/receive', requirePermission('purchases.receive'), (req: AuthenticatedRequest, res) => {
  const { recordedBy } = req.body;
  const actor = recordedBy || req.authUser?.name || 'Staff';
  const po = db.receivePurchase(req.params.id, actor);
  if (!po) {
    res.status(404).json({ error: 'Purchase order not found or already received' });
    return;
  }
  db.logAudit(actor, req.authUser?.role || 'STAFF', 'RECEIVE_PURCHASE_ORDER', `PO ${po.id} marked received & stock updated`, {
    targetType: 'PurchaseOrder',
    targetId: po.id
  });
  res.json(po);
});

// ----------------------------------------------------
// CUSTOMERS CRM
// ----------------------------------------------------

apiRouter.get('/customers', requirePermission('customers.view'), (_req, res) => {
  res.json(db.getCustomers());
});

// ----------------------------------------------------
// REPORTS & DASHBOARD
// ----------------------------------------------------

apiRouter.get('/reports/dashboard', requirePermission('reports.view'), (_req, res) => {
  res.json(db.getDashboardMetrics());
});

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------

apiRouter.get('/settings', (_req, res) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', requirePermission('settings.edit'), (req: AuthenticatedRequest, res) => {
  const updated = db.updateSettings(req.body);
  db.logAudit(req.authUser?.name || 'Super Admin', req.authUser?.role || 'SUPER_ADMIN', 'UPDATE_SETTINGS', 'Business settings updated');
  res.json(updated);
});

// ----------------------------------------------------
// FILE / ARTWORK UPLOAD
// ----------------------------------------------------

apiRouter.post('/upload', upload.single('artwork'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded' });
    return;
  }

  const fileUrl = `/api/uploads/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    }
  });
});

// Serve uploaded artwork securely
apiRouter.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found');
    return;
  }
  res.sendFile(filePath);
});

// WhatsApp trigger helper
apiRouter.get('/whatsapp/order-link/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const formatted = whatsapp.formatOrderMessage(order);
  const link = whatsapp.getWaMeLink('918557049897', formatted);
  res.json({ link, formatted });
});

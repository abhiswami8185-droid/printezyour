import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Package,
  Layers,
  FileSpreadsheet,
  Users,
  Settings,
  ArrowLeft,
  Shield,
  Clock,
  Printer,
  Menu,
  X,
  UserCheck,
  Activity,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getAssetUrl } from '../../utils/assets';
import {
  Order,
  QuoteRequest,
  Product,
  ServiceItem,
  InventoryItem,
  PurchaseOrder,
  Customer,
  Category,
  BusinessSettings,
  UserRole,
  PermissionKey
} from '../../types';

import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminQuotes } from './AdminQuotes';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminPurchases } from './AdminPurchases';
import { AdminCustomers } from './AdminCustomers';
import { AdminSettings } from './AdminSettings';
import { AdminUsers } from './AdminUsers';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminLogin } from '../../components/AdminLogin';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import { KeyRound } from 'lucide-react';

interface AdminLayoutProps {
  onExitAdmin: () => void;
  initialTab?: string;
  targetOrderId?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onExitAdmin,
  initialTab = 'dashboard',
  targetOrderId
}) => {
  const { user, role, roleName, isAuthenticated, isLoading, hasPermission, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(initialTab);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(targetOrderId);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Synchronize initialTab with permission verification
  useEffect(() => {
    if (initialTab && initialTab !== 'dashboard') {
      const tabPermissionMap: Record<string, PermissionKey> = {
        orders: 'orders.view',
        quotes: 'quotes.view',
        products: 'products.view',
        inventory: 'inventory.view',
        purchases: 'purchases.view',
        customers: 'customers.view',
        users: 'users.view',
        audit: 'audit.view',
        settings: 'settings.view'
      };

      const requiredPerm = tabPermissionMap[initialTab];
      if (requiredPerm && !hasPermission(requiredPerm)) {
        setCurrentTab('dashboard');
      } else {
        setCurrentTab(initialTab);
      }
    }
  }, [initialTab, hasPermission]);

  // Enterprise state
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllAdminData = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const userRole = role as UserRole;
      const [
        dashMetrics,
        allOrders,
        allQuotes,
        allProducts,
        allServices,
        allInv,
        allPO,
        allCust,
        allCats,
        bizSettings
      ] = await Promise.all([
        api.getAdminDashboardMetrics(userRole).catch(() => null),
        api.getAdminOrders(userRole).catch(() => []),
        api.getAdminQuotes(userRole).catch(() => []),
        api.getProducts().catch(() => []),
        api.getServices().catch(() => []),
        api.getInventory(userRole).catch(() => []),
        api.getPurchaseOrders(userRole).catch(() => []),
        api.getCustomers(userRole).catch(() => []),
        api.getCategories().catch(() => []),
        api.getSettings().catch(() => null)
      ]);

      if (dashMetrics) setMetrics(dashMetrics);
      setOrders(Array.isArray(allOrders) ? allOrders : []);
      setQuotes(Array.isArray(allQuotes) ? allQuotes : []);
      setProducts(Array.isArray(allProducts) ? allProducts : []);
      setServices(Array.isArray(allServices) ? allServices : []);
      setInventory(Array.isArray(allInv) ? allInv : []);
      setPurchases(Array.isArray(allPO) ? allPO : []);
      setCustomers(Array.isArray(allCust) ? allCust : []);
      setCategories(Array.isArray(allCats) ? allCats : []);
      if (bizSettings) setSettings(bizSettings);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAllAdminData();
    }
  }, [isAuthenticated, user, role]);

  const handleNavigateTab = (tab: string, param?: string) => {
    setCurrentTab(tab);
    if (tab === 'orders' && param) {
      setSelectedOrderId(param);
    }
    setMobileNavOpen(false);
  };

  // Dynamically filter navigation items according to effective user permissions
  const navItems = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeQuotes = Array.isArray(quotes) ? quotes : [];
    const safeInventory = Array.isArray(inventory) ? inventory : [];

    const items = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        show: true
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: <ShoppingBag className="w-4 h-4" />,
        badge: safeOrders.filter(o => o.orderStatus === 'New').length || undefined,
        show: hasPermission('orders.view')
      },
      {
        id: 'quotes',
        label: 'Quotations',
        icon: <FileText className="w-4 h-4" />,
        badge: safeQuotes.filter(q => q.status === 'New').length || undefined,
        show: hasPermission('quotes.view')
      },
      {
        id: 'products',
        label: 'Products & Services',
        icon: <Package className="w-4 h-4" />,
        show: hasPermission('products.view')
      },
      {
        id: 'inventory',
        label: 'Raw Inventory',
        icon: <Layers className="w-4 h-4" />,
        badge: safeInventory.filter(i => i.currentStock <= i.minimumThreshold).length || undefined,
        badgeColor: 'bg-amber-500',
        show: hasPermission('inventory.view')
      },
      {
        id: 'purchases',
        label: 'Purchase Orders',
        icon: <FileSpreadsheet className="w-4 h-4" />,
        show: hasPermission('purchases.view')
      },
      {
        id: 'customers',
        label: 'Customer CRM',
        icon: <Users className="w-4 h-4" />,
        show: hasPermission('customers.view')
      },
      {
        id: 'users',
        label: 'Staff & Roles',
        icon: <UserCheck className="w-4 h-4" />,
        show: hasPermission('users.view')
      },
      {
        id: 'audit',
        label: 'Security Audit',
        icon: <Activity className="w-4 h-4" />,
        show: hasPermission('audit.view')
      },
      {
        id: 'settings',
        label: 'Settings & Tax',
        icon: <Settings className="w-4 h-4" />,
        show: hasPermission('settings.view')
      }
    ];

    return items.filter(item => item.show);
  }, [orders, quotes, inventory, hasPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400">Verifying secure administrative session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AdminLogin onSuccess={fetchAllAdminData} onExit={onExitAdmin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-md flex items-center w-full">
            <img
              src={getAssetUrl('/logo.png')}
              alt="Printezyour - Press Admin"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getAssetUrl('/logo.svg');
              }}
            />
          </div>
        </div>

        {/* Current Active User Profile Card */}
        <div className="p-3 mx-3 mt-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-cyan-300 truncate">{roleName || role}</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigateTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                      item.badgeColor || 'bg-pink-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Exit Storefront Button */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Change Password</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <Printer className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Hallo Majra Plant #1</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-600 font-medium">Heidelberg Speedmaster 4-Color Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Authenticated user session info */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800">{user?.name}</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                {roleName || role}
              </span>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Password</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="lg:hidden text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Exit
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="bg-slate-900 text-white w-64 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="font-bold text-xs text-cyan-400">PRINTEZYOUR ADMIN</div>
                <button onClick={() => setMobileNavOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigateTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                      currentTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Loading administration console...
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <AdminDashboard metrics={metrics} onNavigateTab={handleNavigateTab} />
              )}
              {currentTab === 'orders' && hasPermission('orders.view') && (
                <AdminOrders
                  orders={orders}
                  settings={settings}
                  onOrderUpdated={fetchAllAdminData}
                  selectedOrderId={selectedOrderId}
                />
              )}
              {currentTab === 'quotes' && hasPermission('quotes.view') && (
                <AdminQuotes
                  quotes={quotes}
                  onQuoteUpdated={fetchAllAdminData}
                  onNavigateTab={handleNavigateTab}
                />
              )}
              {currentTab === 'products' && hasPermission('products.view') && (
                <AdminProducts
                  products={products}
                  services={services}
                  inventory={inventory}
                  categories={categories}
                  orders={orders}
                  onProductsUpdated={fetchAllAdminData}
                  onServicesUpdated={fetchAllAdminData}
                  onInventoryUpdated={fetchAllAdminData}
                  onNavigateTab={handleNavigateTab}
                />
              )}
              {currentTab === 'inventory' && hasPermission('inventory.view') && (
                <AdminInventory inventory={inventory} onInventoryUpdated={fetchAllAdminData} />
              )}
              {currentTab === 'purchases' && hasPermission('purchases.view') && (
                <AdminPurchases
                  purchases={purchases}
                  inventory={inventory}
                  onPurchasesUpdated={fetchAllAdminData}
                />
              )}
              {currentTab === 'customers' && hasPermission('customers.view') && (
                <AdminCustomers customers={customers} onNavigateTab={handleNavigateTab} />
              )}
              {currentTab === 'users' && hasPermission('users.view') && (
                <AdminUsers />
              )}
              {currentTab === 'audit' && hasPermission('audit.view') && (
                <AdminAuditLogs />
              )}
              {currentTab === 'settings' && hasPermission('settings.view') && (
                <AdminSettings settings={settings} onSettingsUpdated={fetchAllAdminData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

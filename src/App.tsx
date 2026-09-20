import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { CartDrawer } from './components/CartDrawer';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminLayout } from './pages/admin/AdminLayout';

import { api } from './services/api';
import { Product, Category, ServiceItem, BusinessSettings, Order } from './types';
import {
  isCurrentlyAdminDomain,
  navigateToAdmin,
  navigateToStorefront
} from './config/site';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // App data loaded from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Confirmed order data
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedWhatsApp, setConfirmedWhatsApp] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setInitError(null);
    try {
      const [prodsRes, srvsRes, setsRes, catsRes] = await Promise.allSettled([
        api.getProducts(),
        api.getServices(),
        api.getSettings(),
        api.getCategories()
      ]);

      let hasAnySuccess = false;

      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value);
        hasAnySuccess = true;
      }
      if (srvsRes.status === 'fulfilled' && Array.isArray(srvsRes.value)) {
        setServices(srvsRes.value);
        hasAnySuccess = true;
      }
      if (setsRes.status === 'fulfilled' && setsRes.value) {
        setSettings(setsRes.value);
        hasAnySuccess = true;
      }
      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)) {
        setCategories(catsRes.value);
        hasAnySuccess = true;
      }

      if (!hasAnySuccess) {
        const firstError = [prodsRes, srvsRes, setsRes, catsRes].find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
        const msg = firstError?.reason?.message || 'Unable to connect to store server';
        setInitError(msg);
      }
    } catch (err: any) {
      console.error('Error initializing store data:', err);
      setInitError(err?.message || 'Failed to initialize store data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if the current page was loaded directly on an admin domain/subdomain or /admin pathname
    const checkAdminRoute = () => {
      if (isCurrentlyAdminDomain()) {
        setCurrentView('admin');
        return true;
      }
      if (typeof window !== 'undefined' && window.location) {
        const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
        let pathname = window.location.pathname.replace(/\/+$/, '');
        if (base && base !== '.' && base !== './' && pathname.startsWith(base)) {
          pathname = pathname.substring(base.length);
        }
        if (pathname === '/admin' || pathname.startsWith('/admin/')) {
          const parts = pathname.split('/');
          setCurrentView('admin');
          if (parts[2]) {
            setViewParam(parts[2]);
          }
          return true;
        }
      }
      return false;
    };

    // Check hash URL for direct linking
    const handleHash = () => {
      if (checkAdminRoute()) return;
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const parts = hash.split('/');
        const v = parts[0];
        const p = parts[1];
        if (['home', 'products', 'product', 'services', 'quote', 'checkout', 'track', 'about', 'contact', 'policies', 'admin'].includes(v)) {
          if (v === 'product') {
            setCurrentView('product-detail');
            setViewParam(p);
          } else {
            setCurrentView(v);
            setViewParam(p);
          }
        }
      } else {
        setCurrentView('home');
        setViewParam(undefined);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'admin') {
      navigateToAdmin(() => {
        setCurrentView('admin');
        setViewParam(param);
        window.location.hash = param ? `#/admin/${param}` : '#/admin';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    setCurrentView(view);
    setViewParam(param);

    // Update hash for deep link
    if (view === 'product-detail' && param) {
      window.location.hash = `#/product/${param}`;
    } else if (param) {
      window.location.hash = `#/${view}/${param}`;
    } else {
      window.location.hash = `#/${view}`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order, whatsappData: any) => {
    setConfirmedOrder(order);
    setConfirmedWhatsApp(whatsappData);
    handleNavigate('order-confirmed');
  };

  // If viewing admin system, render dedicated AdminLayout
  if (currentView === 'admin') {
    return (
      <AuthProvider>
        <AdminLayout
          onExitAdmin={() => navigateToStorefront(() => handleNavigate('home'))}
          initialTab={viewParam || 'dashboard'}
        />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
          {/* Top Banner / Announcement */}
          <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 text-center border-b border-slate-800">
            <span className="font-semibold text-cyan-400">PrintezYour Chandigarh</span> — Commercial Heidelberg Offset & Roland Large Format Presses · GST Invoicing & Tricity Doorstep Delivery
          </div>

          {/* Navigation Header */}
          <Header
            categories={categories}
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenCart={() => setCartDrawerOpen(true)}
          />

          {/* Main View Container */}
          <main className="flex-1">
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Connecting to PrintezYour press server...</p>
              </div>
            ) : initError && products.length === 0 ? (
              <div className="max-w-md mx-auto my-16 p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h3 className="text-lg font-bold text-slate-800">Connection to Store Engine</h3>
                <p className="text-xs text-slate-600">
                  {initError}
                </p>
                <button
                  onClick={() => loadData()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                {currentView === 'home' && (
                  <HomePage
                    products={products}
                    categories={categories}
                    services={services}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'products' && (
                  <ProductsPage
                    products={products}
                    categories={categories}
                    initialCategory={viewParam}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'product-detail' && viewParam && (
                  <ProductDetailPage
                    product={products.find(p => p.slug === viewParam || p.id === viewParam)}
                    productSlug={viewParam}
                    onNavigate={handleNavigate}
                    onOpenCart={() => setCartDrawerOpen(true)}
                  />
                )}

                {currentView === 'services' && (
                  <ServicesPage
                    services={services}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'quote' && (
                  <QuoteRequestPage onNavigate={handleNavigate} />
                )}

                {currentView === 'checkout' && (
                  <CheckoutPage
                    onOrderSuccess={handleOrderSuccess}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'order-confirmed' && confirmedOrder && (
                  <OrderConfirmationPage
                    order={confirmedOrder}
                    whatsappData={confirmedWhatsApp}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'track' && (
                  <TrackOrderPage
                    initialOrderId={viewParam}
                    onNavigate={handleNavigate}
                  />
                )}

                {currentView === 'about' && (
                  <AboutPage onNavigate={handleNavigate} />
                )}

                {currentView === 'contact' && (
                  <ContactPage />
                )}

                {currentView === 'policies' && (
                  <PoliciesPage
                    initialPolicy={viewParam}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            )}
          </main>

          {/* Site Footer */}
          <Footer categories={categories} onNavigate={handleNavigate} />

          {/* Interactive Floating WhatsApp Button */}
          <WhatsAppFloating />

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={cartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
            onCheckout={() => {
              setCartDrawerOpen(false);
              handleNavigate('checkout');
            }}
            onBrowse={() => {
              setCartDrawerOpen(false);
              handleNavigate('products');
            }}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

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

const AdminLayout = React.lazy(() =>
  import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout }))
);

import { api } from './services/api';
import { Product, Category, ServiceItem, BusinessSettings, Order } from './types';
import {
  isCurrentlyAdminDomain,
  navigateToAdmin,
  navigateToStorefront
} from './config/site';
import {
  fallbackCategories,
  fallbackServices,
  fallbackProducts,
  fallbackSettings
} from './data/fallbackData';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // App data initialized with safe storefront fallback catalog so public pages and navigation are immediately usable
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [services, setServices] = useState<ServiceItem[]>(fallbackServices);
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings);
  const [loading, setLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [apiNoticeDismissed, setApiNoticeDismissed] = useState(false);

  // Confirmed order data
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedWhatsApp, setConfirmedWhatsApp] = useState<any>(null);

  const loadData = async () => {
    try {
      const [prodsRes, srvsRes, setsRes, catsRes] = await Promise.allSettled([
        api.getProducts(),
        api.getServices(),
        api.getSettings(),
        api.getCategories()
      ]);

      let liveApiConnected = false;

      // Real live API data takes priority whenever the backend is reachable
      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
        setProducts(prodsRes.value);
        liveApiConnected = true;
      }
      if (srvsRes.status === 'fulfilled' && Array.isArray(srvsRes.value) && srvsRes.value.length > 0) {
        setServices(srvsRes.value);
        liveApiConnected = true;
      }
      if (setsRes.status === 'fulfilled' && setsRes.value) {
        setSettings(setsRes.value);
        liveApiConnected = true;
      }
      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
        setCategories(catsRes.value);
        liveApiConnected = true;
      }

      // If backend was unreachable or returned errors (e.g. on static GitHub Pages), flag fallback mode
      setIsUsingFallback(!liveApiConnected);
    } catch (err: any) {
      console.warn('Backend API unavailable, using storefront catalog fallback:', err);
      setIsUsingFallback(true);
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
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading Administration Console...</span>
              </div>
            </div>
          }
        >
          <AdminLayout
            onExitAdmin={() => navigateToStorefront(() => handleNavigate('home'))}
            initialTab={viewParam || 'dashboard'}
          />
        </React.Suspense>
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
            {/* Non-blocking informational banner when running on static fallback without backend */}
            {isUsingFallback && !apiNoticeDismissed && (
              <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 transition-all">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <p className="font-medium text-[11px] sm:text-xs">
                      <span className="font-bold">Storefront Catalog Mode:</span> Browsing static product & service catalog. For custom prints and instant orders, WhatsApp us directly at <a href="tel:+918557049897" className="underline font-bold">+91 8557049897</a>.
                    </p>
                  </div>
                  <button
                    onClick={() => setApiNoticeDismissed(true)}
                    className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded transition-colors text-xs shrink-0"
                    aria-label="Dismiss notice"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

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

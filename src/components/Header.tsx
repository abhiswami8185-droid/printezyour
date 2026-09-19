import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  ShoppingBag,
  ShieldCheck,
  Menu,
  X,
  Search,
  ChevronDown,
  Clock,
  MapPin,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';

interface HeaderProps {
  categories?: Category[];
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], currentView, onNavigate, onOpenCart }) => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { role, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Explicit, route-derived active states: exactly ONE button is active at a time
  const isHomeActive = currentView === 'home';
  const isProductsActive = currentView === 'products' || currentView === 'product-detail';
  const isServicesActive = currentView === 'services';
  const isQuoteActive = currentView === 'quote';
  const isTrackActive = currentView === 'track';
  const isAboutActive = currentView === 'about';
  const isContactActive = currentView === 'contact';

  const handleCategoryClick = (catSlug: string) => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('products', catSlug);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', `search:${searchQuery.trim()}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notification / Trust Bar */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              Plot 1794, Gym Deep Complex, Hallo Majra, Chandigarh
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              Mon–Fri 9am–7pm · Sat 10am–6pm
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:+918557049897"
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span className="font-semibold">+91 8557049897</span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              GST Registered · 12+ Years Trust
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
          title="Printezyour - Your imagination, our print"
        >
          <div className="h-11 sm:h-12 w-auto max-w-[240px] flex items-center justify-start">
            <img
              src="/logo.png"
              alt="Printezyour - Your imagination, our print"
              className="h-full w-auto object-contain transition-transform group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 text-xs xl:text-sm font-semibold text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={isHomeActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="Return to Home Page"
          >
            Home
          </button>

          {/* Categories / Products Dropdown */}
          <div
            className="relative"
            onMouseLeave={() => setCategoryDropdownOpen(false)}
          >
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              className={`flex items-center gap-1.5 ${
                isProductsActive ? 'nav-3d-btn-active' : 'nav-3d-btn'
              }`}
              title="Browse Product Catalog"
            >
              <span>Products</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Categories</span>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      onNavigate('products');
                    }}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {(categories || []).slice(0, 12).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50/70 hover:text-blue-700 flex items-center justify-between text-slate-700 transition-colors"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-[10px] text-slate-400">Order</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1.5 px-3">
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      onNavigate('services');
                    }}
                    className="w-full text-left py-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    Explore All 20 Print Services Guide
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('services')}
            className={isServicesActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="Browse Printing Services"
          >
            Services
          </button>

          <button
            onClick={() => onNavigate('quote')}
            className={isQuoteActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="Request a Custom Print Quotation"
          >
            Request Quote
          </button>

          <button
            onClick={() => onNavigate('track')}
            className={isTrackActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="Track Your Order Status"
          >
            Track Order
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={isAboutActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="About PrintezYour Chandigarh"
          >
            About Us
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={isContactActive ? 'nav-3d-btn-active' : 'nav-3d-btn'}
            title="Contact PrintezYour"
          >
            Contact
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search visiting cards, stickers..."
              className="w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
          </form>

          {/* WhatsApp Direct CTA with 3D button style */}
          <a
            href="https://wa.me/918557049897?text=Hello%20Printezyour%2C%20I%20would%20like%20to%20know%20more%20about%20your%20printing%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 btn-3d-emerald text-xs font-bold px-3.5 py-2"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white/20" />
            <span>WhatsApp Us</span>
          </a>

          {/* Cart Icon & Counter */}
          <button
            onClick={() => (onOpenCart ? onOpenCart() : setIsCartOpen(true))}
            className="relative p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-scale">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, materials, sizes..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          </form>

          <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={isHomeActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setMobileMenuOpen(false);
              }}
              className={isProductsActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              Products
            </button>
            <button
              onClick={() => {
                onNavigate('services');
                setMobileMenuOpen(false);
              }}
              className={isServicesActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              Services
            </button>
            <button
              onClick={() => {
                onNavigate('quote');
                setMobileMenuOpen(false);
              }}
              className={isQuoteActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              Request Quote
            </button>
            <button
              onClick={() => {
                onNavigate('track');
                setMobileMenuOpen(false);
              }}
              className={isTrackActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              Track Order
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={isAboutActive ? 'nav-3d-btn-active py-2.5 w-full justify-center' : 'nav-3d-btn py-2.5 w-full justify-center'}
            >
              About Us
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className={isContactActive ? 'nav-3d-btn-active py-2.5 w-full justify-center col-span-2' : 'nav-3d-btn py-2.5 w-full justify-center col-span-2'}
            >
              Contact
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <a
              href="tel:+918557049897"
              className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold"
            >
              <Phone className="w-3.5 h-3.5" /> Call +91 8557049897
            </a>
            <a
              href="https://wa.me/918557049897"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Product, Category } from '../types';

interface ProductsPageProps {
  products: Product[];
  categories?: Category[];
  initialCategory?: string;
  onSelectProduct?: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories = [],
  initialCategory,
  onSelectProduct,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialCategory && !initialCategory.startsWith('search:')) {
      return initialCategory;
    }
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (initialCategory && initialCategory.startsWith('search:')) {
      return initialCategory.replace('search:', '');
    }
    return '';
  });

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (selectedCategory !== 'all') {
          const matchSlug = p.categoryId === selectedCategory;
          const matchCatName = p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
          if (!matchSlug && !matchCatName) return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-cyan-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Direct Commercial Press
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display">
            {activeCategoryObj ? activeCategoryObj.name : 'Print Products & Merchandise'}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {activeCategoryObj
              ? activeCategoryObj.description
              : 'Explore our complete catalog of industrial-grade offset, digital, flex, and packaging prints. Configure exact sizes, papers, and finishes with live calculations.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search visiting cards, stickers, boxes..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories ({selectedCategory === 'all' ? 'All' : '1'})</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Categories List (Desktop) */}
        <div className="hidden md:block md:col-span-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2 sticky top-24">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Print Categories
            </h3>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 pr-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Products</span>
              <span className={`text-[10px] ${selectedCategory === 'all' ? 'text-blue-200' : 'text-slate-400'}`}>
                {products.length}
              </span>
            </button>

            {categories.map(cat => {
              const count = products.filter(
                p => p.categoryId === cat.slug || p.category.toLowerCase().replace(/\s+/g, '-') === cat.slug
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] ${
                        selectedCategory === cat.slug ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Categories Modal/Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-2xl p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-sm text-slate-900">Select Printing Category</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setMobileFilterOpen(false);
                  }}
                  className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                    selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                      selectedCategory === cat.slug ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Product Grid */}
        <div className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't find matches for your search or category filter. Have a unique requirement or custom size?
              </p>
              <button
                onClick={() => onNavigate('quote')}
                className="bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Request a Custom Quote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredProducts || []).map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={(product.images && product.images[0]) || product.image || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {product.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {product.productionTime}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.features && product.features.length > 0 ? (
                          product.features.slice(0, 2).map((feat, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium truncate max-w-[140px]"
                            >
                              {feat}
                            </span>
                          ))
                        ) : (
                          <>
                            {product.productionTime && (
                              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                                {product.productionTime}
                              </span>
                            )}
                            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-medium">
                              Min {product.minQuantity || 1} pcs
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Starting at
                        </span>
                        <div className="font-extrabold text-base text-slate-900">
                          ₹{product.basePrice}
                          <span className="text-[11px] text-slate-500 font-normal">
                            {' '}/ {product.minQuantity} pcs
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => (onSelectProduct ? onSelectProduct(product.slug) : onNavigate('product-detail', product.slug))}
                        className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Configure</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

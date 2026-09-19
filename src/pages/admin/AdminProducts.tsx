import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Layers,
  Archive,
  Trash2,
  Copy,
  TrendingUp,
  Grid,
  List,
  ArrowUpDown,
  ExternalLink,
  DollarSign,
  Camera,
  Sparkles
} from 'lucide-react';
import { Product, Category, InventoryItem, Order, ServiceItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { calculateProductStock } from '../../utils/stockCalculation';
import { ProductEditorModal } from '../../components/admin/ProductEditorModal';
import { ProductStockModal } from '../../components/admin/ProductStockModal';
import { ImageManagementModal } from '../../components/admin/ImageManagementModal';
import { AdminServicesTab } from './AdminServicesTab';

interface AdminProductsProps {
  products: Product[];
  services?: ServiceItem[];
  inventory: InventoryItem[];
  categories: Category[];
  orders?: Order[];
  onProductsUpdated: () => void;
  onServicesUpdated?: () => void;
  onInventoryUpdated?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products = [],
  services = [],
  inventory = [],
  categories = [],
  orders = [],
  onProductsUpdated,
  onServicesUpdated,
  onInventoryUpdated,
  onNavigateTab
}) => {
  const { role } = useAuth();
  const canManage = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const safeProducts = Array.isArray(products) ? products : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // Section Toggle: Products vs Services
  const [activeSection, setActiveSection] = useState<'products' | 'services'>('products');

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'capacity' | 'updated'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockInspectingProduct, setStockInspectingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Image Management Modal state
  const [imageModalItem, setImageModalItem] = useState<{
    type: 'product' | 'service';
    id: string;
    name: string;
    category?: string;
    currentImage: string;
  } | null>(null);

  // Pre-calculate stock analysis for all products for fast filtering & sorting
  const productStockMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateProductStock>>();
    safeProducts.forEach(p => {
      map.set(p.id, calculateProductStock(p, safeInventory));
    });
    return map;
  }, [safeProducts, safeInventory]);

  // Telemetry counts
  const telemetry = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let madeToOrder = 0;
    let inactive = 0;

    safeProducts.forEach(p => {
      if (!p.isActive || p.isArchived) {
        inactive++;
        return;
      }
      const st = productStockMap.get(p.id);
      if (!st) return;
      if (st.status === 'IN_STOCK') inStock++;
      else if (st.status === 'LOW_STOCK') lowStock++;
      else if (st.status === 'OUT_OF_STOCK') outOfStock++;
      else if (st.status === 'MADE_TO_ORDER' || st.status === 'QUOTE_ONLY') madeToOrder++;
    });

    return {
      total: safeProducts.length,
      inStock,
      lowStock,
      outOfStock,
      madeToOrder,
      inactive
    };
  }, [safeProducts, productStockMap]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return safeProducts
      .filter(product => {
        // Category Filter
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }

        const stock = productStockMap.get(product.id);

        // Status Filter
        if (selectedStatus === 'ACTIVE' && (!product.isActive || product.isArchived)) return false;
        if (selectedStatus === 'INACTIVE' && product.isActive && !product.isArchived) return false;
        if (selectedStatus === 'IN_STOCK' && stock?.status !== 'IN_STOCK') return false;
        if (selectedStatus === 'LOW_STOCK' && stock?.status !== 'LOW_STOCK') return false;
        if (selectedStatus === 'OUT_OF_STOCK' && stock?.status !== 'OUT_OF_STOCK') return false;
        if (selectedStatus === 'MADE_TO_ORDER' && stock?.status !== 'MADE_TO_ORDER') return false;
        if (selectedStatus === 'QUOTE_ONLY' && stock?.status !== 'QUOTE_ONLY') return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = (product.sku || '').toLowerCase().includes(q);
          const matchDesc = (product.description || '').toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          return matchName || matchSku || matchDesc || matchCat;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'price-asc') {
          return a.basePrice - b.basePrice;
        }
        if (sortBy === 'price-desc') {
          return b.basePrice - a.basePrice;
        }
        if (sortBy === 'capacity') {
          const capA = productStockMap.get(a.id)?.maxProducibleCapacity || 0;
          const capB = productStockMap.get(b.id)?.maxProducibleCapacity || 0;
          return capB - capA;
        }
        if (sortBy === 'updated') {
          const tA = new Date(a.updatedAt || 0).getTime();
          const tB = new Date(b.updatedAt || 0).getTime();
          return tB - tA;
        }
        return 0;
      });
  }, [products, selectedCategory, selectedStatus, searchQuery, sortBy, productStockMap]);

  // Handle Save from Editor Modal
  const handleSaveProduct = async (productToSave: Product, priceChangeReason?: string) => {
    const payload = {
      ...productToSave,
      priceChangeReason
    };

    if (productToSave.id.startsWith('new-')) {
      await api.createProduct(payload as any, role);
      setActionNotice(`Product "${productToSave.name}" created successfully.`);
    } else {
      await api.updateProduct(productToSave.id, payload, role);
      setActionNotice(`Product "${productToSave.name}" updated successfully.`);
    }

    setEditingProduct(null);
    onProductsUpdated();
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Instant Active Toggle
  const handleToggleActive = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManage) return;
    try {
      await api.updateProduct(product.id, { isActive: !product.isActive }, role);
      onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product status');
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = (product: Product) => {
    const cloned: Product = {
      ...JSON.parse(JSON.stringify(product)),
      id: `new-${Date.now()}`,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${product.sku ? `${product.sku}-COPY` : `SKU-${Math.floor(1000 + Math.random() * 9000)}`}`,
      isActive: false
    };
    setEditingProduct(cloned);
  };

  // Create Blank Product
  const handleStartNewProduct = () => {
    const defaultCat = categories[0]?.name || 'Visiting Cards';
    const defaultCatId = categories[0]?.id || 'cat-1';
    const firstInv = inventory[0];

    const newProd: Product = {
      id: `new-${Date.now()}`,
      name: '',
      slug: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: defaultCat,
      categoryId: defaultCatId,
      shortDescription: '',
      description: '',
      images: ['/images/products/visiting-cards-matte.jpg'],
      image: '/images/products/visiting-cards-matte.jpg',
      basePrice: 500,
      priceType: 'quantity_tiered',
      minQuantity: 100,
      requiresArtwork: true,
      productionTime: '2-3 Business Days',
      deliveryInfo: 'Doorstep courier delivery across Tricity & Pan-India.',
      isFeatured: false,
      isActive: true,
      gstRate: 18,
      quantityTiers: [
        { quantity: 100, unitPrice: 5, discountPercentage: 0, minQty: 100 },
        { quantity: 500, unitPrice: 4.2, discountPercentage: 16, minQty: 500 },
        { quantity: 1000, unitPrice: 3.5, discountPercentage: 30, minQty: 1000 }
      ],
      options: [
        {
          id: `opt-${Date.now()}`,
          name: 'Material / GSM',
          type: 'select',
          values: [
            { id: `v-${Date.now()}-1`, name: 'Standard (Included)', priceModifier: 0, isDefault: true },
            { id: `v-${Date.now()}-2`, name: 'Premium Heavyweight', priceModifier: 150, isDefault: false }
          ]
        }
      ],
      materialRequirements: firstInv
        ? [
            {
              id: `bm-${Date.now()}`,
              inventoryItemId: firstInv.id,
              inventoryItemName: firstInv.name,
              inventorySku: firstInv.sku,
              quantityRequired: 10,
              unit: firstInv.unit,
              forProductQuantity: 500,
              notes: 'Initial production batch allocation'
            }
          ]
        : [],
      stockMode: 'inventory_calculated'
    };

    setEditingProduct(newProd);
  };

  // Safe Delete Action
  const handleExecuteDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      const res = await api.deleteProduct(deleteConfirmProduct.id, role);
      setActionNotice(res.message || 'Product removed.');
      setDeleteConfirmProduct(null);
      onProductsUpdated();
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header & Primary CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Products & Rates Management
              </h2>
              <p className="text-xs text-slate-500">
                Live catalog pricing formulas, variant options, and real-time inventory availability sync.
              </p>
            </div>
          </div>
        </div>

        {canManage && activeSection === 'products' && (
          <button
            onClick={handleStartNewProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Top Segmented Tabs: Products vs Services */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveSection('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'products'
              ? 'bg-white text-blue-600 shadow-2xs ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalog Products ({safeProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'services'
              ? 'bg-white text-blue-600 shadow-2xs ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Services & Capabilities ({safeServices.length})</span>
        </button>
      </div>

      {/* View Conditional */}
      {activeSection === 'services' ? (
        <AdminServicesTab
          services={safeServices}
          canManage={canManage}
          onEditPhoto={(srv) => {
            setImageModalItem({
              type: 'service',
              id: srv.id,
              name: srv.name,
              category: srv.category,
              currentImage: srv.image || srv.imageUrl || ''
            });
          }}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedStatus('All')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'All'
              ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Catalog
          </span>
          <div className="text-xl font-black text-slate-900 font-display">{telemetry.total}</div>
          <span className="text-[11px] text-slate-500">All registered items</span>
        </div>

        <div
          onClick={() => setSelectedStatus('IN_STOCK')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'IN_STOCK'
              ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            In Stock (Ample)
          </span>
          <div className="text-xl font-black text-emerald-700 font-display">{telemetry.inStock}</div>
          <span className="text-[11px] text-slate-500">Raw materials ready</span>
        </div>

        <div
          onClick={() => setSelectedStatus('LOW_STOCK')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'LOW_STOCK'
              ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Low Stock Alert
          </span>
          <div className="text-xl font-black text-amber-700 font-display">{telemetry.lowStock}</div>
          <span className="text-[11px] text-slate-500">Reorder recommended</span>
        </div>

        <div
          onClick={() => setSelectedStatus('OUT_OF_STOCK')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'OUT_OF_STOCK'
              ? 'bg-red-50/50 border-red-400 ring-1 ring-red-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-1">
            Out of Stock
          </span>
          <div className="text-xl font-black text-red-700 font-display">{telemetry.outOfStock}</div>
          <span className="text-[11px] text-slate-500">Materials depleted</span>
        </div>

        <div
          onClick={() => setSelectedStatus('MADE_TO_ORDER')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'MADE_TO_ORDER'
              ? 'bg-purple-50/50 border-purple-400 ring-1 ring-purple-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Made to Order / Quote
          </span>
          <div className="text-xl font-black text-purple-700 font-display">{telemetry.madeToOrder}</div>
          <span className="text-[11px] text-slate-500">Custom fabrication</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, category, or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Categories</option>
                {(categories || []).map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Availability:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Stock Statuses</option>
                <option value="ACTIVE">Active in Storefront</option>
                <option value="INACTIVE">Inactive / Archived</option>
                <option value="IN_STOCK">In Stock (Sufficient)</option>
                <option value="LOW_STOCK">Low Stock Alert</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="MADE_TO_ORDER">Made to Order</option>
                <option value="QUOTE_ONLY">Custom Quote Only</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="name">Sort: Name (A-Z)</option>
                <option value="price-asc">Sort: Price (Low &rarr; High)</option>
                <option value="price-desc">Sort: Price (High &rarr; Low)</option>
                <option value="capacity">Sort: Producible Capacity</option>
                <option value="updated">Sort: Recently Modified</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Applied Filter Tags */}
        {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Active filters:</span>
            {selectedCategory !== 'All' && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-blue-900 font-bold">&times;</button>
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('All')} className="hover:text-blue-900 font-bold">&times;</button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Search: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 font-bold">&times;</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-bold underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* PRODUCTS DISPLAY */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No products matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or create a new catalog item.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Pricing & Model</th>
                  <th className="p-3.5">Inventory Stock & Capacity</th>
                  <th className="p-3.5 text-center">Storefront</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(filteredProducts || []).map(product => {
                  const stock = productStockMap.get(product.id)!;
                  const imgUrl = (product.images && product.images[0]) || product.image || '';
                  const optionsCount = (product.options || product.optionGroups || []).length;
                  const bomCount = (product.materialRequirements || []).length;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        !product.isActive || product.isArchived ? 'opacity-65 bg-slate-50/30' : ''
                      }`}
                    >
                      {/* Product & SKU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => {
                              if (canManage) {
                                setImageModalItem({
                                  type: 'product',
                                  id: product.id,
                                  name: product.name,
                                  category: product.category,
                                  currentImage: imgUrl
                                });
                              }
                            }}
                            className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 shadow-2xs relative group cursor-pointer"
                            title="Click to edit photo"
                          >
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                referrerPolicy="no-referrer"
                                onError={e => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                                {product.name}
                              </span>
                              {product.isFeatured && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                              {product.popularBadge && (
                                <span className="bg-pink-100 text-pink-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  {product.popularBadge}
                                </span>
                              )}
                              {product.isArchived && (
                                <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  Archived
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-700">{product.sku || 'NO-SKU'}</span>
                              <span>&bull;</span>
                              <span>Min Qty: {product.minQuantity}</span>
                              <span>&bull;</span>
                              <span>{product.productionTime || '2-3 Days'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {product.category}
                        </span>
                      </td>

                      {/* Pricing & Model */}
                      <td className="p-3.5">
                        <div>
                          <div className="flex items-baseline gap-1 font-bold text-slate-900 text-sm">
                            <span>₹{product.basePrice}</span>
                            <span className="text-[10px] text-slate-400 font-normal">base rate</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 capitalize flex items-center gap-1">
                            <span>{product.priceType.replace(/_/g, ' ')}</span>
                            {product.quantityTiers && product.quantityTiers.length > 0 && (
                              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-bold">
                                {product.quantityTiers.length} tiers
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Inventory Stock & Producible Capacity */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <button
                            onClick={() => setStockInspectingProduct(product)}
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 hover:brightness-95 transition-all ${stock.badgeClass}`}
                            title="Click to view material breakdown"
                          >
                            <Layers className="w-3 h-3" />
                            <span>{stock.statusLabel}</span>
                          </button>

                          {stock.limitingMaterialName && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs" title={`Limited by: ${stock.limitingMaterialName}`}>
                              Limiting: <span className="text-slate-700 font-medium">{stock.limitingMaterialName}</span>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400">
                            {bomCount} {bomCount === 1 ? 'material linked' : 'materials linked'} &bull; {optionsCount} option {optionsCount === 1 ? 'group' : 'groups'}
                          </div>
                        </div>
                      </td>

                      {/* Active Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={e => handleToggleActive(product, e)}
                          disabled={!canManage}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            product.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          } ${!canManage ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              product.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect BOM */}
                          <button
                            onClick={() => setStockInspectingProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Material Inventory (BOM)"
                          >
                            <Layers className="w-4 h-4" />
                          </button>

                          {/* Edit Product & Rates */}
                          <button
                            onClick={() => setEditingProduct(product)}
                            disabled={!canManage}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product & Rates"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Edit Photo */}
                          <button
                            onClick={() =>
                              setImageModalItem({
                                type: 'product',
                                id: product.id,
                                name: product.name,
                                category: product.category,
                                currentImage: imgUrl
                              })
                            }
                            disabled={!canManage}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Change Product Photo"
                          >
                            <Camera className="w-4 h-4 text-blue-600" />
                          </button>

                          {/* Duplicate Product */}
                          {canManage && (
                            <button
                              onClick={() => handleDuplicateProduct(product)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Duplicate Product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete / Archive */}
                          {role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => setDeleteConfirmProduct(product)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete or Archive Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(filteredProducts || []).map(product => {
            const stock = productStockMap.get(product.id)!;
            const imgUrl = (product.images && product.images[0]) || product.image || '';

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${stock.badgeClass}`}
                  >
                    {stock.statusLabel}
                  </span>

                  <div className="absolute bottom-2 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {product.sku || 'NO-SKU'}
                  </div>

                  {canManage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModalItem({
                          type: 'product',
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          currentImage: imgUrl
                        });
                      }}
                      className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                      title="Change Product Photo"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Edit Photo</span>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Base Price:</span>
                      <strong className="text-slate-900 font-bold text-sm">₹{product.basePrice}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Producible Units:</span>
                      <strong className="text-slate-900 font-semibold">
                        {stock.isMadeToOrder ? 'On Demand' : `~${stock.maxProducibleCapacity.toLocaleString('en-IN')}`}
                      </strong>
                    </div>
                    {stock.limitingMaterialName && (
                      <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-200">
                        Bottleneck: <span className="font-semibold text-slate-700">{stock.limitingMaterialName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={e => handleToggleActive(product, e)}
                        disabled={!canManage}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                          product.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStockInspectingProduct(product)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                        title="BOM Stock"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Rates</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* MODAL 1: Product & Rates Editor */}
      {editingProduct && (
        <ProductEditorModal
          product={editingProduct}
          categories={categories}
          inventory={inventory}
          userRole={role}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* MODAL 2: Bill of Materials & Stock Inspection */}
      {stockInspectingProduct && (
        <ProductStockModal
          product={stockInspectingProduct}
          inventory={inventory}
          onClose={() => setStockInspectingProduct(null)}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* MODAL 3: Delete / Archive Safety Confirmation */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Remove / Archive Product?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You are about to remove <strong className="text-slate-800">&quot;{deleteConfirmProduct.name}&quot;</strong> (
                <span className="font-mono">{deleteConfirmProduct.sku}</span>).
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Historical Order Integrity Protection:</span>
              <p>
                If this product is referenced in existing customer orders, it will be safely <strong>archived and deactivated</strong> instead
                of hard deleted. Old orders will permanently preserve their original prices, names, and options.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Product & Service Photo Manager */}
      {imageModalItem && (
        <ImageManagementModal
          isOpen={!!imageModalItem}
          item={imageModalItem}
          onClose={() => setImageModalItem(null)}
          onImageSaved={(_newUrl) => {
            setActionNotice(`Photo successfully updated for "${imageModalItem.name}".`);
            onProductsUpdated();
            if (onServicesUpdated) {
              onServicesUpdated();
            }
            setTimeout(() => setActionNotice(null), 6000);
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Save,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  Layers,
  History,
  Check,
  Info,
  ChevronRight,
  Calculator
} from 'lucide-react';
import {
  Product,
  Category,
  InventoryItem,
  ProductOptionGroup,
  ProductOptionValue,
  ProductMaterialRequirement,
  QuantityTier
} from '../../types';
import { api } from '../../services/api';
import { calculateProductStock } from '../../utils/stockCalculation';
import { getAssetUrl } from '../../utils/assets';

interface ProductEditorModalProps {
  product: Product;
  categories: Category[];
  inventory: InventoryItem[];
  userRole: string;
  onSave: (savedProduct: Product, priceChangeReason?: string) => Promise<void>;
  onClose: () => void;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product: initialProduct,
  categories,
  inventory,
  userRole,
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'rates' | 'options' | 'bom' | 'history'>('general');
  const [formData, setFormData] = useState<Product>(() => {
    // Normalise fields
    const copy = JSON.parse(JSON.stringify(initialProduct)) as Product;
    copy.images = copy.images && copy.images.length > 0 ? copy.images : (copy.image ? [copy.image] : ['']);
    copy.options = copy.options || copy.optionGroups || [];
    copy.materialRequirements = copy.materialRequirements || [];
    copy.quantityTiers = copy.quantityTiers || [];
    copy.priceHistory = copy.priceHistory || [];
    copy.stockMode = copy.stockMode || 'inventory_calculated';
    copy.sku = copy.sku || `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    return copy;
  });

  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [simulatedQty, setSimulatedQty] = useState<number>(formData.minQuantity || 100);

  // Live stock calculation preview
  const stockPreview = calculateProductStock(formData, inventory);

  // Check if base price changed
  const hasBasePriceChanged = formData.basePrice !== initialProduct.basePrice;

  // File upload for images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await api.uploadArtwork(file);
      setFormData(prev => ({
        ...prev,
        image: uploaded.url,
        images: [uploaded.url, ...(prev.images || []).filter(img => img !== uploaded.url)]
      }));
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Add new image URL
  const handleAddImageUrl = (url: string) => {
    if (!url.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), url.trim()]
    }));
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || ''
      };
    });
  };

  // Tier helpers
  const handleAddTier = () => {
    const lastQty = formData.quantityTiers.length > 0
      ? (formData.quantityTiers[formData.quantityTiers.length - 1].quantity || 100)
      : (formData.minQuantity || 100);
    const nextQty = lastQty * 2;
    const estUnitPrice = Number((formData.basePrice / nextQty * 0.9).toFixed(2)) || 1;

    setFormData(prev => ({
      ...prev,
      quantityTiers: [
        ...prev.quantityTiers,
        {
          quantity: nextQty,
          minQty: nextQty,
          unitPrice: estUnitPrice,
          discountPercentage: 10
        }
      ]
    }));
  };

  const handleUpdateTier = (index: number, field: keyof QuantityTier, value: number) => {
    setFormData(prev => {
      const tiers = [...prev.quantityTiers];
      tiers[index] = { ...tiers[index], [field]: value };
      if (field === 'quantity') {
        tiers[index].minQty = value;
      }
      return { ...prev, quantityTiers: tiers };
    });
  };

  const handleRemoveTier = (index: number) => {
    setFormData(prev => {
      const tiers = [...prev.quantityTiers];
      tiers.splice(index, 1);
      return { ...prev, quantityTiers: tiers };
    });
  };

  // Option Group Helpers
  const handleAddOptionGroup = () => {
    const newGroup: ProductOptionGroup = {
      id: `opt-grp-${Date.now()}`,
      name: 'New Option (e.g. Paper Finish)',
      type: 'select',
      values: [
        { id: `val-${Date.now()}-1`, name: 'Standard (Default)', priceModifier: 0, isDefault: true },
        { id: `val-${Date.now()}-2`, name: 'Premium Upgrade', priceModifier: 150, isDefault: false }
      ]
    };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newGroup]
    }));
  };

  const handleUpdateGroupName = (groupIndex: number, newName: string) => {
    setFormData(prev => {
      const opts = [...(prev.options || [])];
      opts[groupIndex] = { ...opts[groupIndex], name: newName };
      return { ...prev, options: opts };
    });
  };

  const handleRemoveOptionGroup = (groupIndex: number) => {
    setFormData(prev => {
      const opts = [...(prev.options || [])];
      opts.splice(groupIndex, 1);
      return { ...prev, options: opts };
    });
  };

  const handleAddOptionValue = (groupIndex: number) => {
    setFormData(prev => {
      const opts = [...(prev.options || [])];
      const grp = opts[groupIndex];
      const vals = [...(grp.values || grp.options || [])];
      vals.push({
        id: `val-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: 'New Choice',
        priceModifier: 50,
        isDefault: false
      });
      opts[groupIndex] = { ...grp, values: vals, options: vals };
      return { ...prev, options: opts };
    });
  };

  const handleUpdateOptionValue = (
    groupIndex: number,
    valueIndex: number,
    field: keyof ProductOptionValue,
    value: any
  ) => {
    setFormData(prev => {
      const opts = [...(prev.options || [])];
      const grp = opts[groupIndex];
      const vals = [...(grp.values || grp.options || [])];
      if (field === 'isDefault' && value === true) {
        vals.forEach((v, i) => {
          v.isDefault = i === valueIndex;
        });
      } else {
        vals[valueIndex] = { ...vals[valueIndex], [field]: value };
      }
      opts[groupIndex] = { ...grp, values: vals, options: vals };
      return { ...prev, options: opts };
    });
  };

  const handleRemoveOptionValue = (groupIndex: number, valueIndex: number) => {
    setFormData(prev => {
      const opts = [...(prev.options || [])];
      const grp = opts[groupIndex];
      const vals = [...(grp.values || grp.options || [])];
      vals.splice(valueIndex, 1);
      opts[groupIndex] = { ...grp, values: vals, options: vals };
      return { ...prev, options: opts };
    });
  };

  // BOM Helpers
  const handleAddBOMRequirement = () => {
    const firstInv = inventory[0];
    const newReq: ProductMaterialRequirement = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      inventoryItemId: firstInv ? firstInv.id : 'inv-1',
      inventoryItemName: firstInv ? firstInv.name : 'Raw Material',
      inventorySku: firstInv ? firstInv.sku : '',
      quantityRequired: 10,
      unit: firstInv ? firstInv.unit : 'Sheets',
      forProductQuantity: formData.minQuantity || 500,
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      materialRequirements: [...(prev.materialRequirements || []), newReq]
    }));
  };

  const handleUpdateBOMRequirement = (
    index: number,
    field: keyof ProductMaterialRequirement,
    value: any
  ) => {
    setFormData(prev => {
      const reqs = [...(prev.materialRequirements || [])];
      if (field === 'inventoryItemId') {
        const inv = inventory.find(i => i.id === value);
        reqs[index] = {
          ...reqs[index],
          inventoryItemId: value,
          inventoryItemName: inv ? inv.name : reqs[index].inventoryItemName,
          inventorySku: inv ? inv.sku : reqs[index].inventorySku,
          unit: inv ? inv.unit : reqs[index].unit
        };
      } else {
        reqs[index] = { ...reqs[index], [field]: value };
      }
      return { ...prev, materialRequirements: reqs };
    });
  };

  const handleRemoveBOMRequirement = (index: number) => {
    setFormData(prev => {
      const reqs = [...(prev.materialRequirements || [])];
      reqs.splice(index, 1);
      return { ...prev, materialRequirements: reqs };
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Product = {
        ...formData,
        image: (formData.images && formData.images[0]) || formData.image || '',
        optionGroups: formData.options // Keep backward compatibility
      };
      await onSave(payload, hasBasePriceChanged ? priceChangeReason : undefined);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate simulated rate
  const simulatedTier = [...formData.quantityTiers]
    .sort((a, b) => (b.quantity || b.minQty || 0) - (a.quantity || a.minQty || 0))
    .find(t => simulatedQty >= (t.quantity || t.minQty || 0));
  const simUnitPrice = simulatedTier ? (simulatedTier.unitPrice || 0) : (formData.basePrice / (formData.minQuantity || 1));
  const simSubtotal = Math.round(simulatedQty * simUnitPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 font-display">
                {formData.id.startsWith('new-') ? 'Add New Product' : 'Product & Rate Configurator'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockPreview.badgeClass}`}>
                {stockPreview.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {formData.name || 'Untitled Product'} &bull; <span className="font-mono text-slate-700">{formData.sku || 'No SKU'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-4 overflow-x-auto shrink-0 gap-1 pb-px">
          {[
            { id: 'general', label: '1. General Info', icon: Package },
            { id: 'rates', label: '2. Rates & Tiers', icon: DollarSign },
            { id: 'options', label: '3. Options & Add-ons', icon: Layers },
            { id: 'bom', label: '4. Raw BOM & Stock', icon: Layers },
            { id: 'history', label: '5. Price Audit Log', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                    placeholder="e.g. Standard Visiting Cards"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SKU / Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono uppercase"
                    placeholder="e.g. PRD-VC-350AB"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      const selectedCat = categories.find(c => c.name === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        categoryId: selectedCat ? selectedCat.id : formData.categoryId
                      });
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-slate-600"
                    placeholder="standard-visiting-cards"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (Catalog Summary)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g. High-definition commercial Heidelberg printed cards with crisp typography."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Technical & Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Detailed specifications, paper GSM, cutting tolerance, color profiling, etc."
                />
              </div>

              {/* Image Management */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Product Imagery
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Supports high-resolution PNG, JPG, WebP
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(formData.images || []).filter(img => typeof img === 'string' && img.trim().length > 0).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl border border-slate-300 overflow-hidden bg-white group shadow-2xs"
                    >
                      <img
                        src={getAssetUrl(img.trim())}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* File Upload Box */}
                  <label className="w-20 h-20 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-[9px] font-bold text-slate-500 mt-1">
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}

                {/* Direct URL input fallback */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Or add Image URL directly:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="direct-img-url"
                      placeholder="/images/products/... or https://..."
                      className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('direct-img-url') as HTMLInputElement;
                        if (input && input.value) {
                          handleAddImageUrl(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Flags and Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Turnaround / Production Time
                  </label>
                  <input
                    type="text"
                    value={formData.productionTime}
                    onChange={e => setFormData({ ...formData, productionTime: e.target.value, turnaroundTime: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="2-3 Business Days"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Order Quantity (MOQ)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minQuantity}
                    onChange={e => setFormData({ ...formData, minQuantity: Number(e.target.value) || 1 })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GST Rate (% Tax)
                  </label>
                  <select
                    value={formData.gstRate || 18}
                    onChange={e => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
                  >
                    <option value={18}>18% (Standard Printing Services)</option>
                    <option value={12}>12% (Books & Educational)</option>
                    <option value={5}>5% (Special Substrates)</option>
                    <option value={0}>0% (Tax Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Active in Storefront</span>
                    <span className="text-[10px] text-slate-500">Customers can view & order</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Featured on Homepage</span>
                    <span className="text-[10px] text-slate-500">Highlighted in top deals</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.requiresArtwork}
                    onChange={e => setFormData({ ...formData, requiresArtwork: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Requires Artwork Upload</span>
                    <span className="text-[10px] text-slate-500">Prompts file attachment</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: RATES & TIERS */}
          {activeTab === 'rates' && (
            <div className="space-y-6">
              {/* Pricing Type & Base Rate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Pricing Model *
                    </label>
                    <select
                      value={formData.priceType}
                      onChange={e => setFormData({ ...formData, priceType: e.target.value as any })}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      <option value="quantity_tiered">Quantity Tiered (Volume Discount Tiers)</option>
                      <option value="fixed">Fixed Rate per Unit</option>
                      <option value="quote_only">Quotation Only (No Direct Checkout)</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Tiered pricing automatically decreases unit rates for larger corporate orders.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Base Starting Price (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={formData.basePrice}
                        onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) || 0 })}
                        className="w-full text-sm font-black p-2 pl-7 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Displayed as &quot;Starting from ₹{formData.basePrice}&quot; in catalog
                    </span>
                  </div>
                </div>

                {/* Audit Trail Prompt if price changed */}
                {hasBasePriceChanged && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                      <Info className="w-4 h-4 text-amber-600" />
                      <span>Rate Adjustment Detected (₹{initialProduct.basePrice} &rarr; ₹{formData.basePrice})</span>
                    </div>
                    <label className="block text-[11px] text-amber-800 font-semibold">
                      Reason for Price Update (Logged to Audit History):
                    </label>
                    <input
                      type="text"
                      value={priceChangeReason}
                      onChange={e => setPriceChangeReason(e.target.value)}
                      placeholder="e.g. Raw paper tariff revision, seasonal discount promo, supplier cost increase..."
                      className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Quantity Tiers Table */}
              {formData.priceType === 'quantity_tiered' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Volume Discount Quantity Tiers
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Define wholesale brackets where unit rates scale down as order size increases.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Quantity Tier</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                          <th className="p-3">Order Quantity</th>
                          <th className="p-3">Unit Price (₹/pc)</th>
                          <th className="p-3">Batch Subtotal</th>
                          <th className="p-3">Discount %</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(formData.quantityTiers || []).map((tier, idx) => {
                          const qty = tier.quantity || tier.minQty || 100;
                          const uPrice = tier.unitPrice || 0;
                          const subtotal = Math.round(qty * uPrice);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3">
                                <div className="flex items-center gap-1 font-bold text-slate-900">
                                  <input
                                    type="number"
                                    min={1}
                                    value={qty}
                                    onChange={e => handleUpdateTier(idx, 'quantity', Number(e.target.value))}
                                    className="w-24 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                  />
                                  <span className="text-slate-400 text-[11px]">pcs</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={uPrice}
                                    onChange={e => handleUpdateTier(idx, 'unitPrice', Number(e.target.value))}
                                    className="w-24 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                  />
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-slate-800">
                                ₹{subtotal.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={tier.discountPercentage || 0}
                                    onChange={e => handleUpdateTier(idx, 'discountPercentage', Number(e.target.value))}
                                    className="w-16 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                  />
                                  <span className="text-slate-400 text-xs">%</span>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTier(idx)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                                  title="Delete Tier"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Live Calculator Simulator */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">
                      Live Customer Pricing Simulator
                    </span>
                    <span className="text-[11px] text-blue-800">
                      Test order quote calculation based on defined brackets
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-blue-900">Test Qty:</span>
                    <input
                      type="number"
                      step={50}
                      min={formData.minQuantity || 1}
                      value={simulatedQty}
                      onChange={e => setSimulatedQty(Number(e.target.value) || 1)}
                      className="w-24 p-1.5 text-xs bg-white border border-blue-300 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-blue-950 font-display">
                      ₹{simSubtotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-blue-700">
                      @ ₹{simUnitPrice.toFixed(2)}/pc (+18% GST)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPTIONS & ADD-ONS */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Product Options & Variant Modifiers
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Configure customer choices (e.g. Paper GSM, Lamination, Corner Type, Size) with price markups.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOptionGroup}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option Group</span>
                </button>
              </div>

              {(formData.options || []).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No option groups created.</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    Add option groups like Paper Quality, Finishes, or Sizes to offer customized ordering.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(formData.options || []).map((grp, gIdx) => {
                    const values = grp.values || grp.options || [];
                    return (
                      <div key={grp.id || gIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Group #{gIdx + 1}:</span>
                            <input
                              type="text"
                              value={grp.name}
                              onChange={e => handleUpdateGroupName(gIdx, e.target.value)}
                              className="text-xs font-bold p-1.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 w-64"
                              placeholder="Group Name (e.g. Paper GSM)"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddOptionValue(gIdx)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Choice</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionGroup(gIdx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                              title="Delete Group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Values list */}
                        <div className="space-y-2">
                          {values.map((val, vIdx) => (
                            <div
                              key={val.id || vIdx}
                              className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs"
                            >
                              <label
                                className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer"
                                title="Set as default choice"
                              >
                                <input
                                  type="radio"
                                  name={`default-${grp.name}-${gIdx}`}
                                  checked={!!val.isDefault}
                                  onChange={() => handleUpdateOptionValue(gIdx, vIdx, 'isDefault', true)}
                                  className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                                />
                                <span className="font-semibold">Default</span>
                              </label>

                              <input
                                type="text"
                                value={val.name}
                                onChange={e => handleUpdateOptionValue(gIdx, vIdx, 'name', e.target.value)}
                                placeholder="Choice name (e.g. 350 GSM Matte)"
                                className="flex-1 min-w-[140px] p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
                              />

                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 font-semibold">+₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={val.priceModifier || 0}
                                  onChange={e => handleUpdateOptionValue(gIdx, vIdx, 'priceModifier', Number(e.target.value))}
                                  className="w-20 p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                  placeholder="0"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveOptionValue(gIdx, vIdx)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded"
                                title="Remove Choice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RAW BOM & INVENTORY CAPACITY */}
          {activeTab === 'bom' && (
            <div className="space-y-6">
              {/* Stock Mode Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Stock Availability Mode
                  </label>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stockPreview.badgeClass}`}>
                    {stockPreview.statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'inventory_calculated',
                      label: 'Auto (From Inventory)',
                      desc: 'Availability calculated from warehouse raw materials'
                    },
                    {
                      id: 'made_to_order',
                      label: 'Made to Order',
                      desc: 'Always orderable. Procured on demand (+2 days)'
                    },
                    {
                      id: 'quote_only',
                      label: 'Custom Quote Only',
                      desc: 'Requires technical review & custom quotation'
                    }
                  ].map(mode => (
                    <label
                      key={mode.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.stockMode === mode.id
                          ? 'border-blue-600 bg-blue-50/50 text-blue-950 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="stockMode"
                          value={mode.id}
                          checked={formData.stockMode === mode.id}
                          onChange={e => setFormData({ ...formData, stockMode: e.target.value as any })}
                          className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold">{mode.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-5.5">{mode.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* BOM Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Raw Material Requirements (Bill of Materials — BOM)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Link products to actual raw stock items (paper, vinyl, ink, blanks) to track availability.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBOMRequirement}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material Link</span>
                  </button>
                </div>

                {(formData.materialRequirements || []).length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No raw materials linked yet.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Add items like paper art boards or vinyl rolls to calculate real producible batch capacity.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                          <th className="p-3">Raw Material Item</th>
                          <th className="p-3">Qty Consumed</th>
                          <th className="p-3">For Product Units</th>
                          <th className="p-3">Warehouse Stock</th>
                          <th className="p-3">Producible</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(formData.materialRequirements || []).map((req, idx) => {
                          const inv = inventory.find(i => i.id === req.inventoryItemId);
                          const curStock = inv ? inv.currentStock : 0;
                          const batchSize = req.forProductQuantity > 0 ? req.forProductQuantity : 1;
                          const rate = req.quantityRequired / batchSize;
                          const producible = rate > 0 ? Math.floor(curStock / rate) : 999999;

                          return (
                            <tr key={req.id || idx} className="hover:bg-slate-50/50">
                              <td className="p-3">
                                <select
                                  value={req.inventoryItemId}
                                  onChange={e => handleUpdateBOMRequirement(idx, 'inventoryItemId', e.target.value)}
                                  className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                >
                                  {(inventory || []).map(invItem => (
                                    <option key={invItem.id} value={invItem.id}>
                                      {invItem.name} ({invItem.currentStock} {invItem.unit})
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={req.notes || ''}
                                  onChange={e => handleUpdateBOMRequirement(idx, 'notes', e.target.value)}
                                  placeholder="Notes e.g. 50 cards per sheet"
                                  className="w-full mt-1 p-1 text-[10px] bg-transparent border-b border-slate-200 focus:outline-hidden"
                                />
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.001"
                                    min={0.001}
                                    value={req.quantityRequired}
                                    onChange={e => handleUpdateBOMRequirement(idx, 'quantityRequired', Number(e.target.value))}
                                    className="w-20 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                  />
                                  <span className="text-[11px] text-slate-500">{req.unit}</span>
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    value={req.forProductQuantity}
                                    onChange={e => handleUpdateBOMRequirement(idx, 'forProductQuantity', Number(e.target.value))}
                                    className="w-20 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                                  />
                                  <span className="text-[11px] text-slate-500">units</span>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="font-semibold text-slate-900">
                                  {curStock.toLocaleString('en-IN')}
                                </span>{' '}
                                <span className="text-[10px] text-slate-400">{req.unit}</span>
                              </td>

                              <td className="p-3">
                                <span className="font-black text-slate-900">
                                  ~{producible.toLocaleString('en-IN')}
                                </span>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBOMRequirement(idx)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                                  title="Delete Requirement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRICE AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Price Change Audit Trail
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Historical log of all rate modifications, recorded with user identity, timestamp, and justification.
                  </p>
                </div>
              </div>

              {(formData.priceHistory || []).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No price adjustments logged yet.</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    Any future price edits will be permanently preserved here for accounting accountability.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Old Rate</th>
                        <th className="p-3">New Rate</th>
                        <th className="p-3">Modified By</th>
                        <th className="p-3">Reason / Justification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(formData.priceHistory || []).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-600 font-mono text-[11px]">
                            {new Date(item.changedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="p-3 text-slate-500 font-semibold line-through">
                            ₹{item.oldPrice}
                          </td>
                          <td className="p-3 text-emerald-700 font-black">
                            ₹{item.newPrice}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {item.changedBy}
                          </td>
                          <td className="p-3 text-slate-600 italic">
                            {item.reason || 'Catalog rate adjustment'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sticky Form Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Product & Rates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

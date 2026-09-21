import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  ShieldCheck,
  Truck,
  Upload,
  FileCheck,
  Trash2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Share2,
  Check
} from 'lucide-react';
import { Product, SelectedOption, InventoryItem } from '../types';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { calculateProductStock } from '../utils/stockCalculation';
import { getAssetUrl } from '../utils/assets';
import { fallbackProducts } from '../data/fallbackData';

interface ProductDetailPageProps {
  product?: Product;
  productSlug?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCart?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product: initialProduct,
  productSlug,
  onNavigate,
  onOpenCart
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialProduct);

  useEffect(() => {
    // Fetch raw inventory for live stock check
    api.getInventory().then(inv => setInventory(inv)).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }
    if (productSlug) {
      setLoading(true);
      api.getProduct(productSlug)
        .then(p => {
          setProduct(p);
        })
        .catch(err => {
          console.warn('API product fetch failed, checking fallback catalog:', err);
          const fallback = fallbackProducts.find(p => p.slug === productSlug || p.id === productSlug);
          if (fallback) {
            setProduct(fallback);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [initialProduct, productSlug]);

  // Live stock analysis
  const stockAnalysis = useMemo(() => {
    if (!product) return null;
    return calculateProductStock(product, inventory);
  }, [product, inventory]);

  // Selected Quantity
  const [selectedQuantity, setSelectedQuantity] = useState<number>(100);

  // Selected Options Map: { [groupName]: { valueName, priceModifier } }
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: { value: string; priceModifier: number } }>({});

  // Active Image Preview
  const [selectedImage, setSelectedImage] = useState<string>(() => {
    if (initialProduct) {
      return (initialProduct.images && initialProduct.images[0]) || initialProduct.image || '/images/products/visiting-cards-matte.jpg';
    }
    return '/images/products/visiting-cards-matte.jpg';
  });

  useEffect(() => {
    if (!product) return;
    const initialQty = (product.quantityTiers && product.quantityTiers[0]?.quantity) || (product.quantityTiers && product.quantityTiers[0]?.minQty) || product.minQuantity || 100;
    setSelectedQuantity(initialQty);

    const initialOpts: { [groupName: string]: { value: string; priceModifier: number } } = {};
    const groups = product.options || product.optionGroups || [];
    groups.forEach(grp => {
      const vals = grp.values || grp.options || [];
      const defaultVal = vals.find(v => v.isDefault) || vals[0];
      if (defaultVal) {
        initialOpts[grp.name] = {
          value: defaultVal.name,
          priceModifier: defaultVal.priceModifier || 0
        };
      }
    });
    setSelectedOptions(initialOpts);
    setSelectedImage((product.images && product.images[0]) || product.image || '/images/products/visiting-cards-matte.jpg');
  }, [product]);

  // Custom design notes
  const [customNotes, setCustomNotes] = useState('');

  // Artwork Upload state
  const [artworkFile, setArtworkFile] = useState<{
    name: string;
    filename: string;
    size: number;
    url: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [skipArtwork, setSkipArtwork] = useState(false);

  // Copied alert state
  const [copied, setCopied] = useState(false);

  // Handle Option Change
  const handleOptionSelect = (groupName: string, valueName: string, priceModifier: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: { value: valueName, priceModifier }
    }));
  };

  // Dynamic Price Calculation
  const { unitPrice, subtotal, taxAmount, totalEstimated } = useMemo(() => {
    if (!product) {
      return { unitPrice: 0, subtotal: 0, taxAmount: 0, totalEstimated: 0 };
    }

    // 1. Find quantity tier unit price
    const tiers = product.quantityTiers || [];
    const matchedTier = [...tiers]
      .reverse()
      .find(t => selectedQuantity >= (t.quantity || t.minQty || 0));

    const baseUnit = matchedTier ? (matchedTier.unitPrice || product.basePrice) : (product.basePrice / (product.minQuantity || 1));

    // 2. Add options price modifier
    const optionsExtra = Object.values(selectedOptions).reduce(
      (sum: number, opt: any) => sum + (opt.priceModifier || 0),
      0
    );

    const effectiveUnit = baseUnit;
    const computedSubtotal = Math.round((effectiveUnit * selectedQuantity) + Number(optionsExtra || 0));
    const tax = Math.round(computedSubtotal * 0.18);
    const total = computedSubtotal + tax;

    return {
      unitPrice: effectiveUnit,
      subtotal: computedSubtotal,
      taxAmount: tax,
      totalEstimated: total
    };
  }, [product, selectedQuantity, selectedOptions]);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await api.uploadArtwork(file);
      setArtworkFile(uploaded);
      setSkipArtwork(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload artwork file');
    } finally {
      setUploading(false);
    }
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (!product) return;

    const formattedOptions: SelectedOption[] = Object.entries(selectedOptions).map(
      ([groupName, data]: [string, any]) => ({
        groupName,
        valueName: data.value,
        priceModifier: data.priceModifier
      })
    );

    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      image: (product.images && product.images[0]) || product.image || '',
      quantity: selectedQuantity,
      unitPrice,
      selectedOptions: formattedOptions,
      artworkFile: artworkFile || undefined,
      customNotes: customNotes || undefined
    });

    if (onOpenCart) {
      onOpenCart();
    } else {
      setIsCartOpen(true);
    }
  };

  // WhatsApp 1-Click Order Link
  const getWhatsAppOrderLink = () => {
    if (!product) return '';

    const optionsText = Object.entries(selectedOptions)
      .map(([k, v]: [string, any]) => `${k}: ${v.value}`)
      .join(', ');

    const msg = `*ORDER INQUIRY — ${product.name}*
Quantity: ${selectedQuantity} units
Options: ${optionsText || 'Standard'}
Estimated Total: ₹${totalEstimated.toLocaleString('en-IN')} (incl. GST)
${customNotes ? `Notes: ${customNotes}\n` : ''}
Please confirm order and delivery schedule.`;

    return `https://wa.me/918557049897?text=${encodeURIComponent(msg)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading product configuration...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">The requested product could not be located in our catalog.</p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-blue-700">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('products')} className="hover:text-blue-700">
          Products
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('products', product.categoryId)}
          className="hover:text-blue-700 font-medium text-slate-700"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </div>

      {/* Main Product Section: Gallery + Interactive Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Col: Image Gallery & Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          {/* Main Hero Image */}
          <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-xs">
            <img
              src={getAssetUrl(selectedImage || (product.images && product.images[0]) || product.image || '/images/products/visiting-cards-matte.jpg')}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getAssetUrl('/images/products/visiting-cards-matte.jpg');
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />
            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              {product.category}
            </span>
          </div>

          {/* Thumbnail Gallery */}
          {(product.images || []).filter(img => Boolean(img && img.trim())).length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {(product.images || []).filter(img => Boolean(img && img.trim())).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-blue-600 scale-105 shadow-xs'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getAssetUrl(img)} alt="Product view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Technical Specs Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Technical Specifications</span>
              <button
                onClick={handleShare}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 normal-case font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share'}</span>
              </button>
            </h4>

            <div className="grid grid-cols-2 gap-3 divide-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Print Method</span>
                <span className="font-semibold text-slate-900">Commercial Heidelberg & Digital</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Turnaround Time</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-600" />
                  {product.productionTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Bleed & Safety</span>
                <span className="font-semibold text-slate-900">3mm Bleed, 300 DPI CMYK</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Standard Packaging</span>
                <span className="font-semibold text-slate-900">Moisture-Proof Box Packed</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-slate-400 block text-[10px] mb-1">Key Highlights</span>
              <div className="flex flex-wrap gap-1.5">
                {((product.features && product.features.length > 0)
                  ? product.features
                  : ['Pre-Press Inspection', '300 DPI CMYK', 'Prompt Delivery']
                ).map((feat, i) => (
                  <span
                    key={i}
                    className="bg-white border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Live Configurator & Cart Engine (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Title */}
          <div className="border-b border-slate-100 pb-5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Guaranteed Press Quality
              </span>
              {stockAnalysis && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stockAnalysis.badgeClass}`}>
                  {stockAnalysis.statusLabel}
                </span>
              )}
              <span className="text-slate-400 text-xs font-mono">SKU: {product.sku || product.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {product.name}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 1. QUANTITY SELECTION */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-xs uppercase tracking-wider text-slate-700">
                1. Select Quantity Tier
              </label>
              <span className="text-xs text-blue-600 font-semibold">
                Bulk discounts applied automatically
              </span>
            </div>

            {/* Quantity Tier Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(product.quantityTiers || []).map(tier => {
                const qty = tier.quantity ?? tier.minQty ?? 100;
                const isSelected = selectedQuantity === qty;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQuantity(qty)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-sm">{qty.toLocaleString('en-IN')} pcs</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ₹{(tier.unitPrice || 0).toFixed(2)}/pc
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CUSTOMIZATION OPTIONS (PAPER, FINISH, SIZES) */}
          <div className="space-y-5 pt-2 border-t border-slate-100">
            {(product.options || product.optionGroups || []).map(group => {
              const currentVal = selectedOptions[group.name]?.value;

              return (
                <div key={group.name} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold uppercase tracking-wider text-slate-700">
                      {group.name}
                    </label>
                    <span className="text-slate-500 font-medium">Selected: {currentVal}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(group.values || group.options || []).map(val => {
                      const isSelected = currentVal === val.name;
                      return (
                        <button
                          key={val.name}
                          type="button"
                          onClick={() => handleOptionSelect(group.name, val.name, val.priceModifier || 0)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          }`}
                        >
                          <span className="text-xs truncate pr-2">{val.name}</span>
                          {val.priceModifier ? (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                              +₹{val.priceModifier}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Included</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. ARTWORK UPLOAD DROPZONE */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Artwork / Logo Attachment
              </label>
              <span className="text-[11px] text-slate-500">PDF, AI, CDR, PSD, ZIP, PNG, JPG (Max 50MB)</span>
            </div>

            {artworkFile ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-emerald-950 truncate max-w-xs">{artworkFile.name}</div>
                    <div className="text-emerald-700">
                      {(artworkFile.size / 1024 / 1024).toFixed(2)} MB · Uploaded Successfully
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setArtworkFile(null)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                  title="Remove artwork"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="artwork-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.ai,.cdr,.psd,.eps,.zip,.png,.jpg,.jpeg"
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="artwork-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-blue-700 hover:underline">Click to upload file</span>
                    <span className="text-slate-500"> or drag and drop your artwork here</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High resolution (300 DPI) CMYK vector or image recommended.
                  </p>
                </label>

                {uploading && (
                  <div className="mt-3 text-xs text-blue-600 font-semibold animate-pulse">
                    Uploading & verifying file format...
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 text-xs text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Skip artwork checkbox */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <input
                type="checkbox"
                id="skip-art"
                checked={skipArtwork}
                onChange={e => setSkipArtwork(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="skip-art" className="cursor-pointer">
                I don't have artwork yet. Send design assistance or I will share on WhatsApp later.
              </label>
            </div>
          </div>

          {/* 4. CUSTOM NOTES */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Special Instructions / Notes (Optional)
            </label>
            <textarea
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="e.g. Specific Pantone shade, rounded corners on top right, deliver before Friday..."
              rows={2}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* 5. PRICE BREAKDOWN & ACTION CTAs */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>
                  Estimated Base ({selectedQuantity} pcs @ ₹{unitPrice.toFixed(2)}/pc)
                </span>
                <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% GSTIN Invoice)</span>
                <span className="font-semibold text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tricity Delivery / Pickup</span>
                <span className="text-emerald-400 font-semibold">
                  {subtotal >= 2000 ? 'FREE' : '₹99 (Free above ₹2,000)'}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline font-bold">
                <span className="text-sm">Total Payable</span>
                <span className="text-2xl text-cyan-400 font-black font-display">
                  ₹{totalEstimated.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {stockAnalysis?.status === 'OUT_OF_STOCK' ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white">Temporarily Out of Stock</span>
                    <p className="text-[11px] text-red-300">
                      Raw production materials are currently awaiting replenishment. Priority commercial orders can be scheduled via WhatsApp or Custom Quotation.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    disabled
                    className="w-full bg-slate-800 text-slate-500 font-bold py-3.5 px-4 rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Out of Stock</span>
                  </button>
                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire Restock on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : product.priceType === 'quote_only' || stockAnalysis?.status === 'QUOTE_ONLY' ? (
              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsAppOrderLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Custom Quotation</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>Add to Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppOrderLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Confirm on WhatsApp</span>
                </a>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center">
              *Digital proof sent on WhatsApp before printing. 100% satisfaction guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

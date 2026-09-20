import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  FileCheck,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getAssetUrl } from '../utils/assets';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onContinueShopping }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    subtotal,
    taxAmount,
    deliveryFee,
    finalTotal,
    freeDeliveryThreshold
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-base text-slate-900">Your Print Cart</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-blue-50/70 px-4 py-2.5 border-b border-blue-100 text-xs text-blue-900">
            {remainingForFreeDelivery > 0 ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Add ₹{remainingForFreeDelivery.toLocaleString('en-IN')} more for <strong>FREE Delivery</strong>
                  </span>
                  <span className="font-semibold">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Congratulations! You unlocked FREE Tricity Delivery.
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-slate-700">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Browse our visiting cards, stickers, flex banners, and custom packaging products to start your order.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="mt-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white space-y-2.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getAssetUrl((item.image && item.image.trim()) || '/images/products/visiting-cards-matte.jpg')}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getAssetUrl('/images/products/visiting-cards-matte.jpg');
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-xs text-slate-900 truncate">
                        {item.productName}
                      </h5>
                      <p className="text-[11px] text-slate-500">{item.category}</p>

                      {/* Selected Options Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(item.selectedOptions || []).map((opt, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium"
                          >
                            {opt.groupName}: {opt.valueName}
                          </span>
                        ))}
                      </div>

                      {item.artworkFile && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <FileCheck className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{item.artworkFile.name}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 50 > 0 ? item.quantity - 50 : 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 50)}
                        className="p-1 hover:bg-slate-100 text-slate-600"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span className="font-medium text-slate-800">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-slate-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-blue-700 font-extrabold text-base">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full bg-linear-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Continue Browsing Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

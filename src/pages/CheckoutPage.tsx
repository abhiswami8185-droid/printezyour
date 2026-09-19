import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Building,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order, whatsappData: any) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigate }) => {
  const {
    items,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount,
    finalTotal,
    clearCart
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Self Pickup'>('Delivery');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('UPI / QR Code');

  const [customer, setCustomer] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    email: '',
    company: '',
    deliveryAddress: '',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160002'
  });

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          You don't have any items in your cart to checkout.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: customer.name,
          mobile: customer.mobile,
          whatsapp: customer.whatsapp || customer.mobile,
          email: customer.email,
          company: customer.company || undefined,
          deliveryAddress: deliveryType === 'Self Pickup' ? 'Self Pickup at Hallo Majra Facility' : customer.deliveryAddress,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode
        },
        items: items.map(i => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          category: i.category,
          image: i.image,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedOptions: i.selectedOptions,
          customNotes: i.customNotes,
          artworkFile: i.artworkFile,
          subtotal: i.lineTotal
        })),
        subtotal,
        discountAmount,
        taxAmount,
        deliveryFee: deliveryType === 'Self Pickup' ? 0 : deliveryFee,
        totalAmount: deliveryType === 'Self Pickup' ? subtotal + taxAmount : finalTotal,
        deliveryType,
        paymentMethod,
        specialInstructions
      };

      const result = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(result.order, result.whatsapp);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          Finalize Your Print Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your items, provide delivery details, and secure your production slot.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Customer & Delivery Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Contact Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  value={customer.company}
                  onChange={e => setCustomer({ ...customer, company: e.target.value })}
                  placeholder="e.g. Verma Retailers Pvt Ltd"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={customer.mobile}
                  onChange={e => setCustomer({ ...customer, mobile: e.target.value })}
                  placeholder="e.g. 9812345678"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Mode & Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2">
              2. Delivery Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('Delivery')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  deliveryType === 'Delivery'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Truck className="w-5 h-5 text-blue-600" />
                <div className="text-xs">
                  <div className="font-bold">Doorstep Delivery</div>
                  <div className="text-slate-500 text-[10px]">Tricity & Pan-India Courier</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('Self Pickup')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  deliveryType === 'Self Pickup'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Building className="w-5 h-5 text-emerald-600" />
                <div className="text-xs">
                  <div className="font-bold">Self-Pickup</div>
                  <div className="text-slate-500 text-[10px]">Hallo Majra, Chandigarh</div>
                </div>
              </button>
            </div>

            {deliveryType === 'Delivery' ? (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={customer.deliveryAddress}
                    onChange={e => setCustomer({ ...customer, deliveryAddress: e.target.value })}
                    placeholder="House/Shop No., Street name, Landmark..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={customer.state}
                      onChange={e => setCustomer({ ...customer, state: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={customer.pincode}
                      onChange={e => setCustomer({ ...customer, pincode: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold">Pickup Location:</div>
                <div>PrintezYour, Plot No 1794, Gym Deep Complex, Hallo Majra, Chandigarh</div>
                <div className="text-[11px] text-emerald-700">
                  Ready notification will be sent on WhatsApp once printing and cutting are complete.
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-2">
              3. Payment Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI / QR Code')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  paymentMethod === 'UPI / QR Code'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>UPI / QR Code</span>
                </div>
                <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm QR</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Bank NEFT / RTGS</span>
                </div>
                <p className="text-[10px] text-slate-500">Official Company Account</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Cash on Pickup / COD</span>
                </div>
                <p className="text-[10px] text-slate-500">50% Advance for custom print</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Placement (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 sticky top-24">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs text-slate-500 font-normal">({items.length} items)</span>
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {(items || []).map(item => (
              <div key={item.id} className="flex items-center gap-3 text-xs border-b border-slate-100 pb-3">
                <img
                  src={(item.image && item.image.trim()) || '/images/products/visiting-cards-matte.jpg'}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 border shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/products/visiting-cards-matte.jpg')) {
                      target.src = '/images/products/visiting-cards-matte.jpg';
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-slate-900 truncate">{item.productName}</h5>
                  <div className="text-[11px] text-slate-500">
                    Qty: {item.quantity} · {(item.selectedOptions || []).map(o => o.valueName).join(', ')}
                  </div>
                  {item.artworkFile && (
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Artwork Attached
                    </div>
                  )}
                </div>
                <span className="font-bold text-slate-800 shrink-0">
                  ₹{item.lineTotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-b pb-4 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% Business Tax)</span>
              <span className="font-semibold text-slate-800">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-semibold text-slate-800">
                {deliveryType === 'Self Pickup' ? (
                  <span className="text-emerald-600">Self Pickup (₹0)</span>
                ) : deliveryFee === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="text-blue-700 text-lg">
                ₹{(deliveryType === 'Self Pickup' ? subtotal + taxAmount : finalTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Generate ID'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe & Secure Commercial Checkout</span>
            </div>
            <p>Digital proof sent to WhatsApp before production begins.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

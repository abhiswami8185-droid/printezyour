import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  FileCheck,
  Printer,
  PackageCheck,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderId, onNavigate }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (targetId?: string) => {
    const idToSearch = targetId || orderId;
    if (!idToSearch.trim()) {
      setError('Please enter your Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.trackOrder(idToSearch.trim(), phone.trim() || undefined);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No order found with this reference.');
    } finally {
      setLoading(false);
    }
  };

  const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { status: 'New', label: 'Order Placed', icon: <Clock className="w-4 h-4" /> },
    { status: 'Confirmed', label: 'Confirmed', icon: <CheckCircle2 className="w-4 h-4" /> },
    { status: 'Artwork Approved', label: 'Artwork Verified', icon: <FileCheck className="w-4 h-4" /> },
    { status: 'In Production', label: 'On Press', icon: <Printer className="w-4 h-4" /> },
    { status: 'Quality Check', label: 'Quality Check', icon: <ShieldCheck className="w-4 h-4" /> },
    { status: 'Ready for Pickup', label: 'Ready / Dispatched', icon: <PackageCheck className="w-4 h-4" /> },
    { status: 'Delivered', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === 'Out for Delivery') return 5;
    if (currentStatus === 'Completed') return 6;
    const idx = steps.findIndex(s => s.status === currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Real-Time Transparency
        </span>
        <h1 className="text-3xl font-black text-slate-900 font-display">
          Track Your Print Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your unique Order ID (e.g. PY-XXXXXX) to view live pre-press proofing and production updates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. PY-104822"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono tracking-wider focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile</label>
            <input
              type="tel"
              placeholder="e.g. 9812345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-5 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
              <div className="text-2xl font-black font-mono text-slate-900">{order.id}</div>
              <div className="text-xs text-slate-500">
                Customer: <strong className="text-slate-800">{order.customer.name}</strong> · Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                Current Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Visual Step Progress Bar */}
          <div className="py-4">
            <div className="relative">
              {/* Desktop Stepper */}
              <div className="hidden sm:grid sm:grid-cols-7 gap-2 text-center">
                {steps.map((step, idx) => {
                  const currentIdx = getStepIndex(order.orderStatus);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.status} className="flex flex-col items-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        } ${isCurrent ? 'ring-4 ring-blue-100 font-bold' : ''}`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`text-[11px] font-semibold leading-tight ${
                          isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stepper Pill */}
              <div className="sm:hidden bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Current Phase</div>
                  <div className="text-sm font-extrabold text-blue-700">{order.orderStatus}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items in this order */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Items in this Order
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y text-xs">
              {(order.items || []).map(item => (
                <div key={item.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-slate-500 text-[11px]">
                      Qty: {item.quantity} units · {(item.selectedOptions || []).map(o => o.valueName).join(', ')}
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Audit / Activity Log */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Production History & Timeline
            </h4>
            <div className="space-y-2 text-xs">
              {(order.statusHistory || []).map((hist, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hist.status}</span>
                      <span className="text-[11px] text-slate-400">{hist.timestamp}</span>
                    </div>
                    {hist.notes && <p className="text-slate-600 mt-0.5">{hist.notes}</p>}
                    <span className="text-[10px] text-slate-400 block mt-0.5">Updated by {hist.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Inquiries */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Have questions regarding artwork proof or urgent delivery?
            </div>
            <a
              href={`https://wa.me/918557049897?text=Hello%20Printezyour%2C%20inquiry%20regarding%20Order%20ID%20${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Press Operator on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

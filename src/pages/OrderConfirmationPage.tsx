import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  Printer,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileCheck,
  Receipt,
  Download
} from 'lucide-react';
import { Order, BusinessSettings } from '../types';
import { api } from '../services/api';
import { BillingModal } from '../components/billing/BillingModal';

interface OrderConfirmationPageProps {
  order: Order;
  whatsappData?: any;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  whatsappData,
  onNavigate
}) => {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const waLink = whatsappData?.waLink || `https://wa.me/918557049897?text=Hello%20Printezyour%2C%20I%20placed%20Order%20${order.id}.%20Please%20confirm%20artwork.`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 print:p-0">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
          Thank You, {order.customer.name}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          We have received your print order. Your dedicated Order ID has been registered in our production queue.
        </p>
      </div>

      {/* Order ID & WhatsApp Action Card */}
      <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
        <div className="space-y-1">
          <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
            Your Official Order ID
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider">
            {order.id}
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-md mx-auto">
          To accelerate artwork approval and get direct updates from our press operators, confirm your order on WhatsApp now.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Confirm on WhatsApp (+91 8557049897)</span>
          </a>

          <button
            onClick={() => onNavigate('track', order.id)}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl text-xs backdrop-blur-xs transition-colors"
          >
            Track Status Online
          </button>
        </div>
      </div>

      {/* Printable Invoice / Order Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="font-bold text-sm text-slate-900">Tax Invoice & Order Slip</div>
            <div className="text-[11px] text-slate-500">PrintezYour Commercial Printing Hub</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBillingModal(true)}
              className="print:hidden text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold transition-all shadow-xs border border-blue-200"
              title="Open full statutory GST or Non-GST invoice generator"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>GST / Non-GST Invoice</span>
            </button>
            <button
              onClick={handlePrint}
              className="print:hidden text-xs flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold px-2 py-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px]">Customer Details</span>
            <strong className="text-slate-900">{order.customer.name}</strong>
            <div>{order.customer.mobile}</div>
            <div>{order.customer.email}</div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Delivery Address ({order.deliveryType})</span>
            <div className="text-slate-900">{order.customer.deliveryAddress}</div>
            <div>
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[11px] text-slate-500 font-semibold">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      {(item.selectedOptions || []).map(o => `${o.groupName}: ${o.valueName}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700">{item.quantity}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Calculations */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (18% Invoiced)</span>
            <span className="font-semibold text-slate-800">₹{order.taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-slate-800">
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
            <span>Total Paid / Payable ({order.paymentMethod})</span>
            <span className="text-blue-700 text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Next Step Guidance */}
      <div className="text-center print:hidden">
        <button
          onClick={() => onNavigate('home')}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
        >
          &larr; Back to PrintezYour Homepage
        </button>
      </div>

      {/* Production Billing Modal */}
      {showBillingModal && (
        <BillingModal
          order={order}
          settings={settings}
          onClose={() => setShowBillingModal(false)}
        />
      )}
    </div>
  );
};

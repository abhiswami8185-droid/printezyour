import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  MessageSquare,
  Eye,
  X,
  AlertCircle,
  Truck,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, BusinessSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getAssetUrl } from '../../utils/assets';
import { BillingModal } from '../../components/billing/BillingModal';

interface AdminOrdersProps {
  orders: Order[];
  settings?: BusinessSettings | null;
  onOrderUpdated: () => void;
  selectedOrderId?: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders = [], settings = null, onOrderUpdated, selectedOrderId }) => {
  const { role, user } = useAuth();
  const safeOrders = Array.isArray(orders) ? orders : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(settings);

  React.useEffect(() => {
    if (!businessSettings) {
      api.getSettings().then(setBusinessSettings).catch(() => {});
    }
  }, [businessSettings]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    if (selectedOrderId) {
      return safeOrders.find(o => o.id === selectedOrderId) || null;
    }
    return null;
  });

  const [newStatus, setNewStatus] = useState<OrderStatus>('In Production');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = safeOrders.filter(o => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.mobile.includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusUpdate = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateOrderStatus(
        activeOrder.id,
        newStatus,
        statusNotes,
        user?.name || 'Admin',
        role
      );
      setActiveOrder(updated);
      setStatusNotes('');
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentUpdate = async (paymentStatus: PaymentStatus) => {
    if (!activeOrder) return;
    try {
      const updated = await api.updateOrderPayment(activeOrder.id, paymentStatus, role);
      setActiveOrder(updated);
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const statuses: OrderStatus[] = [
    'New',
    'Confirmed',
    'Artwork Pending',
    'Artwork Approved',
    'In Production',
    'Quality Check',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered',
    'Completed',
    'Cancelled'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Order Production Management
          </h2>
          <p className="text-xs text-slate-500">
            Track customer print orders, approve pre-press artwork proofs, and update press phases.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, customer, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'New', 'Artwork Approved', 'In Production', 'Ready for Pickup', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer & Mobile</th>
                <th className="p-3.5">Items Summary</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Payment</th>
                <th className="p-3.5 text-center">Press Status</th>
                <th className="p-3.5 text-center">Artwork</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                (filteredOrders || []).map(order => {
                  const hasArtwork = (order.items || []).some(i => i.artworkFile);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-blue-700">
                        {order.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.customer.mobile} {order.customer.company ? `· ${order.customer.company}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">
                          {(order.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.deliveryType} · {order.customer.city}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {hasArtwork ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <FileCheck className="w-3 h-3" /> Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No File</span>
                        )}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setBillingOrder(order)}
                            className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="Generate GST or Non-GST Invoice"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Bill</span>
                          </button>
                          <button
                            onClick={() => setActiveOrder(order)}
                            className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Order Management Console
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 flex items-center gap-3">
                  <span>{activeOrder.id}</span>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                    {activeOrder.orderStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick WhatsApp Action Strip */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-emerald-900">
                Customer Phone: <strong>{activeOrder.customer.mobile}</strong> ({activeOrder.customer.name})
              </div>
              <a
                href={`https://wa.me/${activeOrder.customer.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(activeOrder.customer.name)}%2C%20regarding%20your%20PrintezYour%20Order%20${activeOrder.id}%3A%20`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Client on WhatsApp</span>
              </a>
            </div>

            {/* Order Items & Options */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Items on Press
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y text-xs">
                {(activeOrder.items || []).map(item => (
                  <div key={item.id} className="p-4 flex items-start gap-4">
                    <img
                      src={getAssetUrl((item.image && item.image.trim()) || '/images/products/visiting-cards-matte.jpg')}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 border shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getAssetUrl('/images/products/visiting-cards-matte.jpg');
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Quantity: <strong>{item.quantity}</strong> units · Category: {item.category}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(item.selectedOptions || []).map((o, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {o.groupName}: {o.valueName}
                          </span>
                        ))}
                      </div>

                      {item.artworkFile && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={item.artworkFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Download Artwork ({item.artworkFile.name})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-right font-bold text-slate-900">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Payment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Status Update Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Advance Press Status
                </div>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  {statuses.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Operator notes (e.g. Plates cut, on Heidelberg press)"
                  value={statusNotes}
                  onChange={e => setStatusNotes(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />

                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Commit Status Update'}
                </button>
              </div>

              {/* Payment Status Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Payment Status
                </div>
                <div className="text-slate-600">
                  Total: <strong>₹{activeOrder.totalAmount.toLocaleString('en-IN')}</strong> ({activeOrder.paymentMethod})
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['Pending', 'Partial', 'Paid'] as PaymentStatus[]).map(ps => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handlePaymentUpdate(ps)}
                      className={`p-2 rounded-lg font-bold text-xs border transition-all ${
                        activeOrder.paymentStatus === ps
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBillingOrder(activeOrder)}
                    className="w-full bg-slate-900 hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-cyan-400" />
                    <span>Generate & Print Bill (GST / Non-GST)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Audit History Log */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Production Audit Trail
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-2 text-xs pr-1">
                {(activeOrder.statusHistory || []).map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{h.status}</span>
                      {h.notes && <span className="text-slate-600 ml-2">({h.notes})</span>}
                      <span className="text-[10px] text-slate-400 block">by {h.updatedBy}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Billing Modal */}
      {billingOrder && (
        <BillingModal
          order={billingOrder}
          settings={businessSettings}
          onClose={() => setBillingOrder(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  AlertTriangle,
  Users,
  FileText,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { Order } from '../../types';

interface DashboardMetrics {
  totalOrders: number;
  newOrders: number;
  inProduction: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  totalCustomers: number;
  lowStockItems: number;
  activeQuotes: number;
  salesChart: { date: string; sales: number }[];
  recentOrders: Order[];
}

interface AdminDashboardProps {
  metrics: DashboardMetrics | null;
  onNavigateTab: (tab: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ metrics, onNavigateTab }) => {
  if (!metrics) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Loading real-time enterprise metrics...
      </div>
    );
  }

  const salesList = metrics.salesChart || [];
  const maxSales = salesList.length > 0 ? Math.max(...salesList.map(s => s.sales), 1000) : 1000;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Business Operations Overview
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry across orders, production press, raw material inventory, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Press System
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Billed Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pending: ₹{metrics.pendingPayments.toLocaleString('en-IN')}</span>
            <span className="text-emerald-600 font-bold">+14% vs last week</span>
          </div>
        </div>

        {/* Active Production Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active on Press</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {metrics.inProduction} Orders
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="text-blue-600 font-semibold">{metrics.newOrders} New Pending</span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-blue-700 font-bold hover:underline"
            >
              View Queue
            </button>
          </div>
        </div>

        {/* Quotations Awaiting Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {metrics.activeQuotes} Pending
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Customer Inquiries</span>
            <button
              onClick={() => onNavigateTab('quotes')}
              className="text-pink-600 font-bold hover:underline"
            >
              Review
            </button>
          </div>
        </div>

        {/* Low Stock Raw Materials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock Materials</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {metrics.lowStockItems} Items
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Plates / Inks / Papers</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-amber-600 font-bold hover:underline"
            >
              Restock
            </button>
          </div>
        </div>
      </div>

      {/* Sales Trend Bar Visualizer + Quick Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart (7-day trend) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Revenue Flow (Last 7 Days)</h3>
              <p className="text-[11px] text-slate-500">Orders placed across web, WhatsApp, and facility walk-ins</p>
            </div>
            <span className="text-xs font-semibold text-blue-700">₹ INR Daily</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {(metrics.salesChart || []).map((point, idx) => {
              const heightPercent = Math.max(8, Math.round((point.sales / maxSales) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{point.sales > 0 ? (point.sales / 1000).toFixed(1) + 'k' : '0'}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end">
                    <div
                      className="w-full bg-linear-to-t from-blue-700 to-cyan-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{point.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Pipeline Status Health</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>New Unreviewed</span>
                <span className="text-blue-600 font-bold">{metrics.newOrders}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(metrics.newOrders / Math.max(metrics.totalOrders, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>In Production / Press</span>
                <span className="text-amber-600 font-bold">{metrics.inProduction}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(metrics.inProduction / Math.max(metrics.totalOrders, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Delivered & Completed</span>
                <span className="text-emerald-600 font-bold">{metrics.completedOrders}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(metrics.completedOrders / Math.max(metrics.totalOrders, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Cancelled / Rejected</span>
                <span className="text-slate-400 font-bold">{metrics.cancelledOrders}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-300 h-full rounded-full"
                  style={{ width: `${(metrics.cancelledOrders / Math.max(metrics.totalOrders, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
            <p className="text-[11px] text-slate-500">Latest jobs entering the press queue</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
          >
            <span>View All Orders ({metrics.totalOrders})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product Summary</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Payment</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics.recentOrders || []).map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5 font-mono font-bold text-blue-700">
                    {order.id}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{order.customer.name}</div>
                    <div className="text-[11px] text-slate-400">{order.customer.mobile}</div>
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-slate-700">
                    {(order.items || []).map(i => `${i.productName} (${i.quantity})`).join(', ')}
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
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => onNavigateTab('orders', order.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminInventoryProps {
  inventory: InventoryItem[];
  onInventoryUpdated: () => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ inventory = [], onInventoryUpdated }) => {
  const { role, user } = useAuth();
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<'Restock' | 'Production Consumption' | 'Damaged / Spoilage' | 'Audit Correction'>('Restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'Paper', 'Ink', 'Plates', 'Finishing', 'Packaging'];

  const filteredItems = safeInventory.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    setIsSubmitting(true);

    const change = adjustReason === 'Production Consumption' || adjustReason === 'Damaged / Spoilage'
      ? -Math.abs(adjustQuantity)
      : Math.abs(adjustQuantity);

    try {
      await api.adjustInventory(
        activeItem.id,
        change,
        adjustReason,
        user?.name || 'Admin',
        adjustNotes,
        role
      );
      setActiveItem(null);
      setAdjustQuantity(10);
      setAdjustNotes('');
      onInventoryUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minimumThreshold).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Raw Materials & Consumables Warehouse
          </h2>
          <p className="text-xs text-slate-500">
            Real-time stock of paper substrates, CMYK process inks, CTP offset plates, and thermal lamination rolls.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{lowStockCount} Items Below Minimum Threshold</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search material SKU, name, mill supplier..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(categories || []).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">SKU / Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Safety Threshold</th>
                <th className="p-3.5 text-right">Cost Per Unit</th>
                <th className="p-3.5">Mill / Vendor</th>
                <th className="p-3.5 pr-5 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(filteredItems || []).map(item => {
                const isLow = item.currentStock <= item.minimumThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.sku} · {item.location}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-sm font-black ${isLow ? 'text-amber-600 font-bold' : 'text-slate-900'}`}>
                          {item.currentStock.toLocaleString('en-IN')} {item.unit}
                        </span>
                        {isLow && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center text-slate-500">
                      {item.minimumThreshold} {item.unit}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      ₹{item.costPerUnit}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {item.supplier}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="bg-blue-50 hover:bg-blue-700 text-blue-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stock Log & Reconciliation
                </span>
                <h3 className="text-lg font-black text-slate-900">{activeItem.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Current Balance: {activeItem.currentStock} {activeItem.unit}
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment *</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Restock">Restock / Material Received (+)</option>
                  <option value="Production Consumption">Production Press Consumption (-)</option>
                  <option value="Damaged / Spoilage">Damaged / Press Spoilage (-)</option>
                  <option value="Audit Correction">Physical Audit Correction (Manual Adjust)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity ({activeItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQuantity}
                  onChange={e => setAdjustQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Reference Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery challan #408 or Job PY-104822 offset run"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Logging...' : 'Commit Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

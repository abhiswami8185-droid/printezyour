import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  Package,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';
import { PurchaseOrder, InventoryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AdminPurchasesProps {
  purchases: PurchaseOrder[];
  inventory: InventoryItem[];
  onPurchasesUpdated: () => void;
}

export const AdminPurchases: React.FC<AdminPurchasesProps> = ({
  purchases,
  inventory,
  onPurchasesUpdated
}) => {
  const { role } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New PO form state
  const [supplierName, setSupplierName] = useState('ITC Bhadrachalam Paper Mills');
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState(100);
  const [notes, setNotes] = useState('');

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    try {
      await api.createPurchaseOrder(
        {
          supplierName,
          items: [
            {
              inventoryItemId: item.id,
              name: item.name,
              quantity,
              unitPrice: item.costPerUnit,
              unit: item.unit
            }
          ],
          totalAmount: quantity * item.costPerUnit,
          notes
        },
        role
      );
      setIsCreating(false);
      onPurchasesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to create PO');
    }
  };

  const handleReceivePO = async (poId: string) => {
    setReceivingId(poId);
    try {
      await api.receivePurchaseOrder(poId, role);
      alert('Purchase Order marked as Received! Warehouse inventory updated automatically.');
      onPurchasesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to receive PO');
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Supplier Procurement & Purchase Orders
          </h2>
          <p className="text-xs text-slate-500">
            Issue procurement orders to paper mills and ink distributors. Receiving automatically updates raw inventory.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="p-3.5 pl-5">PO Number</th>
                <th className="p-3.5">Supplier / Paper Mill</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5 text-right">Total Valuation</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-5 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(purchases || []).map(po => (
                <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5 font-mono font-bold text-blue-700">
                    {po.id}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{po.supplierName}</div>
                    <div className="text-[10px] text-slate-400">Created: {po.createdAt}</div>
                  </td>
                  <td className="p-3.5 max-w-xs">
                    {(po.items || []).map((it, idx) => (
                      <div key={idx} className="font-medium text-slate-800">
                        {it.name}: <strong>{it.quantity} {it.unit}</strong> @ ₹{it.unitPrice}
                      </div>
                    ))}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    ₹{po.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        po.status === 'Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'Issued'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    {po.status !== 'Received' ? (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        disabled={receivingId === po.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ml-auto transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{receivingId === po.id ? 'Receiving...' : 'Receive Stock'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added to Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Procurement Order
                </span>
                <h3 className="text-lg font-black text-slate-900">Issue New Purchase Order</h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier / Mill *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Raw Material Item *</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  {(inventory || []).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Current Stock: {item.currentStock} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Order Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Procurement Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30 days payment terms, dispatch by Friday"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-lg transition-colors"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

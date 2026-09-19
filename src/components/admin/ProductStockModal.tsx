import React from 'react';
import {
  X,
  Layers,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Package
} from 'lucide-react';
import { Product, InventoryItem } from '../../types';
import { calculateProductStock } from '../../utils/stockCalculation';

interface ProductStockModalProps {
  product: Product;
  inventory: InventoryItem[];
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProductStockModal: React.FC<ProductStockModalProps> = ({
  product,
  inventory,
  onClose,
  onNavigateTab
}) => {
  const stockAnalysis = calculateProductStock(product, inventory);
  const requirements = product.materialRequirements || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Inventory & BOM Capacity
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stockAnalysis.badgeClass}`}>
                  {stockAnalysis.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {product.name} &bull; <span className="font-mono text-slate-700">{product.sku || 'No SKU'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Manufacturing Capacity
            </span>
            <div className="text-xl font-black text-slate-900 font-display">
              {stockAnalysis.isMadeToOrder
                ? 'On Demand'
                : `~${stockAnalysis.maxProducibleCapacity.toLocaleString('en-IN')} pcs`}
            </div>
            <span className="text-[11px] text-slate-500">
              Min Order: {product.minQuantity} units
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Stock Calculation Mode
            </span>
            <div className="text-sm font-bold text-slate-900 capitalize">
              {(product.stockMode || 'inventory_calculated').replace(/_/g, ' ')}
            </div>
            <span className="text-[11px] text-slate-500">
              {product.stockMode === 'made_to_order' ? 'Lead time: +2 days' : 'Dynamic warehouse sync'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Limiting Raw Material
            </span>
            <div className="text-xs font-bold text-slate-800 truncate" title={stockAnalysis.limitingMaterialName || 'None'}>
              {stockAnalysis.limitingMaterialName || 'None (Ample)'}
            </div>
            <span className="text-[11px] text-slate-500">
              Determines max batch size
            </span>
          </div>
        </div>

        {/* Bottleneck Warning if Out of Stock or Low Stock */}
        {stockAnalysis.status === 'OUT_OF_STOCK' && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block">Production Halted — Insufficient Raw Stock</span>
              <p>
                Warehouse stock for <strong className="font-semibold">{stockAnalysis.limitingMaterialName}</strong> is
                depleted below the minimum order threshold of {product.minQuantity} units. Customers cannot purchase
                this item until raw material purchase orders are received.
              </p>
            </div>
          </div>
        )}

        {stockAnalysis.status === 'LOW_STOCK' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block">Low Raw Stock Advisory</span>
              <p>
                Current raw inventory supports approximately {stockAnalysis.maxProducibleCapacity.toLocaleString('en-IN')}{' '}
                units before running out of <strong className="font-semibold">{stockAnalysis.limitingMaterialName}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Bill of Materials Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Linked Raw Materials (Bill of Materials — BOM)
            </h4>
            <span className="text-[11px] text-slate-400">
              {requirements.length} {requirements.length === 1 ? 'material requirement' : 'material requirements'}
            </span>
          </div>

          {requirements.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold">No raw material requirements configured for this product.</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Edit the product and configure the Bill of Materials to enable inventory tracking.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3">Raw Inventory Item</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Consumption Ratio</th>
                    <th className="p-3">Max Producible</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stockAnalysis.materialBreakdown || []).map((item, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/50 ${item.isLimiting ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {item.inventoryItem?.name || item.requirement.inventoryItemName || 'Unknown Material'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.inventoryItem?.sku || item.requirement.inventorySku || item.requirement.inventoryItemId}
                        </div>
                        {item.requirement.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            {item.requirement.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">
                          {item.currentStock.toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">{item.requirement.unit}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-slate-700">
                          {item.requirement.quantityRequired} {item.requirement.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          per {item.requirement.forProductQuantity} units
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-black ${item.isLimiting ? 'text-amber-700' : 'text-slate-900'}`}>
                          {item.producibleUnits === 999999
                            ? 'Unlimited'
                            : `~${item.producibleUnits.toLocaleString('en-IN')}`}
                        </span>
                        {item.isLimiting && (
                          <span className="block text-[9px] font-bold uppercase text-amber-600">
                            Bottleneck
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {onNavigateTab ? (
            <button
              onClick={() => {
                onClose();
                onNavigateTab('inventory');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5"
            >
              <span>Manage Warehouse Stock</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

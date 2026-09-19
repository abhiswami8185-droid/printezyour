import { Product, InventoryItem, ProductAvailabilityStatus, ProductMaterialRequirement } from '../types';

export interface MaterialRequirementCheck {
  requirement: ProductMaterialRequirement;
  inventoryItem?: InventoryItem;
  currentStock: number;
  ratePerUnit: number;
  producibleUnits: number;
  isLimiting: boolean;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface ProductStockAnalysis {
  status: ProductAvailabilityStatus;
  statusLabel: string;
  badgeClass: string;
  maxProducibleCapacity: number;
  limitingMaterialName?: string;
  isOrderable: boolean;
  isQuoteOnly: boolean;
  isMadeToOrder: boolean;
  materialBreakdown: MaterialRequirementCheck[];
  note?: string;
}

/**
 * Calculates real-time manufacturing capacity and product availability
 * from raw inventory items and configured material requirements (Bill of Materials).
 */
export function calculateProductStock(
  product: Product,
  inventory: InventoryItem[]
): ProductStockAnalysis {
  // 1. Check if product is disabled/archived
  if (!product.isActive || product.isArchived || product.stockMode === 'disabled') {
    return {
      status: 'DISABLED',
      statusLabel: 'Disabled / Inactive',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      maxProducibleCapacity: 0,
      isOrderable: false,
      isQuoteOnly: false,
      isMadeToOrder: false,
      materialBreakdown: [],
      note: 'Product is deactivated by store administration.'
    };
  }

  // 2. Check if product is Quote Only
  if (product.stockMode === 'quote_only' || product.priceType === 'quote_only') {
    return {
      status: 'QUOTE_ONLY',
      statusLabel: 'Custom Quote Only',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      maxProducibleCapacity: 0,
      isOrderable: true, // Can submit quote
      isQuoteOnly: true,
      isMadeToOrder: false,
      materialBreakdown: [],
      note: 'Custom specifications require direct technical review & quotation.'
    };
  }

  // 3. Check if product is explicitly configured as Made to Order
  if (product.stockMode === 'made_to_order') {
    return {
      status: 'MADE_TO_ORDER',
      statusLabel: 'Made to Order',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      maxProducibleCapacity: 99999,
      isOrderable: true,
      isQuoteOnly: false,
      isMadeToOrder: true,
      materialBreakdown: [],
      note: 'Procured on demand. Production proceeds upon order placement.'
    };
  }

  // 4. Manual override if specified
  if (product.manualStatus && product.manualStatus !== 'IN_STOCK' && product.stockMode !== 'inventory_calculated') {
    const isOutOfStock = product.manualStatus === 'OUT_OF_STOCK';
    return {
      status: product.manualStatus,
      statusLabel: product.manualStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock',
      badgeClass: isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200',
      maxProducibleCapacity: isOutOfStock ? 0 : (product.minQuantity || 100),
      isOrderable: !isOutOfStock,
      isQuoteOnly: false,
      isMadeToOrder: false,
      materialBreakdown: [],
      note: 'Manual administrative stock override active.'
    };
  }

  const requirements = product.materialRequirements || [];

  // If no material requirements are configured yet, treat as In Stock with nominal capacity
  if (requirements.length === 0) {
    return {
      status: 'IN_STOCK',
      statusLabel: 'In Stock',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      maxProducibleCapacity: 10000,
      isOrderable: true,
      isQuoteOnly: false,
      isMadeToOrder: false,
      materialBreakdown: [],
      note: 'No material constraint configured; standard press capacity available.'
    };
  }

  // 5. Calculate real-time consumption from Raw Inventory
  const minQty = product.minQuantity || 1;
  let minProducible = Infinity;
  let limitingItemName: string | undefined = undefined;

  const checks: MaterialRequirementCheck[] = requirements.map(req => {
    const inv = inventory.find(i => i.id === req.inventoryItemId);
    const currentStock = inv ? inv.currentStock : 0;
    const batchSize = req.forProductQuantity > 0 ? req.forProductQuantity : 1;
    const ratePerUnit = req.quantityRequired / batchSize; // e.g. 10 sheets / 500 cards = 0.02 sheets/card

    const producibleUnits = ratePerUnit > 0 ? Math.floor(currentStock / ratePerUnit) : 999999;

    let itemStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (producibleUnits < minQty || currentStock <= 0) {
      itemStatus = 'Out of Stock';
    } else if (producibleUnits <= minQty * 3 || (inv && inv.currentStock <= inv.minStock)) {
      itemStatus = 'Low Stock';
    }

    if (producibleUnits < minProducible) {
      minProducible = producibleUnits;
      limitingItemName = inv ? inv.name : req.inventoryItemName || 'Raw Material';
    }

    return {
      requirement: req,
      inventoryItem: inv,
      currentStock,
      ratePerUnit,
      producibleUnits,
      isLimiting: false,
      status: itemStatus
    };
  });

  const finalCapacity = minProducible === Infinity ? 0 : Math.max(0, minProducible);

  // Mark the limiting material in the check list
  checks.forEach(c => {
    if (c.producibleUnits === finalCapacity) {
      c.isLimiting = true;
    }
  });

  // Determine overall status
  if (finalCapacity < minQty) {
    return {
      status: 'OUT_OF_STOCK',
      statusLabel: 'Out of Stock',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      maxProducibleCapacity: 0,
      limitingMaterialName: limitingItemName,
      isOrderable: false,
      isQuoteOnly: false,
      isMadeToOrder: false,
      materialBreakdown: checks,
      note: `Insufficient raw material: ${limitingItemName || 'Inventory depleted'}. Reorder required before manufacturing.`
    };
  }

  if (finalCapacity <= minQty * 3) {
    return {
      status: 'LOW_STOCK',
      statusLabel: `Low Stock (~${finalCapacity.toLocaleString('en-IN')} pcs)`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      maxProducibleCapacity: finalCapacity,
      limitingMaterialName: limitingItemName,
      isOrderable: true,
      isQuoteOnly: false,
      isMadeToOrder: false,
      materialBreakdown: checks,
      note: `Limited by ${limitingItemName} stock. Max capacity: ${finalCapacity.toLocaleString('en-IN')} units.`
    };
  }

  return {
    status: 'IN_STOCK',
    statusLabel: `In Stock (~${finalCapacity.toLocaleString('en-IN')} pcs)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    maxProducibleCapacity: finalCapacity,
    limitingMaterialName: limitingItemName,
    isOrderable: true,
    isQuoteOnly: false,
    isMadeToOrder: false,
    materialBreakdown: checks,
    note: `Ample raw inventory available. Maximum production: ~${finalCapacity.toLocaleString('en-IN')} units.`
  };
}

/**
 * Check if a specific option variant (e.g. 350 GSM vs 400 GSM cardstock) is available
 */
export function checkOptionVariantStock(
  product: Product,
  optionValueId: string,
  inventory: InventoryItem[]
): { isAvailable: boolean; reason?: string } {
  if (!product.isActive || product.isArchived) {
    return { isAvailable: false, reason: 'Product inactive' };
  }

  // Check if any material requirement is tied to this specific optionValueId
  const req = (product.materialRequirements || []).find(r => r.optionValueId === optionValueId);
  if (!req) return { isAvailable: true };

  const inv = inventory.find(i => i.id === req.inventoryItemId);
  if (!inv || inv.currentStock < req.quantityRequired) {
    return {
      isAvailable: false,
      reason: `${inv?.name || 'Raw material'} out of stock`
    };
  }

  return { isAvailable: true };
}

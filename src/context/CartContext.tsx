import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'lineTotal'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;
  freeDeliveryThreshold: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('printezyour_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const freeDeliveryThreshold = 2000;

  useEffect(() => {
    try {
      localStorage.setItem('printezyour_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }, [items]);

  const calculateLineTotal = (unitPrice: number, quantity: number, options?: CartItem['selectedOptions']) => {
    const optionsExtra = (options || []).reduce((sum, opt) => sum + (opt.priceModifier || 0), 0);
    return Math.round((unitPrice * quantity) + optionsExtra);
  };

  const addItem = (itemInput: Omit<CartItem, 'id' | 'lineTotal'>) => {
    const lineTotal = calculateLineTotal(itemInput.unitPrice, itemInput.quantity, itemInput.selectedOptions);
    const newItem: CartItem = {
      ...itemInput,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lineTotal
    };

    setItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.id === id) {
          const lineTotal = calculateLineTotal(i.unitPrice, quantity, i.selectedOptions);
          return { ...i, quantity, lineTotal };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const taxAmount = Math.round(subtotal * 0.18); // 18% GST standard for printing
  const deliveryFee = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 99;
  const discountAmount = 0;
  const finalTotal = subtotal + taxAmount + deliveryFee - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemCount,
        subtotal,
        taxAmount,
        deliveryFee,
        discountAmount,
        finalTotal,
        freeDeliveryThreshold,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

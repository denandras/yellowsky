"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type CartItem = {
  id: string;
  priceId: string;
  productId: string;
  productName: string;
  productTitle: string;
  size: string;
  price: number;
  currency: string;
  viewUrl: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "yellowsky-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Check if item already exists (same product + size)
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getItemCount = () => items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/types/database';

const STORAGE_KEY = 'tps3r_cart_v1';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, qty?: number) => void;
  addCustomItem: (item: CartItem) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setItems(parsed as CartItem[]);
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Abaikan quota error
    }
  }, [items, hydrated]);

  const addCustomItem = useCallback((incoming: CartItem) => {
    const qty = Math.max(1, incoming.qty);
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === incoming.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === incoming.productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...incoming, qty }];
    });
  }, []);

  const addItem = useCallback(
    (product: Product, qty = 1) => {
      addCustomItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        unit: product.unit,
        qty,
        image: product.images[0] || product.thumbnailUrl,
      });
    },
    [addCustomItem]
  );

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      items,
      totalItems,
      totalPrice,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      addCustomItem,
      updateQty,
      removeItem,
      clearCart,
    };
  }, [
    items,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    addCustomItem,
    updateQty,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart harus digunakan di dalam CartProvider.');
  }
  return ctx;
}

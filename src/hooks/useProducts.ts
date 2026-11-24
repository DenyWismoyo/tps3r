'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types/database';
import { getActiveProducts, getAllProductsAdmin } from '@/services/products.service';

export function useProducts(mode: 'public' | 'admin' = 'public') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list =
        mode === 'admin' ? await getAllProductsAdmin() : await getActiveProducts();
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat katalog produk.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { products, loading, error, refresh };
}

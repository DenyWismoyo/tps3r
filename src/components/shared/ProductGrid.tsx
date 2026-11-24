'use client';

import { useMemo, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import {
  PRODUCT_CATEGORY_LABELS,
  type Product,
  type ProductCategory,
} from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProductCard } from './ProductCard';

type CategoryFilter = 'all' | ProductCategory;

const CATEGORY_OPTIONS: readonly { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Semua Produk' },
  { key: 'maggot', label: PRODUCT_CATEGORY_LABELS.maggot },
  { key: 'kasgot', label: PRODUCT_CATEGORY_LABELS.kasgot },
  { key: 'kompos', label: PRODUCT_CATEGORY_LABELS.kompos },
  { key: 'poc', label: PRODUCT_CATEGORY_LABELS.poc },
  { key: 'hasil_kebun', label: PRODUCT_CATEGORY_LABELS.hasil_kebun },
];

export interface ProductGridProps {
  products: readonly Product[];
  initialCategory?: CategoryFilter;
}

export function ProductGrid({ products, initialCategory = 'all' }: ProductGridProps) {
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((item) => {
      const matchCat = category === 'all' || item.category === category;
      const matchText =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.shortDescription.toLowerCase().includes(keyword);
      return matchCat && matchText;
    });
  }, [products, category, search]);

  return (
    <div className="stack">
      <div className="product-filter">
        <div className="product-filter__chips" role="group" aria-label="Filter kategori produk">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={['chip', category === opt.key ? 'chip--active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setCategory(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="product-search" className="sr-only">
            Cari produk
          </label>
          <input
            id="product-search"
            type="search"
            className="input"
            placeholder="Cari maggot, kasgot, kompos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={26} />}
          title="Produk belum ditemukan"
          description="Coba ubah kata kunci pencarian atau pilih kategori produk lainnya."
          actionSlot={
            <Button
              variant="outline"
              onClick={() => {
                setCategory('all');
                setSearch('');
              }}
            >
              Reset Filter
            </Button>
          }
        />
      ) : (
        <div className="grid-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} variant="full" />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import {
  WASTE_SORTING_CATEGORY_LABELS,
  WASTE_SORTING_ITEMS,
  type WasteSortingCategory,
} from '@/config/education';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

type SortingFilter = 'all' | WasteSortingCategory;

const FILTER_TABS: readonly { key: SortingFilter; label: string }[] = [
  { key: 'all', label: 'Semua Jenis' },
  { key: 'organik_maggot', label: 'Pakan Maggot BSF' },
  { key: 'organik_kompos', label: 'Bahan Kompos' },
  { key: 'anorganik_pilah', label: 'Anorganik Pilah' },
  { key: 'dilarang', label: 'Jangan Dicampur' },
];

export function WasteSortingGuide() {
  const [filter, setFilter] = useState<SortingFilter>('all');
  const [keyword, setKeyword] = useState('');

  const items = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return WASTE_SORTING_ITEMS.filter((item) => {
      const matchCat = filter === 'all' || item.category === filter;
      const matchText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.examples.toLowerCase().includes(q) ||
        item.prepTip.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [filter, keyword]);

  return (
    <div className="stack">
      <div className="product-filter">
        <div className="product-filter__chips" role="group" aria-label="Filter kategori pilah sampah">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={['chip', filter === tab.key ? 'chip--active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="sorting-search" className="sr-only">
            Cari jenis sampah
          </label>
          <input
            id="sorting-search"
            type="search"
            className="input"
            placeholder="Cek sampah: nasi, tulang, telur, plastik..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="Jenis sampah belum ditemukan"
          description="Coba kata kunci lain seperti 'nasi', 'daun', 'telur', 'kardus', atau 'minyak'."
        />
      ) : (
        <div className="grid-2">
          {items.map((item) => (
            <article
              key={item.id}
              className={['sorting-card', !item.allowed ? 'sorting-card--banned' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <div className="cluster cluster--between">
                <Badge tone={item.allowed ? 'available' : 'soldout'}>
                  {item.allowed ? (
                    <>
                      <CheckCircle2 size={13} /> Boleh Disetor
                    </>
                  ) : (
                    <>
                      <XCircle size={13} /> Jangan Dicampur
                    </>
                  )}
                </Badge>
                <Badge tone={item.allowed ? 'organic' : 'neutral'}>
                  {WASTE_SORTING_CATEGORY_LABELS[item.category]}
                </Badge>
              </div>
              <h4>{item.name}</h4>
              <p className="text-sm text-muted">
                <strong>Contoh:</strong> {item.examples}
              </p>
              <p className="text-xs text-primary">
                <strong>Cara Siapkan:</strong> {item.prepTip}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

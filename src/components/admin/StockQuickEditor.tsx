'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  PRODUCT_CATEGORY_LABELS,
  STOCK_STATUS_LABELS,
  type Product,
  type StockStatus,
} from '@/types/database';
import {
  deleteProduct,
  quickUpdateProductStock,
} from '@/services/products.service';
import { formatRupiah } from '@/utils/format';
import { useProducts } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ProductFormModal } from './ProductFormModal';

const STATUS_CYCLE: readonly StockStatus[] = ['available', 'preorder', 'soldout'];

export function StockQuickEditor() {
  const { products, loading, refresh } = useProducts('admin');
  const { showToast } = useToast();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const handleQuickAdjust = async (
    product: Product,
    nextStock: number,
    nextStatus: StockStatus
  ) => {
    setBusyId(product.id);
    try {
      await quickUpdateProductStock(product.id, nextStock, nextStatus);
      showToast(`Stok ${product.name} diperbarui (${nextStock} ${product.unit}).`, 'success');
      await refresh();
    } catch {
      showToast('Gagal memperbarui stok produk.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteProduct(deleting.id);
      showToast(`Produk ${deleting.name} dihapus.`, 'success');
      setDeleting(null);
      await refresh();
    } catch {
      showToast('Gagal menghapus produk.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <div className="cluster cluster--between">
        <div>
          <h2>Katalog Produk &amp; Update Stok 1-Klik</h2>
          <p className="text-sm text-muted">
            Ubah stok (+/-) atau status ketersediaan langsung dari lapangan.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Tambah Produk</span>
        </Button>
      </div>

      {loading ? (
        <div className="stack">
          <Skeleton variant="stat" />
          <Skeleton variant="stat" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada produk terdaftar"
          description="Tambahkan produk Maggot BSF, Kasgot, Kompos, atau POC pertama Anda."
        />
      ) : (
        <div className="stack stack--sm">
          {products.map((product) => {
            const isBusy = busyId === product.id;
            return (
              <div key={product.id} className="stock-row">
                <div className="stack stack--xs">
                  <div className="cluster">
                    <Badge tone="organic">
                      {PRODUCT_CATEGORY_LABELS[product.category]}
                    </Badge>
                    <Badge tone={product.status}>
                      {STOCK_STATUS_LABELS[product.status]}
                    </Badge>
                    {!product.isActive ? <Badge tone="neutral">Arsip</Badge> : null}
                  </div>
                  <strong>{product.name}</strong>
                  <span className="text-xs text-muted">
                    {formatRupiah(product.price)} / {product.unit} • Stok:{' '}
                    <strong>{product.stockQty}</strong>
                  </span>
                </div>

                <div className="cluster">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBusy || product.stockQty <= 0}
                    onClick={() =>
                      void handleQuickAdjust(
                        product,
                        Math.max(0, product.stockQty - 1),
                        product.stockQty - 1 <= 0 ? 'soldout' : product.status
                      )
                    }
                  >
                    -1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() =>
                      void handleQuickAdjust(
                        product,
                        product.stockQty + 5,
                        product.status === 'soldout' ? 'available' : product.status
                      )
                    }
                  >
                    +5
                  </Button>

                  {STATUS_CYCLE.map((st) => (
                    <Button
                      key={st}
                      variant={product.status === st ? 'primary' : 'ghost'}
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void handleQuickAdjust(product, product.stockQty, st)}
                    >
                      {STOCK_STATUS_LABELS[st]}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label={`Edit ${product.name}`}
                    onClick={() => {
                      setEditing(product);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label={`Hapus ${product.name}`}
                    onClick={() => setDeleting(product)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen ? (
        <ProductFormModal
          key={editing?.id ?? 'new'}
          open={modalOpen}
          editingProduct={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => void refresh()}
        />
      ) : null}

      <Modal
        open={Boolean(deleting)}
        title="Konfirmasi Hapus Produk"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmDelete()}>
              Ya, Hapus Produk
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Yakin ingin menghapus permanen produk <strong>{deleting?.name}</strong> dari
          katalog TPS 3R?
        </p>
      </Modal>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatRupiah } from '@/utils/format';
import { buildCartWhatsAppMessage } from '@/utils/whatsapp';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField, SelectField } from '@/components/ui/InputField';
import { WhatsAppButton } from './WhatsAppButton';

export function MiniCartDrawer() {
  const {
    items,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
    clearCart,
  } = useCart();

  const [buyerName, setBuyerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'ambil' | 'antar'>('ambil');
  const [notes, setNotes] = useState('');

  const waMessage = buildCartWhatsAppMessage(items, buyerName, deliveryMethod, notes);

  return (
    <Drawer
      open={isDrawerOpen}
      title="Keranjang Belanja WA"
      onClose={closeDrawer}
      footer={
        items.length > 0 ? (
          <div className="stack stack--sm">
            <div className="cluster cluster--between">
              <span className="text-sm text-muted">Total Estimasi</span>
              <strong className="product-card__price">{formatRupiah(totalPrice)}</strong>
            </div>
            <WhatsAppButton
              message={waMessage}
              label="Checkout via WhatsApp"
              size="lg"
              block
            />
            <Button variant="ghost" size="sm" block onClick={clearCart}>
              Kosongkan Keranjang
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={26} />}
          title="Keranjang masih kosong"
          description="Pilih produk maggot, kasgot, kompos, atau POC dari katalog lalu checkout langsung ke WhatsApp tanpa perlu daftar akun."
          actionSlot={
            <Link href="/katalog" className="btn btn--primary" onClick={closeDrawer}>
              Lihat Katalog Produk
            </Link>
          }
        />
      ) : (
        <div className="stack">
          <div className="stack stack--sm">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="cluster cluster--between">
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-muted">
                      {formatRupiah(item.price)} / {item.unit}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label={`Hapus ${item.name}`}
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="cluster cluster--between">
                  <div className="cart-qty">
                    <button
                      type="button"
                      className="cart-qty__btn"
                      aria-label="Kurangi"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                    >
                      -
                    </button>
                    <span className="cart-qty__val">{item.qty}</span>
                    <button
                      type="button"
                      className="cart-qty__btn"
                      aria-label="Tambah"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong className="text-sm">{formatRupiah(item.price * item.qty)}</strong>
                </div>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <div className="stack stack--sm">
            <InputField
              id="cart-buyer-name"
              label="Nama Pemesan"
              placeholder="Contoh: Pak Ahmad (Lele Makmur)"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <SelectField
              id="cart-delivery"
              label="Metode Pengambilan"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value as 'ambil' | 'antar')}
              options={[
                { value: 'ambil', label: 'Ambil Langsung di Lokasi TPS 3R' },
                { value: 'antar', label: 'Minta Dikirim (Cek Ongkir ke Admin)' },
              ]}
            />
            <InputField
              id="cart-notes"
              label="Catatan Tambahan (Opsional)"
              placeholder="Contoh: Diambil besok pagi jam 09.00"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}

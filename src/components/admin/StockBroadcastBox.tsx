'use client';

import { Copy, Share2 } from 'lucide-react';
import type { Product } from '@/types/database';
import { buildDailyStockBroadcastMessage } from '@/utils/whatsapp';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';

export interface StockBroadcastBoxProps {
  products: readonly Product[];
}

export function StockBroadcastBox({ products }: StockBroadcastBoxProps) {
  const { showToast } = useToast();
  const message = buildDailyStockBroadcastMessage(products);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      showToast('Teks info stok harian disalin! Siap tempel ke Grup WA RT/RW.', 'success');
    } catch {
      showToast('Gagal menyalin otomatis. Gunakan tombol Bagikan via WA.', 'warning');
    }
  };

  return (
    <div className="broadcast-box">
      <div className="cluster cluster--between">
        <div>
          <strong className="text-sm text-primary cluster">
            <Share2 size={16} /> Broadcast Info Stok ke Grup WA Warga RT/RW
          </strong>
          <p className="text-xs text-muted">
            Otomatis merangkum seluruh produk yang tersedia hari ini beserta link katalog online.
          </p>
        </div>
        <div className="cluster">
          <Button variant="primary" size="sm" onClick={() => void handleCopy()}>
            <Copy size={15} />
            <span>Salin Teks Grup WA</span>
          </Button>
          <WhatsAppButton message={message} label="Buka di WA" size="sm" />
        </div>
      </div>
    </div>
  );
}

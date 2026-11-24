import type { Metadata } from 'next';
import { StockQuickEditor } from '@/components/admin/StockQuickEditor';

export const metadata: Metadata = {
  title: 'Kelola Katalog & Stok — Pengurus TPS 3R',
};

export default function AdminProdukPage() {
  return <StockQuickEditor />;
}

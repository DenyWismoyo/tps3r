import type { Metadata } from 'next';
import { CashLedgerManager } from '@/components/admin/CashLedgerManager';

export const metadata: Metadata = {
  title: 'Buku Kas Operasional — Pengurus TPS 3R',
};

export default function AdminKasPage() {
  return <CashLedgerManager />;
}

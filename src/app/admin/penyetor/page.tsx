import type { Metadata } from 'next';
import { ContributorManager } from '@/components/admin/ContributorManager';

export const metadata: Metadata = {
  title: 'Mitra Penyetor & Poin — Pengurus TPS 3R',
};

export default function AdminPenyetorPage() {
  return <ContributorManager />;
}

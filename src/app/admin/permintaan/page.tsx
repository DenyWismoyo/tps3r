import type { Metadata } from 'next';
import { RequestStatusList } from '@/components/admin/RequestStatusList';

export const metadata: Metadata = {
  title: 'Inbox Permintaan — Pengurus TPS 3R',
};

export default function AdminPermintaanPage() {
  return <RequestStatusList />;
}

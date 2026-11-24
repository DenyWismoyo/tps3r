import type { Metadata } from 'next';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';

export const metadata: Metadata = {
  title: 'Panel Pengurus — Quick Log Harian',
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}

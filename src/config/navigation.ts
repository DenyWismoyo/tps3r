export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const PUBLIC_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog Produk', href: '/katalog' },
  { label: 'Kalkulator Takaran', href: '/kalkulator' },
  { label: 'Transparansi Dampak', href: '/dampak' },
  { label: 'Kemitraan & Poin', href: '/kemitraan' },
  { label: 'Eduwisata', href: '/eduwisata' },
] as const;

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Quick Log', href: '/admin', description: 'Input harian < 1 menit' },
  { label: 'Produk & Stok', href: '/admin/produk', description: 'Katalog & stok 1-klik' },
  { label: 'Penyetor & Poin', href: '/admin/penyetor', description: 'Mitra & tabungan poin' },
  { label: 'Permintaan', href: '/admin/permintaan', description: 'Inbox jemput & eduwisata' },
] as const;

export const FOOTER_QUICK_LINKS: readonly NavItem[] = [
  { label: 'Katalog Maggot & Pupuk', href: '/katalog' },
  { label: 'Kalkulator Pupuk & Pakan', href: '/kalkulator' },
  { label: 'Laporan Dampak DLH/CSR', href: '/dampak' },
  { label: 'Daftar Mitra Setor Sampah', href: '/kemitraan' },
  { label: 'Booking Studi Banding', href: '/eduwisata' },
  { label: 'Portal Pengurus TPS 3R', href: '/admin' },
] as const;

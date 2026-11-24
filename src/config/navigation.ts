export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const PUBLIC_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog', href: '/katalog' },
  { label: 'Kalkulator', href: '/kalkulator' },
  { label: 'Panduan', href: '/panduan' },
  { label: 'Dampak', href: '/dampak' },
  { label: 'Kemitraan', href: '/kemitraan' },
  { label: 'Eduwisata', href: '/eduwisata' },
] as const;

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Quick Log', href: '/admin', description: 'Timbangan & batch produksi' },
  { label: 'Buku Kas', href: '/admin/kas', description: 'Pemasukan & pengeluaran' },
  { label: 'Produk', href: '/admin/produk', description: 'Katalog & stok 1-klik' },
  { label: 'Penyetor', href: '/admin/penyetor', description: 'Mitra, poin & rute jemput' },
  { label: 'Inbox', href: '/admin/permintaan', description: 'Jemput & eduwisata' },
] as const;

export const FOOTER_QUICK_LINKS: readonly NavItem[] = [
  { label: 'Katalog Maggot & Pupuk', href: '/katalog' },
  { label: 'Kalkulator Pupuk, Pakan & Poin', href: '/kalkulator' },
  { label: 'Panduan Pilah Sampah & FAQ', href: '/panduan' },
  { label: 'Laporan Dampak DLH/CSR', href: '/dampak' },
  { label: 'Daftar Mitra & Cek Poin', href: '/kemitraan' },
  { label: 'Booking Studi Banding', href: '/eduwisata' },
  { label: 'Portal Pengurus TPS 3R', href: '/admin' },
] as const;

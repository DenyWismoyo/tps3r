export interface EduwisataPackage {
  id: string;
  name: string;
  audience: string;
  duration: string;
  pricePerPerson: number;
  priceLabel: string;
  minParticipants: number;
  maxParticipants: number;
  summary: string;
  facilities: readonly string[];
  badge?: string;
}

export interface PartnershipBenefit {
  title: string;
  description: string;
}

export const EDUWISATA_PACKAGES: readonly EduwisataPackage[] = [
  {
    id: 'edukasi-sekolah',
    name: 'Edukasi Lingkungan Sekolah & PAUD',
    audience: 'PAUD, SD, SMP, SMA',
    duration: '2,5 Jam',
    pricePerPerson: 25000,
    priceLabel: 'Rp 25.000 / peserta',
    minParticipants: 15,
    maxParticipants: 120,
    summary:
      'Pengenalan pemilahan sampah organik, melihat langsung siklus lalat tentara hitam (BSF), praktik tanam media kasgot, dan suvenir bibit sayur.',
    facilities: [
      'Pemandu edukasi ramah anak & modul lembar kerja',
      'Kunjungan biopond maggot & rumah kompos',
      'Praktik tanam polybag memakai kasgot (dibawa pulang)',
      'Welcome drink herbal & snack hasil kebun Poktan',
    ],
    badge: 'Terpopuler Sekolah',
  },
  {
    id: 'studi-banding-instansi',
    name: 'Studi Banding Pemda, Desa, DLH & CSR',
    audience: 'Pemerintah Desa, DLH, Kampus, Tim CSR',
    duration: '4 Jam (Half Day)',
    pricePerPerson: 75000,
    priceLabel: 'Rp 75.000 / peserta',
    minParticipants: 10,
    maxParticipants: 80,
    summary:
      'Bedah tata kelola kelembagaan KSM TPS 3R, model bisnis ekonomi sirkular, manajemen operasional harian, dan tur fasilitas pengolahan organik.',
    facilities: [
      'Paparan manajemen TPS 3R & sesi tanya jawab pengurus',
      'Softcopy & contoh dokumen SOP pencatatan dampak DLH/CSR',
      'Tur fasilitas pemilahan, kandang lalat BSF, & kebun produksi',
      'Konsumsi makan siang + sampel produk kompos & kasgot',
    ],
    badge: 'Rekomendasi Instansi',
  },
  {
    id: 'pelatihan-maggot-kompos',
    name: 'Pelatihan Teknis Budidaya Maggot BSF & Kompos',
    audience: 'Petani, Peternak, Pengelola TPS 3R Baru, UMKM',
    duration: '1 Hari Penuh (08.30 – 15.30)',
    pricePerPerson: 185000,
    priceLabel: 'Rp 185.000 / peserta',
    minParticipants: 5,
    maxParticipants: 40,
    summary:
      'Pelatihan praktik langsung mulai penetasan telur BSF, manajemen pakan sisa makanan tanpa bau, panen maggot, hingga fermentasi kasgot dan POC.',
    facilities: [
      'Modul teknis cetak + starter kit 10 gram telur/prepupa BSF',
      'Praktik langsung formulasi pakan & kontrol kelembapan biopond',
      'Sertifikat pelatihan dari Kelompok Tani & TPS 3R',
      'Grup konsultasi pendampingan WhatsApp selama 30 hari',
    ],
    badge: 'Praktik Intensif',
  },
] as const;

export const PARTNERSHIP_BENEFITS: readonly PartnershipBenefit[] = [
  {
    title: 'Penjemputan Terjadwal & Bebas Bau',
    description:
      'Sisa makanan warung, restoran, katering, atau rumah tangga dijemput sesuai jadwal memakai wadah tertutup bersih.',
  },
  {
    title: 'Tabungan Poin Tukar Pupuk & Sayur',
    description:
      'Setiap 1 kg sampah organik terpilah bernilai 10 poin yang dapat ditukar kompos, kasgot, POC, atau hasil panen kebun.',
  },
  {
    title: 'Sertifikat & Laporan Dampak Lingkungan',
    description:
      'Mitra rutin usaha/instansi mendapatkan ringkasan kontribusi pengurangan sampah dan reduksi emisi CO2e.',
  },
] as const;

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
    name: 'Edukasi Lingkungan & Urban Farming Kali Klebengan',
    audience: 'PAUD, SD, SMP, SMA se-Solo Raya',
    duration: '2,5 Jam',
    pricePerPerson: 25000,
    priceLabel: 'Rp 25.000 / peserta',
    minParticipants: 15,
    maxParticipants: 120,
    summary:
      'Pengenalan pemilahan sampah organik dari rumah, tur pemulihan bantaran Kali Klebengan, melihat siklus Maggot BSF, dan praktik tanam sayur dalam pot (tayurdapot) bermedia kasgot.',
    facilities: [
      'Pemandu edukasi warga RW 17 Ngipang & lembar aktivitas anak',
      'Kunjungan biopond maggot BSF, kolam lele & rumah kompos',
      'Praktik tanam tayurdapot memakai kasgot (bibit dibawa pulang)',
      'Minuman herbal & snack olahan hasil kebun Kadipiro',
    ],
    badge: 'Terpopuler Sekolah',
  },
  {
    id: 'studi-banding-instansi',
    name: 'Studi Banding ProKlim, DLH, Kampus & CSR Surakarta',
    audience: 'Pemda, Kelurahan, DLH, Kampus (UNS/UMS), Tim CSR',
    duration: '4 Jam (Half Day)',
    pricePerPerson: 75000,
    priceLabel: 'Rp 75.000 / peserta',
    minParticipants: 10,
    maxParticipants: 80,
    summary:
      'Bedah transformasi Kali Klebengan dari sungai tercemar menjadi Kampung Iklim & pusat ekonomi sirkular TPS 3R Kadipiro yang memangkas kiriman sampah organik ke TPA Putri Cempo.',
    facilities: [
      'Paparan tata kelola Poktan Abdi Dalem Klebengan & TPS 3R Ngipang',
      'Contoh SOP pencatatan timbangan harian & laporan dampak DLH/CSR',
      'Tur fasilitas pemilahan, biopond BSF, kandang ternak & kebun tayurdapot',
      'Konsumsi makan siang + sampel produk kompos & kasgot',
    ],
    badge: 'Rekomendasi Instansi',
  },
  {
    id: 'pelatihan-maggot-kompos',
    name: 'Pelatihan Teknis Maggot BSF, Kompos & Integrasi Ternak',
    audience: 'Petani, Peternak Lele/Unggas, Pengelola TPS 3R & Bank Sampah',
    duration: '1 Hari Penuh (08.30 – 15.30)',
    pricePerPerson: 185000,
    priceLabel: 'Rp 185.000 / peserta',
    minParticipants: 5,
    maxParticipants: 40,
    summary:
      'Praktik intensif pengolahan sampah dapur & kotoran ternak menjadi kompos, budidaya maggot BSF tanpa bau untuk pakan lele/unggas, hingga produksi kasgot dan POC.',
    facilities: [
      'Modul teknis cetak + starter kit 10 gram telur/prepupa BSF',
      'Praktik langsung formulasi pakan organik & fermentasi kompos',
      'Sertifikat pelatihan dari Poktan & TPS 3R Abdi Dalem Klebengan',
      'Grup konsultasi pendampingan WhatsApp selama 30 hari',
    ],
    badge: 'Praktik Intensif',
  },
] as const;

export const PARTNERSHIP_BENEFITS: readonly PartnershipBenefit[] = [
  {
    title: 'Kurangi Beban TPA Putri Cempo',
    description:
      'Sisa makanan warung, kantin, pasar, dan dapur warga sekitar Kadipiro–Banjarsari diolah langsung di hulu secara bersih dan terjadwal.',
  },
  {
    title: 'Tabungan Poin Tukar Pupuk & Sayur',
    description:
      'Setiap 1 kg sampah organik terpilah bernilai 10 poin yang dapat ditukar kompos, kasgot, POC, atau sayur segar tayurdapot.',
  },
  {
    title: 'Laporan Kontribusi Lingkungan',
    description:
      'Mitra rutin usaha, sekolah, dan instansi di Surakarta memperoleh rekap kontribusi pengurangan sampah dan reduksi emisi CO2e.',
  },
] as const;

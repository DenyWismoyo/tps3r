export interface SiteProfileConfig {
  shortName: string;
  organizationName: string;
  tagline: string;
  description: string;
  whatsappNumber: string; // Format 628...
  phoneDisplay: string;
  email: string;
  address: string;
  villageDistrict: string;
  operatingHours: string;
  legalityNumber: string;
  chairmanName: string;
  chairmanTitle: string;
  secretaryName: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  announcementDefault: string;
  pointsPerKgWaste: number;
  co2FactorPerKgOrganic: number;
}

export const SITE_CONFIG: SiteProfileConfig = {
  shortName: 'TPS 3R Abdi Dalem Klebengan',
  organizationName: 'Poktan & TPS 3R Abdi Dalem Klebengan Kadipiro',
  tagline:
    'Ekonomi Sirkular Kali Klebengan Surakarta: Dari Sampah Organik Menjadi Maggot BSF, Kasgot, Kompos & Urban Farming',
  description:
    'Platform digital Kelompok Tani dan TPS 3R Abdi Dalem Klebengan (Kampung Ngipang, Kelurahan Kadipiro, Kecamatan Banjarsari, Kota Surakarta) pengolah sampah organik & sisa makanan menjadi Maggot BSF, Kasgot, Kompos, POC, dan hasil kebun tayurdapot guna mengurangi beban TPA Putri Cempo.',
  whatsappNumber: '6281234567890',
  phoneDisplay: '0812-3456-7890 (Admin TPS 3R — ubah di config/site.ts)',
  email: 'tps3r.abdidalemklebengan@gmail.com',
  address:
    'RT 01 / RW 17, Kampung Ngipang (Kawasan Bantaran Kali Klebengan, Selatan RSUD Ngipang), Kel. Kadipiro, Kec. Banjarsari, Kota Surakarta, Jawa Tengah 57136',
  villageDistrict: 'Kel. Kadipiro, Kec. Banjarsari, Kota Surakarta',
  operatingHours:
    'Senin – Sabtu, 07.30 – 16.00 WIB (Penyetoran Sisa Makanan Mitra hingga 17.00 WIB)',
  legalityNumber:
    'Poktan & Kelompok Peduli Lingkungan Abdi Dalem Klebengan RW 17 • Sinergi TPS 3R Ngipang Kadipiro & ProKlim Kota Surakarta',
  chairmanName: 'Mugiman',
  chairmanTitle: 'Ketua Poktan Abdi Dalem Klebengan / RW 17 Ngipang',
  secretaryName: 'Rusmanto (Koord. TPS 3R Ngipang)',
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=110.798%2C-7.548%2C110.826%2C-7.527&layer=mapnik&marker=-7.5376%2C110.8120',
  mapDirectionsUrl: 'https://maps.google.com/?q=-7.5376,110.8120',
  announcementDefault:
    'TPS 3R Abdi Dalem Klebengan Kadipiro, Surakarta • Tekan beban sampah TPA Putri Cempo bersama kami — Stok Maggot BSF, Kasgot & Kompos tersedia hari ini.',
  pointsPerKgWaste: 10,
  co2FactorPerKgOrganic: 0.5,
};

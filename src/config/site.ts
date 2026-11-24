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
  shortName: 'TPS 3R Lestari Tani',
  organizationName: 'Kelompok Tani & TPS 3R Lestari Makmur',
  tagline: 'Ekonomi Sirkular: Dari Sampah Organik Menjadi Maggot BSF, Kasgot & Pupuk Berkualitas',
  description:
    'Platform digital Kelompok Tani dan TPS 3R pengolah sampah organik & sisa makanan menjadi Maggot BSF, Kasgot, Pupuk Kompos, Pupuk Organik Cair (POC), dan hasil kebun organik.',
  whatsappNumber: '6281234567890',
  phoneDisplay: '0812-3456-7890',
  email: 'halo@tps3r-lestaritani.id',
  address: 'Jl. Agro Sirkular No. 14, Desa Makmur Jaya, Kec. Tani Mulya, Jawa Tengah 57100',
  villageDistrict: 'Desa Makmur Jaya, Kec. Tani Mulya',
  operatingHours: 'Senin – Sabtu, 07.30 – 16.00 WIB (Penyetoran Sisa Makanan hingga 17.00 WIB)',
  legalityNumber: 'SK Kepala Desa No. 141/28/2024 • Register Poktan & KSM TPS 3R',
  chairmanName: 'Budi Santoso',
  chairmanTitle: 'Ketua KSM TPS 3R & Kelompok Tani',
  secretaryName: 'Siti Rahmawati',
  mapEmbedUrl:
    'https://www.openstreetmap.org/export/embed.html?bbox=110.78%2C-7.58%2C110.86%2C-7.53&layer=mapnik',
  mapDirectionsUrl: 'https://maps.google.com/?q=-7.5561,110.8283',
  announcementDefault:
    'Penerimaan sisa makanan warung/restoran gratis jemput area sekitar • Stok Kasgot & Maggot BSF segar tersedia hari ini.',
  pointsPerKgWaste: 10,
  co2FactorPerKgOrganic: 0.5,
};

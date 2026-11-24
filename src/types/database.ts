export type ProductCategory = 'maggot' | 'kompos' | 'kasgot' | 'poc' | 'hasil_kebun';
export type StockStatus = 'available' | 'preorder' | 'soldout';

export type ContributorType = 'warga' | 'warung' | 'restoran' | 'pasar' | 'instansi';
export type PartnershipPartnerType =
  | 'warga'
  | 'warung'
  | 'restoran'
  | 'pasar'
  | 'instansi'
  | 'hotel'
  | 'kantin'
  | 'lainnya';

export type PartnershipStatus = 'baru' | 'dihubungi' | 'aktif' | 'ditolak';
export type EduBookingStatus = 'menunggu' | 'dikonfirmasi' | 'selesai' | 'batal';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  maggot: 'Maggot BSF',
  kompos: 'Pupuk Kompos',
  kasgot: 'Kasgot',
  poc: 'Pupuk Organik Cair',
  hasil_kebun: 'Hasil Kebun',
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  available: 'Tersedia',
  preorder: 'Pre-Order',
  soldout: 'Habis',
};

export const CONTRIBUTOR_TYPE_LABELS: Record<ContributorType, string> = {
  warga: 'Warga / Rumah Tangga',
  warung: 'Warung Makan',
  restoran: 'Restoran / Katering',
  pasar: 'Pedagang Pasar',
  instansi: 'Instansi / Sekolah',
};

export const PARTNERSHIP_TYPE_LABELS: Record<PartnershipPartnerType, string> = {
  warga: 'Warga / RT-RW',
  warung: 'Warung Makan',
  restoran: 'Restoran / Katering',
  pasar: 'Pasar / Kios Sayur',
  instansi: 'Instansi / Perkantoran',
  hotel: 'Hotel / Penginapan',
  kantin: 'Kantin Sekolah / Kampus',
  lainnya: 'Lainnya',
};

export const PARTNERSHIP_STATUS_LABELS: Record<PartnershipStatus, string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  aktif: 'Mitra Aktif',
  ditolak: 'Ditolak',
};

export const EDU_BOOKING_STATUS_LABELS: Record<EduBookingStatus, string> = {
  menunggu: 'Menunggu Konfirmasi',
  dikonfirmasi: 'Dikonfirmasi',
  selesai: 'Selesai',
  batal: 'Dibatalkan',
};

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  usageGuide: string;
  price: number;
  unit: string;
  stockQty: number;
  status: StockStatus;
  images: string[];
  benefits?: string[];
  thumbnailUrl?: string;
  minOrderQty?: number;
  weightGrams?: number;
  sortOrder?: number;
  badge?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt: string; // ISO string hasil konversi Firestore Timestamp
}

export interface DailyLog {
  id: string;
  date: string; // 'YYYY-MM-DD'
  monthKey: string; // 'YYYY-MM'
  organicWasteKg: number;
  foodWasteKg: number;
  maggotHarvestKg: number;
  compostProducedKg: number;
  kasgotProducedKg: number;
  pocProducedLiter: number;
  contributorId?: string;
  contributorName?: string;
  earnedPoints?: number;
  notes?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ImpactSummary {
  totalWasteProcessedKg: number;
  totalFoodWasteKg: number;
  totalOrganicWasteKg?: number;
  totalMaggotHarvestKg: number;
  totalCompostAndKasgotKg: number;
  totalCompostKg?: number;
  totalKasgotKg?: number;
  totalPocLiter: number;
  activeContributorsCount: number;
  estimatedCo2SavedKg: number;
  totalLogsCount?: number;
  lastUpdatedAt: string;
}

export interface MonthlyImpact {
  monthKey: string; // 'YYYY-MM'
  label: string; // 'Nov 2026'
  wasteKg: number;
  maggotKg: number;
  compostKg: number;
  kasgotKg: number;
  foodWasteKg?: number;
  organicWasteKg?: number;
  pocLiter?: number;
  co2SavedKg?: number;
  logsCount?: number;
  updatedAt?: string;
}

export interface Contributor {
  id: string;
  memberCode: string; // 'TPS-001'
  name: string;
  type: ContributorType;
  phoneNormalized: string; // '628123456789'
  address: string;
  totalDepositedKg: number;
  pointsBalance: number;
  isActive: boolean;
  lastDepositAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnershipRequest {
  id: string;
  partnerName: string;
  partnerType: PartnershipPartnerType;
  contactName?: string;
  phone: string;
  phoneNormalized?: string;
  address: string;
  estimatedKgPerWeek: number;
  preferredPickupSchedule: string;
  notes?: string;
  adminNotes?: string;
  status: PartnershipStatus;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EduBooking {
  id: string;
  organizationName: string;
  contactName: string;
  phone: string;
  phoneNormalized?: string;
  packageId: string;
  packageName?: string;
  visitDate: string; // 'YYYY-MM-DD'
  participantCount: number;
  notes?: string;
  adminNotes?: string;
  status: EduBookingStatus;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SiteSettingsOverride {
  organizationName?: string;
  tagline?: string;
  whatsappNumber?: string;
  phone?: string;
  address?: string;
  operatingHours?: string;
  announcementText?: string;
  announcementActive?: boolean;
  mapEmbedUrl?: string;
  chairmanName?: string;
  legalityNumber?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
  image?: string;
}

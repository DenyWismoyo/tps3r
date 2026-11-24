import { z } from 'zod';
import { normalizePhoneIndonesia } from '@/utils/format';

export const productCategoryEnum = z.enum([
  'maggot',
  'kompos',
  'kasgot',
  'poc',
  'hasil_kebun',
]);

export const stockStatusEnum = z.enum(['available', 'preorder', 'soldout']);

export const contributorTypeEnum = z.enum([
  'warga',
  'warung',
  'restoran',
  'pasar',
  'instansi',
]);

export const partnershipPartnerTypeEnum = z.enum([
  'warga',
  'warung',
  'restoran',
  'pasar',
  'instansi',
  'hotel',
  'kantin',
  'lainnya',
]);

export const partnershipStatusEnum = z.enum(['baru', 'dihubungi', 'aktif', 'ditolak']);
export const eduBookingStatusEnum = z.enum(['menunggu', 'dikonfirmasi', 'selesai', 'batal']);

const dateYmdRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const phoneSchema = z
  .string()
  .trim()
  .min(8, 'Nomor HP minimal 8 karakter')
  .max(25, 'Nomor HP maksimal 25 karakter')
  .refine(
    (val) => {
      const normalized = normalizePhoneIndonesia(val);
      return /^[0-9]{8,20}$/.test(normalized);
    },
    { message: 'Format nomor HP tidak valid (contoh: 081234567890)' }
  );

export const productInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug wajib diisi')
    .max(120, 'Slug maksimal 120 karakter')
    .regex(slugRegex, 'Slug harus huruf kecil & tanda hubung saja'),
  name: z.string().trim().min(2, 'Nama produk minimal 2 karakter').max(150),
  category: productCategoryEnum,
  shortDescription: z.string().trim().max(500).default(''),
  description: z.string().trim().max(5000).default(''),
  usageGuide: z.string().trim().max(3000).default(''),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif').max(1_000_000_000),
  unit: z.string().trim().min(1, 'Satuan wajib diisi').max(50),
  stockQty: z.coerce.number().min(0, 'Stok tidak boleh negatif').max(10_000_000),
  status: stockStatusEnum,
  images: z.array(z.string().trim().max(2048)).max(10).default([]),
  benefits: z.array(z.string().trim().max(300)).max(10).optional(),
  badge: z.string().trim().max(60).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const dailyLogInputSchema = z
  .object({
    date: z.string().regex(dateYmdRegex, 'Format tanggal harus YYYY-MM-DD'),
    organicWasteKg: z.coerce.number().min(0).max(1_000_000).default(0),
    foodWasteKg: z.coerce.number().min(0).max(1_000_000).default(0),
    maggotHarvestKg: z.coerce.number().min(0).max(1_000_000).default(0),
    compostProducedKg: z.coerce.number().min(0).max(1_000_000).default(0),
    kasgotProducedKg: z.coerce.number().min(0).max(1_000_000).default(0),
    pocProducedLiter: z.coerce.number().min(0).max(1_000_000).default(0),
    contributorId: z.string().trim().max(128).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.organicWasteKg +
        data.foodWasteKg +
        data.maggotHarvestKg +
        data.compostProducedKg +
        data.kasgotProducedKg +
        data.pocProducedLiter >
      0,
    {
      message: 'Isi minimal satu angka timbangan atau hasil panen (> 0).',
      path: ['organicWasteKg'],
    }
  );

export const contributorInputSchema = z.object({
  memberCode: z.string().trim().min(2, 'Kode member minimal 2 karakter').max(30),
  name: z.string().trim().min(2, 'Nama penyetor minimal 2 karakter').max(150),
  type: contributorTypeEnum,
  phone: phoneSchema,
  address: z.string().trim().max(300).default(''),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(500).optional(),
});

export const pointsRedeemSchema = z.object({
  contributorId: z.string().trim().min(1),
  pointsToRedeem: z.coerce.number().int().min(1, 'Minimal 1 poin'),
  rewardNote: z.string().trim().min(2, 'Catatan penukaran wajib diisi').max(300),
});

export const partnershipRequestSchema = z.object({
  partnerName: z.string().trim().min(2, 'Nama usaha/warga wajib diisi').max(150),
  partnerType: partnershipPartnerTypeEnum,
  contactName: z.string().trim().max(150).optional(),
  phone: phoneSchema,
  address: z.string().trim().min(5, 'Alamat lengkap minimal 5 karakter').max(500),
  estimatedKgPerWeek: z.coerce.number().min(0, 'Estimasi tidak boleh negatif').max(100_000),
  preferredPickupSchedule: z
    .string()
    .trim()
    .min(2, 'Jadwal penjemputan wajib diisi')
    .max(150),
  notes: z.string().trim().max(1000).optional(),
});

export const eduBookingSchema = z.object({
  organizationName: z.string().trim().min(2, 'Nama instansi/sekolah wajib diisi').max(150),
  contactName: z.string().trim().min(2, 'Nama penanggung jawab wajib diisi').max(120),
  phone: phoneSchema,
  packageId: z.string().trim().min(1, 'Pilih paket kunjungan').max(80),
  visitDate: z.string().regex(dateYmdRegex, 'Tanggal kunjungan tidak valid'),
  participantCount: z.coerce
    .number()
    .int('Jumlah peserta harus bilangan bulat')
    .min(1, 'Minimal 1 peserta')
    .max(500, 'Maksimal 500 peserta'),
  notes: z.string().trim().max(1000).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type DailyLogInput = z.infer<typeof dailyLogInputSchema>;
export type ContributorInput = z.infer<typeof contributorInputSchema>;
export type PointsRedeemInput = z.infer<typeof pointsRedeemSchema>;
export type PartnershipRequestInput = z.infer<typeof partnershipRequestSchema>;
export type EduBookingInput = z.infer<typeof eduBookingSchema>;

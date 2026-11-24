/**
 * Script Seeding Data Awal TPS 3R ke Firestore Named Database `database-tps3r`.
 * Jalankan:
 *   npm run seed
 * Atau sekaligus daftarkan UID pengurus pertama:
 *   npx tsx src/utils/seedData.ts --admin-uid=<FIREBASE_AUTH_UID>
 */
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb, ADMIN_DATABASE_ID } from '@/lib/firebaseAdmin';
import { SITE_CONFIG } from '@/config/site';

const SAMPLE_PRODUCTS = [
  {
    id: 'maggot-bsf-segar',
    slug: 'maggot-bsf-segar',
    name: 'Maggot BSF Segar (Pakan Hidup)',
    category: 'maggot',
    shortDescription: 'Larva Black Soldier Fly segar berprotein tinggi (>42%) siap tebar untuk ikan lele, nila, dan unggas.',
    description:
      'Maggot BSF segar hasil biokonversi sisa makanan dapur & buah pilihan yang terpilah bersih. Dipanen pada usia optimal 14–16 hari dengan kandungan protein alami tinggi untuk mempercepat pertumbuhan ternak sekaligus menghemat biaya pelet pabrikan hingga 40%.',
    usageGuide:
      'Berikan langsung 2–3% bobot tubuh ikan atau campurkan 20% pada ransum ayam/bebek di pagi dan sore hari.',
    price: 9000,
    unit: 'kg',
    stockQty: 48,
    status: 'available',
    images: [],
    benefits: [
      'Protein kasar 42%–45% dengan asam amino esensial lengkap',
      'Mengandung asam laurat alami peningkat daya tahan ternak',
      'Dipanen segar setiap pagi dari biopond TPS 3R',
    ],
    badge: 'Panen Harian',
    sortOrder: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'maggot-bsf-kering',
    slug: 'maggot-bsf-kering',
    name: 'Maggot BSF Kering Oven (500g)',
    category: 'maggot',
    shortDescription: 'Maggot BSF panggang higienis, renyah, tahan simpan hingga 6 bulan untuk unggas, ikan hias & kicau.',
    description:
      'Maggot BSF pilihan yang dicuci bersih dan dikeringkan menggunakan oven suhu terkontrol sehingga nutrisinya tetap terjaga tanpa bau menyengat. Praktis untuk stok pakan peternak maupun pengiriman luar kota.',
    usageGuide:
      'Taburkan langsung ke kolam ikan/wadah pakan unggas atau campurkan dengan dedak dan pelet.',
    price: 35000,
    unit: 'kemasan 500g',
    stockQty: 26,
    status: 'available',
    images: [],
    benefits: [
      'Masa simpan hingga 6 bulan di wadah tertutup rapat',
      'Cocok untuk koi, channa, arwana, ayam petelur & burung kicau',
      'Bebas bahan pengawet dan pewarna buatan',
    ],
    badge: 'Tahan Lama',
    sortOrder: 2,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'kasgot-halus-10kg',
    slug: 'kasgot-halus-10kg',
    name: 'Kasgot (Bekas Maggot) Ayak Halus 10 kg',
    category: 'kasgot',
    shortDescription: 'Pupuk organik premium kaya kitin & mikroba baik, siap pakai untuk sayuran, cabai, dan tanaman hias.',
    description:
      'Kasgot (frass) adalah hasil pencernaan larva BSF yang telah difermentasi lanjut dan diayak halus. Mengandung unsur hara makro-mikro seimbang serta senyawa kitin alami yang membantu merangsang kekebalan akar tanaman.',
    usageGuide:
      'Campurkan 1 bagian kasgot dengan 4 bagian tanah untuk media tanam, atau taburkan 2–3 sendok makan per polybag tiap 2 minggu.',
    price: 32000,
    unit: 'karung 10kg',
    stockQty: 65,
    status: 'available',
    images: [],
    benefits: [
      'Tekstur remah halus, tidak berbau, dan tidak panas di akar',
      'Kaya unsur hara N-P-K organik serta mikroorganisme penyubur',
      'Sangat cocok untuk urban farming, cabai, tomat & tabulampot',
    ],
    badge: 'Best Seller',
    sortOrder: 3,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'kompos-curah-25kg',
    slug: 'kompos-curah-25kg',
    name: 'Pupuk Kompos Matang Poktan 25 kg',
    category: 'kompos',
    shortDescription: 'Kompos matang hasil fermentasi daun, sisa kebun & serasah organik untuk olah lahan pertanian.',
    description:
      'Pupuk kompos padat dari bahan organik nabati yang melalui proses pengomposan aerob terkendali selama 45 hari hingga matang sempurna (rasio C/N stabil). Efektif menggemburkan tanah keras dan meningkatkan daya serap air.',
    usageGuide:
      'Tebarkan 1,5–2 kg per m² saat pengolahan bedengan atau campurkan di lubang tanam sebelum pemindahan bibit.',
    price: 35000,
    unit: 'karung 25kg',
    stockQty: 90,
    status: 'available',
    images: [],
    benefits: [
      'Memperbaiki struktur tanah liat maupun berpasir',
      'Mengurangi ketergantungan pupuk kimia sintetis',
      'Harga ekonomis khusus petani dan kelompok kebun',
    ],
    badge: 'Hemat Lahan',
    sortOrder: 4,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'poc-organik-1l',
    slug: 'poc-organik-1l',
    name: 'Pupuk Organik Cair (POC) Bio-Sirkular 1 Liter',
    category: 'poc',
    shortDescription: 'Nutrisi cair fermentasi lindi organik & buah matang untuk memacu tunas daun serta pembungaan.',
    description:
      'Pupuk Organik Cair (POC) kaya hormon pertumbuhan alami dan mikroba pelarut fosfat. Cepat diserap melalui daun maupun perakaran sehingga ideal untuk pemeliharaan mingguan tanaman sayur dan buah.',
    usageGuide:
      'Encerkan 20 ml (2 tutup botol) ke dalam 1 liter air bersih. Siram ke pangkal akar atau semprot embun pagi hari 1x seminggu.',
    price: 18000,
    unit: 'botol 1L',
    stockQty: 42,
    status: 'available',
    images: [],
    benefits: [
      'Mudah diaplikasikan dengan kocor maupun semprot',
      '1 botol 1L cukup untuk 50 liter larutan siap pakai',
      'Aroma fermentasi tape ringan, aman untuk kebun rumah',
    ],
    badge: 'Siap Kocor',
    sortOrder: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'paket-sayur-organik-kebun',
    slug: 'paket-sayur-organik-kebun',
    name: 'Paket Sayur Segar Kebun Poktan (3 Ikat)',
    category: 'hasil_kebun',
    shortDescription: 'Panen segar kangkung, bayam hijau, dan pakcoy bebas pestisida kimia yang dipupuk kasgot & POC.',
    description:
      'Bukti nyata siklus ekonomi sirkular: sayuran sehat yang dibudidayakan langsung oleh anggota Kelompok Tani menggunakan kasgot, kompos, dan POC produksi TPS 3R sendiri.',
    usageGuide:
      'Pre-order panen pagi setiap Selasa, Kamis, dan Sabtu agar sayuran diterima dalam kondisi paling segar.',
    price: 15000,
    unit: 'paket (3 ikat)',
    stockQty: 14,
    status: 'preorder',
    images: [],
    benefits: [
      '100% bebas pestisida kimia sintetis',
      'Dipetik pagi hari di hari pengambilan',
      'Bisa ditukar langsung dengan poin tabungan sampah warga',
    ],
    badge: 'Tukar Poin Bisa',
    sortOrder: 6,
    isFeatured: true,
    isActive: true,
  },
] as const;

const SAMPLE_MONTHLY = [
  { monthKey: '2026-06', label: 'Jun 2026', wasteKg: 1420, foodWasteKg: 620, organicWasteKg: 800, maggotKg: 148, compostKg: 380, kasgotKg: 195, pocLiter: 68, logsCount: 24 },
  { monthKey: '2026-07', label: 'Jul 2026', wasteKg: 1680, foodWasteKg: 740, organicWasteKg: 940, maggotKg: 176, compostKg: 445, kasgotKg: 230, pocLiter: 82, logsCount: 26 },
  { monthKey: '2026-08', label: 'Agu 2026', wasteKg: 1950, foodWasteKg: 890, organicWasteKg: 1060, maggotKg: 215, compostKg: 510, kasgotKg: 270, pocLiter: 94, logsCount: 26 },
  { monthKey: '2026-09', label: 'Sep 2026', wasteKg: 2180, foodWasteKg: 1020, organicWasteKg: 1160, maggotKg: 248, compostKg: 560, kasgotKg: 315, pocLiter: 110, logsCount: 25 },
  { monthKey: '2026-10', label: 'Okt 2026', wasteKg: 2460, foodWasteKg: 1180, organicWasteKg: 1280, maggotKg: 286, compostKg: 620, kasgotKg: 360, pocLiter: 125, logsCount: 27 },
  { monthKey: '2026-11', label: 'Nov 2026', wasteKg: 2310, foodWasteKg: 1120, organicWasteKg: 1190, maggotKg: 274, compostKg: 585, kasgotKg: 340, pocLiter: 118, logsCount: 22 },
] as const;

const SAMPLE_CONTRIBUTORS = [
  { id: 'contrib-001', memberCode: 'TPS-001', name: 'Warung Makan Bu Tini', type: 'warung', phoneNormalized: '628123450001', address: 'Jl. Pasar Baru No. 8, Makmur Jaya', totalDepositedKg: 420, pointsBalance: 1850, isActive: true },
  { id: 'contrib-002', memberCode: 'TPS-002', name: 'Resto Sawah Indah', type: 'restoran', phoneNormalized: '628123450002', address: 'Jl. Raya Pertanian Km 3', totalDepositedKg: 785, pointsBalance: 3200, isActive: true },
  { id: 'contrib-003', memberCode: 'TPS-003', name: 'Ibu Sri Wahyuni (RT 03)', type: 'warga', phoneNormalized: '628123450003', address: 'Dusun Krajan RT 03/RW 02', totalDepositedKg: 84, pointsBalance: 540, isActive: true },
  { id: 'contrib-004', memberCode: 'TPS-004', name: 'Kios Sayur Pak Slamet', type: 'pasar', phoneNormalized: '628123450004', address: 'Blok B Los Sayur Pasar Desa', totalDepositedKg: 560, pointsBalance: 2400, isActive: true },
  { id: 'contrib-005', memberCode: 'TPS-005', name: 'SDN 1 Makmur Jaya', type: 'instansi', phoneNormalized: '628123450005', address: 'Jl. Pendidikan No. 2', totalDepositedKg: 195, pointsBalance: 1250, isActive: true },
] as const;

async function main() {
  const db = getAdminDb();
  const now = Timestamp.now();

  console.log(`Menyemai data TPS 3R ke Firestore database: ${ADMIN_DATABASE_ID}...`);

  // 1. Produk
  for (const product of SAMPLE_PRODUCTS) {
    const { id, ...rest } = product;
    await db
      .collection('products')
      .doc(id)
      .set(
        {
          ...rest,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
  }
  console.log(`✓ ${SAMPLE_PRODUCTS.length} produk katalog selesai disemai.`);

  // 2. Impact Monthly & Summary
  let totalWaste = 0;
  let totalFood = 0;
  let totalOrganic = 0;
  let totalMaggot = 0;
  let totalCompost = 0;
  let totalKasgot = 0;
  let totalPoc = 0;
  let totalLogs = 0;

  for (const m of SAMPLE_MONTHLY) {
    const co2 = Math.round(m.wasteKg * SITE_CONFIG.co2FactorPerKgOrganic * 100) / 100;
    totalWaste += m.wasteKg;
    totalFood += m.foodWasteKg;
    totalOrganic += m.organicWasteKg;
    totalMaggot += m.maggotKg;
    totalCompost += m.compostKg;
    totalKasgot += m.kasgotKg;
    totalPoc += m.pocLiter;
    totalLogs += m.logsCount;

    await db.collection('impact_monthly').doc(m.monthKey).set({
      ...m,
      co2SavedKg: co2,
      updatedAt: now,
    });
  }

  await db.collection('impact_summary').doc('current').set({
    totalWasteProcessedKg: totalWaste,
    totalFoodWasteKg: totalFood,
    totalOrganicWasteKg: totalOrganic,
    totalMaggotHarvestKg: totalMaggot,
    totalCompostAndKasgotKg: totalCompost + totalKasgot,
    totalCompostKg: totalCompost,
    totalKasgotKg: totalKasgot,
    totalPocLiter: totalPoc,
    activeContributorsCount: SAMPLE_CONTRIBUTORS.length,
    estimatedCo2SavedKg: Math.round(totalWaste * SITE_CONFIG.co2FactorPerKgOrganic * 100) / 100,
    totalLogsCount: totalLogs,
    lastUpdatedAt: now,
  });
  console.log(`✓ 6 bulan impact_monthly & impact_summary/current selesai disemai.`);

  // 3. Contributors
  for (const contributor of SAMPLE_CONTRIBUTORS) {
    const { id, ...rest } = contributor;
    await db
      .collection('contributors')
      .doc(id)
      .set(
        {
          ...rest,
          lastDepositAt: now,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
  }
  console.log(`✓ ${SAMPLE_CONTRIBUTORS.length} mitra penyetor selesai disemai.`);

  // 4. Site Settings default override
  await db.collection('site_settings').doc('profile').set(
    {
      organizationName: SITE_CONFIG.organizationName,
      tagline: SITE_CONFIG.tagline,
      whatsappNumber: SITE_CONFIG.whatsappNumber,
      operatingHours: SITE_CONFIG.operatingHours,
      announcementText: SITE_CONFIG.announcementDefault,
      announcementActive: true,
      updatedAt: now,
      updatedBy: 'seed-script',
    },
    { merge: true }
  );

  // 5. Opsional bootstrap UID Admin pertama
  const adminArg = process.argv.find((arg) => arg.startsWith('--admin-uid='));
  if (adminArg) {
    const uid = adminArg.split('=')[1]?.trim();
    if (uid) {
      await db.collection('admins').doc(uid).set(
        {
          role: 'admin',
          name: 'Pengurus TPS 3R',
          isActive: true,
          createdAt: now,
        },
        { merge: true }
      );
      await getAdminAuth().setCustomUserClaims(uid, { admin: true });
      console.log(`✓ Admin UID ${uid} didaftarkan di admins/${uid} + custom claim admin:true.`);
    }
  }

  console.log('Selesai! Database TPS 3R siap digunakan.');
}

main().catch((err) => {
  console.error('Gagal seeding database-tps3r:', err);
  process.exit(1);
});

/**
 * Script Seeding Data TPS 3R Abdi Dalem Klebengan (Kadipiro, Kota Surakarta)
 * ke Firestore Named Database `database-tps3r`.
 *
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
    name: 'Maggot BSF Segar Klebengan (Pakan Hidup)',
    category: 'maggot',
    shortDescription:
      'Larva Black Soldier Fly segar protein >42% hasil biokonversi sisa makanan TPS 3R Kadipiro untuk pakan ikan lele, nila & unggas.',
    description:
      'Maggot BSF segar produksi biopond TPS 3R Abdi Dalem Klebengan – Ngipang, Kadipiro, Surakarta. Dipanen pada usia optimal 14–16 hari dari pakan sisa makanan terpilah bersih. Terbukti menekan biaya pelet peternak lele dan unggas Solo Raya hingga 40%.',
    usageGuide:
      'Berikan langsung 2–3% bobot tubuh ikan lele/nila atau campurkan 20% pada ransum ayam/bebek di pagi dan sore hari.',
    price: 9000,
    unit: 'kg',
    stockQty: 55,
    status: 'available',
    images: [],
    benefits: [
      'Protein kasar 42%–45% dengan asam amino esensial lengkap',
      'Mengandung asam laurat alami untuk ketahanan tubuh ikan & unggas',
      'Dipanen segar setiap pagi di kawasan Kali Klebengan, Kadipiro',
    ],
    badge: 'Panen Harian',
    sortOrder: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'maggot-bsf-kering',
    slug: 'maggot-bsf-kering',
    name: 'Maggot BSF Kering Oven Abdi Dalem (500g)',
    category: 'maggot',
    shortDescription:
      'Maggot BSF panggang higienis, renyah, tahan simpan hingga 6 bulan untuk ikan hias, burung kicau & unggas.',
    description:
      'Maggot BSF pilihan yang dicuci bersih lalu dikeringkan memakai oven suhu terkontrol sehingga nutrisinya utuh tanpa bau. Praktis untuk stok pakan peternak maupun pengiriman luar Kota Surakarta.',
    usageGuide:
      'Taburkan langsung ke kolam ikan hias/wadah pakan unggas atau campurkan dengan dedak dan pelet harian.',
    price: 35000,
    unit: 'kemasan 500g',
    stockQty: 30,
    status: 'available',
    images: [],
    benefits: [
      'Tahan simpan hingga 6 bulan di wadah tertutup rapat',
      'Cocok untuk ikan koi, channa, ayam petelur & burung kicau',
      '100% alami tanpa bahan pengawet dan pewarna buatan',
    ],
    badge: 'Tahan Lama',
    sortOrder: 2,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'kasgot-halus-10kg',
    slug: 'kasgot-halus-10kg',
    name: 'Kasgot (Bekas Maggot) Ayak Halus Klebengan 10 kg',
    category: 'kasgot',
    shortDescription:
      'Pupuk organik premium kaya kitin & mikroba baik, siap pakai untuk urban farming, tayurdapot, cabai & tanaman hias.',
    description:
      'Kasgot (frass) hasil biokonversi larva BSF di TPS 3R Kadipiro yang telah dimatangkan dan diayak halus. Menjadi andalan media tanam hortikultura dan program tanam sayur dalam pot (tayurdapot) warga RW 17 Ngipang.',
    usageGuide:
      'Campurkan 1 bagian kasgot dengan 4 bagian tanah untuk media pot/polybag, atau taburkan 2–3 sendok makan tiap 2 minggu.',
    price: 30000,
    unit: 'karung 10kg',
    stockQty: 72,
    status: 'available',
    images: [],
    benefits: [
      'Tekstur remah halus, tidak berbau, dan aman untuk akar tanaman pot',
      'Kaya unsur hara N-P-K organik serta mikroorganisme penyubur tanah',
      'Teruji langsung di kebun urban farming Kali Klebengan',
    ],
    badge: 'Best Seller',
    sortOrder: 3,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'kompos-curah-25kg',
    slug: 'kompos-curah-25kg',
    name: 'Pupuk Kompos & Kohe Fermentasi Abdi Dalem 25 kg',
    category: 'kompos',
    shortDescription:
      'Kompos matang sinergi serasah daun organik & kotoran ternak kambing/sapi Poktan Abdi Dalem untuk olah lahan.',
    description:
      'Pupuk kompos padat hasil integrasi pengolahan sampah organik TPS 3R dan kotoran ternak (kambing & sapi) kelompok tani RW 17 Ngipang, Kadipiro. Melalui proses fermentasi terkendali hingga dingin dan matang sempurna.',
    usageGuide:
      'Tebarkan 1,5–2 kg per m² saat pengolahan bedengan atau campurkan di lubang tanam sebelum pindah tanam bibit.',
    price: 35000,
    unit: 'karung 25kg',
    stockQty: 110,
    status: 'available',
    images: [],
    benefits: [
      'Menggemburkan tanah keras dan meningkatkan daya simpan air',
      'Mengurangi kebutuhan pupuk kimia sintetis pada lahan pertanian',
      'Harga ramah petani, penghobi tanaman hias & taman kota Solo',
    ],
    badge: 'Hemat Lahan',
    sortOrder: 4,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'poc-organik-1l',
    slug: 'poc-organik-1l',
    name: 'Pupuk Organik Cair (POC) Sirkular Kadipiro 1 Liter',
    category: 'poc',
    shortDescription:
      'Nutrisi cair fermentasi bahan organik & buah matang untuk memacu pertumbuhan daun, bunga, dan buah.',
    description:
      'Pupuk Organik Cair (POC) produksi Poktan Abdi Dalem Klebengan yang kaya mikroba pelarut hara dan zat pengatur tumbuh alami. Sangat praktis untuk perawatan mingguan tanaman pekarangan rumah perkotaan.',
    usageGuide:
      'Larutkan 20 ml (2 tutup botol) ke dalam 1 liter air bersih. Kocor ke media tanam atau semprot pagi hari seminggu sekali.',
    price: 18000,
    unit: 'botol 1L',
    stockQty: 45,
    status: 'available',
    images: [],
    benefits: [
      '1 botol 1L menghasilkan 50 liter larutan nutrisi siap pakai',
      'Cepat diserap akar maupun stomata daun tanaman',
      'Aroma fermentasi lembut, aman untuk halaman rumah perkotaan',
    ],
    badge: 'Siap Kocor',
    sortOrder: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'paket-sayur-organik-kebun',
    slug: 'paket-sayur-organik-kebun',
    name: 'Paket Sayur Tayurdapot Kali Klebengan (3 Ikat)',
    category: 'hasil_kebun',
    shortDescription:
      'Panen segar kangkung, bayam, dan sawi/pakcoy dari kebun urban farming bantaran Kali Klebengan bebas pestisida.',
    description:
      'Hasil nyata ekonomi sirkular RW 17 Ngipang, Kadipiro: sayuran sehat yang ditanam warga pada media tayurdapot (tanam sayur dalam pot) menggunakan kasgot, kompos, dan POC produksi sendiri.',
    usageGuide:
      'Pre-order panen pagi setiap Selasa, Kamis, dan Sabtu. Dapat dibeli tunai maupun ditukar poin tabungan sampah warga.',
    price: 15000,
    unit: 'paket (3 ikat)',
    stockQty: 18,
    status: 'preorder',
    images: [],
    benefits: [
      '100% bebas pestisida kimia sintetis',
      'Dipetik pagi hari langsung dari kebun RW 17 Ngipang',
      'Bisa ditukar langsung memakai saldo poin penyetor sampah',
    ],
    badge: 'Tukar Poin Bisa',
    sortOrder: 6,
    isFeatured: true,
    isActive: true,
  },
] as const;

const SAMPLE_MONTHLY = [
  { monthKey: '2026-06', label: 'Jun 2026', wasteKg: 3150, foodWasteKg: 1420, organicWasteKg: 1730, inorganicKg: 420, residueKg: 480, maggotKg: 325, compostKg: 820, kasgotKg: 430, pocLiter: 115, logsCount: 25 },
  { monthKey: '2026-07', label: 'Jul 2026', wasteKg: 3480, foodWasteKg: 1590, organicWasteKg: 1890, inorganicKg: 460, residueKg: 460, maggotKg: 368, compostKg: 895, kasgotKg: 475, pocLiter: 128, logsCount: 26 },
  { monthKey: '2026-08', label: 'Agu 2026', wasteKg: 3820, foodWasteKg: 1760, organicWasteKg: 2060, inorganicKg: 510, residueKg: 430, maggotKg: 412, compostKg: 980, kasgotKg: 525, pocLiter: 142, logsCount: 26 },
  { monthKey: '2026-09', label: 'Sep 2026', wasteKg: 4150, foodWasteKg: 1940, organicWasteKg: 2210, inorganicKg: 545, residueKg: 410, maggotKg: 455, compostKg: 1060, kasgotKg: 580, pocLiter: 155, logsCount: 25 },
  { monthKey: '2026-10', label: 'Okt 2026', wasteKg: 4520, foodWasteKg: 2150, organicWasteKg: 2370, inorganicKg: 590, residueKg: 390, maggotKg: 505, compostKg: 1150, kasgotKg: 640, pocLiter: 170, logsCount: 27 },
  { monthKey: '2026-11', label: 'Nov 2026', wasteKg: 4280, foodWasteKg: 2040, organicWasteKg: 2240, inorganicKg: 560, residueKg: 365, maggotKg: 482, compostKg: 1090, kasgotKg: 610, pocLiter: 162, logsCount: 22 },
] as const;

const SAMPLE_CONTRIBUTORS = [
  {
    id: 'contrib-001',
    memberCode: 'ADK-001',
    name: 'Warung Makan Mbak Sri (Selatan RSUD Ngipang)',
    type: 'warung',
    phoneNormalized: '628123450001',
    address: 'Jl. Lettu Sumarto, Ngipang, Kadipiro, Banjarsari, Surakarta',
    pickupDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    totalDepositedKg: 640,
    pointsBalance: 2450,
    isActive: true,
    notes: 'Setor rutin sisa nasi & potongan sayur tiap sore.',
  },
  {
    id: 'contrib-002',
    memberCode: 'ADK-002',
    name: 'Paguyuban Warga RT 01/RW 17 Ngipang',
    type: 'warga',
    phoneNormalized: '628123450002',
    address: 'Kampung Ngipang RT 01/RW 17, Kel. Kadipiro, Surakarta',
    pickupDays: ['Senin', 'Rabu', 'Jumat'],
    totalDepositedKg: 1120,
    pointsBalance: 3800,
    isActive: true,
    notes: 'Setoran kolektif sampah dapur rumah tangga terpilah.',
  },
  {
    id: 'contrib-003',
    memberCode: 'ADK-003',
    name: 'Kios Sayur Pak Parman (Pasar Kadipiro)',
    type: 'pasar',
    phoneNormalized: '628123450003',
    address: 'Area Los Sayur Pasar Kadipiro, Kec. Banjarsari, Surakarta',
    pickupDays: ['Selasa', 'Kamis', 'Sabtu'],
    totalDepositedKg: 980,
    pointsBalance: 3150,
    isActive: true,
    notes: 'Sisa sayuran segar & kulit buah untuk pakan biopond BSF.',
  },
  {
    id: 'contrib-004',
    memberCode: 'ADK-004',
    name: 'Katering & Dapur Berkah Banjarsari',
    type: 'restoran',
    phoneNormalized: '628123450004',
    address: 'Jl. Sumpah Pemuda, Kadipiro, Banjarsari, Surakarta',
    pickupDays: ['Senin', 'Kamis', 'Sabtu'],
    totalDepositedKg: 745,
    pointsBalance: 2600,
    isActive: true,
    notes: 'Penjemputan 3x seminggu menggunakan ember tertutup.',
  },
  {
    id: 'contrib-005',
    memberCode: 'ADK-005',
    name: 'Bank Sampah & PKK RW 17 Kadipiro',
    type: 'instansi',
    phoneNormalized: '628123450005',
    address: 'Balai RW 17 Kampung Ngipang, Kel. Kadipiro, Surakarta',
    pickupDays: ['Selasa', 'Jumat'],
    totalDepositedKg: 515,
    pointsBalance: 1920,
    isActive: true,
    notes: 'Sinergi penukaran poin dengan media tanam tayurdapot.',
  },
] as const;

const SAMPLE_DAILY_LOGS = [
  {
    id: 'seed-log-2026-11-23',
    date: '2026-11-23',
    monthKey: '2026-11',
    organicWasteKg: 98,
    foodWasteKg: 86,
    inorganicWasteKg: 24,
    residueToTpaKg: 14,
    maggotHarvestKg: 21.5,
    compostProducedKg: 50,
    kasgotProducedKg: 28,
    pocProducedLiter: 8,
    contributorId: 'contrib-001',
    contributorName: 'Warung Makan Mbak Sri (Selatan RSUD Ngipang)',
    earnedPoints: 2080,
    notes: 'Penimbangan sore rutin + panen biopond 1 & 2 Kali Klebengan.',
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-log-2026-11-24',
    date: '2026-11-24',
    monthKey: '2026-11',
    organicWasteKg: 112,
    foodWasteKg: 94,
    inorganicWasteKg: 30,
    residueToTpaKg: 12,
    maggotHarvestKg: 24,
    compostProducedKg: 60,
    kasgotProducedKg: 32,
    pocProducedLiter: 10,
    contributorId: 'contrib-003',
    contributorName: 'Kios Sayur Pak Parman (Pasar Kadipiro)',
    earnedPoints: 2360,
    notes: 'Setoran sayur Pasar Kadipiro & pengayakan kasgot karung 10kg.',
    recordedBy: 'admin@tps3r.id',
  },
] as const;

const SAMPLE_BATCHES = [
  {
    id: 'seed-batch-bp01',
    code: 'BP-01',
    type: 'biopond_maggot',
    startDate: '2026-11-10',
    targetHarvestDate: '2026-11-26',
    estimatedInputKg: 120,
    status: 'aktif',
    notes: 'Pakan sisa makanan Warung RSUD Ngipang & Pasar Kadipiro.',
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-batch-bp02',
    code: 'BP-02',
    type: 'biopond_maggot',
    startDate: '2026-11-16',
    targetHarvestDate: '2026-12-02',
    estimatedInputKg: 95,
    status: 'aktif',
    notes: 'Bibit 15g telur BSF — pertumbuhan larva sangat merata.',
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-batch-km01',
    code: 'KM-01',
    type: 'bedeng_kompos',
    startDate: '2026-10-25',
    targetHarvestDate: '2026-11-29',
    estimatedInputKg: 450,
    status: 'aktif',
    notes: 'Campuran serasah daun Kali Klebengan + kohe kambing RW 17.',
    recordedBy: 'admin@tps3r.id',
  },
] as const;

const SAMPLE_CASH_TX = [
  {
    id: 'seed-cash-1',
    date: '2026-11-24',
    monthKey: '2026-11',
    type: 'pemasukan',
    category: 'penjualan_maggot',
    amount: 270000,
    description: 'Penjualan 30 kg Maggot BSF Segar ke peternak lele Banjarsari',
    productId: 'maggot-bsf-segar',
    productName: 'Maggot BSF Segar Klebengan (Pakan Hidup)',
    qtySold: 30,
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-cash-2',
    date: '2026-11-23',
    monthKey: '2026-11',
    type: 'pemasukan',
    category: 'penjualan_pupuk',
    amount: 300000,
    description: 'Penjualan 10 karung Kasgot 10kg untuk urban farming Kadipiro',
    productId: 'kasgot-halus-10kg',
    productName: 'Kasgot (Bekas Maggot) Ayak Halus Klebengan 10 kg',
    qtySold: 10,
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-cash-3',
    date: '2026-11-22',
    monthKey: '2026-11',
    type: 'pengeluaran',
    category: 'bbm_jemput',
    amount: 75000,
    description: 'BBM motor roda 3 operasional jemput sisa makanan 1 minggu',
    recordedBy: 'admin@tps3r.id',
  },
  {
    id: 'seed-cash-4',
    date: '2026-11-21',
    monthKey: '2026-11',
    type: 'pengeluaran',
    category: 'kemasan_karung',
    amount: 110000,
    description: 'Beli 100 karung kompos/kasgot & botol kemasan POC 1L',
    recordedBy: 'admin@tps3r.id',
  },
] as const;

const SAMPLE_PARTNERSHIPS = [
  {
    id: 'seed-partner-1',
    partnerName: 'Warung Soto & Hik Sekitar RSUD Ngipang',
    partnerType: 'warung',
    contactName: 'Ibu Endang',
    phone: '081329001122',
    phoneNormalized: '6281329001122',
    address: 'Jl. Lettu Sumarto No. 12, Kadipiro, Banjarsari, Surakarta',
    estimatedKgPerWeek: 45,
    preferredPickupSchedule: 'Senin, Rabu, Jumat pukul 16.00 WIB',
    notes: 'Sisa kuah sudah ditiriskan, terpisah dari plastik dan tusuk sate.',
    status: 'baru',
  },
  {
    id: 'seed-partner-2',
    partnerName: 'Kantin Sekolah Kawasan Kadipiro Utara',
    partnerType: 'kantin',
    contactName: 'Pak Joko',
    phone: '085647002233',
    phoneNormalized: '6285647002233',
    address: 'Jl. Ki Mangun Sarkoro, Kadipiro, Banjarsari, Surakarta',
    estimatedKgPerWeek: 35,
    preferredPickupSchedule: 'Selasa & Jumat pukul 14.30 WIB',
    notes: 'Ingin bergabung program tabungan poin untuk pupuk kebun sekolah.',
    status: 'dihubungi',
  },
] as const;

const SAMPLE_EDU_BOOKINGS = [
  {
    id: 'seed-edu-1',
    organizationName: 'Mahasiswa KKN & Pengabdian Lingkungan UNS Surakarta',
    contactName: 'Raka Pratama',
    phone: '081226003344',
    phoneNormalized: '6281226003344',
    packageId: 'studi-banding-instansi',
    packageName: 'Studi Banding ProKlim, DLH, Kampus & CSR Surakarta',
    visitDate: '2026-12-05',
    participantCount: 30,
    notes: 'Fokus observasi ekonomi sirkular Kali Klebengan & manajemen biopond BSF.',
    status: 'menunggu',
  },
  {
    id: 'seed-edu-2',
    organizationName: 'SD Negeri Wilayah Kecamatan Banjarsari',
    contactName: 'Ibu Retno Wulandari',
    phone: '081567004455',
    phoneNormalized: '6281567004455',
    packageId: 'edukasi-sekolah',
    packageName: 'Edukasi Lingkungan & Urban Farming Kali Klebengan',
    visitDate: '2026-12-12',
    participantCount: 45,
    notes: 'Kunjungan outing class siswa kelas 4–5 praktik tayurdapot kasgot.',
    status: 'dikonfirmasi',
  },
] as const;

async function main() {
  const db = getAdminDb();
  const now = Timestamp.now();

  console.log(
    `Menyemai data v2 TPS 3R Abdi Dalem Klebengan Kadipiro ke Firestore: ${ADMIN_DATABASE_ID}...`
  );

  for (const product of SAMPLE_PRODUCTS) {
    const { id, ...rest } = product;
    await db.collection('products').doc(id).set({ ...rest, createdAt: now, updatedAt: now });
  }

  let totalWaste = 0;
  let totalFood = 0;
  let totalOrganic = 0;
  let totalInorganic = 0;
  let totalResidue = 0;
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
    totalInorganic += m.inorganicKg;
    totalResidue += m.residueKg;
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
    totalInorganicWasteKg: totalInorganic,
    totalResidueToTpaKg: totalResidue,
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

  for (const contributor of SAMPLE_CONTRIBUTORS) {
    const { id, ...rest } = contributor;
    await db.collection('contributors').doc(id).set({
      ...rest,
      lastDepositAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const log of SAMPLE_DAILY_LOGS) {
    const { id, ...rest } = log;
    await db.collection('daily_logs').doc(id).set({ ...rest, createdAt: now });
  }

  for (const batch of SAMPLE_BATCHES) {
    const { id, ...rest } = batch;
    await db.collection('production_batches').doc(id).set({ ...rest, createdAt: now });
  }

  for (const tx of SAMPLE_CASH_TX) {
    const { id, ...rest } = tx;
    await db.collection('cash_transactions').doc(id).set({ ...rest, createdAt: now });
  }

  for (const req of SAMPLE_PARTNERSHIPS) {
    const { id, ...rest } = req;
    await db.collection('partnership_requests').doc(id).set({ ...rest, createdAt: now });
  }

  for (const bk of SAMPLE_EDU_BOOKINGS) {
    const { id, ...rest } = bk;
    await db.collection('edu_bookings').doc(id).set({ ...rest, createdAt: now });
  }

  await db.collection('site_settings').doc('profile').set({
    organizationName: SITE_CONFIG.organizationName,
    tagline: SITE_CONFIG.tagline,
    whatsappNumber: SITE_CONFIG.whatsappNumber,
    address: SITE_CONFIG.address,
    operatingHours: SITE_CONFIG.operatingHours,
    announcementText: SITE_CONFIG.announcementDefault,
    announcementActive: true,
    mapEmbedUrl: SITE_CONFIG.mapEmbedUrl,
    chairmanName: SITE_CONFIG.chairmanName,
    legalityNumber: SITE_CONFIG.legalityNumber,
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  const adminArg = process.argv.find((arg) => arg.startsWith('--admin-uid='));
  if (adminArg) {
    const uid = adminArg.split('=')[1]?.trim();
    if (uid) {
      await db.collection('admins').doc(uid).set(
        {
          role: 'admin',
          name: 'Pengurus TPS 3R Abdi Dalem Klebengan',
          isActive: true,
          createdAt: now,
        },
        { merge: true }
      );
      await getAdminAuth().setCustomUserClaims(uid, { admin: true });
      console.log(`✓ Admin UID ${uid} aktif di admins/${uid} + claim admin:true.`);
    }
  }

  console.log('✓ Seluruh data operasional v2 (produk, dampak SIPSN, mitra+rute, batch, kas, inbox) selesai disemai!');
}

main().catch((err) => {
  console.error('Gagal seeding database-tps3r:', err);
  process.exit(1);
});

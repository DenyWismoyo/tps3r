export type WasteSortingCategory =
  | 'organik_maggot'
  | 'organik_kompos'
  | 'anorganik_pilah'
  | 'dilarang';

export interface WasteSortingItem {
  id: string;
  name: string;
  category: WasteSortingCategory;
  allowed: boolean;
  examples: string;
  prepTip: string;
}

export interface PointsRewardItem {
  id: string;
  title: string;
  pointsCost: number;
  unitLabel: string;
  note: string;
  categoryBadge: string;
}

export interface TimelineMilestone {
  era: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  topic: 'pembelian' | 'kemitraan' | 'budidaya' | 'eduwisata';
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  highlight: string;
}

export interface WeeklyScheduleItem {
  dayLabel: string;
  activity: string;
  timeRange: string;
  note: string;
}

export const WASTE_SORTING_CATEGORY_LABELS: Record<WasteSortingCategory, string> = {
  organik_maggot: 'Pakan Maggot BSF',
  organik_kompos: 'Bahan Kompos',
  anorganik_pilah: 'Anorganik Bank Sampah',
  dilarang: 'Jangan Dicampur (Residu/B3)',
};

export const WASTE_SORTING_ITEMS: readonly WasteSortingItem[] = [
  {
    id: 'nasi-lauk',
    name: 'Sisa Nasi, Sayur Matang & Lauk Lunak',
    category: 'organik_maggot',
    allowed: true,
    examples: 'Nasi sisa, potongan tahu/tempe, mie, sayur berkuah (ditiriskan), roti basi',
    prepTip: 'Tiriskan air kuah berlebih & pastikan bebas tusuk gigi, karet gelang, dan plastik.',
  },
  {
    id: 'buah-sayur-mentah',
    name: 'Potongan Sayur Pasar & Kulit Buah Lunak',
    category: 'organik_maggot',
    allowed: true,
    examples: 'Kulit pisang, pepaya, semangka, tomat layu, sawi/kol afkir pasar',
    prepTip: 'Sangat disukai larva Maggot BSF — potong besar jika terlalu utuh agar cepat terurai.',
  },
  {
    id: 'ampas-dapur',
    name: 'Ampas Kelapa, Ampas Tahu & Ampas Kopi/Teh',
    category: 'organik_maggot',
    allowed: true,
    examples: 'Ampas parutan kelapa, ampas kedelai, bubuk kopi/daun teh tanpa kantong plastik',
    prepTip: 'Campurkan dengan sisa nasi untuk menjaga kelembapan media biopond BSF.',
  },
  {
    id: 'daun-ranting',
    name: 'Daun Gugur, Serasah Kebun & Potongan Rumput',
    category: 'organik_kompos',
    allowed: true,
    examples: 'Daun kering pekarangan, batang pisang cacah, rumput potong, kulit jagung',
    prepTip: 'Pisahkan dari batu/plastik agar mudah dicacah menjadi bahan kompos matang.',
  },
  {
    id: 'cangkang-telur-tulang',
    name: 'Cangkang Telur & Tulang Keras (Ayam/Sapi)',
    category: 'organik_kompos',
    allowed: true,
    examples: 'Kulit telur, tulang ayam/ikan keras, kulit durian/kelapa muda',
    prepTip: 'Tidak untuk biopond maggot; dipisahkan ke jalur pengomposan/penghancuran kalsium.',
  },
  {
    id: 'kardus-plastik-botol',
    name: 'Kardus, Botol PET, Kertas & Kaleng Bersih',
    category: 'anorganik_pilah',
    allowed: true,
    examples: 'Kardus lipat, botol air mineral tanpa isi, jeriken bersih, kaleng minuman',
    prepTip: 'Kosongkan cairan dan simpan terpisah dalam kondisi kering untuk Bank Sampah RW 17.',
  },
  {
    id: 'plastik-tusuk-sate',
    name: 'Plastik Kresek, Sachet, Styrofoam & Tusuk Sate',
    category: 'dilarang',
    allowed: false,
    examples: 'Bungkus bumbu instan, sedotan, mika makanan, karet gelang, tusuk sate bambu',
    prepTip: 'Wajib dipisahkan karena dapat melukai petugas & merusak mesin pencacah organik.',
  },
  {
    id: 'b3-popok-minyak',
    name: 'Popok Bekas, Pecahan Kaca, Baterai & Minyak Jelantah',
    category: 'dilarang',
    allowed: false,
    examples: 'Popok/pembalut, lampu neon, obat kedaluwarsa, pecahan beling, minyak goreng bekas',
    prepTip: 'Jangan dimasukkan ke ember organik. Kumpulkan minyak jelantah di botol terpisah.',
  },
] as const;

export const POINTS_REWARD_CATALOG: readonly PointsRewardItem[] = [
  {
    id: 'reward-maggot',
    title: 'Maggot BSF Segar (1 kg)',
    pointsCost: 120,
    unitLabel: '1 kg pakan hidup',
    note: 'Cocok untuk peternak lele, ayam kampung, atau ikan hias rumahan.',
    categoryBadge: 'Pakan Ternak',
  },
  {
    id: 'reward-sayur',
    title: 'Paket Sayur Tayurdapot Segar (3 Ikat)',
    pointsCost: 150,
    unitLabel: 'Kangkung / Bayam / Pakcoy',
    note: 'Dipetik pagi hari dari kebun urban farming bantaran Kali Klebengan.',
    categoryBadge: 'Hasil Kebun',
  },
  {
    id: 'reward-poc',
    title: 'Pupuk Organik Cair (POC) 1 Liter',
    pointsCost: 220,
    unitLabel: '1 botol siap kocor',
    note: 'Cukup untuk 50 liter larutan penyubur tanaman pekarangan.',
    categoryBadge: 'Pupuk Cair',
  },
  {
    id: 'reward-kasgot',
    title: 'Kasgot Ayak Halus Premium (10 kg)',
    pointsCost: 350,
    unitLabel: '1 karung 10 kg',
    note: 'Media tanam favorit warga RW 17 untuk cabai, tomat, dan tanaman hias.',
    categoryBadge: 'Best Seller',
  },
  {
    id: 'reward-kompos',
    title: 'Pupuk Kompos & Kohe Matang (25 kg)',
    pointsCost: 400,
    unitLabel: '1 karung 25 kg',
    note: 'Ideal untuk olah lahan pertanian maupun perbaikan tanah kebun.',
    categoryBadge: 'Olah Lahan',
  },
] as const;

export const KALI_KLEBENGAN_TIMELINE: readonly TimelineMilestone[] = [
  {
    era: 'Awal 2000-an',
    title: 'Kepedulian Awal pada Pencemaran Kali Klebengan',
    description:
      'Warga Kampung Ngipang RW 17 Kadipiro mulai bergerak membersihkan sedimentasi dan pencemaran limbah di aliran Sungai Kali Klebengan secara swadaya.',
  },
  {
    era: 'Penguatan Kelembagaan',
    title: 'Lahirnya Poktan Abdi Dalem Klebengan & Urban Farming',
    description:
      'Lahan bantaran terbengkalai disulap menjadi zona produktif: kebun sayur dalam pot (tayurdapot), kolam ikan lele, serta peternakan kambing & sapi terpadu.',
  },
  {
    era: 'Sinergi TPS 3R',
    title: 'Integrasi TPS 3R Ngipang, Biopond Maggot BSF & Kompos',
    description:
      'Sampah organik rumah tangga, warung, dan pasar sekitar Kadipiro diolah di hulu menjadi Maggot BSF, Kasgot, Kompos, dan POC untuk memangkas beban TPA Putri Cempo.',
  },
  {
    era: '2026 — Digitalisasi',
    title: 'Transparansi Dampak Digital & Layanan Sirkular Terbuka',
    description:
      'Katalog stok live, kalkulator takaran, cek poin warga tanpa login, laporan cetak DLH/CSR, dan pencatatan lapangan cepat berbasis HP hadir melayani warga Solo Raya.',
  },
] as const;

export const PUBLIC_FAQS: readonly FaqItem[] = [
  {
    topic: 'pembelian',
    question: 'Apakah saya harus membuat akun untuk memesan Maggot BSF atau pupuk?',
    answer:
      'Tidak perlu. Cukup pilih produk di menu Katalog, masukkan ke keranjang, lalu klik "Checkout via WhatsApp". Pesanan Anda langsung terformat rapi ke nomor resmi TPS 3R Abdi Dalem Klebengan.',
  },
  {
    topic: 'pembelian',
    question: 'Apakah produk bisa dikirim ke luar Kelurahan Kadipiro atau luar Kota Surakarta?',
    answer:
      'Untuk area Solo Raya (Surakarta, Karanganyar, Sukoharjo, Boyolali, Klaten), pesanan bisa diambil di lokasi Kali Klebengan atau dikirim via kurir lokal. Khusus Maggot BSF Kering Oven dan POC 1L aman dikirim ke luar kota via ekspedisi.',
  },
  {
    topic: 'kemitraan',
    question: 'Bagaimana cara kerja tabungan poin setor sisa makanan bagi warga & warung?',
    answer:
      'Setiap 1 kg sampah organik/anorganik terpilah yang Anda setor bernilai 10 poin. Petugas mencatat saat penimbangan dan mengirimkan struk poin ke WhatsApp Anda. Saldo poin bisa dicek kapan saja di menu Kemitraan lalu ditukar pupuk atau sayur tayurdapot.',
  },
  {
    topic: 'budidaya',
    question: 'Apakah budidaya Maggot BSF di TPS 3R menimbulkan bau menyengat?',
    answer:
      'Tidak. Karena sampah sisa makanan langsung dipilah tanpa plastik dan diurai cepat oleh larva Black Soldier Fly (BSF) dengan pengaturan kelembapan terukur, proses biokonversi berlangsung bersih dan minim bau dibanding penumpukan sampah biasa.',
  },
  {
    topic: 'eduwisata',
    question: 'Bagaimana prosedur booking studi banding untuk sekolah, kampus, atau DLH/CSR?',
    answer:
      'Silakan pilih paket dan tanggal di menu Eduwisata, isi jumlah peserta, lalu kirim formulir. Setelah tersimpan, klik tombol konfirmasi WhatsApp untuk koordinasi jadwal, surat resmi kunjungan, dan kebutuhan khusus rombongan.',
  },
] as const;

export const PUBLIC_TESTIMONIALS: readonly TestimonialItem[] = [
  {
    name: 'Pak Slamet Widodo',
    role: 'Pembudidaya Ikan Lele, Kec. Banjarsari',
    quote:
      'Sejak rutin campur Maggot BSF segar dari Klebengan, biaya pelet kolam saya turun hampir sepertiga dan pertumbuhan ikan lebih seragam.',
    highlight: 'Hemat pakan ~35%',
  },
  {
    name: 'Ibu Endang Lestari',
    role: 'Pemilik Warung Makan Sekitar RSUD Ngipang',
    quote:
      'Sisa dapur warung sekarang tidak lagi menumpuk bau. Dijemput rutin, dapat struk poin di WA, dan tiap bulan bisa ditukar kasgot serta sayur segar.',
    highlight: 'Mitra Setor Rutin',
  },
  {
    name: 'Ibu Hartini',
    role: 'Kader PKK & Penghobi Tayurdapot RW 17',
    quote:
      'Kasgot halus dan POC Kadipiro membuat cabai dan pakcoy di polybag pekarangan tumbuh subur tanpa pupuk kimia. Teksturnya gembur dan tidak panas di akar.',
    highlight: 'Pengguna Kasgot & POC',
  },
] as const;

export const WEEKLY_OPERATIONAL_SCHEDULE: readonly WeeklyScheduleItem[] = [
  {
    dayLabel: 'Senin – Sabtu',
    activity: 'Panen Maggot BSF Segar & Pengambilan Katalog',
    timeRange: '07.30 – 16.00 WIB',
    note: 'Disarankan pesan pagi hari untuk stok maggot segar panen baru.',
  },
  {
    dayLabel: 'Selasa, Kamis & Sabtu',
    activity: 'Panen Sayur Organik Tayurdapot Kebun Klebengan',
    timeRange: '07.30 – 11.00 WIB',
    note: 'Tersedia untuk pembelian tunai WA maupun tukar poin warga.',
  },
  {
    dayLabel: 'Senin – Sabtu (Sore)',
    activity: 'Rute Jemput Sisa Makanan Mitra Warung & Pasar',
    timeRange: '15.00 – 17.00 WIB',
    note: 'Penimbangan di tempat + kirim struk saldo poin otomatis via WA.',
  },
] as const;

# tps3r

**Digitalisasi Landing Page & Sistem Operasional Kelompok Tani – TPS 3R Ekonomi Sirkular**

Aplikasi web full-stack berbasis **Next.js 15 (App Router)**, **TypeScript Strict Mode**, **Firebase terisolasi** (`database-tps3r` & `gs://tps3r-sigap-586c4`), dan **Global Semantic CSS (Single Source of Truth)** di `src/app/globals.css` tanpa Tailwind CSS atau inline style.

---

## Fitur Utama

### Halaman Publik
- **Landing Page (`/`)**: Identitas Kelompok Tani/TPS 3R, 4 KPI dampak real-time, diagram alur ekonomi sirkular 4 tahap, produk unggulan, preview grafik tren, ajakan kemitraan, paket eduwisata, dan profil lokasi + peta.
- **Katalog & Detail Produk (`/katalog`, `/katalog/[slug]`)**: Filter kategori (Maggot BSF, Kasgot, Kompos, POC, Hasil Kebun), pencarian live, stok real-time, dan **Keranjang Belanja WhatsApp tanpa login** (`localStorage`).
- **Kalkulator Takaran (`/kalkulator`)**: Hitung kebutuhan kompos/kasgot/POC (m² atau polybag) serta pakan Maggot BSF (lele, nila, ayam, bebek) + tombol masuk keranjang WA.
- **Transparansi Dampak & Cetak A4 (`/dampak`)**: Grafik batang SVG murni, tabel rekap bulanan, dan tombol **Cetak Laporan Bulanan (PDF/Print)** berkop resmi untuk DLH/CSR (`@media print`).
- **Kemitraan & Cek Poin (`/kemitraan`)**: Form daftar setor sisa makanan rutin & widget **Cek Poin Penyetor** tanpa login via Nomor HP / Kode Member.
- **Eduwisata & Studi Banding (`/eduwisata`)**: Daftar paket kunjungan/pelatihan & form booking jadwal + konfirmasi WA.

### Panel Pengurus Lapangan (`/admin` — Mobile-First)
- **Quick Log Harian (`< 1 menit`)**: Touch-target ≥ `46px`, tombol preset `+5/+10/+25 kg`, offline cache Firestore (`persistentLocalCache`), dan transaksi atomik `runTransaction` (update `daily_logs`, `impact_summary/current`, `impact_monthly/{YYYY-MM}`, dan saldo poin `contributors`).
- **Katalog & Stok 1-Klik (`/admin/produk`)**: Ubah stok (`-1/+5`) & status (`Tersedia/Pre-Order/Habis`) dalam 1 klik, serta modal tambah/edit produk + upload foto ke Cloud Storage khusus TPS 3R.
- **Mitra Penyetor & Tabungan Poin (`/admin/penyetor`)**: Daftar penyetor baru & catat penukaran poin (redeem) atomik.
- **Inbox Kemitraan & Eduwisata (`/admin/permintaan`)**: Update status 1-klik + tombol balas langsung ke WhatsApp pemohon.

---

## Isolasi Resource Firebase (`sigap-586c4`)

Proyek ini terisolasi penuh pada project Firebase `sigap-586c4`:
- **Firestore Named Database**: `database-tps3r` (`STANDARD`, `asia-southeast2`)
- **Cloud Storage Bucket**: `tps3r-sigap-586c4` (`gs://tps3r-sigap-586c4`, `asia-southeast2`)
- **Security Rules & Indexes**: `firestore.rules`, `firestore.indexes.json`, `storage.rules`

---

## Setup Lokal

1. **Instalasi dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi environment**:
   Salin `.env.example` menjadi `.env.local` dan lengkapi kredensial Firebase Web SDK serta jalur `service-account-tps3r.json` (untuk Admin SDK / seeding).

3. **Seeding data awal & aktivasi admin pertama**:
   ```bash
   # Isi 6 produk contoh, 6 bulan tren dampak, dan 5 mitra penyetor
   npm run seed

   # Sekaligus daftarkan UID pengurus pertama dari Firebase Auth
   npx tsx src/utils/seedData.ts --admin-uid=<FIREBASE_AUTH_UID>
   ```

4. **Jalankan server development**:
   ```bash
   npm run dev
   ```

5. **Verifikasi kode & build produksi**:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

---

## Kustomisasi Cepat (Config-Driven)

| Perubahan | File Tunggal |
| :--- | :--- |
| Warna tema, font, radius, ukuran tombol, cetak A4 | `src/app/globals.css` (`:root`) |
| Nama Poktan/TPS 3R, nomor WA, alamat, peta, kop laporan | `src/config/site.ts` |
| Menu navigasi publik & admin | `src/config/navigation.ts` |
| Daftar & tarif paket eduwisata / pelatihan | `src/config/packages.ts` |
| Konstanta & rumus takaran kompos/kasgot/maggot | `src/config/calculator.ts` |

---

## Deploy (Vercel / Firebase App Hosting)

1. Deploy Firestore Rules, Indexes, dan Storage Rules:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage --project sigap-586c4
   ```
2. Set seluruh variabel `NEXT_PUBLIC_FIREBASE_*` (termasuk `NEXT_PUBLIC_FIREBASE_DATABASE_ID=database-tps3r` dan `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tps3r-sigap-586c4`) di dashboard Vercel atau `apphosting.yaml`.
3. Untuk operasi server Admin SDK di production, isi `FIREBASE_SERVICE_ACCOUNT_KEY` sebagai JSON string satu baris (jangan pernah commit file `service-account-tps3r.json`).

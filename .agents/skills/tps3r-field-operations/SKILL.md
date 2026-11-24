---
name: tps3r-field-operations
description: >-
  Spesifikasi domain bisnis dan alur operasional Kelompok Tani & TPS 3R Ekonomi
  Sirkular: Quick Log harian < 1 menit, Kalkulator Takaran Pupuk & Maggot BSF,
  Checkout Keranjang WhatsApp tanpa login, Cek Poin Penyetor, Laporan DLH/CSR A4,
  dan Inbox Kemitraan/Eduwisata. Gunakan saat membangun komponen shared/, sections/, atau admin/.
---

# Spesifikasi Fitur Domain & Operasional Lapangan TPS 3R

## 1. Empat Peran Pengguna & Target UX

1. **Warga & Mitra Penyetor**: Daftar setor sisa makanan (`/kemitraan`) & cek saldo poin via Nomor HP / Kode Member **tanpa wajib login**.
2. **Pembeli Produk** (petani, peternak, hobiis): Lihat stok live (`/katalog` & `/katalog/[slug]`), hitung takaran (`/kalkulator`), tambah ke keranjang lokal (`localStorage`), checkout dalam 1 pesan WhatsApp terformat rapi **tanpa login**.
3. **Mitra Institusi / Pemda / DLH / Kampus / CSR**: Pantau transparansi dampak real-time (`/dampak`), cetak laporan bulanan resmi kop Poktan (`@media print` 1–2 halaman A4), dan booking kunjungan/pelatihan (`/eduwisata`).
4. **Pengurus TPS 3R di Lapangan (`/admin`)**: Input timbangan harian **< 1 menit via HP**, update stok 1-klik, kelola poin penyetor, dan tindak lanjuti inbox via 1-klik WhatsApp.

## 2. Spesifikasi Modul Domain

### A. Quick Log Harian (`/admin` — `QuickLogForm`)
- Target waktu pengisian: **< 1 menit** di layar HP (`360px+`).
- Input angka wajib memakai `inputMode="decimal"` dan tinggi minimal `46px`.
- Sediakan tombol preset cepat `+5 kg`, `+10 kg`, `+25 kg` untuk field utama (sampah organik masuk, sisa makanan, panen maggot, produksi kompos/kasgot).
- Pilihan opsional `Mitra Penyetor` (`contributorId`) agar 1 kg sampah organik terpilah otomatis menambah `10 poin` ke saldo mitra.
- Tampilkan indikator status koneksi (Online / Mode Offline — data akan otomatis tersinkron saat sinyal kembali).

### B. Kalkulator Takaran (`FertilizerCalculator`)
Dipakai ulang di `/kalkulator` dan di halaman detail produk `/katalog/[slug]` (dengan `preselectedProductSlug`).
Seluruh konstanta rumus wajib dibaca dari `src/config/calculator.ts`:
- **Mode 1 — Pupuk Lahan & Tanaman (Kompos / Kasgot / POC)**:
  - Input: mode satuan (`luas lahan m²` atau `jumlah pot/polybag`) + jenis tanaman (sayuran daun, buah/cabai, tanaman hias, padi/palawija).
  - Output: rekomendasi kg Kompos / Kasgot dan liter POC, frekuensi aplikasi, estimasi biaya, + tombol **"Tambah Rekomendasi ke Keranjang WA"**.
- **Mode 2 — Pakan Ternak Maggot BSF**:
  - Input: jenis ternak (`lele`, `nila`, `ayam kampung`, `bebek`) + jumlah ekor.
  - Output: rekomendasi gram/kg maggot segar & maggot kering per hari dan per minggu, rasio substitusi pakan pabrikan, estimasi biaya, + tombol **"Pesan via WhatsApp" / "Tambah ke Keranjang"**.

### C. Keranjang Lokal & Checkout WhatsApp (`useCart`, `MiniCartDrawer`, `src/utils/whatsapp.ts`)
- State keranjang disimpan di `localStorage` (dengan proteksi SSR hydration).
- Format pesan WA (`buildCartWhatsAppMessage`) harus rapi, mudah dibaca pengurus di HP:
  - Salam & identitas tujuan (dari `src/config/site.ts`),
  - Daftar item bernomor (`Nama Produk × Qty Satuan = Rp ...`),
  - Total estimasi,
  - Kolom isian nama pembeli & metode ambil/kirim.
- Nomor HP selalu dinormalisasi ke format internasional `628...` (`normalizePhoneIndonesia`).

### D. Cek Poin Penyetor (`PointsLookupWidget`)
- Input tunggal: Nomor HP (contoh `0812...` / `62812...`) atau Kode Member (contoh `TPS-001`).
- Normalisasi input HP secara otomatis sebelum query Firestore `contributors`.
- Tampilkan: Nama mitra, Kode Member, Kategori (`warga`/`warung`/`restoran`/dll.), Total kg sampah organik disetor, Saldo Poin, dan tombol WA untuk penukaran poin (redeem pupuk/sayur).

### E. Laporan Transparansi Dampak & Cetak A4 (`PrintableImpactReport`)
- Memakai `ImpactMetricsGrid` + `ImpactTrendChart` (SVG murni) + tabel ringkasan bulanan.
- Kop laporan resmi mengambil nama Poktan/TPS 3R, alamat, legalitas, dan penanggung jawab dari `src/config/site.ts`.
- Tombol **"Cetak Laporan Bulanan (PDF / Print)"** memanggil `window.print()`, memanfaatkan `@media print` di `src/app/globals.css`.

### F. Inbox Kemitraan & Booking Eduwisata (`RequestStatusList`)
- Gabungkan dalam 2 tab (`Setor Sisa Makanan` & `Booking Eduwisata`).
- Update status 1-klik (`baru` → `dihubungi` → `aktif`/`ditolak` dan `menunggu` → `dikonfirmasi` → `selesai`/`batal`).
- Setiap baris wajib memiliki tombol 1-klik **Balas WhatsApp** dengan template pesan kontekstual (menyapa nama pemohon & menyebut jadwal/paket yang diajukan).

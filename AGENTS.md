# Aturan Proyek — Digitalisasi Kelompok Tani & TPS 3R Ekonomi Sirkular

Dokumen ini adalah **Workspace Rules (Always-On)** untuk seluruh repositori `TPS 3R`. Setiap sesi AI dan developer WAJIB mematuhi seluruh prinsip di bawah tanpa pengecualian.

---

## 1. Prinsip Arsitektur Wajib (Non-Negotiable)

1. **Global CSS sebagai Single Source of Truth (SSOT)**:
   - Seluruh design tokens (`:root`), layout primitives, komponen atomik, kelas domain, responsivitas mobile, dan `@media print` WAJIB didefinisikan terpusat di `src/app/globals.css`.
   - **DILARANG** memakai Tailwind CSS, utility class bloat di JSX, CSS-in-JS (`styled-components`, `emotion`), atau `style={{ ... }}` inline style (kecuali satu-satunya pengecualian absolut untuk CSS custom property dinamis seperti bar chart/progress jika tidak bisa diekspresikan dengan SVG atribut, namun tetap prioritaskan atribut SVG murni).
   - Komponen `.tsx` hanya memakai class semantik dari `src/app/globals.css` (contoh: `className="card card--elevated"`, `className="btn btn--primary btn--lg"`).

2. **Struktur Folder Datar & Standar Next.js App Router**:
   - **DILARANG** membuat route group berlapis seperti `(public)/(marketing)/(shop)` atau nested folder berlebihan.
   - Ikuti pemisahan 5 lapis komponen secara tegas:
     - `src/components/ui/` — Atomik dasar (100% bebas logika bisnis)
     - `src/components/layout/` — Kerangka navigasi global (`Navbar`, `Footer`, `PageBanner`, `AdminShell`)
     - `src/components/shared/` — Komponen domain reusable lintas publik & admin
     - `src/components/sections/` — Blok rakitan Landing Page
     - `src/components/admin/` — Widget operasional pengurus TPS 3R (`/admin`)

3. **Komponen Granular & Reusable**:
   - Pecah UI menjadi komponen kecil yang independen (< 200 baris per komponen).
   - **DILARANG** membuat komponen raksasa yang mencampur fetch Firestore, validasi, logika bisnis, dan markup UI sekaligus.
   - Seluruh operasi baca/tulis Firestore & Storage WAJIB diisolasi di `src/services/`.

4. **Pola Thin Page & Thin Slug**:
   - Setiap file `page.tsx` dan `[slug]/page.tsx` di `src/app/` WAJIB tipis (target **30–70 baris**).
   - Tugas `page.tsx` HANYA: SEO `metadata`/`generateMetadata`, membaca `params`/`searchParams`, memanggil service/hook data, dan merakit komponen modular.

5. **Config-Driven Customization**:
   - Seluruh profil Poktan/TPS 3R, nomor WhatsApp, alamat, jam buka, navigasi, paket eduwisata, dan konstanta rumus kalkulator WAJIB ditempatkan di `src/config/` (`site.ts`, `navigation.ts`, `packages.ts`, `calculator.ts`), BUKAN hardcode di komponen.

6. **Ramah Lapangan & Aksesibilitas**:
   - Touch-target tombol & input lapangan (khususnya `/admin`) minimal `46px` (`--touch-target: 46px`).
   - Kontras warna minimal WCAG AA agar terbaca jelas di bawah sinar matahari lapangan.
   - Mendukung layar HP kecil (`360px`) dan cetak laporan A4 (`@media print` pada `/dampak`).

---

## 2. Isolasi Resource Firebase (WAJIB)

Proyek ini berbagi Firebase Project `sigap-586c4`, sehingga **WAJIB** menggunakan resource terisolasi khusus TPS 3R dan **DILARANG** menyentuh database `(default)` atau `database-siyap` maupun bucket default `sigap-586c4.firebasestorage.app`:

- **Firebase Project ID**: `sigap-586c4`
- **Firestore Named Database**: `database-tps3r` (Standard Edition, `asia-southeast2`)
  - Web SDK: `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }, DATABASE_ID)`
  - Admin SDK: `getFirestore(adminApp, DATABASE_ID)`
- **Cloud Storage Bucket Khusus**: `tps3r-sigap-586c4` (`gs://tps3r-sigap-586c4`, `asia-southeast2`)
  - Prefix path terstruktur: `products/{productId}/{timestamp}-{safeFileName}` dan `reports/...`
- **Hemat Biaya Read & Integritas Transaksi**:
  - Halaman publik membaca angka dampak dari dokumen agregat tunggal `impact_summary/current` dan `impact_monthly/{YYYY-MM}` (bukan menjumlah semua `daily_logs` di client).
  - Penyimpanan `daily_logs` WAJIB menggunakan `runTransaction` atomik untuk memperbarui `daily_logs`, `impact_summary/current`, `impact_monthly/{YYYY-MM}`, dan saldo poin `contributors` (jika ada `contributorId`).
- **Keamanan Secret**:
  - Jangan pernah commit `.env.local` atau `service-account-tps3r.json`.
  - Jangan menyimpan PII sensitif (NIK/email pribadi warga) di koleksi `contributors`.

---

## 3. Rujukan Skills Proyek

Aktifkan skill yang relevan di `.agents/skills/` sebelum mengerjakan bagian terkait:
- `tps3r-architecture` — Struktur folder, pola Thin Page/Slug, matriks reusability, dan urutan 5 Fase pembangunan.
- `tps3r-global-css-ui` — Design tokens `:root`, katalog kelas semantik `globals.css`, responsivitas 360px, dan `@media print`.
- `tps3r-firebase-data` — Inisialisasi `database-tps3r` & `gs://tps3r-sigap-586c4`, offline cache, skema 8 koleksi, transaksi atomik, dan security rules.
- `tps3r-field-operations` — Logika bisnis Quick Log < 1 menit, Kalkulator Pupuk/Maggot, Checkout WA, Cek Poin, Laporan DLH/CSR, dan Inbox Admin.

---

## 4. Verifikasi Wajib Sebelum Selesai

Setiap kali menyelesaikan fase atau perubahan kode, jalankan:
```powershell
npx tsc --noEmit
npm run build
```
Pastikan nol error TypeScript, nol inline style, dan seluruh `page.tsx` tetap mengikuti pola Thin Page.

---
name: tps3r-firebase-data
description: >-
  Konfigurasi Firebase terisolasi (Firestore named database `database-tps3r` dan
  Cloud Storage bucket `tps3r-sigap-586c4`), offline persistence, skema 8 koleksi,
  kontrak TypeScript, transaksi atomik, dan security rules untuk proyek TPS 3R.
  Aktifkan sebelum menyentuh src/lib/firebase*, src/services/*, src/types/database.ts,
  atau aturan keamanan Firebase.
---

# Arsitektur Data & Firebase Terisolasi — TPS 3R

## 1. Isolasi Resource Firebase (`sigap-586c4`)

Proyek TPS 3R menggunakan resource **terpisah sepenuhnya** dari aplikasi lain di project `sigap-586c4`:

| Resource | Nilai Resmi TPS 3R | Region / Catatan |
| :--- | :--- | :--- |
| Firebase Project ID | `sigap-586c4` | Shared GCP/Firebase project |
| Firestore Database ID | `database-tps3r` | `STANDARD` Edition, `asia-southeast2` |
| Cloud Storage Bucket | `tps3r-sigap-586c4` (`gs://tps3r-sigap-586c4`) | `asia-southeast2`, Uniform bucket-level access + CORS aktif |
| Service Account Lokal | `service-account-tps3r.json` | Di-ignore oleh `.gitignore`; untuk Admin SDK & seeding |

> **PERINGATAN**: JANGAN pernah menginisialisasi `getFirestore(app)` tanpa argumen kedua `databaseId` (`database-tps3r`) dan JANGAN pernah mengarah ke `database-siyap` atau bucket default `sigap-586c4.firebasestorage.app`.

## 2. Pola Inisialisasi SDK

### A. Web Client SDK (`src/lib/firebase.ts`)
- Gunakan singleton guard (`getApps().length ? getApp() : initializeApp(firebaseConfig)`).
- Firestore offline-first untuk sinyal lapangan lemah (client-side):
  ```ts
  import {
    initializeFirestore,
    getFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
  } from 'firebase/firestore';

  const DATABASE_ID = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'database-tps3r';
  ```
  - Di browser (`typeof window !== 'undefined'`), gunakan `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }, DATABASE_ID)` dengan `try/catch` fallback ke `getFirestore(app, DATABASE_ID)` (mencegah error saat Hot Module Reload).
  - Di server (SSR/RSC), gunakan `getFirestore(app, DATABASE_ID)` tanpa `persistentLocalCache`.
- Storage khusus TPS 3R:
  ```ts
  const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tps3r-sigap-586c4';
  export const storage = getStorage(app, `gs://${STORAGE_BUCKET}`);
  ```
- Analytics: inisialisasi hanya di browser (`typeof window !== 'undefined'`) dan hanya jika `isSupported()` bernilai `true`.

### B. Firebase Admin SDK (`src/lib/firebaseAdmin.ts`)
- Digunakan untuk script seeding (`src/utils/seedData.ts`), API Route upload foto produk (jika menggunakan signed/server upload ke `gs://tps3r-sigap-586c4`), atau operasi server tepercaya.
- Urutan fallback kredensial:
  1. `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string di env production)
  2. File lokal `FIREBASE_SERVICE_ACCOUNT_PATH` (`./service-account-tps3r.json`)
  3. Application Default Credentials (`applicationDefault()`)
- Inisialisasi terisolasi:
  - `getFirestore(adminApp, process.env.FIREBASE_DATABASE_ID || 'database-tps3r')`
  - `getStorage(adminApp).bucket(process.env.FIREBASE_STORAGE_BUCKET || 'tps3r-sigap-586c4')`

## 3. Skema 8 Koleksi Firestore (`database-tps3r`)

1. `products/{id}` — Katalog produk turunan (`maggot`, `kompos`, `kasgot`, `poc`, `hasil_kebun`), `slug`, `price`, `unit`, `stockQty`, `status`, `images[]`, `isFeatured`, `isActive`, `updatedAt`.
2. `daily_logs/{id}` — Log harian lapangan (privat pengurus): `date` (`YYYY-MM-DD`), `monthKey` (`YYYY-MM`), `organicWasteKg`, `foodWasteKg`, `maggotHarvestKg`, `compostProducedKg`, `kasgotProducedKg`, `pocProducedLiter`, `contributorId?`, `notes?`, `recordedBy`, `createdAt`.
3. `impact_summary/current` — Dokumen agregat tunggal (1 read/visit publik): `totalWasteProcessedKg`, `totalFoodWasteKg`, `totalMaggotHarvestKg`, `totalCompostAndKasgotKg`, `totalPocLiter`, `activeContributorsCount`, `estimatedCo2SavedKg` (`0.5 kg CO2e / kg` sampah organik), `lastUpdatedAt`.
4. `impact_monthly/{YYYY-MM}` — Agregat bulanan untuk `ImpactTrendChart` & `PrintableImpactReport`: `monthKey`, `label`, `wasteKg`, `maggotKg`, `compostKg`, `kasgotKg`.
5. `contributors/{id}` — Mitra penyetor (warga/warung/resto/pasar/instansi): `memberCode`, `name`, `type`, `phoneNormalized` (`628...`), `address`, `totalDepositedKg`, `pointsBalance`, `isActive`, `lastDepositAt?`. **Dilarang menyimpan NIK/email pribadi.**
6. `partnership_requests/{id}` — Form daftar jemput/setor sisa makanan (`status`: `baru` → `dihubungi` → `aktif` | `ditolak`).
7. `edu_bookings/{id}` — Form booking eduwisata/studi banding (`status`: `menunggu` → `dikonfirmasi` → `selesai` | `batal`).
8. `site_settings/profile` — Override dinamis profil TPS 3R (nomor WA aktif, jam operasional, pengumuman banner).
9. `admins/{uid}` — Daftar UID pengurus resmi (dikelola via Admin SDK / Console, client tidak boleh menulis) untuk proteksi keamanan `isAdmin()`.

## 4. Aturan Transaksi Atomik (`src/services/logs.service.ts`)

Saat pengurus menyimpan `createDailyLog(input)`:
1. Hitung `totalWaste = organicWasteKg + foodWasteKg`, `compostAndKasgot = compostProducedKg + kasgotProducedKg`, `co2Saved = totalWaste * 0.5`, dan `earnedPoints = Math.round(totalWaste * 10)` (1 kg = 10 poin, jika ada `contributorId`).
2. Jalankan dalam SATU `runTransaction(db, async (tx) => { ... })`:
   - **Reads dulu** (aturan wajib Firestore transaction!): baca `impact_summary/current`, `impact_monthly/{monthKey}`, dan `contributors/{contributorId}` (jika ada).
   - **Writes setelah semua reads**:
     - Buat dokumen baru di `daily_logs/{autoId}`.
     - Upsert/increment `impact_summary/current`.
     - Upsert/increment `impact_monthly/{monthKey}`.
     - Jika ada `contributorId`, increment `totalDepositedKg` & `pointsBalance` dan perbarui `lastDepositAt`.

## 5. Upload Foto Produk ke `gs://tps3r-sigap-586c4`

- Path wajib: `products/{productId}/{timestamp}-{safeFileName}`.
- Validasi ketat: hanya `image/jpeg`, `image/png`, `image/webp`; maksimal `5 MB`.
- Jika bucket `tps3r-sigap-586c4` belum di-link ke Firebase Storage console untuk direct client SDK rules, sediakan Next.js Route Handler `POST /api/admin/upload` yang memverifikasi Firebase Auth Bearer Token (`verifyIdToken` + cek admin) lalu mengunggah ke bucket `tps3r-sigap-586c4` lewat Firebase Admin SDK dan mengembalikan URL gambar publik/signed.

## 6. Deploy Security Rules & Indexes

```powershell
firebase deploy --only firestore:rules,firestore:indexes --project sigap-586c4
```
> Selalu delegasikan perubahan `firestore.rules` ke subagent `firestore-rules-author`.

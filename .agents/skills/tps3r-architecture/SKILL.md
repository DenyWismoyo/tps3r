---
name: tps3r-architecture
description: >-
  Arsitektur full-stack aplikasi Kelompok Tani & TPS 3R Ekonomi Sirkular
  (Next.js App Router, TypeScript Strict, struktur folder datar 5-lapis komponen,
  pola Thin Page & Thin Slug, Config-Driven Customization, dan roadmap 5 Fase).
  Gunakan skill ini sebelum membuat halaman, komponen baru, folder, atau merencanakan fitur.
---

# Arsitektur Proyek Kelompok Tani & TPS 3R Ekonomi Sirkular

## 1. Struktur Direktori Standar (Datar & Modular)

Jangan membuat route group berlapis seperti `(public)` atau `(marketing)`. Gunakan struktur datar berikut:

```text
src/
├── app/
│   ├── globals.css                 # SSOT: Design tokens, layout, UI, domain & @media print
│   ├── layout.tsx                  # Root layout (Font, Metadata, CartProvider, ToastProvider)
│   ├── page.tsx                    # THIN PAGE: Landing page utama
│   ├── katalog/
│   │   ├── page.tsx                # THIN PAGE: Katalog produk + filter + mini cart
│   │   └── [slug]/page.tsx         # THIN SLUG: Detail produk, stok live, kalkulator & WA
│   ├── kalkulator/page.tsx         # THIN PAGE: Kalkulator pupuk & pakan maggot BSF
│   ├── dampak/page.tsx             # THIN PAGE: Dashboard transparansi + cetak laporan DLH/CSR
│   ├── kemitraan/page.tsx          # THIN PAGE: Form setor sisa makanan & cek poin penyetor
│   ├── eduwisata/page.tsx          # THIN PAGE: Paket studi banding/pelatihan & booking
│   └── admin/
│       ├── layout.tsx              # Proteksi Firebase Auth + AdminShell
│       ├── login/page.tsx          # Login pengurus TPS 3R
│       ├── page.tsx                # THIN PAGE: Dashboard ringkas & Quick Log (< 1 menit)
│       ├── produk/page.tsx         # THIN PAGE: CRUD katalog & update stok 1-klik
│       ├── penyetor/page.tsx       # THIN PAGE: Manajemen mitra penyetor & poin
│       └── permintaan/page.tsx     # THIN PAGE: Inbox jemput sampah & booking eduwisata
├── components/
│   ├── ui/                         # Lapis 1: Atomik murni (0 logika bisnis)
│   ├── layout/                     # Lapis 2: Navbar, Footer, PageBanner, AdminShell
│   ├── shared/                     # Lapis 3: Komponen domain reusable (publik & admin)
│   ├── sections/                   # Lapis 4: Blok rakitan Landing Page
│   └── admin/                      # Lapis 5: Widget operasional pengurus
├── config/                         # site.ts, navigation.ts, packages.ts, calculator.ts
├── lib/                            # firebase.ts (client), firebaseAdmin.ts (server/seed)
├── services/                       # products, impact, logs, contributors, requests
├── hooks/                          # useCart.tsx, useAuth.tsx, useProducts.ts, useImpactSummary.ts
├── types/                          # database.ts
├── utils/                          # format.ts, whatsapp.ts, slugify.ts, seedData.ts
└── validations/                    # schemas.ts (Zod)
```

## 2. Daftar Komponen per Lapis & Aturan Reusability

### Lapis 1 — `src/components/ui/` (Atomik Bebas Domain)
`Button`, `Badge`, `Card` (`Card`, `CardHeader`, `CardBody`, `CardFooter`), `Container`, `SectionHeading`, `InputField`, `Modal`, `Drawer`, `StatCard`, `Tabs`, `EmptyState`, `Skeleton`, `Toast`.

### Lapis 2 — `src/components/layout/`
`Navbar`, `Footer`, `PageBanner`, `AdminShell`.

### Lapis 3 — `src/components/shared/` (Wajib Dipakai Ulang Lintas Halaman)
| Komponen | Dipakai di | Props Kunci |
| :--- | :--- | :--- |
| `ProductCard` | Landing, `/katalog`, produk terkait `[slug]` | `product`, `variant` (`'compact' \| 'full'`), `onAddToCart`, `showQuickWa` |
| `ProductGrid` | `/katalog` | `products`, `initialCategory` |
| `ProductGallery` | `/katalog/[slug]` | `product` |
| `ImpactMetricsGrid` | Hero Landing, `/dampak`, `/admin` | `summary`, `periodLabel`, `layout` (`'row' \| 'grid-2x2'`), `compact` |
| `ImpactTrendChart` | Landing preview, `/dampak`, `PrintableImpactReport`, `/admin` | `monthlyData`, `metric` (`'waste' \| 'compost' \| 'maggot'`), `height` |
| `CircularFlowDiagram` | Landing (`CircularFlowSection`) | — |
| `FertilizerCalculator` | `/kalkulator`, `/katalog/[slug]` | `defaultMode` (`'pupuk' \| 'maggot'`), `preselectedProductSlug` |
| `PointsLookupWidget` | `/kemitraan` | — |
| `WhatsAppButton` | `Navbar`, `ProductCard`, `[slug]`, `MiniCartDrawer`, `Footer`, `RequestStatusList` | `message`, `label`, `variant`, `size`, `phoneOverride` |
| `MiniCartDrawer` | Global via `Navbar` / `CartProvider` | — |
| `PartnershipForm` | `/kemitraan` | — |
| `EduBookingForm` | `/eduwisata` | `preselectedPackageId` |
| `PrintableImpactReport` | `/dampak` | `summary`, `monthlyData`, `selectedMonth` |

### Lapis 4 — `src/components/sections/` (Landing Page)
`HeroSection`, `CircularFlowSection`, `FeaturedProductsSection`, `ImpactPreviewSection`, `PartnershipCtaSection`, `EduwisataPreviewSection`, `ProfileLocationSection`.

### Lapis 5 — `src/components/admin/`
`QuickLogForm`, `RecentLogsTable`, `StockQuickEditor`, `ProductFormModal`, `ContributorManager`, `RequestStatusList`.

## 3. Pola Thin Page & Thin Slug (Wajib 30–70 Baris)

Setiap `page.tsx`:
- Hanya mendefinisikan `metadata` / `generateMetadata`.
- Membaca `params` / `searchParams` (`await params` pada Next.js 15+).
- Memanggil fungsi dari `src/services/` (Server Component) atau mendelegasikan ke komponen `shared/`/`admin/` (Client Component).
- Tidak boleh menulis logika validasi, query Firestore langsung, atau state form kompleks di `page.tsx`.

## 4. Config-Driven Customization (`src/config/`)

- `site.ts`: Nama Kelompok Tani/TPS 3R, tagline, alamat, koordinat/embed peta, jam operasional, nomor WhatsApp resmi, legalitas, nama ketua/penanggung jawab kop laporan.
- `navigation.ts`: Daftar menu publik (`PUBLIC_NAV_ITEMS`) dan menu admin (`ADMIN_NAV_ITEMS`).
- `packages.ts`: Paket eduwisata/studi banding/pelatihan (ID, nama, harga/donasi, durasi, fasilitas, kuota) & poin manfaat kemitraan.
- `calculator.ts`: Konstanta & rumus takaran kompos/kasgot per m²/polybag dan takaran maggot BSF per jenis ternak.

## 5. Roadmap Eksekusi 5 Fase

1. **Fase 1 — Fondasi**: `globals.css` lengkap, `src/config/*`, `src/types/database.ts`, `src/lib/firebase.ts` & `firebaseAdmin.ts`, `src/utils/*`, `src/validations/schemas.ts`. Wajib lulus `npx tsc --noEmit`.
2. **Fase 2 — Data & Atomik**: `src/services/*` (termasuk `runTransaction` atomik), `src/utils/seedData.ts`, `src/components/ui/*`, `src/components/layout/*`, `src/hooks/*`.
3. **Fase 3 — Shared & Publik**: `src/components/shared/*`, `src/components/sections/*`, seluruh halaman publik Thin Page/Slug (`/`, `/katalog`, `/katalog/[slug]`, `/kalkulator`, `/dampak`, `/kemitraan`, `/eduwisata`).
4. **Fase 4 — Panel Pengurus `/admin`**: Login & layout auth guard, `src/components/admin/*`, halaman tipis `/admin`, `/admin/produk`, `/admin/penyetor`, `/admin/permintaan`.
5. **Fase 5 — QA, Print & Deploy**: Audit zero inline style & Thin Page, uji responsif 360px & WCAG AA, uji `@media print` laporan A4, deploy rules (`database-tps3r` & `tps3r-sigap-586c4`) dan verifikasi `npm run build`.

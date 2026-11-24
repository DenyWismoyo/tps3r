---
name: tps3r-global-css-ui
description: >-
  Sistem desain terpusat (Single Source of Truth) di src/app/globals.css untuk
  aplikasi Kelompok Tani & TPS 3R. Gunakan skill ini sebelum membuat atau
  memodifikasi styling, komponen UI, layout responsif, atau tampilan cetak A4.
---

# Sistem UI Terpusat di `src/app/globals.css` (SSOT)

## 1. Aturan Ketat Styling

1. **Single Source of Truth**: Seluruh aturan CSS berada di `src/app/globals.css`. Tidak ada Tailwind CSS, tidak ada CSS Modules yang tercecer, tidak ada CSS-in-JS, dan **ZERO inline `style={{ ... }}`** di file `.tsx`.
2. **Rebranding Instan**: Mengubah variabel di `:root` (`--color-primary`, `--font-display`, `--radius-md`, dll.) harus langsung mengubah seluruh tampilan publik, admin, dan cetak.
3. **Mobile-First & Field-Ready**:
   - Touch-target minimal `46px` (`--touch-target: 46px`) pada seluruh tombol, input, dan tab terutama di `/admin`.
   - Kontras warna memenuhi **WCAG AA** (minimal 4.5:1 teks normal, 3:1 teks besar/ikon) agar jelas di bawah terik matahari lokasi TPS 3R.
   - Uji responsivitas mulai dari lebar layar HP `360px`.
4. **Grafik Ringan SVG Murni**: `ImpactTrendChart` wajib menggunakan SVG murni + kelas `.chart-svg` di `globals.css` (tanpa library charting berat).

## 2. Struktur 6 Blok Wajib di `src/app/globals.css`

Susun `src/app/globals.css` secara rapi dengan komentar pemisah untuk 6 blok berikut:

### Blok 1 — `:root` Design Tokens (Palet Organik Ekonomi Sirkular)
```css
:root {
  --color-primary: #1b4332;        /* Hijau Hutan - Identitas Utama */
  --color-primary-hover: #143326;
  --color-secondary: #2d6a4f;      /* Hijau Daun / Lumut */
  --color-secondary-soft: #d8f3dc; /* Hijau Muda Aksen */
  --color-accent: #d97706;         /* Kuning Panen / Amber */
  --color-soil: #7c4a2d;           /* Cokelat Kompos / Tanah Subur */
  --color-wa: #16a34a;             /* Hijau WhatsApp CTA */
  --color-wa-hover: #15803d;

  --color-bg: #fafbf9;
  --color-surface: #ffffff;
  --color-surface-tint: #f0f7f4;
  --color-border: #d8e2dc;
  --color-text: #1f2937;
  --color-text-muted: #4b5563;
  --color-danger: #dc2626;
  --color-warning: #ca8a04;
  --color-success: #15803d;

  --font-sans: var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-display: var(--font-outfit), 'Outfit', 'Plus Jakarta Sans', sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: clamp(1.25rem, 2vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 3vw, 2.25rem);
  --text-hero: clamp(2rem, 4.5vw, 3.25rem);

  --container-max: 1200px;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1.25rem;
  --space-lg: 2rem;
  --space-xl: 3.5rem;
  --space-2xl: 5rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.25rem;
  --radius-pill: 9999px;
  --shadow-sm: 0 2px 8px rgba(27, 67, 50, 0.06);
  --shadow-md: 0 8px 24px rgba(27, 67, 50, 0.10);
  --touch-target: 46px;
  --z-navbar: 40;
  --z-drawer: 60;
  --z-modal: 70;
  --z-toast: 80;
}
```
> Muat font `Plus Jakarta Sans` dan `Outfit` melalui `next/font/google` di `src/app/layout.tsx` dan pasang variabel CSS `--font-plus-jakarta` & `--font-outfit` pada elemen `<html>`.

### Blok 2 — CSS Reset & Typography
- `box-sizing: border-box`, `scroll-behavior: smooth`, heading `font-family: var(--font-display)`, `line-height` nyaman, serta `:focus-visible` ring kontras tinggi untuk navigasi keyboard.

### Blok 3 — Layout & Grid Primitives
- `.container`, `.section`, `.section--tinted`, `.section--dark`, `.grid-2`, `.grid-3`, `.grid-4`, `.stack`, `.cluster`, `.split-hero`.

### Blok 4 — Atomic UI Classes (`src/components/ui/`)
- `.btn` + modifier `--primary`, `--secondary`, `--accent`, `--outline`, `--ghost`, `--wa`, `--danger`, `--sm`, `--lg`, `--block`.
- `.badge` + modifier `--available`, `--preorder`, `--soldout`, `--organic`, `--info`, `--warning`, `--danger`.
- `.card` (`--elevated`, `--interactive`, `--tinted`), `.card__header`, `.card__body`, `.card__footer`.
- `.form-field`, `.form-label`, `.form-error`, `.input`, `.select`, `.textarea`, `.checkbox-row`.
- `.stat-card`, `.tabs`, `.modal-backdrop`, `.modal`, `.drawer-backdrop`, `.drawer`, `.toast-stack`, `.toast`, `.empty-state`, `.skeleton`.

### Blok 5 — Domain Component Classes
- `.navbar`, `.footer`, `.page-banner`, `.hero`, `.impact-bar`, `.circular-flow`, `.product-card`, `.product-gallery`, `.calculator-box`, `.points-card`, `.chart-svg`, `.cart-item`, `.admin-shell`, `.admin-nav`, `.quick-log-card`, `.preset-group`, `.table-wrap`, `.print-report`.

### Blok 6 — `@media print` (Laporan Resmi DLH / CSR)
- Sembunyikan `.no-print`, `.navbar`, `.footer`, `.drawer`, `.toast`, `.admin-nav`.
- Paksa latar putih `#ffffff`, teks hitam `#000000`, ukuran font `11pt`, ukuran halaman `@page { size: A4; margin: 14mm; }`.
- Gunakan `break-inside: avoid` pada `.card`, `.stat-card`, dan `.print-section` agar hasil cetak 1–2 halaman A4 rapi tanpa terpotong di tengah tabel/kartu.

## 3. Checklist Audit CSS Sebelum Commit

1. Cari penggunaan `style=` di seluruh `src/components/` dan `src/app/` — harus **0 temuan**.
2. Pastikan setiap nama kelas yang dipakai di `.tsx` benar-benar terdaftar di `src/app/globals.css`.
3. Pastikan Modal dan Drawer mendukung tombol `Escape`, `aria-modal="true"`, dan `role="dialog"`.

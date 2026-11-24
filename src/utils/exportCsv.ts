import {
  CASH_CATEGORY_LABELS,
  CONTRIBUTOR_TYPE_LABELS,
  type CashTransaction,
  type Contributor,
  type DailyLog,
  type MonthlyImpact,
} from '@/types/database';

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadCsvFile(filename: string, headers: readonly string[], rows: readonly (readonly (string | number | undefined)[])[]) {
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  // UTF-8 BOM agar Microsoft Excel langsung membaca karakter & pemisah kolom dengan benar
  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDailyLogsCsv(logs: readonly DailyLog[]) {
  const headers = [
    'Tanggal',
    'Bulan',
    'Organik Kebun/RT (kg)',
    'Sisa Makanan (kg)',
    'Anorganik Terpilah (kg)',
    'Residu ke TPA (kg)',
    'Panen Maggot (kg)',
    'Kompos (kg)',
    'Kasgot (kg)',
    'POC (Liter)',
    'Penyetor',
    'Poin',
    'Catatan',
    'Petugas',
  ];

  const rows = logs.map((l) => [
    l.date,
    l.monthKey,
    l.organicWasteKg,
    l.foodWasteKg,
    l.inorganicWasteKg ?? 0,
    l.residueToTpaKg ?? 0,
    l.maggotHarvestKg,
    l.compostProducedKg,
    l.kasgotProducedKg,
    l.pocProducedLiter,
    l.contributorName ?? '',
    l.earnedPoints ?? 0,
    l.notes ?? '',
    l.recordedBy,
  ]);

  downloadCsvFile(`rekap-log-harian-tps3r-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportMonthlyImpactCsv(monthly: readonly MonthlyImpact[]) {
  const headers = [
    'Periode',
    'Label Bulan',
    'Sampah Organik Terolah (kg)',
    'Anorganik Terpilah (kg)',
    'Residu TPA (kg)',
    'Panen Maggot BSF (kg)',
    'Kompos (kg)',
    'Kasgot (kg)',
    'POC (Liter)',
    'Estimasi Reduksi CO2e (kg)',
  ];

  const rows = monthly.map((m) => [
    m.monthKey,
    m.label,
    m.wasteKg,
    m.inorganicKg ?? 0,
    m.residueKg ?? 0,
    m.maggotKg,
    m.compostKg,
    m.kasgotKg,
    m.pocLiter ?? 0,
    m.co2SavedKg ?? Math.round(m.wasteKg * 0.5),
  ]);

  downloadCsvFile(`laporan-bulanan-dlh-tps3r-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportContributorsCsv(contributors: readonly Contributor[]) {
  const headers = [
    'Kode Member',
    'Nama Mitra',
    'Kategori',
    'No HP',
    'Alamat',
    'Jadwal Jemput',
    'Total Setor (kg)',
    'Saldo Poin',
    'Status',
  ];

  const rows = contributors.map((c) => [
    c.memberCode,
    c.name,
    CONTRIBUTOR_TYPE_LABELS[c.type],
    c.phoneNormalized,
    c.address,
    (c.pickupDays ?? []).join('; '),
    c.totalDepositedKg,
    c.pointsBalance,
    c.isActive ? 'Aktif' : 'Non-aktif',
  ]);

  downloadCsvFile(`daftar-penyetor-tps3r-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportCashTransactionsCsv(transactions: readonly CashTransaction[]) {
  const headers = [
    'Tanggal',
    'Bulan',
    'Jenis',
    'Kategori',
    'Nominal (Rp)',
    'Keterangan',
    'Produk Terkait',
    'Qty Terjual',
    'Pencatat',
  ];

  const rows = transactions.map((t) => [
    t.date,
    t.monthKey,
    t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
    CASH_CATEGORY_LABELS[t.category] ?? t.category,
    t.amount,
    t.description,
    t.productName ?? '',
    t.qtySold ?? 0,
    t.recordedBy,
  ]);

  downloadCsvFile(`buku-kas-tps3r-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

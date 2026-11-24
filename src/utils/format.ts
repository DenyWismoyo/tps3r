const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

const MONTH_LONG_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatNumber(value: number, maxFractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxFractionDigits,
  }).format(safe);
}

export function formatWeightKg(kg: number): { value: string; unit: 'kg' | 'ton' } {
  const safe = Number.isFinite(kg) ? kg : 0;
  if (safe >= 1000) {
    return {
      value: formatNumber(safe / 1000, 2),
      unit: 'ton',
    };
  }
  return {
    value: formatNumber(safe, 1),
    unit: 'kg',
  };
}

export function formatDateId(dateInput: string | Date): string {
  const parsed = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(parsed.getTime())) {
    return typeof dateInput === 'string' ? dateInput : '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function formatMonthLabel(monthKey: string, longFormat = false): string {
  const parts = monthKey.split('-');
  const year = parts[0];
  const monthStr = parts[1];
  const monthIdx = Number(monthStr) - 1;
  const list = longFormat ? MONTH_LONG_ID : MONTH_SHORT_ID;

  if (!year || !Number.isInteger(monthIdx) || monthIdx < 0 || monthIdx > 11) {
    return monthKey;
  }

  return `${list[monthIdx]} ${year}`;
}

export function getTodayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/**
 * Menormalisasi nomor telepon Indonesia menjadi digit murni berawalan 62 (contoh: 6281234567890).
 */
export function normalizePhoneIndonesia(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

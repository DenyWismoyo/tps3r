/**
 * Mengubah teks menjadi slug lowercase kebab-case sesuai regex firestore.rules:
 * ^[a-z0-9]+(?:-[a-z0-9]+)*$
 */
export function slugify(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized.slice(0, 120) || 'produk';
}

/**
 * Membersihkan nama file agar aman disimpan pada Cloud Storage path.
 */
export function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim().toLowerCase();
  const lastDot = trimmed.lastIndexOf('.');
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const ext = lastDot > 0 ? trimmed.slice(lastDot).replace(/[^.a-z0-9]/g, '') : '';

  const safeBase = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${safeBase || 'upload'}${ext}`;
}

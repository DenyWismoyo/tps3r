import { SITE_CONFIG } from '@/config/site';
import type { CartItem, EduBooking, PartnershipRequest, Product } from '@/types/database';
import { formatDateId, formatRupiah, normalizePhoneIndonesia } from './format';

export function buildWhatsAppUrl(message: string, phoneOverride?: string): string {
  const targetPhone = normalizePhoneIndonesia(phoneOverride || SITE_CONFIG.whatsappNumber);
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${targetPhone}?text=${encoded}`;
}

export function buildProductWhatsAppMessage(product: Product, qty = 1): string {
  const subtotal = product.price * qty;
  return [
    `Halo ${SITE_CONFIG.shortName}, saya ingin memesan produk:`,
    '',
    `• Produk: ${product.name}`,
    `• Jumlah: ${qty} ${product.unit}`,
    `• Estimasi Harga: ${formatRupiah(subtotal)}`,
    '',
    'Mohon info ketersediaan stok dan cara pengambilan/pengiriman. Terima kasih.',
  ].join('\n');
}

export function buildCartWhatsAppMessage(
  items: readonly CartItem[],
  buyerName?: string,
  deliveryMethod: 'ambil' | 'antar' = 'ambil',
  notes?: string
): string {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemLines = items.map(
    (item, idx) =>
      `${idx + 1}. ${item.name} × ${item.qty} ${item.unit} = ${formatRupiah(item.price * item.qty)}`
  );

  const methodLabel =
    deliveryMethod === 'ambil' ? 'Ambil langsung di TPS 3R' : 'Minta dikirim (cek ongkir)';

  return [
    `Halo ${SITE_CONFIG.shortName}, saya ingin melakukan pemesanan produk:`,
    '',
    ...itemLines,
    '',
    `Total Estimasi: ${formatRupiah(total)}`,
    `Nama Pemesan: ${buyerName?.trim() || '-'}`,
    `Metode: ${methodLabel}`,
    notes?.trim() ? `Catatan: ${notes.trim()}` : '',
    '',
    'Mohon konfirmasi ketersediaan stoknya ya. Terima kasih.',
  ]
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n');
}

export function buildCalculatorWhatsAppMessage(summaryLines: readonly string[]): string {
  return [
    `Halo ${SITE_CONFIG.shortName}, saya baru menggunakan Kalkulator Takaran dan ingin konsultasi/pesan:`,
    '',
    ...summaryLines.map((line) => `• ${line}`),
    '',
    'Mohon rekomendasi paket stok yang tersedia saat ini. Terima kasih.',
  ].join('\n');
}

export function buildPointsRedeemWhatsAppMessage(
  memberCode: string,
  name: string,
  pointsBalance: number
): string {
  return [
    `Halo ${SITE_CONFIG.shortName}, saya ingin menukar poin tabungan sampah organik:`,
    '',
    `• Kode Member: ${memberCode}`,
    `• Nama: ${name}`,
    `• Saldo Poin Saat Ini: ${pointsBalance} poin`,
    '',
    'Mohon info pilihan pupuk/kasgot/sayuran yang bisa ditukar hari ini. Terima kasih.',
  ].join('\n');
}

export function buildPartnershipReplyMessage(request: PartnershipRequest): string {
  return [
    `Halo ${request.contactName || request.partnerName}, salam hangat dari ${SITE_CONFIG.organizationName}.`,
    '',
    `Kami telah menerima pendaftaran kemitraan setor sisa makanan untuk *${request.partnerName}* (estimasi ${request.estimatedKgPerWeek} kg/minggu, jadwal: ${request.preferredPickupSchedule}).`,
    '',
    'Apakah kami bisa mengonfirmasi titik penjemputan dan jadwal mulai minggu ini?',
  ].join('\n');
}

export function buildEduBookingReplyMessage(booking: EduBooking): string {
  return [
    `Halo Bapak/Ibu ${booking.contactName} dari *${booking.organizationName}*, salam hangat dari ${SITE_CONFIG.organizationName}.`,
    '',
    `Kami telah menerima pengajuan kunjungan Eduwisata/Studi Banding untuk tanggal *${formatDateId(booking.visitDate)}* (${booking.participantCount} peserta).`,
    '',
    'Mohon konfirmasi jam kedatangan dan kebutuhan khusus rombongan agar kami siapkan fasilitas terbaik.',
  ].join('\n');
}

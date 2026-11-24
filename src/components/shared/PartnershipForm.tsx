'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import {
  PARTNERSHIP_TYPE_LABELS,
  type PartnershipPartnerType,
} from '@/types/database';
import { partnershipRequestSchema } from '@/validations/schemas';
import { submitPartnershipRequest } from '@/services/requests.service';
import { Card, CardBody } from '@/components/ui/Card';
import { InputField, SelectField, TextareaField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from './WhatsAppButton';

const PARTNER_TYPE_OPTIONS = (
  Object.entries(PARTNERSHIP_TYPE_LABELS) as [PartnershipPartnerType, string][]
).map(([value, label]) => ({ value, label }));

export function PartnershipForm() {
  const { showToast } = useToast();
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState<PartnershipPartnerType>('warung');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [estimatedKgPerWeek, setEstimatedKgPerWeek] = useState('15');
  const [preferredPickupSchedule, setPreferredPickupSchedule] = useState(
    'Setiap Senin & Kamis pagi'
  );
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    const parsed = partnershipRequestSchema.safeParse({
      partnerName,
      partnerType,
      contactName: contactName || undefined,
      phone,
      address,
      estimatedKgPerWeek,
      preferredPickupSchedule,
      notes: notes || undefined,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await submitPartnershipRequest(parsed.data);
      setSubmittedInfo(
        `Halo TPS 3R, saya baru saja mendaftar mitra setor sisa makanan atas nama *${parsed.data.partnerName}* (${parsed.data.estimatedKgPerWeek} kg/minggu, jadwal ${parsed.data.preferredPickupSchedule}). Mohon konfirmasinya.`
      );
      showToast('Pendaftaran kemitraan berhasil dikirim!', 'success');
      setPartnerName('');
      setContactName('');
      setPhone('');
      setAddress('');
      setNotes('');
    } catch {
      showToast('Gagal mengirim formulir. Periksa koneksi internet Anda.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevated>
      <CardBody>
        {submittedInfo ? (
          <div className="stack">
            <div className="cluster">
              <CheckCircle2 size={28} className="text-success" />
              <h3>Pendaftaran Kemitraan Diterima!</h3>
            </div>
            <p className="text-sm text-muted">
              Data Anda sudah tersimpan di Inbox Pengurus TPS 3R. Anda dapat langsung
              mempercepat konfirmasi jadwal penjemputan melalui WhatsApp di bawah ini.
            </p>
            <div className="grid-2">
              <WhatsAppButton message={submittedInfo} label="Konfirmasi via WhatsApp" block />
              <Button variant="outline" block onClick={() => setSubmittedInfo(null)}>
                Daftar Mitra Lainnya
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div className="stack stack--xs">
              <h3>Formulir Daftar Mitra Setor / Jemput Sisa Makanan</h3>
              <p className="text-sm text-muted">
                Terbuka untuk warung makan, restoran, katering, pasar, kantin, maupun warga RT/RW.
              </p>
            </div>

            <div className="grid-2">
              <InputField
                id="partner-name"
                label="Nama Usaha / Warga / RT"
                required
                placeholder="Contoh: Warung Soto Mbak Yani"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                error={errors.partnerName}
              />
              <SelectField
                id="partner-type"
                label="Kategori Mitra"
                required
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as PartnershipPartnerType)}
                options={PARTNER_TYPE_OPTIONS}
                error={errors.partnerType}
              />
            </div>

            <div className="grid-2">
              <InputField
                id="partner-contact"
                label="Nama Penanggung Jawab (Opsional)"
                placeholder="Contoh: Ibu Yani"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                error={errors.contactName}
              />
              <InputField
                id="partner-phone"
                label="Nomor WhatsApp Aktif"
                required
                type="tel"
                inputMode="tel"
                placeholder="0812xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
            </div>

            <TextareaField
              id="partner-address"
              label="Alamat Lengkap Titik Penjemputan"
              required
              placeholder="Nama jalan, nomor, RT/RW, patokan lokasi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={errors.address}
            />

            <div className="grid-2">
              <InputField
                id="partner-kg"
                label="Estimasi Sisa Makanan (kg / minggu)"
                required
                type="number"
                inputMode="decimal"
                min={0}
                value={estimatedKgPerWeek}
                onChange={(e) => setEstimatedKgPerWeek(e.target.value)}
                error={errors.estimatedKgPerWeek}
              />
              <InputField
                id="partner-schedule"
                label="Jadwal Penjemputan Diinginkan"
                required
                placeholder="Contoh: Setiap hari jam 16.00 / 2x seminggu"
                value={preferredPickupSchedule}
                onChange={(e) => setPreferredPickupSchedule(e.target.value)}
                error={errors.preferredPickupSchedule}
              />
            </div>

            <InputField
              id="partner-notes"
              label="Jenis Sisa Organik / Catatan (Opsional)"
              placeholder="Contoh: Sisa nasi, potongan sayur, kulit buah (sudah terpilah tanpa plastik)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={errors.notes}
            />

            <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
              <Send size={17} />
              <span>{submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Mitra'}</span>
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { EDUWISATA_PACKAGES } from '@/config/packages';
import { eduBookingSchema } from '@/validations/schemas';
import { submitEduBooking } from '@/services/requests.service';
import { getTodayDateKey } from '@/utils/format';
import { Card, CardBody } from '@/components/ui/Card';
import { InputField, SelectField, TextareaField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from './WhatsAppButton';

export interface EduBookingFormProps {
  preselectedPackageId?: string;
}

export function EduBookingForm({ preselectedPackageId }: EduBookingFormProps) {
  const { showToast } = useToast();
  const defaultPkg = preselectedPackageId || EDUWISATA_PACKAGES[0]?.id || 'edukasi-sekolah';

  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [packageId, setPackageId] = useState(defaultPkg);
  const [visitDate, setVisitDate] = useState(getTodayDateKey());
  const [participantCount, setParticipantCount] = useState('25');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [waConfirmMsg, setWaConfirmMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});

    const parsed = eduBookingSchema.safeParse({
      organizationName,
      contactName,
      phone,
      packageId,
      visitDate,
      participantCount,
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

    const pkgName =
      EDUWISATA_PACKAGES.find((p) => p.id === parsed.data.packageId)?.name ??
      parsed.data.packageId;

    setSubmitting(true);
    try {
      await submitEduBooking(parsed.data, pkgName);
      setWaConfirmMsg(
        `Halo TPS 3R, saya *${parsed.data.contactName}* dari *${parsed.data.organizationName}* baru mengajukan booking *${pkgName}* pada tanggal ${parsed.data.visitDate} untuk ${parsed.data.participantCount} peserta. Mohon konfirmasi ketersediaan jadwal.`
      );
      showToast('Booking jadwal kunjungan berhasil dikirim!', 'success');
      setOrganizationName('');
      setContactName('');
      setPhone('');
      setNotes('');
    } catch {
      showToast('Gagal mengirim booking. Periksa koneksi internet Anda.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card elevated>
      <CardBody>
        {waConfirmMsg ? (
          <div className="stack">
            <div className="cluster">
              <CheckCircle2 size={28} className="text-success" />
              <h3>Pengajuan Jadwal Kunjungan Diterima!</h3>
            </div>
            <p className="text-sm text-muted">
              Pengurus kami akan segera menghubungi Anda. Klik tombol WhatsApp di bawah untuk
              konfirmasi cepat & koordinasi surat kunjungan resmi.
            </p>
            <div className="grid-2">
              <WhatsAppButton message={waConfirmMsg} label="Konfirmasi Jadwal via WA" block />
              <Button variant="outline" block onClick={() => setWaConfirmMsg(null)}>
                Buat Booking Lainnya
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div className="stack stack--xs">
              <h3>Formulir Booking Kunjungan & Pelatihan</h3>
              <p className="text-sm text-muted">
                Pilih paket dan tanggal kunjungan, lalu tim edukasi TPS 3R akan menyiapkan
                pemandu serta fasilitas praktik lapangan.
              </p>
            </div>

            <div className="grid-2">
              <InputField
                id="edu-org"
                label="Nama Instansi / Sekolah / Komunitas"
                required
                placeholder="Contoh: SDN 1 Makmur Jaya / DLH Kabupaten"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                error={errors.organizationName}
              />
              <InputField
                id="edu-contact"
                label="Nama Penanggung Jawab"
                required
                placeholder="Contoh: Bapak Hendra"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                error={errors.contactName}
              />
            </div>

            <div className="grid-2">
              <InputField
                id="edu-phone"
                label="Nomor WhatsApp"
                required
                type="tel"
                inputMode="tel"
                placeholder="0812xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
              <SelectField
                id="edu-package"
                label="Pilihan Paket"
                required
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                options={EDUWISATA_PACKAGES.map((pkg) => ({
                  value: pkg.id,
                  label: `${pkg.name} (${pkg.priceLabel})`,
                }))}
                error={errors.packageId}
              />
            </div>

            <div className="grid-2">
              <InputField
                id="edu-date"
                label="Rencana Tanggal Kunjungan"
                required
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                error={errors.visitDate}
              />
              <InputField
                id="edu-count"
                label="Estimasi Jumlah Peserta"
                required
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
                error={errors.participantCount}
              />
            </div>

            <TextareaField
              id="edu-notes"
              label="Kebutuhan Khusus / Fokus Materi (Opsional)"
              placeholder="Contoh: Membutuhkan sertifikat, fokus tata kelola KSM, atau request konsumsi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={errors.notes}
            />

            <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
              <CalendarCheck size={18} />
              <span>{submitting ? 'Mengirim Pengajuan...' : 'Ajukan Jadwal Kunjungan'}</span>
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

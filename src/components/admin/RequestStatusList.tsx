'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Handshake, Inbox } from 'lucide-react';
import {
  EDU_BOOKING_STATUS_LABELS,
  PARTNERSHIP_STATUS_LABELS,
  PARTNERSHIP_TYPE_LABELS,
  type EduBooking,
  type EduBookingStatus,
  type PartnershipRequest,
  type PartnershipStatus,
} from '@/types/database';
import {
  getEduBookingsAdmin,
  getPartnershipRequestsAdmin,
  updateEduBookingStatus,
  updatePartnershipStatus,
} from '@/services/requests.service';
import { formatDateId } from '@/utils/format';
import {
  buildEduBookingReplyMessage,
  buildPartnershipReplyMessage,
} from '@/utils/whatsapp';
import { useAuth } from '@/hooks/useAuth';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';

const PARTNERSHIP_STATUSES: readonly PartnershipStatus[] = [
  'baru',
  'dihubungi',
  'aktif',
  'ditolak',
];

const EDU_STATUSES: readonly EduBookingStatus[] = [
  'menunggu',
  'dikonfirmasi',
  'selesai',
  'batal',
];

function getStatusTone(status: string): BadgeTone {
  if (status === 'aktif' || status === 'dikonfirmasi' || status === 'selesai') {
    return 'available';
  }
  if (status === 'dihubungi' || status === 'menunggu' || status === 'baru') {
    return 'preorder';
  }
  return 'soldout';
}

export function RequestStatusList() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'kemitraan' | 'eduwisata'>('kemitraan');
  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>([]);
  const [bookings, setBookings] = useState<EduBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pList, bList] = await Promise.all([
        getPartnershipRequestsAdmin(),
        getEduBookingsAdmin(),
      ]);
      setPartnerships(pList);
      setBookings(bList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handlePartnerStatus = async (id: string, nextStatus: PartnershipStatus) => {
    setBusyId(id);
    try {
      await updatePartnershipStatus(id, nextStatus, user?.email || user?.uid || 'admin');
      showToast(`Status mitra diubah menjadi "${PARTNERSHIP_STATUS_LABELS[nextStatus]}".`, 'success');
      await loadAll();
    } catch {
      showToast('Gagal memperbarui status kemitraan.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleBookingStatus = async (id: string, nextStatus: EduBookingStatus) => {
    setBusyId(id);
    try {
      await updateEduBookingStatus(id, nextStatus, user?.email || user?.uid || 'admin');
      showToast(`Status booking diubah menjadi "${EDU_BOOKING_STATUS_LABELS[nextStatus]}".`, 'success');
      await loadAll();
    } catch {
      showToast('Gagal memperbarui status booking.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <div>
        <h2>Inbox Permintaan Kemitraan &amp; Eduwisata</h2>
        <p className="text-sm text-muted">
          Tindak lanjuti pendaftaran jemput sisa makanan dan jadwal kunjungan studi banding dalam
          1 klik WhatsApp.
        </p>
      </div>

      <Tabs
        ariaLabel="Pilih jenis inbox"
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'kemitraan',
            label: 'Setor Sisa Makanan',
            icon: <Handshake size={16} />,
            count: partnerships.length,
          },
          {
            key: 'eduwisata',
            label: 'Booking Eduwisata',
            icon: <CalendarDays size={16} />,
            count: bookings.length,
          },
        ]}
      />

      {loading ? (
        <Skeleton variant="card" />
      ) : tab === 'kemitraan' ? (
        partnerships.length === 0 ? (
          <EmptyState
            icon={<Inbox size={26} />}
            title="Belum ada permintaan kemitraan"
            description="Pendaftaran dari halaman /kemitraan akan muncul otomatis di sini."
          />
        ) : (
          <div className="stack stack--sm">
            {partnerships.map((req) => (
              <Card key={req.id}>
                <CardBody className="stack stack--sm">
                  <div className="cluster cluster--between">
                    <div className="cluster">
                      <Badge tone={getStatusTone(req.status)}>
                        {PARTNERSHIP_STATUS_LABELS[req.status]}
                      </Badge>
                      <Badge tone="info">{PARTNERSHIP_TYPE_LABELS[req.partnerType]}</Badge>
                    </div>
                    <span className="text-xs text-muted">{formatDateId(req.createdAt)}</span>
                  </div>

                  <div>
                    <strong>{req.partnerName}</strong>{' '}
                    {req.contactName ? <span className="text-sm">({req.contactName})</span> : null}
                    <p className="text-sm text-muted">
                      {req.address} • Estimasi {req.estimatedKgPerWeek} kg/minggu • Jadwal:{' '}
                      {req.preferredPickupSchedule}
                    </p>
                    {req.notes ? <p className="text-xs text-muted">Catatan: {req.notes}</p> : null}
                  </div>

                  <div className="request-actions-bar">
                    <div className="request-status-grid">
                      {PARTNERSHIP_STATUSES.map((st) => (
                        <Button
                          key={st}
                          variant={req.status === st ? 'primary' : 'outline'}
                          size="sm"
                          disabled={busyId === req.id}
                          onClick={() => void handlePartnerStatus(req.id, st)}
                        >
                          {PARTNERSHIP_STATUS_LABELS[st]}
                        </Button>
                      ))}
                    </div>
                    <WhatsAppButton
                      message={buildPartnershipReplyMessage(req)}
                      phoneOverride={req.phoneNormalized || req.phone}
                      label="Balas WA"
                      size="sm"
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title="Belum ada booking kunjungan"
          description="Pengajuan dari halaman /eduwisata akan muncul otomatis di sini."
        />
      ) : (
        <div className="stack stack--sm">
          {bookings.map((bk) => (
            <Card key={bk.id}>
              <CardBody className="stack stack--sm">
                <div className="cluster cluster--between">
                  <div className="cluster">
                    <Badge tone={getStatusTone(bk.status)}>
                      {EDU_BOOKING_STATUS_LABELS[bk.status]}
                    </Badge>
                    <Badge tone="organic">{bk.packageName || bk.packageId}</Badge>
                  </div>
                  <span className="text-xs text-muted">
                    Kunjungan: <strong>{formatDateId(bk.visitDate)}</strong>
                  </span>
                </div>

                <div>
                  <strong>{bk.organizationName}</strong> — PJ: {bk.contactName} (
                  {bk.participantCount} peserta)
                  {bk.notes ? <p className="text-xs text-muted">Catatan: {bk.notes}</p> : null}
                </div>

                <div className="request-actions-bar">
                  <div className="request-status-grid">
                    {EDU_STATUSES.map((st) => (
                      <Button
                        key={st}
                        variant={bk.status === st ? 'primary' : 'outline'}
                        size="sm"
                        disabled={busyId === bk.id}
                        onClick={() => void handleBookingStatus(bk.id, st)}
                      >
                        {EDU_BOOKING_STATUS_LABELS[st]}
                      </Button>
                    ))}
                  </div>
                  <WhatsAppButton
                    message={buildEduBookingReplyMessage(bk)}
                    phoneOverride={bk.phoneNormalized || bk.phone}
                    label="Balas WA"
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

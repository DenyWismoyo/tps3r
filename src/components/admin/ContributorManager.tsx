'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Award, CheckCircle2, Download, Plus, Truck, Users } from 'lucide-react';
import {
  CONTRIBUTOR_TYPE_LABELS,
  PICKUP_DAYS_LIST,
  type Contributor,
  type ContributorType,
} from '@/types/database';
import {
  contributorInputSchema,
  pointsRedeemSchema,
} from '@/validations/schemas';
import {
  createContributor,
  getAllContributorsAdmin,
  redeemContributorPoints,
} from '@/services/contributors.service';
import { createDailyLog, type CreateDailyLogResult } from '@/services/logs.service';
import { formatNumber, getTodayDateKey } from '@/utils/format';
import { exportContributorsCsv } from '@/utils/exportCsv';
import { buildDepositReceiptWhatsAppMessage } from '@/utils/whatsapp';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';

const TYPE_OPTIONS = (
  Object.entries(CONTRIBUTOR_TYPE_LABELS) as [ContributorType, string][]
).map(([value, label]) => ({ value, label }));

function getTodayDayNameId(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const name = days[new Date().getDay()] ?? 'Senin';
  return name === 'Minggu' ? 'Senin' : name;
}

export function ContributorManager() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'mitra' | 'rute'>('mitra');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDayNameId());
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [memberCode, setMemberCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ContributorType>('warung');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pickupDays, setPickupDays] = useState<string[]>(['Senin', 'Kamis']);

  const [redeemTarget, setRedeemTarget] = useState<Contributor | null>(null);
  const [redeemPoints, setRedeemPoints] = useState('100');
  const [rewardNote, setRewardNote] = useState('Tukar 1 karung Kasgot / Paket Sayur');

  const [pickupTarget, setPickupTarget] = useState<Contributor | null>(null);
  const [pickupKg, setPickupKg] = useState('15');
  const [pickupReceipt, setPickupReceipt] = useState<CreateDailyLogResult | null>(null);
  const [pickedTodayIds, setPickedTodayIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllContributorsAdmin();
      setContributors(list);
      setMemberCode(`ADK-${String(list.length + 1).padStart(3, '0')}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const togglePickupDay = (day: string) => {
    setPickupDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddContributor = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = contributorInputSchema.safeParse({
      memberCode,
      name,
      type,
      phone,
      address,
      pickupDays,
      isActive: true,
    });

    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? 'Periksa data penyetor.', 'error');
      return;
    }

    setBusy(true);
    try {
      await createContributor(parsed.data);
      showToast(`Mitra ${parsed.data.name} berhasil didaftarkan.`, 'success');
      setAddOpen(false);
      setName('');
      setPhone('');
      setAddress('');
      await loadData();
    } catch {
      showToast('Gagal menyimpan mitra penyetor.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRedeem = async (event: FormEvent) => {
    event.preventDefault();
    if (!redeemTarget) return;

    const parsed = pointsRedeemSchema.safeParse({
      contributorId: redeemTarget.id,
      pointsToRedeem: redeemPoints,
      rewardNote,
    });

    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? 'Periksa jumlah poin.', 'error');
      return;
    }

    setBusy(true);
    try {
      const remaining = await redeemContributorPoints(
        parsed.data.contributorId,
        parsed.data.pointsToRedeem,
        parsed.data.rewardNote
      );
      showToast(`Penukaran berhasil! Sisa saldo: ${remaining} poin.`, 'success');
      setRedeemTarget(null);
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menukar poin.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickPickupDeposit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pickupTarget) return;
    const kg = Number(pickupKg) || 0;
    if (kg <= 0) {
      showToast('Masukkan berat setoran (> 0 kg).', 'error');
      return;
    }

    setBusy(true);
    try {
      const result = await createDailyLog(
        {
          date: getTodayDateKey(),
          organicWasteKg: pickupTarget.type === 'warga' ? kg : 0,
          foodWasteKg: pickupTarget.type === 'warga' ? 0 : kg,
          inorganicWasteKg: 0,
          residueToTpaKg: 0,
          maggotHarvestKg: 0,
          compostProducedKg: 0,
          kasgotProducedKg: 0,
          pocProducedLiter: 0,
          contributorId: pickupTarget.id,
          notes: `Jemput rute ${selectedDay} — ${pickupTarget.name}`,
        },
        user?.email || user?.uid || 'petugas-jemput'
      );
      setPickedTodayIds((prev) => [...prev, pickupTarget.id]);
      setPickupReceipt(result);
      setPickupTarget(null);
      showToast(`Jemput ${pickupTarget.name} (${kg} kg) dicatat!`, 'success');
      await loadData();
    } catch {
      showToast('Gagal mencatat hasil jemput.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const filtered = contributors.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.memberCode.toLowerCase().includes(q) ||
      c.phoneNormalized.includes(q)
    );
  });

  const routeContributors = contributors.filter(
    (c) => c.isActive && (c.pickupDays?.includes(selectedDay) ?? false)
  );

  return (
    <div className="stack">
      <div className="cluster cluster--between">
        <div>
          <h2>Mitra Penyetor, Poin &amp; Rute Jemput</h2>
          <p className="text-sm text-muted">
            Kelola penyetor, tukar poin, dan checklist rute jemput harian motor roda 3.
          </p>
        </div>
        <div className="cluster">
          <Button
            variant="outline"
            size="sm"
            disabled={contributors.length === 0}
            onClick={() => exportContributorsCsv(contributors)}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            <span>Tambah Mitra</span>
          </Button>
        </div>
      </div>

      <Tabs
        ariaLabel="Pilih tampilan penyetor"
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'mitra', label: 'Daftar Mitra & Poin', icon: <Users size={16} />, count: contributors.length },
          { key: 'rute', label: `Checklist Rute (${selectedDay})`, icon: <Truck size={16} />, count: routeContributors.length },
        ]}
      />

      {pickupReceipt && pickupReceipt.contributorName && pickupReceipt.contributorPhone ? (
        <div className="receipt-banner" role="status">
          <div className="cluster cluster--between">
            <div>
              <strong className="text-sm text-primary">
                Jemput {pickupReceipt.contributorName} tercatat (+{pickupReceipt.earnedPoints} poin)
              </strong>
              <p className="text-xs text-muted">
                Saldo poin baru: <strong>{formatNumber(pickupReceipt.newPointsBalance ?? 0, 0)} poin</strong>
              </p>
            </div>
            <div className="cluster">
              <WhatsAppButton
                message={buildDepositReceiptWhatsAppMessage({
                  contributorName: pickupReceipt.contributorName,
                  memberCode: pickupReceipt.contributorMemberCode ?? '-',
                  date: pickupReceipt.date,
                  wasteKg: pickupReceipt.totalWasteKg,
                  earnedPoints: pickupReceipt.earnedPoints,
                  newPointsBalance: pickupReceipt.newPointsBalance ?? 0,
                })}
                phoneOverride={pickupReceipt.contributorPhone}
                label="Kirim Struk WA"
                size="sm"
              />
              <Button variant="ghost" size="sm" onClick={() => setPickupReceipt(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'rute' ? (
        <div className="stack">
          <div className="day-pill-grid" role="group" aria-label="Pilih hari rute jemput">
            {PICKUP_DAYS_LIST.map((day) => (
              <button
                key={day}
                type="button"
                className={['chip', selectedDay === day ? 'chip--active' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          {routeContributors.length === 0 ? (
            <EmptyState
              icon={<Truck size={26} />}
              title={`Belum ada rute jemput hari ${selectedDay}`}
              description="Atur hari jemput saat menambah mitra baru agar muncul di checklist petugas lapangan."
            />
          ) : (
            <div className="stack stack--sm">
              {routeContributors.map((item) => {
                const doneToday = pickedTodayIds.includes(item.id);
                return (
                  <div key={item.id} className="route-card">
                    <div className="cluster cluster--between">
                      <div>
                        <div className="cluster">
                          <Badge tone="organic">{item.memberCode}</Badge>
                          <Badge tone={doneToday ? 'available' : 'preorder'}>
                            {doneToday ? 'Sudah Dijemput' : 'Jadwal Hari Ini'}
                          </Badge>
                        </div>
                        <strong>{item.name}</strong>
                        <p className="text-xs text-muted">{item.address}</p>
                      </div>
                      <Button
                        variant={doneToday ? 'outline' : 'primary'}
                        onClick={() => {
                          setPickupTarget(item);
                          setPickupKg('15');
                        }}
                      >
                        <CheckCircle2 size={17} />
                        <span>{doneToday ? 'Catat Tambahan' : 'Sudah Dijemput + Kg'}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <InputField
            id="contrib-search"
            label="Cari Mitra Penyetor"
            placeholder="Ketik nama, kode ADK-001, atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <Skeleton variant="card" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={26} />}
              title="Belum ada mitra penyetor"
              description="Daftarkan warga, warung, atau restoran mitra untuk mulai mencatat tabungan poin."
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Mitra &amp; Rute</th>
                    <th>Kategori</th>
                    <th>Total Setor</th>
                    <th>Saldo Poin</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold">{item.memberCode}</td>
                      <td>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-muted">
                          {item.phoneNormalized}
                          {item.pickupDays && item.pickupDays.length > 0
                            ? ` • Jemput: ${item.pickupDays.join(', ')}`
                            : ''}
                        </div>
                      </td>
                      <td>
                        <Badge tone="info">{CONTRIBUTOR_TYPE_LABELS[item.type]}</Badge>
                      </td>
                      <td>{formatNumber(item.totalDepositedKg, 1)} kg</td>
                      <td className="font-bold text-primary">
                        {formatNumber(item.pointsBalance, 0)} poin
                      </td>
                      <td>
                        <Button
                          variant="accent"
                          size="sm"
                          disabled={item.pointsBalance <= 0}
                          onClick={() => {
                            setRedeemTarget(item);
                            setRedeemPoints(String(Math.min(100, item.pointsBalance)));
                          }}
                        >
                          <Award size={15} />
                          <span>Tukar Poin</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal
        open={addOpen}
        title="Daftar Mitra Penyetor Baru"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="add-contrib-form" variant="primary" disabled={busy}>
              {busy ? 'Menyimpan...' : 'Simpan Mitra'}
            </Button>
          </>
        }
      >
        <form id="add-contrib-form" onSubmit={handleAddContributor} className="stack stack--sm">
          <div className="grid-2">
            <InputField
              id="add-code"
              label="Kode Member"
              required
              value={memberCode}
              onChange={(e) => setMemberCode(e.target.value)}
            />
            <SelectField
              id="add-type"
              label="Kategori"
              required
              value={type}
              onChange={(e) => setType(e.target.value as ContributorType)}
              options={TYPE_OPTIONS}
            />
          </div>
          <InputField
            id="add-name"
            label="Nama Warga / Warung / Instansi"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            id="add-phone"
            label="Nomor HP / WhatsApp"
            type="tel"
            inputMode="tel"
            required
            placeholder="0812xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <InputField
            id="add-address"
            label="Alamat Singkat"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="form-field">
            <span className="form-label">Jadwal Hari Jemput Rute (Opsional)</span>
            <div className="day-pill-grid">
              {PICKUP_DAYS_LIST.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={['chip', pickupDays.includes(day) ? 'chip--active' : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => togglePickupDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(redeemTarget)}
        title={`Tukar Poin — ${redeemTarget?.name ?? ''}`}
        onClose={() => setRedeemTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRedeemTarget(null)}>
              Batal
            </Button>
            <Button type="submit" form="redeem-form" variant="accent" disabled={busy}>
              {busy ? 'Memproses...' : 'Konfirmasi Tukar Poin'}
            </Button>
          </>
        }
      >
        <form id="redeem-form" onSubmit={handleRedeem} className="stack stack--sm">
          <p className="text-sm">
            Saldo tersedia:{' '}
            <strong>{formatNumber(redeemTarget?.pointsBalance ?? 0, 0)} poin</strong>
          </p>
          <InputField
            id="redeem-qty"
            label="Jumlah Poin Ditukar"
            type="number"
            inputMode="numeric"
            min={1}
            max={redeemTarget?.pointsBalance ?? 1}
            required
            value={redeemPoints}
            onChange={(e) => setRedeemPoints(e.target.value)}
          />
          <InputField
            id="redeem-note"
            label="Barang / Produk Penukaran"
            required
            value={rewardNote}
            onChange={(e) => setRewardNote(e.target.value)}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(pickupTarget)}
        title={`Catat Jemput — ${pickupTarget?.name ?? ''}`}
        onClose={() => setPickupTarget(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPickupTarget(null)}>
              Batal
            </Button>
            <Button type="submit" form="pickup-log-form" variant="primary" disabled={busy}>
              {busy ? 'Menyimpan...' : 'Simpan & Tambah Poin'}
            </Button>
          </>
        }
      >
        <form id="pickup-log-form" onSubmit={handleQuickPickupDeposit} className="stack stack--sm">
          <InputField
            id="pickup-kg"
            label="Berat Sampah Organik Dijemput (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0.1}
            required
            value={pickupKg}
            onChange={(e) => setPickupKg(e.target.value)}
          />
          <div className="preset-group">
            {[5, 10, 20, 30].map((val) => (
              <button
                key={val}
                type="button"
                className="preset-btn"
                onClick={() => setPickupKg(String(val))}
              >
                {val} kg
              </button>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
}

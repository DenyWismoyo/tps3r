'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Award, Plus, Users } from 'lucide-react';
import {
  CONTRIBUTOR_TYPE_LABELS,
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
import { formatNumber } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

const TYPE_OPTIONS = (
  Object.entries(CONTRIBUTOR_TYPE_LABELS) as [ContributorType, string][]
).map(([value, label]) => ({ value, label }));

export function ContributorManager() {
  const { showToast } = useToast();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [memberCode, setMemberCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ContributorType>('warung');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [redeemTarget, setRedeemTarget] = useState<Contributor | null>(null);
  const [redeemPoints, setRedeemPoints] = useState('100');
  const [rewardNote, setRewardNote] = useState('Tukar 1 karung Kasgot / Paket Sayur');
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllContributorsAdmin();
      setContributors(list);
      setMemberCode(`TPS-${String(list.length + 1).padStart(3, '0')}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAddContributor = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = contributorInputSchema.safeParse({
      memberCode,
      name,
      type,
      phone,
      address,
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

  const filtered = contributors.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.memberCode.toLowerCase().includes(q) ||
      c.phoneNormalized.includes(q)
    );
  });

  return (
    <div className="stack">
      <div className="cluster cluster--between">
        <div>
          <h2>Mitra Penyetor &amp; Tabungan Poin</h2>
          <p className="text-sm text-muted">
            Kelola data warga/warung penyetor dan catat penukaran poin menjadi pupuk atau sayur.
          </p>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          <span>Tambah Penyetor</span>
        </Button>
      </div>

      <InputField
        id="contrib-search"
        label="Cari Mitra Penyetor"
        placeholder="Ketik nama, kode TPS-001, atau nomor HP..."
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
                <th>Nama Mitra</th>
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
                    <div className="text-xs text-muted">{item.phoneNormalized}</div>
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
    </div>
  );
}

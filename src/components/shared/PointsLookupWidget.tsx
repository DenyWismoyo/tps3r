'use client';

import { useState, type FormEvent } from 'react';
import { Award, Recycle, Search } from 'lucide-react';
import { CONTRIBUTOR_TYPE_LABELS, type Contributor } from '@/types/database';
import { lookupContributor } from '@/services/contributors.service';
import { formatDateId, formatNumber } from '@/utils/format';
import { buildPointsRedeemWhatsAppMessage } from '@/utils/whatsapp';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { WhatsAppButton } from './WhatsAppButton';

export function PointsLookupWidget() {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!queryText.trim()) {
      setError('Masukkan Nomor HP atau Kode Member terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const found = await lookupContributor(queryText);
      setContributor(found);
      setSearched(true);
    } catch {
      setError('Gagal memeriksa saldo poin. Pastikan koneksi internet aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="points-card stack">
      <div className="stack stack--xs">
        <h3>Cek Saldo Poin Penyetor</h3>
        <p className="text-sm text-muted">
          Tanpa perlu login — masukkan Nomor HP terdaftar atau Kode Member Anda untuk melihat
          total setoran sampah organik dan saldo poin tukar pupuk/sayur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="stack stack--sm">
        <InputField
          id="points-lookup-input"
          label="Nomor HP atau Kode Member"
          placeholder="Contoh: ADK-001 atau 08123450001"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          error={error ?? undefined}
        />
        <Button type="submit" variant="primary" block disabled={loading}>
          <Search size={17} />
          <span>{loading ? 'Mencari Data...' : 'Cek Poin Sekarang'}</span>
        </Button>
      </form>

      {searched && !contributor ? (
        <div className="card card--tinted">
          <div className="card__body">
            <p className="text-sm font-semibold">Data member belum ditemukan.</p>
            <p className="text-xs text-muted">
              Periksa kembali penulisan kode (misal <strong>ADK-001</strong>) atau nomor HP yang
              terdaftar saat penyetoran.
            </p>
          </div>
        </div>
      ) : null}

      {contributor ? (
        <div className="points-result stack stack--sm">
          <div className="cluster cluster--between">
            <div>
              <Badge tone="organic">{contributor.memberCode}</Badge>{' '}
              <Badge tone="info">{CONTRIBUTOR_TYPE_LABELS[contributor.type]}</Badge>
              <h4>{contributor.name}</h4>
            </div>
            <Badge tone={contributor.isActive ? 'available' : 'neutral'}>
              {contributor.isActive ? 'Aktif' : 'Non-aktif'}
            </Badge>
          </div>

          <div className="grid-2">
            <StatCard
              label="Total Sampah Disetor"
              value={formatNumber(contributor.totalDepositedKg, 1)}
              unit="kg"
              icon={<Recycle size={18} />}
              compact
            />
            <StatCard
              label="Saldo Poin Aktif"
              value={formatNumber(contributor.pointsBalance, 0)}
              unit="poin"
              icon={<Award size={18} />}
              tone="amber"
              compact
            />
          </div>

          {contributor.lastDepositAt ? (
            <p className="text-xs text-muted">
              Setoran terakhir tercatat: {formatDateId(contributor.lastDepositAt)}
            </p>
          ) : null}

          <WhatsAppButton
            message={buildPointsRedeemWhatsAppMessage(
              contributor.memberCode,
              contributor.name,
              contributor.pointsBalance
            )}
            label="Ajukan Tukar Poin via WA"
            block
          />
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Bug, CheckCircle2, Plus, Sprout, Trash2 } from 'lucide-react';
import {
  BATCH_STATUS_LABELS,
  BATCH_TYPE_LABELS,
  type ProductionBatch,
  type ProductionBatchStatus,
  type ProductionBatchType,
} from '@/types/database';
import { productionBatchSchema } from '@/validations/schemas';
import {
  createProductionBatch,
  deleteProductionBatch,
  getProductionBatchesAdmin,
  updateBatchStatus,
} from '@/services/batches.service';
import { formatDateId, getTodayDateKey } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

function addDaysYmd(baseYmd: string, days: number): string {
  const date = new Date(`${baseYmd}T00:00:00`);
  if (Number.isNaN(date.getTime())) return baseYmd;
  date.setDate(date.getDate() + days);
  return getTodayDateKey(date);
}

function getDaysRemaining(targetYmd: string): number {
  const today = new Date(`${getTodayDateKey()}T00:00:00`);
  const target = new Date(`${targetYmd}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProductionBatchTracker() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [type, setType] = useState<ProductionBatchType>('biopond_maggot');
  const [code, setCode] = useState('BP-04');
  const [startDate, setStartDate] = useState(getTodayDateKey());
  const [targetHarvestDate, setTargetHarvestDate] = useState(addDaysYmd(getTodayDateKey(), 16));
  const [estimatedInputKg, setEstimatedInputKg] = useState('60');
  const [notes, setNotes] = useState('');

  const loadBatches = useCallback(async () => {
    const list = await getProductionBatchesAdmin();
    setBatches(list);
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  const handleTypeChange = (nextType: ProductionBatchType) => {
    setType(nextType);
    const defaultDays = nextType === 'biopond_maggot' ? 16 : 35;
    setTargetHarvestDate(addDaysYmd(startDate, defaultDays));
    setCode(nextType === 'biopond_maggot' ? `BP-0${batches.length + 1}` : `KM-0${batches.length + 1}`);
  };

  const handleStartDateChange = (nextStart: string) => {
    setStartDate(nextStart);
    const defaultDays = type === 'biopond_maggot' ? 16 : 35;
    setTargetHarvestDate(addDaysYmd(nextStart, defaultDays));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = productionBatchSchema.safeParse({
      code,
      type,
      startDate,
      targetHarvestDate,
      estimatedInputKg,
      notes: notes || undefined,
    });

    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? 'Periksa data batch.', 'error');
      return;
    }

    setBusyId('new');
    try {
      await createProductionBatch(parsed.data, user?.email || user?.uid || 'admin');
      showToast(`Batch ${parsed.data.code} berhasil dimulai.`, 'success');
      setModalOpen(false);
      setNotes('');
      await loadBatches();
    } catch {
      showToast('Gagal menyimpan batch produksi.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = async (id: string, nextStatus: ProductionBatchStatus) => {
    setBusyId(id);
    try {
      await updateBatchStatus(id, nextStatus);
      showToast(`Status batch diubah menjadi ${BATCH_STATUS_LABELS[nextStatus]}.`, 'success');
      await loadBatches();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteProductionBatch(id);
      showToast('Batch dihapus.', 'info');
      await loadBatches();
    } finally {
      setBusyId(null);
    }
  };

  const activeBatches = batches.filter((b) => b.status !== 'selesai');

  return (
    <div className="stack stack--sm">
      <div className="cluster cluster--between">
        <div>
          <h3>Pelacak Batch Biopond BSF &amp; Bedeng Kompos</h3>
          <p className="text-xs text-muted">
            Hitung mundur otomatis jadwal panen maggot (16 hari) &amp; matang kompos (35 hari).
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Mulai Batch</span>
        </Button>
      </div>

      {activeBatches.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada batch budidaya aktif. Klik &quot;Mulai Batch&quot; saat tebar telur BSF atau
          tumpukan kompos baru.
        </p>
      ) : (
        <div className="grid-3">
          {activeBatches.map((batch) => {
            const daysLeft = getDaysRemaining(batch.targetHarvestDate);
            const isReady = daysLeft <= 2 || batch.status === 'panen';
            return (
              <div
                key={batch.id}
                className={['batch-card', isReady ? 'batch-card--ready' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="cluster cluster--between">
                  <span className="cluster">
                    {batch.type === 'biopond_maggot' ? (
                      <Bug size={16} className="text-accent" />
                    ) : (
                      <Sprout size={16} className="text-primary" />
                    )}
                    <strong>{batch.code}</strong>
                  </span>
                  <Badge tone={isReady ? 'preorder' : 'organic'}>
                    {daysLeft <= 0
                      ? 'Waktunya Panen!'
                      : daysLeft === 1
                        ? 'Besok Panen'
                        : `${daysLeft} hari lagi`}
                  </Badge>
                </div>

                <div className="text-xs text-muted">
                  {BATCH_TYPE_LABELS[batch.type]} • Input ~{batch.estimatedInputKg} kg
                </div>
                <div className="text-xs">
                  Mulai: {formatDateId(batch.startDate)} → Target:{' '}
                  <strong>{formatDateId(batch.targetHarvestDate)}</strong>
                </div>
                {batch.notes ? <div className="text-xs text-muted">{batch.notes}</div> : null}

                <div className="cluster cluster--between">
                  <Button
                    variant={batch.status === 'panen' ? 'primary' : 'outline'}
                    size="sm"
                    disabled={busyId === batch.id}
                    onClick={() =>
                      void handleStatus(
                        batch.id,
                        batch.status === 'aktif' ? 'panen' : 'selesai'
                      )
                    }
                  >
                    <CheckCircle2 size={14} />
                    <span>{batch.status === 'aktif' ? 'Mulai Panen' : 'Tandai Selesai'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    iconOnly
                    aria-label={`Hapus batch ${batch.code}`}
                    disabled={busyId === batch.id}
                    onClick={() => void handleDelete(batch.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Mulai Batch Budidaya Baru"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              form="batch-create-form"
              variant="primary"
              disabled={busyId === 'new'}
            >
              Simpan Batch
            </Button>
          </>
        }
      >
        <form id="batch-create-form" onSubmit={handleCreate} className="stack stack--sm">
          <div className="grid-2">
            <SelectField
              id="batch-type"
              label="Jenis Produksi"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ProductionBatchType)}
              options={[
                { value: 'biopond_maggot', label: 'Biopond Maggot BSF (~16 hari)' },
                { value: 'bedeng_kompos', label: 'Bedeng Kompos (~35 hari)' },
              ]}
            />
            <InputField
              id="batch-code"
              label="Kode Biopond / Bedeng"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <InputField
              id="batch-start"
              label="Tanggal Mulai"
              type="date"
              required
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
            <InputField
              id="batch-target"
              label="Target Siap Panen"
              type="date"
              required
              value={targetHarvestDate}
              onChange={(e) => setTargetHarvestDate(e.target.value)}
            />
          </div>
          <InputField
            id="batch-kg"
            label="Perkiraan Bahan Organik (kg)"
            type="number"
            inputMode="decimal"
            min={0}
            value={estimatedInputKg}
            onChange={(e) => setEstimatedInputKg(e.target.value)}
          />
          <InputField
            id="batch-notes"
            label="Catatan (Opsional)"
            placeholder="Contoh: 15g telur BSF + pakan sisa makanan Pasar Kadipiro"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import type { Contributor } from '@/types/database';
import { dailyLogInputSchema } from '@/validations/schemas';
import { createDailyLog } from '@/services/logs.service';
import { getTodayDateKey } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export interface QuickLogFormProps {
  contributors: readonly Contributor[];
  onSaved: () => void;
}

const PRESET_INCREMENTS = [5, 10, 25] as const;

export function QuickLogForm({ contributors, onSaved }: QuickLogFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [date, setDate] = useState(getTodayDateKey());
  const [organicWasteKg, setOrganicWasteKg] = useState('0');
  const [foodWasteKg, setFoodWasteKg] = useState('0');
  const [maggotHarvestKg, setMaggotHarvestKg] = useState('0');
  const [compostProducedKg, setCompostProducedKg] = useState('0');
  const [kasgotProducedKg, setKasgotProducedKg] = useState('0');
  const [pocProducedLiter, setPocProducedLiter] = useState('0');
  const [contributorId, setContributorId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const addPreset = (current: string, delta: number, setter: (v: string) => void) => {
    const next = Math.round(((Number(current) || 0) + delta) * 100) / 100;
    setter(String(next));
  };

  const totalWastePreview = (Number(organicWasteKg) || 0) + (Number(foodWasteKg) || 0);
  const estimatedPoints = contributorId
    ? Math.round(totalWastePreview * SITE_CONFIG.pointsPerKgWaste)
    : 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = dailyLogInputSchema.safeParse({
      date,
      organicWasteKg,
      foodWasteKg,
      maggotHarvestKg,
      compostProducedKg,
      kasgotProducedKg,
      pocProducedLiter,
      contributorId: contributorId || undefined,
      notes: notes || undefined,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Periksa kembali angka input.');
      return;
    }

    setSaving(true);
    try {
      const recordedBy = user?.email || user?.uid || 'pengurus-tps3r';
      const result = await createDailyLog(parsed.data, recordedBy);
      const ptsInfo =
        result.earnedPoints > 0 ? ` (+${result.earnedPoints} poin penyetor)` : '';
      showToast(`Log harian tersimpan secara atomik!${ptsInfo}`, 'success');

      setOrganicWasteKg('0');
      setFoodWasteKg('0');
      setMaggotHarvestKg('0');
      setCompostProducedKg('0');
      setKasgotProducedKg('0');
      setPocProducedLiter('0');
      setContributorId('');
      setNotes('');
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan log harian.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quick-log-card stack">
      <div className="cluster cluster--between">
        <div>
          <h3>Quick Log Harian (&lt; 1 Menit)</h3>
          <p className="text-xs text-muted">
            Otomatis memperbarui ringkasan dampak, grafik bulanan, &amp; saldo poin penyetor.
          </p>
        </div>
        <span className="badge badge--organic">
          <CheckCircle2 size={14} /> Transaksi Atomik
        </span>
      </div>

      {errorMsg ? (
        <div className="form-error" role="alert">
          {errorMsg}
        </div>
      ) : null}

      <div className="grid-2">
        <InputField
          id="ql-date"
          label="Tanggal Pencatatan"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <SelectField
          id="ql-contributor"
          label="Mitra Penyetor (Opsional — Auto Poin)"
          value={contributorId}
          onChange={(e) => setContributorId(e.target.value)}
          placeholder="— Setoran Umum / Tanpa Member —"
          options={contributors
            .filter((c) => c.isActive)
            .map((c) => ({
              value: c.id,
              label: `${c.memberCode} — ${c.name}`,
            }))}
          hint={
            estimatedPoints > 0
              ? `Akan menambah +${estimatedPoints} poin ke saldo mitra.`
              : 'Pilih mitra jika ingin poin otomatis tercatat.'
          }
        />
      </div>

      <div className="grid-2">
        <div>
          <InputField
            id="ql-organic"
            label="Sampah Organik Kebun/RT (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            value={organicWasteKg}
            onChange={(e) => setOrganicWasteKg(e.target.value)}
          />
          <div className="preset-group">
            {PRESET_INCREMENTS.map((n) => (
              <button
                key={n}
                type="button"
                className="preset-btn"
                onClick={() => addPreset(organicWasteKg, n, setOrganicWasteKg)}
              >
                +{n} kg
              </button>
            ))}
          </div>
        </div>

        <div>
          <InputField
            id="ql-food"
            label="Sisa Makanan Warung/Resto (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            value={foodWasteKg}
            onChange={(e) => setFoodWasteKg(e.target.value)}
          />
          <div className="preset-group">
            {PRESET_INCREMENTS.map((n) => (
              <button
                key={n}
                type="button"
                className="preset-btn"
                onClick={() => addPreset(foodWasteKg, n, setFoodWasteKg)}
              >
                +{n} kg
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-4">
        <div>
          <InputField
            id="ql-maggot"
            label="Panen Maggot (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            value={maggotHarvestKg}
            onChange={(e) => setMaggotHarvestKg(e.target.value)}
          />
          <div className="preset-group">
            {[5, 10].map((n) => (
              <button
                key={n}
                type="button"
                className="preset-btn"
                onClick={() => addPreset(maggotHarvestKg, n, setMaggotHarvestKg)}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <InputField
            id="ql-compost"
            label="Kompos Matang (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            value={compostProducedKg}
            onChange={(e) => setCompostProducedKg(e.target.value)}
          />
          <div className="preset-group">
            {[10, 25].map((n) => (
              <button
                key={n}
                type="button"
                className="preset-btn"
                onClick={() => addPreset(compostProducedKg, n, setCompostProducedKg)}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <InputField
            id="ql-kasgot"
            label="Kasgot Ayak (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            value={kasgotProducedKg}
            onChange={(e) => setKasgotProducedKg(e.target.value)}
          />
          <div className="preset-group">
            {[5, 10].map((n) => (
              <button
                key={n}
                type="button"
                className="preset-btn"
                onClick={() => addPreset(kasgotProducedKg, n, setKasgotProducedKg)}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        <InputField
          id="ql-poc"
          label="POC Cair (Liter)"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={0}
          value={pocProducedLiter}
          onChange={(e) => setPocProducedLiter(e.target.value)}
        />
      </div>

      <InputField
        id="ql-notes"
        label="Catatan Lapangan (Opsional)"
        placeholder="Contoh: Panen biopond 2 & setoran pagi Warung Bu Tini"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button type="submit" variant="primary" size="lg" block disabled={saving}>
        <Save size={18} />
        <span>{saving ? 'Menyimpan Log Harian...' : 'Simpan Quick Log Sekarang'}</span>
      </Button>
    </form>
  );
}

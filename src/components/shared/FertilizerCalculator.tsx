'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, Bug, Handshake, ShoppingBag, Sprout } from 'lucide-react';
import {
  CALCULATOR_PRICES,
  CROP_FORMULAS,
  LIVESTOCK_FORMULAS,
  calculateFertilizerNeeds,
  calculateMaggotNeeds,
  type CropType,
  type LandUnitMode,
  type LivestockType,
} from '@/config/calculator';
import { SITE_CONFIG } from '@/config/site';
import { formatNumber, formatRupiah } from '@/utils/format';
import { buildCalculatorWhatsAppMessage } from '@/utils/whatsapp';
import { useCart } from '@/hooks/useCart';
import { Tabs } from '@/components/ui/Tabs';
import { InputField, SelectField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from './WhatsAppButton';

type CalculatorMode = 'pupuk' | 'maggot' | 'poin';

export interface FertilizerCalculatorProps {
  defaultMode?: CalculatorMode;
  preselectedProductSlug?: string;
}

export function FertilizerCalculator({
  defaultMode,
  preselectedProductSlug,
}: FertilizerCalculatorProps) {
  const inferredMode: CalculatorMode =
    defaultMode ?? (preselectedProductSlug?.includes('maggot') ? 'maggot' : 'pupuk');

  const [mode, setMode] = useState<CalculatorMode>(inferredMode);
  const [cropId, setCropId] = useState<CropType>('sayuran_daun');
  const [unitMode, setUnitMode] = useState<LandUnitMode>('m2');
  const [landQty, setLandQty] = useState('20');

  const [livestockId, setLivestockId] = useState<LivestockType>('lele');
  const [headCount, setHeadCount] = useState('500');

  const [dailyWasteKg, setDailyWasteKg] = useState('3');
  const [daysPerMonth, setDaysPerMonth] = useState('24');

  const { addCustomItem, openDrawer } = useCart();
  const { showToast } = useToast();

  const fertResult = useMemo(
    () => calculateFertilizerNeeds(cropId, unitMode, Number(landQty) || 0),
    [cropId, unitMode, landQty]
  );

  const maggotResult = useMemo(
    () => calculateMaggotNeeds(livestockId, Number(headCount) || 0),
    [livestockId, headCount]
  );

  const pointsSimulation = useMemo(() => {
    const kgMonth = Math.max(0, (Number(dailyWasteKg) || 0) * (Number(daysPerMonth) || 0));
    const pointsMonth = Math.round(kgMonth * SITE_CONFIG.pointsPerKgWaste);
    const co2Month = Math.round(kgMonth * SITE_CONFIG.co2FactorPerKgOrganic * 10) / 10;
    const sayurPacks = Math.floor(pointsMonth / 150);
    const kasgotSacks = Math.floor(pointsMonth / 350);
    return { kgMonth, pointsMonth, co2Month, sayurPacks, kasgotSacks };
  }, [dailyWasteKg, daysPerMonth]);

  const selectedCropLabel =
    CROP_FORMULAS.find((c) => c.id === cropId)?.label ?? 'Tanaman';
  const selectedLivestockLabel =
    LIVESTOCK_FORMULAS.find((l) => l.id === livestockId)?.label ?? 'Ternak';

  const handleAddRecommendationToCart = () => {
    if (mode === 'pupuk') {
      const kasgotSacks = Math.max(1, Math.ceil(fertResult.kasgotKg / 10));
      addCustomItem({
        productId: 'kasgot-halus-10kg',
        slug: 'kasgot-halus-10kg',
        name: 'Kasgot (Bekas Maggot) Ayak Halus Klebengan 10 kg',
        price: 30000,
        unit: 'karung 10kg',
        qty: kasgotSacks,
      });
      showToast(`${kasgotSacks} karung Kasgot ditambahkan ke keranjang.`, 'success');
    } else {
      const freshKg = Math.max(1, Math.ceil(maggotResult.freshKgPerWeek));
      addCustomItem({
        productId: 'maggot-bsf-segar',
        slug: 'maggot-bsf-segar',
        name: 'Maggot BSF Segar Klebengan (Pakan Hidup)',
        price: CALCULATOR_PRICES.freshMaggotPerKg,
        unit: 'kg',
        qty: freshKg,
      });
      showToast(`${freshKg} kg Maggot BSF Segar ditambahkan ke keranjang.`, 'success');
    }
    openDrawer();
  };

  const waMessage =
    mode === 'pupuk'
      ? buildCalculatorWhatsAppMessage([
          `Kebutuhan Pupuk untuk ${selectedCropLabel}`,
          `Skala: ${landQty || 0} ${unitMode === 'm2' ? 'm² lahan' : 'pot/polybag'}`,
          `Rekomendasi: Kompos ${fertResult.compostKg} kg, Kasgot ${fertResult.kasgotKg} kg, POC ${fertResult.pocLiter} L`,
          `Estimasi Biaya: ${formatRupiah(fertResult.estimatedCostRp)}`,
        ])
      : mode === 'maggot'
        ? buildCalculatorWhatsAppMessage([
            `Kebutuhan Pakan Maggot BSF untuk ${selectedLivestockLabel}`,
            `Populasi: ${headCount || 0} ekor`,
            `Maggot Segar: ${maggotResult.freshKgPerDay} kg/hari (${maggotResult.freshKgPerWeek} kg/minggu)`,
            `Maggot Kering: ${maggotResult.dryKgPerDay} kg/hari (${maggotResult.dryKgPerWeek} kg/minggu)`,
          ])
        : buildCalculatorWhatsAppMessage([
            `Simulasi Mitra Penyetor Sampah Organik`,
            `Perkiraan setor: ${pointsSimulation.kgMonth} kg/bulan`,
            `Estimasi poin: ${pointsSimulation.pointsMonth} poin/bulan`,
            `Ingin mendaftar sebagai mitra penyetor TPS 3R Abdi Dalem Klebengan.`,
          ]);

  return (
    <div className="calculator-box stack">
      <Tabs
        ariaLabel="Pilih mode kalkulator"
        activeKey={mode}
        onChange={setMode}
        items={[
          { key: 'pupuk', label: 'Pupuk Lahan & Pot', icon: <Sprout size={17} /> },
          { key: 'maggot', label: 'Pakan Maggot BSF', icon: <Bug size={17} /> },
          { key: 'poin', label: 'Simulasi Poin Setor', icon: <Award size={17} /> },
        ]}
      />

      {mode === 'pupuk' ? (
        <div className="split-aside">
          <div className="stack">
            <SelectField
              id="calc-crop"
              label="Jenis Tanaman"
              value={cropId}
              onChange={(e) => setCropId(e.target.value as CropType)}
              options={CROP_FORMULAS.map((item) => ({ value: item.id, label: item.label }))}
            />
            <SelectField
              id="calc-unit-mode"
              label="Satuan Area Tanam"
              value={unitMode}
              onChange={(e) => setUnitMode(e.target.value as LandUnitMode)}
              options={[
                { value: 'm2', label: 'Luas Lahan / Bedengan (m²)' },
                { value: 'polybag', label: 'Jumlah Pot / Polybag' },
              ]}
            />
            <InputField
              id="calc-land-qty"
              label={unitMode === 'm2' ? 'Luas Lahan (m²)' : 'Jumlah Pot / Polybag'}
              type="number"
              inputMode="decimal"
              min={1}
              value={landQty}
              onChange={(e) => setLandQty(e.target.value)}
              hint="Masukkan angka perkiraan, hasil takaran langsung terhitung otomatis."
            />
          </div>

          <div className="calculator-result stack stack--sm">
            <span className="badge badge--organic">Rekomendasi Takaran</span>
            <div className="grid-3">
              <div>
                <div className="text-xs text-muted">Kompos Matang</div>
                <div className="calculator-result__metric">
                  {formatNumber(fertResult.compostKg)} kg
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Kasgot Halus</div>
                <div className="calculator-result__metric">
                  {formatNumber(fertResult.kasgotKg)} kg
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">POC Cair</div>
                <div className="calculator-result__metric">
                  {formatNumber(fertResult.pocLiter)} L
                </div>
              </div>
            </div>
            <p className="text-sm">
              Estimasi total hemat: <strong>{formatRupiah(fertResult.estimatedCostRp)}</strong>
            </p>
            <p className="text-xs text-muted">{fertResult.frequencyNote}</p>
            <div className="grid-2">
              <Button variant="primary" block onClick={handleAddRecommendationToCart}>
                <ShoppingBag size={17} />
                <span>Masuk Keranjang</span>
              </Button>
              <WhatsAppButton message={waMessage} label="Konsultasi WA" block />
            </div>
          </div>
        </div>
      ) : mode === 'maggot' ? (
        <div className="split-aside">
          <div className="stack">
            <SelectField
              id="calc-livestock"
              label="Jenis Ternak / Ikan"
              value={livestockId}
              onChange={(e) => setLivestockId(e.target.value as LivestockType)}
              options={LIVESTOCK_FORMULAS.map((item) => ({ value: item.id, label: item.label }))}
            />
            <InputField
              id="calc-head-count"
              label="Jumlah Populasi (Ekor)"
              type="number"
              inputMode="numeric"
              min={1}
              value={headCount}
              onChange={(e) => setHeadCount(e.target.value)}
              hint="Contoh: 500 ekor lele atau 50 ekor ayam kampung."
            />
          </div>

          <div className="calculator-result stack stack--sm">
            <span className="badge badge--organic">Rekomendasi Pakan Maggot BSF</span>
            <div className="grid-2">
              <div>
                <div className="text-xs text-muted">Maggot Segar / Hari</div>
                <div className="calculator-result__metric">
                  {formatNumber(maggotResult.freshKgPerDay, 2)} kg
                </div>
                <div className="text-xs text-muted">
                  Mingguan: {formatNumber(maggotResult.freshKgPerWeek, 1)} kg (
                  {formatRupiah(maggotResult.estimatedFreshWeeklyCostRp)})
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Alternatif Maggot Kering / Hari</div>
                <div className="calculator-result__metric">
                  {formatNumber(maggotResult.dryKgPerDay, 2)} kg
                </div>
                <div className="text-xs text-muted">
                  Mingguan: {formatNumber(maggotResult.dryKgPerWeek, 1)} kg (
                  {formatRupiah(maggotResult.estimatedDryWeeklyCostRp)})
                </div>
              </div>
            </div>
            <p className="text-xs text-muted">{maggotResult.substitutionRatioNote}</p>
            <div className="grid-2">
              <Button variant="primary" block onClick={handleAddRecommendationToCart}>
                <ShoppingBag size={17} />
                <span>Masuk Keranjang</span>
              </Button>
              <WhatsAppButton message={waMessage} label="Pesan via WA" block />
            </div>
          </div>
        </div>
      ) : (
        <div className="split-aside">
          <div className="stack">
            <InputField
              id="calc-daily-waste"
              label="Perkiraan Sisa Makanan / Organik per Hari (kg)"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={0.5}
              value={dailyWasteKg}
              onChange={(e) => setDailyWasteKg(e.target.value)}
              hint="Rumah tangga umumnya 1–2 kg/hari; warung makan 5–20 kg/hari."
            />
            <InputField
              id="calc-days-month"
              label="Hari Operasional / Setor per Bulan"
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(e.target.value)}
            />
          </div>

          <div className="calculator-result stack stack--sm">
            <span className="badge badge--organic">Simulasi Tabungan Poin &amp; Dampak</span>
            <div className="grid-3">
              <div>
                <div className="text-xs text-muted">Sampah Teralihkan</div>
                <div className="calculator-result__metric">
                  {formatNumber(pointsSimulation.kgMonth, 0)} kg
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Poin / Bulan</div>
                <div className="calculator-result__metric">
                  {formatNumber(pointsSimulation.pointsMonth, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">CO2e Dicegah</div>
                <div className="calculator-result__metric">
                  {formatNumber(pointsSimulation.co2Month, 1)} kg
                </div>
              </div>
            </div>
            <p className="text-sm">
              Setara <strong>{pointsSimulation.sayurPacks} paket sayur tayurdapot</strong> atau{' '}
              <strong>{pointsSimulation.kasgotSacks} karung Kasgot 10 kg</strong> gratis setiap
              bulan!
            </p>
            <div className="grid-2">
              <Link href="/kemitraan" className="btn btn--primary btn--block">
                <Handshake size={17} />
                <span>Daftar Mitra Sekarang</span>
              </Link>
              <WhatsAppButton message={waMessage} label="Tanya Jemput WA" block />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

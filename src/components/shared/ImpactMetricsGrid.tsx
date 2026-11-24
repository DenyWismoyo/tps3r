import { Bug, CloudOff, Recycle, Sprout } from 'lucide-react';
import type { ImpactSummary } from '@/types/database';
import { formatNumber, formatWeightKg } from '@/utils/format';
import { StatCard } from '@/components/ui/StatCard';

export interface ImpactMetricsGridProps {
  summary: ImpactSummary;
  periodLabel?: string;
  layout?: 'row' | 'grid-2x2';
  compact?: boolean;
}

export function ImpactMetricsGrid({
  summary,
  periodLabel,
  layout = 'row',
  compact = false,
}: ImpactMetricsGridProps) {
  const waste = formatWeightKg(summary.totalWasteProcessedKg);
  const compost = formatWeightKg(summary.totalCompostAndKasgotKg);
  const maggot = formatWeightKg(summary.totalMaggotHarvestKg);
  const co2 = formatWeightKg(summary.estimatedCo2SavedKg);

  const gridClass = layout === 'grid-2x2' ? 'grid-2' : 'grid-4';

  return (
    <div className="stack stack--sm">
      {periodLabel ? (
        <div className="impact-bar__meta">
          <span>{periodLabel}</span>
          <span>
            Mitra penyetor aktif: <strong>{formatNumber(summary.activeContributorsCount, 0)}</strong>
          </span>
        </div>
      ) : null}

      <div className={gridClass}>
        <StatCard
          label="Sampah Organik Terolah"
          value={waste.value}
          unit={waste.unit}
          icon={<Recycle size={20} />}
          trendText={`Sisa makanan: ${formatNumber(summary.totalFoodWasteKg, 0)} kg`}
          tone="green"
          compact={compact}
        />
        <StatCard
          label="Kompos & Kasgot Diproduksi"
          value={compost.value}
          unit={compost.unit}
          icon={<Sprout size={20} />}
          trendText={`POC cair: ${formatNumber(summary.totalPocLiter, 0)} liter`}
          tone="soil"
          compact={compact}
        />
        <StatCard
          label="Panen Maggot BSF"
          value={maggot.value}
          unit={maggot.unit}
          icon={<Bug size={20} />}
          trendText="Pakan ikan & unggas lokal"
          tone="amber"
          compact={compact}
        />
        <StatCard
          label="Estimasi Reduksi CO2e"
          value={co2.value}
          unit={`${co2.unit} CO2e`}
          icon={<CloudOff size={20} />}
          trendText="Cegah emisi metana TPA"
          tone="green"
          compact={compact}
        />
      </div>
    </div>
  );
}

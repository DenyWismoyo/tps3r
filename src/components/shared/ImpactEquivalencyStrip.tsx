import { PiggyBank, Trees, Truck } from 'lucide-react';
import type { ImpactSummary } from '@/types/database';
import { formatNumber, formatRupiah } from '@/utils/format';

export interface ImpactEquivalencyStripProps {
  summary: ImpactSummary;
}

export function ImpactEquivalencyStrip({ summary }: ImpactEquivalencyStripProps) {
  const divertedKg =
    summary.totalWasteProcessedKg + (summary.totalInorganicWasteKg ?? 0);
  // 1 truk sampah standar ~3.000 kg; 1 pohon dewasa serap ~21 kg CO2e/tahun;
  // 1 kg maggot BSF menggantikan ~0.4 kg pelet pabrikan (@ Rp 13.000/kg)
  const trucksSaved = divertedKg / 3000;
  const treesEquivalent = summary.estimatedCo2SavedKg / 21;
  const feedSavingsRp = Math.round(summary.totalMaggotHarvestKg * 5200);

  return (
    <div className="equiv-strip">
      <div className="equiv-card">
        <span className="stat-card__icon" aria-hidden="true">
          <Truck size={20} />
        </span>
        <div>
          <div className="text-xs font-semibold text-muted">Beban TPA Putri Cempo Dicegah</div>
          <div className="equiv-card__value">± {formatNumber(trucksSaved, 1)} Truk Sampah</div>
          <p className="text-xs text-muted">
            Teralihkan di hulu Kadipiro tanpa berakhir menumpuk di TPA.
          </p>
        </div>
      </div>

      <div className="equiv-card">
        <span className="stat-card__icon" aria-hidden="true">
          <Trees size={20} />
        </span>
        <div>
          <div className="text-xs font-semibold text-muted">Setara Serapan Karbon</div>
          <div className="equiv-card__value">± {formatNumber(treesEquivalent, 0)} Pohon Dewasa</div>
          <p className="text-xs text-muted">
            Kontribusi nyata ProKlim RW 17 menekan gas metana organik.
          </p>
        </div>
      </div>

      <div className="equiv-card">
        <span className="stat-card__icon" aria-hidden="true">
          <PiggyBank size={20} />
        </span>
        <div>
          <div className="text-xs font-semibold text-muted">Estimasi Penghematan Pakan Lokal</div>
          <div className="equiv-card__value">{formatRupiah(feedSavingsRp)}</div>
          <p className="text-xs text-muted">
            Nilai efisiensi pakan peternak ikan &amp; unggas berkat Maggot BSF.
          </p>
        </div>
      </div>
    </div>
  );
}

import type { MonthlyImpact } from '@/types/database';
import { formatNumber } from '@/utils/format';

export type ImpactChartMetric = 'waste' | 'compost' | 'maggot';

export interface ImpactTrendChartProps {
  monthlyData: readonly MonthlyImpact[];
  metric?: ImpactChartMetric;
  height?: number;
}

const METRIC_META: Record<
  ImpactChartMetric,
  { label: string; barClass: string; getValue: (item: MonthlyImpact) => number }
> = {
  waste: {
    label: 'Sampah Organik Terolah (kg)',
    barClass: 'chart-svg__bar-waste',
    getValue: (m) => m.wasteKg,
  },
  compost: {
    label: 'Produksi Kompos & Kasgot (kg)',
    barClass: 'chart-svg__bar-compost',
    getValue: (m) => m.compostKg + m.kasgotKg,
  },
  maggot: {
    label: 'Panen Maggot BSF (kg)',
    barClass: 'chart-svg__bar-maggot',
    getValue: (m) => m.maggotKg,
  },
};

export function ImpactTrendChart({
  monthlyData,
  metric = 'waste',
  height = 240,
}: ImpactTrendChartProps) {
  const meta = METRIC_META[metric];

  if (monthlyData.length === 0) {
    return (
      <p className="text-sm text-muted text-center">
        Belum ada data tren bulanan yang tercatat.
      </p>
    );
  }

  const values = monthlyData.map((item) => meta.getValue(item));
  const maxVal = Math.max(10, ...values);

  const svgWidth = 640;
  const padTop = 28;
  const padBottom = 38;
  const padX = 24;
  const chartHeight = height - padTop - padBottom;
  const slotWidth = (svgWidth - padX * 2) / monthlyData.length;
  const barWidth = Math.min(48, Math.max(20, slotWidth * 0.56));

  return (
    <div className="stack stack--xs">
      <div className="cluster cluster--between">
        <span className="text-sm font-semibold text-primary">{meta.label}</span>
        <span className="text-xs text-muted">
          Periode {monthlyData[0]?.label} – {monthlyData[monthlyData.length - 1]?.label}
        </span>
      </div>

      <div className="chart-svg-wrap">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${svgWidth} ${height}`}
          role="img"
          aria-label={`Grafik tren ${meta.label}`}
        >
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padX}
                y1={y}
                x2={svgWidth - padX}
                y2={y}
                className="chart-svg__grid"
              />
            );
          })}

          {monthlyData.map((item, idx) => {
            const val = values[idx] ?? 0;
            const barH = Math.max(4, (val / maxVal) * chartHeight);
            const centerX = padX + slotWidth * idx + slotWidth / 2;
            const x = centerX - barWidth / 2;
            const y = padTop + chartHeight - barH;

            return (
              <g key={item.monthKey}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={6}
                  className={meta.barClass}
                />
                <text
                  x={centerX}
                  y={Math.max(14, y - 6)}
                  textAnchor="middle"
                  className="chart-svg__value"
                >
                  {formatNumber(val, 0)}
                </text>
                <text
                  x={centerX}
                  y={height - 12}
                  textAnchor="middle"
                  className="chart-svg__label"
                >
                  {item.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

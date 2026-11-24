'use client';

import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import type { ImpactSummary, MonthlyImpact } from '@/types/database';
import { formatDateId, formatNumber } from '@/utils/format';
import { exportMonthlyImpactCsv } from '@/utils/exportCsv';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { ImpactMetricsGrid } from './ImpactMetricsGrid';
import { ImpactTrendChart, type ImpactChartMetric } from './ImpactTrendChart';

export interface PrintableImpactReportProps {
  summary: ImpactSummary;
  monthlyData: readonly MonthlyImpact[];
}

export function PrintableImpactReport({
  summary,
  monthlyData,
}: PrintableImpactReportProps) {
  const [metric, setMetric] = useState<ImpactChartMetric>('waste');

  const inorganicTotal = summary.totalInorganicWasteKg ?? 0;
  const residueTotal = summary.totalResidueToTpaKg ?? 0;
  const divertedTotal = summary.totalWasteProcessedKg + inorganicTotal;
  const incomingTotal = divertedTotal + residueTotal;
  const reductionPct =
    incomingTotal > 0 ? Math.round((divertedTotal / incomingTotal) * 1000) / 10 : 100;

  return (
    <div className="stack stack--lg">
      <div className="cluster cluster--between no-print">
        <Tabs
          ariaLabel="Pilih metrik grafik tren bulanan"
          activeKey={metric}
          onChange={setMetric}
          items={[
            { key: 'waste', label: 'Sampah Terolah' },
            { key: 'compost', label: 'Kompos & Kasgot' },
            { key: 'maggot', label: 'Panen Maggot' },
          ]}
        />
        <div className="cluster">
          <Button
            variant="outline"
            onClick={() => exportMonthlyImpactCsv(monthlyData)}
          >
            <Download size={17} />
            <span>Export CSV (DLH/Excel)</span>
          </Button>
          <Button variant="primary" size="lg" onClick={() => window.print()}>
            <Printer size={18} />
            <span>Cetak Laporan A4</span>
          </Button>
        </div>
      </div>

      <article className="print-report stack stack--lg">
        <header className="print-report__kop">
          <span className="text-xs font-bold text-primary">
            LAPORAN TRANSPARANSI PENGOLAHAN SAMPAH ORGANIK &amp; EKONOMI SIRKULAR
          </span>
          <h2>{SITE_CONFIG.organizationName}</h2>
          <p className="text-sm text-muted">
            {SITE_CONFIG.address} • {SITE_CONFIG.legalityNumber}
          </p>
          <div className="cluster">
            <span className="text-xs text-muted">
              Pembaruan Data: {formatDateId(summary.lastUpdatedAt)} • WA: {SITE_CONFIG.phoneDisplay}
            </span>
            <Badge tone="available">
              Reduksi TPA Putri Cempo: {formatNumber(reductionPct, 1)}%
            </Badge>
          </div>
        </header>

        <ImpactMetricsGrid
          summary={summary}
          periodLabel={`Akumulasi Kinerja TPS 3R • Anorganik Terpilah: ${formatNumber(inorganicTotal, 0)} kg • Residu TPA: ${formatNumber(residueTotal, 0)} kg`}
        />

        <Card>
          <CardBody>
            <ImpactTrendChart monthlyData={monthlyData} metric={metric} height={240} />
          </CardBody>
        </Card>

        <div className="stack stack--sm">
          <h3>Rekapitulasi Bulanan (Format DLH / SIPSN / CSR)</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Organik (kg)</th>
                  <th>Anorganik (kg)</th>
                  <th>Residu TPA (kg)</th>
                  <th>Maggot (kg)</th>
                  <th>Kompos &amp; Kasgot (kg)</th>
                  <th>CO2e Dicegah (kg)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Belum ada data rekap bulanan.
                    </td>
                  </tr>
                ) : (
                  monthlyData.map((row) => {
                    const co2 =
                      row.co2SavedKg ??
                      Math.round(row.wasteKg * SITE_CONFIG.co2FactorPerKgOrganic);
                    return (
                      <tr key={row.monthKey}>
                        <td className="font-semibold">{row.label}</td>
                        <td>{formatNumber(row.wasteKg, 1)}</td>
                        <td>{formatNumber(row.inorganicKg ?? 0, 1)}</td>
                        <td>{formatNumber(row.residueKg ?? 0, 1)}</td>
                        <td>{formatNumber(row.maggotKg, 1)}</td>
                        <td>{formatNumber(row.compostKg + row.kasgotKg, 1)}</td>
                        <td>{formatNumber(co2, 1)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="print-report__signatures">
          <div>
            <div className="text-sm">Mengetahui,</div>
            <div className="text-sm font-semibold">{SITE_CONFIG.chairmanTitle}</div>
            <div className="print-report__sig-space" />
            <div className="font-bold">{SITE_CONFIG.chairmanName}</div>
          </div>
          <div>
            <div className="text-sm">Dicetak pada {formatDateId(new Date())}</div>
            <div className="text-sm font-semibold">Koordinator / Pencatat Data</div>
            <div className="print-report__sig-space" />
            <div className="font-bold">{SITE_CONFIG.secretaryName}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}

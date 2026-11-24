'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import type { ImpactSummary, MonthlyImpact } from '@/types/database';
import { formatDateId, formatNumber } from '@/utils/format';
import { Button } from '@/components/ui/Button';
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

  const handlePrint = () => {
    window.print();
  };

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
        <Button variant="primary" size="lg" onClick={handlePrint}>
          <Printer size={18} />
          <span>Cetak Laporan Bulanan (PDF / Print)</span>
        </Button>
      </div>

      <article className="print-report stack stack--lg">
        {/* Kop Laporan Resmi DLH / CSR */}
        <header className="print-report__kop">
          <span className="text-xs font-bold text-primary">
            LAPORAN TRANSPARANSI PENGOLAHAN SAMPAH ORGANIK & EKONOMI SIRKULAR
          </span>
          <h2>{SITE_CONFIG.organizationName}</h2>
          <p className="text-sm text-muted">
            {SITE_CONFIG.address} • {SITE_CONFIG.legalityNumber}
          </p>
          <p className="text-xs text-muted">
            Pembaruan Data Terakhir: {formatDateId(summary.lastUpdatedAt)} • Kontak:{' '}
            {SITE_CONFIG.phoneDisplay}
          </p>
        </header>

        <ImpactMetricsGrid
          summary={summary}
          periodLabel="Akumulasi Kinerja Pengolahan TPS 3R"
        />

        <Card>
          <CardBody>
            <ImpactTrendChart monthlyData={monthlyData} metric={metric} height={240} />
          </CardBody>
        </Card>

        <div className="stack stack--sm">
          <h3>Rekapitulasi Bulanan</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Sampah Masuk (kg)</th>
                  <th>Maggot BSF (kg)</th>
                  <th>Kompos (kg)</th>
                  <th>Kasgot (kg)</th>
                  <th>Reduksi CO2e (kg)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
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
                        <td>{formatNumber(row.maggotKg, 1)}</td>
                        <td>{formatNumber(row.compostKg, 1)}</td>
                        <td>{formatNumber(row.kasgotKg, 1)}</td>
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
            <div className="text-sm font-semibold">Sekretaris / Pencatat Data</div>
            <div className="print-report__sig-space" />
            <div className="font-bold">{SITE_CONFIG.secretaryName}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}

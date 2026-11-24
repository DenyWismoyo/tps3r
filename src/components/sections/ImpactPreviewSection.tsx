import Link from 'next/link';
import { FileBarChart2 } from 'lucide-react';
import type { ImpactSummary, MonthlyImpact } from '@/types/database';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { ImpactMetricsGrid } from '@/components/shared/ImpactMetricsGrid';
import { ImpactEquivalencyStrip } from '@/components/shared/ImpactEquivalencyStrip';
import { ImpactTrendChart } from '@/components/shared/ImpactTrendChart';

export interface ImpactPreviewSectionProps {
  summary: ImpactSummary;
  monthlyData: readonly MonthlyImpact[];
}

export function ImpactPreviewSection({
  summary,
  monthlyData,
}: ImpactPreviewSectionProps) {
  return (
    <section className="section">
      <Container>
        <SectionHeading
          eyebrow="Transparansi Dampak"
          title="Data Terbuka untuk Warga, DLH & Mitra CSR"
          subtitle="Pantau tren bulanan sampah organik yang berhasil dialihkan dari TPA serta produksi maggot dan pupuk organik secara transparan."
          actionSlot={
            <Link href="/dampak" className="btn btn--primary">
              <FileBarChart2 size={17} />
              <span>Buka Dashboard &amp; Cetak A4</span>
            </Link>
          }
        />

        <div className="stack stack--lg">
          <ImpactMetricsGrid
            summary={summary}
            periodLabel="Ringkasan Akumulasi Dampak Lingkungan"
          />
          <ImpactEquivalencyStrip summary={summary} />
          <Card>
            <CardBody>
              <ImpactTrendChart monthlyData={monthlyData} metric="waste" height={230} />
            </CardBody>
          </Card>
        </div>
      </Container>
    </section>
  );
}

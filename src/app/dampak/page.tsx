import type { Metadata } from 'next';
import { getImpactSummary, getMonthlyImpacts } from '@/services/impact.service';
import { getTopContributorsPublic } from '@/services/contributors.service';
import { Container } from '@/components/ui/Container';
import { PageBanner } from '@/components/layout/PageBanner';
import { ImpactEquivalencyStrip } from '@/components/shared/ImpactEquivalencyStrip';
import { PrintableImpactReport } from '@/components/shared/PrintableImpactReport';
import { TopContributorsBoard } from '@/components/shared/TopContributorsBoard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Transparansi Dampak & Laporan DLH/CSR',
  description:
    'Dashboard transparansi pengolahan sampah organik, panen maggot BSF, produksi kompos/kasgot, reduksi TPA Putri Cempo, dan cetak laporan A4.',
};

export default async function DampakPage() {
  const [summary, monthlyData, topContributors] = await Promise.all([
    getImpactSummary(),
    getMonthlyImpacts(12),
    getTopContributorsPublic(),
  ]);

  return (
    <main>
      <PageBanner
        title="Dashboard Transparansi Dampak Lingkungan"
        subtitle="Data agregat terbuka dari timbangan harian TPS 3R — dilengkapi export CSV (format DLH/SIPSN) dan cetak laporan bulanan A4 resmi."
        breadcrumb={['Beranda', 'Transparansi Dampak']}
      />
      <section className="section">
        <Container className="stack stack--lg">
          <ImpactEquivalencyStrip summary={summary} />
          <PrintableImpactReport summary={summary} monthlyData={monthlyData} />
          <div className="no-print">
            <TopContributorsBoard contributors={topContributors} />
          </div>
        </Container>
      </section>
    </main>
  );
}

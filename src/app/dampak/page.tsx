import type { Metadata } from 'next';
import { getImpactSummary, getMonthlyImpacts } from '@/services/impact.service';
import { Container } from '@/components/ui/Container';
import { PageBanner } from '@/components/layout/PageBanner';
import { PrintableImpactReport } from '@/components/shared/PrintableImpactReport';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Transparansi Dampak & Laporan DLH/CSR',
  description:
    'Dashboard transparansi pengolahan sampah organik, panen maggot BSF, produksi kompos/kasgot, reduksi emisi CO2e, dan cetak laporan bulanan A4.',
};

export default async function DampakPage() {
  const [summary, monthlyData] = await Promise.all([
    getImpactSummary(),
    getMonthlyImpacts(12),
  ]);

  return (
    <main>
      <PageBanner
        title="Dashboard Transparansi Dampak Lingkungan"
        subtitle="Data agregat terbuka dari timbangan harian TPS 3R — dilengkapi tombol cetak laporan bulanan resmi ukuran A4 untuk DLH, Dinas Pertanian, dan mitra CSR."
        breadcrumb={['Beranda', 'Transparansi Dampak']}
      />
      <section className="section">
        <Container>
          <PrintableImpactReport summary={summary} monthlyData={monthlyData} />
        </Container>
      </section>
    </main>
  );
}

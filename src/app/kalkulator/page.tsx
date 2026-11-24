import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageBanner } from '@/components/layout/PageBanner';
import { FertilizerCalculator } from '@/components/shared/FertilizerCalculator';

export const metadata: Metadata = {
  title: 'Kalkulator Takaran Pupuk & Maggot BSF',
  description:
    'Hitung kebutuhan Kompos, Kasgot, POC untuk lahan/polybag dan takaran pakan Maggot BSF untuk lele, nila, ayam, dan bebek.',
};

export default function KalkulatorPage() {
  return (
    <main>
      <PageBanner
        title="Kalkulator Takaran Pupuk & Pakan Maggot BSF"
        subtitle="Masukkan luas lahan, jumlah polybag, atau populasi ternak Anda untuk mendapatkan rekomendasi takaran presisi dan estimasi biaya."
        breadcrumb={['Beranda', 'Kalkulator Takaran']}
      />
      <section className="section">
        <Container>
          <FertilizerCalculator />
        </Container>
      </section>
    </main>
  );
}

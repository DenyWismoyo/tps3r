import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageBanner } from '@/components/layout/PageBanner';
import { WasteSortingGuide } from '@/components/shared/WasteSortingGuide';
import { PointsRewardCatalog } from '@/components/shared/PointsRewardCatalog';
import { WeeklyScheduleStrip } from '@/components/shared/WeeklyScheduleStrip';
import { FaqAccordion } from '@/components/shared/FaqAccordion';
import { KaliKlebenganStorySection } from '@/components/sections/KaliKlebenganStorySection';

export const metadata: Metadata = {
  title: 'Panduan Pilah Sampah, Tukar Poin & FAQ',
  description:
    'Panduan lengkap pemilahan sampah organik/anorganik, daftar hadiah tukar poin, jadwal panen, sejarah Kali Klebengan Kadipiro, dan FAQ.',
};

export default function PanduanPage() {
  return (
    <main>
      <PageBanner
        title="Panduan Pilah Sampah & Ekonomi Sirkular"
        subtitle="Pelajari jenis sampah yang boleh disetor ke TPS 3R Abdi Dalem Klebengan, daftar penukaran poin warga, jadwal panen, dan jawaban pertanyaan umum."
        breadcrumb={['Beranda', 'Panduan & FAQ']}
      />
      <section className="section">
        <Container>
          <SectionHeading
            eyebrow="Cek Sebelum Setor"
            title="Panduan Pemilahan: Boleh vs Jangan Dicampur"
            subtitle="Pemilahan dari rumah dan dapur warung menjaga maggot BSF tetap sehat dan bebas bau."
          />
          <WasteSortingGuide />
        </Container>
      </section>
      <section className="section section--warm">
        <Container>
          <SectionHeading
            eyebrow="Tabungan Poin Warga"
            title="Katalog Penukaran Poin Penyetor"
            subtitle="Setiap 1 kg sampah terpilah bernilai 10 poin — tukarkan dengan produk pilihan berikut."
          />
          <PointsRewardCatalog />
        </Container>
      </section>
      <section className="section">
        <Container>
          <SectionHeading
            eyebrow="Jadwal Rutin"
            title="Jadwal Panen & Layanan Mingguan"
          />
          <WeeklyScheduleStrip />
        </Container>
      </section>
      <KaliKlebenganStorySection showGuideCta={false} />
      <section className="section">
        <Container narrow>
          <SectionHeading
            eyebrow="Tanya Jawab"
            title="Pertanyaan yang Sering Diajukan (FAQ)"
            align="center"
          />
          <FaqAccordion />
        </Container>
      </section>
    </main>
  );
}

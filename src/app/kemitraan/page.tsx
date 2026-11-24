import type { Metadata } from 'next';
import { PARTNERSHIP_BENEFITS } from '@/config/packages';
import { getTopContributorsPublic } from '@/services/contributors.service';
import { Container } from '@/components/ui/Container';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageBanner } from '@/components/layout/PageBanner';
import { PartnershipForm } from '@/components/shared/PartnershipForm';
import { PointsLookupWidget } from '@/components/shared/PointsLookupWidget';
import { PointsRewardCatalog } from '@/components/shared/PointsRewardCatalog';
import { TopContributorsBoard } from '@/components/shared/TopContributorsBoard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Kemitraan Setor Sisa Makanan & Cek Poin',
  description:
    'Daftar sebagai mitra penyetor sampah organik (warung, restoran, warga) dan cek saldo poin tabungan sampah tanpa login.',
};

export default async function KemitraanPage() {
  const topContributors = await getTopContributorsPublic();

  return (
    <main>
      <PageBanner
        title="Kemitraan Penyetor & Tabungan Poin Sampah"
        subtitle="Ubah sisa makanan dapur usaha maupun rumah tangga menjadi poin yang bisa ditukar kompos, kasgot, POC, dan sayur organik tayurdapot."
        breadcrumb={['Beranda', 'Kemitraan & Poin']}
      />
      <section className="section section--tinted">
        <Container>
          <h2 className="sr-only">Manfaat Kemitraan Penyetor</h2>
          <div className="grid-3">
            {PARTNERSHIP_BENEFITS.map((item) => (
              <Card key={item.title}>
                <CardBody className="stack stack--xs">
                  <h3>{item.title}</h3>
                  <p className="text-sm text-muted">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>
      <section className="section" id="cek-poin">
        <Container>
          <div className="split-aside">
            <PartnershipForm />
            <div className="stack">
              <PointsLookupWidget />
              <TopContributorsBoard contributors={topContributors} />
            </div>
          </div>
        </Container>
      </section>
      <section className="section section--warm">
        <Container>
          <SectionHeading
            eyebrow="Tukar Poin Anda"
            title="Daftar Produk Penukaran Poin"
            subtitle="Kumpulkan 10 poin setiap 1 kg sampah terpilah dan tukarkan langsung di TPS 3R Abdi Dalem Klebengan."
          />
          <PointsRewardCatalog />
        </Container>
      </section>
    </main>
  );
}

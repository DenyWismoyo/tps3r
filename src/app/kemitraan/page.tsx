import type { Metadata } from 'next';
import { PARTNERSHIP_BENEFITS } from '@/config/packages';
import { Container } from '@/components/ui/Container';
import { Card, CardBody } from '@/components/ui/Card';
import { PageBanner } from '@/components/layout/PageBanner';
import { PartnershipForm } from '@/components/shared/PartnershipForm';
import { PointsLookupWidget } from '@/components/shared/PointsLookupWidget';

export const metadata: Metadata = {
  title: 'Kemitraan Setor Sisa Makanan & Cek Poin',
  description:
    'Daftar sebagai mitra penyetor sampah organik (warung, restoran, warga) dan cek saldo poin tabungan sampah tanpa login.',
};

export default function KemitraanPage() {
  return (
    <main>
      <PageBanner
        title="Kemitraan Penyetor & Tabungan Poin Sampah"
        subtitle="Ubah sisa makanan dapur usaha maupun rumah tangga menjadi poin yang bisa ditukar kompos, kasgot, POC, dan sayur organik."
        breadcrumb={['Beranda', 'Kemitraan & Poin']}
      />
      <section className="section section--tinted">
        <Container>
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
            <PointsLookupWidget />
          </div>
        </Container>
      </section>
    </main>
  );
}

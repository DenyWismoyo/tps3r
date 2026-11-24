import type { Metadata } from 'next';
import { CheckCircle2, Clock } from 'lucide-react';
import { EDUWISATA_PACKAGES } from '@/config/packages';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageBanner } from '@/components/layout/PageBanner';
import { EduBookingForm } from '@/components/shared/EduBookingForm';

export const metadata: Metadata = {
  title: 'Eduwisata, Studi Banding & Pelatihan Maggot BSF',
  description:
    'Booking kunjungan sekolah, studi banding Pemda/DLH/Desa/CSR, dan pelatihan teknis budidaya maggot BSF & kompos.',
};

export default async function EduwisataPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const { paket } = await searchParams;

  return (
    <main>
      <PageBanner
        title="Eduwisata, Studi Banding & Pelatihan Lapangan"
        subtitle="Pelajari langsung model ekonomi sirkular TPS 3R bersama pengurus Kelompok Tani."
        breadcrumb={['Beranda', 'Eduwisata']}
      />
      <section className="section section--warm">
        <Container>
          <SectionHeading
            eyebrow="Pilihan Program"
            title="Paket Kunjungan & Pelatihan Tersedia"
          />
          <div className="grid-3">
            {EDUWISATA_PACKAGES.map((pkg) => (
              <Card key={pkg.id}>
                <CardBody className="stack stack--sm">
                  <div className="cluster cluster--between">
                    {pkg.badge ? <Badge tone="organic">{pkg.badge}</Badge> : null}
                    <span className="text-xs text-muted cluster">
                      <Clock size={14} /> {pkg.duration}
                    </span>
                  </div>
                  <h3>{pkg.name}</h3>
                  <p className="text-xs text-muted">
                    Sasaran: {pkg.audience} • {pkg.minParticipants}–{pkg.maxParticipants} peserta
                  </p>
                  <div className="package-card__price">{pkg.priceLabel}</div>
                  <p className="text-sm text-muted">{pkg.summary}</p>
                  <ul className="package-card__list">
                    {pkg.facilities.map((fac) => (
                      <li key={fac} className="package-card__list-item">
                        <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                        <span>{fac}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>
      <section className="section">
        <Container narrow>
          <EduBookingForm preselectedPackageId={paket} />
        </Container>
      </section>
    </main>
  );
}

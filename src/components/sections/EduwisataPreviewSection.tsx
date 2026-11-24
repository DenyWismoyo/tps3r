import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { EDUWISATA_PACKAGES } from '@/config/packages';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';

export function EduwisataPreviewSection() {
  return (
    <section className="section section--warm">
      <Container>
        <SectionHeading
          eyebrow="Eduwisata & Studi Banding"
          title="Belajar Langsung Ekonomi Sirkular di Lokasi TPS 3R"
          subtitle="Melayani kunjungan sekolah, studi banding pemerintah desa/DLH/kampus, hingga pelatihan intensif budidaya maggot BSF & kompos."
          actionSlot={
            <Link href="/eduwisata" className="btn btn--primary">
              <CalendarDays size={17} />
              <span>Booking Jadwal Kunjungan</span>
            </Link>
          }
        />

        <div className="grid-3">
          {EDUWISATA_PACKAGES.map((pkg) => (
            <Card key={pkg.id} interactive>
              <CardBody className="stack stack--sm">
                <div className="cluster cluster--between">
                  {pkg.badge ? <Badge tone="organic">{pkg.badge}</Badge> : null}
                  <span className="text-xs text-muted cluster">
                    <Clock size={14} /> {pkg.duration}
                  </span>
                </div>
                <h3>{pkg.name}</h3>
                <p className="text-sm text-muted">{pkg.summary}</p>
                <div className="package-card__price">{pkg.priceLabel}</div>
                <ul className="package-card__list">
                  {pkg.facilities.slice(0, 3).map((item) => (
                    <li key={item} className="package-card__list-item">
                      <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter>
                <Link
                  href={`/eduwisata?paket=${pkg.id}`}
                  className="btn btn--outline btn--block"
                >
                  Pilih Paket Ini
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

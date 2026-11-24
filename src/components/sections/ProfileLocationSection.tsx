import { Clock, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card, CardBody } from '@/components/ui/Card';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';

export function ProfileLocationSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeading
          eyebrow="Profil & Lokasi"
          title={`Kunjungi ${SITE_CONFIG.shortName}`}
          subtitle="Terbuka untuk pengambilan produk langsung, penyetoran sampah organik terpilah, dan konsultasi kemitraan."
        />

        <div className="split-aside">
          <Card elevated>
            <CardBody className="stack">
              <h3>{SITE_CONFIG.organizationName}</h3>
              <p className="text-sm text-muted">{SITE_CONFIG.description}</p>

              <div className="stack stack--sm">
                <div className="product-gallery__spec-item">
                  <MapPin size={18} className="text-primary" aria-hidden="true" />
                  <span>{SITE_CONFIG.address}</span>
                </div>
                <div className="product-gallery__spec-item">
                  <Clock size={18} className="text-primary" aria-hidden="true" />
                  <span>{SITE_CONFIG.operatingHours}</span>
                </div>
                <div className="product-gallery__spec-item">
                  <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
                  <span>{SITE_CONFIG.legalityNumber}</span>
                </div>
              </div>

              <div className="grid-2">
                <WhatsAppButton
                  message={`Halo ${SITE_CONFIG.shortName}, saya ingin mengunjungi lokasi TPS 3R.`}
                  label="Hubungi Pengurus WA"
                  block
                />
                <a
                  href={SITE_CONFIG.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--block"
                >
                  <ExternalLink size={16} />
                  <span>Petunjuk Arah Peta</span>
                </a>
              </div>
            </CardBody>
          </Card>

          <iframe
            title={`Peta lokasi ${SITE_CONFIG.organizationName}`}
            src={SITE_CONFIG.mapEmbedUrl}
            className="map-frame"
            loading="lazy"
          />
        </div>
      </Container>
    </section>
  );
}

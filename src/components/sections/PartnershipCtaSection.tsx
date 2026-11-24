import Link from 'next/link';
import { Award, Handshake } from 'lucide-react';
import { PARTNERSHIP_BENEFITS } from '@/config/packages';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function PartnershipCtaSection() {
  return (
    <section className="section section--dark">
      <Container>
        <SectionHeading
          eyebrow="Kemitraan & Tabungan Poin"
          title="Punya Warung Makan, Restoran, atau Sisa Dapur Rumah Tangga?"
          subtitle="Jangan buang sisa makanan ke TPA. Gabung sebagai mitra penyetor TPS 3R, kumpulkan 10 poin setiap 1 kg organik terpilah, dan tukarkan dengan pupuk atau sayur segar."
        />

        <div className="grid-3">
          {PARTNERSHIP_BENEFITS.map((benefit) => (
            <div key={benefit.title} className="card">
              <div className="card__body stack stack--xs">
                <h3>{benefit.title}</h3>
                <p className="text-sm text-muted">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cluster section--compact">
          <Link href="/kemitraan" className="btn btn--accent btn--lg">
            <Handshake size={18} />
            <span>Daftar Mitra Setor Sisa Makanan</span>
          </Link>
          <Link href="/kemitraan#cek-poin" className="btn btn--outline btn--lg">
            <Award size={18} />
            <span>Cek Saldo Poin Penyetor</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

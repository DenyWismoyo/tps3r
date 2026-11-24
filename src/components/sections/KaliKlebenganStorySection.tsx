import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { KALI_KLEBENGAN_TIMELINE } from '@/config/education';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export interface KaliKlebenganStorySectionProps {
  showGuideCta?: boolean;
}

export function KaliKlebenganStorySection({
  showGuideCta = true,
}: KaliKlebenganStorySectionProps) {
  return (
    <section className="section section--tinted">
      <Container>
        <SectionHeading
          eyebrow="Jejak Gerakan Warga Kadipiro"
          title="Transformasi Kali Klebengan Menuju Ekonomi Sirkular"
          subtitle="Berawal dari kepedulian warga RW 17 Kampung Ngipang terhadap pencemaran sungai hingga menjadi Kampung Iklim & pusat pengolahan sampah organik Kota Surakarta."
          actionSlot={
            showGuideCta ? (
              <Link href="/panduan" className="btn btn--outline">
                <BookOpen size={17} />
                <span>Baca Panduan Pilah &amp; FAQ</span>
              </Link>
            ) : undefined
          }
        />

        <div className="timeline-grid">
          {KALI_KLEBENGAN_TIMELINE.map((step) => (
            <article key={step.era} className="timeline-step">
              <span className="timeline-step__era">{step.era}</span>
              <h3>{step.title}</h3>
              <p className="text-sm text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

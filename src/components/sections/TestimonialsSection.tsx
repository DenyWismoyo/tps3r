import { Quote } from 'lucide-react';
import { PUBLIC_TESTIMONIALS } from '@/config/education';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';

export function TestimonialsSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeading
          eyebrow="Suara Warga & Pelanggan"
          title="Manfaat Nyata di Sekitar Kadipiro & Solo Raya"
          subtitle="Pengalaman langsung peternak lele, pemilik warung mitra penyetor, dan kader kebun rumah tangga RW 17."
          align="center"
        />

        <div className="grid-3">
          {PUBLIC_TESTIMONIALS.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="cluster cluster--between">
                <Quote size={22} className="text-primary" aria-hidden="true" />
                <Badge tone="organic">{item.highlight}</Badge>
              </div>
              <p className="testimonial-card__quote">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <div className="font-bold text-sm text-primary">{item.name}</div>
                <div className="text-xs text-muted">{item.role}</div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

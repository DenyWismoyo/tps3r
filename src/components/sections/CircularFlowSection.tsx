import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CircularFlowDiagram } from '@/components/shared/CircularFlowDiagram';

export function CircularFlowSection() {
  return (
    <section className="section">
      <Container>
        <SectionHeading
          eyebrow="Cara Kerja Sirkular"
          title="Bagaimana Sampah Organik Kembali Menyuburkan Desa"
          subtitle="Empat tahapan terintegrasi dari pemilahan sisa makanan hingga kembali menjadi pakan ternak, pupuk kebun, dan penghasilan warga."
          align="center"
        />
        <CircularFlowDiagram />
      </Container>
    </section>
  );
}

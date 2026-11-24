import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, Sprout } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import type { ImpactSummary } from '@/types/database';
import { Container } from '@/components/ui/Container';
import { ImpactMetricsGrid } from '@/components/shared/ImpactMetricsGrid';

export interface HeroSectionProps {
  summary: ImpactSummary;
}

export function HeroSection({ summary }: HeroSectionProps) {
  return (
    <section className="hero">
      <Container>
        <div className="split-hero">
          <div className="stack">
            <span className="hero__eyebrow">
              <Sprout size={15} aria-hidden="true" />
              <span>{SITE_CONFIG.organizationName}</span>
            </span>

            <h1>Ubah Sampah Organik Jadi Maggot BSF, Kasgot &amp; Pupuk Subur</h1>

            <p className="hero__lead">
              Ekosistem ekonomi sirkular desa yang mengolah sisa makanan dan sampah kebun
              menjadi pakan ternak berprotein tinggi serta pupuk organik berkualitas — transparan,
              mudah dipesan lewat WhatsApp, dan ramah lingkungan.
            </p>

            <div className="cluster">
              <Link href="/katalog" className="btn btn--primary btn--lg">
                <span>Lihat Katalog &amp; Stok Live</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/kalkulator" className="btn btn--outline btn--lg">
                <Calculator size={18} />
                <span>Hitung Takaran Pupuk/Maggot</span>
              </Link>
            </div>

            <div className="hero__highlights">
              <span className="hero__highlight-item">
                <CheckCircle2 size={16} /> Pesan WA tanpa login
              </span>
              <span className="hero__highlight-item">
                <CheckCircle2 size={16} /> Tabungan poin warga &amp; warung
              </span>
              <span className="hero__highlight-item">
                <CheckCircle2 size={16} /> Laporan siap cetak DLH/CSR
              </span>
            </div>
          </div>

          <div className="card card--elevated card--tinted">
            <div className="card__body stack stack--sm">
              <span className="badge badge--organic">Dampak Real-Time TPS 3R</span>
              <h3>Kinerja Ekonomi Sirkular Kami</h3>
              <p className="text-sm text-muted">
                Seluruh angka diperbarui langsung dari catatan timbangan harian pengurus di
                lapangan.
              </p>
              <ImpactMetricsGrid summary={summary} layout="grid-2x2" compact />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import type { Metadata } from 'next';
import { getActiveProducts } from '@/services/products.service';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageBanner } from '@/components/layout/PageBanner';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { WeeklyScheduleStrip } from '@/components/shared/WeeklyScheduleStrip';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Katalog Produk & Stok Live',
  description:
    'Pesan Maggot BSF segar/kering, Kasgot, Pupuk Kompos, POC, dan sayur tayurdapot Kali Klebengan langsung via WhatsApp.',
};

export default async function KatalogPage() {
  const products = await getActiveProducts();

  return (
    <main>
      <PageBanner
        title="Katalog Produk TPS 3R"
        subtitle="Pantau stok live harian, tambahkan beberapa item ke keranjang, dan kirim pesanan dalam satu klik WhatsApp tanpa perlu membuat akun."
        breadcrumb={['Beranda', 'Katalog Produk']}
      />
      <section className="section">
        <Container>
          <ProductGrid products={products} />
        </Container>
      </section>
      <section className="section section--tinted">
        <Container>
          <SectionHeading
            eyebrow="Info Pengambilan & Panen"
            title="Jadwal Panen & Operasional Mingguan"
          />
          <WeeklyScheduleStrip />
        </Container>
      </section>
    </main>
  );
}

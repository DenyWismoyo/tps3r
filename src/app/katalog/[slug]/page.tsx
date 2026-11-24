import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/services/products.service';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageBanner } from '@/components/layout/PageBanner';
import { ProductGallery } from '@/components/shared/ProductGallery';
import { FertilizerCalculator } from '@/components/shared/FertilizerCalculator';
import { ProductCard } from '@/components/shared/ProductCard';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Produk Tidak Ditemukan' };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id, 3);

  return (
    <main>
      <PageBanner title={product.name} breadcrumb={['Beranda', 'Katalog', product.name]} />
      <section className="section">
        <Container>
          <ProductGallery product={product} />
        </Container>
      </section>
      <section className="section section--tinted">
        <Container>
          <SectionHeading
            eyebrow="Bantu Hitung"
            title="Hitung Kebutuhan Lahan atau Ternak Anda"
            subtitle="Gunakan kalkulator cepat berikut agar pembelian pupuk atau maggot BSF sesuai kebutuhan."
          />
          <FertilizerCalculator preselectedProductSlug={product.slug} />
        </Container>
      </section>
      <section className="section">
        <Container>
          <SectionHeading eyebrow="Produk Lainnya" title="Produk Turunan Terkait" />
          <div className="grid-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} variant="compact" />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

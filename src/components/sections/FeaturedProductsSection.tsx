import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/database';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductCard } from '@/components/shared/ProductCard';

export interface FeaturedProductsSectionProps {
  products: readonly Product[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="section section--tinted">
      <Container>
        <SectionHeading
          eyebrow="Produk Turunan TPS 3R"
          title="Stok Live Maggot BSF, Kasgot, Kompos & POC"
          subtitle="Dipanen dan difermentasi langsung di lokasi Kelompok Tani. Tambahkan ke keranjang atau pesan langsung via WhatsApp tanpa buat akun."
          actionSlot={
            <Link href="/katalog" className="btn btn--outline">
              <span>Semua Produk</span>
              <ArrowRight size={16} />
            </Link>
          }
        />

        <div className="grid-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="full" />
          ))}
        </div>
      </Container>
    </section>
  );
}

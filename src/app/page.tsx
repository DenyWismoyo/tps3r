import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site';
import { getFeaturedProducts } from '@/services/products.service';
import { getImpactSummary, getMonthlyImpacts } from '@/services/impact.service';
import { HeroSection } from '@/components/sections/HeroSection';
import { CircularFlowSection } from '@/components/sections/CircularFlowSection';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';
import { ImpactPreviewSection } from '@/components/sections/ImpactPreviewSection';
import { KaliKlebenganStorySection } from '@/components/sections/KaliKlebenganStorySection';
import { PartnershipCtaSection } from '@/components/sections/PartnershipCtaSection';
import { EduwisataPreviewSection } from '@/components/sections/EduwisataPreviewSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ProfileLocationSection } from '@/components/sections/ProfileLocationSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `${SITE_CONFIG.organizationName} | Ekonomi Sirkular & Maggot BSF`,
  description: SITE_CONFIG.description,
};

export default async function HomePage() {
  const [summary, monthlyData, featuredProducts] = await Promise.all([
    getImpactSummary(),
    getMonthlyImpacts(6),
    getFeaturedProducts(6),
  ]);

  return (
    <main>
      <HeroSection summary={summary} />
      <CircularFlowSection />
      <FeaturedProductsSection products={featuredProducts} />
      <ImpactPreviewSection summary={summary} monthlyData={monthlyData} />
      <KaliKlebenganStorySection />
      <PartnershipCtaSection />
      <EduwisataPreviewSection />
      <TestimonialsSection />
      <ProfileLocationSection />
    </main>
  );
}

import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { SoftwarePreviewSection } from "@/components/home/SoftwarePreviewSection";
import { CoverageSection } from "@/components/home/CoverageSection";
import { CTASection } from "@/components/home/CTASection";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import { SEO } from "@/components/seo/SEO";

const Index = () => {
  return (
    <Layout>
      <SEO
        title="SistecPOS | Software POS #1 en Colombia con Soporte Presencial"
        description="Software punto de venta con facturación electrónica DIAN, inventario y soporte presencial en Bucaramanga y toda Colombia. Prueba gratis hoy."
        canonical="https://sistecpos.com"
      />
      <JsonLd data={organizationSchema()} />
      <HeroSection />
      <SoftwarePreviewSection />
      <ComparisonSection />
      <WhyUsSection />
      <FeaturesSection />
      <SolutionsSection />
      <CoverageSection />
      <CTASection />
    </Layout>
  );
};

export default Index;

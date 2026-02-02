import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { SoftwarePreviewSection } from "@/components/home/SoftwarePreviewSection";
import { CoverageSection } from "@/components/home/CoverageSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
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

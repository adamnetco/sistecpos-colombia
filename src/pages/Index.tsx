import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { SocialProofBar } from "@/components/home/SocialProofBar";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { SolutionsSection } from "@/components/home/SolutionsSection";
import { SoftwarePreviewSection } from "@/components/home/SoftwarePreviewSection";
import { CoverageSection } from "@/components/home/CoverageSection";
import { LocalTrustSection } from "@/components/home/LocalTrustSection";
import { CTASection } from "@/components/home/CTASection";
import { ConnectPOSSection } from "@/components/home/ConnectPOSSection";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import { SEO } from "@/components/seo/SEO";

const Index = () => {
  // Interceptor de activación de licencia. El correo de bienvenida llega como
  //   https://sistecpos.com/?user=admin&store=xxx&language=spanish
  // (no incluye la clave por seguridad). Redirigimos al portal de clientes con
  // el formulario POS prellenado para que el usuario solo digite su contraseña;
  // el POST final se hará contra sistecpos.online desde ClientPOSAccess.
  const [params] = useSearchParams();
  const activationUser = params.get("user");
  const activationStore = params.get("store");
  if (activationUser && activationStore) {
    const q = new URLSearchParams({
      pos_user: activationUser,
      pos_store: activationStore,
      activation: "1",
    });
    const lang = params.get("language");
    if (lang) q.set("pos_language", lang);
    return <Navigate to={`/clientes?${q.toString()}#pos`} replace />;
  }
  return (
    <Layout>
      <SEO
        title="SistecPOS | Software POS y Facturación Electrónica en Colombia"
        description="Software punto de venta con facturación electrónica DIAN, inventario y soporte presencial en Santander. Prueba gratis 7 días."
        canonical="https://sistecpos.com"
      />
      <JsonLd data={organizationSchema()} />
      <HeroSection />
      <SocialProofBar />
      <SoftwarePreviewSection />
      <ComparisonSection />
      <WhyUsSection />
      <FeaturesSection />
      <SuccessStoriesSection />
      <LocalTrustSection />
      <SolutionsSection />
      <CoverageSection />
      <ConnectPOSSection />
      <CTASection />
    </Layout>
  );
};

export default Index;

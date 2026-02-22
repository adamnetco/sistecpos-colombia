import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { DynamicPricingSection } from "@/components/pricing/DynamicPricingSection";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, Zap, CheckCircle2 } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const benefits = [
  "Sin cláusula de permanencia",
  "Soporte en español 100%",
  "Modo offline hasta 8 días",
  "16+ módulos especializados",
  "Facturación electrónica DIAN",
  "Actualizaciones automáticas incluidas",
];

export default function LicenciasPage() {
  const { buildUrl } = useWhatsAppConfig();

  return (
    <Layout>
      <DynamicMeta
        title="Licencias Software POS Colombia — Precios 2026 | SistecPOS"
        description="Conoce las licencias de software POS de SistecPOS: Emprendedor, Negocio, Empresarial y Vitalicia. Precios transparentes con descuento exclusivo."
        canonical="https://sistecpos.com/licencias"
      />
      <Breadcrumbs items={[{ label: "Licencias" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Shield className="h-3 w-3 mr-1" /> Precios 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Licencias de Software POS para Colombia
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Elige la licencia que se adapta a tu negocio. Desde tiendas pequeñas hasta cadenas con múltiples sedes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-1.5 text-sm text-primary-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <DynamicPricingSection />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿No sabes cuál elegir?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Te asesoramos gratis por WhatsApp para que elijas la licencia perfecta para tu negocio.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href={buildUrl("Hola, necesito asesoría para elegir mi licencia POS")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Asesoría Gratuita
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

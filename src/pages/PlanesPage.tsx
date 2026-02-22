import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useSupportPlans } from "@/hooks/useSupportPlans";
import { formatCOP } from "@/hooks/useLicensePricing";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Headphones, CheckCircle2, Star } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export default function PlanesPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: plans = [], isLoading } = useSupportPlans();

  return (
    <Layout>
      <DynamicMeta
        title="Planes de Soporte POS — Mantenimiento y Consultoría | SistecPOS"
        description="Elige tu plan de soporte mensual: Autogestión, Tranquilidad o Socio Estratégico. Mantenimiento y consultoría para tu software POS en Colombia."
        canonical="https://sistecpos.com/planes"
      />
      <Breadcrumbs items={[{ label: "Planes de Soporte" }]} />

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
              <Headphones className="h-3 w-3 mr-1" /> Soporte Mensual
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Planes de Soporte y Mantenimiento
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Tu negocio nunca se detiene. Elige el nivel de acompañamiento que necesitas:
              desde autogestión hasta consultoría estratégica personalizada.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Los planes de soporte estarán disponibles próximamente.</p>
              <Button className="mt-4 gap-2" asChild>
                <a href={buildUrl("Hola, quiero información sobre los planes de soporte")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className={`h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${plan.is_popular ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}>
                    {plan.is_popular && (
                      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                        <Star className="inline h-3 w-3 mr-1" /> Recomendado
                      </div>
                    )}
                    <CardContent className={`p-6 ${plan.is_popular ? "pt-10" : ""}`}>
                      <h3 className="text-xl font-bold mb-1 text-center">{plan.plan_label || plan.plan}</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center">{plan.plan_description}</p>

                      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-black text-primary">{formatCOP(plan.price_cop)}</span>
                          <span className="text-sm text-muted-foreground">/mes</span>
                        </div>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        className="w-full mt-6 gap-2"
                        variant={plan.is_popular ? "default" : "outline"}
                        size="lg"
                        asChild
                      >
                        <a
                          href={buildUrl(plan.cta_whatsapp_message || `Hola, quiero el plan de soporte ${plan.plan_label}`)}
                          target="_blank" rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Contratar
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas un plan personalizado?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Diseñamos planes a la medida para empresas con necesidades especiales.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href={buildUrl("Hola, necesito un plan de soporte personalizado")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Hablar con Ventas
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCommercialPacks } from "@/hooks/useCommercialPacks";
import { useLicensePricing, formatCOP } from "@/hooks/useLicensePricing";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle, Package, CheckCircle2, Star, TrendingDown, Shield, Wrench, Headphones,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export default function PacksPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: packs = [], isLoading } = useCommercialPacks();
  const { data: licenses = [] } = useLicensePricing();

  const getLicense = (id: string | null) => licenses.find((l) => l.id === id);

  return (
    <Layout>
      <DynamicMeta
        title="Packs POS Todo Incluido — Licencia + Implementación + Soporte | SistecPOS"
        description="Packs completos para tu negocio: licencia POS, módulos, implementación presencial y meses de soporte. Todo en un solo pago con descuento."
        canonical="https://sistecpos.com/packs"
      />
      <Breadcrumbs items={[{ label: "Packs" }]} />

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
              <Package className="h-3 w-3 mr-1" /> Packs 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Packs Todo Incluido para tu Negocio
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Licencia + Módulos + Implementación + Soporte en un solo paquete con precio preferencial.
              Empieza a facturar desde el día 1.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packs Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-2">Los packs estarán disponibles próximamente.</p>
              <p className="text-sm text-muted-foreground mb-4">Mientras tanto, puedes armar tu combo ideal con asesoría personalizada.</p>
              <Button className="gap-2" asChild>
                <a href={buildUrl("Hola, quiero armar un pack personalizado")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Armar mi Pack
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {packs.map((pack, index) => {
                const license = getLicense(pack.license_pricing_id);
                const savingsPct = pack.original_price_cop && pack.original_price_cop > 0
                  ? Math.round(((pack.original_price_cop - pack.price_cop) / pack.original_price_cop) * 100)
                  : 0;

                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${pack.is_popular ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}>
                      {pack.is_popular && (
                        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                          <Star className="inline h-3 w-3 mr-1" /> Más Vendido
                        </div>
                      )}
                      {pack.badge && !pack.is_popular && (
                        <div className="absolute top-0 left-0 right-0 bg-cta text-cta-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                          {pack.badge}
                        </div>
                      )}
                      <CardContent className={`p-6 ${pack.is_popular || pack.badge ? "pt-10" : ""}`}>
                        <h3 className="text-xl font-bold mb-1 text-center">{pack.name}</h3>
                        {pack.tagline && <p className="text-xs text-center text-muted-foreground mb-1">{pack.tagline}</p>}
                        <p className="text-sm text-muted-foreground mb-4 text-center">{pack.description}</p>

                        {/* Price */}
                        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                          {pack.original_price_cop && pack.original_price_cop > pack.price_cop && (
                            <p className="text-xs text-muted-foreground line-through mb-1">
                              {formatCOP(pack.original_price_cop)}
                            </p>
                          )}
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-black text-primary">{formatCOP(pack.price_cop)}</span>
                          </div>
                          {savingsPct > 0 && (
                            <Badge variant="destructive" className="gap-1 mt-2">
                              <TrendingDown className="h-3 w-3" /> Ahorras {savingsPct}%
                            </Badge>
                          )}
                        </div>

                        {/* Includes */}
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Incluido</p>
                          {license && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="h-4 w-4 text-primary shrink-0" />
                              <span>Licencia <strong>{license.plan_label}</strong></span>
                            </div>
                          )}
                          {pack.implementation_included && (
                            <div className="flex items-center gap-2 text-sm">
                              <Wrench className="h-4 w-4 text-primary shrink-0" />
                              <span>Implementación presencial</span>
                            </div>
                          )}
                          {pack.support_months_included > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Headphones className="h-4 w-4 text-primary shrink-0" />
                              <span><strong>{pack.support_months_included}</strong> meses de soporte incluidos</span>
                            </div>
                          )}
                          {pack.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full mt-6 gap-2"
                          variant={pack.is_popular ? "default" : "outline"}
                          size="lg"
                          asChild
                        >
                          <a
                            href={buildUrl(pack.cta_whatsapp_message || `Hola, quiero el pack ${pack.name}`)}
                            target="_blank" rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Cotizar Pack
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas un pack a la medida?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Armamos combos personalizados según tu tipo de negocio, cantidad de sedes y presupuesto.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href={buildUrl("Hola, quiero un pack personalizado para mi negocio")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Armar Mi Pack
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

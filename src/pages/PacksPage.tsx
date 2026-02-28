import { Link } from "react-router-dom";
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
  MessageCircle, Package, CheckCircle2, Star, TrendingDown, Shield,
  Wrench, Headphones, ArrowRight, Zap, Clock, Users,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const urgencyReasons = [
  { icon: Clock, text: "Implementamos en tu local en menos de 48 horas" },
  { icon: Zap, text: "Empieza a facturar el mismo día de la instalación" },
  { icon: Users, text: "Capacitamos a todo tu equipo sin costo adicional" },
];

export default function PacksPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: packs = [], isLoading } = useCommercialPacks();
  const { data: licenses = [] } = useLicensePricing();

  const getLicense = (id: string | null) => licenses.find(l => l.id === id);

  return (
    <Layout>
      <DynamicMeta
        title="Packs POS Todo Incluido — Licencia + Implementación + Soporte | SistecPOS"
        description="Packs completos: licencia POS, módulos, implementación presencial y meses de soporte. Todo en un solo pago con descuento de hasta 30%."
        canonical="https://sistecpos.com/packs"
      />
      <Breadcrumbs items={[{ label: "Packs" }]} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="container px-4 relative text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Package className="h-3 w-3 mr-1" /> La opción más inteligente
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Packs Todo Incluido:<br className="hidden md:block" /> Arranca sin complicaciones
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Licencia + Módulos + Implementación presencial + Soporte técnico.
              <strong> Un solo pago, cero sorpresas.</strong>
            </p>
            {/* Social proof */}
            <div className="flex flex-wrap justify-center gap-6">
              {urgencyReasons.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                  <r.icon className="h-4 w-4 text-whatsapp" />
                  {r.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Savings Banner */}
      <section className="py-6 bg-cta text-cta-foreground">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <TrendingDown className="h-5 w-5" />
            <p className="font-semibold">
              Ahorra hasta un 30% comparado con comprar licencia, implementación y soporte por separado
            </p>
          </div>
        </div>
      </section>

      {/* Packs Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Elige tu Pack ideal</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Cada pack está diseñado para un tipo de negocio específico. Todos incluyen instalación en tu local.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
          ) : packs.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">Los packs estarán disponibles próximamente.</p>
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
                    <Card className={`h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                      pack.is_popular ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]" : ""
                    }`}>
                      {pack.is_popular && (
                        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-xs font-bold uppercase tracking-wider">
                          <Star className="inline h-3 w-3 mr-1" /> Más Vendido
                        </div>
                      )}
                      {pack.badge && !pack.is_popular && (
                        <div className="absolute top-0 left-0 right-0 bg-cta text-cta-foreground text-center py-2 text-xs font-bold uppercase tracking-wider">
                          {pack.badge}
                        </div>
                      )}
                      <CardContent className={`p-6 ${pack.is_popular || pack.badge ? "pt-12" : ""}`}>
                        <h3 className="text-xl font-bold mb-1 text-center">{pack.name}</h3>
                        {pack.tagline && <p className="text-xs text-center text-muted-foreground mb-1">{pack.tagline}</p>}
                        <p className="text-sm text-muted-foreground mb-5 text-center">{pack.description}</p>

                        {/* Price Block */}
                        <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 mb-5 text-center">
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
                          {pack.original_price_cop && pack.original_price_cop > pack.price_cop && (
                            <p className="text-xs text-whatsapp font-semibold mt-2">
                              Te ahorras {formatCOP(pack.original_price_cop - pack.price_cop)}
                            </p>
                          )}
                        </div>

                        {/* What's included */}
                        <div className="space-y-2.5 border-t pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            ✅ Todo incluido
                          </p>
                          {license && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="h-4 w-4 text-primary shrink-0" />
                              <span>Licencia <strong>{license.plan_label}</strong> (anual)</span>
                            </div>
                          )}
                          {pack.implementation_included && (
                            <div className="flex items-center gap-2 text-sm">
                              <Wrench className="h-4 w-4 text-primary shrink-0" />
                              <span>Implementación <strong>presencial</strong> en tu local</span>
                            </div>
                          )}
                          {pack.support_months_included > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Headphones className="h-4 w-4 text-primary shrink-0" />
                              <span><strong>{pack.support_months_included} meses</strong> de soporte incluidos</span>
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
                            href={buildUrl(pack.cta_whatsapp_message || `Hola, quiero el pack ${pack.name} (${formatCOP(pack.price_cop)})`)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" /> Cotizar Pack
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

      {/* Comparison: Pack vs Separate */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Pack vs Comprar por Separado
            </h2>
            <Card className="overflow-hidden border-0 shadow-card">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">Concepto</th>
                      <th className="p-4 text-center font-medium text-primary">
                        <div className="flex flex-col items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span>Con Pack</span>
                        </div>
                      </th>
                      <th className="p-4 text-center font-medium text-muted-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>Por separado</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Licencia anual", true, true],
                      ["Implementación presencial", true, "Pago extra"],
                      ["Soporte técnico incluido", true, "Pago mensual"],
                      ["Capacitación a tu equipo", true, "Pago extra"],
                      ["Módulos seleccionados", true, "Pago individual"],
                      ["Ahorro total", "Hasta 30%", "0%"],
                      ["Un solo pago simplificado", true, false],
                    ].map(([label, pack, separate]) => (
                      <tr key={label as string} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3">{label as string}</td>
                        <td className="p-3 text-center">
                          {pack === true ? (
                            <CheckCircle2 className="h-4 w-4 text-whatsapp mx-auto" />
                          ) : (
                            <span className="text-xs font-semibold text-primary">{pack as string}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {separate === true ? (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : separate === false ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{separate as string}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas un pack a la medida?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Armamos combos personalizados según tu tipo de negocio, cantidad de sedes y presupuesto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a href={buildUrl("Hola, quiero un pack personalizado para mi negocio")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Armar Mi Pack
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/licencias">
                <Shield className="h-5 w-5" /> Solo necesito la licencia
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

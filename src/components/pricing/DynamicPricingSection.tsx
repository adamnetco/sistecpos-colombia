import { useLicensePricing, formatCOP, monthlyPrice, discountPct } from "@/hooks/useLicensePricing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CouponBanner } from "@/components/pricing/CouponBanner";
import {
  MessageCircle,
  Shield,
  Wrench,
  Headphones,
  TrendingDown,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Package,
  Sparkles,
  GraduationCap,
  Info,
  Puzzle,
  Lock,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fallback images per plan_key
import boxEmprendedor from "@/assets/license-box-emprendedor.png";
import boxNegocio from "@/assets/license-box-negocio.png";
import boxEmpresarial from "@/assets/license-box-empresarial.png";
import boxVitalicia from "@/assets/license-box-vitalicia.png";

const fallbackImages: Record<string, string> = {
  emprendedor: boxEmprendedor,
  negocio: boxNegocio,
  empresarial: boxEmpresarial,
  vitalicia: boxVitalicia,
};

const planIncludes = [
  { label: "Licencia anual del software", plan: true, solo: true },
  { label: "Instalación presencial en tu local", plan: true, solo: false },
  { label: "Configuración personalizada", plan: true, solo: false },
  { label: "Capacitación a tu equipo", plan: true, solo: false },
  { label: "Migración de datos desde otro sistema", plan: true, solo: false },
  { label: "Soporte prioritario WhatsApp", plan: true, solo: false },
  { label: "Acceso a videotutoriales (130+)", plan: true, solo: false },
  { label: "Re-entrenamiento sin costo extra", plan: true, solo: false },
];

export function DynamicPricingSection() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: plans = [], isLoading } = useLicensePricing();
  const { data: allModules = [] } = useQuery({
    queryKey: ["plan_modules_public"],
    queryFn: async () => {
      const { data } = await supabase.from("plan_modules").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });
  const [searchParams] = useSearchParams();
  const cuponFromUrl = searchParams.get("cupon");

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96 rounded-2xl" />
        ))}
      </div>
    );
  }

  const popularIndex = 1; // Negocio

  return (
    <div className="space-y-12">
      {/* Tabs: Planes vs Solo Licencia */}
      <Tabs defaultValue="planes" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="planes" className="gap-1.5 text-xs sm:text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Planes Todo Incluido
          </TabsTrigger>
          <TabsTrigger value="licencia" className="gap-1.5 text-xs sm:text-sm">
            <Package className="h-3.5 w-3.5" />
            Solo Licencia
          </TabsTrigger>
        </TabsList>

        {/* ───────── TAB: PLANES TODO INCLUIDO ───────── */}
        <TabsContent value="planes">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Explanation banner */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center max-w-3xl mx-auto">
              <p className="text-sm font-medium text-foreground">
                <Shield className="inline h-4 w-4 text-primary mr-1 -mt-0.5" />
                Nuestros planes incluyen <strong>licencia + instalación + capacitación + soporte</strong>.
                Tú solo te dedicas a vender, nosotros hacemos el resto.
              </p>
            </div>

            {/* Coupon Banner — auto-applies from ?cupon= URL param or manual input */}
            <div className="max-w-2xl mx-auto">
              <CouponBanner initialCode={cuponFromUrl} />
            </div>

            {/* Plan cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const discount = discountPct(plan.official_price_cop, plan.selling_price_cop);
                const isPopular = index === popularIndex;
                const imageSrc = plan.image_url || fallbackImages[plan.plan_key] || boxEmprendedor;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                        isPopular ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider z-10">
                          Más Popular
                        </div>
                      )}
                      <CardContent className={`p-6 ${isPopular ? "pt-10" : ""}`}>
                        {/* Product Box Image */}
                        <div className="flex justify-center mb-4">
                          <img
                            src={imageSrc}
                            alt={`Plan ${plan.plan_label} SistecPOS`}
                            className="h-36 w-auto object-contain drop-shadow-lg"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        <h3 className="text-xl font-bold mb-1 text-center">{plan.plan_label}</h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">{plan.plan_description}</p>

                        {/* Annual price - PROMINENT (includes onboarding) */}
                        {(() => {
                          const totalAnual = plan.selling_price_cop + plan.implementation_price_cop;
                          const totalMonthly = monthlyPrice(totalAnual);
                          return (
                            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                              <p className="text-xs text-muted-foreground mb-1">Tu inversión total primer año</p>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-primary">
                                  {formatCOP(totalAnual)}
                                </span>
                                <span className="text-sm text-muted-foreground font-medium">/año</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Equivale a {formatCOP(totalMonthly)}/mes · Incluye licencia + puesta en marcha
                              </p>
                            </div>
                          );
                        })()}

                        {/* Discount badge */}
                        {discount > 0 && (
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Badge variant="destructive" className="gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Ahorras {discount}% vs precio de lista
                            </Badge>
                          </div>
                        )}

                        {/* Official price reference */}
                        {plan.official_price_cop > 0 && (
                          <p className="text-center text-xs text-muted-foreground mb-4">
                            <span className="line-through">{formatCOP(plan.official_price_cop)}</span>{" "}
                            precio de lista de la casa de desarrollo
                          </p>
                        )}

                        {/* What's included checklist */}
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Incluido en tu plan
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Wrench className="h-4 w-4 text-primary shrink-0" />
                            <span>
                              Puesta en marcha:{" "}
                              <strong className="text-primary">{formatCOP(plan.implementation_price_cop)}</strong>
                              <span className="text-muted-foreground text-xs ml-1">(única vez)</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Headphones className="h-4 w-4 text-primary shrink-0" />
                            <span>
                              Tranquilidad operativa:{" "}
                              <strong className="text-primary">{formatCOP(plan.support_monthly_cop)}/mes</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-whatsapp shrink-0" />
                            <span>Instalación presencial en tu local</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="h-4 w-4 text-whatsapp shrink-0" />
                            <span>Capacitación a tu equipo incluida</span>
                          </div>
                          {/* Módulos add-on del plan */}
                          {allModules.filter((m: any) =>
                            m.allowed_plan_keys.length === 0 || m.allowed_plan_keys.includes(plan.plan_key)
                          ).length > 0 && (
                            <div className="border-t pt-3 mt-2 space-y-1.5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Módulos del software
                              </p>
                              {allModules
                                .filter((m: any) =>
                                  m.allowed_plan_keys.length === 0 || m.allowed_plan_keys.includes(plan.plan_key)
                                )
                                .map((m: any) => {
                                  const isIncluded = m.is_included_in_plans.includes(plan.plan_key);
                                  return (
                                    <div key={m.id} className="flex items-center gap-2 text-sm">
                                      {isIncluded ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-whatsapp shrink-0" />
                                      ) : (
                                        <Puzzle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      )}
                                      <span className={isIncluded ? "" : "text-muted-foreground"}>
                                        {m.name}
                                        {!isIncluded && m.price_cop > 0 && (
                                          <span className="ml-1 text-xs font-medium text-primary">
                                            +{formatCOP(m.price_cop)}
                                          </span>
                                        )}
                                        {!isIncluded && m.price_cop === 0 && (
                                          <Badge className="ml-1 text-[10px] h-4 px-1 bg-primary/10 text-primary border-0">
                                            Disponible
                                          </Badge>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full mt-6 gap-2"
                          variant={isPopular ? "default" : "outline"}
                          size="lg"
                          asChild
                        >
                          <a
                            href={buildUrl(`Hola, quiero cotizar el ${plan.plan_label} Todo Incluido (${formatCOP(plan.selling_price_cop)}/año)`)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Cotizar {plan.plan_label.replace("Plan ", "")}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* ───────── TAB: SOLO LICENCIA ───────── */}
        <TabsContent value="licencia">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Warning banner */}
            <div className="rounded-xl border border-border bg-muted/60 p-4 text-center max-w-3xl mx-auto">
              <p className="text-sm text-foreground font-medium">
                <Info className="inline h-4 w-4 mr-1 -mt-0.5 text-muted-foreground" />
                La licencia por sí sola <strong>no incluye</strong> instalación, capacitación ni soporte.
                Si eres nuevo, te recomendamos un <strong>Plan Todo Incluido</strong> para arrancar sin complicaciones.
              </p>
            </div>

            {/* License-only cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const monthly = monthlyPrice(plan.official_price_cop);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="relative h-full border">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-1 text-center">
                          Licencia {plan.plan_label.replace("Plan ", "")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center">
                          Solo el software, sin servicios adicionales
                        </p>

                        <div className="rounded-xl bg-muted/50 border p-4 mb-4 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Precio de lista (casa de desarrollo)</p>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold text-foreground">
                              {formatCOP(plan.official_price_cop)}
                            </span>
                            <span className="text-sm text-muted-foreground">/año</span>
                          </div>
                          {monthly > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Equivale a {formatCOP(monthly)}/mes
                            </p>
                          )}
                        </div>

                        {/* Not included list */}
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            No incluye
                          </p>
                          {[
                            "Instalación presencial",
                            "Configuración personalizada",
                            "Capacitación a tu equipo",
                            "Soporte prioritario",
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <XCircle className="h-4 w-4 text-destructive/60 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                            <span>Acceso al software en la nube</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                            <span>Facturación electrónica DIAN</span>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full mt-6 gap-2" size="lg" asChild>
                          <a
                            href={buildUrl(`Hola, me interesa solo la licencia ${plan.plan_label.replace("Plan ", "")} (${formatCOP(plan.official_price_cop)}/año)`)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Consultar Licencia
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Upsell to plan */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                ¿Prefieres que nos encarguemos de todo?
              </p>
              <Badge className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors text-sm py-1.5 px-4">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Mira los Planes Todo Incluido ↑
              </Badge>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ───────── COMPARISON TABLE ───────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden border-0 shadow-card">
          <div className="bg-muted/50 p-4 text-center">
            <h3 className="text-lg font-bold">Plan Todo Incluido vs Solo Licencia</h3>
            <p className="text-xs text-muted-foreground mt-1">¿Qué obtienes con cada opción?</p>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium">Característica</th>
                  <th className="p-3 text-center font-medium text-primary">
                    <div className="flex flex-col items-center gap-0.5">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">Plan</span>
                    </div>
                  </th>
                  <th className="p-3 text-center font-medium text-muted-foreground">
                    <div className="flex flex-col items-center gap-0.5">
                      <Package className="h-4 w-4" />
                      <span className="text-xs">Solo Licencia</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planIncludes.map((row) => (
                  <tr key={row.label} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-sm">{row.label}</td>
                    <td className="p-3 text-center">
                      {row.plan ? (
                        <CheckCircle2 className="h-4 w-4 text-whatsapp mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive/40 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {row.solo ? (
                        <CheckCircle2 className="h-4 w-4 text-whatsapp mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive/40 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="rounded-lg bg-muted/50 border p-4">
          <p className="text-xs text-muted-foreground">
            <strong>¿Por qué los precios cambian?</strong> La casa de desarrollo fija sus tarifas en USD.
            SistecPOS convierte estos precios a COP usando la <strong>TRM oficial del día</strong> (tasa de cambio dólar-peso).
            Esto significa que el precio en pesos puede variar ligeramente cada día, pero siempre reflejas el precio justo y actualizado.
          </p>
          {plans[0]?.last_synced_at && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Última sincronización: {new Date(plans[0].last_synced_at).toLocaleDateString("es-CO", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

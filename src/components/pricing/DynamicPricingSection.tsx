import { useLicensePricing, formatCOP, monthlyPrice, discountPct } from "@/hooks/useLicensePricing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Shield, Wrench, Headphones, TrendingDown, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

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

export function DynamicPricingSection() {
  const { data: plans = [], isLoading } = useLicensePricing();

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
      {/* Plan Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan, index) => {
          const monthly = monthlyPrice(plan.selling_price_cop);
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
                      alt={`Licencia ${plan.plan_label} SistecPOS`}
                      className="h-40 w-auto object-contain drop-shadow-lg"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-center">{plan.plan_label}</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center">{plan.plan_description}</p>

                   {/* Monthly price - PROMINENT */}
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Tu inversión desde</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-primary">
                        {formatCOP(monthly)}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">/mes</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pago anual de {formatCOP(plan.selling_price_cop)}
                    </p>
                  </div>

                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Ahorras {discount}% con SistecPOS
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

                  {/* Services included */}
                  <div className="space-y-2.5 border-t pt-4">
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
                      <CalendarClock className="h-4 w-4 text-whatsapp shrink-0" />
                      <span>Entrenamiento a tu equipo incluido</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full mt-6 gap-2 ${isPopular ? "" : "variant-outline"}`}
                    variant={isPopular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <a
                      href={`https://wa.me/573176268307?text=${encodeURIComponent(
                        `Hola, quiero cotizar el ${plan.plan_label} (${formatCOP(plan.selling_price_cop)}/año)`
                      )}`}
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

      {/* Pricing note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <p className="text-xs text-muted-foreground">
          * Precios en COP actualizados diariamente según la TRM oficial. Los precios de facturación 
          se rigen por las tarifas vigentes de la casa de desarrollo. Los descuentos mostrados son exclusivos de SistecPOS.
          {plans[0]?.last_synced_at && (
            <span className="block mt-1">
              Última actualización: {new Date(plans[0].last_synced_at).toLocaleDateString("es-CO")}
            </span>
          )}
        </p>
      </motion.div>
    </div>
  );
}

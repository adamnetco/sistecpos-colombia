import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useLicensePricing, formatCOP, monthlyPrice, discountPct } from "@/hooks/useLicensePricing";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle, Shield, CheckCircle2, TrendingDown, ArrowRight,
  Package, Users, Monitor, Puzzle, Sparkles, HelpCircle,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { usePageContent, getContent, getJsonContent } from "@/hooks/usePageContent";

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

const defaultBenefits = [
  "Sin cláusula de permanencia",
  "Soporte en español 100%",
  "Modo offline hasta 8 días",
  "Facturación electrónica DIAN",
  "Actualizaciones automáticas",
  "16+ módulos especializados",
];

const defaultIdealFor: Record<string, string> = {
  emprendedor: "Tiendas pequeñas, negocios nuevos, 1 punto de venta",
  negocio: "Negocios en crecimiento, 1-2 cajas, equipo pequeño",
  empresarial: "Cadenas, múltiples sedes, equipos grandes",
  vitalicia: "Inversión a largo plazo, sin renovaciones anuales",
};

export default function LicenciasPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: plans = [], isLoading } = useLicensePricing();
  const { data: blocks } = usePageContent("/licencias");
  const { data: modules = [] } = useQuery({
    queryKey: ["plan_modules_public"],
    queryFn: async () => {
      const { data } = await supabase.from("plan_modules").select("*").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const [activeTab, setActiveTab] = useState("comparar");

  const heroTitle = getContent(blocks, "hero_title", "Compara y elige la licencia ideal para tu negocio");
  const heroSubtitle = getContent(blocks, "hero_subtitle", "Todas nuestras licencias incluyen facturación electrónica DIAN, actualizaciones y acceso en la nube. La diferencia está en lo que necesita tu negocio.");
  const heroBadge = getContent(blocks, "hero_badge", "Precios 2026");
  const benefits = getJsonContent<string[]>(blocks, "benefits", defaultBenefits);
  const idealFor = getJsonContent<Record<string, string>>(blocks, "ideal_for", defaultIdealFor);

  return (
    <Layout>
      <DynamicMeta
        title="Licencias Software POS Colombia — Comparativa de Precios 2026 | SistecPOS"
        description="Compara las licencias POS de SistecPOS: Emprendedor, Negocio, Empresarial y Vitalicia. Precios transparentes con tabla comparativa detallada."
        canonical="https://sistecpos.com/licencias"
      />
      <Breadcrumbs items={[{ label: "Licencias" }]} />

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
              <Shield className="h-3 w-3 mr-1" /> {heroBadge}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
               dangerouslySetInnerHTML={{ __html: heroSubtitle }}
            />
            <div className="flex flex-wrap justify-center gap-3">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-1.5 text-sm text-primary-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-whatsapp" />
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs: Comparativa vs Detalle */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
              <TabsTrigger value="comparar" className="gap-1.5 text-xs sm:text-sm">
                <Monitor className="h-3.5 w-3.5" />
                Tabla Comparativa
              </TabsTrigger>
              <TabsTrigger value="detalle" className="gap-1.5 text-xs sm:text-sm">
                <Package className="h-3.5 w-3.5" />
                Ver por Plan
              </TabsTrigger>
            </TabsList>

            {/* ─── TAB COMPARAR ─── */}
            <TabsContent value="comparar">
              {isLoading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="overflow-hidden border-0 shadow-card">
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left p-4 font-medium w-1/4">Característica</th>
                            {plans.map((p, i) => (
                              <th key={p.id} className={`p-4 text-center ${i === 1 ? "bg-primary/5" : ""}`}>
                                <img
                                  src={p.image_url || fallbackImages[p.plan_key] || boxEmprendedor}
                                  alt={p.plan_label}
                                  className="h-16 w-auto mx-auto mb-2 object-contain"
                                  loading="lazy"
                                />
                                <span className="font-bold text-sm">{p.plan_label}</span>
                                {i === 1 && (
                                  <Badge className="block mx-auto mt-1 text-[10px]">Más Popular</Badge>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Precio */}
                          <tr className="border-b bg-primary/[0.02]">
                            <td className="p-3 font-medium">Precio anual</td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-3 text-center ${i === 1 ? "bg-primary/5" : ""}`}>
                                <span className="text-lg font-black text-primary">{formatCOP(p.selling_price_cop)}</span>
                                {discountPct(p.official_price_cop, p.selling_price_cop) > 0 && (
                                  <p className="text-[10px] text-destructive font-medium">
                                    -{discountPct(p.official_price_cop, p.selling_price_cop)}% dto.
                                  </p>
                                )}
                              </td>
                            ))}
                          </tr>
                          {/* Mensual equiv */}
                          <tr className="border-b">
                            <td className="p-3 text-muted-foreground">Equivalente mensual</td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-3 text-center text-muted-foreground text-xs ${i === 1 ? "bg-primary/5" : ""}`}>
                                {formatCOP(monthlyPrice(p.selling_price_cop))}/mes
                              </td>
                            ))}
                          </tr>
                          {/* Cajas */}
                          <tr className="border-b">
                            <td className="p-3">Cajas simultáneas</td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-3 text-center font-medium ${i === 1 ? "bg-primary/5" : ""}`}>
                                {p.max_cajas === -1 ? "Ilimitadas" : p.max_cajas}
                              </td>
                            ))}
                          </tr>
                          {/* Usuarios */}
                          <tr className="border-b">
                            <td className="p-3">Usuarios</td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-3 text-center font-medium ${i === 1 ? "bg-primary/5" : ""}`}>
                                {p.max_usuarios === -1 ? "Ilimitados" : p.max_usuarios}
                              </td>
                            ))}
                          </tr>
                          {/* Ideal para */}
                          <tr className="border-b">
                            <td className="p-3">Ideal para</td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-3 text-center text-xs text-muted-foreground ${i === 1 ? "bg-primary/5" : ""}`}>
                                {idealFor[p.plan_key] || "Todo tipo de negocio"}
                              </td>
                            ))}
                          </tr>
                          {/* Modules */}
                          {modules.slice(0, 8).map(m => (
                            <tr key={m.id} className="border-b">
                              <td className="p-3 text-sm">{(m as any).name}</td>
                              {plans.map((p, i) => {
                                const included = ((m as any).is_included_in_plans || []).includes(p.plan_key);
                                const allowed = ((m as any).allowed_plan_keys || []).length === 0 || ((m as any).allowed_plan_keys || []).includes(p.plan_key);
                                return (
                                  <td key={p.id} className={`p-3 text-center ${i === 1 ? "bg-primary/5" : ""}`}>
                                    {included ? (
                                      <CheckCircle2 className="h-4 w-4 text-whatsapp mx-auto" />
                                    ) : allowed ? (
                                      <span className="text-xs text-primary font-medium">
                                        {(m as any).price_cop > 0 ? `+${formatCOP((m as any).price_cop)}` : "Disponible"}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          {/* CTA row */}
                          <tr>
                            <td className="p-4"></td>
                            {plans.map((p, i) => (
                              <td key={p.id} className={`p-4 text-center ${i === 1 ? "bg-primary/5" : ""}`}>
                                <Button
                                  variant={i === 1 ? "default" : "outline"}
                                  size="sm"
                                  className="gap-1.5 w-full"
                                  asChild
                                >
                                  <a
                                    href={buildUrl(`Hola, quiero cotizar la licencia ${p.plan_label} (${formatCOP(p.selling_price_cop)}/año)`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Cotizar
                                  </a>
                                </Button>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* ─── TAB DETALLE ─── */}
            <TabsContent value="detalle">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan, index) => {
                    const discount = discountPct(plan.official_price_cop, plan.selling_price_cop);
                    const isPopular = index === 1;
                    const imageSrc = plan.image_url || fallbackImages[plan.plan_key] || boxEmprendedor;

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className={`relative h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${isPopular ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}>
                          {isPopular && (
                            <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider z-10">
                              Más Popular
                            </div>
                          )}
                          <CardContent className={`p-6 ${isPopular ? "pt-10" : ""}`}>
                            <div className="flex justify-center mb-4">
                              <img src={imageSrc} alt={plan.plan_label} className="h-32 w-auto object-contain drop-shadow-lg" loading="lazy" />
                            </div>
                            <h3 className="text-xl font-bold mb-1 text-center">{plan.plan_label}</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center">{plan.plan_description}</p>

                            {/* Price */}
                            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                              {plan.official_price_cop > 0 && plan.official_price_cop !== plan.selling_price_cop && (
                                <p className="text-xs text-muted-foreground line-through mb-1">{formatCOP(plan.official_price_cop)}</p>
                              )}
                              <span className="text-4xl font-black text-primary">{formatCOP(plan.selling_price_cop)}</span>
                              <span className="text-sm text-muted-foreground font-medium">/año</span>
                              {discount > 0 && (
                                <Badge variant="destructive" className="gap-1 mt-2 block w-fit mx-auto">
                                  <TrendingDown className="h-3 w-3" /> -{discount}%
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatCOP(monthlyPrice(plan.selling_price_cop))}/mes equivalente
                              </p>
                            </div>

                            {/* Specs */}
                            <div className="space-y-2 border-t pt-4 mb-4">
                              {plan.max_cajas != null && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Monitor className="h-4 w-4 text-primary shrink-0" />
                                  <span>{plan.max_cajas === -1 ? "Cajas ilimitadas" : `${plan.max_cajas} caja(s)`}</span>
                                </div>
                              )}
                              {plan.max_usuarios != null && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-primary shrink-0" />
                                  <span>{plan.max_usuarios === -1 ? "Usuarios ilimitados" : `${plan.max_usuarios} usuario(s)`}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                                <span>Facturación electrónica DIAN</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                                <span>Modo offline hasta 8 días</span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center mb-4">
                              {idealFor[plan.plan_key] || "Para todo tipo de negocio"}
                            </p>

                            <Button className="w-full gap-2" variant={isPopular ? "default" : "outline"} size="lg" asChild>
                              <a
                                href={buildUrl(`Hola, quiero cotizar la licencia ${plan.plan_label} (${formatCOP(plan.selling_price_cop)}/año)`)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-4 w-4" /> Cotizar Licencia
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Cross-sell Packs */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Package className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">
              {getContent(blocks, "crosssell_title", "¿Quieres todo incluido? Mira los Packs")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {getContent(blocks, "crosssell_subtitle", "Licencia + Implementación + Soporte + Módulos desde un solo pago con descuento.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/packs">
                  <Sparkles className="h-5 w-5" /> Ver Packs Todo Incluido
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/modulos">
                  <Puzzle className="h-5 w-5" /> Ver Módulos Adicionales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {getContent(blocks, "cta_title", "¿Necesitas ayuda para elegir?")}
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            {getContent(blocks, "cta_subtitle", "Te asesoramos sin compromiso para encontrar la licencia perfecta para tu tipo de negocio.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a href={buildUrl("Hola, necesito asesoría para elegir mi licencia POS")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" /> Asesoría Gratuita
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/comparativa-licencias">
                <ArrowRight className="h-5 w-5" /> Comparar con Otros POS
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

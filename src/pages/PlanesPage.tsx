import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useSupportPlans } from "@/hooks/useSupportPlans";
import { useLicensePricing, formatCOP } from "@/hooks/useLicensePricing";
import { useCommercialPacks } from "@/hooks/useCommercialPacks";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle, Headphones, CheckCircle2, Star, Shield, Zap,
  Package, Wrench, ArrowRight, ArrowLeft, Puzzle, TrendingDown,
  ShoppingCart, Sparkles, Target, HelpCircle,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { usePageContent, getContent } from "@/hooks/usePageContent";
import { DynamicPricingSection } from "@/components/pricing/DynamicPricingSection";

type Step = "choose" | "licencias" | "packs" | "soporte" | "servicios";

const needs = [
  {
    key: "licencias" as Step,
    icon: Shield,
    title: "Solo necesito el Software",
    subtitle: "Licencia de software POS",
    desc: "Ya tengo soporte o quiero manejar mi sistema de forma autónoma. Solo necesito la licencia.",
    badge: "Desde $199.000",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    key: "packs" as Step,
    icon: Package,
    title: "Quiero Todo Incluido",
    subtitle: "Licencia + Implementación + Soporte",
    desc: "Quiero arrancar mi negocio sin preocupaciones. Un solo pago con todo incluido.",
    badge: "Más Popular",
    color: "bg-primary/10 text-primary",
    popular: true,
  },
  {
    key: "soporte" as Step,
    icon: Headphones,
    title: "Ya tengo licencia, necesito Soporte",
    subtitle: "Planes de soporte mensual",
    desc: "Ya tengo mi software funcionando pero necesito acompañamiento técnico mensual.",
    badge: "Desde $80.000/mes",
    color: "bg-green-500/10 text-green-600",
  },
  {
    key: "servicios" as Step,
    icon: Wrench,
    title: "Necesito un Servicio Específico",
    subtitle: "Implementación, capacitación o consultoría",
    desc: "Necesito un servicio puntual: instalación, cableado de red, capacitación o consultoría.",
    badge: "Servicios",
    color: "bg-orange-500/10 text-orange-600",
  },
];

export default function PlanesPage() {
  const [step, setStep] = useState<Step>("choose");
  const { buildUrl } = useWhatsAppConfig();
  const { data: blocks } = usePageContent("/planes");
  const { data: plans = [], isLoading: loadingPlans } = useSupportPlans();
  const { data: packs = [], isLoading: loadingPacks } = useCommercialPacks();
  const { data: licenses = [] } = useLicensePricing();

  const getLicense = (id: string | null) => licenses.find(l => l.id === id);

  return (
    <Layout>
      <DynamicMeta
        title="Planes y Precios POS Colombia — Software, Soporte y Packs | SistecPOS"
        description="Encuentra el plan perfecto para tu negocio: licencias de software POS, packs todo incluido, soporte mensual y servicios profesionales. Precios transparentes."
        canonical="https://sistecpos.com/planes"
      />
      <Breadcrumbs items={[{ label: "Planes" }]} />

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
              <Zap className="h-3 w-3 mr-1" /> Planes 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {step === "choose"
                ? getContent(blocks, "hero_title", "¿Qué necesita tu negocio?")
                : getContent(blocks, "hero_title_alt", "Planes y Precios")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              {step === "choose"
                ? getContent(blocks, "hero_subtitle", "Responde una sola pregunta y te mostramos la mejor opción para ti.")
                : getContent(blocks, "hero_subtitle_alt", "Precios transparentes. Sin letra pequeña. Soporte 100% en español.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Paso 1 de 2</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Selecciona lo que mejor describe tu situación</h2>
                  <p className="text-muted-foreground">Te mostraremos las opciones más relevantes para ti.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {needs.map((need, i) => (
                    <motion.div
                      key={need.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group ${need.popular ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}
                        onClick={() => setStep(need.key)}
                      >
                        {need.popular && (
                          <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                            <Star className="inline h-3 w-3 mr-1" /> Más Popular
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${need.color}`}>
                              <need.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-lg leading-tight">{need.title}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5">{need.subtitle}</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-3">{need.desc}</p>
                              <Badge variant="secondary" className="mt-3 text-xs">{need.badge}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Help */}
                <div className="mt-10 text-center">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    ¿No estás seguro?{" "}
                    <a
                      href={buildUrl("Hola, no sé qué plan necesito. ¿Me pueden asesorar?")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline"
                    >
                      Te asesoramos gratis por WhatsApp
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {step !== "choose" && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {/* Back Button */}
                <div className="mb-8">
                  <Button variant="ghost" size="sm" onClick={() => setStep("choose")} className="gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a elegir
                  </Button>
                </div>

                {/* Licencias */}
                {step === "licencias" && (
                  <div>
                    <div className="text-center mb-10">
                      <Badge className="mb-3 bg-blue-500/10 text-blue-600 border-0">
                        <Shield className="h-3 w-3 mr-1" /> Paso 2 · Elige tu licencia
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold">Licencias de Software POS</h2>
                      <p className="text-muted-foreground mt-2">Desde tiendas pequeñas hasta cadenas con múltiples sedes.</p>
                    </div>
                    <DynamicPricingSection />
                    <CrossSellBanner
                      message="💡 ¿Sabías que con un Pack ahorras hasta un 30% en licencia + implementación + soporte?"
                      action="Ver Packs"
                      onClick={() => setStep("packs")}
                    />
                  </div>
                )}

                {/* Packs */}
                {step === "packs" && (
                  <div>
                    <div className="text-center mb-10">
                      <Badge className="mb-3 bg-primary/10 text-primary border-0">
                        <Package className="h-3 w-3 mr-1" /> Paso 2 · Elige tu pack
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold">Packs Todo Incluido</h2>
                      <p className="text-muted-foreground mt-2">Licencia + Módulos + Implementación + Soporte en un solo pago.</p>
                    </div>

                    {loadingPacks ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
                      </div>
                    ) : packs.length === 0 ? (
                      <EmptyState buildUrl={buildUrl} message="Hola, quiero armar un pack personalizado" />
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {packs.map((pack, index) => {
                          const license = getLicense(pack.license_pricing_id);
                          const savingsPct = pack.original_price_cop && pack.original_price_cop > 0
                            ? Math.round(((pack.original_price_cop - pack.price_cop) / pack.original_price_cop) * 100)
                            : 0;

                          return (
                            <motion.div key={pack.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                              <Card className={`h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${pack.is_popular ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}>
                                {pack.is_popular && (
                                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                                    <Star className="inline h-3 w-3 mr-1" /> Más Vendido
                                  </div>
                                )}
                                <CardContent className={`p-6 ${pack.is_popular ? "pt-10" : ""}`}>
                                  <h3 className="text-xl font-bold mb-1 text-center">{pack.name}</h3>
                                  {pack.tagline && <p className="text-xs text-center text-muted-foreground mb-1">{pack.tagline}</p>}
                                  <p className="text-sm text-muted-foreground mb-4 text-center">{pack.description}</p>
                                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4 text-center">
                                    {pack.original_price_cop && pack.original_price_cop > pack.price_cop && (
                                      <p className="text-xs text-muted-foreground line-through mb-1">{formatCOP(pack.original_price_cop)}</p>
                                    )}
                                    <span className="text-4xl font-black text-primary">{formatCOP(pack.price_cop)}</span>
                                    {savingsPct > 0 && (
                                      <Badge variant="destructive" className="gap-1 mt-2 block w-fit mx-auto">
                                        <TrendingDown className="h-3 w-3" /> Ahorras {savingsPct}%
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-2 border-t pt-4">
                                    {license && (
                                      <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-primary shrink-0" /><span>Licencia <strong>{license.plan_label}</strong></span></div>
                                    )}
                                    {pack.implementation_included && (
                                      <div className="flex items-center gap-2 text-sm"><Wrench className="h-4 w-4 text-primary shrink-0" /><span>Implementación presencial</span></div>
                                    )}
                                    {pack.support_months_included > 0 && (
                                      <div className="flex items-center gap-2 text-sm"><Headphones className="h-4 w-4 text-primary shrink-0" /><span><strong>{pack.support_months_included}</strong> meses de soporte</span></div>
                                    )}
                                    {pack.features.map((f, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" /><span>{f}</span></div>
                                    ))}
                                  </div>
                                  <Button className="w-full mt-6 gap-2" variant={pack.is_popular ? "default" : "outline"} size="lg" asChild>
                                    <a href={buildUrl(pack.cta_whatsapp_message || `Hola, quiero el pack ${pack.name}`)} target="_blank" rel="noopener noreferrer">
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
                    <CrossSellBanner
                      message="💡 ¿Solo necesitas la licencia sin implementación? Puedes comprarla por separado."
                      action="Ver Licencias"
                      onClick={() => setStep("licencias")}
                    />
                  </div>
                )}

                {/* Soporte */}
                {step === "soporte" && (
                  <div>
                    <div className="text-center mb-10">
                      <Badge className="mb-3 bg-green-500/10 text-green-600 border-0">
                        <Headphones className="h-3 w-3 mr-1" /> Paso 2 · Elige tu plan
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold">Planes de Soporte Mensual</h2>
                      <p className="text-muted-foreground mt-2">Tu negocio nunca se detiene. Elige el nivel de acompañamiento.</p>
                    </div>

                    {loadingPlans ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                      </div>
                    ) : plans.length === 0 ? (
                      <EmptyState buildUrl={buildUrl} message="Hola, quiero información sobre los planes de soporte" />
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                          <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
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
                                  <span className="text-4xl font-black text-primary">{formatCOP(plan.price_cop)}</span>
                                  <span className="text-sm text-muted-foreground">/mes</span>
                                </div>
                                {plan.features && plan.features.length > 0 && (
                                  <div className="space-y-2 border-t pt-4">
                                    {plan.features.map((f, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>{f}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Button className="w-full mt-6 gap-2" variant={plan.is_popular ? "default" : "outline"} size="lg" asChild>
                                  <a href={buildUrl(plan.cta_whatsapp_message || `Hola, quiero el plan de soporte ${plan.plan_label}`)} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4" /> Contratar
                                  </a>
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Servicios */}
                {step === "servicios" && (
                  <div className="text-center max-w-2xl mx-auto">
                    <Badge className="mb-3 bg-orange-500/10 text-orange-600 border-0">
                      <Wrench className="h-3 w-3 mr-1" /> Servicios Profesionales
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Servicios a la Medida</h2>
                    <p className="text-muted-foreground mb-8">
                      Implementación presencial, capacitación, cableado de redes, consultoría y más.
                      Cada servicio se cotiza según las necesidades de tu negocio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="gap-2" asChild>
                        <Link to="/servicios">
                          <Wrench className="h-5 w-5" /> Ver Catálogo de Servicios
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2" asChild>
                        <a href={buildUrl("Hola, necesito cotizar un servicio profesional")} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-5 w-5" /> Cotizar por WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            <a href={buildUrl("Hola, necesito un plan personalizado")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" /> Hablar con Ventas
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function CrossSellBanner({ message, action, onClick }: { message: string; action: string; onClick: () => void }) {
  return (
    <div className="mt-10 p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onClick} className="gap-1 shrink-0">
        {action} <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function EmptyState({ buildUrl, message }: { buildUrl: (msg: string) => string; message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Próximamente disponible. Mientras tanto, te asesoramos.</p>
      <Button className="gap-2" asChild>
        <a href={buildUrl(message)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> Consultar
        </a>
      </Button>
    </div>
  );
}

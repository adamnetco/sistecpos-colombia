import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle, CheckCircle2, ArrowLeft, Box, BookOpen,
  Store, FileText, ShoppingBag, Puzzle, Gift, Crown,
  ArrowRight, Lock, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { ProductServicesSection } from "@/components/pricing/ProductServicesSection";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Store, FileText, ShoppingBag, Box, Puzzle,
};

const getModuleIcon = (icon: string) => ICON_MAP[icon] || Puzzle;

// Human-readable plan labels
const PLAN_LABELS: Record<string, string> = {
  basico: "Plan Básico",
  intermedio: "Plan Intermedio",
  premium: "Plan Premium",
  premium_contabilidad: "Premium + Contabilidad",
  premium_multi_2: "Premium Multitienda 2",
  premium_multi_3: "Premium Multitienda 3",
  premium_2anios: "Premium 2 Años",
  vitalicio: "Plan Vitalicio",
};

const ModuloDetallePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { buildUrl } = useWhatsAppConfig();

  const { data: module, isLoading } = useQuery({
    queryKey: ["plan_module_detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_modules")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch license plans that include or allow this module
  const { data: plans = [] } = useQuery({
    queryKey: ["license_pricing_for_module"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("license_pricing")
        .select("plan_key, plan_label, selling_price_cop, max_cajas, max_usuarios, image_url")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!module) return <Navigate to="/productos" replace />;

  const ModuleIcon = getModuleIcon(module.icon || "Box");
  const includedInPlans = (module.is_included_in_plans as string[]) || [];
  const allowedPlanKeys = (module.allowed_plan_keys as string[]) || [];
  const isPaid = !module.is_free && module.price_cop > 0;

  // Plans where this module is included (free)
  const plansIncluded = plans.filter(p => includedInPlans.includes(p.plan_key));
  // Plans where it's available as add-on (not already included)
  const plansAddon = plans.filter(
    p => allowedPlanKeys.includes(p.plan_key) && !includedInPlans.includes(p.plan_key)
  );

  return (
    <Layout>
      <SEO
        title={`${module.name} | Módulo Software POS | SistecPOS`}
        description={module.description || `Conoce el ${module.name} para tu software POS. Amplía las funcionalidades de tu negocio con SistecPOS.`}
        canonical={`https://sistecpos.com/modulos/${module.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: module.name,
            description: module.description,
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "POS Module",
            operatingSystem: "Web, Windows, Android",
            url: `https://sistecpos.com/modulos/${module.slug}`,
            brand: { "@type": "Brand", name: "SistecPOS" },
            offers: isPaid
              ? {
                  "@type": "Offer",
                  price: module.price_cop,
                  priceCurrency: "COP",
                  availability: "https://schema.org/InStock",
                  url: `https://sistecpos.com/modulos/${module.slug}`,
                }
              : {
                  "@type": "Offer",
                  price: 0,
                  priceCurrency: "COP",
                  availability: "https://schema.org/InStock",
                  description: "Incluido sin costo en planes compatibles",
                },
          }),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Productos", href: "/productos" },
          { label: module.name },
        ]}
      />

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />Volver al catálogo
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square rounded-2xl gradient-bg p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ModuleIcon className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-lg font-semibold opacity-90">Módulo de Software POS</p>
                  <p className="text-sm opacity-70 mt-1">Add-on para SistecPOS</p>
                </div>
              </div>

              {/* Plan compatibility quick view */}
              <div className="mt-4 p-4 rounded-xl border bg-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Compatibilidad de planes
                </p>
                <div className="flex flex-wrap gap-2">
                  {plans.map(p => {
                    const isIncluded = includedInPlans.includes(p.plan_key);
                    const isAllowed = allowedPlanKeys.includes(p.plan_key);
                    if (!isAllowed && !isIncluded) return null;
                    return (
                      <Badge
                        key={p.plan_key}
                        variant={isIncluded ? "default" : "outline"}
                        className={`text-xs ${isIncluded ? "bg-whatsapp/10 text-whatsapp border-0" : ""}`}
                      >
                        {isIncluded ? <Gift className="h-2.5 w-2.5 mr-1" /> : <Puzzle className="h-2.5 w-2.5 mr-1" />}
                        {p.plan_label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-0">
                  <Puzzle className="h-3 w-3 mr-1" />Módulo Add-on
                </Badge>
                {module.is_free ? (
                  <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                    <Gift className="h-3 w-3 mr-1" />Incluido en plan
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive border-0">
                    <Sparkles className="h-3 w-3 mr-1" />Complemento de pago
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{module.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{module.description}</p>

              <Separator className="my-4" />

              {/* Pricing */}
              <div className="mb-6 space-y-2">
                {isPaid ? (
                  <>
                    <p className="text-sm text-muted-foreground">Precio del módulo adicional</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-primary">{formatPrice(module.price_cop)}</p>
                      <span className="text-sm font-semibold text-muted-foreground">COP</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se activa sobre tu licencia existente de SistecPOS
                    </p>
                  </>
                ) : (
                  <div className="rounded-xl bg-whatsapp/5 border border-whatsapp/20 p-4">
                    <div className="flex items-center gap-3">
                      <Gift className="h-8 w-8 text-whatsapp shrink-0" />
                      <div>
                        <p className="font-semibold text-whatsapp">Incluido sin costo adicional</p>
                        <p className="text-sm text-muted-foreground">
                          Este módulo está incluido en los planes: {plansIncluded.map(p => p.plan_label).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1 btn-whatsapp gap-2" asChild>
                  <a
                    href={buildUrl(`Hola, quiero información sobre el ${module.name} para mi SistecPOS`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />Consultar por WhatsApp
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
                  <Link to="/productos?category=licencias">
                    <ArrowRight className="h-5 w-5" />Ver planes
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Plans where included */}
      {plansIncluded.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-whatsapp" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Incluido en estos planes</h2>
                <p className="text-sm text-muted-foreground">Sin costo adicional</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plansIncluded.map(p => (
                <Card key={p.plan_key} className="border-0 shadow-card border-l-4 border-l-whatsapp">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.plan_label}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(p.selling_price_cop)} COP/año</p>
                      {p.max_cajas && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.max_cajas} {p.max_cajas === 1 ? "caja" : "cajas"} · {p.max_usuarios === 9999 ? "Usuarios ilimitados" : `${p.max_usuarios} usuarios`}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-whatsapp/10 text-whatsapp border-0 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Incluido
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Plans where available as add-on */}
      {plansAddon.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Disponible como complemento</h2>
                <p className="text-sm text-muted-foreground">
                  {isPaid ? `Se activa por ${formatPrice(module.price_cop)} COP adicionales` : "Disponible en estos planes"}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plansAddon.map(p => (
                <Card key={p.plan_key} className="border-0 shadow-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.plan_label}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(p.selling_price_cop)} COP/año</p>
                      {p.max_cajas && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.max_cajas} {p.max_cajas === 1 ? "caja" : "cajas"} · {p.max_usuarios === 9999 ? "Usuarios ilimitados" : `${p.max_usuarios} usuarios`}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      <Lock className="h-3 w-3 mr-1" />Add-on
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Not available in any plan */}
      {allowedPlanKeys.length === 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6 text-center max-w-xl mx-auto">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4 opacity-60" />
            <h2 className="text-xl font-bold mb-2">Módulo exclusivo</h2>
            <p className="text-muted-foreground text-sm">Consulta disponibilidad con nuestro equipo.</p>
          </div>
        </section>
      )}

      <ProductServicesSection />

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Quieres activar este módulo?
            </h2>
            <p className="text-muted-foreground mb-6">
              Escríbenos por WhatsApp y te indicamos cómo activarlo en tu licencia actual o al adquirir un nuevo plan.
            </p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a
                href={buildUrl(`Hola, me interesa el ${module.name} de SistecPOS`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />Activar Módulo por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ModuloDetallePage;

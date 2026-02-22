import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP } from "@/hooks/useLicensePricing";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Puzzle, CheckCircle2, ArrowRight } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] || Puzzle;
  return <Icon className={className} />;
}

export default function ModulosPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["plan_modules_hub"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plan_modules")
        .select("*")
        .eq("is_active", true)
        .eq("show_in_catalog", true)
        .order("sort_order");
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <DynamicMeta
        title="Módulos POS — Add-ons para tu Software | SistecPOS"
        description="Descubre los módulos adicionales para tu sistema POS: Facturación Electrónica, Tienda Online, Contabilidad, Multitienda y más."
        canonical="https://sistecpos.com/modulos"
      />
      <Breadcrumbs items={[{ label: "Módulos" }]} />

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
              <Puzzle className="h-3 w-3 mr-1" /> Módulos Add-on
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Potencia tu POS con Módulos Especializados
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Agrega funcionalidades avanzadas a tu software POS según las necesidades de tu negocio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {modules.map((mod: any, index: number) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card className="h-full hover:-translate-y-1 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <DynamicIcon name={mod.icon || "Puzzle"} className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{mod.name}</h3>
                          <div className="flex gap-2 mt-1">
                            {mod.is_free ? (
                              <Badge variant="secondary" className="text-xs">Incluido en plan</Badge>
                            ) : mod.price_cop > 0 ? (
                              <Badge className="text-xs bg-cta text-cta-foreground">{formatCOP(mod.price_cop)}</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Disponible</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{mod.description}</p>
                      <Link
                        to={`/modulos/${mod.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Ver detalles <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas un módulo especial?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Cuéntanos qué funcionalidad necesita tu negocio y te asesoramos sin compromiso.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href={buildUrl("Hola, quiero información sobre los módulos disponibles para mi POS")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Consultar Módulos
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

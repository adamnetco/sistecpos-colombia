import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageCircle, Star, TrendingDown, ArrowRight, Package, Sparkles,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

export default function VentasListPage() {
  const { buildUrl } = useWhatsAppConfig();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["sales_pages_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_pages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <DynamicMeta
        title="Ofertas y Combos POS — Paquetes Especiales | SistecPOS"
        description="Descubre nuestros combos y ofertas especiales: licencias, hardware, servicios y planes de soporte empaquetados con descuento."
        canonical="https://sistecpos.com/ventas"
      />
      <Breadcrumbs items={[{ label: "Ventas" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />Ofertas Especiales
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Combos y Ofertas para tu Negocio</h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Paquetes armados con todo lo que necesitas: software, hardware, implementación y soporte con precios especiales.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">Las ofertas estarán disponibles próximamente.</p>
              <Button className="gap-2" asChild>
                <a href={buildUrl("Hola, quiero conocer las ofertas disponibles")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />Consultar
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pages.map((page, i) => {
                const savingsPct = page.original_price_cop && page.original_price_cop > page.price_cop
                  ? Math.round(((page.original_price_cop - page.price_cop) / page.original_price_cop) * 100)
                  : 0;

                return (
                  <motion.div key={page.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className={`h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${page.is_featured ? "border-primary ring-2 ring-primary/20 shadow-lg" : ""}`}>
                      {page.badge && (
                        <div className={`text-center py-1.5 text-xs font-bold uppercase tracking-wider ${page.is_featured ? "bg-primary text-primary-foreground" : "bg-cta text-cta-foreground"}`}>
                          {page.is_featured && <Star className="inline h-3 w-3 mr-1" />}{page.badge}
                        </div>
                      )}
                      {page.gallery_urls && page.gallery_urls.length > 0 && (
                        <div className="aspect-video bg-muted">
                          <img src={page.gallery_urls[0]} alt={page.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold mb-1">{page.title}</h3>
                        {page.subtitle && <p className="text-xs text-muted-foreground mb-2">{page.subtitle}</p>}
                        {page.description && <p className="text-sm text-muted-foreground mb-4 flex-1">{page.description}</p>}

                        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 mb-4 text-center">
                          {page.original_price_cop && page.original_price_cop > page.price_cop && (
                            <p className="text-xs text-muted-foreground line-through">{formatCOP(page.original_price_cop)}</p>
                          )}
                          <span className="text-3xl font-black text-primary">{formatCOP(page.price_cop)}</span>
                          {savingsPct > 0 && (
                            <Badge variant="destructive" className="gap-1 ml-2">
                              <TrendingDown className="h-3 w-3" />{savingsPct}%
                            </Badge>
                          )}
                        </div>

                        <Button className="w-full gap-2" asChild>
                          <Link to={`/venta/${page.slug}`}>
                            Ver Detalle <ArrowRight className="h-4 w-4" />
                          </Link>
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
    </Layout>
  );
}

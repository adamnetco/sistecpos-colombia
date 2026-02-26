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
  ShoppingCart, Shield, Clock,
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

  const featured = pages.filter(p => p.is_featured);
  const regular = pages.filter(p => !p.is_featured);

  return (
    <Layout>
      <DynamicMeta
        title="Ofertas y Combos POS — Paquetes Especiales | SistecPOS"
        description="Descubre nuestros combos y ofertas especiales: licencias, hardware, servicios y planes de soporte empaquetados con descuento."
        canonical="https://sistecpos.com/ventas"
      />
      <Breadcrumbs items={[{ label: "Ventas" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="container px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur">
              <Sparkles className="h-3 w-3 mr-1" />Ofertas Especiales
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Combos y Paquetes<br />
              <span className="text-primary-foreground/80">para tu Negocio</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Paquetes diseñados con todo lo que necesitas: software, hardware, implementación y soporte técnico incluido.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" />Garantía incluida</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Soporte técnico</span>
              <span className="flex items-center gap-1.5"><ShoppingCart className="h-4 w-4" />Pago seguro</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 max-w-6xl mx-auto">
            <h2 className="text-center text-lg font-bold text-muted-foreground uppercase tracking-wider mb-8">
              ⭐ Destacados
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((page, i) => (
                <FeaturedCard key={page.id} page={page} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Grid */}
      <section className="py-12 md:py-20">
        <div className="container px-4 max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured.length > 0 ? regular : pages).map((page, i) => (
                <OfferCard key={page.id} page={page} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-muted/50 border-t">
        <div className="container px-4 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">¿No encuentras lo que buscas?</h2>
          <p className="text-muted-foreground mb-6">Armamos un paquete a la medida de tu negocio.</p>
          <Button size="lg" className="gap-2" asChild>
            <a href={buildUrl("Hola, quiero un paquete personalizado para mi negocio")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />Pedir Cotización Personalizada
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function FeaturedCard({ page, index }: { page: any; index: number }) {
  const savingsPct = page.original_price_cop && page.original_price_cop > page.price_cop
    ? Math.round(((page.original_price_cop - page.price_cop) / page.original_price_cop) * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
      <Card className="overflow-hidden border-primary ring-2 ring-primary/20 shadow-xl hover:shadow-2xl transition-all group">
        <div className="flex flex-col md:flex-row">
          {page.gallery_urls?.length > 0 && (
            <div className="md:w-2/5 aspect-video md:aspect-auto bg-muted">
              <img src={page.gallery_urls[0]} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
          )}
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            {page.badge && (
              <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                <Star className="h-3 w-3 mr-1" />{page.badge}
              </Badge>
            )}
            <h3 className="text-xl font-bold mb-1">{page.title}</h3>
            {page.subtitle && <p className="text-sm text-muted-foreground mb-2">{page.subtitle}</p>}
            {page.description && <p className="text-sm text-muted-foreground mb-4">{page.description}</p>}
            <div className="flex items-end justify-between mt-auto pt-4">
              <div>
                {page.original_price_cop && page.original_price_cop > page.price_cop && (
                  <p className="text-sm text-muted-foreground line-through">{formatCOP(page.original_price_cop)}</p>
                )}
                <span className="text-3xl font-black text-primary">{formatCOP(page.price_cop)}</span>
                {savingsPct > 0 && (
                  <Badge variant="destructive" className="ml-2 gap-1">
                    <TrendingDown className="h-3 w-3" />-{savingsPct}%
                  </Badge>
                )}
              </div>
              <Button asChild>
                <Link to={`/venta/${page.slug}`}>Ver Oferta <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

function OfferCard({ page, index }: { page: any; index: number }) {
  const savingsPct = page.original_price_cop && page.original_price_cop > page.price_cop
    ? Math.round(((page.original_price_cop - page.price_cop) / page.original_price_cop) * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
      <Card className="h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl group overflow-hidden">
        {page.gallery_urls?.length > 0 && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img src={page.gallery_urls[0]} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        )}
        {page.badge && (
          <div className="bg-cta text-cta-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
            {page.badge}
          </div>
        )}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{page.title}</h3>
          {page.subtitle && <p className="text-xs text-muted-foreground mb-2">{page.subtitle}</p>}
          {page.description && <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{page.description}</p>}

          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 mb-4 text-center">
            {page.original_price_cop && page.original_price_cop > page.price_cop && (
              <p className="text-xs text-muted-foreground line-through">{formatCOP(page.original_price_cop)}</p>
            )}
            <span className="text-2xl font-black text-primary">{formatCOP(page.price_cop)}</span>
            {savingsPct > 0 && (
              <Badge variant="destructive" className="gap-1 ml-2 text-xs">
                <TrendingDown className="h-3 w-3" />-{savingsPct}%
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
}

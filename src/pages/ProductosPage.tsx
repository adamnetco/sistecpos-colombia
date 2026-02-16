import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Printer, Tag, CircleDollarSign, Barcode, ScrollText,
  MessageCircle, CheckCircle2, FileText, ArrowRight,
  Sparkles, Crown, Building2, ShoppingCart, Truck,
  TrendingDown, CalendarClock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useProductTracking } from "@/hooks/useProductTracking";
import { ProductFilters, type ProductFiltersState } from "@/components/productos/ProductFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, collectionPageSchema } from "@/components/seo/JsonLd";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

interface DBProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price_cop: number;
  original_price_cop: number | null;
  price_usd: number | null;
  original_price_usd: number | null;
  features: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
  product_type: string;
  stock: number;
  sort_order: number;
  catalog_categories: { name: string; slug: string } | null;
  catalog_brands: { name: string } | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

const formatPriceUSD = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price);

const getLicenseIcon = (name: string) => {
  if (name.includes("Multitienda") || name.includes("sucursales")) return Building2;
  if (name.includes("PREMIUM") || name.includes("Premium")) return Crown;
  return FileText;
};

const getCategoryIcon = (slug: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer, etiquetas: Tag, cajones: CircleDollarSign,
    lectores: Barcode, papel: ScrollText, licencias: FileText, modulos: FileText,
  };
  return icons[slug] || Printer;
};

const ProductCard = ({ product, index }: { product: DBProduct; index: number }) => {
  const { addItem } = useCart();
  const { trackEvent } = useProductTracking();
  const catSlug = product.catalog_categories?.slug || "";
  const isLicense = catSlug === "licencias" || catSlug === "modulos";
  const CategoryIcon = isLicense ? getLicenseIcon(product.name) : getCategoryIcon(catSlug);
  const hasImage = product.image_url && !isLicense;

  // Pricing logic
  const hasDiscount = !!product.original_price_cop && product.original_price_cop > product.price_cop;
  const discountPct = hasDiscount
    ? Math.round(((product.original_price_cop! - product.price_cop) / product.original_price_cop!) * 100)
    : 0;

  // For licenses: monthly is informational only (only annual sales)
  const isAnnualLicense = isLicense && !product.slug.includes("vitalicia");
  const monthlyRef = isAnnualLicense
    ? Math.round(product.price_cop / (product.slug.includes("2-anos") ? 24 : 12))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 relative overflow-hidden">
        {/* Badges row */}
        <div className="absolute top-0 right-0 z-10 flex flex-col items-end gap-1 p-2">
          {product.is_offer && (
            <Badge className="bg-destructive text-destructive-foreground font-bold px-2.5 py-0.5 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />¡Oferta!
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-whatsapp/10 text-whatsapp border-0 px-2.5 py-0.5 text-xs">
              <Crown className="h-3 w-3 mr-1" />Popular
            </Badge>
          )}
        </div>

        <CardContent className="p-5 flex-1">
          {/* Image / Icon */}
          {hasImage ? (
            <div className="mb-4 bg-muted/30 rounded-xl p-4 flex items-center justify-center">
              <img src={product.image_url!} alt={product.name} className="h-28 w-auto object-contain" loading="lazy" decoding="async" />
            </div>
          ) : (
            <div className="mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLicense ? "bg-gradient-to-br from-primary/20 to-primary/5" : "bg-primary/10"}`}>
                <CategoryIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}

          <h3 className="font-semibold text-base mb-1.5 leading-tight">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

          {/* Features (max 3) */}
          <div className="space-y-1.5 mb-4">
            {(product.features || []).slice(0, 3).map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-whatsapp shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* ─── PRICING BLOCK ─── */}
          <div className="mt-auto pt-4 border-t space-y-1.5">
            {/* Discount badge */}
            {hasDiscount && discountPct > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-0.5 mb-1">
                <TrendingDown className="h-3 w-3" />-{discountPct}%
              </Badge>
            )}

            {/* COP Price — ALWAYS FIRST & PROMINENT */}
            <div className="flex items-baseline gap-2">
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price_cop!)}</span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-primary">{formatPrice(product.price_cop)}</span>
              <span className="text-xs font-medium text-muted-foreground">COP</span>
              {isAnnualLicense && <span className="text-xs text-muted-foreground">/año</span>}
            </div>

            {/* Monthly ref — informational only for licenses */}
            {isAnnualLicense && monthlyRef > 0 && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CalendarClock className="h-3 w-3 shrink-0" />
                Equivale a {formatPrice(monthlyRef)}/mes <span className="italic">(solo venta anual)</span>
              </p>
            )}

            {/* Vitalicia special note */}
            {product.slug === "licencia-software-pos-vitalicia" && (
              <p className="text-[11px] text-primary font-medium">Pago único de por vida · Hosting anual: $99 USD</p>
            )}

            {/* USD reference */}
            {product.price_usd && (
              <p className="text-[11px] text-muted-foreground">
                Ref. casa de desarrollo: {formatPriceUSD(product.price_usd)} USD
                {product.original_price_usd && product.original_price_usd > product.price_usd && (
                  <span className="line-through ml-1">{formatPriceUSD(product.original_price_usd)}</span>
                )}
              </p>
            )}

            {/* Service note */}
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
              <Truck className="h-3 w-3 shrink-0" />
              {isLicense ? "Instalación y configuración incluida" : "Incluye instalación en tu negocio"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            asChild
            onClick={() => trackEvent("view", product.id, product.name)}
          >
            <Link to={`/productos/${product.slug}`}>Ver más <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={() => {
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price_cop: product.price_cop,
                price_usd: product.price_usd,
                image_url: product.image_url,
              });
              trackEvent("cart_add", product.id, product.name);
              toast.success(`${product.name} agregado a la cotización`);
            }}
          >
            <ShoppingCart className="h-4 w-4" />Agregar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const ProductosPage = () => {
  const { buildUrl } = useWhatsAppConfig();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["public_catalog_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, catalog_categories(name, slug), catalog_brands(name)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as DBProduct[];
    },
  });

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price_cop), 1), [products]);

  const [filters, setFilters] = useState<ProductFiltersState>({
    search: "", category: "all", brand: "all", priceRange: [0, 99999999], offersOnly: false,
  });

  // When products load, adjust max price
  const effectiveMaxPrice = maxPrice > 1 ? maxPrice : 99999999;

  const categories = useMemo(() => {
    const slugs = new Set<string>();
    return products
      .filter(p => p.catalog_categories && !slugs.has(p.catalog_categories.slug) && slugs.add(p.catalog_categories.slug))
      .map(p => ({ slug: p.catalog_categories!.slug, name: p.catalog_categories!.name }));
  }, [products]);

  const brands = useMemo(() => {
    const names = new Set<string>();
    return products
      .filter(p => p.catalog_brands && !names.has(p.catalog_brands.name) && names.add(p.catalog_brands.name))
      .map(p => ({ name: p.catalog_brands!.name }));
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!p.name.toLowerCase().includes(s) && !p.description?.toLowerCase().includes(s)) return false;
      }
      if (filters.category !== "all" && p.catalog_categories?.slug !== filters.category) return false;
      if (filters.brand !== "all" && p.catalog_brands?.name !== filters.brand) return false;
      if (filters.offersOnly && !p.is_offer) return false;
      if (p.price_cop < filters.priceRange[0] || p.price_cop > filters.priceRange[1]) return false;
      return true;
    });
  }, [products, filters]);

  return (
    <Layout>
      <DynamicMeta
        title="Productos y Hardware POS | Impresoras, Lectores, Cajones | SistecPOS"
        description="Encuentra impresoras térmicas, lectores de códigos de barras, cajones monederos y papel térmico para tu punto de venta. Envío a toda Colombia."
        canonical="https://sistecpos.com/productos"
      />
      <JsonLd data={collectionPageSchema({ name: "Productos y Hardware POS", description: "Catálogo de licencias, impresoras térmicas, lectores de códigos de barras y cajones monederos para puntos de venta en Colombia.", url: "https://sistecpos.com/productos" })} />
      <Breadcrumbs items={[{ label: "Productos" }]} />
      <section id="titulo" className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-destructive/10 text-destructive border-0 px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />Ofertas Especiales Disponibles
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Licencias y <span className="gradient-text">Equipos POS</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Licencias de software y hardware con instalación presencial en tu negocio
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-96 rounded-xl" />)}
            </div>
          ) : (
            <>
              <ProductFilters
                filters={filters}
                onChange={setFilters}
                categories={categories}
                brands={brands}
                maxPrice={effectiveMaxPrice}
              />

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <p className="text-lg">No se encontraron productos con esos filtros</p>
                  <Button variant="outline" className="mt-4" onClick={() => setFilters({ search: "", category: "all", brand: "all", priceRange: [0, effectiveMaxPrice], offersOnly: false })}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Mostrando {filtered.length} de {products.length} productos
              </p>
            </>
          )}
        </div>
      </section>

      <section id="distribuidor" className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-0"><Crown className="h-3 w-3 mr-1" />Distribuidor Autorizado</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Licencias con <span className="gradient-text">Instalación Incluida</span></h2>
                <p className="text-muted-foreground mb-6">Somos distribuidores autorizados del software POS en la nube más completo de Colombia. Precios directos de fábrica con servicio local en Santander.</p>
                <ul className="space-y-3">
                  {["Instalación y configuración presencial incluida", "Capacitación a tu equipo de trabajo", "Soporte técnico local y remoto", "Precios en USD, pagas en pesos colombianos"].map(t => (
                    <li key={t} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-whatsapp" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-semibold text-lg mb-4">¿No sabes cuál licencia elegir?</h3>
                <p className="text-sm text-muted-foreground mb-4">Te asesoramos gratis según el tamaño de tu negocio, cantidad de usuarios y necesidades específicas.</p>
                <div className="space-y-3">
                  <Button size="lg" className="w-full btn-whatsapp gap-2" asChild>
                    <a href={buildUrl("Hola, necesito asesoría para elegir la licencia correcta para mi negocio")} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5" />Asesoría Gratuita
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2" asChild>
                    <Link to="/comparativa-licencias"><ArrowRight className="h-5 w-5" />Comparar con otros POS</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="instalacion" className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/10 text-whatsapp mb-4">
              <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Servicio Incluido</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Todos los productos incluyen instalación</h2>
            <p className="text-muted-foreground mb-6">Vamos a tu negocio en el Área Metropolitana de Bucaramanga, instalamos y configuramos todo para que funcione perfectamente.</p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href={buildUrl("Hola, quiero cotizar equipos para mi negocio")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />Solicitar Cotización Completa
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductosPage;

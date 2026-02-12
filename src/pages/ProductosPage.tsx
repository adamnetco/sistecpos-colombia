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
  Sparkles, Crown, Building2, ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useProductTracking } from "@/hooks/useProductTracking";
import { ProductFilters, type ProductFiltersState } from "@/components/productos/ProductFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, softwareApplicationSchema } from "@/components/seo/JsonLd";
import { toast } from "sonner";
import { useState, useMemo } from "react";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 relative overflow-hidden">
        {product.is_offer && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className="rounded-none rounded-bl-lg bg-destructive text-destructive-foreground font-bold px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />¡Oferta!
            </Badge>
          </div>
        )}
        <CardContent className="p-6 flex-1">
          {hasImage ? (
            <div className="relative mb-4 bg-muted/30 rounded-xl p-4 flex items-center justify-center">
              <img src={product.image_url!} alt={product.name} className="h-32 w-auto object-contain" />
              {product.is_featured && (
                <Badge className="absolute top-2 left-2 bg-whatsapp/10 text-whatsapp border-0">
                  <Crown className="h-3 w-3 mr-1" />Popular
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLicense ? "bg-gradient-to-br from-primary/20 to-primary/5" : "bg-primary/10"}`}>
                <CategoryIcon className="h-6 w-6 text-primary" />
              </div>
              {product.is_featured && (
                <Badge className="bg-whatsapp/10 text-whatsapp border-0">
                  <Crown className="h-3 w-3 mr-1" />Popular
                </Badge>
              )}
            </div>
          )}
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
          <div className="space-y-2 mb-4">
            {(product.features || []).slice(0, 4).map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            {isLicense && product.price_usd ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  {product.original_price_usd && (
                    <span className="text-sm text-muted-foreground line-through">{formatPriceUSD(product.original_price_usd)}</span>
                  )}
                  <span className="text-2xl font-bold text-primary">{formatPriceUSD(product.price_usd)}</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                <p className="text-xs text-muted-foreground">≈ {formatPrice(product.price_cop)} COP</p>
                {product.slug === "licencia-software-pos-vitalicia" ? (
                  <p className="text-xs text-primary font-medium mt-1">+ Hosting anual: $99 USD</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatPriceUSD(Math.round(product.price_usd / (product.slug.includes("2-anos") ? 26 : 12)))}/mes USD
                  </p>
                )}
              </div>
            ) : (
              <>
                {product.original_price_cop && (
                  <p className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price_cop)}</p>
                )}
                <p className="text-2xl font-bold text-primary">{formatPrice(product.price_cop)}</p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isLicense ? "Instalación y configuración incluida" : "Incluye instalación y configuración"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-1"
            asChild
            onClick={() => trackEvent("view", product.id, product.name)}
          >
            <Link to={`/productos/${product.slug}`}>Ver más <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button
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
      <JsonLd data={softwareApplicationSchema({ name: "SistecPOS", description: "Catálogo de licencias y hardware POS para puntos de venta en Colombia.", url: "https://sistecpos.com/productos" })} />
      <Breadcrumbs items={[{ label: "Productos" }]} />
      <section className="relative py-16 md:py-20 overflow-hidden">
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

      <section className="py-8 md:py-12">
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

      <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-background">
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
                    <a href="https://wa.me/573176268307?text=Hola,%20necesito%20asesoría%20para%20elegir%20la%20licencia%20correcta%20para%20mi%20negocio" target="_blank" rel="noopener noreferrer">
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

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-whatsapp/10 text-whatsapp mb-4">
              <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Servicio Incluido</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Todos los productos incluyen instalación</h2>
            <p className="text-muted-foreground mb-6">Vamos a tu negocio en el Área Metropolitana de Bucaramanga, instalamos y configuramos todo para que funcione perfectamente.</p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href="https://wa.me/573176268307?text=Hola,%20quiero%20cotizar%20equipos%20para%20mi%20negocio" target="_blank" rel="noopener noreferrer">
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

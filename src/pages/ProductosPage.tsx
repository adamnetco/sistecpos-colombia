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
  TrendingDown, CalendarClock, Puzzle, Gift, BookOpen, Store, ShoppingBag, Box,
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

interface ModuleInfo {
  id: string;
  name: string;
  is_free: boolean;
  price_cop: number;
  slug: string;
}

interface PlanModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  is_free: boolean;
  price_cop: number;
  is_included_in_plans: string[];
  allowed_plan_keys: string[];
  show_in_catalog: boolean;
  is_active: boolean;
  sort_order: number;
  category_id: string | null;
  tags: string[];
  catalog_categories: { name: string; slug: string } | null;
  _isModule: true;
}

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
  modules?: ModuleInfo[];
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

          {/* Módulos asociados con show_in_catalog */}
          {product.modules && product.modules.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Módulos</p>
              {product.modules.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 text-xs">
                  {m.is_free ? (
                    <Gift className="h-3 w-3 text-whatsapp shrink-0" />
                  ) : (
                    <Puzzle className="h-3 w-3 text-primary shrink-0" />
                  )}
                  <span className="truncate">{m.name}</span>
                  {!m.is_free && m.price_cop > 0 && (
                    <span className="ml-auto shrink-0 text-primary font-medium">
                      +{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(m.price_cop)}
                    </span>
                  )}
                  {m.is_free && (
                    <Badge className="ml-auto shrink-0 text-[9px] h-4 px-1 bg-whatsapp/10 text-whatsapp border-0">Incluido</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

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
            {isLicense ? (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <Truck className="h-3 w-3 shrink-0" />
                Incluye instalación y configuración en tu negocio
              </p>
            ) : (
              <div className="space-y-1 pt-1">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3 shrink-0" />
                  Envío con costo adicional · Garantía de fábrica
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-whatsapp shrink-0" />
                  Clientes con software POS: instalación de 1 equipo incluida
                </p>
              </div>
            )}
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

// ─── Module icon map ───
const MODULE_ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Store, FileText, ShoppingBag, Box, Puzzle,
};
const getModuleIcon = (icon: string) => MODULE_ICON_MAP[icon] || Puzzle;

// ─── ModuleCard ───
const ModuleCard = ({ mod, index }: { mod: PlanModule; index: number }) => {
  const isPaid = !mod.is_free && mod.price_cop > 0;
  const ModIcon = getModuleIcon(mod.icon);
  const { buildUrl } = useWhatsAppConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 relative overflow-hidden">
        {/* Badge top-right */}
        <div className="absolute top-0 right-0 z-10 p-2">
          <Badge className={`text-xs border-0 ${isPaid ? "bg-primary/10 text-primary" : "bg-whatsapp/10 text-whatsapp"}`}>
            {isPaid ? <Puzzle className="h-3 w-3 mr-1" /> : <Gift className="h-3 w-3 mr-1" />}
            {isPaid ? "Add-on" : "Incluido"}
          </Badge>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Icon */}
          <div className="mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <ModIcon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <h3 className="font-semibold text-base mb-1.5 leading-tight pr-14">{mod.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{mod.description}</p>

          {/* Category + Tags */}
          {((mod.catalog_categories) || (mod.tags && mod.tags.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {mod.catalog_categories && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-0.5">
                  📂 {mod.catalog_categories.name}
                </Badge>
              )}
              {(mod.tags || []).slice(0, 3).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] h-5 px-1.5">#{t}</Badge>
              ))}
            </div>
          )}

          {/* Plan compatibility info */}
          {mod.is_included_in_plans.length > 0 && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-whatsapp">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Incluido en {mod.is_included_in_plans.length} plan{mod.is_included_in_plans.length > 1 ? "es" : ""}</span>
            </div>
          )}
          {mod.allowed_plan_keys.length > 0 && !mod.is_free && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Puzzle className="h-3.5 w-3.5 shrink-0" />
              <span>Disponible en {mod.allowed_plan_keys.length} plan{mod.allowed_plan_keys.length > 1 ? "es" : ""}</span>
            </div>
          )}

          {/* Pricing — pushes to bottom */}
          <div className="mt-auto pt-4 border-t space-y-1.5">
            {isPaid ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-primary">{formatPrice(mod.price_cop)}</span>
                  <span className="text-xs font-medium text-muted-foreground">COP</span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Puzzle className="h-3 w-3 shrink-0" />Complemento adicional a tu licencia
                </p>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-whatsapp shrink-0" />
                <span className="text-sm font-semibold text-whatsapp">Sin costo adicional</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
            <Link to={`/modulos/${mod.slug}`}>
              Ver detalle <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" className="flex-1 gap-1 btn-whatsapp" asChild>
            <a
              href={buildUrl(`Hola, quiero información sobre el módulo ${mod.name} para SistecPOS`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />Consultar
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const ProductosPage = () => {
  const { buildUrl } = useWhatsAppConfig();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["public_catalog_products_with_modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, catalog_categories(name, slug), catalog_brands(name)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;

      // Fetch modules that should show in catalog (for attaching to product cards)
      const { data: catalogModules } = await supabase
        .from("plan_modules")
        .select("id, name, is_free, price_cop, slug")
        .eq("is_active", true)
        .eq("show_in_catalog", true);

      // Fetch product-module links
      const productIds = (data || []).map((p: any) => p.id);
      const { data: links } = productIds.length
        ? await supabase
            .from("catalog_product_modules")
            .select("product_id, module_id")
            .in("product_id", productIds)
        : { data: [] };

      // Attach modules to each product
      const modulesMap: Record<string, ModuleInfo[]> = {};
      (links || []).forEach((link: any) => {
        const mod = (catalogModules || []).find((m: any) => m.id === link.module_id);
        if (mod) {
          if (!modulesMap[link.product_id]) modulesMap[link.product_id] = [];
          modulesMap[link.product_id].push(mod);
        }
      });

      return (data || []).map((p: any) => ({ ...p, modules: modulesMap[p.id] || [] })) as DBProduct[];
    },
  });

  // Fetch standalone module catalog entries
  const { data: catalogModules = [], isLoading: loadingModules } = useQuery({
    queryKey: ["public_catalog_modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_modules")
        .select("id, name, slug, description, icon, is_free, price_cop, is_included_in_plans, allowed_plan_keys, show_in_catalog, is_active, sort_order, category_id, tags, catalog_categories(name, slug)")
        .eq("is_active", true)
        .eq("show_in_catalog", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []).map((m: any) => ({ ...m, _isModule: true as const })) as PlanModule[];
    },
  });

  const isLoading = loadingProducts || loadingModules;

  const allPrices = useMemo(
    () => [...products.map(p => p.price_cop), ...catalogModules.filter(m => m.price_cop > 0).map(m => m.price_cop)],
    [products, catalogModules]
  );
  const maxPrice = useMemo(() => Math.max(...allPrices, 1), [allPrices]);

  const [filters, setFilters] = useState<ProductFiltersState>({
    search: "", category: "all", brand: "all", priceRange: [0, 99999999], offersOnly: false,
  });

  const effectiveMaxPrice = maxPrice > 1 ? maxPrice : 99999999;

  // Categories: merge product categories + module categories
  const categories = useMemo(() => {
    const slugs = new Set<string>();
    const result: { slug: string; name: string }[] = [];
    products.forEach(p => {
      if (p.catalog_categories && !slugs.has(p.catalog_categories.slug)) {
        slugs.add(p.catalog_categories.slug);
        result.push({ slug: p.catalog_categories.slug, name: p.catalog_categories.name });
      }
    });
    catalogModules.forEach(m => {
      if (m.catalog_categories && !slugs.has(m.catalog_categories.slug)) {
        slugs.add(m.catalog_categories.slug);
        result.push({ slug: m.catalog_categories.slug, name: m.catalog_categories.name });
      }
    });
    return result;
  }, [products, catalogModules]);

  const brands = useMemo(() => {
    const names = new Set<string>();
    return products
      .filter(p => p.catalog_brands && !names.has(p.catalog_brands.name) && names.add(p.catalog_brands.name))
      .map(p => ({ name: p.catalog_brands!.name }));
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
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

  // Filter modules — now support category filter and tags in search
  const filteredModules = useMemo(() => {
    if (filters.offersOnly) return [];
    if (filters.brand !== "all") return [];
    return catalogModules.filter(m => {
      // Category filter: if active, only show modules that match (or no category on module → hide)
      if (filters.category !== "all") {
        if (m.catalog_categories?.slug !== filters.category) return false;
      }
      // Search: name, description, AND tags
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const inName = m.name.toLowerCase().includes(s);
        const inDesc = m.description?.toLowerCase().includes(s) ?? false;
        const inTags = (m.tags || []).some(t => t.toLowerCase().includes(s));
        if (!inName && !inDesc && !inTags) return false;
      }
      if (m.price_cop < filters.priceRange[0]) return false;
      return true;
    });
  }, [catalogModules, filters]);

  const totalItems = filteredProducts.length + filteredModules.length;

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

              {totalItems === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <p className="text-lg">No se encontraron productos con esos filtros</p>
                  <Button variant="outline" className="mt-4" onClick={() => setFilters({ search: "", category: "all", brand: "all", priceRange: [0, effectiveMaxPrice], offersOnly: false })}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <>
                  {/* Products grid */}
                  {filteredProducts.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </div>
                  )}

                  {/* Modules section — separate heading for clarity */}
                  {filteredModules.length > 0 && (
                    <div className={filteredProducts.length > 0 ? "mt-12" : ""}>
                      {filteredProducts.length > 0 && (
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Puzzle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">Módulos y Add-ons</h2>
                            <p className="text-sm text-muted-foreground">Amplía las funcionalidades de tu software POS</p>
                          </div>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredModules.map((mod, index) => (
                          <ModuleCard key={`mod-${mod.id}`} mod={mod} index={index} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Mostrando {totalItems} de {products.length + catalogModules.length} productos y módulos
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
              <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Software POS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Las licencias incluyen instalación y configuración</h2>
            <p className="text-muted-foreground mb-6">Vamos a tu negocio en el Área Metropolitana de Bucaramanga, instalamos el software, configuramos impresoras en red y capacitamos a tu equipo. Hardware: envío y garantía de fábrica incluidos, instalación para clientes con software POS.</p>
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

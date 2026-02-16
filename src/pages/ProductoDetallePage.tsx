import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, CheckCircle2, ArrowLeft, Printer, Tag,
  CircleDollarSign, Barcode, ScrollText, FileText, Package, Settings, Truck, ShoppingCart,
  Play, Download, ChevronLeft, ChevronRight, TrendingDown, CalendarClock, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { JsonLd, productSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { ProductServicesSection } from "@/components/pricing/ProductServicesSection";
import { HardwareServicesSection } from "@/components/productos/HardwareServicesSection";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

const formatPriceUSD = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price);
const getCategoryIcon = (slug: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer, etiquetas: Tag, cajones: CircleDollarSign,
    lectores: Barcode, papel: ScrollText, licencias: FileText, modulos: FileText,
  };
  return icons[slug] || Package;
};

const ProductoDetallePage = () => {
  const { buildUrl } = useWhatsAppConfig();
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["public_product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, catalog_categories(name, slug), catalog_brands(name)")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related_products", product?.category_id, product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*, catalog_categories(name, slug), catalog_brands(name)")
        .eq("category_id", product!.category_id!)
        .neq("id", product!.id)
        .eq("is_active", true)
        .order("sort_order")
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!product?.category_id,
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
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return <Navigate to="/productos" replace />;

  const catSlug = (product.catalog_categories as any)?.slug || "";
  const CategoryIcon = getCategoryIcon(catSlug);
  const specs = (product.specifications as any[]) || [];
  const features = (product.features as string[]) || [];
  const includes = (product.includes as string[]) || [];
  const videoUrls = (product.video_urls as string[]) || [];
  const pdfUrls = (product.pdf_urls as any[]) || [];
  const galleryUrls = (product.gallery_urls as string[]) || [];
  
  // Build all images array: main image + gallery
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...galleryUrls,
  ].filter(Boolean);

  return (
    <Layout>
      <SEO
        title={`${product.name} | Hardware POS Colombia | SistecPOS`}
        description={product.long_description || `Compra ${product.name} para tu punto de venta. Envío a toda Colombia con soporte técnico incluido.`}
        canonical={`https://sistecpos.com/productos/${slug}`}
      />
      <JsonLd
        data={productSchema({
          name: product.name,
          description: product.long_description || product.description || "",
          url: `https://sistecpos.com/productos/${slug}`,
          image: product.image_url || undefined,
          priceCOP: product.price_cop,
          priceUSD: product.price_usd || undefined,
          category: catSlug,
        })}
      />

      <Breadcrumbs items={[{ label: "Productos", href: "/productos" }, { label: product.name }]} />

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Link to="/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Volver al catálogo
          </Link>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              {allImages.length > 0 ? (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-2xl bg-muted/30 p-4 flex items-center justify-center overflow-hidden group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImage}
                        src={allImages[selectedImage]}
                        alt={`${product.name} - Imagen ${selectedImage + 1}`}
                        className="max-h-full max-w-full object-contain"
                        fetchPriority="high"
                        decoding="async"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </AnimatePresence>
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(i => (i - 1 + allImages.length) % allImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage(i => (i + 1) % allImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                          {selectedImage + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === i ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-2xl gradient-bg p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <CategoryIcon className="h-32 w-32 mx-auto mb-6 opacity-90" />
                    <p className="text-lg font-medium opacity-80 capitalize">{catSlug}</p>
                  </div>
                </div>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                {product.is_featured && <Badge className="bg-whatsapp/10 text-whatsapp border-0">Popular</Badge>}
                {product.is_offer && <Badge className="bg-destructive/10 text-destructive border-0">Oferta</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-6">{product.long_description}</p>
              <div className="space-y-3 mb-6">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              {/* ─── PRICING BLOCK ─── */}
              {(() => {
                const isLicense = catSlug === "licencias" || catSlug === "modulos";
                const isVitalicia = product.slug?.includes("vitalicia");
                const isAnnualLicense = isLicense && !isVitalicia;
                const hasDiscount = !!product.original_price_cop && product.original_price_cop > product.price_cop;
                const discount = hasDiscount
                  ? Math.round(((product.original_price_cop! - product.price_cop) / product.original_price_cop!) * 100)
                  : 0;
                const monthlyRef = isAnnualLicense
                  ? Math.round(product.price_cop / (product.slug?.includes("2-anos") ? 24 : 12))
                  : 0;

                return (
                  <div className="mb-6 space-y-2">
                    {/* Discount badge */}
                    {hasDiscount && discount > 0 && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <TrendingDown className="h-3 w-3" />Ahorras {discount}% vs precio de lista
                      </Badge>
                    )}

                    {/* Original price struck */}
                    {hasDiscount && (
                      <p className="text-base text-muted-foreground line-through">{formatPrice(product.original_price_cop!)}</p>
                    )}

                    {/* COP Price — PRIMARY */}
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-primary">{formatPrice(product.price_cop)}</p>
                      <span className="text-sm font-semibold text-muted-foreground">COP</span>
                      {isAnnualLicense && <span className="text-sm text-muted-foreground">/año</span>}
                    </div>

                    {/* Monthly ref — informational */}
                    {isAnnualLicense && monthlyRef > 0 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4 shrink-0" />
                        Equivale a {formatPrice(monthlyRef)}/mes
                        <span className="text-xs italic">(solo venta anual)</span>
                      </p>
                    )}

                    {/* Vitalicia */}
                    {isVitalicia && (
                      <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
                        <Info className="h-4 w-4 shrink-0" />
                        Pago único de por vida · Hosting anual: $99 USD
                      </p>
                    )}

                    {/* USD reference */}
                    {product.price_usd && (
                      <div className="rounded-lg bg-muted/50 border px-3 py-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Ref. casa de desarrollo:</span>
                        <span className="font-semibold text-foreground">{formatPriceUSD(product.price_usd)} USD</span>
                        {product.original_price_usd && product.original_price_usd > product.price_usd && (
                          <span className="line-through text-xs">{formatPriceUSD(product.original_price_usd)}</span>
                        )}
                      </div>
                    )}

                    {isLicense ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Truck className="h-4 w-4" />
                        Incluye instalación, configuración e impresoras en red
                      </p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Truck className="h-4 w-4 shrink-0" />
                          Envío con costo adicional · Garantía del fabricante por defectos de fábrica
                        </p>
                        <p className="text-sm text-whatsapp font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Clientes con software POS: instalación de 1 equipo incluida
                        </p>
                        <p className="text-xs text-muted-foreground pl-6">
                          Varias cajas: cotizar instalación · No incluye cableado de red local
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => {
                    addItem({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price_cop: product.price_cop,
                      price_usd: product.price_usd,
                      image_url: product.image_url,
                    });
                    toast.success(`${product.name} agregado a la cotización`);
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />Agregar a Cotización
                </Button>
                <Button size="lg" className="flex-1 btn-whatsapp gap-2" asChild>
                  <a href={buildUrl(`Hola, quiero cotizar: ${product.name}`)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {specs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
                <Card className="h-full border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Especificaciones Técnicas</h2>
                    </div>
                    <div className="space-y-3">
                      {specs.map((spec: any, i: number) => (
                        <div key={spec.label} className={`flex justify-between py-3 ${i < specs.length - 1 ? "border-b" : ""}`}>
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {includes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
                <Card className="h-full border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-whatsapp" />
                      </div>
                      <h2 className="text-xl font-bold">¿Qué incluye?</h2>
                    </div>
                    <div className="space-y-3">
                      {includes.map(item => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Videos */}
      {videoUrls.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Videos Demostrativos</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {videoUrls.map((url, i) => (
                <div key={i} className="aspect-video rounded-2xl overflow-hidden shadow-card">
                  <iframe
                    src={url.replace("watch?v=", "embed/")}
                    title={`Video ${i + 1}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section for Software Products */}
      {(catSlug === "licencias" || catSlug === "modulos" || product.product_type === "software") && (
        <ProductServicesSection />
      )}

      {/* Services Section for Hardware Products */}
      {catSlug !== "licencias" && catSlug !== "modulos" && product.product_type !== "software" && (
        <HardwareServicesSection />
      )}
      {/* PDFs */}
      {pdfUrls.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Catálogos y Documentación</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pdfUrls.map((pdf: any, i: number) => (
                <a
                  key={i}
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-card transition-all"
                >
                  <FileText className="h-8 w-8 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pdf.name}</p>
                    <p className="text-xs text-muted-foreground">Descargar PDF</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Productos Relacionados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp: any, index: number) => {
                const rpSlug = rp.catalog_categories?.slug || "";
                const RelatedIcon = getCategoryIcon(rpSlug);
                return (
                  <motion.div key={rp.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} viewport={{ once: true }}>
                    <Link to={`/productos/${rp.slug}`}>
                      <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <RelatedIcon className="h-6 w-6 text-primary" />
                            </div>
                            {rp.is_featured && <Badge className="bg-whatsapp/10 text-whatsapp border-0">Popular</Badge>}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{rp.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{rp.description}</p>
                          <p className="text-xl font-bold text-primary">{formatPrice(rp.price_cop)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Tienes preguntas sobre este producto?</h2>
            <p className="text-muted-foreground mb-6">Escríbenos por WhatsApp y te asesoramos sin compromiso. Estamos en el Área Metropolitana de Bucaramanga.</p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href={buildUrl(`Hola, tengo preguntas sobre: ${product.name}`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />Preguntar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductoDetallePage;

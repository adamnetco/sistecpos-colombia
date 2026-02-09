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
  Play, Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { JsonLd, productSchema } from "@/components/seo/JsonLd";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

const getCategoryIcon = (slug: string) => {
  const icons: Record<string, typeof Printer> = {
    impresoras: Printer, etiquetas: Tag, cajones: CircleDollarSign,
    lectores: Barcode, papel: ScrollText, licencias: FileText, modulos: FileText,
  };
  return icons[slug] || Package;
};

const ProductoDetallePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

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

      <section className="border-b">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-foreground transition-colors">Productos</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Link to="/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Volver al catálogo
          </Link>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              {product.image_url ? (
                <div className="aspect-square rounded-2xl bg-muted/30 p-8 flex items-center justify-center">
                  <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
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
              <div className="mb-6">
                {product.original_price_cop && (
                  <p className="text-lg text-muted-foreground line-through">{formatPrice(product.original_price_cop)}</p>
                )}
                <p className="text-4xl font-bold text-primary mb-1">{formatPrice(product.price_cop)}</p>
                {product.price_usd && (
                  <p className="text-sm text-muted-foreground">≈ ${product.price_usd} USD</p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                  <Truck className="h-4 w-4" />Incluye instalación y configuración en tu negocio
                </p>
              </div>
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
                  <a href={`https://wa.me/573176268307?text=Hola,%20quiero%20cotizar:%20${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
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
              <a href={`https://wa.me/573176268307?text=Hola,%20tengo%20preguntas%20sobre:%20${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
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

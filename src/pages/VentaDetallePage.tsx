import { useParams, Link } from "react-router-dom";
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
import {
  MessageCircle, ShoppingCart, CheckCircle2, TrendingDown, Video,
  FileDown, ChevronLeft, Package, Shield, Star, ArrowRight,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { WompiCheckoutButton } from "@/components/payments/WompiCheckoutButton";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

export default function VentaDetallePage() {
  const { slug } = useParams<{ slug: string }>();
  const { buildUrl } = useWhatsAppConfig();
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Read coupon from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("cupon");
    if (c) setCouponInput(c);
  }, []);

  const { data: page, isLoading } = useQuery({
    queryKey: ["sales_page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_pages")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["sales_page_items_public", page?.id],
    enabled: !!page,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_page_items")
        .select("*, catalog_products(id, name, slug, price_cop, image_url, product_type), license_pricing(id, plan_label, selling_price_cop, image_url), commercial_packs(id, name, price_cop)")
        .eq("sales_page_id", page!.id)
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const validateCoupon = async () => {
    if (!couponInput.trim()) return;
    const { data } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("code", couponInput.trim().toUpperCase())
      .eq("is_active", true)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (data) {
      setAppliedCoupon(data);
      setCouponApplied(true);
    } else {
      setAppliedCoupon(null);
      setCouponApplied(false);
    }
  };

  const finalPrice = appliedCoupon
    ? (page?.price_cop || 0) - (appliedCoupon.discount_type === "fixed" ? appliedCoupon.discount_value : (page?.price_cop || 0) * appliedCoupon.discount_value / 100)
    : (page?.price_cop || 0);

  const savingsPct = page?.original_price_cop && page.original_price_cop > page.price_cop
    ? Math.round(((page.original_price_cop - page.price_cop) / page.original_price_cop) * 100)
    : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-20">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
          <Button asChild><Link to="/ventas"><ChevronLeft className="h-4 w-4 mr-1" />Ver todas las ofertas</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DynamicMeta
        title={page.meta_title || `${page.title} | SistecPOS`}
        description={page.meta_description || page.description || ""}
        canonical={`https://sistecpos.com/venta/${page.slug}`}
      />
      <Breadcrumbs items={[{ label: "Ventas", href: "/ventas" }, { label: page.title }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            {page.badge && (
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Star className="h-3 w-3 mr-1" />{page.badge}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{page.title}</h1>
            {page.subtitle && <p className="text-lg md:text-xl text-primary-foreground/80 mb-6">{page.subtitle}</p>}
            {page.description && <p className="text-primary-foreground/70 max-w-2xl mx-auto">{page.description}</p>}
          </motion.div>
        </div>
      </section>

      <div className="container px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {page.gallery_urls && page.gallery_urls.length > 0 && (
              <GallerySlider images={page.gallery_urls} />
            )}

            {/* Video */}
            {page.video_url && (
              <Card className="border-0 shadow-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <iframe
                      src={page.video_url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Markdown Description */}
            {page.long_description && (
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{page.long_description}</ReactMarkdown>
                </CardContent>
              </Card>
            )}

            {/* Items */}
            {items.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  ¿Qué incluye?
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item, i) => {
                    const product = item.catalog_products;
                    const license = item.license_pricing;
                    const pack = item.commercial_packs;
                    const name = product?.name || license?.plan_label || pack?.name || item.custom_label || "";
                    const price = product?.price_cop || license?.selling_price_cop || pack?.price_cop || item.custom_price_cop;
                    const img = product?.image_url || license?.image_url;

                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <Card className="border hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            {img ? (
                              <img src={img} alt={name} className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0" />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                {item.item_type === "license" ? <Shield className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{name}</p>
                              <Badge variant="outline" className="text-xs capitalize">{item.item_type}</Badge>
                            </div>
                            {price && <p className="text-sm font-bold text-primary">{formatCOP(price)}</p>}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-card sticky top-24">
              <CardContent className="p-6 space-y-4">
                {/* Price */}
                <div className="text-center">
                  {page.original_price_cop && page.original_price_cop > page.price_cop && (
                    <p className="text-sm text-muted-foreground line-through">{formatCOP(page.original_price_cop)}</p>
                  )}
                  <p className="text-4xl font-black text-primary">
                    {formatCOP(couponApplied ? finalPrice : page.price_cop)}
                  </p>
                  {savingsPct > 0 && !couponApplied && (
                    <Badge variant="destructive" className="gap-1 mt-2">
                      <TrendingDown className="h-3 w-3" />Ahorras {savingsPct}%
                    </Badge>
                  )}
                  {couponApplied && (
                    <Badge className="gap-1 mt-2 bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-3 w-3" />Cupón aplicado
                    </Badge>
                  )}
                </div>

                {/* Coupon */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Código cupón"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                  <Button variant="outline" size="sm" onClick={validateCoupon}>Aplicar</Button>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  {page.price_cop > 0 && (
                    <WompiCheckoutButton
                      amountCents={(couponApplied ? finalPrice : page.price_cop) * 100}
                      className="w-full gap-2"
                      disabled={false}
                    >
                      <ShoppingCart className="h-4 w-4" />Pagar Ahora
                    </WompiCheckoutButton>
                  )}
                  <Button className="w-full gap-2 btn-whatsapp" asChild>
                    <a
                      href={buildUrl(page.cta_whatsapp_message || `Hola, me interesa: ${page.title}`)}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />Pedir Cotización
                    </a>
                  </Button>
                </div>

                {/* PDF */}
                {page.pdf_url && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={page.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileDown className="h-4 w-4" />Descargar PDF
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Gallery Slider ─── */
function GallerySlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <Card className="border-0 shadow-card overflow-hidden">
        <div className="aspect-video bg-muted">
          <img src={images[active]} alt={`Imagen ${active + 1}`} className="w-full h-full object-contain" />
        </div>
      </Card>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

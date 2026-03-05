import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wrench, Headphones, GraduationCap, BrainCircuit, Cable, Clock,
  CheckCircle2, MessageCircle, ShoppingCart, ArrowRight, Shield,
  Sparkles, TrendingUp, Users, Zap, CalendarCheck, PhoneCall,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { usePageContent, getContent } from "@/hooks/usePageContent";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { WompiCheckoutButton } from "@/components/payments/WompiCheckoutButton";

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

interface ServiceProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price_cop: number;
  features: string[] | null;
  is_featured: boolean;
  sort_order: number;
}

const serviceIcons: Record<string, typeof Wrench> = {
  "servicio-puesta-en-marcha": Wrench,
  "servicio-soporte-mensual": Headphones,
  "servicio-soporte-premium": Shield,
  "servicio-capacitacion": GraduationCap,
  "servicio-consultoria-hora": BrainCircuit,
  "servicio-cableado-red": Cable,
  "servicio-bolsa-10-horas": Clock,
};

const ServiciosPage = () => {
  const { buildUrl } = useWhatsAppConfig();
  const { data: blocks } = usePageContent("/servicios");
  const { addItem } = useCart();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services_catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("id, slug, name, description, long_description, price_cop, features, is_featured, sort_order")
        .eq("is_active", true)
        .eq("product_type", "servicio")
        .order("sort_order");
      if (error) throw error;
      return data as ServiceProduct[];
    },
  });

  // Split into categories
  const implementation = services.filter(s => ["servicio-puesta-en-marcha", "servicio-cableado-red"].includes(s.slug));
  const support = services.filter(s => ["servicio-soporte-mensual", "servicio-soporte-premium", "servicio-bolsa-10-horas"].includes(s.slug));
  const training = services.filter(s => ["servicio-capacitacion", "servicio-consultoria-hora"].includes(s.slug));

  return (
    <Layout>
      <DynamicMeta
        title="Servicios Profesionales POS | Implementación, Soporte y Capacitación | SistecPOS"
        description="Servicios de implementación presencial, soporte técnico mensual, capacitación y consultoría para tu punto de venta. Tu negocio operando al 100% desde el día uno."
        canonical="https://sistecpos.com/servicios"
      />
      <Breadcrumbs items={[{ label: "Servicios" }]} />

      {/* ────── HERO ────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-0 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />Respaldo Total para tu Negocio
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                  dangerouslySetInnerHTML={{ __html: getContent(blocks, "hero_title", 'Tu Negocio Operando al <span class="gradient-text">100% desde el Día Uno</span>') }}
              />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                {getContent(blocks, "hero_subtitle", "Imagina tener un equipo dedicado que llega a tu local, configura todo por ti y te acompaña hasta que domines cada función. Eso es exactamente lo que hacemos.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-whatsapp gap-2" asChild>
                  <a href={buildUrl("Hola, quiero cotizar servicios de implementación y soporte para mi negocio")} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />Cotizar Servicios
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="#catalogo"><ArrowRight className="h-5 w-5" />Ver Paquetes</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────── WHY US ────── */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">¿Por qué contratar nuestros servicios?</h2>
              <p className="text-muted-foreground">El proveedor te vende la herramienta. Nosotros hacemos que funcione en tu negocio real.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: "Respuesta Inmediata", desc: "WhatsApp directo con un técnico real, no un chatbot. Resolución en menos de 2 horas." },
                { icon: Users, title: "Presencial en tu Local", desc: "Vamos a tu negocio, instalamos, configuramos y capacitamos a tu equipo." },
                { icon: TrendingUp, title: "Datos de tu Negocio", desc: "Te entregamos informes de ventas para que tomes mejores decisiones." },
                { icon: CalendarCheck, title: "Acompañamiento Continuo", desc: "No desaparecemos después de instalar. Somos tu socio tecnológico permanente." },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all text-center p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────── SERVICE CARDS ────── */}
      <section id="catalogo" className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-16">
              {/* Implementation */}
              <ServiceGroup
                title="Implementación y Puesta en Marcha"
                subtitle="Cobro único — Arrancamos tu operación sin complicaciones"
                items={implementation}
                buildUrl={buildUrl}
                addItem={addItem}
              />
              {/* Support */}
              <ServiceGroup
                title="Soporte Técnico y Mantenimiento"
                subtitle="Pago recurrente — Tu tranquilidad operativa mensual"
                items={support}
                buildUrl={buildUrl}
                addItem={addItem}
                highlight="servicio-soporte-mensual"
              />
              {/* Training */}
              <ServiceGroup
                title="Capacitación y Consultoría"
                subtitle="Inversión en conocimiento — Domina tu sistema"
                items={training}
                buildUrl={buildUrl}
                addItem={addItem}
              />
            </div>
          )}
        </div>
      </section>

      {/* ────── COMPARISON: YOU VS DIY ────── */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Contratarnos vs Hacerlo Tú Mismo
            </h2>
            <Card className="overflow-hidden border-0 shadow-card">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">Característica</th>
                      <th className="p-4 text-center font-medium text-primary">
                        <div className="flex flex-col items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>SistecPOS</span>
                        </div>
                      </th>
                      <th className="p-4 text-center font-medium text-muted-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Hazlo tú mismo</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Instalación de hardware", true, false],
                      ["Configuración de red Wi-Fi", true, false],
                      ["Facturación electrónica DIAN", true, false],
                      ["Capacitación presencial", true, false],
                      ["Soporte por WhatsApp directo", true, false],
                      ["Resolución en < 2 horas", true, false],
                      ["Acompañamiento día de apertura", true, false],
                      ["Videos de auto-aprendizaje", true, true],
                      ["Acceso al software en la nube", true, true],
                    ].map(([label, us, them]) => (
                      <tr key={label as string} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 text-sm">{label as string}</td>
                        <td className="p-3 text-center">
                          {us ? <CheckCircle2 className="h-4 w-4 text-whatsapp mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3 text-center">
                          {them ? <CheckCircle2 className="h-4 w-4 text-muted-foreground mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para que tu negocio funcione <span className="gradient-text">sin dolores de cabeza?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Contáctanos por WhatsApp para una asesoría gratuita y cotización personalizada según el tamaño de tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a href={buildUrl("Hola, quiero cotizar servicios profesionales para mi punto de venta")} target="_blank" rel="noopener noreferrer">
                  <PhoneCall className="h-5 w-5" />Asesoría Gratuita
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/contacto">
                  <MessageCircle className="h-5 w-5" />Formulario de Contacto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* ─── SERVICE GROUP COMPONENT ─── */
function ServiceGroup({
  title, subtitle, items, buildUrl, addItem, highlight,
}: {
  title: string;
  subtitle: string;
  items: ServiceProduct[];
  buildUrl: (msg?: string) => string;
  addItem: (item: { id: string; slug: string; name: string; price_cop: number; image_url: string | null }) => void;
  highlight?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className={`grid gap-6 ${items.length === 1 ? "max-w-md mx-auto" : items.length === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((service, index) => {
          const Icon = serviceIcons[service.slug] || Wrench;
          const isHighlighted = service.slug === highlight;
          const isMonthly = service.slug.includes("soporte");

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${isHighlighted ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border"}`}>
                {isHighlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                    Recomendado
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isHighlighted ? "bg-primary/20" : "bg-primary/10"}`}>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {service.is_featured && (
                      <Badge className="bg-whatsapp/10 text-whatsapp border-0 text-xs">Popular</Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{service.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {(service.features || []).map(f => (
                      <div key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="border-t pt-4 mt-auto">
                    {service.slug === "servicio-capacitacion" ? (
                      <p className="text-xs text-muted-foreground mb-1">Sin costo adicional — incluido en tu plan</p>
                    ) : (
                      <>
                        {isMonthly && <p className="text-xs text-muted-foreground mb-1">Desde</p>}
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-primary">{formatCOP(service.price_cop)}</span>
                          {isMonthly && <span className="text-sm text-muted-foreground">/mes</span>}
                        </div>
                        {isMonthly && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Menos de {formatCOP(Math.round(service.price_cop / 30))}/día por la tranquilidad de tu negocio
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={isHighlighted ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1"
                      asChild
                    >
                      <a href={buildUrl(`Hola, me interesa el servicio: ${service.name} (${formatCOP(service.price_cop)})`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />Cotizar
                      </a>
                    </Button>
                    {service.slug !== "servicio-capacitacion" && (
                      <WompiCheckoutButton
                        amountCents={service.price_cop * 100}
                        className="flex-1 gap-1"
                        disabled={false}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />Comprar
                      </WompiCheckoutButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ServiciosPage;

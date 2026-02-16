import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, faqSchema, softwareApplicationSchema } from "@/components/seo/JsonLd";
import { getCompetitorBySlug, competitors } from "@/data/competitors";
import { PainVsSolutionSection } from "@/components/comparar/PainVsSolutionSection";
import { TimeLostCalculator } from "@/components/comparar/TimeLostCalculator";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { motion } from "framer-motion";
import { Check, X, MessageCircle, ArrowRight, Shield, WifiOff, Users, Wrench, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dianHeroImage from "@/assets/dian-vs-sistecpos-hero.jpg";
import alegraHeroImage from "@/assets/alegra-vs-sistecpos-hero.jpg";
import siigoHeroImage from "@/assets/siigo-vs-sistecpos-hero.jpg";
import worldOfficeHeroImage from "@/assets/world-office-vs-sistecpos-hero.jpg";
import helisaHeroImage from "@/assets/helisa-vs-sistecpos-hero.jpg";
import facturaLatamHeroImage from "@/assets/factura-latam-vs-sistecpos-hero.jpg";
import defontanaHeroImage from "@/assets/defontana-vs-sistecpos-hero.jpg";
import loggroHeroImage from "@/assets/loggro-vs-sistecpos-hero.jpg";
import contabilizaloHeroImage from "@/assets/contabilizalo-vs-sistecpos-hero.jpg";
import bsaleHeroImage from "@/assets/bsale-vs-sistecpos-hero.jpg";
import xubioHeroImage from "@/assets/xubio-vs-sistecpos-hero.jpg";
import tiendanaHeroImage from "@/assets/tiendana-vs-sistecpos-hero.jpg";
import vectorposHeroImage from "@/assets/vectorpos-vs-sistecpos-hero.jpg";
import sitricposHeroImage from "@/assets/sitricpos-vs-sistecpos-hero.jpg";
import conexionPosHeroImage from "@/assets/conexion-pos-vs-sistecpos-hero.jpg";
import aliaddoHeroImage from "@/assets/aliaddo-vs-sistecpos-hero.jpg";
import puvesoftHeroImage from "@/assets/puvesoft-vs-sistecpos-hero.jpg";
import giiticHeroImage from "@/assets/giitic-vs-sistecpos-hero.jpg";
import contodaHeroImage from "@/assets/contoda-vs-sistecpos-hero.jpg";
import doscarHeroImage from "@/assets/doscar-vs-sistecpos-hero.jpg";
import contapymeHeroImage from "@/assets/contapyme-vs-sistecpos-hero.jpg";
import sysplusHeroImage from "@/assets/sysplus-vs-sistecpos-hero.jpg";
import tiendatekHeroImage from "@/assets/tiendatek-vs-sistecpos-hero.jpg";
import cuentiHeroImage from "@/assets/cuenti-vs-sistecpos-hero.jpg";
import hiposHeroImage from "@/assets/hipos-vs-sistecpos-hero.jpg";
import restiposHeroImage from "@/assets/restipos-vs-sistecpos-hero.jpg";
import treintaHeroImage from "@/assets/treinta-vs-sistecpos-hero.jpg";
import ventatpvHeroImage from "@/assets/ventatpv-vs-sistecpos-hero.jpg";
import silposHeroImage from "@/assets/silpos-vs-sistecpos-hero.jpg";
import fudoHeroImage from "@/assets/fudo-vs-sistecpos-hero.jpg";
import appkyteHeroImage from "@/assets/appkyte-vs-sistecpos-hero.jpg";
import loyverseHeroImage from "@/assets/loyverse-vs-sistecpos-hero.jpg";
import dataicoHeroImage from "@/assets/dataico-vs-sistecpos-hero.jpg";
import clausHeroImage from "@/assets/claus-vs-sistecpos-hero.jpg";
import eleventaHeroImage from "@/assets/eleventa-vs-sistecpos-hero.jpg";
import mascontrolHeroImage from "@/assets/mascontrol-vs-sistecpos-hero.jpg";
import softrestaurantHeroImage from "@/assets/softrestaurant-vs-sistecpos-hero.jpg";

const heroImages: Record<string, string> = {
  "facturador-gratuito-dian": dianHeroImage,
  "alegra": alegraHeroImage,
  "siigo": siigoHeroImage,
  "world-office": worldOfficeHeroImage,
  "helisa": helisaHeroImage,
  "factura-latam": facturaLatamHeroImage,
  "defontana": defontanaHeroImage,
  "loogro": loggroHeroImage,
  "contabilizalo": contabilizaloHeroImage,
  "bsale": bsaleHeroImage,
  "xubio": xubioHeroImage,
  "tiendana": tiendanaHeroImage,
  "vectorpos": vectorposHeroImage,
  "sitricpos": sitricposHeroImage,
  "conexion-pos": conexionPosHeroImage,
  "aliaddo": aliaddoHeroImage,
  "puvesoft": puvesoftHeroImage,
  "giitic": giiticHeroImage,
  "contoda": contodaHeroImage,
  "doscar": doscarHeroImage,
  "contapyme": contapymeHeroImage,
  "sysplus": sysplusHeroImage,
  "tiendatek": tiendatekHeroImage,
  "cuenti": cuentiHeroImage,
  "hipos": hiposHeroImage,
  "restipos": restiposHeroImage,
  "treinta": treintaHeroImage,
  "ventatpv": ventatpvHeroImage,
  "silpos": silposHeroImage,
  "fudo": fudoHeroImage,
  "appkyte": appkyteHeroImage,
  "loyverse": loyverseHeroImage,
  "dataico": dataicoHeroImage,
  "claus": clausHeroImage,
  "eleventa": eleventaHeroImage,
  "mascontrol": mascontrolHeroImage,
  "softrestaurant": softrestaurantHeroImage,
};
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-whatsapp mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-destructive/50 mx-auto" />;
  return <span className="text-xs text-muted-foreground text-center block">{value}</span>;
}

const differentiators = [
  { icon: WifiOff, title: "Modo Offline 8 Días", desc: "Funciona sin internet con sincronización automática" },
  { icon: Users, title: "Soporte Presencial", desc: "Instalación y capacitación en tu local" },
  { icon: Shield, title: "DIAN Integrada", desc: "Facturación electrónica sin intermediarios" },
  { icon: Wrench, title: "16 Módulos", desc: "Especializados por tipo de industria" },
];

export default function ComparacionCompetidorPage() {
  const { slug } = useParams<{ slug: string }>();
  const competitor = slug ? getCompetitorBySlug(slug) : undefined;
  const { buildUrl } = useWhatsAppConfig();

  if (!competitor) return <Navigate to="/comparar" replace />;

  const otherCompetitors = competitors.filter((c) => c.slug !== competitor.slug).slice(0, 6);

  return (
    <Layout>
      <DynamicMeta
        title={`${competitor.name} vs SistecPOS | Alternativa a ${competitor.name} en Colombia 2025`}
        description={competitor.metaDescription}
        canonical={`https://sistecpos.com/comparar/${competitor.slug}`}
      />
      <JsonLd data={faqSchema(competitor.faqs)} />
      <JsonLd
        data={softwareApplicationSchema({
          name: "SistecPOS",
          description: `Alternativa a ${competitor.name}: SistecPOS con facturación electrónica DIAN, modo offline 8 días y soporte presencial en Colombia.`,
          url: `https://sistecpos.com/comparar/${competitor.slug}`,
          compareName: competitor.name,
        })}
      />

      <Breadcrumbs
        items={[
          { label: "Comparar POS", href: "/comparar" },
          { label: `${competitor.name} vs SistecPOS` },
        ]}
      />

      {/* Hero */}
      <section id="titulo" className="py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Comparativa 2025
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              ¿Buscas una Alternativa a {competitor.name}?
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-2">
              Descubre por qué más de 500 negocios en Colombia prefieren SistecPOS sobre {competitor.name}.
            </p>
            <p className="text-sm text-primary-foreground/60 mb-8">
              {competitor.type === "open-source" ? "🔓 Open Source" : competitor.type === "gobierno" ? "🏛️ Gobierno" : "☁️ SaaS"} · Origen: {competitor.origin}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a
                  href={buildUrl(`Hola, estoy comparando ${competitor.name} vs SistecPOS y quiero más información`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Asesoría Gratis
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contacto#demo">Prueba Gratis 7 Días</Link>
              </Button>
            </div>
            {heroImages[competitor.slug] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 max-w-4xl mx-auto"
              >
                <img
                  src={heroImages[competitor.slug]}
                  alt={`Comparación visual: ${competitor.name} vs SistecPOS`}
                  className="rounded-xl shadow-2xl w-full"
                  loading="eager"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>


      {/* Key Differentiators */}
      <section id="diferenciadores" className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {differentiators.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center border-primary/10">
                  <CardContent className="p-5">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <d.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{d.title}</h3>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About competitor */}
      <section id="que-es" className="py-16 md:py-20">
        <div className="container px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4 text-center">
              ¿Qué es <span className="gradient-text">{competitor.name}</span>?
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8">{competitor.description}</p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    Fortalezas de {competitor.name}
                  </h3>
                  <ul className="space-y-2">
                    {competitor.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Ventajas de SistecPOS
                  </h3>
                  <ul className="space-y-2">
                    {competitor.sistecposAdvantages.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                        <span className="font-medium">{a}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain vs Solution */}
      {competitor.painPoints && competitor.painPoints.length > 0 && (
        <PainVsSolutionSection
          competitorName={competitor.name}
          painPoints={competitor.painPoints}
        />
      )}

      {/* Time Lost Calculator - DIAN only */}
      {competitor.slug === "facturador-gratuito-dian" && <TimeLostCalculator />}

      {/* Feature Table */}
      <section id="comparativa" className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Comparativa de <span className="gradient-text">Funcionalidades</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl overflow-hidden shadow-card">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Característica</th>
                  <th className="p-4 text-center font-semibold text-muted-foreground">{competitor.name}</th>
                  <th className="p-4 text-center font-semibold text-primary bg-primary/5">
                    SistecPOS
                    <Badge variant="secondary" className="ml-2 text-xs"><Star className="h-3 w-3 mr-1" />#1</Badge>
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitor.features.map((f, i) => (
                  <tr key={f.feature} className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                    <td className="p-4 text-sm font-medium">{f.feature}</td>
                    <td className="p-4"><FeatureValue value={f.competitor} /></td>
                    <td className="p-4 bg-primary/5"><FeatureValue value={f.sistecpos} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {competitor.faqs.length > 0 && (
        <section id="faqs" className="py-16 md:py-20">
          <div className="container px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                Preguntas <span className="gradient-text">Frecuentes</span>
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {competitor.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Other comparisons */}
      <section id="otras-comparativas" className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-4">
              Otras <span className="gradient-text">Comparativas</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-6">
            {otherCompetitors.map((c) => (
              <Link key={c.slug} to={`/comparar/${c.slug}`}>
                <Badge variant="secondary" className="py-2 px-4 hover:bg-primary/20 transition-colors cursor-pointer">
                  {c.name} vs SistecPOS
                </Badge>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/comparar" className="gap-2">
                Ver todas las comparativas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cansado de {competitor.name}?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-2 font-semibold">
              Trae tu base de datos y te regalamos 1 mes gratis.
            </p>
            <p className="text-lg text-primary-foreground/70 mb-8">
              Migración asistida, instalación presencial y capacitación incluida. Sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground gap-2" asChild>
                <Link to="/contacto#demo">
                  Migrar Ahora — Prueba Gratis
                </Link>
              </Button>
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a
                  href={buildUrl(`Hola, quiero migrar de ${competitor.name} a SistecPOS`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Migrar por WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

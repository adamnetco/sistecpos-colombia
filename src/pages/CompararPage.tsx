import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { competitors } from "@/data/competitors";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Shield, WifiOff, Users, Wrench, Star, Globe, Code, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const keyAdvantages = [
  { icon: WifiOff, title: "Modo Offline 8 Días", desc: "Único en Colombia. Funciona sin internet con sincronización automática." },
  { icon: Users, title: "Soporte Presencial", desc: "Instalación, configuración y capacitación directamente en tu local." },
  { icon: Shield, title: "DIAN Integrada", desc: "Facturación electrónica sin intermediarios ni costos adicionales." },
  { icon: Wrench, title: "16 Módulos Especializados", desc: "Adaptado a 24 tipos de negocio: restaurantes, ferreterías, droguerías y más." },
];

const saasCompetitors = competitors.filter((c) => c.type === "saas");
const openSourceCompetitors = competitors.filter((c) => c.type === "open-source");
const gobiernoCompetitors = competitors.filter((c) => c.type === "gobierno");

export default function CompararPage() {
  return (
    <Layout>
      <DynamicMeta
        title="SistecPOS vs Competencia | Comparativas Software POS Colombia 2025"
        description="Compara SistecPOS con Odoo, Siigo, Alegra, Vendty, Cluvi, OlaClick, Square y más. Descubre el mejor software POS para tu negocio en Colombia."
        canonical="https://sistecpos.lovable.app/comparar"
      />

      <Breadcrumbs items={[{ label: "Comparar Software POS" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden relative">
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
            <Badge className="mb-4 bg-white/20 text-white border-white/30">Comparativas 2025</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              SistecPOS vs Competencia
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
              Comparativas detalladas con los principales software POS, ERP y plataformas de facturación de Colombia y el mundo. Elige con información real.
            </p>
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
              <a href="https://wa.me/573176268307?text=Hola,%20quiero%20asesoría%20para%20elegir%20el%20mejor%20POS" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Asesoría Personalizada Gratis
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key advantages */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {keyAdvantages.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center border-primary/10">
                  <CardContent className="p-5">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <a.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Competitors */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                vs Software <span className="gradient-text">SaaS Nacional</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compara SistecPOS con las plataformas SaaS más populares de Colombia.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {saasCompetitors.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/comparar/${c.slug}`}>
                  <Card className="h-full hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {c.name} vs SistecPOS
                        </h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{c.tagline}</p>
                      <Badge variant="secondary" className="text-xs">
                        ☁️ SaaS · {c.origin}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Competitors */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                vs Software <span className="gradient-text">Open Source</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ¿Código abierto o software listo para usar? Compara y decide.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {openSourceCompetitors.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/comparar/${c.slug}`}>
                  <Card className="h-full hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {c.name} vs SistecPOS
                        </h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{c.tagline}</p>
                      <Badge variant="secondary" className="text-xs">
                        🔓 Open Source · {c.origin}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gobierno Competitors */}
      {gobiernoCompetitors.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Landmark className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  vs Herramientas <span className="gradient-text">Gubernamentales</span>
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ¿Las herramientas gratuitas del gobierno son suficientes para un negocio real? Compara y decide.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
              {gobiernoCompetitors.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/comparar/${c.slug}`}>
                    <Card className="h-full hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer group border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                            {c.name} vs SistecPOS
                          </h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{c.tagline}</p>
                        <Badge variant="secondary" className="text-xs">
                          🏛️ Gobierno · {c.origin}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Link to existing comparativa-licencias */}
      <section className="py-12 md:py-16">
        <div className="container px-4 text-center">
          <Card className="max-w-2xl mx-auto border-primary/20">
            <CardContent className="p-8">
              <Star className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Comparativa Detallada de Licencias</h3>
              <p className="text-muted-foreground mb-4">
                Tabla completa con precios, funcionalidades y planes de SistecPOS vs Tiendana, VectorPOS y SitricPOS.
              </p>
              <Button asChild>
                <Link to="/comparativa-licencias" className="gap-2">
                  Ver Comparativa de Licencias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Todavía con Dudas? Pruébalo Gratis
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              7 días gratis, instalación incluida, sin compromiso. La mejor forma de comparar es probando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground" asChild>
                <Link to="/contacto#demo">Prueba Gratis 7 Días</Link>
              </Button>
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
                <a href="https://wa.me/573176268307?text=Hola,%20quiero%20probar%20SistecPOS" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

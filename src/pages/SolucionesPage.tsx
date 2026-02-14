import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, softwareApplicationSchema } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { businessTypes } from "@/data/businessTypes";

export default function SolucionesPage() {
  return (
    <Layout>
      <SEO
        title="Soluciones POS para 24 Tipos de Negocio | SistecPOS"
        description="Software POS especializado para restaurantes, tiendas, ferreterías, farmacias y 20 industrias más. Instalación presencial en Colombia."
        canonical="https://sistecpos.com/soluciones"
      />
      <JsonLd data={softwareApplicationSchema({ name: "SistecPOS", description: "Soluciones POS especializadas para 24 tipos de negocio en Colombia.", url: "https://sistecpos.com/soluciones" })} />
      <Breadcrumbs items={[{ label: "Soluciones" }]} />

      {/* Hero */}
      <section id="titulo" className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {businessTypes.length} Industrias
            </Badge>
            <h1 id="soluciones-titulo" className="text-3xl md:text-5xl font-bold mb-6">
              Soluciones POS para Cada Tipo de Negocio
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Software punto de venta adaptado a las necesidades específicas de tu industria, con módulos especializados e instalación presencial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid de soluciones */}
      <section id="directorio" className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
            {businessTypes.map((solution, index) => (
              <motion.div
                key={solution.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link to={`/soluciones/${solution.slug}`}>
                  <Card className="h-full border shadow-soft hover:shadow-card transition-all hover:-translate-y-1 bg-card group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${solution.color} group-hover:scale-110 transition-transform`}>
                          <solution.icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                            {solution.titleShort}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {solution.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver solución <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta-soluciones" className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 id="contacto-soluciones" className="text-3xl md:text-4xl font-bold mb-6">
              ¿No encuentras tu tipo de negocio?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Nuestro software se adapta a cualquier negocio. Cuéntanos qué necesitas y te asesoramos gratis.
            </p>
            <Button
              size="lg"
              className="btn-whatsapp gap-2"
              asChild
            >
              <a
                href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20SistecPOS%20para%20mi%20negocio"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Hablar con un Asesor
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

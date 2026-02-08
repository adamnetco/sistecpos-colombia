import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Calculator, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { dianArticles } from "@/data/dianArticles";

const tools = [
  {
    title: "Calculadora UVT",
    description: "Convierte pesos colombianos a UVT y viceversa. Actualizada con el valor vigente para 2026.",
    href: "/herramientas/calculadora-uvt",
    icon: Calculator,
  },
  {
    title: "Validador de NIT",
    description: "Verifica si un NIT colombiano tiene el dígito de verificación correcto.",
    href: "/herramientas/validador-nit",
    icon: Hash,
  },
];

export default function GuiasDianHubPage() {
  return (
    <Layout>
      <SEO
        title="Guías DIAN 2026: Facturación Electrónica, UVT y Normativa | SistecPOS"
        description="Guías prácticas sobre facturación electrónica DIAN, habilitación, sanciones y herramientas tributarias para comerciantes colombianos."
        canonical="https://sistecpos.lovable.app/guias-dian"
      />
      <Breadcrumbs items={[{ label: "Guías DIAN" }]} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <BookOpen className="h-3 w-3 mr-1" />
                Centro de Recursos DIAN
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6" id="titulo">
                Guías DIAN para Comerciantes en Colombia
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
                Todo lo que necesitas saber sobre facturación electrónica, habilitación DIAN, sanciones y normativa tributaria. Explicado de forma simple, sin jerga de abogado.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Herramientas <span className="gradient-text">Gratuitas</span>
            </h2>
            <p className="text-muted-foreground mt-2">Calculadoras y validadores para tu día a día tributario.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {tools.map((tool, i) => (
              <motion.div key={tool.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={tool.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cluster 1: Facturador Gratuito */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Guías sobre el <span className="gradient-text">Facturador Gratuito DIAN</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              ¿Usas la solución gratuita de la DIAN? Descubre sus limitaciones y las alternativas.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {dianArticles.filter(a => [
              "facturacion-gratuita-dian",
              "facturador-gratuito-dian-no-funciona",
              "como-facturar-electronicamente-gratis-dian",
              "registro-facturador-gratuito-dian",
              "micrositio-facturacion-electronica-dian",
            ].includes(a.slug)).map((article, i) => (
              <motion.div key={article.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/guias-dian/${article.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <article.heroIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="mb-3 text-xs">{article.heroBadge}</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors text-sm leading-tight">
                        {article.h1}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.metaDescription}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
                        Leer guía <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cluster 2: Habilitación y Normativa */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Habilitación y <span className="gradient-text">Normativa DIAN</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Sanciones, calendarios, límites de UVT y todo lo que necesitas para cumplir con la DIAN.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {dianArticles.filter(a => [
              "habilitar-facturacion-electronica-dian",
              "resolucion-facturacion-electronica-2025",
              "calendario-tributario-dian-2026",
              "sanciones-no-facturar-electronicamente",
              "limite-uvt-pos-2026",
              "documento-soporte-electronico-dian",
            ].includes(a.slug)).map((article, i) => (
              <motion.div key={article.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/guias-dian/${article.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <article.heroIcon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="mb-3 text-xs">{article.heroBadge}</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors text-sm leading-tight">
                        {article.h1}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.metaDescription}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
                        Leer guía <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              ¿Te abruma la DIAN?
            </h2>
            <p className="text-muted-foreground mb-6">
              SistecPOS automatiza tu facturación electrónica, actualiza UVTs y resuelve la normativa por ti. Tú vendes, nosotros nos encargamos del resto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2" asChild>
                <a href="https://wa.me/573176268307?text=Hola,%20quiero%20que%20SistecPOS%20se%20encargue%20de%20mi%20facturación%20DIAN" target="_blank" rel="noopener noreferrer">
                  Prueba Gratis 7 Días
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/comparar/facturador-gratuito-dian" className="gap-2">
                  Comparar con Facturador DIAN
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

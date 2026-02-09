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
import { useDianArticles } from "@/hooks/useDianArticles";
import { CLUSTER_HUB_CONFIG } from "@/components/admin/dian/clusterConfig";

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

/* Cluster render order */
const CLUSTER_ORDER = ["facturador_gratuito", "habilitacion_normativa", "firma_digital", "comercial"] as const;

function ArticleCard({ article, index }: { article: { slug: string; heroIcon: any; heroBadge: string; h1: string; metaDescription: string }; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
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
            <p className="text-xs text-muted-foreground line-clamp-2">{article.metaDescription}</p>
            <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">
              Leer guía <ArrowRight className="h-3 w-3" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function GuiasDianHubPage() {
  const { allArticles, dbArticles, isLoading } = useDianArticles();

  // Group articles by cluster. DB articles have cluster field; static ones use a fallback map.
  const staticClusterMap: Record<string, string> = {
    "facturacion-gratuita-dian": "facturador_gratuito",
    "facturador-gratuito-dian-no-funciona": "facturador_gratuito",
    "como-facturar-electronicamente-gratis-dian": "facturador_gratuito",
    "registro-facturador-gratuito-dian": "facturador_gratuito",
    "micrositio-facturacion-electronica-dian": "facturador_gratuito",
    "habilitar-facturacion-electronica-dian": "habilitacion_normativa",
    "resolucion-facturacion-electronica-2025": "habilitacion_normativa",
    "calendario-tributario-dian-2026": "habilitacion_normativa",
    "sanciones-no-facturar-electronicamente": "habilitacion_normativa",
    "limite-uvt-pos-2026": "habilitacion_normativa",
    "documento-soporte-electronico-dian": "habilitacion_normativa",
    "firma-digital-dian-gratis": "firma_digital",
    "certificados-digitales-facturacion-electronica": "firma_digital",
    "andes-scd-vs-gse": "firma_digital",
    "obtener-firma-electronica-dian": "firma_digital",
    "renovacion-certificado-digital-dian": "firma_digital",
    "facturacion-electronica-pymes-colombia": "comercial",
    "software-inventario-facturacion-electronica": "comercial",
    "top-10-software-pos-colombia": "comercial",
  };

  // Build cluster groups from allArticles
  const clusterGroups: Record<string, typeof allArticles> = {};
  const dbSlugSet = new Set(dbArticles.map((a) => a.slug));

  for (const article of allArticles) {
    // If article comes from DB, use its cluster field
    const dbMatch = dbArticles.find((d) => d.slug === article.slug);
    const cluster = dbMatch
      ? ((dbMatch as any).cluster || "otros")
      : (staticClusterMap[article.slug] || "otros");

    if (!clusterGroups[cluster]) clusterGroups[cluster] = [];
    clusterGroups[cluster].push(article);
  }

  const otherArticles = clusterGroups["otros"] || [];

  return (
    <Layout>
      <SEO
        title="Guías DIAN 2026: Facturación Electrónica, UVT y Normativa | SistecPOS"
        description="Guías prácticas sobre facturación electrónica DIAN, habilitación, sanciones y herramientas tributarias para comerciantes colombianos."
        canonical="https://sistecpos.com/guias-dian"
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

      {/* Dynamic Cluster Sections */}
      {CLUSTER_ORDER.map((clusterKey, sectionIdx) => {
        const config = CLUSTER_HUB_CONFIG[clusterKey];
        const articles = clusterGroups[clusterKey] || [];
        if (articles.length === 0) return null;

        return (
          <section key={clusterKey} className={`py-12 md:py-16 ${sectionIdx % 2 === 0 ? "bg-muted/30" : ""}`}>
            <div className="container px-4">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {config.title} <span className="gradient-text">{config.highlight}</span>
                </h2>
                <p className="text-muted-foreground mt-2">{config.subtitle}</p>
              </motion.div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {articles.map((article, i) => (
                  <ArticleCard key={article.slug} article={article} index={i} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Other / unclustered articles */}
      {otherArticles.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Más <span className="gradient-text">Recursos</span>
              </h2>
              <p className="text-muted-foreground mt-2">Artículos adicionales para ayudarte con tus trámites ante la DIAN.</p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {otherArticles.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

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
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
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

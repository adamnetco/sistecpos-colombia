import { useParams, Navigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";
import { CertificatePricingSection } from "@/components/certificados/CertificatePricingSection";
import { useDianArticle } from "@/hooks/useDianArticles";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export default function GuiaDianPage() {
  const { slug } = useParams<{ slug: string }>();
  const { article, isLoading } = useDianArticle(slug);
  const { buildUrl } = useWhatsAppConfig();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!article) return <Navigate to="/guias-dian" replace />;

  const Icon = article.heroIcon;

  return (
    <Layout>
      <SEO
        title={article.metaTitle}
        description={article.metaDescription}
        canonical={`https://sistecpos.com/guias-dian/${article.slug}`}
      />
      <JsonLd data={faqSchema(article.faqs)} />

      <Breadcrumbs
        items={[
          { label: "Guías DIAN", href: "/guias-dian" },
          { label: article.h1.slice(0, 50) + (article.h1.length > 50 ? "…" : "") },
        ]}
      />

      {/* Hero */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Icon className="h-3 w-3 mr-1" />
                {article.heroBadge}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6" id="titulo">
                {article.h1}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
                {article.heroSubtitle}
              </p>
              <Button size="lg" className="btn-whatsapp gap-2" asChild>
                <a
                  href={buildUrl(article.ctaWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  {article.ctaText}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sections */}
      {article.sections.map((section, idx) => (
        <section
          key={idx}
          className={`py-12 md:py-16 ${idx % 2 === 1 ? "bg-muted/30" : ""}`}
        >
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  {section.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {section.content}
                </p>
                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0 mt-0.5" />
                        <span className="text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Pain vs Solution */}
      {article.painVsSolution && article.painVsSolution.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  El Problema vs <span className="gradient-text">La Solución</span>
                </h2>
              </motion.div>
              <div className="grid gap-4 md:grid-cols-1">
                {article.painVsSolution.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1 text-center sm:text-right">
                          <Badge variant="destructive" className="mb-2">Problema</Badge>
                          <p className="text-sm font-medium">{item.pain}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 rotate-90 sm:rotate-0" />
                        <div className="flex-1 text-center sm:text-left">
                          <Badge className="mb-2 bg-whatsapp text-white">SistecPOS</Badge>
                          <p className="text-sm font-medium">{item.solution}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certificate Pricing (only on firma-digital page) */}
      {article.slug === "firma-digital-dian-gratis" && <CertificatePricingSection />}

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Preguntas <span className="gradient-text">Frecuentes</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {article.faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Contenido Relacionado</h3>
            <div className="flex flex-wrap gap-3">
              {article.relatedLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Badge variant="secondary" className="py-2 px-4 hover:bg-primary/20 transition-colors cursor-pointer">
                    {link.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{article.ctaText}</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Prueba gratis 7 días. Sin tarjeta de crédito. Capacitación incluida.
            </p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a
                href={buildUrl(article.ctaWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

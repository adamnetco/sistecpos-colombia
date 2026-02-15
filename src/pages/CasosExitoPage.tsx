import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ArrowRight, Quote, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export default function CasosExitoPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["public_success_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const businessTypes = [...new Set(stories.map((s: any) => s.business_type))];

  return (
    <Layout>
      <SEO
        title="Casos de Éxito | Negocios que crecieron con SistecPOS"
        description="Descubre cómo restaurantes, tiendas y negocios en Colombia optimizaron sus ventas con nuestro software POS."
        canonical="https://sistecpos.com/casos-de-exito"
      />
      <Breadcrumbs items={[{ label: "Casos de Éxito" }]} />

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-600 border-0">
              <Trophy className="h-3 w-3 mr-1" />Historias Reales
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Casos de <span className="gradient-text">Éxito</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Negocios reales en Colombia que transformaron su operación con SistecPOS
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter by type */}
      {businessTypes.length > 1 && (
        <section className="border-b">
          <div className="container px-4 md:px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {businessTypes.map(t => (
                <Badge key={t} variant="outline" className="capitalize cursor-pointer hover:bg-primary/10">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          ) : stories.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Próximamente compartiremos casos de éxito</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {stories.map((story: any, i: number) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/casos-de-exito/${story.slug}`}>
                    <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 overflow-hidden">
                      {story.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="capitalize text-xs">{story.business_type}</Badge>
                          {story.city && <Badge variant="outline" className="text-xs">{story.city}</Badge>}
                          {story.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 text-xs">Destacado</Badge>}
                        </div>
                        <h2 className="text-xl font-bold mb-2">{story.title}</h2>
                        <p className="text-sm text-muted-foreground mb-3">{story.business_name}</p>
                        {story.quote && (
                          <div className="flex gap-2 mb-4">
                            <Quote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm italic text-muted-foreground line-clamp-2">{story.quote}</p>
                          </div>
                        )}
                        {(story.metrics as any[])?.length > 0 && (
                          <div className="flex gap-4 mb-4">
                            {(story.metrics as any[]).slice(0, 3).map((m: any, j: number) => (
                              <div key={j} className="text-center">
                                <p className="text-lg font-bold text-primary">{m.value}</p>
                                <p className="text-xs text-muted-foreground">{m.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                          Leer caso completo <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Quieres ser nuestro próximo caso de éxito?</h2>
            <p className="text-muted-foreground mb-6">Contacta a nuestro equipo y descubre cómo SistecPOS puede transformar tu negocio.</p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href={buildUrl("Hola, quiero saber cómo SistecPOS puede ayudar a mi negocio")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />Hablar con un Asesor
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

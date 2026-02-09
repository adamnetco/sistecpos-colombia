import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Quote, MessageCircle, Trophy, Target, Lightbulb, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function CasoExitoDetallePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: story, isLoading } = useQuery({
    queryKey: ["public_story", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 rounded-2xl mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Layout>
    );
  }

  if (!story) return <Navigate to="/casos-de-exito" replace />;

  const metrics = (story.metrics as any[]) || [];

  return (
    <Layout>
      <SEO
        title={`${story.title} | Caso de Éxito | SistecPOS`}
        description={story.quote || `Descubre cómo ${story.business_name} transformó su negocio con SistecPOS.`}
        canonical={`https://sistecpos.com/casos-de-exito/${slug}`}
      />

      <section className="border-b">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/casos-de-exito" className="hover:text-foreground transition-colors">Casos de Éxito</Link>
            <span>/</span>
            <span className="text-foreground">{story.business_name}</span>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <Link to="/casos-de-exito" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Volver a casos de éxito
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            {story.image_url && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img src={story.image_url} alt={story.title} className="w-full h-64 md:h-80 object-cover" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">{story.business_type}</Badge>
              {story.city && <Badge variant="outline">{story.city}</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{story.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{story.business_name}{story.contact_name && ` — ${story.contact_name}`}{story.contact_role && `, ${story.contact_role}`}</p>

            {story.quote && (
              <Card className="border-0 shadow-card mb-8 bg-primary/5">
                <CardContent className="p-6 flex gap-4">
                  <Quote className="h-8 w-8 text-primary shrink-0" />
                  <p className="text-lg italic">{story.quote}</p>
                </CardContent>
              </Card>
            )}

            {metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metrics.map((m: any, i: number) => (
                  <Card key={i} className="border-0 shadow-card text-center">
                    <CardContent className="p-4">
                      <p className="text-2xl font-bold text-primary">{m.value}</p>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {story.challenge && (
                <Card className="border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-destructive" />
                      <h2 className="font-bold text-lg">El Desafío</h2>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{story.challenge}</p>
                  </CardContent>
                </Card>
              )}
              {story.solution && (
                <Card className="border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h2 className="font-bold text-lg">La Solución</h2>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{story.solution}</p>
                  </CardContent>
                </Card>
              )}
              {story.results && (
                <Card className="border-0 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h2 className="font-bold text-lg">Resultados</h2>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{story.results}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {story.video_url && (
              <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
                <iframe
                  src={story.video_url.replace("watch?v=", "embed/")}
                  title={story.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Quieres resultados similares?</h2>
            <p className="text-muted-foreground mb-6">Contacta con nuestro equipo y te ayudaremos a encontrar la mejor solución para tu negocio.</p>
            <Button size="lg" className="btn-whatsapp gap-2" asChild>
              <a href={`https://wa.me/573176268307?text=Hola,%20vi%20el%20caso%20de%20${encodeURIComponent(story.business_name)}%20y%20quiero%20algo%20similar%20para%20mi%20negocio`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />Contactar Asesor
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

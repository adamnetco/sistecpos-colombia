import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  businessType?: string;
  maxItems?: number;
  title?: string;
}

export function SuccessStoriesSection({ businessType, maxItems = 3, title = "Casos de Éxito" }: Props) {
  const { data: stories = [] } = useQuery({
    queryKey: ["public_success_stories_section", businessType],
    queryFn: async () => {
      let q = supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .limit(maxItems);
      if (businessType) q = q.eq("business_type", businessType);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  if (stories.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <Button variant="ghost" className="gap-2" asChild>
            <Link to="/casos-de-exito">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story: any, i: number) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/casos-de-exito/${story.slug}`}>
                <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                  {story.image_url && (
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize text-xs">{story.business_type}</Badge>
                      {story.city && <Badge variant="outline" className="text-xs">{story.city}</Badge>}
                    </div>
                    <h3 className="font-semibold mb-2">{story.title}</h3>
                    {story.quote && (
                      <div className="flex gap-2 mb-3">
                        <Quote className="h-3 w-3 text-primary shrink-0 mt-1" />
                        <p className="text-xs italic text-muted-foreground line-clamp-2">{story.quote}</p>
                      </div>
                    )}
                    {(story.metrics as any[])?.length > 0 && (
                      <div className="flex gap-3">
                        {(story.metrics as any[]).slice(0, 2).map((m: any, j: number) => (
                          <div key={j}>
                            <p className="text-sm font-bold text-primary">{m.value}</p>
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupportArticles, useIncrementArticleView, type SupportArticleRow } from "@/hooks/useSupportArticles";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { motion } from "framer-motion";
import {
  Download, ExternalLink, FileDown, HelpCircle, MessageCircle,
  Search, BookOpen, Pin, Eye, Video, ArrowRight, Monitor, Printer,
  Wrench, FileText,
} from "lucide-react";

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  download_url: string;
  file_type: string;
  category: string;
}

const categoryIcons: Record<string, any> = {
  impresoras: Printer,
  drivers: Monitor,
  herramientas: Wrench,
  manuales: FileText,
};

export default function AyudaPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loadingDl, setLoadingDl] = useState(true);
  const { buildUrl } = useWhatsAppConfig();
  const { data: articles = [], isLoading: loadingArticles } = useSupportArticles(true);
  const incrementView = useIncrementArticleView();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    supabase
      .from("client_downloads")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setDownloads((data as DownloadItem[]) || []);
        setLoadingDl(false);
      });
  }, []);

  const grouped = downloads.reduce<Record<string, DownloadItem[]>>((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {});

  const articleCategories = Array.from(new Set(articles.map(a => a.category))).sort();
  const filteredArticles = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.tags || []).some(t => t.includes(q));
    const matchCat = selectedCategory === "all" || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <SEO
        title="Ayuda y Descargas | SistecPOS"
        description="Centro de ayuda, artículos de soporte, descargas de instaladores y herramientas para tu sistema POS."
      />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-bg text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">Centro de Ayuda</h1>
            <p className="text-lg text-primary-foreground/80">
              Encuentra guías, descarga herramientas y resuelve dudas sobre tu sistema POS.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container px-4 py-12 md:py-16 max-w-6xl mx-auto">
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />Artículos
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />Descargas
            </TabsTrigger>
          </TabsList>

          {/* === ARTÍCULOS === */}
          <TabsContent value="articles" className="space-y-6">
            {/* Search */}
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar artículo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-full" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-1.5">
              <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")} className="rounded-full text-xs">
                Todos
              </Button>
              {articleCategories.map(cat => (
                <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)} className="rounded-full capitalize text-xs">
                  {cat}
                </Button>
              ))}
            </div>

            {loadingArticles ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No se encontraron artículos.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/ayuda/${a.slug}`} onClick={() => incrementView.mutate(a.id)} className="block h-full">
                      <Card className="h-full hover:shadow-lg hover:border-primary/40 transition-all group">
                        {a.cover_image_url && (
                          <div className="aspect-[2/1] overflow-hidden rounded-t-lg bg-muted">
                            <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        )}
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-1.5">
                            {a.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                            {a.video_url && <Video className="h-3 w-3 text-red-500" />}
                            <Badge variant="secondary" className="capitalize text-[10px]">{a.category}</Badge>
                          </div>
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                          {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />{a.view_count} vistas
                            </span>
                            <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Leer <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* === DESCARGAS === */}
          <TabsContent value="downloads" className="space-y-8">
            {loadingDl ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : downloads.length === 0 ? (
              <div className="rounded-2xl border bg-card p-16 text-center">
                <FileDown className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Próximamente estarán disponibles las descargas.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([category, items]) => {
                  const Icon = categoryIcons[category] || Download;
                  return (
                    <div key={category}>
                      <h2 className="text-lg font-bold capitalize mb-4 flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {category}
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((d, i) => (
                          <motion.a
                            key={d.id}
                            href={d.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Download className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{d.title}</h3>
                              {d.description && <p className="text-xs text-muted-foreground line-clamp-1">{d.description}</p>}
                              <Badge variant="outline" className="mt-1 text-[10px] capitalize">{d.file_type}</Badge>
                            </div>
                            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Support CTA */}
        <div className="mt-16 rounded-2xl bg-muted/50 border p-8 text-center">
          <h2 className="text-xl font-bold mb-2">¿Necesitas ayuda personalizada?</h2>
          <p className="text-muted-foreground mb-6">Crea un ticket de soporte o escríbenos por WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/clientes">Portal de Clientes</Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <a href={buildUrl("Hola, necesito ayuda con mi sistema POS")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

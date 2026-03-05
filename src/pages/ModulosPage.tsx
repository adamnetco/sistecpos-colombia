import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCOP } from "@/hooks/useLicensePricing";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, Puzzle, CheckCircle2, ArrowRight, Search,
  Sparkles, Shield, Filter,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { usePageContent, getContent } from "@/hooks/usePageContent";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] || Puzzle;
  return <Icon className={className} />;
}

export default function ModulosPage() {
  const { buildUrl } = useWhatsAppConfig();
  const { data: blocks } = usePageContent("/modulos");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "addon">("all");

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["plan_modules_hub"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plan_modules")
        .select("*")
        .eq("is_active", true)
        .eq("show_in_catalog", true)
        .order("sort_order");
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = modules.filter((m: any) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.description || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "free" ? m.is_free : !m.is_free);
    return matchSearch && matchFilter;
  });

  const freeCount = modules.filter((m: any) => m.is_free).length;
  const addonCount = modules.filter((m: any) => !m.is_free).length;

  return (
    <Layout>
      <DynamicMeta
        title="Módulos POS — Add-ons para tu Software | SistecPOS"
        description="Descubre los módulos adicionales para tu sistema POS: Facturación Electrónica, Tienda Online, Contabilidad, Multitienda y más."
        canonical="https://sistecpos.com/modulos"
      />
      <Breadcrumbs items={[{ label: "Módulos" }]} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="container px-4 relative text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Puzzle className="h-3 w-3 mr-1" /> {modules.length} Módulos Disponibles
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {getContent(blocks, "hero_title", "Potencia tu POS con Módulos Especializados")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-6">
              {getContent(blocks, "hero_subtitle", "Agrega funcionalidades avanzadas según las necesidades de tu negocio. Algunos ya están incluidos en tu plan, otros son add-ons opcionales.")}
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{freeCount}</p>
                <p className="text-xs text-primary-foreground/70">Incluidos</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{addonCount}</p>
                <p className="text-xs text-primary-foreground/70">Add-ons</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 border-b bg-background sticky top-16 z-20">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar módulo..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {([
                { key: "all", label: "Todos", count: modules.length },
                { key: "free", label: "Incluidos", count: freeCount },
                { key: "addon", label: "Add-ons", count: addonCount },
              ] as const).map(f => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.key)}
                  className="gap-1"
                >
                  {f.label}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{f.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-60 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Puzzle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">No se encontraron módulos con ese criterio.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {filtered.map((mod: any, index: number) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:-translate-y-1 hover:shadow-xl transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          mod.is_free ? "bg-whatsapp/10" : "bg-primary/10"
                        }`}>
                          <DynamicIcon name={mod.icon || "Puzzle"} className={`h-6 w-6 ${
                            mod.is_free ? "text-whatsapp" : "text-primary"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{mod.name}</h3>
                          <div className="flex gap-2 mt-1.5">
                            {mod.is_free ? (
                              <Badge className="text-[10px] bg-whatsapp/10 text-whatsapp border-0">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Incluido
                              </Badge>
                            ) : mod.price_cop > 0 ? (
                              <Badge className="text-[10px] bg-cta/10 text-cta border-0">
                                {formatCOP(mod.price_cop)}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">Disponible</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{mod.description}</p>
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/modulos/${mod.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Ver detalles <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {!mod.is_free && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
                            <a
                              href={buildUrl(`Hola, me interesa el módulo ${mod.name}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Cotizar
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cross-sell */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">¿Quieres varios módulos a precio especial?</h2>
            <p className="text-muted-foreground mb-6">
              Con un Pack comercial obtienes licencia + módulos + implementación + soporte con descuentos de hasta el 30%.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/packs">
                <Sparkles className="h-5 w-5" /> Ver Packs con Módulos Incluidos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-bg text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas un módulo especial?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Cuéntanos qué funcionalidad necesita tu negocio y te asesoramos sin compromiso.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <a href={buildUrl("Hola, quiero información sobre los módulos disponibles para mi POS")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" /> Consultar Módulos
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useSupportArticles, useIncrementArticleView, type SupportArticleRow } from "@/hooks/useSupportArticles";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Pin, Eye, Video, ArrowRight } from "lucide-react";

export default function ClientSupportArticlesHub() {
  const { data: articles = [], isLoading } = useSupportArticles(true);
  const incrementView = useIncrementArticleView();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = Array.from(new Set(articles.map(a => a.category))).sort();

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.tags || []).some(t => t.includes(q));
    const matchCat = selectedCategory === "all" || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold sm:text-2xl">Centro de Ayuda</h2>
        <p className="text-sm text-muted-foreground">{articles.length} artículos de soporte técnico</p>
      </div>

      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar artículo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-full" />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")} className="rounded-full text-xs">
          Todos ({articles.length})
        </Button>
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)} className="rounded-full capitalize text-xs">
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron artículos.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Link key={a.id} to={`/ayuda/${a.slug}`} onClick={() => incrementView.mutate(a.id)} className="block">
              <Card className="h-full cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-1.5">
                    {a.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                    {a.video_url && <Video className="h-3 w-3 text-destructive" />}
                    <Badge variant="secondary" className="capitalize text-[10px]">{a.category}</Badge>
                  </div>
                  <CardTitle className="text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
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
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Training {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  category: string;
  created_at: string;
}

export default function ClientTrainingsTab() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    supabase
      .from("reseller_trainings")
      .select("id, title, description, video_url, content, category, created_at")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        setTrainings((data as Training[]) || []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    trainings.forEach((t) => { cats[t.category] = (cats[t.category] || 0) + 1; });
    return cats;
  }, [trainings]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return trainings;
    return trainings.filter((t) => t.category === selectedCategory);
  }, [trainings, selectedCategory]);

  const isNew = (d: string) => Date.now() - new Date(d).getTime() < 7 * 86400000;

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">Entrenamientos</h2>

      {Object.keys(categories).length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button size="sm" variant={selectedCategory === "all" ? "default" : "outline"} onClick={() => setSelectedCategory("all")}>
            Todos ({trainings.length})
          </Button>
          {Object.entries(categories).map(([cat, count]) => (
            <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat)}>
              <span className="capitalize">{cat}</span>
              <Badge variant="secondary" className="ml-2 text-[10px]">{count}</Badge>
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay entrenamientos disponibles aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-lg border bg-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2"><Play className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.title}</h3>
                    {isNew(t.created_at) && <Badge className="bg-yellow-500 text-white text-[10px] gap-1"><Sparkles className="h-3 w-3" />Nuevo</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{t.category}</span>
                </div>
              </div>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              {t.video_url && (
                <a href={t.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <Play className="h-3 w-3" /> Ver video
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

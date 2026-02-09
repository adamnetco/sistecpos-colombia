import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Play } from "lucide-react";

interface Training {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  category: string;
}

export default function ResellerTrainingsView() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("reseller_trainings")
      .select("id, title, description, video_url, content, category")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        setTrainings((data as Training[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-display">Entrenamientos</h1>

      {trainings.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay entrenamientos disponibles aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trainings.map((t) => (
            <div key={t.id} className="rounded-lg border bg-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <span className="text-xs text-muted-foreground capitalize">{t.category}</span>
                </div>
              </div>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              {t.video_url && (
                <a
                  href={t.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
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

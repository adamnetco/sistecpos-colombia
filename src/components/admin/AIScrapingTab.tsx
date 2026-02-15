import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Globe, Play, RefreshCw, CheckCircle2, XCircle, Clock, Loader2, Trash2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

interface ScrapingJob {
  id: string;
  url: string;
  status: string;
  pages_scraped: number | null;
  entries_created: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-700", icon: Clock },
  running: { label: "Ejecutando", color: "bg-blue-500/10 text-blue-700", icon: Loader2 },
  completed: { label: "Completado", color: "bg-green-500/10 text-green-700", icon: CheckCircle2 },
  failed: { label: "Error", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function AIScrapingTab() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("https://sistecpos.lovable.app");
  const [running, setRunning] = useState(false);
  const [kbCount, setKbCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const load = async () => {
    const [{ data: jobsData }, { count }] = await Promise.all([
      supabase.from("ai_scraping_jobs").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("ai_knowledge_base").select("id", { count: "exact" }).eq("category", "scraping"),
    ]);
    setJobs((jobsData as ScrapingJob[]) || []);
    setKbCount(count || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Poll running jobs
  useEffect(() => {
    const hasRunning = jobs.some((j) => j.status === "running" || j.status === "pending");
    if (!hasRunning) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [jobs]);

  const startScraping = async () => {
    if (!url.trim()) return;
    setRunning(true);

    // Create job record
    const { data: job, error: insertErr } = await supabase
      .from("ai_scraping_jobs")
      .insert({ url: url.trim(), created_by: user?.id })
      .select("id")
      .single();

    if (insertErr || !job) {
      toast({ title: "Error", description: insertErr?.message || "No se pudo crear el job", variant: "destructive" });
      setRunning(false);
      return;
    }

    // Trigger edge function (fire-and-forget style, but we await for initial response)
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-site`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ url: url.trim(), job_id: job.id }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: "Error", description: err.error || "Error al iniciar scraping", variant: "destructive" });
      } else {
        const result = await resp.json();
        toast({ title: "Scraping completado", description: `${result.pages_scraped} páginas procesadas, ${result.entries_created} entradas actualizadas` });
      }
    } catch (e) {
      toast({ title: "Error de red", description: "No se pudo conectar con el servicio", variant: "destructive" });
    }

    setRunning(false);
    load();
  };

  const deleteScrapingEntries = async () => {
    if (!confirm("¿Eliminar todas las entradas de scraping de la base de conocimiento?")) return;
    await supabase.from("ai_knowledge_base").delete().eq("category", "scraping");
    toast({ title: "Entradas eliminadas" });
    load();
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      {/* Action card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Scraping del Sitio Web
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {kbCount} entradas en KB
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Rastrea el sitio web para extraer contenido y alimentar la base de conocimiento del chatbot. 
            Se procesan hasta 40 páginas por ejecución.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sistecpos.lovable.app"
              className="h-9 text-sm"
            />
            <Button size="sm" onClick={startScraping} disabled={running} className="gap-1.5 shrink-0">
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Procesando..." : "Iniciar Scraping"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
            {kbCount > 0 && (
              <Button variant="outline" size="sm" onClick={deleteScrapingEntries} className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
                Limpiar entradas ({kbCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Historial de Scraping</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay ejecuciones de scraping aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => {
                const cfg = statusConfig[job.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div key={job.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Icon className={`h-4 w-4 shrink-0 ${job.status === "running" ? "animate-spin" : ""} ${cfg.color.split(" ")[1]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{job.url}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                        {job.pages_scraped != null && (
                          <span className="text-[10px] text-muted-foreground">{job.pages_scraped} páginas</span>
                        )}
                        {job.entries_created != null && (
                          <span className="text-[10px] text-muted-foreground">→ {job.entries_created} entradas</span>
                        )}
                        {job.error_message && (
                          <span className="text-[10px] text-destructive truncate max-w-40">{job.error_message}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(job.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">💡 Buenas prácticas</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5">
          <p>• Ejecuta el scraping después de publicar cambios importantes en el sitio</p>
          <p>• Las entradas existentes se actualizan automáticamente (sin duplicados)</p>
          <p>• El contenido scraped aparece en la pestaña "Base de Conocimiento" con categoría "scraping"</p>
          <p>• Usa "Limpiar entradas" si quieres resetear y re-scrapear desde cero</p>
          <p>• Se procesan máximo 40 páginas por ejecución para optimizar tiempo</p>
        </CardContent>
      </Card>
    </div>
  );
}

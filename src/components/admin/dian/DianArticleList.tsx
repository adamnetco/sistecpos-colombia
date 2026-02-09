import { useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText, Pencil, Trash2, Eye, Copy, GripVertical,
} from "lucide-react";
import { CLUSTER_LABELS } from "./clusterConfig";

interface DianArticleRow {
  id: string;
  slug: string;
  keyword: string;
  meta_title: string;
  meta_description: string;
  hero_icon: string;
  hero_badge: string;
  h1: string;
  hero_subtitle: string;
  sections: any[];
  pain_vs_solution: any[];
  cta_text: string;
  cta_whatsapp_message: string;
  faqs: any[];
  related_links: any[];
  is_published: boolean;
  sort_order: number;
  cluster: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  articles: DianArticleRow[];
  onEdit: (a: DianArticleRow) => void;
  onDuplicate: (a: DianArticleRow) => void;
}

export function DianArticleList({ articles, onEdit, onDuplicate }: Props) {
  const queryClient = useQueryClient();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dian_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Artículo eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin_dian_articles"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: { id: string; sort_order: number }[]) => {
      // Update each article's sort_order
      const promises = reordered.map((r) =>
        supabase.from("dian_articles").update({ sort_order: r.sort_order }).eq("id", r.id)
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      toast.success("Orden actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin_dian_articles"] });
    },
    onError: (e: any) => toast.error("Error al reordenar: " + e.message),
  });

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
    dragItemRef.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback((dropIdx: number) => {
    const fromIdx = dragItemRef.current;
    if (fromIdx === null || fromIdx === dropIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const reordered = [...articles];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(dropIdx, 0, moved);

    // Persist new sort_order values
    const updates = reordered.map((a, i) => ({ id: a.id, sort_order: i }));
    reorderMutation.mutate(updates);

    setDragIdx(null);
    setOverIdx(null);
  }, [articles, reorderMutation]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No hay artículos DIAN</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {articles.map((a, idx) => (
        <div
          key={a.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={() => handleDrop(idx)}
          onDragEnd={handleDragEnd}
          className={`transition-all ${
            dragIdx === idx ? "opacity-40 scale-[0.98]" : ""
          } ${overIdx === idx && dragIdx !== idx ? "border-t-2 border-primary" : ""}`}
        >
          <Card className={`border-0 shadow-sm ${!a.is_published ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0 cursor-grab active:cursor-grabbing pt-1">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{a.hero_badge || "Sin badge"}</Badge>
                  <Badge variant="outline" className="text-[10px]">/{a.slug}</Badge>
                  <Badge variant="outline" className="text-[10px]">{CLUSTER_LABELS[a.cluster] || a.cluster}</Badge>
                  {a.is_published ? (
                    <Badge className="text-[10px] bg-primary/10 text-primary">Publicado</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">Borrador</Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {a.sections?.length || 0} secciones · {a.faqs?.length || 0} FAQs
                  </span>
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{a.h1}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.meta_description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                  <a href={`/guias-dian/${a.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDuplicate(a)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(a.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      {reorderMutation.isPending && (
        <p className="text-xs text-muted-foreground text-center py-1">Guardando orden...</p>
      )}
    </div>
  );
}

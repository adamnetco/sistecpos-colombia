import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Globe, Settings2 } from "lucide-react";

interface PageSetting {
  id: string;
  page_path: string;
  page_label: string;
  is_enabled: boolean;
}

export default function ChatbotSettingsTab() {
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPath, setNewPath] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chatbot_settings")
      .select("*")
      .order("page_path");
    setPages((data as PageSetting[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePage = async (id: string, current: boolean) => {
    await supabase.from("chatbot_settings").update({ is_enabled: !current }).eq("id", id);
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, is_enabled: !current } : p)));
  };

  const addPage = async () => {
    if (!newPath.startsWith("/") || !newLabel.trim()) {
      toast({ title: "La ruta debe empezar con / y tener un nombre", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("chatbot_settings").insert({
      page_path: newPath,
      page_label: newLabel,
      is_enabled: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Página agregada" });
      setNewPath("");
      setNewLabel("");
      load();
    }
  };

  const removePage = async (id: string) => {
    if (!confirm("¿Eliminar esta página del chatbot?")) return;
    await supabase.from("chatbot_settings").delete().eq("id", id);
    setPages((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Página eliminada" });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-sm">Páginas donde aparece el chatbot</h2>
        <Badge variant="outline" className="text-xs ml-auto">
          {pages.filter((p) => p.is_enabled).length} activas
        </Badge>
      </div>

      {/* Add new page */}
      <div className="flex items-end gap-2 mb-4 p-3 rounded-lg border bg-muted/30">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Ruta</label>
          <Input
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="/mi-pagina"
            className="h-8 text-xs"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Mi Página"
            className="h-8 text-xs"
          />
        </div>
        <Button size="sm" onClick={addPage} className="h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-4">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {pages.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                p.is_enabled ? "bg-card" : "bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{p.page_label}</p>
                  <p className="text-xs text-muted-foreground">{p.page_path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={p.is_enabled}
                  onCheckedChange={() => togglePage(p.id, p.is_enabled)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removePage(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

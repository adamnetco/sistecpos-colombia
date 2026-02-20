import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Globe, Plus, Trash2, Star, Loader2 } from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export default function EmailDomainsTab() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("approved_email_domains").select("*").order("sort_order");
    setDomains((data as Domain[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addDomain = async () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || !d.includes(".")) {
      toast({ title: "Dominio inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("approved_email_domains").insert({ domain: d, sort_order: domains.length });
    if (error) {
      toast({ title: error.message.includes("duplicate") ? "Dominio ya existe" : "Error", variant: "destructive" });
    } else {
      setNewDomain("");
      toast({ title: "Dominio agregado" });
      load();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("approved_email_domains").update({ is_active: active }).eq("id", id);
    load();
  };

  const setDefault = async (id: string) => {
    // Remove default from all, then set on selected
    await supabase.from("approved_email_domains").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("approved_email_domains").update({ is_default: true }).eq("id", id);
    toast({ title: "Dominio predeterminado actualizado" });
    load();
  };

  const deleteDomain = async (id: string) => {
    await supabase.from("approved_email_domains").delete().eq("id", id);
    toast({ title: "Dominio eliminado" });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Dominios de Correo Aprobados
        </h2>
        <p className="text-sm text-muted-foreground">Gestiona los dominios disponibles para asignar correos a clientes demo.</p>
      </div>

      {/* Add domain */}
      <div className="flex gap-2 max-w-md">
        <Input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Ej: ventas.click"
          onKeyDown={(e) => e.key === "Enter" && addDomain()}
        />
        <Button onClick={addDomain} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
          Agregar
        </Button>
      </div>

      {/* Domain list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
      ) : (
        <div className="rounded-lg border divide-y">
          {domains.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">@{d.domain}</span>
                {d.is_default && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" /> Predeterminado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={d.is_active} onCheckedChange={(v) => toggleActive(d.id, v)} />
                {!d.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(d.id)} className="text-xs">
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteDomain(d.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {domains.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">No hay dominios configurados</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Save, Loader2, Trash2, MapPin, Hash, FileText, Calendar,
  Copy, CheckCircle2, AlertTriangle, Store,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  license_id: string;
  branch_name: string;
  pos_location: string | null;
  pos_plan_type: string | null;
  pos_license_hash: string | null;
  pos_invoice_count: number | null;
  pos_created_at: string | null;
  pos_expires_at: string | null;
  is_active: boolean;
  notes: string | null;
  sort_order: number;
}

interface Props {
  licenseId: string;
  businessName: string;
}

export function LicenseBranchesTab({ licenseId, businessName }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("license_branches")
      .select("*")
      .eq("license_id", licenseId)
      .order("sort_order");
    setBranches((data as Branch[]) || []);
    setLoading(false);
  }, [licenseId]);

  useEffect(() => { load(); }, [load]);

  const addBranch = async () => {
    const name = `Sucursal ${branches.length + 1}`;
    const { error } = await supabase.from("license_branches").insert({
      license_id: licenseId,
      branch_name: name,
      sort_order: branches.length,
    });
    if (error) {
      toast({ title: "Error al agregar sede", variant: "destructive" });
    } else {
      load();
    }
  };

  const deleteBranch = async (id: string) => {
    if (!confirm("¿Eliminar esta sede? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("license_branches").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } else {
      load();
    }
  };

  const saveBranch = async (branch: Branch) => {
    setSaving(branch.id);
    const { error } = await supabase.from("license_branches").update({
      branch_name: branch.branch_name,
      pos_location: branch.pos_location,
      pos_plan_type: branch.pos_plan_type,
      pos_license_hash: branch.pos_license_hash,
      pos_invoice_count: branch.pos_invoice_count,
      pos_created_at: branch.pos_created_at,
      pos_expires_at: branch.pos_expires_at,
      is_active: branch.is_active,
      notes: branch.notes,
    }).eq("id", branch.id);
    setSaving(null);
    if (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } else {
      toast({ title: "Sede actualizada" });
    }
  };

  const updateLocal = (id: string, field: keyof Branch, value: any) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const duplicateBranch = async (source: Branch) => {
    const { error } = await supabase.from("license_branches").insert({
      license_id: licenseId,
      branch_name: `${source.branch_name} (copia)`,
      pos_location: source.pos_location,
      pos_plan_type: source.pos_plan_type,
      pos_license_hash: null,
      pos_invoice_count: 0,
      pos_created_at: source.pos_created_at,
      pos_expires_at: source.pos_expires_at,
      sort_order: branches.length,
    });
    if (error) {
      toast({ title: "Error al duplicar", variant: "destructive" });
    } else {
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando sucursales...
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Store className="h-4 w-4" /> Sucursales de {businessName}
          </p>
          <p className="text-xs text-muted-foreground">{branches.length} sede(s) configurada(s)</p>
        </div>
        <Button size="sm" onClick={addBranch}>
          <Plus className="h-3 w-3 mr-1" /> Agregar sede
        </Button>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Store className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No hay sucursales configuradas</p>
          <p className="text-xs text-muted-foreground mt-1">Agrega una sede para registrar datos POS independientes</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={addBranch}>
            <Plus className="h-3 w-3 mr-1" /> Primera sede
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {branches.map((branch, i) => {
            const daysLeft = branch.pos_expires_at
              ? Math.ceil((new Date(branch.pos_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
            const isExpired = daysLeft !== null && daysLeft <= 0;

            return (
              <div
                key={branch.id}
                className={`rounded-lg border p-4 space-y-3 transition-colors ${
                  isExpired ? "border-destructive/50 bg-destructive/5" :
                  isExpiring ? "border-orange-300 bg-orange-50/50 dark:bg-orange-950/10" :
                  "bg-card"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </div>
                    <Input
                      value={branch.branch_name}
                      onChange={(e) => updateLocal(branch.id, "branch_name", e.target.value)}
                      className="h-8 text-sm font-medium border-none shadow-none px-1 focus-visible:ring-0 max-w-[200px]"
                    />
                    {!branch.is_active && <Badge variant="secondary" className="text-[10px]">Inactiva</Badge>}
                    {isExpiring && (
                      <Badge className="bg-orange-100 text-orange-700 text-[10px] gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" /> {daysLeft}d restantes
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge variant="destructive" className="text-[10px]">Vencida</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateBranch(branch)} title="Duplicar">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteBranch(branch.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Ubicación POS
                    </Label>
                    <Input
                      value={branch.pos_location || ""}
                      onChange={(e) => updateLocal(branch.id, "pos_location", e.target.value)}
                      placeholder="Ej: PROVENZA"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3 w-3" /> Tipo de plan
                    </Label>
                    <Input
                      value={branch.pos_plan_type || ""}
                      onChange={(e) => updateLocal(branch.id, "pos_plan_type", e.target.value)}
                      placeholder="Ej: Basic"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" /> Hash de licencia
                  </Label>
                  <Input
                    value={branch.pos_license_hash || ""}
                    onChange={(e) => updateLocal(branch.id, "pos_license_hash", e.target.value)}
                    placeholder="c358a12338902bec32c079148da0164a"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Facturas emitidas</Label>
                    <Input
                      type="number"
                      min={0}
                      value={branch.pos_invoice_count ?? 0}
                      onChange={(e) => updateLocal(branch.id, "pos_invoice_count", Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Creación
                    </Label>
                    <Input
                      type="datetime-local"
                      value={branch.pos_created_at ? branch.pos_created_at.slice(0, 16) : ""}
                      onChange={(e) => updateLocal(branch.id, "pos_created_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Vencimiento
                    </Label>
                    <Input
                      type="datetime-local"
                      value={branch.pos_expires_at ? branch.pos_expires_at.slice(0, 16) : ""}
                      onChange={(e) => updateLocal(branch.id, "pos_expires_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Save button */}
                <Button
                  size="sm"
                  onClick={() => saveBranch(branch)}
                  disabled={saving === branch.id}
                  className="w-full"
                >
                  {saving === branch.id ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="h-3 w-3 mr-1" /> Guardar sede</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

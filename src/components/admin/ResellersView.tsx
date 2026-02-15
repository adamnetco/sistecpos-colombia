import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings2, DollarSign, Plus, Trash2, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";

interface Reseller {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  experience_summary: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

interface ResellerModule {
  id: string;
  module_key: string;
  is_enabled: boolean;
}

interface Commission {
  id: string;
  product_type: string;
  commission_type: string;
  commission_value: number;
  min_amount: number;
  max_amount: number | null;
  is_active: boolean;
}

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En Revisión" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
];

const ALL_MODULES = [
  { key: "licencias", label: "Licencias", alwaysOn: true },
  { key: "entrenamientos", label: "Entrenamientos" },
  { key: "tickets", label: "Tickets de Soporte" },
  { key: "comisiones", label: "Comisiones" },
];

export default function ResellersView() {
  const [apps, setApps] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [configTarget, setConfigTarget] = useState<Reseller | null>(null);
  const [modules, setModules] = useState<ResellerModule[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [tab, setTab] = useState<"modules" | "commissions">("modules");
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("reseller_applications").select("*").order("created_at", { ascending: false });
    setApps((data as Reseller[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reseller_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
      return;
    }

    // When approving, trigger full activation flow (create user, assign role, send email)
    if (status === "approved") {
      const reseller = apps.find((a) => a.id === id);
      if (reseller) {
        toast({ title: "Activando socio...", description: "Creando cuenta y enviando correo de bienvenida" });
        try {
          const { data, error: fnError } = await supabase.functions.invoke("send-reseller-email", {
            body: {
              type: "approved",
              resellerId: reseller.id,
              name: reseller.full_name,
              email: reseller.email,
            },
          });
          if (fnError) throw fnError;
          toast({ title: "✅ Socio activado", description: "Se creó la cuenta y se envió el correo de activación" });
        } catch (err) {
          console.error("Activation error:", err);
          toast({ title: "Estado actualizado, pero hubo un error al enviar el correo", variant: "destructive" });
        }
      }
    }

    load();
  };

  const openConfig = async (reseller: Reseller) => {
    setConfigTarget(reseller);
    setTab("modules");

    const [modRes, comRes] = await Promise.all([
      supabase.from("reseller_modules").select("*").eq("reseller_id", reseller.id),
      supabase.from("reseller_commissions").select("*").eq("reseller_id", reseller.id).order("product_type"),
    ]);

    setModules((modRes.data as ResellerModule[]) || []);
    setCommissions((comRes.data as Commission[]) || []);
  };

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    if (!configTarget) return;

    const existing = modules.find((m) => m.module_key === moduleKey);
    if (existing) {
      await supabase.from("reseller_modules").update({ is_enabled: enabled }).eq("id", existing.id);
    } else {
      await supabase.from("reseller_modules").insert({
        reseller_id: configTarget.id,
        module_key: moduleKey,
        is_enabled: enabled,
      });
    }

    // Reload modules
    const { data } = await supabase.from("reseller_modules").select("*").eq("reseller_id", configTarget.id);
    setModules((data as ResellerModule[]) || []);
  };

  const addCommission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!configTarget) return;
    const fd = new FormData(e.currentTarget);

    const { error } = await supabase.from("reseller_commissions").insert({
      reseller_id: configTarget.id,
      product_type: fd.get("product_type") as string,
      commission_type: fd.get("commission_type") as string,
      commission_value: Number(fd.get("commission_value")),
      min_amount: Number(fd.get("min_amount") || 0),
      max_amount: fd.get("max_amount") ? Number(fd.get("max_amount")) : null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { data } = await supabase.from("reseller_commissions").select("*").eq("reseller_id", configTarget.id).order("product_type");
      setCommissions((data as Commission[]) || []);
      (e.target as HTMLFormElement).reset();
    }
  };

  const deleteCommission = async (id: string) => {
    await supabase.from("reseller_commissions").delete().eq("id", id);
    setCommissions((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Socios</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => exportToCsv(apps as any[], [
            { key: "full_name", label: "Nombre" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Teléfono" },
            { key: "city", label: "Ciudad" },
            { key: "experience_summary", label: "Experiencia" },
            { key: "status", label: "Estado" },
            { key: "created_at", label: "Fecha" },
          ], "socios")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <Badge variant="outline" className="text-xs">
            {apps.filter((a) => a.status === "pending").length} pendientes
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nombre</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Config</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hay solicitudes</td></tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className={`border-b hover:bg-muted/30 transition-colors ${a.status === "pending" ? "bg-yellow-500/5" : ""}`}>
                  <td className="px-4 py-3 font-medium">{a.full_name}</td>
                  <td className="px-4 py-3">{a.city}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{a.email}</div>
                    <div className="text-xs text-muted-foreground">{a.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => openConfig(a)} title="Configurar módulos y comisiones">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!configTarget} onOpenChange={() => setConfigTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar: {configTarget?.full_name}</DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              size="sm"
              variant={tab === "modules" ? "default" : "ghost"}
              onClick={() => setTab("modules")}
            >
              <Settings2 className="mr-1 h-3 w-3" />Módulos
            </Button>
            <Button
              size="sm"
              variant={tab === "commissions" ? "default" : "ghost"}
              onClick={() => setTab("commissions")}
            >
              <DollarSign className="mr-1 h-3 w-3" />Comisiones
            </Button>
          </div>

          {/* Modules tab */}
          {tab === "modules" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Define qué secciones puede ver este socio en su panel.</p>
              {ALL_MODULES.map((mod) => {
                const current = modules.find((m) => m.module_key === mod.key);
                const isEnabled = mod.alwaysOn || (current?.is_enabled ?? false);

                return (
                  <div key={mod.key} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{mod.label}</p>
                      {mod.alwaysOn && <p className="text-xs text-muted-foreground">Siempre activo</p>}
                    </div>
                    <Switch
                      checked={isEnabled}
                      disabled={mod.alwaysOn}
                      onCheckedChange={(v) => toggleModule(mod.key, v)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Commissions tab */}
          {tab === "commissions" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Configura las comisiones de este socio por producto.</p>

              {/* Existing commissions */}
              {commissions.length > 0 && (
                <div className="space-y-2">
                  {commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <span className="font-medium capitalize">{c.product_type}</span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <span>{c.commission_type === "percentage" ? `${c.commission_value}%` : `$${c.commission_value.toLocaleString()}`}</span>
                        {(c.min_amount > 0 || c.max_amount) && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({c.min_amount > 0 && `min $${c.min_amount.toLocaleString()}`}
                            {c.max_amount && ` max $${c.max_amount.toLocaleString()}`})
                          </span>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteCommission(c.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add commission form */}
              <form onSubmit={addCommission} className="space-y-3 rounded-md border p-3">
                <p className="text-xs font-medium text-muted-foreground">Agregar comisión</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Producto</Label>
                    <select name="product_type" className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" required>
                      <option value="licencia_anual">Licencia Anual</option>
                      <option value="licencia_vitalicia">Licencia Vitalicia</option>
                      <option value="certificado">Certificado Digital</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <select name="commission_type" className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" required>
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo ($)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Valor</Label>
                    <Input name="commission_value" type="number" step="0.01" required className="h-9" />
                  </div>
                  <div>
                    <Label className="text-xs">Min ($)</Label>
                    <Input name="min_amount" type="number" defaultValue={0} className="h-9" />
                  </div>
                  <div>
                    <Label className="text-xs">Max ($)</Label>
                    <Input name="max_amount" type="number" placeholder="∞" className="h-9" />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full">
                  <Plus className="mr-1 h-3 w-3" />Agregar
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings2, DollarSign, Plus, Trash2, Download, Kanban, List, UserPlus } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ResellerPipelineView = lazy(() => import("./ResellerPipelineView"));

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En Revisión" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
];

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
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ full_name: "", email: "", phone: "", city: "", experience_summary: "" });
  const [savingNew, setSavingNew] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("reseller_applications").select("*").order("created_at", { ascending: false });
    setApps((data as Reseller[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleCreateReseller = async () => {
    if (!newForm.full_name || !newForm.email || !newForm.phone) {
      toast({ title: "Nombre, email y teléfono son requeridos", variant: "destructive" });
      return;
    }
    setSavingNew(true);
    const { error } = await supabase.from("reseller_applications").insert({
      full_name: newForm.full_name,
      email: newForm.email,
      phone: newForm.phone,
      city: newForm.city || null,
      experience_summary: newForm.experience_summary || null,
      status: "approved",
    });
    setSavingNew(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ Socio creado", description: "Cambia el estado a 'Aprobado' para enviar el correo de activación." });
    setAddingNew(false);
    setNewForm({ full_name: "", email: "", phone: "", city: "", experience_summary: "" });
    load();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const reseller = apps.find((a) => a.id === id);
    if (!reseller) return;

    if (newStatus === "approved" && reseller.status === "approved" && reseller.user_id) {
      toast({ title: "Este socio ya fue aprobado y activado previamente" });
      return;
    }

    const oldStatus = reseller.status;
    const { error } = await supabase.from("reseller_applications").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error al actualizar estado", variant: "destructive" });
      return;
    }

    if (newStatus !== "approved" && oldStatus !== newStatus) {
      try {
        await supabase.functions.invoke("notify-ticket-status", {
          body: {
            type: "reseller_status_changed",
            reseller_id: reseller.id,
            name: reseller.full_name,
            email: reseller.email,
            old_status: oldStatus,
            new_status: newStatus,
          },
        });
      } catch (e) {
        console.error("Notification error:", e);
      }
    }

    if (newStatus === "approved") {
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
        toast({ title: "✅ Socio activado", description: "Cuenta creada y correo de activación enviado a " + reseller.email });
      } catch (err) {
        console.error("Activation error:", err);
        toast({ title: "Estado actualizado, pero hubo un error al activar", description: String(err), variant: "destructive" });
      }
    } else {
      toast({ title: `Estado actualizado a "${statusOptions.find(s => s.value === newStatus)?.label}"` });
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
      await supabase.from("reseller_modules").insert({ reseller_id: configTarget.id, module_key: moduleKey, is_enabled: enabled });
    }
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
          <Button size="sm" onClick={() => setAddingNew(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" />Nuevo Socio
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToCsv(apps as any[], [
            { key: "full_name", label: "Nombre" }, { key: "email", label: "Email" },
            { key: "phone", label: "Teléfono" }, { key: "city", label: "Ciudad" },
            { key: "status", label: "Estado" }, { key: "created_at", label: "Fecha" },
          ], "socios")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <Badge variant="outline" className="text-xs">
            {apps.filter((a) => a.status === "pending").length} pendientes
          </Badge>
        </div>
      </div>

      {/* Create Reseller Dialog */}
      <Dialog open={addingNew} onOpenChange={setAddingNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Nuevo Socio Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nombre completo *</Label>
                <Input value={newForm.full_name} onChange={(e) => setNewForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Juan Rodríguez" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={newForm.email} onChange={(e) => setNewForm((p) => ({ ...p, email: e.target.value }))} placeholder="juan@empresa.com" />
              </div>
              <div>
                <Label>Teléfono *</Label>
                <Input value={newForm.phone} onChange={(e) => setNewForm((p) => ({ ...p, phone: e.target.value }))} placeholder="3001234567" />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input value={newForm.city} onChange={(e) => setNewForm((p) => ({ ...p, city: e.target.value }))} placeholder="Bogotá" />
              </div>
              <div>
                <Label>Experiencia</Label>
                <Input value={newForm.experience_summary} onChange={(e) => setNewForm((p) => ({ ...p, experience_summary: e.target.value }))} placeholder="Ventas software" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
              💡 Se crea como <strong>Aprobado</strong>. Para enviar el correo de bienvenida, cambia el estado a "Aprobado" en la lista tras guardarlo.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAddingNew(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreateReseller} disabled={savingNew}>
                {savingNew ? "Guardando..." : "Crear Socio"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="pipeline" className="mt-4">
        <TabsList>
          <TabsTrigger value="pipeline" className="gap-1.5">
            <Kanban className="h-3.5 w-3.5" />Embudo
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="h-3.5 w-3.5" />Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
            <ResellerPipelineView />
          </Suspense>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
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
                        <a href={`mailto:${a.email}`} className="block text-xs text-primary hover:underline">{a.email}</a>
                        <a href={`tel:${a.phone}`} className="block text-xs text-primary hover:underline">{a.phone}</a>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
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
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={!!configTarget} onOpenChange={() => setConfigTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar: {configTarget?.full_name}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 border-b pb-2">
            <Button size="sm" variant={tab === "modules" ? "default" : "ghost"} onClick={() => setTab("modules")}>
              <Settings2 className="mr-1 h-3 w-3" />Módulos
            </Button>
            <Button size="sm" variant={tab === "commissions" ? "default" : "ghost"} onClick={() => setTab("commissions")}>
              <DollarSign className="mr-1 h-3 w-3" />Comisiones
            </Button>
          </div>

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
                    <Switch checked={isEnabled} disabled={mod.alwaysOn} onCheckedChange={(v) => toggleModule(mod.key, v)} />
                  </div>
                );
              })}
            </div>
          )}

          {tab === "commissions" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Configura las comisiones de este socio por producto.</p>
              {commissions.length > 0 && (
                <div className="space-y-2">
                  {commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div>
                        <span className="font-medium capitalize">{c.product_type}</span>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <span>{c.commission_type === "percentage" ? `${c.commission_value}%` : `$${c.commission_value.toLocaleString()}`}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteCommission(c.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                  <div><Label className="text-xs">Valor</Label><Input name="commission_value" type="number" step="0.01" required className="h-9" /></div>
                  <div><Label className="text-xs">Min ($)</Label><Input name="min_amount" type="number" defaultValue={0} className="h-9" /></div>
                  <div><Label className="text-xs">Max ($)</Label><Input name="max_amount" type="number" placeholder="∞" className="h-9" /></div>
                </div>
                <Button type="submit" size="sm" className="w-full"><Plus className="mr-1 h-3 w-3" />Agregar</Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

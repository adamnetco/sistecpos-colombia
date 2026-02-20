import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Puzzle, Lock, Gift } from "lucide-react";
import { LICENSE_PLANS } from "@/data/licensePlans";

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);

interface PlanModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cop: number;
  is_free: boolean;
  icon: string;
  allowed_plan_keys: string[];
  is_included_in_plans: string[];
  sort_order: number;
  is_active: boolean;
}

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price_cop: 0,
  is_free: true,
  icon: "Box",
  allowed_plan_keys: [] as string[],
  is_included_in_plans: [] as string[],
  sort_order: 0,
  is_active: true,
};

export default function PlanModulesManager() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlanModule | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["plan_modules_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_modules")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as PlanModule[];
    },
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const openNew = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (m: PlanModule) => {
    setEditing(m);
    setForm({
      name: m.name,
      slug: m.slug,
      description: m.description || "",
      price_cop: m.price_cop,
      is_free: m.is_free,
      icon: m.icon,
      allowed_plan_keys: m.allowed_plan_keys,
      is_included_in_plans: m.is_included_in_plans,
      sort_order: m.sort_order,
      is_active: m.is_active,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload = { ...form, slug };
      if (editing) {
        const { error } = await supabase.from("plan_modules").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("plan_modules").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan_modules_admin"] });
      qc.invalidateQueries({ queryKey: ["plan_modules_public"] });
      toast.success(editing ? "Módulo actualizado" : "Módulo creado");
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plan_modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan_modules_admin"] });
      toast.success("Módulo eliminado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePlanKey = (arr: string[], key: string): string[] =>
    arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-primary" />
            Módulos Add-on de Planes
          </h3>
          <p className="text-sm text-muted-foreground">
            Define qué módulos están disponibles u opcionales para cada plan de licencia.
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Módulo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando módulos...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map(m => (
            <Card key={m.id} className={`border ${!m.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{m.name}</span>
                      {m.is_free ? (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs gap-1">
                          <Gift className="h-3 w-3" /> Incluido
                        </Badge>
                      ) : (
                        <Badge className="bg-secondary text-secondary-foreground border-0 text-xs gap-1">
                          <Lock className="h-3 w-3" /> {formatCOP(m.price_cop)}
                        </Badge>
                      )}
                      {!m.is_active && <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                    </div>
                    {m.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{m.description}</p>
                    )}
                    {/* Plans available */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Disponible en:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {m.allowed_plan_keys.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Todos los planes</span>
                        ) : (
                          m.allowed_plan_keys.map(k => {
                            const plan = LICENSE_PLANS.find(p => p.value === k);
                            const isIncluded = m.is_included_in_plans.includes(k);
                            return (
                              <span
                                key={k}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  isIncluded
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {plan?.label || k}
                                {isIncluded ? " ✓" : " +"}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("¿Eliminar este módulo?")) deleteMutation.mutate(m.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Módulo" : "Nuevo Módulo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre del módulo *</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Módulo Contabilidad" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="Auto-generado" />
              </div>
              <div>
                <Label>Ícono (nombre Lucide)</Label>
                <Input value={form.icon} onChange={e => set("icon", e.target.value)} placeholder="BookOpen, Store..." />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
            </div>

            {/* Pricing */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={form.is_free} onCheckedChange={v => set("is_free", v)} />
                <Label className="cursor-pointer">
                  {form.is_free ? "Incluido sin costo adicional" : "Add-on de pago"}
                </Label>
              </div>
              {!form.is_free && (
                <div>
                  <Label>Precio (COP)</Label>
                  <Input
                    type="number"
                    value={form.price_cop}
                    onChange={e => set("price_cop", parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Plan keys: allowed */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Disponible en planes <span className="text-muted-foreground font-normal">(deja vacío = todos)</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {LICENSE_PLANS.map(plan => (
                  <div key={plan.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`allowed-${plan.value}`}
                      checked={form.allowed_plan_keys.includes(plan.value)}
                      onCheckedChange={() =>
                        set("allowed_plan_keys", togglePlanKey(form.allowed_plan_keys, plan.value))
                      }
                    />
                    <label htmlFor={`allowed-${plan.value}`} className="text-sm cursor-pointer">{plan.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan keys: included */}
            {form.allowed_plan_keys.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Incluido (sin costo) en estos planes
                  <span className="text-muted-foreground font-normal ml-1">(subconjunto de los disponibles)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {form.allowed_plan_keys.map(key => {
                    const plan = LICENSE_PLANS.find(p => p.value === key);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox
                          id={`included-${key}`}
                          checked={form.is_included_in_plans.includes(key)}
                          onCheckedChange={() =>
                            set("is_included_in_plans", togglePlanKey(form.is_included_in_plans, key))
                          }
                        />
                        <label htmlFor={`included-${key}`} className="text-sm cursor-pointer text-primary font-medium">
                          {plan?.label || key} ✓
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
              <Label>Módulo activo (visible en pricing)</Label>
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} className="w-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Navigation, ExternalLink,
  ArrowUp, ArrowDown, Eye, EyeOff, Globe, Smartphone, Menu,
  ChevronRight, GripVertical, CornerDownRight,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
  position: string;
  is_external: boolean;
  is_active: boolean;
  sort_order: number;
}

const POSITION_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  main: { label: "Principal", icon: Globe },
  footer: { label: "Footer", icon: Navigation },
  mobile: { label: "Móvil", icon: Smartphone },
};

const defaultForm = { label: "", href: "", parent_id: "", position: "main", is_external: false, is_active: true, sort_order: 0 };

export default function NavManagerTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [posFilter, setPosFilter] = useState<string>("all");

  const { data: navItems = [] } = useQuery<NavItem[]>({
    queryKey: ["admin_nav_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items").select("*").order("sort_order");
      if (error) throw error;
      return data as NavItem[];
    },
  });

  const filteredItems = posFilter === "all" ? navItems : navItems.filter((n) => n.position === posFilter);
  const topItems = filteredItems.filter((n) => !n.parent_id);
  const allTopItems = navItems.filter((n) => !n.parent_id);

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (n: NavItem) => {
    setEditing(n);
    setForm({ label: n.label, href: n.href, parent_id: n.parent_id || "", position: n.position, is_external: n.is_external, is_active: n.is_active, sort_order: n.sort_order });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, parent_id: form.parent_id || null };
      if (editing) {
        const { error } = await supabase.from("nav_items").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nav_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Enlace actualizado" : "Enlace creado");
      queryClient.invalidateQueries({ queryKey: ["admin_nav_items"] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nav_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enlace eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin_nav_items"] });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction, siblings }: { id: string; direction: "up" | "down"; siblings: NavItem[] }) => {
      const idx = siblings.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return;

      const current = siblings[idx];
      const swap = siblings[swapIdx];

      const batch = [
        supabase.from("nav_items").update({ sort_order: swap.sort_order }).eq("id", current.id),
        supabase.from("nav_items").update({ sort_order: current.sort_order }).eq("id", swap.id),
      ];
      await Promise.all(batch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_nav_items"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleReorder = (item: NavItem, direction: "up" | "down") => {
    const siblings = (item.parent_id
      ? navItems.filter((n) => n.parent_id === item.parent_id)
      : navItems.filter((n) => !n.parent_id && n.position === item.position)
    ).sort((a, b) => a.sort_order - b.sort_order);

    reorderMutation.mutate({ id: item.id, direction, siblings });
  };

  const toggleActive = async (item: NavItem) => {
    const { error } = await supabase.from("nav_items").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      toast.success(item.is_active ? "Enlace oculto" : "Enlace visible");
      queryClient.invalidateQueries({ queryKey: ["admin_nav_items"] });
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  // Group by position
  const positions = ["main", "footer", "mobile"];
  const groupedItems = posFilter === "all"
    ? positions.map((pos) => ({
        pos,
        items: topItems.filter((n) => n.position === pos),
      })).filter((g) => g.items.length > 0)
    : [{ pos: posFilter, items: topItems }];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Gestión de Navegación
          </h3>
          <p className="text-sm text-muted-foreground">{navItems.length} enlaces configurados</p>
        </div>
        <div className="flex gap-2">
          {/* Position filter */}
          <div className="flex rounded-lg border overflow-hidden">
            {[{ key: "all", label: "Todos" }, ...positions.map((p) => ({ key: p, label: POSITION_LABELS[p]?.label || p }))].map((f) => (
              <button
                key={f.key}
                onClick={() => setPosFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  posFilter === f.key ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={openNew} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      {/* Nav items grouped */}
      {groupedItems.map(({ pos, items }) => {
        const posInfo = POSITION_LABELS[pos];
        const PosIcon = posInfo?.icon || Globe;
        return (
          <div key={pos}>
            {posFilter === "all" && (
              <div className="flex items-center gap-2 mb-2">
                <PosIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{posInfo?.label || pos}</span>
                <Separator className="flex-1" />
              </div>
            )}
            <div className="space-y-1">
              {items.map((item, idx) => {
                const children = navItems.filter((n) => n.parent_id === item.id).sort((a, b) => a.sort_order - b.sort_order);
                const isFirst = idx === 0;
                const isLast = idx === items.length - 1;

                return (
                  <div key={item.id}>
                    <NavItemRow
                      item={item}
                      isFirst={isFirst}
                      isLast={isLast}
                      onEdit={() => openEdit(item)}
                      onDelete={() => { if (confirm(`¿Eliminar "${item.label}"?`)) deleteMutation.mutate(item.id); }}
                      onReorder={(dir) => handleReorder(item, dir)}
                      onToggleActive={() => toggleActive(item)}
                    />
                    {children.length > 0 && (
                      <div className="ml-10 mt-0.5 space-y-0.5">
                        {children.map((child, ci) => (
                          <NavItemRow
                            key={child.id}
                            item={child}
                            isChild
                            isFirst={ci === 0}
                            isLast={ci === children.length - 1}
                            onEdit={() => openEdit(child)}
                            onDelete={() => { if (confirm(`¿Eliminar "${child.label}"?`)) deleteMutation.mutate(child.id); }}
                            onReorder={(dir) => handleReorder(child, dir)}
                            onToggleActive={() => toggleActive(child)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin enlaces en esta posición</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              {editing ? "Editar Enlace" : "Nuevo Enlace"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Texto del enlace *</Label>
              <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Ej: Productos, Nosotros..." />
            </div>
            <div>
              <Label>URL *</Label>
              <Input value={form.href} onChange={(e) => set("href", e.target.value)} placeholder="/productos o https://..." />
              <p className="text-[10px] text-muted-foreground mt-1">Rutas internas (/ruta), externas (https://...) o anclas (#seccion)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Posición</Label>
                <Select value={form.position} onValueChange={(v) => set("position", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p} value={p}>{POSITION_LABELS[p]?.label || p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Menú padre</Label>
                <Select value={form.parent_id || "__none__"} onValueChange={(v) => set("parent_id", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Ninguno (raíz)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Ninguno (raíz)</SelectItem>
                    {allTopItems.filter((n) => n.id !== editing?.id).map((n) => (
                      <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <span className="text-sm">{form.is_active ? "Visible" : "Oculto"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.is_external} onCheckedChange={(v) => set("is_external", v)} />
                <span className="text-sm">Enlace externo</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.label || !form.href || saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Nav Item Row ─── */
function NavItemRow({
  item, isChild, isFirst, isLast, onEdit, onDelete, onReorder, onToggleActive,
}: {
  item: NavItem;
  isChild?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReorder: (dir: "up" | "down") => void;
  onToggleActive: () => void;
}) {
  return (
    <Card className={`border shadow-sm transition-all ${!item.is_active ? "opacity-50" : ""} hover:shadow-md`}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => onReorder("up")}
              disabled={isFirst}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => onReorder("down")}
              disabled={isLast}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>

          {/* Icon */}
          {isChild && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/50" />}

          {/* Label + href */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm ${!item.is_active ? "line-through" : ""}`}>{item.label}</span>
              {item.is_external && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            </div>
            <span className="text-xs text-muted-foreground font-mono">{item.href}</span>
          </div>

          {/* Position badge */}
          {!isChild && (
            <Badge variant="outline" className="text-[9px] h-5 hidden sm:inline-flex">
              {POSITION_LABELS[item.position]?.label || item.position}
            </Badge>
          )}

          {/* Toggle visibility */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleActive} title={item.is_active ? "Ocultar" : "Mostrar"}>
            {item.is_active ? <Eye className="h-3.5 w-3.5 text-green-500" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>

          {/* Actions */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Navigation, GripVertical, ExternalLink } from "lucide-react";

const defaultForm = { label: "", href: "", parent_id: "", position: "main", is_external: false, is_active: true, sort_order: 0 };

export default function NavManagerTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: navItems = [] } = useQuery({
    queryKey: ["admin_nav_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const topItems = navItems.filter((n: any) => !n.parent_id);

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (n: any) => {
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

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-purple-500" />
          Navegación ({navItems.length})
        </h3>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Nuevo Enlace</Button>
      </div>

      <div className="space-y-2">
        {topItems.map((item: any) => {
          const children = navItems.filter((n: any) => n.parent_id === item.id);
          return (
            <div key={item.id}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-sm">{item.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.href}</span>
                      {item.is_external && <ExternalLink className="inline h-3 w-3 ml-1 text-muted-foreground" />}
                    </div>
                    <Badge variant="outline" className="text-xs">{item.position}</Badge>
                    {!item.is_active && <Badge variant="destructive" className="text-xs">Oculto</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
              {children.length > 0 && (
                <div className="ml-8 mt-1 space-y-1">
                  {children.map((child: any) => (
                    <Card key={child.id} className="border-0 shadow-sm">
                      <CardContent className="p-2 px-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>↳ {child.label}</span>
                          <span className="text-xs text-muted-foreground">{child.href}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(child)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(child.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar Enlace" : "Nuevo Enlace"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Texto *</Label>
              <Input value={form.label} onChange={e => set("label", e.target.value)} placeholder="Productos" />
            </div>
            <div>
              <Label>URL *</Label>
              <Input value={form.href} onChange={e => set("href", e.target.value)} placeholder="/productos" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Posición</Label>
                <Select value={form.position} onValueChange={v => set("position", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Principal</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="mobile">Móvil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Padre</Label>
                <Select value={form.parent_id || "__none__"} onValueChange={v => set("parent_id", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Ninguno</SelectItem>
                    {topItems.filter((n: any) => n.id !== editing?.id).map((n: any) => (
                      <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
                <Label>Visible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_external} onCheckedChange={v => set("is_external", v)} />
                <Label>Externo</Label>
              </div>
              <div className="w-20">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
              </div>
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

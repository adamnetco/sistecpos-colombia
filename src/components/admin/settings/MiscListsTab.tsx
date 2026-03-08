import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, GripVertical, X, ListChecks, ChevronUp, ChevronDown,
} from "lucide-react";

interface MiscList {
  id: string;
  list_key: string;
  label: string;
  description: string | null;
  items: string[];
  sort_order: number;
}

const defaultList: Omit<MiscList, "id"> = {
  list_key: "", label: "", description: "", items: [], sort_order: 0,
};

export default function MiscListsTab() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MiscList | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultList);
  const [newItem, setNewItem] = useState("");

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["misc_lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("misc_lists")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as MiscList[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        list_key: form.list_key.trim().toLowerCase().replace(/\s+/g, "_"),
        label: form.label.trim(),
        description: form.description?.trim() || null,
        items: form.items,
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error } = await supabase.from("misc_lists").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("misc_lists").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["misc_lists"] });
      toast.success(editing ? "Lista actualizada" : "Lista creada");
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("misc_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["misc_lists"] });
      toast.success("Lista eliminada");
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm(defaultList);
    setNewItem("");
    setDialogOpen(true);
  };

  const openEdit = (list: MiscList) => {
    setEditing(list);
    setForm({
      list_key: list.list_key,
      label: list.label,
      description: list.description || "",
      items: [...list.items],
      sort_order: list.sort_order,
    });
    setNewItem("");
    setDialogOpen(true);
  };

  const addItem = () => {
    const val = newItem.trim();
    if (!val || form.items.includes(val)) return;
    setForm(f => ({ ...f, items: [...f.items, val] }));
    setNewItem("");
  };

  const removeItem = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const items = [...form.items];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    setForm(f => ({ ...f, items }));
  };

  const editItem = (idx: number, val: string) => {
    const items = [...form.items];
    items[idx] = val;
    setForm(f => ({ ...f, items }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Gestor de Listas Misceláneas
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Centraliza y edita todas las listas de opciones que aparecen en formularios del sitio.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Lista
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay listas configuradas</p>
            <p className="text-xs mt-1">Crea tu primera lista para centralizar las opciones de formularios.</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Crear primera lista
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map(list => (
            <Card key={list.id} className="border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{list.label}</CardTitle>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                      key: {list.list_key}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(list)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(list.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {list.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{list.description}</p>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {list.items.slice(0, 6).map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                  {list.items.length > 6 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{list.items.length - 6} más
                    </Badge>
                  )}
                  {list.items.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Sin items aún</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── CREATE / EDIT DIALOG ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>{editing ? `Editar: ${editing.label}` : "Nueva Lista"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6 pb-2">
            <div className="space-y-4 py-4">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Etiqueta <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Ej: Tipos de negocio"
                  />
                </div>
                <div className="col-span-2">
                  <Label>
                    Clave interna (key){" "}
                    <span className="text-muted-foreground text-xs font-normal">(auto-generada si vacía)</span>
                  </Label>
                  <Input
                    value={form.list_key}
                    onChange={e => setForm(f => ({ ...f, list_key: e.target.value }))}
                    placeholder="tipos_negocio"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa esta clave en código para leer la lista dinámicamente.
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={form.description || ""}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="¿Dónde y cómo se usa esta lista?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <Label className="text-sm font-semibold">
                  Elementos de la lista{" "}
                  <Badge variant="secondary" className="ml-1 text-xs">{form.items.length}</Badge>
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Pulsa Enter o el botón "+" para agregar. Usa las flechas para reordenar.
                </p>

                {/* Add item input */}
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Nuevo elemento..."
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Item list */}
                {form.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Agrega el primer elemento
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {form.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 hover:bg-muted/40 transition-colors"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <Input
                          value={item}
                          onChange={e => editItem(idx, e.target.value)}
                          className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0 flex-1"
                        />
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, -1)}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 1)}
                            disabled={idx === form.items.length - 1}
                            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-0.5 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors ml-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 w-5 text-right">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 pb-6 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.label.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar Lista" : "Crear Lista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRM ─── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Si esta lista se usa en algún formulario,
              las opciones quedarán vacías.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

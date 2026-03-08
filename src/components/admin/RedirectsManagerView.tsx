import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight, Plus, Pencil, Trash2, ExternalLink, Search,
  ArrowUpDown, ToggleLeft, Copy, RefreshCw, Activity,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Redirect {
  id: string;
  source_path: string;
  target_path: string;
  redirect_type: number;
  is_active: boolean;
  is_regex: boolean;
  priority: number;
  notes: string | null;
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
}

const EMPTY: Omit<Redirect, "id" | "hit_count" | "last_hit_at" | "created_at"> = {
  source_path: "",
  target_path: "",
  redirect_type: 301,
  is_active: true,
  is_regex: false,
  priority: 0,
  notes: null,
};

export default function RedirectsManagerView() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [form, setForm] = useState(EMPTY);

  const { data: redirects = [], isLoading } = useQuery({
    queryKey: ["admin-redirects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("redirects")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Redirect[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (r: typeof form & { id?: string }) => {
      if (!r.source_path || !r.target_path) throw new Error("Rutas requeridas");
      const payload = {
        source_path: r.source_path.trim(),
        target_path: r.target_path.trim(),
        redirect_type: r.redirect_type,
        is_active: r.is_active,
        is_regex: r.is_regex,
        priority: r.priority,
        notes: r.notes || null,
        updated_at: new Date().toISOString(),
      };
      if (r.id) {
        const { error } = await (supabase as any).from("redirects").update(payload).eq("id", r.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("redirects").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-redirects"] });
      toast({ title: editing ? "Redirección actualizada" : "Redirección creada" });
      closeDialog();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("redirects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-redirects"] });
      toast({ title: "Redirección eliminada" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any).from("redirects").update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-redirects"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setDialogOpen(true);
  };

  const openEdit = (r: Redirect) => {
    setEditing(r);
    setForm({
      source_path: r.source_path,
      target_path: r.target_path,
      redirect_type: r.redirect_type,
      is_active: r.is_active,
      is_regex: r.is_regex,
      priority: r.priority,
      notes: r.notes,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const filtered = redirects.filter(
    (r) =>
      r.source_path.toLowerCase().includes(search.toLowerCase()) ||
      r.target_path.toLowerCase().includes(search.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalHits = redirects.reduce((s, r) => s + r.hit_count, 0);
  const activeCount = redirects.filter((r) => r.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Redirecciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona redirecciones 301/302 del servidor
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Redirección
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{redirects.length}</div>
            <div className="text-xs text-muted-foreground">Total reglas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{redirects.length - activeCount}</div>
            <div className="text-xs text-muted-foreground">Inactivas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalHits}</div>
            <div className="text-xs text-muted-foreground">Hits totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ruta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Estado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="hidden sm:table-cell">→</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="w-16">Tipo</TableHead>
                  <TableHead className="w-16 hidden md:table-cell">Hits</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {search ? "Sin resultados" : "No hay redirecciones configuradas"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className={!r.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <Switch
                          checked={r.is_active}
                          onCheckedChange={(v) => toggleMutation.mutate({ id: r.id, is_active: v })}
                        />
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                          {r.source_path}
                        </code>
                        {r.is_regex && (
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            regex
                          </Badge>
                        )}
                        {r.notes && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {r.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                          {r.target_path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.redirect_type === 301 ? "default" : "secondary"}>
                          {r.redirect_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{r.hit_count}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("¿Eliminar esta redirección?")) deleteMutation.mutate(r.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Redirección" : "Nueva Redirección"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ruta origen *</Label>
              <Input
                placeholder="/vieja-ruta"
                value={form.source_path}
                onChange={(e) => setForm({ ...form, source_path: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Ruta relativa (ej. /blog/antiguo) o URL absoluta para externos
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ruta destino *</Label>
              <Input
                placeholder="/nueva-ruta o https://..."
                value={form.target_path}
                onChange={(e) => setForm({ ...form, target_path: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={String(form.redirect_type)}
                  onValueChange={(v) => setForm({ ...form, redirect_type: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="301">301 — Permanente</SelectItem>
                    <SelectItem value="302">302 — Temporal</SelectItem>
                    <SelectItem value="307">307 — Temporal (preserva método)</SelectItem>
                    <SelectItem value="308">308 — Permanente (preserva método)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                />
                <p className="text-[11px] text-muted-foreground">Mayor = evalúa primero</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Activa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_regex}
                  onCheckedChange={(v) => setForm({ ...form, is_regex: v })}
                />
                <Label>Regex</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Motivo del redirect, ticket relacionado..."
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate({ ...form, id: editing?.id })}
              disabled={saveMutation.isPending || !form.source_path || !form.target_path}
            >
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Tag, Plus, Pencil, Trash2, Search, Package, Puzzle,
  ShoppingBag, CreditCard, Settings2, TrendingUp, Hash,
  Eye, EyeOff, Sparkles, BarChart3,
} from "lucide-react";

interface CatalogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  entity_type: string;
  is_active: boolean;
  sort_order: number;
  seo_boost: boolean;
  created_at: string;
}

const ENTITY_TYPES = [
  { value: "all", label: "Todos", icon: Tag },
  { value: "product", label: "Producto", icon: ShoppingBag },
  { value: "module", label: "Módulo", icon: Puzzle },
  { value: "service", label: "Servicio", icon: Settings2 },
  { value: "plan", label: "Plan", icon: CreditCard },
  { value: "subscription", label: "Suscripción", icon: TrendingUp },
];

const COLOR_OPTIONS = [
  { value: "default", label: "Gris", className: "bg-muted text-muted-foreground" },
  { value: "blue", label: "Azul", className: "bg-blue-100 text-blue-700" },
  { value: "green", label: "Verde", className: "bg-green-100 text-green-700" },
  { value: "red", label: "Rojo", className: "bg-red-100 text-red-700" },
  { value: "orange", label: "Naranja", className: "bg-orange-100 text-orange-700" },
  { value: "purple", label: "Morado", className: "bg-purple-100 text-purple-700" },
  { value: "teal", label: "Teal", className: "bg-teal-100 text-teal-700" },
  { value: "indigo", label: "Índigo", className: "bg-indigo-100 text-indigo-700" },
  { value: "cyan", label: "Cian", className: "bg-cyan-100 text-cyan-700" },
  { value: "gold", label: "Dorado", className: "bg-yellow-100 text-yellow-700" },
  { value: "gray", label: "Gris oscuro", className: "bg-gray-100 text-gray-700" },
];

export function getTagColorClass(color: string) {
  return COLOR_OPTIONS.find(c => c.value === color)?.className ?? "bg-muted text-muted-foreground";
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  color: "default",
  entity_type: "product",
  is_active: true,
  sort_order: 0,
  seo_boost: false,
};

export default function TagsView() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogTag | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["catalog_tags_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_tags")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as CatalogTag[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload = { ...form, slug };
      if (editing) {
        const { error } = await supabase.from("catalog_tags").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("catalog_tags").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog_tags_admin"] });
      qc.invalidateQueries({ queryKey: ["catalog_tags_public"] });
      toast.success(editing ? "Etiqueta actualizada" : "Etiqueta creada");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalog_tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog_tags_admin"] });
      toast.success("Etiqueta eliminada");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("catalog_tags").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog_tags_admin"] }),
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t: CatalogTag) => {
    setEditing(t);
    setForm({
      name: t.name, slug: t.slug, description: t.description || "",
      color: t.color, entity_type: t.entity_type,
      is_active: t.is_active, sort_order: t.sort_order, seo_boost: t.seo_boost,
    });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm(emptyForm); };

  const filtered = tags.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase());
    const matchType = filterType === "all" || t.entity_type === filterType;
    return matchSearch && matchType;
  });

  // Stats por tipo
  const statsByType = ENTITY_TYPES.slice(1).map(et => ({
    ...et,
    count: tags.filter(t => t.entity_type === et.value).length,
    active: tags.filter(t => t.entity_type === et.value && t.is_active).length,
    seo: tags.filter(t => t.entity_type === et.value && t.seo_boost).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Gestión de Etiquetas
          </h1>
          <p className="text-sm text-muted-foreground">
            Etiquetas centralizadas para productos, módulos, servicios, planes y suscripciones. Potencian el SEO y las búsquedas avanzadas.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Etiqueta
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsByType.map(s => (
          <Card key={s.value} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.count}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{s.active} activas</span>
                {s.seo > 0 && (
                  <span className="text-[10px] text-primary font-medium">{s.seo} SEO</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o slug..."
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map(et => (
              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No se encontraron etiquetas</p>
              <p className="text-sm mt-1">Crea tu primera etiqueta con el botón superior</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id} className={!t.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTagColorClass(t.color)}`}>
                          <Hash className="h-3 w-3" />
                          {t.name}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{t.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{t.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {ENTITY_TYPES.find(et => et.value === t.entity_type)?.label || t.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block w-4 h-4 rounded-full ${getTagColorClass(t.color).split(" ")[0]}`} />
                    </TableCell>
                    <TableCell>
                      {t.seo_boost ? (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Sparkles className="h-3 w-3" /> Sí
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{t.sort_order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={t.is_active}
                        onCheckedChange={v => toggleActive.mutate({ id: t.id, is_active: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(`¿Eliminar etiqueta "${t.name}"?`)) deleteMutation.mutate(t.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              {editing ? "Editar Etiqueta" : "Nueva Etiqueta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Ej: Facturación electrónica"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={e => set("slug", e.target.value)}
                  placeholder="Auto-generado"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Se usa en URLs y búsquedas</p>
              </div>
              <div>
                <Label>Entidad destino *</Label>
                <Select value={form.entity_type} onValueChange={v => set("entity_type", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.slice(1).map(et => (
                      <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={2}
                placeholder="Para qué se usa esta etiqueta..."
              />
            </div>

            <div>
              <Label>Color visual</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set("color", c.value)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border-2 ${c.className} ${form.color === c.value ? "border-primary scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {/* Preview */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Vista previa:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTagColorClass(form.color)}`}>
                  <Hash className="h-3 w-3" />
                  {form.name || "Mi etiqueta"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Orden de visualización</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-3 pt-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => set("is_active", v)} />
                  <Label className="cursor-pointer text-sm">Activa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.seo_boost} onCheckedChange={v => set("seo_boost", v)} />
                  <Label className="cursor-pointer text-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Boost SEO
                  </Label>
                </div>
              </div>
            </div>

            {form.seo_boost && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
                <strong className="text-primary">SEO Boost activo:</strong> Esta etiqueta se incluirá en los metadatos y schema.org de las entidades a las que se asigne, mejorando el posicionamiento en buscadores.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || saveMutation.isPending}
            >
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

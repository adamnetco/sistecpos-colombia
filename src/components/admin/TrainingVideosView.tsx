import { useState } from "react";
import { useTrainingVideos, useTrainingVideosMutations, type TrainingVideoRow } from "@/hooks/useTrainingVideos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Search, Upload, Play, Film, CheckCircle, XCircle, Clock, Users, ShieldCheck, Tag, X, Eye, Download } from "lucide-react";
import { mainTutorials, quickVideos } from "@/data/trainingVideos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import VideoCSVImporter from "./training/VideoCSVImporter";
import VideoPreviewDialog from "./training/VideoPreviewDialog";
import { exportToCsv } from "@/lib/exportCsv";
import * as XLSX from "xlsx";

const CATEGORIES = [
  "Básicos", "Ventas", "Inventario", "Facturación", "Caja", "Compras",
  "Configuración", "Avanzado", "Informes", "Contabilidad", "Actualizaciones", "Solución de problemas",
];

const SUGGESTED_TAGS = [
  "excel", "facturación electrónica", "impuestos", "seriales", "impresora", "crédito",
  "productos", "clientes", "proveedores", "caja", "precios", "balanza", "restaurante",
  "multi-tienda", "empleados", "informes", "contabilidad", "devoluciones", "descuentos",
  "lotes", "bodega", "códigos", "offline", "agenda", "producción", "cotización", "dian",
  "demo", "soporte",
];

const APPROVAL_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "⏳ Pendientes" },
  { value: "approved", label: "✅ Aprobados" },
  { value: "rejected", label: "❌ Rechazados" },
];

const emptyForm = {
  title: "", category: "Básicos", video_url: "", video_type: "youtube",
  duration: null as string | null, is_main: false, is_active: true, sort_order: 0,
  visible_to_customer: true, visible_to_reseller: true, approval_status: "approved",
  tags: [] as string[],
};

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));
  const unusedSuggestions = SUGGESTED_TAGS.filter((s) => !tags.includes(s));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] rounded-md border p-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
          </Badge>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); } }}
          placeholder={tags.length === 0 ? "Añadir tag..." : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedSuggestions.slice(0, 12).map((s) => (
            <button key={s} onClick={() => addTag(s)} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingVideosView() {
  const { data: videos = [], isLoading } = useTrainingVideos();
  const { create, update, remove } = useTrainingVideosMutations();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingVideoRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewVideo, setPreviewVideo] = useState<any>(null);

  const filtered = videos.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || ((v as any).tags || []).some((t: string) => t.includes(q));
    const matchApproval = approvalFilter === "all" || (v as any).approval_status === approvalFilter;
    const matchCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchSearch && matchApproval && matchCategory;
  });

  const pendingCount = videos.filter((v) => (v as any).approval_status === "pending").length;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (v: TrainingVideoRow) => {
    setEditing(v);
    setForm({
      title: v.title, category: v.category, video_url: v.video_url, video_type: v.video_type,
      duration: v.duration, is_main: v.is_main, is_active: v.is_active, sort_order: v.sort_order,
      visible_to_customer: (v as any).visible_to_customer ?? true,
      visible_to_reseller: (v as any).visible_to_reseller ?? true,
      approval_status: (v as any).approval_status ?? "approved",
      tags: (v as any).tags || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...form } as any);
    } else {
      await create.mutateAsync(form as any);
    }
    setDialogOpen(false);
  };

  const doApprove = async (id: string) => {
    const { error } = await supabase.from("training_videos").update({ approval_status: "approved" } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Video aprobado");
    qc.invalidateQueries({ queryKey: ["training-videos"] });
    setPreviewVideo(null);
  };

  const doReject = async (id: string) => {
    const { error } = await supabase.from("training_videos").update({ approval_status: "rejected" } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Video rechazado");
    qc.invalidateQueries({ queryKey: ["training-videos"] });
    setPreviewVideo(null);
  };

  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;
    const { error } = await supabase.from("training_videos").update({ approval_status: "approved" } as any).in("id", Array.from(selectedIds));
    if (error) { toast.error(error.message); return; }
    toast.success(`${selectedIds.size} videos aprobados`);
    setSelectedIds(new Set());
    qc.invalidateQueries({ queryKey: ["training-videos"] });
  };

  const bulkReject = async () => {
    if (selectedIds.size === 0) return;
    const { error } = await supabase.from("training_videos").update({ approval_status: "rejected" } as any).in("id", Array.from(selectedIds));
    if (error) { toast.error(error.message); return; }
    toast.success(`${selectedIds.size} videos rechazados`);
    setSelectedIds(new Set());
    qc.invalidateQueries({ queryKey: ["training-videos"] });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((v) => v.id)));
  };

  const handleImportStatic = async () => {
    setImporting(true);
    try {
      const all = [
        ...mainTutorials.map((v) => ({
          title: v.title, category: v.category, video_url: v.video_url,
          video_type: v.type, duration: v.duration || null,
          is_main: true, is_active: true, sort_order: v.order,
        })),
        ...quickVideos.map((v) => ({
          title: v.title, category: v.category, video_url: v.video_url,
          video_type: v.type, duration: v.duration || null,
          is_main: false, is_active: true, sort_order: v.order,
        })),
      ];
      const { error } = await supabase.from("training_videos").insert(all);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["training-videos"] });
      toast.success("Videos estáticos importados");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImporting(false);
    }
  };

  const exportColumns = [
    { key: "title", label: "Título" },
    { key: "category", label: "Categoría" },
    { key: "video_url", label: "URL" },
    { key: "video_type", label: "Tipo" },
    { key: "duration", label: "Duración" },
    { key: "tags", label: "Tags" },
    { key: "is_main", label: "Principal" },
    { key: "approval_status", label: "Estado" },
    { key: "visible_to_customer", label: "Cliente" },
    { key: "visible_to_reseller", label: "Socio" },
    { key: "view_count", label: "Vistas" },
  ];

  const getExportData = () =>
    filtered.map((v: any) => ({
      title: v.title,
      category: v.category,
      video_url: v.video_url,
      video_type: v.video_type,
      duration: v.duration || "",
      tags: (v.tags || []).join(", "),
      is_main: v.is_main ? "Sí" : "No",
      approval_status: v.approval_status ?? "approved",
      visible_to_customer: v.visible_to_customer ? "Sí" : "No",
      visible_to_reseller: v.visible_to_reseller ? "Sí" : "No",
      view_count: v.view_count ?? 0,
    }));

  const handleExportCsv = () => {
    const data = getExportData();
    if (data.length === 0) { toast.error("No hay videos para exportar"); return; }
    exportToCsv(data, exportColumns, "videos-capacitacion");
    toast.success(`${data.length} videos exportados como CSV`);
  };

  const handleExportXlsx = () => {
    const data = getExportData();
    if (data.length === 0) { toast.error("No hay videos para exportar"); return; }
    const headers = exportColumns.map((c) => c.label);
    const rows = data.map((d) => exportColumns.map((c) => d[c.key as keyof typeof d]));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Videos");
    XLSX.writeFile(wb, `videos-capacitacion-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${data.length} videos exportados como Excel`);
  };

  const approvalBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-600 gap-1 text-[10px]"><CheckCircle className="h-3 w-3" />Aprobado</Badge>;
    if (status === "rejected") return <Badge variant="destructive" className="gap-1 text-[10px]"><XCircle className="h-3 w-3" />Rechazado</Badge>;
    return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600 text-[10px]"><Clock className="h-3 w-3" />Pendiente</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Videos de Capacitación</h1>
          <p className="text-muted-foreground text-sm">{videos.length} videos · {filtered.length} mostrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {videos.length === 0 && (
            <Button variant="outline" onClick={handleImportStatic} disabled={importing} size="sm">
              <Upload className="mr-1.5 h-3.5 w-3.5" />{importing ? "Importando..." : "Importar estáticos"}
            </Button>
          )}
          <VideoCSVImporter />
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportXlsx} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />Excel
          </Button>
          <Button onClick={openCreate} size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> Nuevo Video</Button>
        </div>
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <button
          onClick={() => setApprovalFilter("pending")}
          className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 flex items-center gap-3 hover:bg-yellow-500/15 transition-colors text-left"
        >
          <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-700 text-sm">{pendingCount} video{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de aprobación</p>
            <p className="text-xs text-yellow-600">Clic para filtrar y revisar.</p>
          </div>
        </button>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar título, categoría o tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorías</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          {APPROVAL_FILTERS.map((f) => (
            <Button key={f.value} size="sm" variant={approvalFilter === f.value ? "default" : "outline"} onClick={() => setApprovalFilter(f.value)} className="text-xs px-2.5">
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selectedIds.size} seleccionados</span>
          <Button size="sm" onClick={bulkApprove} className="gap-1 bg-green-600 hover:bg-green-700"><CheckCircle className="h-3.5 w-3.5" />Aprobar</Button>
          <Button size="sm" variant="destructive" onClick={bulkReject} className="gap-1"><XCircle className="h-3.5 w-3.5" />Rechazar</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Limpiar</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={selectAllFiltered} /></TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Visibilidad</TableHead>
              <TableHead className="text-center">Vistas</TableHead>
              <TableHead className="w-36">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Sin videos</TableCell></TableRow>
            ) : filtered.map((v) => (
              <TableRow key={v.id} className={(v as any).approval_status === "pending" ? "bg-yellow-500/5" : ""}>
                <TableCell><Checkbox checked={selectedIds.has(v.id)} onCheckedChange={() => toggleSelect(v.id)} /></TableCell>
                <TableCell className="font-medium max-w-[200px]">
                  <div className="flex items-center gap-1.5">
                    {v.video_type === "youtube" ? <Play className="h-3 w-3 shrink-0 text-red-500" /> : <Film className="h-3 w-3 shrink-0 text-purple-500" />}
                    <span className="truncate">{v.title}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="capitalize text-xs">{v.category}</Badge></TableCell>
                <TableCell className="max-w-[180px]">
                  <div className="flex flex-wrap gap-0.5">
                    {((v as any).tags || []).slice(0, 3).map((t: string) => (
                      <span key={t} className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-medium">
                        <Tag className="h-2 w-2 mr-0.5" />{t}
                      </span>
                    ))}
                    {((v as any).tags || []).length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{(v as any).tags.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{approvalBadge((v as any).approval_status ?? "approved")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(v as any).visible_to_customer && <Badge variant="outline" className="text-[10px] gap-0.5"><Users className="h-2.5 w-2.5" />Cli</Badge>}
                    {(v as any).visible_to_reseller && <Badge variant="outline" className="text-[10px] gap-0.5"><ShieldCheck className="h-2.5 w-2.5" />Soc</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{v.view_count ?? 0}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setPreviewVideo({
                        ...v,
                        approval_status: (v as any).approval_status ?? "approved",
                        tags: (v as any).tags || [],
                        visible_to_customer: (v as any).visible_to_customer ?? true,
                        visible_to_reseller: (v as any).visible_to_reseller ?? true,
                      })}
                      title="Ver video"
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    {(v as any).approval_status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => doApprove(v.id)} title="Aprobar"><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => doReject(v.id)} title="Rechazar"><XCircle className="h-4 w-4 text-destructive" /></Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Video Preview Dialog */}
      <VideoPreviewDialog
        video={previewVideo}
        open={!!previewVideo}
        onOpenChange={(v) => { if (!v) setPreviewVideo(null); }}
        onApprove={doApprove}
        onReject={doReject}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Video" : "Nuevo Video"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.video_type} onValueChange={(v) => setForm({ ...form, video_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="loom">Loom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL del Video</Label>
              <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />Tags</Label>
              <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duración</Label>
                <Input value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value || null })} placeholder="ej: 5:30" />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.approval_status} onValueChange={(v) => setForm({ ...form, approval_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_main} onCheckedChange={(v) => setForm({ ...form, is_main: v })} />
                <Label>Principal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Activo</Label>
              </div>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <Label className="text-sm font-semibold">Visibilidad por Rol</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.visible_to_customer} onCheckedChange={(v) => setForm({ ...form, visible_to_customer: !!v })} />
                  <Label className="text-sm">👤 Clientes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.visible_to_reseller} onCheckedChange={(v) => setForm({ ...form, visible_to_reseller: !!v })} />
                  <Label className="text-sm">🤝 Socios</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.video_url || create.isPending || update.isPending}>
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

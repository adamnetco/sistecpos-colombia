import { useState } from "react";
import { useTrainingVideos, useTrainingVideosMutations, type TrainingVideoRow, type TrainingVideoInsert } from "@/hooks/useTrainingVideos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Upload, Play, Film } from "lucide-react";
import { mainTutorials, quickVideos } from "@/data/trainingVideos";

const CATEGORIES = [
  "Básicos", "Ventas", "Inventario", "Facturación", "Caja", "Compras",
  "Configuración", "Avanzado", "Informes", "Contabilidad", "Actualizaciones", "Solución de problemas",
];

const emptyForm: TrainingVideoInsert = {
  title: "", category: "Básicos", video_url: "", video_type: "youtube",
  duration: null, is_main: false, is_active: true, sort_order: 0,
};

export default function TrainingVideosView() {
  const { data: videos = [], isLoading } = useTrainingVideos();
  const { create, update, remove } = useTrainingVideosMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingVideoRow | null>(null);
  const [form, setForm] = useState<TrainingVideoInsert>(emptyForm);
  const [importing, setImporting] = useState(false);

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (v: TrainingVideoRow) => {
    setEditing(v);
    setForm({ title: v.title, category: v.category, video_url: v.video_url, video_type: v.video_type, duration: v.duration, is_main: v.is_main, is_active: v.is_active, sort_order: v.sort_order });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...form });
    } else {
      await create.mutateAsync(form);
    }
    setDialogOpen(false);
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
      const { error } = await (await import("@/integrations/supabase/client")).supabase
        .from("training_videos").insert(all);
      if (error) throw error;
      await (await import("@tanstack/react-query")).QueryClient.prototype.invalidateQueries;
      window.location.reload();
    } catch (e: any) {
      const { toast } = await import("sonner");
      toast.error(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Videos de Capacitación</h1>
          <p className="text-muted-foreground text-sm">{videos.length} videos registrados</p>
        </div>
        <div className="flex gap-2">
          {videos.length === 0 && (
            <Button variant="outline" onClick={handleImportStatic} disabled={importing}>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? "Importando..." : "Importar datos estáticos"}
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Video
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin videos</TableCell></TableRow>
            ) : filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium max-w-[250px] truncate">{v.title}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{v.category}</Badge></TableCell>
                <TableCell>
                  {v.video_type === "youtube" ? (
                    <span className="flex items-center gap-1 text-xs"><Play className="h-3 w-3" /> YouTube</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs"><Film className="h-3 w-3" /> Loom</span>
                  )}
                </TableCell>
                <TableCell>{v.is_main ? <Badge>Sí</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                <TableCell>{v.is_active ? <Badge className="bg-green-600">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>}</TableCell>
                <TableCell>{v.sort_order}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duración</Label>
                <Input value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value || null })} placeholder="ej: 5:30" />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_main} onCheckedChange={(v) => setForm({ ...form, is_main: v })} />
                <Label>Tutorial principal</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Activo</Label>
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

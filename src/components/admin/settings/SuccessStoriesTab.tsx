import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Trophy } from "lucide-react";

const businessTypes = [
  "restaurante", "tienda", "minimercado", "ferretería", "droguería",
  "panadería", "licorería", "papelería", "boutique", "veterinaria",
  "cafetería", "bar", "hotel", "gimnasio", "otro",
];

const defaultForm = {
  title: "", slug: "", business_name: "", business_type: "restaurante",
  city: "", contact_name: "", contact_role: "", quote: "",
  challenge: "", solution: "", results: "",
  image_url: "", logo_url: "", video_url: "",
  metrics: [] as { label: string; value: string }[],
  tags: [] as string[],
  is_featured: false, is_published: false, sort_order: 0,
};

export default function SuccessStoriesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [newMetricLabel, setNewMetricLabel] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["admin_success_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const openNew = () => { setEditing(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      title: s.title, slug: s.slug, business_name: s.business_name,
      business_type: s.business_type, city: s.city || "",
      contact_name: s.contact_name || "", contact_role: s.contact_role || "",
      quote: s.quote || "", challenge: s.challenge || "",
      solution: s.solution || "", results: s.results || "",
      image_url: s.image_url || "", logo_url: s.logo_url || "",
      video_url: s.video_url || "",
      metrics: (s.metrics as any[]) || [],
      tags: s.tags || [],
      is_featured: s.is_featured, is_published: s.is_published,
      sort_order: s.sort_order,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const payload = { ...form, slug, metrics: form.metrics as any };
      if (editing) {
        const { error } = await supabase.from("success_stories").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("success_stories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Caso actualizado" : "Caso creado");
      queryClient.invalidateQueries({ queryKey: ["admin_success_stories"] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("success_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Caso eliminado");
      queryClient.invalidateQueries({ queryKey: ["admin_success_stories"] });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "logo_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `stories/${Date.now()}-${field}.${ext}`;
    const { error } = await supabase.storage.from("success-stories").upload(path, file);
    if (error) { toast.error("Error subiendo archivo"); return; }
    const { data: urlData } = supabase.storage.from("success-stories").getPublicUrl(path);
    setForm(f => ({ ...f, [field]: urlData.publicUrl }));
    toast.success("Archivo subido");
  };

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Casos de Éxito ({stories.length})
        </h3>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Nuevo Caso</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : stories.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No hay casos de éxito aún</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {stories.map((s: any) => (
            <Card key={s.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.image_url && <img src={s.image_url} alt={s.title} className="w-12 h-12 rounded-lg object-cover" />}
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.business_name} · {s.business_type} · {s.city}</p>
                  </div>
                  {s.is_published ? <Badge variant="default" className="text-xs">Publicado</Badge> : <Badge variant="secondary" className="text-xs">Borrador</Badge>}
                  {s.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 text-xs">Destacado</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) deleteMutation.mutate(s.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editing ? "Editar Caso de Éxito" : "Nuevo Caso de Éxito"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6">
            <div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Restaurante X aumentó ventas 40%" />
                </div>
                <div>
                  <Label>Nombre del Negocio *</Label>
                  <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} />
                </div>
                <div>
                  <Label>Tipo de Negocio *</Label>
                  <Select value={form.business_type} onValueChange={v => set("business_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{businessTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input value={form.city} onChange={e => set("city", e.target.value)} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generado" />
                </div>
                <div>
                  <Label>Contacto</Label>
                  <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input value={form.contact_role} onChange={e => set("contact_role", e.target.value)} placeholder="Gerente" />
                </div>
              </div>
              <div>
                <Label>Cita / Testimonio</Label>
                <Textarea value={form.quote} onChange={e => set("quote", e.target.value)} rows={2} />
              </div>
              <div>
                <Label>El Desafío</Label>
                <Textarea value={form.challenge} onChange={e => set("challenge", e.target.value)} rows={3} />
              </div>
              <div>
                <Label>La Solución</Label>
                <Textarea value={form.solution} onChange={e => set("solution", e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Resultados</Label>
                <Textarea value={form.results} onChange={e => set("results", e.target.value)} rows={3} />
              </div>

              {/* Metrics */}
              <div>
                <Label>Métricas de Resultados</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={newMetricLabel} onChange={e => setNewMetricLabel(e.target.value)} placeholder="Ej: Aumento ventas" className="flex-1" />
                  <Input value={newMetricValue} onChange={e => setNewMetricValue(e.target.value)} placeholder="Ej: +40%" className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => {
                    if (newMetricLabel.trim() && newMetricValue.trim()) {
                      set("metrics", [...form.metrics, { label: newMetricLabel.trim(), value: newMetricValue.trim() }]);
                      setNewMetricLabel(""); setNewMetricValue("");
                    }
                  }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.metrics.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                      {m.label}: {m.value}
                      <button onClick={() => set("metrics", form.metrics.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Imagen principal</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="URL o subir" className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" size="icon" asChild><span><Upload className="h-4 w-4" /></span></Button>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "image_url")} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Logo del negocio</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={form.logo_url} onChange={e => set("logo_url", e.target.value)} placeholder="URL o subir" className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" size="icon" asChild><span><Upload className="h-4 w-4" /></span></Button>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "logo_url")} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <Label>URL de Video</Label>
                <Input value={form.video_url} onChange={e => set("video_url", e.target.value)} placeholder="https://youtube.com/..." />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_published} onCheckedChange={v => set("is_published", v)} />
                  <Label>Publicado</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={v => set("is_featured", v)} />
                  <Label>Destacado</Label>
                </div>
                <div className="w-20">
                  <Label>Orden</Label>
                  <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.title || !form.business_name || saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

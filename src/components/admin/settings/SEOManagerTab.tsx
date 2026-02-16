import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Globe, Eye, EyeOff, ExternalLink, Save, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";

interface PageSeo {
  id: string;
  page_path: string;
  page_label: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  og_type: string | null;
  robots: string | null;
  noindex: boolean;
  json_ld: any;
  priority: number | null;
  changefreq: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM: Omit<PageSeo, "id" | "created_at" | "updated_at"> = {
  page_path: "",
  page_label: "",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  og_image: "",
  og_type: "website",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  noindex: false,
  json_ld: null,
  priority: 0.5,
  changefreq: "weekly",
  notes: "",
};

export default function SEOManagerTab() {
  const [pages, setPages] = useState<PageSeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Omit<PageSeo, "id" | "created_at" | "updated_at">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [defaultOgImage, setDefaultOgImage] = useState("");
  const [savingDefault, setSavingDefault] = useState(false);

  const fetchDefaultOgImage = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "default_og_image")
      .maybeSingle();
    setDefaultOgImage((data as any)?.value || "");
  };

  const saveDefaultOgImage = async () => {
    setSavingDefault(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "default_og_image", value: defaultOgImage } as any);
    if (error) toast.error("Error guardando imagen por defecto");
    else toast.success("Imagen por defecto actualizada");
    setSavingDefault(false);
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "form" | "default") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5 MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("og-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Error subiendo imagen: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("og-images").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    if (target === "form") {
      setForm({ ...form, og_image: publicUrl });
    } else {
      setDefaultOgImage(publicUrl);
    }
    toast.success("Imagen subida");
    setUploading(false);
    e.target.value = "";
  };

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_seo_settings")
      .select("*")
      .order("page_path");
    if (error) toast.error("Error cargando configuración SEO");
    else setPages((data as unknown as PageSeo[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); fetchDefaultOgImage(); }, []);

  const filtered = pages.filter(
    (p) =>
      p.page_path.toLowerCase().includes(search.toLowerCase()) ||
      p.page_label.toLowerCase().includes(search.toLowerCase()) ||
      (p.meta_title || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setEditOpen(true);
  };

  const openEdit = (p: PageSeo) => {
    setForm({
      page_path: p.page_path,
      page_label: p.page_label,
      meta_title: p.meta_title || "",
      meta_description: p.meta_description || "",
      canonical_url: p.canonical_url || "",
      og_image: p.og_image || "",
      og_type: p.og_type || "website",
      robots: p.robots || "",
      noindex: p.noindex,
      json_ld: p.json_ld,
      priority: p.priority ?? 0.5,
      changefreq: p.changefreq || "weekly",
      notes: p.notes || "",
    });
    setEditingId(p.id);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!form.page_path) {
      toast.error("La ruta es obligatoria");
      return;
    }
    setSaving(true);

    const payload = {
      page_path: form.page_path,
      page_label: form.page_label,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      canonical_url: form.canonical_url || null,
      og_image: form.og_image || null,
      og_type: form.og_type || "website",
      robots: form.noindex
        ? "noindex, nofollow"
        : form.robots || "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      noindex: form.noindex,
      json_ld: form.json_ld,
      priority: form.priority,
      changefreq: form.changefreq,
      notes: form.notes || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("page_seo_settings").update(payload as any).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("page_seo_settings").insert(payload as any));
    }

    if (error) toast.error("Error guardando: " + error.message);
    else {
      toast.success(editingId ? "Actualizado" : "Creado");
      setEditOpen(false);
      fetchPages();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta configuración SEO?")) return;
    const { error } = await supabase.from("page_seo_settings").delete().eq("id", id);
    if (error) toast.error("Error eliminando");
    else {
      toast.success("Eliminado");
      fetchPages();
    }
  };

  const titleLen = (form.meta_title || "").length;
  const descLen = (form.meta_description || "").length;

  return (
    <div className="space-y-4">
      {/* Default OG Image */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Imagen OG por defecto (todas las páginas)</Label>
              <div className="flex gap-2">
                <Input
                  value={defaultOgImage}
                  onChange={(e) => setDefaultOgImage(e.target.value)}
                  placeholder="https://... (URL de la imagen por defecto)"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleOgImageUpload(e, "default")} disabled={uploading} />
                  <Button type="button" size="icon" variant="outline" asChild disabled={uploading}>
                    <span><Upload className="h-4 w-4" /></span>
                  </Button>
                </label>
                <Button size="sm" onClick={saveDefaultOgImage} disabled={savingDefault}>
                  <Save className="h-4 w-4 mr-1" />{savingDefault ? "..." : "Guardar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Se usa cuando una página no tiene imagen OG personalizada</p>
            </div>
            {defaultOgImage && (
              <img src={defaultOgImage} alt="OG preview" className="h-16 w-28 rounded border object-cover shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestor SEO por Página</h2>
          <p className="text-sm text-muted-foreground">{pages.length} páginas configuradas</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar página..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Nueva
          </Button>
          <Button size="sm" variant="outline" onClick={fetchPages} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Página</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Meta Title</th>
              <th className="text-center px-3 py-2 font-medium w-20">Index</th>
              <th className="text-center px-3 py-2 font-medium w-20">Prioridad</th>
              <th className="text-right px-3 py-2 font-medium w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2">
                  <div className="font-medium">{p.page_label || p.page_path}</div>
                  <code className="text-xs text-muted-foreground">{p.page_path}</code>
                </td>
                <td className="px-3 py-2 hidden md:table-cell max-w-xs truncate text-muted-foreground">
                  {p.meta_title || <span className="italic text-muted-foreground/50">Sin título</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {p.noindex ? (
                    <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />No</Badge>
                  ) : (
                    <Badge variant="default" className="gap-1 bg-green-600"><Eye className="h-3 w-3" />Sí</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-muted-foreground">{p.priority ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No se encontraron páginas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {editingId ? "Editar SEO" : "Nueva Página SEO"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ruta (path) *</Label>
                <Input
                  value={form.page_path}
                  onChange={(e) => setForm({ ...form, page_path: e.target.value })}
                  placeholder="/ruta-de-la-pagina"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Etiqueta</Label>
                <Input
                  value={form.page_label}
                  onChange={(e) => setForm({ ...form, page_label: e.target.value })}
                  placeholder="Nombre descriptivo"
                />
              </div>
            </div>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label>Meta Title</Label>
                <span className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                  {titleLen}/60
                </span>
              </div>
              <Input
                value={form.meta_title || ""}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                placeholder="Título optimizado para Google"
              />
              {titleLen > 60 && <p className="text-xs text-destructive">Recomendado: máximo 60 caracteres</p>}
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label>Meta Description</Label>
                <span className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                  {descLen}/160
                </span>
              </div>
              <Textarea
                value={form.meta_description || ""}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                placeholder="Descripción que aparecerá en Google"
                rows={3}
              />
              {descLen > 160 && <p className="text-xs text-destructive">Recomendado: máximo 160 caracteres</p>}
            </div>

            {/* Canonical & OG Image */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Canonical URL</Label>
                <Input
                  value={form.canonical_url || ""}
                  onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                  placeholder="https://sistecpos.com/..."
                />
                <p className="text-xs text-muted-foreground">Vacío = auto-generado</p>
              </div>
              <div className="space-y-1.5">
                <Label>OG Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.og_image || ""}
                    onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                    placeholder="https://... o sube una imagen"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleOgImageUpload(e, "form")} disabled={uploading} />
                    <Button type="button" size="icon" variant="outline" asChild disabled={uploading}>
                      <span>{uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                    </Button>
                  </label>
                </div>
                {form.og_image && (
                  <img src={form.og_image} alt="OG preview" className="h-20 w-36 rounded border object-cover mt-1" />
                )}
                <p className="text-xs text-muted-foreground">Vacío = imagen por defecto global</p>
              </div>
            </div>

            {/* OG Type & Robots */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>OG Type</Label>
                <Select value={form.og_type || "website"} onValueChange={(v) => setForm({ ...form, og_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">website</SelectItem>
                    <SelectItem value="article">article</SelectItem>
                    <SelectItem value="product">product</SelectItem>
                    <SelectItem value="profile">profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Robots</Label>
                <Input
                  value={form.robots || ""}
                  onChange={(e) => setForm({ ...form, robots: e.target.value })}
                  placeholder="index, follow"
                  disabled={form.noindex}
                />
              </div>
            </div>

            {/* Noindex toggle */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Switch
                checked={form.noindex}
                onCheckedChange={(v) => setForm({ ...form, noindex: v })}
              />
              <div>
                <Label className="font-medium">NoIndex</Label>
                <p className="text-xs text-muted-foreground">Ocultar esta página de los motores de búsqueda</p>
              </div>
            </div>

            {/* Sitemap settings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prioridad Sitemap</Label>
                <Select value={String(form.priority ?? 0.5)} onValueChange={(v) => setForm({ ...form, priority: parseFloat(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((v) => (
                      <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Frecuencia de cambio</Label>
                <Select value={form.changefreq || "weekly"} onValueChange={(v) => setForm({ ...form, changefreq: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* JSON-LD */}
            <div className="space-y-1.5">
              <Label>JSON-LD (datos estructurados)</Label>
              <Textarea
                value={form.json_ld ? JSON.stringify(form.json_ld, null, 2) : ""}
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                    setForm({ ...form, json_ld: parsed });
                  } catch {
                    // Allow typing incomplete JSON
                  }
                }}
                placeholder='{"@context":"https://schema.org",...}'
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Opcional: esquema JSON-LD personalizado para esta página</p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notas internas</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas sobre la estrategia SEO de esta página..."
                rows={2}
              />
            </div>

            {/* SERP Preview */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Vista previa en Google</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-0.5">
                  <p className="text-[#1a0dab] text-base font-medium truncate leading-snug">
                    {form.meta_title || "Título de la página — SistecPOS"}
                  </p>
                  <p className="text-[#006621] text-xs truncate">
                    https://sistecpos.com{form.page_path}
                  </p>
                  <p className="text-[#545454] text-sm line-clamp-2 leading-snug">
                    {form.meta_description || "Descripción de la página..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

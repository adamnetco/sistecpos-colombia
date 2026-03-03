import { useState, useMemo, useRef } from "react";
import { useAllPageContent, useUpsertPageContent, useDeletePageContent, type PageContentBlock } from "@/hooks/usePageContent";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, FileText, Image, Code2, Search,
  Upload, Eye, Save, X, Type, Braces, LayoutGrid,
} from "lucide-react";

/* ─── Page registry: all pages that can have CMS content ─── */
const PAGE_REGISTRY = [
  { path: "/", label: "Inicio (Home)", group: "Comercial" },
  { path: "/licencias", label: "Licencias", group: "Comercial" },
  { path: "/packs", label: "Packs", group: "Comercial" },
  { path: "/planes", label: "Planes y Suscripciones", group: "Comercial" },
  { path: "/productos", label: "Productos", group: "Comercial" },
  { path: "/servicios", label: "Servicios", group: "Comercial" },
  { path: "/modulos", label: "Módulos", group: "Comercial" },
  { path: "/soluciones", label: "Soluciones", group: "Comercial" },
  { path: "/facturacion-electronica", label: "Facturación Electrónica", group: "Institucional" },
  { path: "/nosotros", label: "Nosotros", group: "Institucional" },
  { path: "/contacto", label: "Contacto", group: "Institucional" },
  { path: "/representantes", label: "Representantes", group: "Institucional" },
  { path: "/comparar", label: "Comparar Software", group: "Marketing" },
  { path: "/software-pos-colombia", label: "Software POS Colombia", group: "Marketing" },
  { path: "/certificados-digitales", label: "Certificados Digitales", group: "Marketing" },
  { path: "/casos-exito", label: "Casos de Éxito", group: "Marketing" },
  { path: "/lp/demo", label: "Landing Demo", group: "Marketing" },
];

const CONTENT_TYPES = [
  { value: "text", label: "Texto", icon: Type },
  { value: "markdown", label: "Markdown", icon: FileText },
  { value: "image", label: "Imagen", icon: Image },
  { value: "html", label: "HTML", icon: Code2 },
  { value: "json", label: "JSON", icon: Braces },
];

export default function PageContentView() {
  const { data: allBlocks = [], isLoading } = useAllPageContent();
  const upsertMut = useUpsertPageContent();
  const deleteMut = useDeletePageContent();

  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PageContentBlock | null>(null);

  const pageBlocks = useMemo(() => {
    let filtered = allBlocks.filter((b) => b.page_path === selectedPage);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.section_key.toLowerCase().includes(q) ||
          b.text_value?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allBlocks, selectedPage, search]);

  const pageGroups = useMemo(() => {
    const groups: Record<string, typeof PAGE_REGISTRY> = {};
    PAGE_REGISTRY.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  const blockCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allBlocks.forEach((b) => {
      counts[b.page_path] = (counts[b.page_path] || 0) + 1;
    });
    return counts;
  }, [allBlocks]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (block: PageContentBlock) => {
    setEditing(block);
    setDialogOpen(true);
  };

  const handleDelete = (block: PageContentBlock) => {
    if (!confirm(`¿Eliminar bloque "${block.section_key}"?`)) return;
    deleteMut.mutate(block.id, {
      onSuccess: () => toast.success("Bloque eliminado"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const currentPageLabel = PAGE_REGISTRY.find((p) => p.path === selectedPage)?.label || selectedPage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Gestor de Contenido (CMS)
          </h1>
          <p className="text-sm text-muted-foreground">
            Edita textos, imágenes y contenido de cada página del sitio
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Bloque
        </Button>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Page selector sidebar */}
        <Card className="border-0 shadow-card h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Páginas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[60vh] overflow-y-auto">
              {Object.entries(pageGroups).map(([group, pages]) => (
                <div key={group}>
                  <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-muted/30">
                    {group}
                  </div>
                  {pages.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => setSelectedPage(p.path)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                        selectedPage === p.path
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-foreground"
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      {blockCount[p.path] ? (
                        <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                          {blockCount[p.path]}
                        </Badge>
                      ) : null}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content blocks */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold flex-1">{currentPageLabel}</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar bloques..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : pageBlocks.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Sin bloques de contenido</p>
                <p className="text-sm mt-1">Agrega bloques para personalizar esta página</p>
                <Button onClick={openNew} variant="outline" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Agregar primer bloque
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pageBlocks.map((block) => (
                <ContentBlockCard
                  key={block.id}
                  block={block}
                  onEdit={() => openEdit(block)}
                  onDelete={() => handleDelete(block)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <ContentBlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        pagePath={selectedPage}
        onSave={(data) => {
          upsertMut.mutate(data, {
            onSuccess: () => {
              toast.success(editing ? "Bloque actualizado" : "Bloque creado");
              setDialogOpen(false);
            },
            onError: (e: any) => toast.error(e.message),
          });
        }}
        saving={upsertMut.isPending}
      />
    </div>
  );
}

/* ─── Block Card ─── */
function ContentBlockCard({
  block,
  onEdit,
  onDelete,
}: {
  block: PageContentBlock;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeInfo = CONTENT_TYPES.find((t) => t.value === block.content_type);
  const TypeIcon = typeInfo?.icon || Type;

  return (
    <Card className="border shadow-sm hover:shadow-card transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <TypeIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-sm font-mono font-semibold text-foreground">
                {block.section_key}
              </code>
              <Badge variant="outline" className="text-[10px]">
                {typeInfo?.label || block.content_type}
              </Badge>
              {!block.is_active && (
                <Badge variant="secondary" className="text-[10px]">
                  Oculto
                </Badge>
              )}
            </div>
            {block.content_type === "image" && block.image_url ? (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={block.image_url}
                  alt={block.image_alt || ""}
                  className="h-16 w-24 rounded-md object-cover border"
                />
                <span className="text-xs text-muted-foreground truncate">
                  {block.image_alt || block.image_url}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {block.text_value || "(vacío)"}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Edit/Create Dialog ─── */
function ContentBlockDialog({
  open,
  onOpenChange,
  editing,
  pagePath,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: PageContentBlock | null;
  pagePath: string;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleOpen = (v: boolean) => {
    if (v) {
      if (editing) {
        setForm({ ...editing });
      } else {
        setForm({
          page_path: pagePath,
          section_key: "",
          content_type: "text",
          text_value: "",
          image_url: "",
          image_alt: "",
          json_value: null,
          sort_order: 0,
          is_active: true,
        });
      }
    }
    onOpenChange(v);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB por imagen");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "shared-resources");
      formData.append("folder", `cms${pagePath.replace(/\//g, "_")}`);

      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Upload failed");
      }

      const result = await resp.json();
      setForm((f) => ({ ...f, image_url: result.url, content_type: "image" }));
      toast.success("Imagen subida exitosamente");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.section_key) {
      toast.error("La clave de sección es obligatoria");
      return;
    }
    onSave({
      page_path: form.page_path || pagePath,
      section_key: form.section_key,
      content_type: form.content_type || "text",
      text_value: form.text_value || null,
      image_url: form.image_url || null,
      image_alt: form.image_alt || null,
      json_value: form.json_value || null,
      sort_order: form.sort_order || 0,
      is_active: form.is_active ?? true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Bloque" : "Nuevo Bloque de Contenido"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Section key + type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Clave de sección *</Label>
              <Input
                value={form.section_key || ""}
                onChange={(e) => setForm((f) => ({ ...f, section_key: e.target.value }))}
                placeholder="hero_title, cta_text, banner_img..."
                disabled={!!editing}
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Identificador único dentro de la página
              </p>
            </div>
            <div>
              <Label>Tipo de contenido</Label>
              <Select
                value={form.content_type || "text"}
                onValueChange={(v) => setForm((f) => ({ ...f, content_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content editor based on type */}
          {(form.content_type === "text" || form.content_type === "html") && (
            <div>
              <Label>{form.content_type === "html" ? "Contenido HTML" : "Texto"}</Label>
              <Textarea
                value={form.text_value || ""}
                onChange={(e) => setForm((f) => ({ ...f, text_value: e.target.value }))}
                rows={form.content_type === "html" ? 8 : 3}
                className={form.content_type === "html" ? "font-mono text-sm" : ""}
              />
            </div>
          )}

          {form.content_type === "markdown" && (
            <div>
              <Label>Contenido Markdown</Label>
              <Textarea
                value={form.text_value || ""}
                onChange={(e) => setForm((f) => ({ ...f, text_value: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
                placeholder="## Título&#10;&#10;Párrafo con **negrita** y *cursiva*"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Soporta: **negrita**, *cursiva*, ## títulos, - listas, [enlaces](url)
              </p>
            </div>
          )}

          {form.content_type === "image" && (
            <div className="space-y-3">
              <div>
                <Label>Imagen</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.image_url || ""}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="URL de la imagen o sube una..."
                    className="flex-1"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Subiendo..." : "Subir"}
                  </Button>
                </div>
              </div>
              {form.image_url && (
                <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                  <img
                    src={form.image_url}
                    alt={form.image_alt || "Preview"}
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              )}
              <div>
                <Label>Texto alternativo (alt)</Label>
                <Input
                  value={form.image_alt || ""}
                  onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                  placeholder="Descripción de la imagen para SEO y accesibilidad"
                />
              </div>
            </div>
          )}

          {form.content_type === "json" && (
            <div>
              <Label>Datos JSON</Label>
              <Textarea
                value={
                  typeof form.json_value === "string"
                    ? form.json_value
                    : JSON.stringify(form.json_value, null, 2) || ""
                }
                onChange={(e) => {
                  try {
                    setForm((f) => ({ ...f, json_value: JSON.parse(e.target.value) }));
                  } catch {
                    setForm((f) => ({ ...f, json_value: e.target.value }));
                  }
                }}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* Sort order + active */}
          <div className="flex items-center gap-6">
            <div className="w-32">
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm mt-5">
              <Switch
                checked={form.is_active ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              Visible
            </label>
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : editing ? "Actualizar Bloque" : "Crear Bloque"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

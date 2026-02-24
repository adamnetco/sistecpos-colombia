import { useState } from "react";
import { useSupportArticles, useSupportArticlesMutations, type SupportArticleRow } from "@/hooks/useSupportArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Search, Eye, Pin, FileText, Video, Copy, Share2, ExternalLink, ChevronDown, HelpCircle, Users, ShieldCheck, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const CATEGORIES = [
  "general", "facturación", "inventario", "ventas", "configuración",
  "impresoras", "reportes", "solución de problemas", "actualizaciones",
];

const MARKDOWN_GUIDE = `## Guía rápida de Markdown

| Formato | Sintaxis | Resultado |
|---------|----------|-----------|
| **Negrita** | \`**texto**\` | **texto** |
| *Cursiva* | \`*texto*\` | *texto* |
| Enlace | \`[texto](url)\` | [texto](url) |
| Imagen | \`![alt](url)\` | Imagen embebida |
| Título | \`## Título\` | Título H2 |
| Lista | \`- item\` | • item |
| Checklist | \`- [x] hecho\` | ☑ hecho |
| Checklist | \`- [ ] pendiente\` | ☐ pendiente |
| Código | \`\\\`código\\\`\` | \`código\` |
| Separador | \`---\` | Línea horizontal |
| Video | \`[Ver video](https://youtube.com/...)\` | Enlace al video |
`;

const emptyForm = {
  title: "", slug: "", excerpt: "", content: "", category: "general",
  cover_image_url: "", video_url: "", is_published: false, is_pinned: false,
  sort_order: 0, author_name: "Equipo SistecPOS", tags: [] as string[],
  visible_to_customer: true, visible_to_reseller: true, visible_to_public: false,
};

export default function SupportArticlesView() {
  const { data: articles = [], isLoading } = useSupportArticles();
  const { create, update, remove } = useSupportArticlesMutations();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mdGuideOpen, setMdGuideOpen] = useState(false);
  const [editing, setEditing] = useState<SupportArticleRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewArticle, setPreviewArticle] = useState<SupportArticleRow | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.tags || []).some(t => t.includes(q));
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (a: SupportArticleRow) => {
    setEditing(a);
    setForm({
      title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: a.content,
      category: a.category, cover_image_url: a.cover_image_url || "",
      video_url: a.video_url || "", is_published: a.is_published, is_pinned: a.is_pinned,
      sort_order: a.sort_order, author_name: a.author_name || "Equipo SistecPOS",
      tags: a.tags || [],
      visible_to_customer: (a as any).visible_to_customer ?? true,
      visible_to_reseller: (a as any).visible_to_reseller ?? true,
      visible_to_public: (a as any).visible_to_public ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      cover_image_url: form.cover_image_url || null,
      video_url: form.video_url || null,
      excerpt: form.excerpt || null,
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload } as any);
    } else {
      await create.mutateAsync(payload as any);
    }
    setDialogOpen(false);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] });
    setTagInput("");
  };

  const copyArticleUrl = async (a: SupportArticleRow) => {
    const url = `${window.location.origin}/ayuda/${a.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(a.id);
    toast.success("URL copiada");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareArticle = async (a: SupportArticleRow) => {
    const url = `${window.location.origin}/ayuda/${a.slug}`;
    if (navigator.share) {
      await navigator.share({ title: a.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada al portapapeles");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Artículos de Soporte</h1>
          <p className="text-muted-foreground text-sm">{articles.length} artículos · Base de conocimiento para clientes y socios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMdGuideOpen(true)} className="gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> Guía Markdown
          </Button>
          <Button onClick={openCreate} size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Nuevo Artículo</Button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Visibilidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Vistas</TableHead>
              <TableHead className="w-44">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin artículos</TableCell></TableRow>
            ) : filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium max-w-[220px]">
                  <div className="flex items-center gap-1.5">
                    {a.is_pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                    {a.video_url && <Video className="h-3 w-3 text-red-500 shrink-0" />}
                    <span className="truncate">{a.title}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="capitalize text-xs">{a.category}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-0.5 flex-wrap">
                    {(a as any).visible_to_customer && <Badge variant="outline" className="text-[10px] gap-0.5"><Users className="h-2.5 w-2.5" />Cli</Badge>}
                    {(a as any).visible_to_reseller && <Badge variant="outline" className="text-[10px] gap-0.5"><ShieldCheck className="h-2.5 w-2.5" />Soc</Badge>}
                    {(a as any).visible_to_public && <Badge variant="outline" className="text-[10px] gap-0.5"><Globe className="h-2.5 w-2.5" />Pub</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  {a.is_published
                    ? <Badge className="bg-green-600 text-[10px]">Publicado</Badge>
                    : <Badge variant="outline" className="text-[10px]">Borrador</Badge>}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">{a.view_count}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => copyArticleUrl(a)} title="Copiar URL">
                      {copiedId === a.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => shareArticle(a)} title="Compartir">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setPreviewArticle(a); setPreviewOpen(true); }}><Eye className="h-4 w-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Markdown Guide Dialog */}
      <Dialog open={mdGuideOpen} onOpenChange={setMdGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Guía de Markdown</DialogTitle></DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{MARKDOWN_GUIDE}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{previewArticle?.title}</DialogTitle>
              {previewArticle && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => copyArticleUrl(previewArticle)} className="gap-1 text-xs">
                    <Copy className="h-3 w-3" /> Copiar URL
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => shareArticle(previewArticle)} className="gap-1 text-xs">
                    <Share2 className="h-3 w-3" /> Compartir
                  </Button>
                </div>
              )}
            </div>
            {previewArticle && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" /> {previewArticle.view_count} vistas
                <span>·</span>
                <Badge variant="secondary" className="capitalize text-[10px]">{previewArticle.category}</Badge>
              </div>
            )}
          </DialogHeader>
          {previewArticle && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {previewArticle.video_url && (
                <div className="relative w-full overflow-hidden rounded-lg mb-4" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={previewArticle.video_url.includes("youtube") 
                      ? previewArticle.video_url.replace("watch?v=", "embed/")
                      : previewArticle.video_url}
                    title="Video" allowFullScreen
                  />
                </div>
              )}
              <ReactMarkdown
                components={{
                  input: ({ type, checked, ...props }) => {
                    if (type === "checkbox") return <input type="checkbox" checked={checked} readOnly className="mr-2" />;
                    return <input type={type} {...props} />;
                  },
                }}
              >
                {previewArticle.content}
              </ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Artículo" : "Nuevo Artículo"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm({ ...form, title, slug: editing ? form.slug : generateSlug(title) });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Extracto (resumen corto)</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Breve descripción del artículo..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL Video explicativo</Label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/..." />
              </div>
              <div className="space-y-2">
                <Label>URL Imagen de portada</Label>
                <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contenido (Markdown) *</Label>
                <Button variant="ghost" size="sm" onClick={() => setMdGuideOpen(true)} className="gap-1 text-xs h-6">
                  <HelpCircle className="h-3 w-3" /> Ver guía Markdown
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Soporta **negrita**, *cursiva*, listas, enlaces, imágenes, videos embebidos y checklists: <code>- [x] Tarea completada</code>, <code>- [ ] Tarea pendiente</code>
              </p>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={16}
                className="font-mono text-sm"
                placeholder={`# Título del artículo\n\n## Paso 1: Preparación\nDescripción del paso...\n\n## Checklist\n- [x] Paso completado\n- [ ] Paso pendiente\n\n## Video Tutorial\n[Ver video](https://youtube.com/...)`}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border p-2 min-h-[32px]">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })} className="ml-0.5 hover:text-destructive">×</button>
                  </Badge>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                  placeholder="Añadir tag..."
                  className="flex-1 min-w-[80px] bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Publicado</Label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_pinned} onCheckedChange={(v) => setForm({ ...form, is_pinned: v })} />
                <Label>Fijado</Label>
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <Label className="text-sm font-semibold">Visibilidad por Perfil</Label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.visible_to_customer} onCheckedChange={(v) => setForm({ ...form, visible_to_customer: !!v })} />
                  <Label className="text-sm">👤 Clientes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.visible_to_reseller} onCheckedChange={(v) => setForm({ ...form, visible_to_reseller: !!v })} />
                  <Label className="text-sm">🤝 Socios</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.visible_to_public} onCheckedChange={(v) => setForm({ ...form, visible_to_public: !!v })} />
                  <Label className="text-sm">🌐 Público (sin registro)</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.slug || !form.content || create.isPending || update.isPending}>
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

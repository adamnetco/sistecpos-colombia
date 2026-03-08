import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText, Search, Plus, Pencil, Eye, ExternalLink,
  Globe, Lock, LayoutGrid, RefreshCw, Trash2,
  CheckCircle, XCircle, Clock, Filter,
} from "lucide-react";

interface SitePage {
  id: string;
  path: string;
  title: string;
  description: string | null;
  status: string;
  page_type: string;
  has_seo: boolean;
  has_content_blocks: boolean;
  last_edited_at: string;
  last_edited_by: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  published: { label: "Publicada", color: "bg-green-500/10 text-green-700 border-green-200", icon: CheckCircle },
  draft: { label: "Borrador", color: "bg-amber-500/10 text-amber-700 border-amber-200", icon: Clock },
  private: { label: "Privada", color: "bg-purple-500/10 text-purple-700 border-purple-200", icon: Lock },
  disabled: { label: "Deshabilitada", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  static: "Estática",
  dynamic: "Dinámica",
  landing: "Landing",
  admin: "Admin",
  portal: "Portal",
  blog: "Blog/Artículo",
};

export default function PagesOverviewView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SitePage | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["site_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("*")
        .order("sort_order")
        .order("title");
      if (error) throw error;
      return data as SitePage[];
    },
  });

  const filtered = useMemo(() => {
    let result = pages;
    if (filterStatus !== "all") result = result.filter((p) => p.status === filterStatus);
    if (filterType !== "all") result = result.filter((p) => p.page_type === filterType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [pages, search, filterStatus, filterType]);

  const stats = useMemo(() => ({
    total: pages.length,
    published: pages.filter((p) => p.status === "published").length,
    draft: pages.filter((p) => p.status === "draft").length,
    withSeo: pages.filter((p) => p.has_seo).length,
  }), [pages]);

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_pages"] });
      toast.success("Página eliminada");
    },
  });

  const syncPages = useMutation({
    mutationFn: async () => {
      // Auto-discover pages from the app routes
      const appPages = [
        { path: "/", title: "Inicio", page_type: "static" },
        { path: "/soluciones", title: "Soluciones", page_type: "static" },
        { path: "/productos", title: "Productos", page_type: "dynamic" },
        { path: "/planes", title: "Planes y Precios", page_type: "static" },
        { path: "/licencias", title: "Licencias", page_type: "static" },
        { path: "/packs", title: "Packs Comerciales", page_type: "landing" },
        { path: "/modulos", title: "Módulos", page_type: "static" },
        { path: "/nosotros", title: "Nosotros", page_type: "static" },
        { path: "/contacto", title: "Contacto", page_type: "static" },
        { path: "/comparar", title: "Comparar", page_type: "dynamic" },
        { path: "/representantes", title: "Representantes", page_type: "landing" },
        { path: "/casos-exito", title: "Casos de Éxito", page_type: "dynamic" },
        { path: "/servicios", title: "Servicios", page_type: "static" },
        { path: "/guias-dian", title: "Guías DIAN", page_type: "blog" },
        { path: "/ayuda", title: "Centro de Ayuda", page_type: "dynamic" },
        { path: "/facturacion-electronica", title: "Facturación Electrónica", page_type: "static" },
        { path: "/software-pos-colombia", title: "Software POS Colombia", page_type: "landing" },
        { path: "/calculadora-uvt", title: "Calculadora UVT", page_type: "static" },
        { path: "/validador-nit", title: "Validador NIT", page_type: "static" },
        { path: "/demo", title: "Solicitar Demo", page_type: "landing" },
        { path: "/activar-demo", title: "Activar Demo", page_type: "static" },
        { path: "/auth", title: "Autenticación", page_type: "static" },
        { path: "/clientes", title: "Portal Clientes", page_type: "portal" },
        { path: "/admin", title: "Panel Administrativo", page_type: "admin" },
        { path: "/representante", title: "Portal Representantes", page_type: "portal" },
        { path: "/politica-privacidad", title: "Política de Privacidad", page_type: "static" },
        { path: "/terminos-condiciones", title: "Términos y Condiciones", page_type: "static" },
        { path: "/gracias", title: "Gracias", page_type: "static" },
      ];

      const existingPaths = pages.map((p) => p.path);
      const newPages = appPages.filter((p) => !existingPaths.includes(p.path));

      if (newPages.length === 0) {
        toast.info("Todas las páginas ya están registradas");
        return;
      }

      const { error } = await supabase.from("site_pages").insert(
        newPages.map((p, i) => ({
          ...p,
          status: "published",
          has_seo: true,
          sort_order: i,
        }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_pages"] });
      toast.success("Páginas sincronizadas");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Páginas del Sitio
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona todas las páginas como en WordPress — estado, SEO y contenido
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => syncPages.mutate()} disabled={syncPages.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1 ${syncPages.isPending ? "animate-spin" : ""}`} />
            Sincronizar
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva Página
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-primary" },
          { label: "Publicadas", value: stats.published, icon: CheckCircle, color: "text-green-600" },
          { label: "Borradores", value: stats.draft, icon: Clock, color: "text-amber-600" },
          { label: "Con SEO", value: stats.withSeo, icon: Search, color: "text-blue-600" },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar página..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="private">Privadas</SelectItem>
            <SelectItem value="disabled">Deshabilitadas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead className="hidden md:table-cell">Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">SEO</TableHead>
                <TableHead className="hidden lg:table-cell">Última edición</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron páginas</TableCell></TableRow>
              ) : filtered.map((page) => {
                const st = STATUS_CONFIG[page.status] || STATUS_CONFIG.published;
                const StIcon = st.icon;
                return (
                  <TableRow key={page.id} className="group">
                    <TableCell>
                      <div className="font-medium">{page.title}</div>
                      {page.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{page.description}</p>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{page.path}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 text-[10px] ${st.color}`}>
                        <StIcon className="h-3 w-3" />
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px]">{TYPE_LABELS[page.page_type] || page.page_type}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {page.has_seo ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {format(new Date(page.last_edited_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link to={page.path} target="_blank"><Eye className="h-3.5 w-3.5" /></Link>
                        </Button>
                        {page.has_content_blocks && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link to="/admin/contenido"><LayoutGrid className="h-3.5 w-3.5" /></Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(page); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          if (confirm(`¿Eliminar "${page.title}"?`)) deleteMut.mutate(page.id);
                        }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {dialogOpen && (
        <PageDialog
          page={editing}
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ─── Page Edit Dialog ─── */
function PageDialog({ page, open, onClose }: { page: SitePage | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!page;
  const [form, setForm] = useState({
    path: page?.path || "",
    title: page?.title || "",
    description: page?.description || "",
    status: page?.status || "published",
    page_type: page?.page_type || "static",
    has_seo: page?.has_seo ?? true,
    has_content_blocks: page?.has_content_blocks ?? false,
    notes: page?.notes || "",
    sort_order: page?.sort_order ?? 0,
  });

  const save = async () => {
    if (!form.path || !form.title) {
      toast.error("Ruta y título son obligatorios");
      return;
    }
    const payload = { ...form, last_edited_at: new Date().toISOString() };
    if (isEdit) {
      const { error } = await supabase.from("site_pages").update(payload).eq("id", page.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("site_pages").insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    qc.invalidateQueries({ queryKey: ["site_pages"] });
    toast.success(isEdit ? "Página actualizada" : "Página creada");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Página" : "Nueva Página"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Inicio" />
          </div>
          <div>
            <Label>Ruta</Label>
            <Input value={form.path} onChange={(e) => setForm((p) => ({ ...p, path: e.target.value }))} placeholder="/" disabled={isEdit} />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicada</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="private">Privada</SelectItem>
                  <SelectItem value="disabled">Deshabilitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.page_type} onValueChange={(v) => setForm((p) => ({ ...p, page_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.has_seo} onCheckedChange={(v) => setForm((p) => ({ ...p, has_seo: v }))} />
              <Label>SEO configurado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.has_content_blocks} onCheckedChange={(v) => setForm((p) => ({ ...p, has_content_blocks: v }))} />
              <Label>Bloques CMS</Label>
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{isEdit ? "Guardar" : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

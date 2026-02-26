import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, FileText, Eye, EyeOff, Link2,
  Copy, ExternalLink, Video, FileDown, Images, Package,
} from "lucide-react";

/* ─── Types ─── */
interface SalesPage {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  video_url: string | null;
  pdf_url: string | null;
  gallery_urls: string[];
  cta_whatsapp_message: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  original_price_cop: number | null;
  price_cop: number;
  coupon_code: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

interface SalesPageItem {
  id: string;
  sales_page_id: string;
  product_id: string | null;
  license_pricing_id: string | null;
  pack_id: string | null;
  item_type: string;
  custom_label: string | null;
  custom_price_cop: number | null;
  sort_order: number;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

export default function SalesPagesView() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalesPage | null>(null);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SalesPage | null>(null);

  /* ─── Queries ─── */
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["sales_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_pages")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SalesPage[];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["sales_page_items", selectedPage?.id],
    enabled: !!selectedPage,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_page_items")
        .select("*")
        .eq("sales_page_id", selectedPage!.id)
        .order("sort_order");
      if (error) throw error;
      return data as SalesPageItem[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["catalog_products_simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("id, name, product_type, price_cop")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["license_pricing_simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("license_pricing")
        .select("id, plan_label, selling_price_cop")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: packs = [] } = useQuery({
    queryKey: ["commercial_packs_simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_packs")
        .select("id, name, price_cop")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  /* ─── Mutations ─── */
  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales_pages"] }); toast.success("Eliminada"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("sales_pages").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales_pages"] }); toast.success("Actualizado"); },
  });

  const addItemMut = useMutation({
    mutationFn: async (item: Partial<SalesPageItem>) => {
      const { error } = await supabase.from("sales_page_items").insert(item as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales_page_items"] }); toast.success("Producto agregado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeItemMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales_page_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sales_page_items"] }); toast.success("Producto removido"); },
  });

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/venta/${slug}`);
    toast.success("URL copiada");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Landing Pages de Venta
          </h1>
          <p className="text-sm text-muted-foreground">Crea páginas compartibles con combos de productos, video, PDF y galería</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Landing
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : pages.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay landing pages de venta creadas.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground">/venta/{p.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatCOP(p.price_cop)}</div>
                      {p.original_price_cop && (
                        <div className="text-xs text-muted-foreground line-through">{formatCOP(p.original_price_cop)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.video_url && <Badge variant="outline" className="text-xs gap-1"><Video className="h-3 w-3" />Video</Badge>}
                        {p.pdf_url && <Badge variant="outline" className="text-xs gap-1"><FileDown className="h-3 w-3" />PDF</Badge>}
                        {p.gallery_urls?.length > 0 && <Badge variant="outline" className="text-xs gap-1"><Images className="h-3 w-3" />{p.gallery_urls.length}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={v => toggleActive.mutate({ id: p.id, is_active: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyUrl(p.slug)} title="Copiar URL">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Vista previa">
                          <a href={`/venta/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedPage(p); setItemsDialogOpen(true); }} title="Productos">
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("¿Eliminar?")) deleteMut.mutate(p.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <SalesPageFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["sales_pages"] }); setDialogOpen(false); setEditing(null); }}
      />

      {/* Items Dialog */}
      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Productos de "{selectedPage?.title}"</DialogTitle>
          </DialogHeader>
          <ItemsManager
            pageId={selectedPage?.id || ""}
            items={items}
            products={products}
            licenses={licenses}
            packs={packs}
            onAdd={addItemMut.mutate}
            onRemove={removeItemMut.mutate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Form Dialog ─── */
function SalesPageFormDialog({ open, onOpenChange, editing, onSaved }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SalesPage | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const reset = () => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({
        title: "", slug: "", subtitle: "", description: "", long_description: "",
        video_url: "", pdf_url: "", gallery_urls: [], cta_whatsapp_message: "",
        badge: "", is_active: true, is_featured: false, sort_order: 0,
        original_price_cop: null, price_cop: 0, coupon_code: "",
        meta_title: "", meta_description: "",
      });
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) reset();
    onOpenChange(v);
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Título y slug son obligatorios"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle || null,
        description: form.description || null,
        long_description: form.long_description || null,
        video_url: form.video_url || null,
        pdf_url: form.pdf_url || null,
        gallery_urls: form.gallery_urls || [],
        cta_whatsapp_message: form.cta_whatsapp_message || "",
        badge: form.badge || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        sort_order: form.sort_order || 0,
        original_price_cop: form.original_price_cop || null,
        price_cop: form.price_cop || 0,
        coupon_code: form.coupon_code || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      };

      if (editing) {
        const { error } = await supabase.from("sales_pages").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sales_pages").insert(payload);
        if (error) throw error;
      }
      toast.success(editing ? "Actualizada" : "Creada");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar" : "Nueva"} Landing de Venta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title || ""}
                onChange={e => {
                  const title = e.target.value;
                  setForm(f => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
                }}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug || ""} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={form.subtitle || ""} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>
          <div>
            <Label>Descripción corta</Label>
            <Textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div>
            <Label>Descripción larga (Markdown)</Label>
            <Textarea value={form.long_description || ""} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} rows={6} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Soporta Markdown: **negrita**, *cursiva*, ## títulos, - listas</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>URL Video (YouTube/Loom)</Label>
              <Input value={form.video_url || ""} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>URL PDF</Label>
              <Input value={form.pdf_url || ""} onChange={e => setForm(f => ({ ...f, pdf_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label>Galería (URLs separadas por línea)</Label>
            <Textarea
              value={(form.gallery_urls || []).join("\n")}
              onChange={e => setForm(f => ({ ...f, gallery_urls: e.target.value.split("\n").filter(Boolean) }))}
              rows={3}
              placeholder="https://imagen1.jpg&#10;https://imagen2.jpg"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Precio COP</Label>
              <Input type="number" value={form.price_cop ?? ""} onChange={e => setForm(f => ({ ...f, price_cop: e.target.value === "" ? 0 : Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Precio original COP</Label>
              <Input type="number" value={form.original_price_cop || ""} onChange={e => setForm(f => ({ ...f, original_price_cop: e.target.value ? +e.target.value : null }))} />
            </div>
            <div>
              <Label>Código cupón</Label>
              <Input value={form.coupon_code || ""} onChange={e => setForm(f => ({ ...f, coupon_code: e.target.value }))} placeholder="DESCUENTO10" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Badge</Label>
              <Input value={form.badge || ""} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Más Vendido" />
            </div>
            <div>
              <Label>Mensaje WhatsApp CTA</Label>
              <Input value={form.cta_whatsapp_message || ""} onChange={e => setForm(f => ({ ...f, cta_whatsapp_message: e.target.value }))} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Meta título SEO</Label>
              <Input value={form.meta_title || ""} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} />
            </div>
            <div>
              <Label>Meta descripción SEO</Label>
              <Input value={form.meta_description || ""} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.is_active ?? true} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              Activa
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.is_featured ?? false} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
              Destacada
            </label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : editing ? "Actualizar" : "Crear Landing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Items Manager ─── */
function ItemsManager({ pageId, items, products, licenses, packs, onAdd, onRemove }: {
  pageId: string;
  items: SalesPageItem[];
  products: any[];
  licenses: any[];
  packs: any[];
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
}) {
  const [itemType, setItemType] = useState("product");
  const [selectedId, setSelectedId] = useState("");

  const getOptions = () => {
    switch (itemType) {
      case "product": return products.map(p => ({ id: p.id, label: `${p.name} (${p.product_type})` }));
      case "license": return licenses.map(l => ({ id: l.id, label: l.plan_label }));
      case "pack": return packs.map(p => ({ id: p.id, label: p.name }));
      default: return [];
    }
  };

  const handleAdd = () => {
    if (!selectedId) return;
    const payload: any = {
      sales_page_id: pageId,
      item_type: itemType,
      sort_order: items.length,
    };
    if (itemType === "product") payload.product_id = selectedId;
    if (itemType === "license") payload.license_pricing_id = selectedId;
    if (itemType === "pack") payload.pack_id = selectedId;
    onAdd(payload);
    setSelectedId("");
  };

  const getItemLabel = (item: SalesPageItem) => {
    if (item.product_id) {
      const p = products.find(x => x.id === item.product_id);
      return p ? `${p.name} (${p.product_type})` : "Producto eliminado";
    }
    if (item.license_pricing_id) {
      const l = licenses.find(x => x.id === item.license_pricing_id);
      return l ? `Licencia: ${l.plan_label}` : "Licencia eliminada";
    }
    if (item.pack_id) {
      const p = packs.find(x => x.id === item.pack_id);
      return p ? `Pack: ${p.name}` : "Pack eliminado";
    }
    return item.custom_label || "Sin nombre";
  };

  return (
    <div className="space-y-4">
      {/* Add Item */}
      <div className="flex gap-2">
        <Select value={itemType} onValueChange={setItemType}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Producto</SelectItem>
            <SelectItem value="license">Licencia</SelectItem>
            <SelectItem value="pack">Pack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {getOptions().map(o => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={!selectedId} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No hay productos asociados.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">{item.item_type}</Badge>
                <span className="text-sm">{getItemLabel(item)}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => onRemove(item.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

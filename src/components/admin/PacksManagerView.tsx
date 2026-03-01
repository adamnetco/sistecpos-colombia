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
  Plus, Pencil, Trash2, Package, Star, ExternalLink, Copy,
  GripVertical, Eye, EyeOff, Info,
} from "lucide-react";

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  badge: string | null;
  license_pricing_id: string | null;
  included_module_ids: string[];
  implementation_included: boolean;
  support_months_included: number;
  price_cop: number;
  original_price_cop: number | null;
  savings_cop: number | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  features: string[];
  target_business_types: string[];
  cta_whatsapp_message: string | null;
  image_url: string | null;
}

interface LicensePricing {
  id: string;
  plan_key: string;
  plan_label: string;
  selling_price_cop: number;
}

export default function PacksManagerView() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ["admin_commercial_packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_packs")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Pack[];
    },
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["license_pricing_for_packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("license_pricing")
        .select("id, plan_key, plan_label, selling_price_cop")
        .order("sort_order");
      if (error) throw error;
      return data as LicensePricing[];
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("commercial_packs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_commercial_packs"] }); toast.success("Pack eliminado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("commercial_packs").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_commercial_packs"] }); },
  });

  const togglePopular = useMutation({
    mutationFn: async ({ id, is_popular }: { id: string; is_popular: boolean }) => {
      const { error } = await supabase.from("commercial_packs").update({ is_popular }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_commercial_packs"] }); },
  });

  const getLicenseLabel = (id: string | null) => {
    if (!id) return "—";
    const l = licenses.find(l => l.id === id);
    return l ? l.plan_label : "—";
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/packs`);
    toast.success("URL de /packs copiada");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Packs Comerciales
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los packs "Todo Incluido" que aparecen en{" "}
            <button onClick={copyUrl} className="text-primary underline underline-offset-2 hover:no-underline">/packs</button>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href="/packs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Ver /packs
            </a>
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Pack
          </Button>
        </div>
      </div>

      {/* Help Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">¿Cómo funcionan los Packs?</p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
              <li>Crea un pack con <strong>nombre, precio y licencia asociada</strong></li>
              <li>Agrega las <strong>características</strong> (features) que se muestran como check marks</li>
              <li>Define <strong>precio original</strong> para mostrar el descuento automáticamente</li>
              <li>Marca uno como <strong>"Popular"</strong> para destacarlo visualmente</li>
              <li>Actívalo y aparecerá en <strong>/packs</strong> ordenado por "Orden"</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : packs.length === 0 ? (
        <Card className="border-0 shadow-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="mb-2">No hay packs creados todavía.</p>
            <p className="text-xs">Haz clic en "Nuevo Pack" para crear el primero.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packs.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-muted-foreground text-xs">{p.sort_order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.tagline || p.slug}</p>
                        {p.badge && <Badge variant="secondary" className="text-xs mt-1">{p.badge}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getLicenseLabel(p.license_pricing_id)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatCOP(p.price_cop)}</div>
                      {p.original_price_cop && p.original_price_cop > p.price_cop && (
                        <div className="text-xs text-muted-foreground line-through">{formatCOP(p.original_price_cop)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => togglePopular.mutate({ id: p.id, is_popular: !p.is_popular })}
                        className={p.is_popular ? "text-yellow-500" : "text-muted-foreground"}
                      >
                        <Star className="h-4 w-4" fill={p.is_popular ? "currentColor" : "none"} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={v => toggleActive.mutate({ id: p.id, is_active: v })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("¿Eliminar este pack?")) deleteMut.mutate(p.id); }}>
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
      <PackFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        licenses={licenses}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["admin_commercial_packs"] }); setDialogOpen(false); setEditing(null); }}
      />
    </div>
  );
}

/* ─── Form Dialog ─── */
function PackFormDialog({ open, onOpenChange, editing, licenses, onSaved }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Pack | null;
  licenses: LicensePricing[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const reset = () => {
    if (editing) {
      setForm({
        ...editing,
        features_text: (editing.features || []).join("\n"),
        target_text: (editing.target_business_types || []).join("\n"),
      });
    } else {
      setForm({
        name: "", slug: "", description: "", tagline: "", badge: "",
        license_pricing_id: "", implementation_included: true,
        support_months_included: 3, price_cop: 0, original_price_cop: "",
        savings_cop: "", is_popular: false, is_active: true, sort_order: 0,
        features_text: "", target_text: "", cta_whatsapp_message: "",
        image_url: "",
      });
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) reset();
    onOpenChange(v);
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Nombre y slug son obligatorios"); return; }
    if (!form.price_cop || form.price_cop <= 0) { toast.error("El precio debe ser mayor a 0"); return; }
    setSaving(true);
    try {
      const features = (form.features_text || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
      const targets = (form.target_text || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
      const origPrice = form.original_price_cop ? Number(form.original_price_cop) : null;
      const savings = origPrice && origPrice > form.price_cop ? origPrice - form.price_cop : null;

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        tagline: form.tagline || null,
        badge: form.badge || null,
        license_pricing_id: form.license_pricing_id || null,
        implementation_included: form.implementation_included ?? true,
        support_months_included: Number(form.support_months_included) || 0,
        price_cop: Number(form.price_cop),
        original_price_cop: origPrice,
        savings_cop: savings,
        is_popular: form.is_popular ?? false,
        is_active: form.is_active ?? true,
        sort_order: Number(form.sort_order) || 0,
        features,
        target_business_types: targets,
        cta_whatsapp_message: form.cta_whatsapp_message || "",
        image_url: form.image_url || null,
      };

      if (editing) {
        const { error } = await supabase.from("commercial_packs").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("commercial_packs").insert(payload);
        if (error) throw error;
      }
      toast.success(editing ? "Pack actualizado" : "Pack creado");
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
          <DialogTitle>{editing ? "Editar" : "Nuevo"} Pack Comercial</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {/* Name & Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.name || ""}
                onChange={e => {
                  const name = e.target.value;
                  setForm(f => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
                }}
                placeholder="Pack Tienda Pro"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug || ""} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>

          {/* Tagline & Badge */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Tagline</Label>
              <Input value={form.tagline || ""} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Ideal para tiendas pequeñas" />
            </div>
            <div>
              <Label>Badge (etiqueta superior)</Label>
              <Input value={form.badge || ""} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Más Vendido" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Descripción corta del pack" />
          </div>

          {/* License association */}
          <div>
            <Label>Licencia asociada</Label>
            <Select value={form.license_pricing_id || ""} onValueChange={v => setForm(f => ({ ...f, license_pricing_id: v || null }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una licencia" />
              </SelectTrigger>
              <SelectContent>
                {licenses.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.plan_label} — {formatCOP(l.selling_price_cop)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Se mostrará el nombre del plan en la tarjeta del pack</p>
          </div>

          {/* Prices */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Precio Pack COP *</Label>
              <Input type="number" value={form.price_cop ?? ""} onChange={e => setForm(f => ({ ...f, price_cop: Number(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Precio original COP</Label>
              <Input type="number" value={form.original_price_cop ?? ""} onChange={e => setForm(f => ({ ...f, original_price_cop: e.target.value }))} placeholder="Para mostrar descuento" />
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Included services */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={form.implementation_included ?? true} onCheckedChange={v => setForm(f => ({ ...f, implementation_included: v }))} />
              <Label>Implementación presencial incluida</Label>
            </div>
            <div>
              <Label>Meses de soporte incluidos</Label>
              <Input type="number" value={form.support_months_included ?? 3} onChange={e => setForm(f => ({ ...f, support_months_included: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>Características (una por línea)</Label>
            <Textarea
              value={form.features_text || ""}
              onChange={e => setForm(f => ({ ...f, features_text: e.target.value }))}
              rows={5}
              placeholder={"Módulo Facturación Electrónica\nMódulo Inventario\nCapacitación a tu equipo\nSoporte WhatsApp prioritario"}
            />
            <p className="text-xs text-muted-foreground mt-1">Cada línea aparece como un ✅ check en la tarjeta del pack</p>
          </div>

          {/* Target businesses */}
          <div>
            <Label>Tipos de negocio objetivo (uno por línea)</Label>
            <Textarea
              value={form.target_text || ""}
              onChange={e => setForm(f => ({ ...f, target_text: e.target.value }))}
              rows={2}
              placeholder={"tienda\nminimarket\npapelería"}
            />
          </div>

          {/* CTA & Image */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Mensaje WhatsApp CTA</Label>
              <Input value={form.cta_whatsapp_message || ""} onChange={e => setForm(f => ({ ...f, cta_whatsapp_message: e.target.value }))} placeholder="Hola, quiero el pack..." />
            </div>
            <div>
              <Label>URL Imagen</Label>
              <Input value={form.image_url || ""} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active ?? true} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_popular ?? false} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} />
              <Label>Marcar como Popular ⭐</Label>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : editing ? "Actualizar Pack" : "Crear Pack"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

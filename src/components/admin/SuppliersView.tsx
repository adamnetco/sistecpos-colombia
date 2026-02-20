import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Pencil, Trash2, Search, Globe, Mail, Phone, MapPin, Download, MessageCircle, ExternalLink, AlertCircle } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { Skeleton } from "@/components/ui/skeleton";

interface Supplier {
  id: string;
  name: string;
  supplier_type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  website: string | null;
  whatsapp_support: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  software: { label: "Software", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  hardware: { label: "Hardware", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
  certificados: { label: "Certificados", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  otro: { label: "Otro", color: "bg-muted text-muted-foreground" },
};

function WhatsAppLink({ number, label }: { number: string; label?: string }) {
  const clean = number.replace(/\D/g, "");
  const url = `https://wa.me/${clean}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle className="h-3 w-3" />
      {label || number}
      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
    </a>
  );
}

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let query = supabase.from("suppliers").select("*").order("name");
    if (filterType !== "all") query = query.eq("supplier_type", filterType);
    const { data } = await query;
    setSuppliers((data as Supplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType]);

  const deleteSupplier = async (id: string) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Proveedor eliminado" });
  };

  const filtered = suppliers.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.contact_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const softwareCount = suppliers.filter((s) => s.supplier_type === "software").length;
  const hardwareCount = suppliers.filter((s) => s.supplier_type === "hardware").length;
  const withWA = suppliers.filter((s) => s.whatsapp_support).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-display">Proveedores</h1>
            <p className="text-sm text-muted-foreground">Software, hardware y certificados digitales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() =>
            exportToCsv(filtered as any[], [
              { key: "name", label: "Nombre" },
              { key: "supplier_type", label: "Tipo" },
              { key: "contact_name", label: "Contacto" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Teléfono" },
              { key: "whatsapp_support", label: "WhatsApp Soporte" },
              { key: "city", label: "Ciudad" },
              { key: "website", label: "Web" },
              { key: "status", label: "Estado" },
            ], "proveedores")
          }>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <Dialog open={showForm} onOpenChange={(o) => { if (!o) setEditing(null); setShowForm(o); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Proveedor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
              </DialogHeader>
              <SupplierForm
                supplier={editing}
                onSuccess={() => { setShowForm(false); setEditing(null); load(); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Software", value: softwareCount, color: "text-blue-700" },
          { label: "Hardware", value: hardwareCount, color: "text-orange-700" },
          { label: "Con WA Soporte", value: withWA, color: "text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="certificados">Certificados</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, contacto o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-xs"
          />
        </div>
        <Badge variant="outline" className="text-xs">{filtered.length} proveedores</Badge>
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No hay proveedores registrados</p>
          </div>
        ) : (
          filtered.map((s) => {
            const tl = typeLabels[s.supplier_type] || typeLabels.otro;
            return (
              <div key={s.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow group flex flex-col gap-2">
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                    <Badge className={`text-[10px] mt-1 border ${tl.color}`}>{tl.label}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(s); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteSupplier(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {s.contact_name && <p className="font-medium text-foreground">{s.contact_name}</p>}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary truncate">
                      <Mail className="h-3 w-3 shrink-0" />{s.email}
                    </a>
                  )}
                  {s.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{s.phone}</p>}
                  {s.city && <p className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{s.city}</p>}
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary truncate" onClick={(e) => e.stopPropagation()}>
                      <Globe className="h-3 w-3 shrink-0" />{s.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                {/* WhatsApp soporte 2do nivel — destacado */}
                {s.whatsapp_support && (
                  <>
                    <Separator />
                    <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2">
                      <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> Soporte 2do Nivel
                      </p>
                      <WhatsAppLink number={s.whatsapp_support} />
                    </div>
                  </>
                )}

                {/* Alerta si es software y no tiene WA soporte */}
                {s.supplier_type === "software" && !s.whatsapp_support && (
                  <p className="flex items-center gap-1 text-[10px] text-amber-600">
                    <AlertCircle className="h-3 w-3" /> Sin WhatsApp de soporte configurado
                  </p>
                )}

                {s.notes && <p className="text-xs text-muted-foreground italic line-clamp-2">{s.notes}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SupplierForm({ supplier, onSuccess }: { supplier: Supplier | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || "",
    supplier_type: supplier?.supplier_type || "software",
    contact_name: supplier?.contact_name || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    city: supplier?.city || "",
    website: supplier?.website || "",
    whatsapp_support: supplier?.whatsapp_support || "",
    status: supplier?.status || "active",
    notes: supplier?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      supplier_type: form.supplier_type,
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      city: form.city || null,
      website: form.website || null,
      whatsapp_support: form.whatsapp_support || null,
      status: form.status,
      notes: form.notes || null,
    };
    const { error } = supplier
      ? await supabase.from("suppliers").update(payload).eq("id", supplier.id)
      : await supabase.from("suppliers").insert(payload);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: supplier ? "Proveedor actualizado ✅" : "Proveedor creado ✅" }); onSuccess(); }
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handle} className="space-y-4">
      {/* Info general */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Información General</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nombre *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="h-9" placeholder="Ej: FacilPOS" />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={form.supplier_type} onValueChange={(v) => set("supplier_type", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="certificados">Certificados</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contacto */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Datos de Contacto</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nombre del Contacto</Label>
            <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className="h-9" placeholder="Ej: Francisco Espinel" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9" placeholder="licencias@proveedor.com" />
          </div>
          <div>
            <Label className="text-xs">Teléfono</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9" placeholder="+57 300 000 0000" />
          </div>
          <div>
            <Label className="text-xs">Ciudad</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-9" placeholder="Bogotá" />
          </div>
          <div>
            <Label className="text-xs">Sitio Web</Label>
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} className="h-9" placeholder="https://proveedor.co" />
          </div>
        </div>
      </div>

      <Separator />

      {/* WhatsApp soporte 2do nivel */}
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <p className="text-xs font-semibold text-green-700">WhatsApp Soporte 2do Nivel</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Número al que se enviará la alerta automática cuando un ticket sea escalado a este proveedor.
          Formato internacional sin espacios ni símbolos: <strong>573001234567</strong>
        </p>
        <Input
          value={form.whatsapp_support}
          onChange={(e) => set("whatsapp_support", e.target.value)}
          className="h-9 bg-white"
          placeholder="573001234567"
          type="tel"
        />
        {form.whatsapp_support && (
          <a
            href={`https://wa.me/${form.whatsapp_support.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Verificar número en WhatsApp
          </a>
        )}
      </div>

      <Separator />

      {/* Notas */}
      <div>
        <Label className="text-xs">Notas internas</Label>
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Condiciones especiales, acuerdos, observaciones..." />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando..." : supplier ? "Actualizar Proveedor" : "Crear Proveedor"}
      </Button>
    </form>
  );
}

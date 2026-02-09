import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Pencil, Trash2, Search, Globe, Mail, Phone, MapPin, Download } from "lucide-react";
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
  status: string;
  notes: string | null;
  created_at: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  software: { label: "Software", color: "bg-blue-500/10 text-blue-700" },
  hardware: { label: "Hardware", color: "bg-cta/10 text-cta" },
  certificados: { label: "Certificados", color: "bg-purple-500/10 text-purple-700" },
  otro: { label: "Otro", color: "bg-muted text-muted-foreground" },
};

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
    return s.name.toLowerCase().includes(q) || s.contact_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold font-display">Proveedores</h1>
            <p className="text-sm text-muted-foreground">Software, hardware y certificados digitales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => exportToCsv(filtered as any[], [
            { key: "name", label: "Nombre" },
            { key: "supplier_type", label: "Tipo" },
            { key: "contact_name", label: "Contacto" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Teléfono" },
            { key: "city", label: "Ciudad" },
            { key: "website", label: "Web" },
            { key: "status", label: "Estado" },
          ], "proveedores")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Exportar
          </Button>
          <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setEditing(null); } setShowForm(o); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Proveedor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle></DialogHeader>
              <SupplierForm supplier={editing} onSuccess={() => { setShowForm(false); setEditing(null); load(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 text-xs" />
        </div>
        <Badge variant="outline" className="text-xs">{filtered.length} proveedores</Badge>
      </div>

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
              <div key={s.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{s.name}</h3>
                    <Badge className={`text-[10px] mt-1 ${tl.color}`}>{tl.label}</Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(s); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteSupplier(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {s.contact_name && <p className="font-medium text-foreground">{s.contact_name}</p>}
                  {s.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>}
                  {s.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</p>}
                  {s.city && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</p>}
                  {s.website && <p className="flex items-center gap-1"><Globe className="h-3 w-3" />{s.website}</p>}
                </div>
                {s.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">{s.notes}</p>}
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
      status: form.status,
      notes: form.notes || null,
    };
    const { error } = supplier
      ? await supabase.from("suppliers").update(payload).eq("id", supplier.id)
      : await supabase.from("suppliers").insert(payload);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: supplier ? "Actualizado" : "Proveedor creado" }); onSuccess(); }
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Label className="text-xs">Nombre *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="h-9" /></div>
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
        <div><Label className="text-xs">Contacto</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Sitio Web</Label><Input value={form.website} onChange={(e) => set("website", e.target.value)} className="h-9" /></div>
      </div>
      <div><Label className="text-xs">Notas</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} /></div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : supplier ? "Actualizar" : "Crear Proveedor"}</Button>
    </form>
  );
}

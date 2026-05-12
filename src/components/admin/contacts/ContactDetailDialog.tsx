import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Phone, Building2, MapPin, User, Save, Loader2, Plus, Trash2,
  Network, Activity, KeyRound, Search, Link2, Pencil,
} from "lucide-react";
import ContactDetailPanel from "./ContactDetailPanel";

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  business_name: string | null;
  business_type: string | null;
  contact_type: string;
  source: string;
  is_read: boolean;
  captured_by_ai: boolean;
  notes: string | null;
  tags: string[] | null;
  lead_score: number;
  pipeline_stage: string;
  lead_id: string | null;
  license_id: string | null;
  business_id?: string | null;
  branch_id?: string | null;
  role_in_business?: string | null;
  address?: string | null;
  document_id?: string | null;
  created_at: string;
}

interface BusinessRow {
  id: string;
  business_name: string;
  legal_name: string | null;
  nit: string | null;
  industry: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
}

interface Branch {
  id: string;
  branch_name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

interface ContactRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_in_business: string | null;
  branch_id: string | null;
}

const PIPELINE_STAGES = ["new", "contacted", "qualified", "demo", "proposal", "won", "lost"];
const CONTACT_TYPES = [
  { value: "prospect", label: "🔵 Prospecto" },
  { value: "active_client", label: "🟢 Cliente" },
  { value: "former_client", label: "⚪ Ex-cliente" },
  { value: "partner", label: "🟣 Socio" },
];

export function ContactDetailDialog({
  contact: initialContact,
  open,
  onOpenChange,
  onUpdated,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(initialContact);
  const [tab, setTab] = useState("resumen");

  useEffect(() => { setContact(initialContact); }, [initialContact?.id]);

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {contact.full_name}
            <Badge variant="outline" className="ml-2 text-[10px]">{contact.contact_type}</Badge>
          </SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full h-auto">
            <TabsTrigger value="resumen" className="text-xs"><User className="h-3 w-3 mr-1" />Datos</TabsTrigger>
            <TabsTrigger value="negocio" className="text-xs"><Building2 className="h-3 w-3 mr-1" />Negocio</TabsTrigger>
            <TabsTrigger value="sucursales" className="text-xs"><MapPin className="h-3 w-3 mr-1" />Sedes</TabsTrigger>
            <TabsTrigger value="relaciones" className="text-xs"><Network className="h-3 w-3 mr-1" />Relaciones</TabsTrigger>
            <TabsTrigger value="actividad" className="text-xs"><Activity className="h-3 w-3 mr-1" />Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <ContactEditForm contact={contact} onSaved={(c) => { setContact(c); onUpdated(); }} />
          </TabsContent>

          <TabsContent value="negocio" className="mt-4">
            <BusinessEditPanel contact={contact} onLinked={(bizId) => {
              setContact({ ...contact, business_id: bizId });
              onUpdated();
            }} />
          </TabsContent>

          <TabsContent value="sucursales" className="mt-4">
            {contact.business_id ? (
              <BranchesPanel businessId={contact.business_id} />
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Vincula este contacto a un negocio en la pestaña <strong>Negocio</strong> para gestionar sucursales.</p>
            )}
          </TabsContent>

          <TabsContent value="relaciones" className="mt-4">
            <RelationsPanel email={contact.email} phone={contact.phone} businessId={contact.business_id} currentContactId={contact.id} />
          </TabsContent>

          <TabsContent value="actividad" className="mt-4">
            <ContactDetailPanel contact={contact as any} onUpdate={onUpdated} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Sub-panels ---------------- */

function ContactEditForm({ contact, onSaved }: { contact: Contact; onSaved: (c: Contact) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState(contact);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(contact); }, [contact.id]);

  const set = (k: keyof Contact, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("contacts").update({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      address: form.address,
      document_id: form.document_id,
      business_name: form.business_name,
      business_type: form.business_type,
      contact_type: form.contact_type,
      pipeline_stage: form.pipeline_stage,
      role_in_business: form.role_in_business,
      notes: form.notes,
    }).eq("id", contact.id).select().single();
    setSaving(false);
    if (error) toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Contacto actualizado" });
      onSaved(data as Contact);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Nombre completo *</Label>
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Documento</Label>
          <Input value={form.document_id || ""} onChange={(e) => set("document_id", e.target.value)} className="h-9" placeholder="Cédula / NIT personal" /></div>
        <div><Label className="text-xs">Email</Label>
          <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Teléfono</Label>
          <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Ciudad</Label>
          <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Dirección personal</Label>
          <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Rol en el negocio</Label>
          <Input value={form.role_in_business || ""} onChange={(e) => set("role_in_business", e.target.value)} className="h-9" placeholder="Dueño, admin, contador..." /></div>
        <div><Label className="text-xs">Tipo de contacto</Label>
          <Select value={form.contact_type} onValueChange={(v) => set("contact_type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{CONTACT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select></div>
        <div><Label className="text-xs">Etapa pipeline</Label>
          <Select value={form.pipeline_stage} onValueChange={(v) => set("pipeline_stage", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select></div>
        <div className="col-span-2"><Label className="text-xs">Negocio (texto libre)</Label>
          <Input value={form.business_name || ""} onChange={(e) => set("business_name", e.target.value)} className="h-9" /></div>
        <div className="col-span-2"><Label className="text-xs">Notas</Label>
          <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={3} /></div>
      </div>
      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Guardar cambios
      </Button>
    </div>
  );
}

function BusinessEditPanel({ contact, onLinked }: { contact: Contact; onLinked: (bizId: string) => void }) {
  const { toast } = useToast();
  const [biz, setBiz] = useState<BusinessRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessRow[]>([]);
  const [related, setRelated] = useState<ContactRow[]>([]);

  const load = async () => {
    setLoading(true);
    if (contact.business_id) {
      const { data } = await supabase.from("businesses").select("*").eq("id", contact.business_id).maybeSingle();
      setBiz(data as BusinessRow | null);
      const { data: rel } = await supabase.from("contacts")
        .select("id, full_name, email, phone, role_in_business, branch_id")
        .eq("business_id", contact.business_id).neq("id", contact.id);
      setRelated((rel || []) as ContactRow[]);
    } else { setBiz(null); setRelated([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [contact.business_id, contact.id]);

  const set = (k: keyof BusinessRow, v: any) => setBiz((p) => p ? { ...p, [k]: v } : p);

  const saveBiz = async () => {
    if (!biz) return;
    setSaving(true);
    const { error } = await supabase.from("businesses").update({
      business_name: biz.business_name, legal_name: biz.legal_name, nit: biz.nit,
      industry: biz.industry, website: biz.website, email: biz.email, phone: biz.phone,
      city: biz.city, address: biz.address, notes: biz.notes,
    }).eq("id", biz.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Negocio actualizado" });
  };

  const createAndLink = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("businesses").insert({
      business_name: contact.business_name || `${contact.full_name} — Negocio`,
      email: contact.email, phone: contact.phone, city: contact.city,
      primary_contact_id: contact.id,
    }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    await supabase.from("contacts").update({ business_id: data.id }).eq("id", contact.id);
    setSaving(false);
    toast({ title: "Negocio creado y vinculado" });
    onLinked(data.id);
  };

  const searchBiz = async () => {
    if (!searchTerm.trim()) return;
    const { data } = await supabase.from("businesses").select("*")
      .or(`business_name.ilike.%${searchTerm}%,nit.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`).limit(10);
    setSearchResults((data || []) as BusinessRow[]);
  };

  const linkExisting = async (bizId: string) => {
    await supabase.from("contacts").update({ business_id: bizId }).eq("id", contact.id);
    toast({ title: "Contacto vinculado al negocio" });
    onLinked(bizId);
  };

  if (loading) return <Loader2 className="h-5 w-5 animate-spin mx-auto my-6" />;

  if (!biz) {
    return (
      <div className="space-y-3">
        <Card className="p-3 space-y-2">
          <p className="text-sm font-medium">Vincular a un negocio</p>
          <div className="flex gap-2">
            <Input placeholder="Buscar por nombre, NIT o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchBiz()} className="h-9" />
            <Button size="sm" variant="outline" onClick={searchBiz}><Search className="h-4 w-4" /></Button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {searchResults.map((b) => (
                <button key={b.id} onClick={() => linkExisting(b.id)} className="w-full text-left p-2 rounded hover:bg-muted text-xs">
                  <strong>{b.business_name}</strong>{b.nit && <span className="text-muted-foreground"> · NIT {b.nit}</span>}
                </button>
              ))}
            </div>
          )}
        </Card>
        <Button onClick={createAndLink} disabled={saving} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Crear nuevo negocio con estos datos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Nombre comercial *</Label>
          <Input value={biz.business_name} onChange={(e) => set("business_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Razón social</Label>
          <Input value={biz.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">NIT</Label>
          <Input value={biz.nit || ""} onChange={(e) => set("nit", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Industria</Label>
          <Input value={biz.industry || ""} onChange={(e) => set("industry", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Email corporativo</Label>
          <Input type="email" value={biz.email || ""} onChange={(e) => set("email", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Teléfono corporativo</Label>
          <Input value={biz.phone || ""} onChange={(e) => set("phone", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Sitio web</Label>
          <Input value={biz.website || ""} onChange={(e) => set("website", e.target.value)} className="h-9" placeholder="https://..." /></div>
        <div><Label className="text-xs">Ciudad principal</Label>
          <Input value={biz.city || ""} onChange={(e) => set("city", e.target.value)} className="h-9" /></div>
        <div className="col-span-2"><Label className="text-xs">Dirección</Label>
          <Input value={biz.address || ""} onChange={(e) => set("address", e.target.value)} className="h-9" /></div>
        <div className="col-span-2"><Label className="text-xs">Notas del negocio</Label>
          <Textarea value={biz.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} /></div>
      </div>
      <Button onClick={saveBiz} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Guardar negocio
      </Button>

      {related.length > 0 && (
        <div className="mt-4">
          <Label className="text-xs uppercase text-muted-foreground">Otros contactos del negocio ({related.length})</Label>
          <div className="space-y-1 mt-1">
            {related.map((r) => (
              <Card key={r.id} className="p-2 text-xs flex items-center justify-between">
                <span><strong>{r.full_name}</strong>{r.role_in_business && <span className="text-muted-foreground"> · {r.role_in_business}</span>}</span>
                <span className="text-muted-foreground">{r.email || r.phone}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BranchesPanel({ businessId }: { businessId: string }) {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newBranch, setNewBranch] = useState({ branch_name: "", city: "", address: "", phone: "", email: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("business_branches").select("*").eq("business_id", businessId).order("sort_order");
    setBranches((data || []) as Branch[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [businessId]);

  const add = async () => {
    if (!newBranch.branch_name.trim()) return;
    const { error } = await supabase.from("business_branches").insert({ business_id: businessId, ...newBranch, is_primary: branches.length === 0 });
    if (error) toast({ title: "Error", variant: "destructive" });
    else { setNewBranch({ branch_name: "", city: "", address: "", phone: "", email: "" }); setAdding(false); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar sucursal?")) return;
    await supabase.from("business_branches").delete().eq("id", id);
    load();
  };

  if (loading) return <Loader2 className="h-5 w-5 animate-spin mx-auto my-6" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Sucursales ({branches.length})</Label>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          {adding ? "Cancelar" : <><Plus className="h-3 w-3 mr-1" />Añadir</>}
        </Button>
      </div>

      {adding && (
        <Card className="p-3 space-y-2 border-primary/30">
          <Input placeholder="Nombre sede *" value={newBranch.branch_name} onChange={(e) => setNewBranch((p) => ({ ...p, branch_name: e.target.value }))} className="h-9" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Ciudad" value={newBranch.city} onChange={(e) => setNewBranch((p) => ({ ...p, city: e.target.value }))} className="h-9" />
            <Input placeholder="Teléfono" value={newBranch.phone} onChange={(e) => setNewBranch((p) => ({ ...p, phone: e.target.value }))} className="h-9" />
          </div>
          <Input placeholder="Dirección" value={newBranch.address} onChange={(e) => setNewBranch((p) => ({ ...p, address: e.target.value }))} className="h-9" />
          <Input placeholder="Email sede" value={newBranch.email} onChange={(e) => setNewBranch((p) => ({ ...p, email: e.target.value }))} className="h-9" />
          <Button size="sm" onClick={add} className="w-full">Guardar sucursal</Button>
        </Card>
      )}

      {branches.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Aún no hay sucursales. Añade la sede principal.</p>
      ) : branches.map((b) => (
        <Card key={b.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm">{b.branch_name}</strong>
                {b.is_primary && <Badge variant="default" className="text-[9px]">Principal</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                {b.city && <span>📍 {b.city}</span>}
                {b.phone && <span>📞 {b.phone}</span>}
                {b.email && <span>✉ {b.email}</span>}
              </div>
              {b.address && <div className="text-xs text-muted-foreground mt-0.5">{b.address}</div>}
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(b.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RelationsPanel({ email, phone, businessId, currentContactId }: { email: string | null; phone: string | null; businessId?: string | null; currentContactId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState(email || "");
  const [searchPhone, setSearchPhone] = useState(phone || "");

  const load = async () => {
    setLoading(true);
    const { data: result } = await supabase.rpc("find_related_by_contact", {
      _email: searchEmail || null, _phone: searchPhone || null,
    });
    setData(result);
    setLoading(false);
  };

  useEffect(() => { if (searchEmail || searchPhone) load(); else setLoading(false); }, []);

  return (
    <div className="space-y-3">
      <Card className="p-3 space-y-2">
        <Label className="text-xs">Buscar registros relacionados por email o teléfono</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="h-9" />
          <Input placeholder="teléfono" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="h-9" />
        </div>
        <Button size="sm" onClick={load}><Search className="h-3 w-3 mr-1" /> Buscar coincidencias</Button>
      </Card>

      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : data && (
        <div className="space-y-3">
          <RelGroup title="Negocios" items={data.businesses} render={(b: any) => (
            <span><strong>{b.business_name}</strong>{b.nit && ` · NIT ${b.nit}`}{b.city && ` · ${b.city}`}</span>
          )} />
          <RelGroup title="Contactos" items={(data.contacts || []).filter((c: any) => c.id !== currentContactId)} render={(c: any) => (
            <span><strong>{c.full_name}</strong>{c.business_name && ` · ${c.business_name}`} <Badge variant="outline" className="text-[9px] ml-1">{c.contact_type}</Badge></span>
          )} />
          <RelGroup title="Demos / Leads" items={data.leads} render={(l: any) => (
            <span><strong>{l.business_name}</strong> · {l.contact_name} <Badge variant="outline" className="text-[9px] ml-1">{l.status}</Badge></span>
          )} />
          <RelGroup title="Licencias" items={data.licenses} render={(l: any) => (
            <span className="flex items-center gap-1"><KeyRound className="h-3 w-3" /><strong>{l.business_name}</strong> · <code className="text-[10px]">{l.license_key?.slice(0, 8)}...</code> <Badge variant="outline" className="text-[9px]">{l.status}</Badge></span>
          )} />
        </div>
      )}
    </div>
  );
}

function RelGroup({ title, items, render }: { title: string; items: any[]; render: (it: any) => React.ReactNode }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <Label className="text-xs uppercase text-muted-foreground">{title} ({items.length})</Label>
      <div className="space-y-1 mt-1">
        {items.map((it, i) => <Card key={i} className="p-2 text-xs">{render(it)}</Card>)}
      </div>
    </div>
  );
}

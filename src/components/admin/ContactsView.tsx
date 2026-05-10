import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Bot, Eye, EyeOff, Search, Plus, Mail, Phone,
  Building2, MapPin, Filter, RefreshCw, Download, KeyRound, Link2, UserCog,
  Table as TableIcon, Kanban,
} from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ContactDetailPanel from "./ContactDetailPanel";
import ContactPipelineView from "./ContactPipelineView";

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
  tags: string[];
  lead_id: string | null;
  license_id: string | null;
  reseller_id: string | null;
  pipeline_stage: string;
  lead_score: number;
  created_at: string;
  // Enriched fields
  ai_conversation_count?: number;
  linked_business?: string | null;
  linked_license_plan?: string | null;
  linked_license_status?: string | null;
  pos_user_count?: number;
  user_role?: string | null;
}

const sourceLabels: Record<string, { label: string; color: string }> = {
  website: { label: "Web", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  whatsapp: { label: "WhatsApp", color: "bg-whatsapp/10 text-whatsapp border-whatsapp/20" },
  chatbot_ai: { label: "IA", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  cotizacion_web: { label: "Cotización", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  referral: { label: "Referido", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
  social_media: { label: "Redes", color: "bg-pink-500/10 text-pink-700 border-pink-200" },
  landing: { label: "Landing", color: "bg-cta/10 text-cta border-cta/20" },
  manual: { label: "Manual", color: "bg-muted text-muted-foreground border-border" },
};

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  prospect: { label: "Prospecto", color: "bg-blue-500/10 text-blue-700", icon: "🔵" },
  active_client: { label: "Cliente", color: "bg-green-500/10 text-green-700", icon: "🟢" },
  former_client: { label: "Ex-Cliente", color: "bg-muted text-muted-foreground", icon: "⚪" },
  partner: { label: "Socio", color: "bg-purple-500/10 text-purple-700", icon: "🟣" },
};

const roleFilters = [
  { value: "all", label: "Todos", count: 0 },
  { value: "prospect", label: "Prospectos", count: 0 },
  { value: "active_client", label: "Clientes", count: 0 },
  { value: "partner", label: "Socios", count: 0 },
  { value: "former_client", label: "Ex-Clientes", count: 0 },
  { value: "with_license", label: "Con Licencia", count: 0 },
  { value: "with_demo", label: "Con Demo", count: 0 },
  { value: "ai_captured", label: "Captura IA", count: 0 },
];

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [view, setView] = useState<"table" | "pipeline">(
    () => (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "pipeline" ? "pipeline" : "table")
  );
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error cargando contactos", variant: "destructive" });
      setLoading(false);
      return;
    }

    const contactsData = (data as Contact[]) || [];

    // Enrich: AI conversation counts
    if (contactsData.length > 0) {
      const contactIds = contactsData.map(c => c.id);
      const { data: convCounts } = await supabase
        .from("ai_conversations")
        .select("contact_id")
        .in("contact_id", contactIds);
      if (convCounts) {
        const countMap: Record<string, number> = {};
        convCounts.forEach(c => {
          if (c.contact_id) countMap[c.contact_id] = (countMap[c.contact_id] || 0) + 1;
        });
        contactsData.forEach(c => { c.ai_conversation_count = countMap[c.id] || 0; });
      }
    }

    // Enrich: linked licenses
    const licenseIds = contactsData.filter(c => c.license_id).map(c => c.license_id!);
    if (licenseIds.length > 0) {
      const { data: licenses } = await supabase
        .from("licenses")
        .select("id, plan_type, status")
        .in("id", licenseIds);
      if (licenses) {
        const licMap = new Map(licenses.map(l => [l.id, l]));
        contactsData.forEach(c => {
          if (c.license_id && licMap.has(c.license_id)) {
            const lic = licMap.get(c.license_id)!;
            c.linked_license_plan = lic.plan_type;
            c.linked_license_status = lic.status;
          }
        });
      }
    }

    // Enrich: POS user counts per license
    if (licenseIds.length > 0) {
      const { data: posUsers } = await supabase
        .from("license_pos_users")
        .select("license_id")
        .in("license_id", licenseIds);
      if (posUsers) {
        const posMap: Record<string, number> = {};
        posUsers.forEach(p => { posMap[p.license_id] = (posMap[p.license_id] || 0) + 1; });
        contactsData.forEach(c => {
          if (c.license_id) c.pos_user_count = posMap[c.license_id] || 0;
        });
      }
    }

    setContacts(contactsData);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("contacts").update({ is_read: !current }).eq("id", id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: !current } : c));
  };

  const updateType = async (id: string, contact_type: string) => {
    const { error } = await supabase.from("contacts").update({ contact_type }).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else setContacts(prev => prev.map(c => c.id === id ? { ...c, contact_type } : c));
  };

  // Compute filter counts
  const counts = {
    all: contacts.length,
    prospect: contacts.filter(c => c.contact_type === "prospect").length,
    active_client: contacts.filter(c => c.contact_type === "active_client").length,
    partner: contacts.filter(c => c.contact_type === "partner").length,
    former_client: contacts.filter(c => c.contact_type === "former_client").length,
    with_license: contacts.filter(c => c.license_id).length,
    with_demo: contacts.filter(c => c.lead_id).length,
    ai_captured: contacts.filter(c => c.captured_by_ai).length,
  };

  const filtered = contacts.filter(c => {
    // Search
    if (search) {
      const s = search.toLowerCase();
      const match = c.full_name.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone?.includes(s) ||
        c.business_name?.toLowerCase().includes(s);
      if (!match) return false;
    }
    // Filter
    if (activeFilter === "all") return true;
    if (activeFilter === "with_license") return !!c.license_id;
    if (activeFilter === "with_demo") return !!c.lead_id;
    if (activeFilter === "ai_captured") return c.captured_by_ai;
    return c.contact_type === activeFilter;
  });

  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Contactos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Libreta universal · {contacts.length} contactos
            {unreadCount > 0 && <span className="ml-2 text-primary font-medium">· {unreadCount} sin leer</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border bg-card p-0.5">
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              title="Vista tabla"
            >
              <TableIcon className="h-3.5 w-3.5" /> Tabla
            </button>
            <button
              onClick={() => setView("pipeline")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              title="Vista pipeline (CRM)"
            >
              <Kanban className="h-3.5 w-3.5" /> Pipeline
            </button>
          </div>
          {view === "table" && (
            <Button size="sm" variant="outline" onClick={() => exportToCsv(filtered as any[], [
              { key: "full_name", label: "Nombre" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Teléfono" },
              { key: "city", label: "Ciudad" },
              { key: "business_name", label: "Negocio" },
              { key: "contact_type", label: "Tipo" },
              { key: "source", label: "Fuente" },
              { key: "created_at", label: "Fecha" },
            ], "contactos")}>
              <Download className="h-3.5 w-3.5 mr-1" /> Exportar
            </Button>
          )}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Contacto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo Contacto</DialogTitle></DialogHeader>
              <NewContactForm onSuccess={() => { setShowForm(false); load(); setView("pipeline"); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "pipeline" ? (
        <ContactPipelineView />
      ) : (
        <>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {roleFilters.map(f => {
          const count = counts[f.value as keyof typeof counts] || 0;
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                isActive ? "bg-primary-foreground/20" : "bg-muted"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Refresh */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, teléfono o negocio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="icon" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-3 text-left font-medium w-8"></th>
              <th className="px-3 py-3 text-left font-medium">Contacto</th>
              <th className="px-3 py-3 text-left font-medium hidden md:table-cell">Negocio</th>
              <th className="px-3 py-3 text-left font-medium">Tipo</th>
              <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">Licencia</th>
              <th className="px-3 py-3 text-left font-medium hidden lg:table-cell">POS</th>
              <th className="px-3 py-3 text-left font-medium hidden sm:table-cell">Fuente</th>
              <th className="px-3 py-3 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No hay contactos</td></tr>
            ) : (
              filtered.map(c => (
                <tr
                  key={c.id}
                  className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${!c.is_read ? "bg-primary/5" : ""}`}
                  onClick={() => setSelectedContact(c)}
                >
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleRead(c.id, c.is_read)}
                      className="hover:text-primary transition-colors"
                      title={c.is_read ? "Marcar como no leído" : "Marcar como leído"}
                    >
                      {c.is_read ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-primary" />}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium ${!c.is_read ? "text-foreground" : ""}`}>{c.full_name}</span>
                      {c.captured_by_ai && (
                        <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 text-[10px] px-1 py-0">
                          <Bot className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {c.email && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    {c.business_name ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{c.business_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {c.city && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" /> {c.city}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <Select value={c.contact_type} onValueChange={v => updateType(c.id, v)}>
                      <SelectTrigger className="w-28 h-7 text-xs border-none bg-transparent p-0">
                        <Badge className={`text-[10px] ${typeLabels[c.contact_type]?.color || ""}`}>
                          {typeLabels[c.contact_type]?.icon} {typeLabels[c.contact_type]?.label || c.contact_type}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {c.license_id ? (
                      <div className="flex items-center gap-1">
                        <KeyRound className="h-3 w-3 text-green-600 shrink-0" />
                        <span className="text-xs">
                          {c.linked_license_plan || "—"}
                        </span>
                        {c.linked_license_status && (
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 ${
                            c.linked_license_status === "active" ? "border-green-300 text-green-700" :
                            c.linked_license_status === "suspended" ? "border-muted text-muted-foreground" :
                            "border-destructive/50 text-destructive"
                          }`}>
                            {c.linked_license_status === "active" ? "Activa" :
                             c.linked_license_status === "suspended" ? "Susp." : "Vencida"}
                          </Badge>
                        )}
                      </div>
                    ) : c.lead_id ? (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                        Demo
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {(c.pos_user_count || 0) > 0 ? (
                      <div className="flex items-center gap-1">
                        <UserCog className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{c.pos_user_count}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className={`text-[10px] ${sourceLabels[c.source]?.color || ""}`}>
                      {sourceLabels[c.source]?.label || c.source}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedContact && (
        <ContactDetailPanel
          contact={selectedContact as any}
          onUpdate={() => { setSelectedContact(null); load(); }}
        />
      )}
        </>
      )}
    </div>
  );
}

function NewContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", city: "",
    business_name: "", business_type: "", contact_type: "prospect",
    source: "manual", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("contacts").insert({
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      city: form.city || null,
      business_name: form.business_name || null,
      business_type: form.business_type || null,
      contact_type: form.contact_type,
      source: form.source,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error al crear contacto", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contacto creado" });
      onSuccess();
    }
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const sourceOptions = [
    { value: "website", label: "Sitio Web" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "referral", label: "Referido" },
    { value: "social_media", label: "Redes Sociales" },
    { value: "manual", label: "Manual" },
  ];

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Nombre *</Label><Input value={form.full_name} onChange={e => set("full_name", e.target.value)} required className="h-9" /></div>
        <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={e => set("city", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Negocio</Label><Input value={form.business_name} onChange={e => set("business_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Tipo Negocio</Label><Input value={form.business_type} onChange={e => set("business_type", e.target.value)} className="h-9" /></div>
        <div>
          <Label className="text-xs">Tipo Contacto</Label>
          <Select value={form.contact_type} onValueChange={v => set("contact_type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Fuente</Label>
          <Select value={form.source} onValueChange={v => set("source", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {sourceOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label className="text-xs">Notas</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} /></div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : "Crear Contacto"}</Button>
    </form>
  );
}

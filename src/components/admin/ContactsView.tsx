import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Bot, Eye, EyeOff, Search, Plus, Mail, Phone,
  Building2, MapPin, Filter, RefreshCw, Kanban, List, ClipboardList, Download,
} from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ContactPipelineView = lazy(() => import("./ContactPipelineView"));
const LeadsView = lazy(() => import("./LeadsView"));

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
  created_at: string;
  ai_conversation_count?: number;
}

const sourceLabels: Record<string, { label: string; color: string }> = {
  website: { label: "Sitio Web", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  whatsapp: { label: "WhatsApp", color: "bg-whatsapp/10 text-whatsapp border-whatsapp/20" },
  chatbot_ai: { label: "Chatbot IA", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  cotizacion_web: { label: "Cotización Web", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  referral: { label: "Referido", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
  social_media: { label: "Redes Sociales", color: "bg-pink-500/10 text-pink-700 border-pink-200" },
  landing: { label: "Landing", color: "bg-cta/10 text-cta border-cta/20" },
  manual: { label: "Manual", color: "bg-muted text-muted-foreground border-border" },
};

const typeLabels: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospecto", color: "bg-blue-500/10 text-blue-700" },
  active_client: { label: "Cliente Activo", color: "bg-whatsapp/10 text-whatsapp" },
  former_client: { label: "Ex-Cliente", color: "bg-muted text-muted-foreground" },
  partner: { label: "Socio", color: "bg-purple-500/10 text-purple-700" },
};

const sourceOptions = [
  { value: "all", label: "Todas las fuentes" },
  { value: "website", label: "Sitio Web" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "chatbot_ai", label: "Chatbot IA" },
  { value: "referral", label: "Referido" },
  { value: "social_media", label: "Redes Sociales" },
  { value: "landing", label: "Landing" },
  { value: "manual", label: "Manual" },
];

const typeOptions = [
  { value: "all", label: "Todos los tipos" },
  { value: "prospect", label: "Prospecto" },
  { value: "active_client", label: "Cliente Activo" },
  { value: "former_client", label: "Ex-Cliente" },
  { value: "partner", label: "Socio" },
];

const readOptions = [
  { value: "all", label: "Todos" },
  { value: "unread", label: "Sin leer" },
  { value: "read", label: "Leídos" },
];

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterSource !== "all") query = query.eq("source", filterSource);
    if (filterType !== "all") query = query.eq("contact_type", filterType);
    if (filterRead === "unread") query = query.eq("is_read", false);
    if (filterRead === "read") query = query.eq("is_read", true);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error cargando contactos", variant: "destructive" });
    }
    // Fetch AI conversation counts
    const contactsData = (data as Contact[]) || [];
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
    setContacts(contactsData);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterSource, filterType, filterRead]);

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("contacts").update({ is_read: !current }).eq("id", id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read: !current } : c))
    );
  };

  const updateType = async (id: string, contact_type: string) => {
    const { error } = await supabase.from("contacts").update({ contact_type }).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, contact_type } : c)));
  };

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.includes(s) ||
      c.business_name?.toLowerCase().includes(s)
    );
  });

  const unreadCount = contacts.filter((c) => !c.is_read).length;
  const aiCount = contacts.filter((c) => c.captured_by_ai).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión unificada de prospectos, leads, clientes y socios</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-none"
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="destructive" className="text-xs">Total: {contacts.length}</Badge>
          {unreadCount > 0 && <Badge variant="outline" className="text-xs">Sin leer: {unreadCount}</Badge>}
          {aiCount > 0 && (
            <Badge className="bg-purple-500 text-white text-xs">
              <Bot className="h-3 w-3 mr-1" /> Capturados por IA: {aiCount}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Contactos ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" /> Leads / Demos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            <div className="flex-1" />

            <div className="w-48">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Fuente" /></SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  {readOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nombre, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>

            <Button size="sm" variant="outline" onClick={load} className="h-9">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>

            <Button size="sm" variant="outline" className="h-9" onClick={() => exportToCsv(filtered as any[], [
              { key: "full_name", label: "Nombre" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Teléfono" },
              { key: "city", label: "Ciudad" },
              { key: "business_name", label: "Negocio" },
              { key: "business_type", label: "Tipo Negocio" },
              { key: "contact_type", label: "Tipo Contacto" },
              { key: "source", label: "Fuente" },
              { key: "is_read", label: "Leído" },
              { key: "created_at", label: "Fecha" },
            ], "contactos")}>
              <Download className="h-3.5 w-3.5 mr-1" /> Exportar
            </Button>

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Contacto</DialogTitle>
                </DialogHeader>
                <NewContactForm onSuccess={() => { setShowForm(false); load(); }} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Kanban View */}
          {viewMode === "kanban" ? (
            <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
              <ContactPipelineView />
            </Suspense>
          ) : (
            /* Table View */
            <div className="rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-3 text-left font-medium w-8"></th>
                    <th className="px-3 py-3 text-left font-medium">Nombre</th>
                    <th className="px-3 py-3 text-left font-medium">Contacto</th>
                    <th className="px-3 py-3 text-left font-medium">Negocio</th>
                    <th className="px-3 py-3 text-left font-medium">Fuente</th>
                    <th className="px-3 py-3 text-left font-medium">Tipo</th>
                    <th className="px-3 py-3 text-left font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No hay contactos</td></tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b hover:bg-muted/30 transition-colors ${!c.is_read ? "bg-primary/5 font-medium" : ""}`}
                      >
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleRead(c.id, c.is_read)}
                            className="hover:text-primary transition-colors"
                            title={c.is_read ? "Marcar como no leído" : "Marcar como leído"}
                          >
                            {c.is_read ? (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span>{c.full_name}</span>
                            {c.captured_by_ai && (
                              <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                                <Bot className="h-3 w-3 mr-0.5" /> IA
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {c.email && (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground" /> {c.email}
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {c.business_name && (
                            <div className="flex items-center gap-1 text-xs">
                              <Building2 className="h-3 w-3 text-muted-foreground" /> {c.business_name}
                            </div>
                          )}
                          {c.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {c.city}
                            </div>
                          )}
                          {(c.ai_conversation_count || 0) > 0 && (
                            <Badge variant="outline" className="text-[10px] mt-1 bg-purple-500/10 text-purple-700 border-purple-200">
                              <Bot className="h-3 w-3 mr-0.5" /> {c.ai_conversation_count} conv.
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="outline" className={`text-[10px] ${sourceLabels[c.source]?.color || ""}`}>
                            {sourceLabels[c.source]?.label || c.source}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Select value={c.contact_type} onValueChange={(v) => updateType(c.id, v)}>
                            <SelectTrigger className="w-32 h-7 text-xs border-none bg-transparent p-0">
                              <Badge className={`text-[10px] ${typeLabels[c.contact_type]?.color || ""}`}>
                                {typeLabels[c.contact_type]?.label || c.contact_type}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {typeOptions.filter((o) => o.value !== "all").map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads">
          <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
            <LeadsView />
          </Suspense>
        </TabsContent>
      </Tabs>
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

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Nombre *</Label><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required className="h-9" /></div>
        <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Negocio</Label><Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className="h-9" /></div>
        <div><Label className="text-xs">Tipo Negocio</Label><Input value={form.business_type} onChange={(e) => set("business_type", e.target.value)} className="h-9" /></div>
        <div>
          <Label className="text-xs">Tipo Contacto</Label>
          <Select value={form.contact_type} onValueChange={(v) => set("contact_type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {typeOptions.filter((o) => o.value !== "all").map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Fuente</Label>
          <Select value={form.source} onValueChange={(v) => set("source", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {sourceOptions.filter((o) => o.value !== "all").map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label className="text-xs">Notas</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} /></div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando..." : "Crear Contacto"}</Button>
    </form>
  );
}

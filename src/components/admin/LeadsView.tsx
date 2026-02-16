import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Send, Loader2, Calendar, Mail, Phone, MapPin, Building2, User } from "lucide-react";

interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  source: string | null;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  notes: string | null;
  pos_username: string | null;
  pos_company: string | null;
  pos_password: string | null;
  activation_completed_at: string | null;
  uses_software: boolean | null;
  knows_inventory: boolean | null;
  main_pain: string | null;
  ideal_pos_features: string | null;
  daily_sales: string | null;
  employee_count: string | null;
  urgency: string | null;
  business_type: string | null;
  country: string | null;
}

const statusOptions = [
  { value: "new", label: "Nuevo", color: "bg-blue-500 text-white" },
  { value: "contacted", label: "Contactado", color: "bg-yellow-500 text-white" },
  { value: "activation_completed", label: "✅ Activación Completa", color: "bg-orange-500 text-white" },
  { value: "demo_personalized", label: "Demo Personalizada", color: "bg-purple-500 text-white" },
  { value: "active_trial", label: "Demo Activa", color: "bg-whatsapp text-white" },
  { value: "converted", label: "Convertido", color: "bg-primary text-primary-foreground" },
  { value: "lost", label: "Perdido", color: "bg-destructive text-destructive-foreground" },
];

const sourceLabels: Record<string, string> = {
  landing_campana: "📢 Campaña",
  website: "🌐 Web",
  referral: "🤝 Referido",
  socio_panel: "🤝 Socio",
};

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [credDialog, setCredDialog] = useState(false);
  const [credForm, setCredForm] = useState({ pos_username: "", pos_company: "", pos_password: "" });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("leads_trials").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, newStatus: string, lead: Lead) => {
    // If changing to demo_personalized, open credential dialog
    if (newStatus === "demo_personalized") {
      setSelectedLead(lead);
      setCredForm({
        pos_username: lead.pos_username || "",
        pos_company: lead.pos_company || lead.business_name,
        pos_password: lead.pos_password || "",
      });
      setCredDialog(true);
      return;
    }

    const updates: Record<string, unknown> = { status: newStatus };
    
    // Auto-set trial_ends_at when marking as active
    if (newStatus === "active_trial" && !lead.trial_ends_at) {
      const ends = new Date();
      ends.setDate(ends.getDate() + 30);
      updates.trial_ends_at = ends.toISOString();
    }

    const { error } = await supabase.from("leads_trials").update(updates).eq("id", id);
    if (error) toast({ title: "Error", variant: "destructive" });
    else load();
  };

  const handleSendCredentials = async () => {
    if (!selectedLead) return;
    if (!credForm.pos_username || !credForm.pos_company || !credForm.pos_password) {
      toast({ title: "Completa las 3 credenciales", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Save credentials + update status
      const ends = new Date();
      ends.setDate(ends.getDate() + 30);

      const { error } = await supabase.from("leads_trials").update({
        status: "demo_personalized",
        pos_username: credForm.pos_username,
        pos_company: credForm.pos_company,
        pos_password: credForm.pos_password,
        trial_ends_at: selectedLead.trial_ends_at || ends.toISOString(),
      }).eq("id", selectedLead.id);

      if (error) throw error;

      // Send credentials email
      await supabase.functions.invoke("notify-ticket-status", {
        body: {
          type: "demo_credentials",
          lead_id: selectedLead.id,
          name: selectedLead.contact_name,
          email: selectedLead.email,
          business: selectedLead.business_name,
          pos_username: credForm.pos_username,
          pos_company: credForm.pos_company,
          pos_password: credForm.pos_password,
        },
      });

      toast({ title: "✅ Credenciales enviadas por correo", description: `Email enviado a ${selectedLead.email}` });
      setCredDialog(false);
      setSelectedLead(null);
      load();
    } catch (err) {
      console.error(err);
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const trialProgress = (lead: Lead) => {
    if (!lead.trial_ends_at) return null;
    const start = new Date(lead.created_at).getTime();
    const end = new Date(lead.trial_ends_at).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return { pct, daysLeft };
  };

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);

  const statusBadge = (status: string) => {
    const opt = statusOptions.find((s) => s.value === status);
    return <Badge className={opt?.color || ""}>{opt?.label || status}</Badge>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold font-display">Leads / Demos</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({leads.length})</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({leads.filter((l) => l.status === s.value).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium">Origen</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Demo</th>
              <th className="px-4 py-3 text-left font-medium">Cred.</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No hay leads</td></tr>
            ) : (
              filtered.map((l) => {
                const trial = trialProgress(l);
                return (
                  <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.business_name}</td>
                    <td className="px-4 py-3">
                      <div>{l.contact_name}</div>
                      <a href={`mailto:${l.email}`} className="block text-xs text-primary hover:underline active:opacity-70">{l.email}</a>
                      <a href={`tel:${l.phone}`} className="block text-xs text-primary hover:underline active:opacity-70">{l.phone}</a>
                    </td>
                    <td className="px-4 py-3">{l.city || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{sourceLabels[l.source || ""] || l.source || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v, l)}>
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 w-32">
                      {trial ? (
                        <div className="space-y-1">
                          <Progress value={trial.pct} className="h-2" />
                          <span className={`text-xs ${trial.daysLeft === 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            {trial.daysLeft > 0 ? `${trial.daysLeft}d` : "Expirada"}
                          </span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {l.pos_username ? (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">✓ Enviadas</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setSelectedLead(l);
                          setCredForm({
                            pos_username: l.pos_username || "",
                            pos_company: l.pos_company || l.business_name,
                            pos_password: l.pos_password || "",
                          });
                          setCredDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Credential Dialog */}
      <Dialog open={credDialog} onOpenChange={setCredDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Gestión Demo — {selectedLead?.business_name}
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Info */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.contact_name}</div>
                  <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.business_name}</div>
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-primary hover:underline active:opacity-70"><Mail className="h-3.5 w-3.5" /> {selectedLead.email}</a>
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-primary hover:underline active:opacity-70"><Phone className="h-3.5 w-3.5" /> {selectedLead.phone}</a>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.city || "—"}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(selectedLead.created_at).toLocaleDateString("es-CO")}</div>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  {statusBadge(selectedLead.status)}
                  {selectedLead.activation_completed_at && (
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                      ✅ Activación: {new Date(selectedLead.activation_completed_at).toLocaleDateString("es-CO")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Qualification Data (if activation completed) */}
              {selectedLead.activation_completed_at && (
                <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-orange-800">📋 Datos de Calificación</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">¿Usa software?</span><p className="font-medium">{selectedLead.uses_software ? "✅ Sí" : "❌ No"}</p></div>
                    <div><span className="text-muted-foreground">¿Conoce inventario?</span><p className="font-medium">{selectedLead.knows_inventory ? "✅ Sí" : "❌ No"}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Mayor dolor:</span><p className="font-medium">{selectedLead.main_pain || "—"}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">POS ideal:</span><p className="font-medium">{selectedLead.ideal_pos_features || "—"}</p></div>
                    <div><span className="text-muted-foreground">Ventas/día:</span><p className="font-medium">{selectedLead.daily_sales || "—"}</p></div>
                    <div><span className="text-muted-foreground">Empleados:</span><p className="font-medium">{selectedLead.employee_count || "—"}</p></div>
                    <div><span className="text-muted-foreground">Urgencia:</span><p className="font-medium">{selectedLead.urgency || "—"}</p></div>
                    <div><span className="text-muted-foreground">Tipo negocio:</span><p className="font-medium">{selectedLead.business_type || "—"}</p></div>
                  </div>
                </div>
              )}

              {/* Credential Form */}
              <div className="rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 p-4 space-y-3">
                <p className="text-sm font-semibold text-purple-800">🔐 Credenciales POS Personalizadas</p>
                <p className="text-xs text-purple-600">Ingresa los datos manualmente después de crear la demo en el sistema POS.</p>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Usuario</Label>
                    <Input
                      value={credForm.pos_username}
                      onChange={(e) => setCredForm((p) => ({ ...p, pos_username: e.target.value }))}
                      placeholder="Ej: carlos.martinez"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Empresa</Label>
                    <Input
                      value={credForm.pos_company}
                      onChange={(e) => setCredForm((p) => ({ ...p, pos_company: e.target.value }))}
                      placeholder="Ej: DrogueriaSanAngel"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Contraseña</Label>
                    <Input
                      value={credForm.pos_password}
                      onChange={(e) => setCredForm((p) => ({ ...p, pos_password: e.target.value }))}
                      placeholder="Ej: Demo2026!"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCredDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleSendCredentials}
              disabled={sending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {sending ? "Enviando..." : "Guardar y Enviar por Correo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

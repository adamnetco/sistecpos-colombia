import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Send, Loader2, Mail, Phone, MapPin,
  Building2, User, CheckCircle2, RefreshCw, Lock, Eye, Search,
  Rocket, Clock, AlertTriangle, Calendar, Presentation, Tag, Globe, Ticket,
  Pencil, Save, X,
} from "lucide-react";
import { LeadPOSUsersTab } from "./sales/LeadPOSUsersTab";

interface DemoLead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  pos_username: string | null;
  pos_company: string | null;
  pos_password: string | null;
  activation_completed_at: string | null;
  business_type: string | null;
  country: string | null;
  source: string | null;
  assigned_email: string | null;
  short_name: string | null;
  coupon_id: string | null;
}

interface EmailDomain {
  id: string;
  domain: string;
  is_default: boolean;
}

const stageConfig: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  welcome_sent: { label: "Activación Solicitada", color: "bg-orange-500 text-white", icon: "📋", bg: "border-orange-200 bg-orange-50" },
  activation_completed: { label: "Activación Solicitada", color: "bg-orange-500 text-white", icon: "📋", bg: "border-orange-200 bg-orange-50" },
  demo_personalized: { label: "Gestionando Demo", color: "bg-purple-500 text-white", icon: "⚙️", bg: "border-purple-200 bg-purple-50" },
  active_trial: { label: "Demo Activa", color: "bg-green-600 text-white", icon: "🟢", bg: "border-green-200 bg-green-50" },
  software_presentation: { label: "Presentación del Software", color: "bg-blue-600 text-white", icon: "🎬", bg: "border-blue-200 bg-blue-50" },
};

const DEMO_STATUSES = ["welcome_sent", "activation_completed", "demo_personalized", "active_trial", "software_presentation"];

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "STC-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ActiveDemosView() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<DemoLead | null>(null);
  const [credDialog, setCredDialog] = useState(false);
  const [credForm, setCredForm] = useState({ 
    pos_username: "admin", 
    pos_company: "", 
    pos_password: "",
    short_name: "",
    assigned_email: "",
    selected_domain: "",
  });
  const [sending, setSending] = useState(false);
  const [domains, setDomains] = useState<EmailDomain[]>([]);

  // Inline lead-info editor
  const [editingLead, setEditingLead] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadEdit, setLeadEdit] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    business_type: "",
  });

  // Inline credentials editor
  const [editingCreds, setEditingCreds] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [credEdit, setCredEdit] = useState({
    pos_username: "",
    pos_company: "",
    pos_password: "",
    short_name: "",
    assigned_email: "",
  });

  const startCredsEdit = (l: DemoLead) => {
    setCredEdit({
      pos_username: l.pos_username || "",
      pos_company: l.pos_company || "",
      pos_password: l.pos_password || "",
      short_name: l.short_name || "",
      assigned_email: l.assigned_email || "",
    });
    setEditingCreds(true);
  };

  const handleSaveCreds = async () => {
    if (!selectedLead) return;
    if (!credEdit.pos_username || !credEdit.pos_company || !credEdit.pos_password) {
      toast({ title: "Usuario, Empresa y Contraseña son requeridos", variant: "destructive" });
      return;
    }
    setSavingCreds(true);
    const { error } = await supabase
      .from("leads_trials")
      .update({
        pos_username: credEdit.pos_username,
        pos_company: credEdit.pos_company,
        pos_password: credEdit.pos_password,
        short_name: credEdit.short_name || null,
        assigned_email: credEdit.assigned_email || null,
      })
      .eq("id", selectedLead.id);
    setSavingCreds(false);
    if (error) {
      toast({ title: "Error al guardar credenciales", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Credenciales actualizadas" });
      setSelectedLead({ ...selectedLead, ...credEdit, short_name: credEdit.short_name || null, assigned_email: credEdit.assigned_email || null } as DemoLead);
      setEditingCreds(false);
      load();
    }
  };

  const { toast } = useToast();

  const startLeadEdit = (l: DemoLead) => {
    setLeadEdit({
      business_name: l.business_name || "",
      contact_name: l.contact_name || "",
      email: l.email || "",
      phone: l.phone || "",
      city: l.city || "",
      business_type: l.business_type || "",
    });
    setEditingLead(true);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    if (!leadEdit.business_name || !leadEdit.contact_name) {
      toast({ title: "Negocio y contacto son requeridos", variant: "destructive" });
      return;
    }
    setSavingLead(true);
    const { error } = await supabase
      .from("leads_trials")
      .update({
        business_name: leadEdit.business_name,
        contact_name: leadEdit.contact_name,
        email: leadEdit.email,
        phone: leadEdit.phone,
        city: leadEdit.city || null,
        business_type: leadEdit.business_type || null,
      })
      .eq("id", selectedLead.id);
    setSavingLead(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Información actualizada" });
      setSelectedLead({ ...selectedLead, ...leadEdit, city: leadEdit.city || null, business_type: leadEdit.business_type || null } as DemoLead);
      setEditingLead(false);
      load();
    }
  };

  const loadDomains = async () => {
    const { data } = await supabase.from("approved_email_domains").select("*").eq("is_active", true).order("sort_order");
    if (data) setDomains(data as EmailDomain[]);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads_trials")
      .select("*")
      .in("status", DEMO_STATUSES)
      .order("created_at", { ascending: false });
    setLeads((data as DemoLead[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); loadDomains(); }, []);

  // Auto-generate email when short_name or domain changes
  const updateAssignedEmail = (shortName: string, domain: string) => {
    if (shortName && domain) {
      setCredForm(p => ({ ...p, assigned_email: `${shortName.toLowerCase().replace(/\s+/g, "")}@${domain}` }));
    }
  };

  const trialProgress = (lead: DemoLead) => {
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

  const hasCredentials = (l: DemoLead) => Boolean(l.pos_username);

  /* ─── SEND CREDENTIALS ─────────────────────── */
  const handleSendCredentials = async () => {
    if (!selectedLead) return;
    if (!credForm.pos_username || !credForm.pos_company || !credForm.pos_password) {
      toast({ title: "Completa las 3 credenciales", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const ends = new Date();
      ends.setDate(ends.getDate() + 30);
      const { error } = await supabase.from("leads_trials").update({
        status: "active_trial",
        pos_username: credForm.pos_username,
        pos_company: credForm.pos_company,
        pos_password: credForm.pos_password,
        short_name: credForm.short_name || null,
        assigned_email: credForm.assigned_email || null,
        trial_ends_at: selectedLead.trial_ends_at || ends.toISOString(),
      }).eq("id", selectedLead.id);
      if (error) throw error;

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
      toast({ title: "✅ Credenciales enviadas", description: `Email enviado a ${selectedLead.email}. Estado: Demo Activa.` });
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

  /* ─── RESEND CREDENTIALS ────────────────────── */
  const handleResendCredentials = async () => {
    if (!selectedLead) return;
    setSending(true);
    try {
      await supabase.functions.invoke("notify-ticket-status", {
        body: {
          type: "demo_credentials_resend",
          lead_id: selectedLead.id,
          name: selectedLead.contact_name,
          email: selectedLead.email,
          business: selectedLead.business_name,
          pos_username: selectedLead.pos_username,
          pos_company: selectedLead.pos_company,
          pos_password: selectedLead.pos_password,
        },
      });
      toast({ title: "✅ Credenciales reenviadas", description: `Correo reenviado a ${selectedLead.email}` });
    } catch {
      toast({ title: "Error al reenviar", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  /* ─── SEND SOFTWARE PRESENTATION + COUPON ────── */
  const handleSoftwarePresentation = async () => {
    if (!selectedLead) return;
    setSending(true);
    try {
      // Get pricing from license_pricing to calculate discount
      const { data: pricingData } = await supabase
        .from("license_pricing")
        .select("plan_key, plan_label, selling_price_cop, official_price_cop")
        .order("sort_order");

      // Create coupon for each plan (use first plan as default)
      const firstPlan = pricingData?.[0];
      if (!firstPlan) throw new Error("No hay planes de precios configurados");

      const couponCode = generateCouponCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data: coupon, error: couponError } = await supabase.from("discount_coupons").insert({
        code: couponCode,
        lead_id: selectedLead.id,
        plan_key: "all",
        discount_type: "fixed",
        discount_value: 0,
        original_price_cop: Number(firstPlan.selling_price_cop),
        discounted_price_cop: Number(firstPlan.official_price_cop),
        expires_at: expiresAt.toISOString(),
      }).select("id").single();

      if (couponError) throw couponError;

      // Update lead status
      await supabase.from("leads_trials").update({
        status: "software_presentation",
        coupon_id: coupon.id,
      }).eq("id", selectedLead.id);

      // Send email with coupon
      await supabase.functions.invoke("notify-ticket-status", {
        body: {
          type: "software_presentation",
          name: selectedLead.contact_name,
          email: selectedLead.email,
          business: selectedLead.business_name,
          coupon_code: couponCode,
          expires_at: expiresAt.toISOString(),
          plans: pricingData?.map(p => ({
            label: p.plan_label,
            original: Number(p.selling_price_cop),
            discounted: Number(p.official_price_cop),
          })) || [],
        },
      });

      toast({ title: "🎬 Presentación enviada", description: `Cupón ${couponCode} enviado a ${selectedLead.email}. Vence en 24h.` });
      setCredDialog(false);
      setSelectedLead(null);
      load();
    } catch (err) {
      console.error(err);
      toast({ title: "Error al enviar presentación", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  /* ─── FILTER ────────────────────────────────── */
  const filtered = leads.filter((l) => {
    const matchesStage = filterStage === "all" || l.status === filterStage;
    const q = search.toLowerCase();
    const matchesSearch = !q || l.business_name.toLowerCase().includes(q) || l.contact_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  const countByStage = (stage: string) => leads.filter((l) => l.status === stage || (stage === "activation_completed" && l.status === "welcome_sent")).length;
  const pendingCredentials = leads.filter((l) => !hasCredentials(l) && ["demo_personalized", "activation_completed", "welcome_sent"].includes(l.status)).length;
  const expiringSoon = leads.filter((l) => {
    const t = trialProgress(l);
    return t && t.daysLeft <= 5 && t.daysLeft > 0;
  }).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Demos Activas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona demos en curso: asigna credenciales, envía cupones y supervisa vencimientos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilterStage("all")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{leads.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow border-orange-200" onClick={() => setFilterStage("activation_completed")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{countByStage("activation_completed")}</div>
            <div className="text-xs text-muted-foreground">📋 Solicitada</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow border-purple-200" onClick={() => setFilterStage("demo_personalized")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{countByStage("demo_personalized")}</div>
            <div className="text-xs text-muted-foreground">⚙️ Gestionando</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow border-green-200" onClick={() => setFilterStage("active_trial")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{countByStage("active_trial")}</div>
            <div className="text-xs text-muted-foreground">🟢 Activa</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-sm transition-shadow border-blue-200" onClick={() => setFilterStage("software_presentation")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{countByStage("software_presentation")}</div>
            <div className="text-xs text-muted-foreground">🎬 Presentación</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(pendingCredentials > 0 || expiringSoon > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {pendingCredentials > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-800">
              <Lock className="h-4 w-4" />
              <strong>{pendingCredentials}</strong> demo(s) pendientes de credenciales
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <strong>{expiringSoon}</strong> demo(s) por vencer (≤5 días)
            </div>
          )}
        </div>
      )}

      {/* Search + Stage Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, negocio o email..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[{ key: "all", label: "Todos" }, ...DEMO_STATUSES.map((s) => ({ key: s, label: stageConfig[s]?.label || s }))].map((s) => (
            <Button
              key={s.key}
              variant={filterStage === s.key ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setFilterStage(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Negocio</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
              <th className="px-4 py-3 text-left font-medium">Etapa</th>
              <th className="px-4 py-3 text-left font-medium">Credenciales</th>
              <th className="px-4 py-3 text-left font-medium">Trial</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Cargando demos...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No hay demos en esta etapa</td></tr>
            ) : (
              filtered.map((l) => {
                const trial = trialProgress(l);
                const cfg = stageConfig[l.status];
                return (
                  <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.business_name}</div>
                      <div className="text-xs text-muted-foreground">{l.business_type || l.city || "—"}</div>
                      {l.assigned_email && (
                        <div className="text-xs text-primary flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3" />{l.assigned_email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{l.contact_name}</div>
                      <a href={`mailto:${l.email}`} className="block text-xs text-primary hover:underline">{l.email}</a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cfg?.color || ""}>{cfg?.icon} {cfg?.label || l.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {hasCredentials(l) ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Enviadas
                        </Badge>
                      ) : ["demo_personalized", "activation_completed", "welcome_sent"].includes(l.status) ? (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 animate-pulse">
                          <Lock className="h-3 w-3 mr-1" /> Pendiente
                        </Badge>
                      ) : l.status === "software_presentation" ? (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Ticket className="h-3 w-3 mr-1" /> Cupón enviado
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 w-32">
                      {trial ? (
                        <div className="space-y-1">
                          <Progress value={trial.pct} className="h-2" />
                          <span className={`text-xs ${trial.daysLeft <= 5 ? "text-amber-600 font-semibold" : trial.daysLeft === 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                            {trial.daysLeft > 0 ? `${trial.daysLeft}d restantes` : "Expirada"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin trial</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setSelectedLead(l);
                          const defaultDomain = domains.find(d => d.is_default)?.domain || domains[0]?.domain || "";
                          const sName = l.short_name || l.business_name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
                          setCredForm({
                            pos_username: l.pos_username || "admin",
                            pos_company: l.pos_company || sName,
                            pos_password: l.pos_password || "",
                            short_name: l.short_name || sName,
                            assigned_email: l.assigned_email || (sName && defaultDomain ? `${sName}@${defaultDomain}` : ""),
                            selected_domain: defaultDomain,
                          });
                          setCredDialog(true);
                        }}
                      >
                        {hasCredentials(l) ? (
                          <><Eye className="h-3.5 w-3.5 mr-1" /> Ver</>
                        ) : (
                          <><Send className="h-3.5 w-3.5 mr-1" /> Asignar</>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── CREDENTIAL DIALOG ──────────────────── */}
      <Dialog open={credDialog} onOpenChange={setCredDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedLead?.business_name}
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Info (with inline edit) */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información del prospecto</span>
                  {!editingLead ? (
                    <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => startLeadEdit(selectedLead)}>
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 text-[11px] gap-1" onClick={handleSaveLead} disabled={savingLead}>
                        {savingLead ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Guardar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => setEditingLead(false)}>
                        <X className="h-3 w-3" /> Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                {!editingLead ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.contact_name}</div>
                      <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.business_name}</div>
                      <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-3.5 w-3.5" /> {selectedLead.email}</a>
                      <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-3.5 w-3.5" /> {selectedLead.phone}</a>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.city || "—"}</div>
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(selectedLead.created_at).toLocaleDateString("es-CO")}</div>
                      {selectedLead.business_type && (
                        <div className="flex items-center gap-2 col-span-2"><Tag className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.business_type}</div>
                      )}
                    </div>
                    {selectedLead.assigned_email && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Globe className="h-3.5 w-3.5" /> Correo asignado: <strong>{selectedLead.assigned_email}</strong>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[10px]">Negocio *</Label>
                      <Input className="h-8 text-sm" value={leadEdit.business_name} onChange={(e) => setLeadEdit({ ...leadEdit, business_name: e.target.value })} /></div>
                    <div><Label className="text-[10px]">Contacto *</Label>
                      <Input className="h-8 text-sm" value={leadEdit.contact_name} onChange={(e) => setLeadEdit({ ...leadEdit, contact_name: e.target.value })} /></div>
                    <div><Label className="text-[10px]">Email</Label>
                      <Input className="h-8 text-sm" type="email" value={leadEdit.email} onChange={(e) => setLeadEdit({ ...leadEdit, email: e.target.value })} /></div>
                    <div><Label className="text-[10px]">Teléfono</Label>
                      <Input className="h-8 text-sm" value={leadEdit.phone} onChange={(e) => setLeadEdit({ ...leadEdit, phone: e.target.value })} /></div>
                    <div><Label className="text-[10px]">Ciudad</Label>
                      <Input className="h-8 text-sm" value={leadEdit.city} onChange={(e) => setLeadEdit({ ...leadEdit, city: e.target.value })} /></div>
                    <div><Label className="text-[10px]">Tipo negocio</Label>
                      <Input className="h-8 text-sm" value={leadEdit.business_type} onChange={(e) => setLeadEdit({ ...leadEdit, business_type: e.target.value })} /></div>
                  </div>
                )}

                <div className="pt-1">
                  <Badge className={stageConfig[selectedLead.status]?.color || ""}>{stageConfig[selectedLead.status]?.icon} {stageConfig[selectedLead.status]?.label}</Badge>
                </div>
              </div>

              {/* Trial Progress */}
              {(() => {
                const trial = trialProgress(selectedLead);
                if (!trial) return null;
                return (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Trial</span>
                      <span className={`text-xs font-bold ${trial.daysLeft <= 5 ? "text-amber-600" : "text-green-600"}`}>
                        {trial.daysLeft > 0 ? `${trial.daysLeft} días restantes` : "Expirada"}
                      </span>
                    </div>
                    <Progress value={trial.pct} className="h-2" />
                  </div>
                );
              })()}

              {/* ─── CREDENTIALS SECTION ──────────────── */}
              {hasCredentials(selectedLead) ? (
                <div className="rounded-lg border-2 border-green-300 bg-green-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Credenciales Enviadas
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-100">✓ Demo Activa</Badge>
                      {!editingCreds && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-green-700 hover:bg-green-100" onClick={() => startCredsEdit(selectedLead)} title="Editar credenciales">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {editingCreds ? (
                    <div className="bg-white border border-green-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px]">Usuario *</Label>
                          <Input value={credEdit.pos_username} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setCredEdit(p => ({ ...p, pos_username: e.target.value }))} className="h-8 text-sm font-mono" />
                        </div>
                        <div>
                          <Label className="text-[11px]">Empresa (corto) *</Label>
                          <Input value={credEdit.pos_company} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setCredEdit(p => ({ ...p, pos_company: e.target.value }))} className="h-8 text-sm font-mono" />
                        </div>
                        <div>
                          <Label className="text-[11px]">Contraseña *</Label>
                          <Input value={credEdit.pos_password} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setCredEdit(p => ({ ...p, pos_password: e.target.value }))} className="h-8 text-sm font-mono" />
                        </div>
                        <div>
                          <Label className="text-[11px]">Nombre Tienda POS</Label>
                          <Input value={credEdit.short_name} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setCredEdit(p => ({ ...p, short_name: e.target.value }))} className="h-8 text-sm font-mono" placeholder="Identificador corto" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[11px]">Correo POS asignado</Label>
                          <Input value={credEdit.assigned_email} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setCredEdit(p => ({ ...p, assigned_email: e.target.value }))} className="h-8 text-sm font-mono" placeholder="usuario@dominio.com" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="h-8 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={handleSaveCreds} disabled={savingCreds}>
                          {savingCreds ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => setEditingCreds(false)} disabled={savingCreds}>
                          <X className="h-3.5 w-3.5" /> Cancelar
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Al guardar, los cambios se reflejan al instante. Usa "Reenviar" para notificar al cliente.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-green-200 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground w-24">Usuario:</span>
                        <span className="font-mono font-medium">{selectedLead.pos_username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground w-24">Empresa:</span>
                        <span className="font-mono font-medium">{selectedLead.pos_company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground w-24">Contraseña:</span>
                        <span className="font-mono font-medium">{selectedLead.pos_password}</span>
                      </div>
                      {selectedLead.short_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24">Tienda POS:</span>
                          <span className="font-mono font-medium">{selectedLead.short_name}</span>
                        </div>
                      )}
                      {selectedLead.assigned_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-24">Correo POS:</span>
                          <span className="font-mono font-medium text-primary">{selectedLead.assigned_email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendCredentials}
                    disabled={sending || editingCreds}
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                  >
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {sending ? "Reenviando..." : "Reenviar credenciales por correo"}
                  </Button>

                  {/* Software Presentation button for active demos */}
                  {selectedLead.status === "active_trial" && !selectedLead.coupon_id && !editingCreds && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSoftwarePresentation}
                      disabled={sending}
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Presentation className="mr-2 h-4 w-4" />}
                      {sending ? "Enviando..." : "🎬 Enviar Presentación + Cupón 24h"}
                    </Button>
                  )}
                </div>
              ) : ["demo_personalized", "activation_completed", "welcome_sent"].includes(selectedLead.status) ? (
                <div className="rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-purple-800">🔐 Asignar Credenciales POS</p>
                  <p className="text-xs text-purple-600">Ingresa los datos de acceso. Al enviar, el estado cambiará automáticamente a <strong>Demo Activa</strong> y el cliente recibirá un correo.</p>
                  <div className="space-y-2">
                    {/* Short Name */}
                    <div>
                      <Label className="text-xs">Nombre Corto (≤15 caracteres)</Label>
                      <Input 
                        value={credForm.short_name} 
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 15);
                          setCredForm(p => ({ ...p, short_name: val }));
                          updateAssignedEmail(val, credForm.selected_domain);
                        }} 
                        placeholder="Ej: mitienda" 
                        maxLength={15}
                      />
                    </div>
                    {/* Assigned Email */}
                    <div>
                      <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Correo Asignado</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={credForm.assigned_email} 
                          onChange={(e) => setCredForm(p => ({ ...p, assigned_email: e.target.value }))}
                          placeholder="mitienda@ventas.click" 
                          className="flex-1"
                        />
                        {domains.length > 0 && (
                          <Select 
                            value={credForm.selected_domain} 
                            onValueChange={(v) => {
                              setCredForm(p => ({ ...p, selected_domain: v }));
                              updateAssignedEmail(credForm.short_name, v);
                            }}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Dominio" />
                            </SelectTrigger>
                            <SelectContent>
                              {domains.map(d => (
                                <SelectItem key={d.id} value={d.domain}>@{d.domain}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <hr className="my-2" />
                    <div>
                      <Label className="text-xs">Usuario</Label>
                      <Input value={credForm.pos_username} onChange={(e) => setCredForm((p) => ({ ...p, pos_username: e.target.value }))} placeholder="admin" />
                    </div>
                    <div>
                      <Label className="text-xs">Empresa</Label>
                      <Input value={credForm.pos_company} onChange={(e) => setCredForm((p) => ({ ...p, pos_company: e.target.value }))} placeholder="Ej: DrogueriaSanAngel" maxLength={30} />
                      <p className="text-xs text-muted-foreground mt-0.5">Máximo 30 caracteres</p>
                    </div>
                    <div>
                      <Label className="text-xs">Contraseña</Label>
                      <Input value={credForm.pos_password} onChange={(e) => setCredForm((p) => ({ ...p, pos_password: e.target.value }))} placeholder="Ej: Demo2026!" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
                  <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Las credenciales se gestionan en etapa "Gestionando Demo" o "Activación Solicitada".</p>
                </div>
              )}

              {/* Multiple POS users for this demo (copy / WhatsApp share like in active license) */}
              <div className="rounded-lg border bg-card p-3">
                <LeadPOSUsersTab
                  leadId={selectedLead.id}
                  storeName={selectedLead.short_name || selectedLead.pos_company || ""}
                  contactPhone={selectedLead.phone}
                  defaultUsername={selectedLead.pos_username}
                  defaultPassword={selectedLead.pos_password}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCredDialog(false)}>Cerrar</Button>
            {selectedLead && !hasCredentials(selectedLead) && ["demo_personalized", "activation_completed", "welcome_sent"].includes(selectedLead.status) && (
              <Button onClick={handleSendCredentials} disabled={sending} className="bg-green-600 hover:bg-green-700 text-white">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {sending ? "Enviando..." : "Enviar Credenciales y Activar Demo"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

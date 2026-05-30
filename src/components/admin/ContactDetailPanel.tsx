import { useState, useEffect } from "react";
import AIConversationsSection from "./AIConversationsSection";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Phone, Building2, MapPin, Bot, Clock, Plus,
  MessageSquare, PhoneCall, FileText, Calendar, Rocket, Loader2, ExternalLink, Copy, Check,
} from "lucide-react";
import { BUSINESS_TYPES_DEMO, COUNTRIES } from "@/data/demoFormOptions";
import { FranchisePanelSection, type FranchiseData } from "./contacts/FranchisePanelSection";

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
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

const activityIcons: Record<string, typeof MessageSquare> = {
  note: FileText,
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  stage_change: Clock,
};

export default function ContactDetailPanel({
  contact,
  onUpdate,
}: {
  contact: Contact;
  onUpdate: () => void;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [saving, setSaving] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [leadForm, setLeadForm] = useState({
    business_name: contact.business_name || "",
    business_type: contact.business_type || "",
    city: contact.city || "",
    country: "Colombia",
  });
  const [creatingLead, setCreatingLead] = useState(false);
  const [showForwardPanel, setShowForwardPanel] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qualData, setQualData] = useState<any | null>(null);
  const [franchiseData, setFranchiseData] = useState<FranchiseData | null>(null);
  const { toast } = useToast();


  const copyField = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(c => (c === key ? null : c)), 1400);
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadActivities();
    loadQualification();
  }, [contact.id, contact.lead_id]);

  const loadQualification = async () => {
    if (!contact.lead_id) { setQualData(null); return; }
    const { data } = await supabase
      .from("leads_trials")
      .select("qual_has_software,qual_knows_inventory,qual_main_pain,qual_ideal_pos,qual_sales_per_day,qual_employees,qual_time_to_systematize,qual_business_age_value,qual_business_age_period")
      .eq("id", contact.lead_id)
      .maybeSingle();
    setQualData(data || null);
  };


  const loadActivities = async () => {
    const { data } = await supabase
      .from("contact_activities")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setActivities((data as Activity[]) || []);
  };

  const addActivity = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("contact_activities").insert({
      contact_id: contact.id,
      activity_type: activityType,
      description: newNote.trim(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", variant: "destructive" });
    } else {
      setNewNote("");
      loadActivities();
      // Increase lead score
      await supabase
        .from("contacts")
        .update({ lead_score: contact.lead_score + 1 })
        .eq("id", contact.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre</Label>
          <p className="font-medium">{contact.full_name}</p>
        </div>
        {contact.email && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</p>
          </div>
        )}
        {contact.phone && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Teléfono</Label>
            <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</p>
          </div>
        )}
        {contact.business_name && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Negocio</Label>
            <p className="text-sm flex items-center gap-1"><Building2 className="h-3 w-3" />{contact.business_name}</p>
          </div>
        )}
        {contact.city && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ciudad</Label>
            <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.city}</p>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Score</Label>
          <p className="text-sm font-medium">⭐ {contact.lead_score}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {contact.captured_by_ai && (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 text-xs">
            <Bot className="h-3 w-3 mr-1" />Capturado por IA
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">{contact.source}</Badge>
        <Badge variant="outline" className="text-xs">{contact.contact_type}</Badge>
      </div>

      {contact.notes && (
        <div>
          <Label className="text-xs text-muted-foreground">Notas</Label>
          <p className="text-sm mt-1 bg-muted/50 rounded-lg p-3">{contact.notes}</p>
        </div>
      )}

      {/* Reenviar al panel del franquiciado — mini-panel campo por campo */}
      {(() => {
        const storeSlug = (contact.business_name || contact.full_name || "sistecpos")
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^A-Za-z0-9]/g, "").slice(0, 20) || "sistecpos";
        const phone = (contact.phone || "").replace(/\D/g, "");
        const fields: Array<{ key: string; label: string; value: string }> = [
          { key: "name",  label: "Nombre completo",  value: contact.full_name || "" },
          { key: "email", label: "Email",            value: contact.email || "" },
          { key: "email2",label: "Confirmar email",  value: contact.email || "" },
          { key: "store", label: "Nombre de tienda", value: storeSlug },
          { key: "phone", label: "Teléfono / WhatsApp", value: phone },
          { key: "city",  label: "Ciudad",           value: contact.city || "" },
          { key: "country",label: "País",            value: "Colombia" },
          { key: "desc",  label: "Descripción",      value: `Lead desde SistecPOS CRM (${contact.source || "manual"})` },
        ].filter(f => f.value);

        const openPanel = async () => {
          // Copia el primer campo automáticamente para arrancar
          if (fields[0]) await copyField(fields[0].key, fields[0].value);
          window.open(
            `https://licenciaspos.online/prospects/registerForm/890267cdf2986e0e0d89a6de48236599?token=ODM=`,
            "_blank", "noopener,noreferrer"
          );
          setShowForwardPanel(true);
        };

        return (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-amber-400/40 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
              onClick={openPanel}
            >
              <ExternalLink className="h-4 w-4" />
              Reenviar al Panel Franquiciado
            </Button>

            {showForwardPanel && (
              <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                    Pega campo por campo en el panel ↗
                  </p>
                  <button
                    onClick={() => setShowForwardPanel(false)}
                    className="text-[11px] text-amber-700/70 hover:text-amber-900 dark:text-amber-300/70"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 leading-tight">
                  1) Click en "Copiar" · 2) Click en el campo del panel · 3) Ctrl+V · 4) Siguiente.
                  Empezamos con <strong>{fields[0]?.label}</strong> ya copiado.
                </p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {fields.map(f => {
                    const isCopied = copiedField === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => copyField(f.key, f.value)}
                        className={`w-full flex items-center gap-2 text-left rounded-md border px-2 py-1.5 transition ${
                          isCopied
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            : "border-amber-200 bg-white/70 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                          <p className="text-xs font-mono truncate">{f.value}</p>
                        </div>
                        {isCopied ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <Check className="h-3.5 w-3.5" /> Copiado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                            <Copy className="h-3.5 w-3.5" /> Copiar
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Paso 3 — Cualificación del lead (respuestas del usuario) */}
                {(() => {
                  if (!qualData) {
                    return (
                      <p className="text-[11px] text-amber-700/70 dark:text-amber-300/70 italic border-t border-amber-200/60 pt-2">
                        Sin cualificación del paso 2 (lead anterior al wizard).
                      </p>
                    );
                  }
                  const yn = (v: boolean | null) => (v === true ? "Sí" : v === false ? "No" : "");
                  const qFields: Array<{ key: string; label: string; value: string }> = [
                    { key: "q_a", label: "a) ¿Maneja algún software?", value: yn(qualData.qual_has_software) },
                    { key: "q_b", label: "b) ¿Conoce inventarios / ganancias / pérdidas?", value: yn(qualData.qual_knows_inventory) },
                    { key: "q_c", label: "c) Mayor inconveniente", value: qualData.qual_main_pain || "" },
                    { key: "q_d", label: "d) Qué debería tener su POS ideal", value: qualData.qual_ideal_pos || "" },
                    { key: "q_e", label: "e) Ventas promedio/día", value: qualData.qual_sales_per_day || "" },
                    { key: "q_f", label: "f) Cuántos empleados", value: qualData.qual_employees || "" },
                    { key: "q_g", label: "g) En cuánto tiempo quiere sistematizar", value: qualData.qual_time_to_systematize || "" },
                    { key: "q_h", label: "h) Antigüedad del negocio", value: qualData.qual_business_age_value ? `${qualData.qual_business_age_value} ${qualData.qual_business_age_period || "Meses"}` : "" },
                  ];
                  return (
                    <div className="border-t border-amber-200/60 pt-2 space-y-1.5">
                      <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                        Paso 3 — Cualificación (respuestas del usuario)
                      </p>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {qFields.map(f => {
                          const empty = !f.value;
                          const isCopied = copiedField === f.key;
                          return (
                            <button
                              key={f.key}
                              disabled={empty}
                              onClick={() => copyField(f.key, f.value)}
                              className={`w-full flex items-center gap-2 text-left rounded-md border px-2 py-1.5 transition ${
                                empty
                                  ? "border-dashed border-muted-foreground/20 bg-muted/30 cursor-not-allowed"
                                  : isCopied
                                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                                  : "border-amber-200 bg-white/70 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                                <p className={`text-xs truncate ${empty ? "italic text-muted-foreground/60" : "font-mono"}`}>
                                  {empty ? "Sin respuesta" : f.value}
                                </p>
                              </div>
                              {!empty && (
                                isCopied ? (
                                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                    <Check className="h-3.5 w-3.5" /> Copiado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                    <Copy className="h-3.5 w-3.5" /> Copiar
                                  </span>
                                )
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

            )}
          </div>
        );
      })()}



      {/* Pasar a Leads/Demos */}
      {!contact.lead_id && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => {
              setLeadForm({
                business_name: contact.business_name || "",
                business_type: contact.business_type || "",
                city: contact.city || "",
                country: "Colombia",
              });
              setShowLeadDialog(true);
            }}
          >
            <Rocket className="h-4 w-4" />
            Pasar a Leads / Demos
          </Button>

          <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Crear Demo para {contact.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Se creará un registro en Leads/Demos con estado "Activación Solicitada" para gestionar credenciales.
                </p>
                <div>
                  <Label className="text-xs">Nombre del Negocio *</Label>
                  <Input
                    value={leadForm.business_name}
                    onChange={(e) => setLeadForm(p => ({ ...p, business_name: e.target.value }))}
                    placeholder="Ej: Droguería San Ángel"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo de Negocio</Label>
                  <Select value={leadForm.business_type} onValueChange={(v) => setLeadForm(p => ({ ...p, business_type: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES_DEMO.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">País</Label>
                    <Select value={leadForm.country} onValueChange={(v) => setLeadForm(p => ({ ...p, country: v }))}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Ciudad</Label>
                    <Input
                      value={leadForm.city}
                      onChange={(e) => setLeadForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="Ej: Bucaramanga"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
                  <p><strong>Contacto:</strong> {contact.full_name}</p>
                  <p><strong>Email:</strong> {contact.email || "—"}</p>
                  <p><strong>Teléfono:</strong> {contact.phone || "—"}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLeadDialog(false)}>Cancelar</Button>
                <Button
                  disabled={creatingLead || !leadForm.business_name.trim()}
                  onClick={async () => {
                    if (!contact.email || !contact.phone) {
                      toast({ title: "El contacto necesita email y teléfono", variant: "destructive" });
                      return;
                    }
                    setCreatingLead(true);
                    try {
                      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
                      const trialEnds = new Date();
                      trialEnds.setDate(trialEnds.getDate() + 30);

                      const { data: newLead, error } = await supabase.from("leads_trials").insert({
                        contact_name: contact.full_name,
                        business_name: leadForm.business_name,
                        business_type: leadForm.business_type || null,
                        city: leadForm.city || null,
                        country: leadForm.country,
                        phone: contact.phone,
                        email: contact.email,
                        source: "crm_manual",
                        status: "activation_completed",
                        trial_ends_at: trialEnds.toISOString(),
                        activation_token: token,
                      }).select("id").single();

                      if (error) throw error;

                      // Link contact to lead
                      await supabase.from("contacts").update({
                        lead_id: newLead.id,
                      }).eq("id", contact.id);

                      toast({ title: "✅ Lead creado", description: "Ahora puedes gestionar credenciales en Demos Activas." });
                      setShowLeadDialog(false);
                      onUpdate();
                    } catch (err) {
                      console.error(err);
                      toast({ title: "Error al crear lead", variant: "destructive" });
                    } finally {
                      setCreatingLead(false);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  {creatingLead ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                  {creatingLead ? "Creando..." : "Crear Lead y Demo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {contact.lead_id && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
          <Rocket className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary font-medium">Vinculado a Leads/Demos</span>
        </div>
      )}

      <Separator />

      {/* AI Conversations */}
      <AIConversationsSection contactId={contact.id} />

      <Separator />

      {/* Add Activity */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Agregar Actividad</Label>
        <div className="flex gap-2 mb-2">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Nota</SelectItem>
              <SelectItem value="call">Llamada</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Reunión</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Describe la actividad..."
            className="h-9 flex-1"
            onKeyDown={(e) => e.key === "Enter" && addActivity()}
          />
          <Button size="sm" onClick={addActivity} disabled={saving} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Historial ({activities.length})</Label>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activities.map(act => {
            const Icon = activityIcons[act.activity_type] || FileText;
            return (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(act.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Sin actividades registradas</p>
          )}
        </div>
      </div>
    </div>
  );
}

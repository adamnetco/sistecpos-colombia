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
  }, [contact.id]);

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

      {/* Reenviar al panel del franquiciado — salta la pantalla "¿Eres dueño?" yendo directo al formulario */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-amber-400/40 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
          onClick={async () => {
            const storeSlug = (contact.business_name || contact.full_name || "sistecpos")
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/[^A-Za-z0-9]/g, "").slice(0, 20) || "sistecpos";
            const phone = (contact.phone || "").replace(/\D/g, "");
            const data = {
              form_name: contact.full_name || "",
              form_email: contact.email || "",
              confirm_email: contact.email || "",
              form_store: storeSlug,
              form_phone: phone,
              form_city: contact.city || "",
              form_country: "Colombia",
              form_description: `Lead enviado desde SistecPOS CRM (${contact.source || "manual"})`,
            };
            // 1) Copiar al portapapeles como texto formateado (respaldo si el panel no autollena)
            try {
              const txt = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
              await navigator.clipboard.writeText(txt);
            } catch {}
            // 2) Abrir DIRECTO el formulario (sin la pantalla de "¿Eres dueño?")
            const params = new URLSearchParams({
              ...data,
              nombre: data.form_name, correo: data.form_email,
              telefono: data.form_phone, negocio: data.form_store,
              ciudad: data.form_city, pais: data.form_country,
              ref: "sistecpos_admin",
            });
            const url = `https://licenciaspos.online/prospects/registerForm/890267cdf2986e0e0d89a6de48236599?token=ODM=&${params.toString()}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink className="h-4 w-4" />
          Reenviar al Panel Franquiciado
        </Button>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Abre el formulario del panel <strong>saltando</strong> la pantalla de "¿Eres dueño?".
          Si el panel no autollena los campos, los datos ya quedaron <strong>copiados al portapapeles</strong> — solo pega (Ctrl+V) en cada campo.
        </p>
      </div>


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

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle, Plus, Pencil, Trash2, Send, RefreshCw,
  CheckCircle, XCircle, Clock, Wifi, WifiOff, Eye,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/* ─── Types ──────────────────────────────────────────────── */

interface Provider {
  id: string;
  name: string;
  display_name: string;
  provider_type: string;
  config: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
  notes: string | null;
  created_at: string;
}

interface Template {
  id: string;
  event_type: string;
  event_label: string;
  template_text: string;
  emoji: string;
  is_active: boolean;
  sort_order: number;
  notes: string | null;
  provider_name: string | null;
}


interface LogEntry {
  id: string;
  event_type: string;
  provider_name: string;
  recipient_phone: string | null;
  message_sent: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/* ─── Available variable tokens ──────────────────────────── */
const AVAILABLE_VARS = ["{{name}}", "{{business}}", "{{phone}}", "{{email}}", "{{city}}", "{{subject}}", "{{status}}", "{{plan}}", "{{urgency}}"];

const PROVIDER_TYPES = [
  { value: "callmebot", label: "CallMeBot", description: "API gratuita para notificaciones WhatsApp personales" },
  { value: "ycloud", label: "yCloud", description: "API empresarial con WhatsApp Business API" },
];

/* ─── Component ──────────────────────────────────────────── */

export default function WhatsAppNotificationsView() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── Providers ──
  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["whatsapp_providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_providers").select("*").order("created_at");
      if (error) throw error;
      return data as Provider[];
    },
  });

  // ── Templates ──
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["whatsapp_templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_templates").select("*").order("sort_order");
      if (error) throw error;
      return data as Template[];
    },
  });

  // ── Log ──
  const { data: logs = [], isLoading: loadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ["whatsapp_notification_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_notification_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as LogEntry[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-whatsapp" />
          Notificaciones WhatsApp
        </h1>
        <p className="text-muted-foreground">Gestiona proveedores, plantillas y monitorea envíos de notificaciones al equipo.</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2"><MessageCircle className="h-4 w-4" />Plantillas</TabsTrigger>
          <TabsTrigger value="providers" className="gap-2"><Wifi className="h-4 w-4" />Proveedores</TabsTrigger>
          <TabsTrigger value="log" className="gap-2"><Clock className="h-4 w-4" />Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplatesTab templates={templates} loading={loadingTemplates} providers={providers} />
        </TabsContent>
        <TabsContent value="providers">
          <ProvidersTab providers={providers} loading={loadingProviders} />
        </TabsContent>
        <TabsContent value="log">
          <LogTab logs={logs} loading={loadingLogs} onRefresh={refetchLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ═══ TEMPLATES TAB ═══════════════════════════════════════ */

function TemplatesTab({ templates, loading, providers }: { templates: Template[]; loading: boolean; providers: Provider[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);


  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("whatsapp_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_templates"] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp_templates"] });
      toast({ title: "Plantilla eliminada" });
    },
  });

  const sendTest = useMutation({
    mutationFn: async (eventType: string) => {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          event_type: eventType,
          variables: { name: "Test", business: "Demo", phone: "3001234567", email: "test@test.com", city: "Bogotá", subject: "Test", status: "abierto", plan: "Emprendedor", urgency: "Alta" },
          is_test: true,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: data?.status === "sent" ? "✅ Mensaje de prueba enviado" : "⚠️ Resultado", description: data?.message || "Revisa el historial" });
      qc.invalidateQueries({ queryKey: ["whatsapp_notification_log"] });
    },
    onError: (err) => toast({ title: "Error al enviar prueba", description: String(err), variant: "destructive" }),
  });

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando plantillas...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Plantillas de Mensajes</CardTitle>
          <CardDescription>Usa variables como {"{{name}}"}, {"{{business}}"}, {"{{phone}}"} en tus plantillas.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" />Nueva</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="text-2xl">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm">{t.event_label}</span>
                  <Badge variant="outline" className="text-[10px]">{t.event_type}</Badge>
                  {t.provider_name && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      📡 {t.provider_name}
                    </Badge>
                  )}
                  {!t.provider_name && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      predeterminado
                    </Badge>
                  )}
                  {!t.is_active && <Badge variant="secondary">Inactiva</Badge>}
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-24 overflow-y-auto">{t.template_text}</pre>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: t.id, is_active: v })} />
                <Button variant="ghost" size="icon" onClick={() => sendTest.mutate(t.event_type)} title="Enviar prueba">
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditing(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteTemplate.mutate(t.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {(editing || creating) && (
        <TemplateDialog
          template={editing}
          providers={providers}
          open
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </Card>
  );
}

/* ─── Template Dialog ──────────────────────────────────── */

function TemplateDialog({ template, providers, open, onClose }: { template: Template | null; providers: Provider[]; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEdit = !!template;

  const [form, setForm] = useState({
    event_type: template?.event_type || "",
    event_label: template?.event_label || "",
    template_text: template?.template_text || "",
    emoji: template?.emoji || "📱",
    notes: template?.notes || "",
    provider_name: template?.provider_name || "",
  });

  const save = async () => {
    if (!form.event_type || !form.event_label || !form.template_text) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }
    const payload = { ...form, provider_name: form.provider_name || null };
    if (isEdit) {
      const { error } = await supabase.from("whatsapp_templates").update(payload).eq("id", template.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("whatsapp_templates").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    qc.invalidateQueries({ queryKey: ["whatsapp_templates"] });
    toast({ title: isEdit ? "Plantilla actualizada" : "Plantilla creada" });
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plantilla" : "Nueva Plantilla"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[60px_1fr] gap-3">
            <div>
              <Label>Emoji</Label>
              <Input value={form.emoji} onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))} maxLength={4} className="text-center text-xl" />
            </div>
            <div>
              <Label>Etiqueta</Label>
              <Input value={form.event_label} onChange={(e) => setForm((p) => ({ ...p, event_label: e.target.value }))} placeholder="Ej: Nuevo Lead Demo" />
            </div>
          </div>
          <div>
            <Label>Tipo de Evento (clave única)</Label>
            <Input value={form.event_type} onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))} placeholder="Ej: new_demo" disabled={isEdit} />
          </div>
          <div>
            <Label>Plantilla del Mensaje</Label>
            <Textarea value={form.template_text} onChange={(e) => setForm((p) => ({ ...p, template_text: e.target.value }))} rows={8} className="font-mono text-xs" />
            <div className="flex flex-wrap gap-1 mt-2">
              {AVAILABLE_VARS.map((v) => (
                <Button key={v} variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setForm((p) => ({ ...p, template_text: p.template_text + v }))}>
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Enrutar a proveedor</Label>
            <select
              value={form.provider_name}
              onChange={(e) => setForm((p) => ({ ...p, provider_name: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— Predeterminado (is_default) —</option>
              {providers.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.display_name} ({p.provider_type})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Si no se selecciona, se usará el proveedor marcado como predeterminado.</p>
          </div>
          <div>
            <Label>Notas internas</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{isEdit ? "Guardar" : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══ PROVIDERS TAB ══════════════════════════════════════ */

function ProvidersTab({ providers, loading }: { providers: Provider[]; loading: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("whatsapp_providers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_providers"] }),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      // Unset all defaults, then set the chosen one
      await supabase.from("whatsapp_providers").update({ is_default: false }).neq("id", id);
      const { error } = await supabase.from("whatsapp_providers").update({ is_default: true, is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp_providers"] });
      toast({ title: "Proveedor predeterminado actualizado" });
    },
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp_providers"] });
      toast({ title: "Proveedor eliminado" });
    },
  });

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Proveedores de WhatsApp</CardTitle>
          <CardDescription>Configura los servicios para envío de notificaciones. El proveedor predeterminado se usa para todos los envíos.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${p.is_active ? "bg-whatsapp/10" : "bg-muted"}`}>
                {p.is_active ? <Wifi className="h-5 w-5 text-whatsapp" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.display_name}</span>
                  <Badge variant="outline" className="text-[10px]">{p.provider_type}</Badge>
                  {p.is_default && <Badge className="bg-whatsapp text-white text-[10px]">Predeterminado</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.provider_type === "callmebot" && "Notificaciones vía api.callmebot.com"}
                  {p.provider_type === "ycloud" && "WhatsApp Business API vía yCloud"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={p.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: p.id, is_active: v })} />
                {!p.is_default && (
                  <Button variant="outline" size="sm" onClick={() => setDefault.mutate(p.id)}>
                    Predeterminar
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {!p.is_default && (
                  <Button variant="ghost" size="icon" onClick={() => deleteProvider.mutate(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {(creating || editing) && (
        <ProviderDialog provider={editing} open onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </Card>
  );
}

/* ─── Provider Dialog ─────────────────────────────────── */

function ProviderDialog({ provider, open, onClose }: { provider: Provider | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEdit = !!provider;

  const [form, setForm] = useState({
    name: provider?.name || "",
    display_name: provider?.display_name || "",
    provider_type: provider?.provider_type || "callmebot",
    notes: provider?.notes || "",
    config: JSON.stringify(provider?.config || {}, null, 2),
  });

  const save = async () => {
    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = JSON.parse(form.config);
    } catch {
      toast({ title: "JSON de configuración inválido", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      display_name: form.display_name,
      provider_type: form.provider_type,
      notes: form.notes || null,
      config: parsedConfig as unknown as import("@/integrations/supabase/types").Json,
    };

    if (isEdit) {
      const { error } = await supabase.from("whatsapp_providers").update(payload).eq("id", provider.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("whatsapp_providers").insert([payload]);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    qc.invalidateQueries({ queryKey: ["whatsapp_providers"] });
    toast({ title: isEdit ? "Proveedor actualizado" : "Proveedor creado" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select value={form.provider_type} onValueChange={(v) => setForm((p) => ({ ...p, provider_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre (clave)</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="callmebot" disabled={isEdit} />
            </div>
            <div>
              <Label>Nombre visible</Label>
              <Input value={form.display_name} onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))} placeholder="CallMeBot" />
            </div>
          </div>
          <div>
            <Label>Configuración (JSON)</Label>
            <Textarea value={form.config} onChange={(e) => setForm((p) => ({ ...p, config: e.target.value }))} rows={6} className="font-mono text-xs" />
            <p className="text-[10px] text-muted-foreground mt-1">
              CallMeBot: {`{"use_env_secrets": true, "phone_env": "CALLMEBOT_PHONE", "apikey_env": "CALLMEBOT_API_KEY"}`}
              <br />
              yCloud: {`{"api_key": "...", "from_phone": "...", "template_namespace": "..."}`}
            </p>
          </div>
          <div>
            <Label>Notas</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{isEdit ? "Guardar" : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══ LOG TAB ════════════════════════════════════════════ */

function LogTab({ logs, loading, onRefresh }: { logs: LogEntry[]; loading: boolean; onRefresh: () => void }) {
  const [viewing, setViewing] = useState<LogEntry | null>(null);

  const statusIcon = (s: string) => {
    if (s === "sent") return <CheckCircle className="h-4 w-4 text-whatsapp" />;
    if (s === "failed") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Cargando...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Envíos</CardTitle>
          <CardDescription>Últimas 50 notificaciones WhatsApp enviadas al equipo.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => onRefresh()}>
          <RefreshCw className="h-4 w-4 mr-1" />Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No hay registros aún.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{statusIcon(l.status)}</TableCell>
                  <TableCell className="font-medium text-sm">{l.event_type}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{l.provider_name}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(l.created_at), "dd MMM HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setViewing(l)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {viewing && (
        <Dialog open onOpenChange={() => setViewing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de Notificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div><strong>Evento:</strong> {viewing.event_type}</div>
              <div><strong>Proveedor:</strong> {viewing.provider_name}</div>
              <div><strong>Estado:</strong> <Badge variant={viewing.status === "sent" ? "default" : "destructive"}>{viewing.status}</Badge></div>
              {viewing.recipient_phone && <div><strong>Teléfono:</strong> {viewing.recipient_phone}</div>}
              {viewing.error_message && <div className="text-destructive"><strong>Error:</strong> {viewing.error_message}</div>}
              {viewing.message_sent && (
                <div>
                  <strong>Mensaje:</strong>
                  <pre className="mt-1 rounded bg-muted p-3 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">{viewing.message_sent}</pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Monitor, Globe, Plus, Trash2, Star, Calendar } from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export default function GeneralSettingsTab() {
  const [playstoreUrl, setPlaystoreUrl] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [demoPosUser, setDemoPosUser] = useState("");
  const [demoPosStore, setDemoPosStore] = useState("");
  const [demoPosPass, setDemoPosPass] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDemo, setSavingDemo] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);

  const loadDomains = async () => {
    const { data } = await supabase.from("approved_email_domains").select("*").order("sort_order");
    setDomains((data as Domain[]) || []);
  };

  useEffect(() => {
    Promise.all([
      supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["playstore_url", "demo_pos_user", "demo_pos_store", "demo_pos_pass", "google_calendar_url"]),
      supabase.from("approved_email_domains").select("*").order("sort_order"),
    ]).then(([settingsRes, domainsRes]) => {
      (settingsRes.data || []).forEach((row) => {
        if (row.key === "playstore_url") setPlaystoreUrl(row.value);
        if (row.key === "google_calendar_url") setCalendarUrl(row.value);
        if (row.key === "demo_pos_user") setDemoPosUser(row.value);
        if (row.key === "demo_pos_store") setDemoPosStore(row.value);
        if (row.key === "demo_pos_pass") setDemoPosPass(row.value);
      });
      setDomains((domainsRes.data as Domain[]) || []);
      setLoading(false);
    });
  }, []);

  const handleSaveCalendar = async () => {
    setSavingCalendar(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "google_calendar_url", value: calendarUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("URL de Google Calendar actualizada");
    setSavingCalendar(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "playstore_url", value: playstoreUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("Enlace de Play Store actualizado");
    setSaving(false);
  };

  const handleSaveDemo = async () => {
    setSavingDemo(true);
    const now = new Date().toISOString();
    const rows = [
      { key: "demo_pos_user", value: demoPosUser, updated_at: now },
      { key: "demo_pos_store", value: demoPosStore, updated_at: now },
      { key: "demo_pos_pass", value: demoPosPass, updated_at: now },
    ];
    const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("Credenciales demo actualizadas");
    setSavingDemo(false);
  };

  // Domain CRUD using approved_email_domains table
  const addDomain = async () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || !d.includes(".")) {
      toast.error("Dominio inválido. Ejemplo: ventas.click");
      return;
    }
    setSavingDomain(true);
    const { error } = await supabase.from("approved_email_domains").insert({ domain: d, sort_order: domains.length });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Dominio ya existe" : "Error: " + error.message);
    } else {
      setNewDomain("");
      toast.success("Dominio agregado");
      loadDomains();
    }
    setSavingDomain(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("approved_email_domains").update({ is_active: active }).eq("id", id);
    loadDomains();
  };

  const setDefault = async (id: string) => {
    await supabase.from("approved_email_domains").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("approved_email_domains").update({ is_default: true }).eq("id", id);
    toast.success("Dominio predeterminado actualizado");
    loadDomains();
  };

  const deleteDomain = async (id: string) => {
    await supabase.from("approved_email_domains").delete().eq("id", id);
    toast.success("Dominio eliminado");
    loadDomains();
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Demo POS Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Credenciales Demo POS
          </CardTitle>
          <CardDescription>
            Credenciales que se usan en la sección "Probar Demo en Vivo" del inicio. Cámbialas si el acceso demo cambia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-user">Usuario</Label>
              <Input id="demo-user" value={demoPosUser} onChange={(e) => setDemoPosUser(e.target.value)} placeholder="demo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-store">Empresa</Label>
              <Input id="demo-store" value={demoPosStore} onChange={(e) => setDemoPosStore(e.target.value)} placeholder="demo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-pass">Contraseña</Label>
              <Input id="demo-pass" value={demoPosPass} onChange={(e) => setDemoPosPass(e.target.value)} placeholder="demo" />
            </div>
          </div>
          <Button onClick={handleSaveDemo} disabled={savingDemo} className="gap-2">
            {savingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar credenciales demo
          </Button>
        </CardContent>
      </Card>

      {/* Unified Domain Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Dominios Aprobados
          </CardTitle>
          <CardDescription>
            Dominios permitidos para asignar correos a demos y para que socios creen licencias. Ejemplo: ventas.click, sistecpos.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add domain */}
          <div className="flex gap-2 max-w-md">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Ej: ventas.click"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
            />
            <Button onClick={addDomain} disabled={savingDomain} size="sm" className="gap-1">
              {savingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Agregar
            </Button>
          </div>

          {/* Domain list */}
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">Sin dominios configurados — los socios no podrán crear licencias y no se asignarán correos a demos.</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">@{d.domain}</span>
                    {d.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3" /> Predeterminado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={d.is_active} onCheckedChange={(v) => toggleActive(d.id, v)} />
                    {!d.is_default && (
                      <Button variant="ghost" size="sm" onClick={() => setDefault(d.id)} title="Establecer predeterminado">
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteDomain(d.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar — Agenda de Citas
          </CardTitle>
          <CardDescription>
            URL de Google Calendar Appointment Scheduling. Se usará en el embudo de socios para agendar llamadas de calificación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-url">URL de Agenda</Label>
            <Input
              id="calendar-url"
              type="url"
              placeholder="https://calendar.google.com/calendar/appointments/..."
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveCalendar} disabled={savingCalendar} className="gap-2">
            {savingCalendar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar URL de Agenda
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zM14.852 13.06l2.341 2.342-8.19 4.651 5.849-6.993zm3.558-3.413l2.174 1.234a1 1 0 0 1 0 1.74l-2.174 1.233-2.594-2.106 2.594-2.101zM9.003 3.947l8.19 4.651-2.341 2.342-5.849-6.993z" />
            </svg>
            Enlace de Google Play Store
          </CardTitle>
          <CardDescription>
            Configura la URL de descarga de la app en Play Store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playstore-url">URL de Play Store</Label>
            <Input
              id="playstore-url"
              type="url"
              placeholder="https://play.google.com/store/apps/details?id=..."
              value={playstoreUrl}
              onChange={(e) => setPlaystoreUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

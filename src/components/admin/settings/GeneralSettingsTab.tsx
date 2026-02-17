import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Monitor, Globe, Plus, X, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GeneralSettingsTab() {
  const [playstoreUrl, setPlaystoreUrl] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [demoPosUser, setDemoPosUser] = useState("");
  const [demoPosStore, setDemoPosStore] = useState("");
  const [demoPosPass, setDemoPosPass] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDemo, setSavingDemo] = useState(false);
  const [savingDomains, setSavingDomains] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["playstore_url", "demo_pos_user", "demo_pos_store", "demo_pos_pass", "allowed_license_domains", "google_calendar_url"])
      .then(({ data }) => {
        (data || []).forEach((row) => {
          if (row.key === "playstore_url") setPlaystoreUrl(row.value);
          if (row.key === "google_calendar_url") setCalendarUrl(row.value);
          if (row.key === "demo_pos_user") setDemoPosUser(row.value);
          if (row.key === "demo_pos_store") setDemoPosStore(row.value);
          if (row.key === "demo_pos_pass") setDemoPosPass(row.value);
          if (row.key === "allowed_license_domains") {
            setDomains(row.value ? row.value.split(",").map((d: string) => d.trim()).filter(Boolean) : []);
          }
        });
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

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Enlace de Play Store actualizado");
    }
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
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Credenciales demo actualizadas");
    }
    setSavingDemo(false);
  };

  const addDomain = () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || domains.includes(d)) return;
    if (!d.includes(".")) {
      toast.error("Dominio inválido. Ejemplo: ventas.click");
      return;
    }
    setDomains([...domains, d]);
    setNewDomain("");
  };

  const removeDomain = (d: string) => setDomains(domains.filter((x) => x !== d));

  const handleSaveDomains = async () => {
    setSavingDomains(true);
    const { error } = await supabase.from("app_settings").upsert(
      { key: "allowed_license_domains", value: domains.join(","), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Dominios permitidos actualizados");
    }
    setSavingDomains(false);
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

      {/* Allowed Domains for Reseller Licenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Dominios Permitidos para Licencias
          </CardTitle>
          <CardDescription>
            Los socios solo pueden crear licencias con emails que usen estos dominios. Ejemplo: ventas.click, sistecpos.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin dominios configurados — los socios no podrán crear licencias.</p>
            ) : (
              domains.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 text-sm px-3 py-1.5">
                  @{d}
                  <button onClick={() => removeDomain(d)} className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="nuevo-dominio.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={addDomain} disabled={!newDomain.trim()}>
              <Plus className="h-4 w-4 mr-1" />Agregar
            </Button>
          </div>
          <Button onClick={handleSaveDomains} disabled={savingDomains} className="gap-2">
            {savingDomains ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar dominios
          </Button>
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
            Crea una página de citas en Google Calendar y pega aquí la URL pública.
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
            Configura la URL de descarga de la app en Play Store. Se usará en la sección de demo del inicio.
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Code2, Plus, Pencil, Trash2, Eye, EyeOff, BarChart3,
  Tag, Facebook, Chrome,
} from "lucide-react";

interface TrackingScript {
  id: string;
  name: string;
  script_type: string;
  placement: string;
  code: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

const scriptTypeConfig: Record<string, { label: string; icon: typeof Code2; color: string }> = {
  google_analytics: { label: "Google Analytics", icon: BarChart3, color: "bg-orange-500/10 text-orange-700" },
  gtm: { label: "Google Tag Manager", icon: Tag, color: "bg-blue-500/10 text-blue-700" },
  facebook_pixel: { label: "Facebook Pixel", icon: Facebook, color: "bg-indigo-500/10 text-indigo-700" },
  custom: { label: "Código Personalizado", icon: Code2, color: "bg-purple-500/10 text-purple-700" },
};

const placementLabels: Record<string, string> = {
  head: "Header (<head>)",
  body_start: "Body (inicio)",
  body_end: "Body (final / footer)",
};

export default function TrackingView() {
  const [scripts, setScripts] = useState<TrackingScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrackingScript | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tracking_scripts")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setScripts((data as TrackingScript[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("tracking_scripts").update({ is_enabled: !current }).eq("id", id);
    setScripts((prev) => prev.map((s) => (s.id === id ? { ...s, is_enabled: !current } : s)));
  };

  const deleteScript = async (id: string) => {
    if (!confirm("¿Eliminar este script de tracking?")) return;
    await supabase.from("tracking_scripts").delete().eq("id", id);
    setScripts((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Script eliminado" });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Code2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-display">Tracking & Analítica</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona scripts de Google Analytics, Tag Manager, Facebook Pixel y código personalizado
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {scripts.filter((s) => s.is_enabled).length} activos / {scripts.length} total
        </Badge>
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) handleFormClose(); else setShowForm(true); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Script" : "Nuevo Script de Tracking"}</DialogTitle>
            </DialogHeader>
            <TrackingScriptForm entry={editing} onSuccess={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick-add templates */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(scriptTypeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
      ) : scripts.length === 0 ? (
        <div className="py-12 text-center">
          <Code2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hay scripts de tracking configurados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Agrega Google Analytics, Tag Manager o Facebook Pixel para medir tus campañas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {scripts.map((s) => {
            const cfg = scriptTypeConfig[s.script_type] || scriptTypeConfig.custom;
            const Icon = cfg.icon;
            return (
              <div
                key={s.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                  s.is_enabled ? "bg-card" : "bg-muted/30 opacity-60"
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {placementLabels[s.placement] || s.placement}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono line-clamp-1">{s.code.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={s.is_enabled} onCheckedChange={() => toggleActive(s.id, s.is_enabled)} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(s); setShowForm(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteScript(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrackingScriptForm({ entry, onSuccess }: { entry: TrackingScript | null; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: entry?.name || "",
    script_type: entry?.script_type || "custom",
    placement: entry?.placement || "head",
    code: entry?.code || "",
    is_enabled: entry?.is_enabled ?? true,
    sort_order: entry?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Template helper
  const applyTemplate = (type: string) => {
    const templates: Record<string, { name: string; code: string; placement: string }> = {
      google_analytics: {
        name: "Google Analytics 4",
        code: `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX');\n</script>`,
        placement: "head",
      },
      gtm: {
        name: "Google Tag Manager",
        code: `<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>\n<!-- End Google Tag Manager -->`,
        placement: "head",
      },
      facebook_pixel: {
        name: "Facebook Pixel",
        code: `<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', 'XXXXXXXXXXXXXXX');\nfbq('track', 'PageView');\n</script>`,
        placement: "head",
      },
    };

    if (templates[type]) {
      setForm((p) => ({
        ...p,
        script_type: type,
        name: templates[type].name,
        code: templates[type].code,
        placement: templates[type].placement,
      }));
    }
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name,
      script_type: form.script_type,
      placement: form.placement,
      code: form.code,
      is_enabled: form.is_enabled,
      sort_order: form.sort_order,
    };

    const { error } = entry
      ? await supabase.from("tracking_scripts").update(payload).eq("id", entry.id)
      : await supabase.from("tracking_scripts").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: entry ? "Script actualizado" : "Script creado" });
      onSuccess();
    }
  };

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handle} className="space-y-4">
      {/* Quick templates */}
      {!entry && (
        <div>
          <Label className="text-xs mb-1.5 block">Plantilla rápida</Label>
          <div className="flex gap-2">
            {(["google_analytics", "gtm", "facebook_pixel"] as const).map((t) => {
              const cfg = scriptTypeConfig[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-muted/50 ${
                    form.script_type === t ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <cfg.icon className="h-3.5 w-3.5" /> {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={form.script_type} onValueChange={(v) => set("script_type", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="google_analytics">Google Analytics</SelectItem>
              <SelectItem value="gtm">Tag Manager</SelectItem>
              <SelectItem value="facebook_pixel">Facebook Pixel</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Ubicación</Label>
          <Select value={form.placement} onValueChange={(v) => set("placement", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="head">Header (&lt;head&gt;)</SelectItem>
              <SelectItem value="body_start">Body (inicio)</SelectItem>
              <SelectItem value="body_end">Body (final)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Orden</Label>
          <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className="h-9" />
        </div>
      </div>

      <div>
        <Label className="text-xs">Nombre del script *</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="h-9" placeholder="Ej: Google Analytics 4 - Producción" />
      </div>

      <div>
        <Label className="text-xs">Código (HTML/JavaScript) *</Label>
        <Textarea
          value={form.code}
          onChange={(e) => set("code", e.target.value)}
          required
          rows={8}
          className="font-mono text-xs"
          placeholder="Pega aquí el código de tracking..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_enabled} onCheckedChange={(v) => set("is_enabled", v)} />
          <Label className="text-xs">Activo</Label>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : entry ? "Actualizar" : "Crear Script"}</Button>
      </div>
    </form>
  );
}

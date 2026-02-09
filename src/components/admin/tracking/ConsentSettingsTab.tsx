import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save } from "lucide-react";

interface ConsentSettings {
  consent_banner_title: string;
  consent_banner_description: string;
  consent_btn_accept_all: string;
  consent_btn_analytics_only: string;
  consent_btn_reject: string;
  consent_analytics_enabled: string;
  consent_ads_enabled: string;
}

const DEFAULTS: ConsentSettings = {
  consent_banner_title: "Usamos cookies para mejorar tu experiencia",
  consent_banner_description:
    "Utilizamos cookies propias y de terceros (Google Analytics, Google Ads) para analizar el uso del sitio y personalizar contenido. Puedes aceptar todas, solo las necesarias o rechazarlas.",
  consent_btn_accept_all: "Aceptar todo",
  consent_btn_analytics_only: "Solo analítica",
  consent_btn_reject: "Rechazar",
  consent_analytics_enabled: "true",
  consent_ads_enabled: "true",
};

const KEYS = Object.keys(DEFAULTS) as (keyof ConsentSettings)[];

export default function ConsentSettingsTab() {
  const [form, setForm] = useState<ConsentSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", KEYS);

      if (data && data.length > 0) {
        const merged = { ...DEFAULTS };
        data.forEach((row) => {
          if (row.key in merged) {
            (merged as any)[row.key] = row.value;
          }
        });
        setForm(merged);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const upserts = KEYS.map((key) => ({
      key,
      value: form[key],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("app_settings").upsert(upserts, { onConflict: "key" });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuración de consentimiento guardada" });
    }
  };

  const set = (k: keyof ConsentSettings, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Cargando configuración…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-display">Banner de Consentimiento (Consent Mode v2)</h2>
      </div>

      {/* Categories */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium text-sm">Categorías de consentimiento</h3>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Analítica (analytics_storage)</Label>
            <p className="text-xs text-muted-foreground">Google Analytics, medición de tráfico</p>
          </div>
          <Switch
            checked={form.consent_analytics_enabled === "true"}
            onCheckedChange={(v) => set("consent_analytics_enabled", v ? "true" : "false")}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Publicidad (ad_storage, ad_user_data, ad_personalization)</Label>
            <p className="text-xs text-muted-foreground">Google Ads, Facebook Pixel, remarketing</p>
          </div>
          <Switch
            checked={form.consent_ads_enabled === "true"}
            onCheckedChange={(v) => set("consent_ads_enabled", v ? "true" : "false")}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Si desactivas una categoría, el botón correspondiente no aparecerá en el banner y esas cookies nunca se activarán.
        </p>
      </div>

      {/* Text customization */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium text-sm">Textos del banner</h3>
        <div>
          <Label className="text-xs">Título</Label>
          <Input value={form.consent_banner_title} onChange={(e) => set("consent_banner_title", e.target.value)} className="h-9" />
        </div>
        <div>
          <Label className="text-xs">Descripción</Label>
          <Textarea
            value={form.consent_banner_description}
            onChange={(e) => set("consent_banner_description", e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Botón "Aceptar todo"</Label>
            <Input value={form.consent_btn_accept_all} onChange={(e) => set("consent_btn_accept_all", e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Botón "Solo analítica"</Label>
            <Input value={form.consent_btn_analytics_only} onChange={(e) => set("consent_btn_analytics_only", e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Botón "Rechazar"</Label>
            <Input value={form.consent_btn_reject} onChange={(e) => set("consent_btn_reject", e.target.value)} className="h-9" />
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        <Save className="h-4 w-4 mr-1.5" />
        {saving ? "Guardando…" : "Guardar configuración"}
      </Button>
    </div>
  );
}

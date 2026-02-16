import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageCircle, Save, Headphones, ShoppingCart } from "lucide-react";

export default function WhatsAppSettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    main_number: "573176268307",
    welcome_message: "Hola, quiero información sobre SistecPOS",
    support_number: "573176268307",
    support_message: "Hola, necesito soporte técnico de SistecPOS",
    sales_number: "573176268307",
    sales_message: "Hola, quiero información comercial sobre SistecPOS",
    is_enabled: true,
    schedule_start: "08:00",
    schedule_end: "18:00",
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["site_settings", "whatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("setting_group", "whatsapp");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const get = (key: string, fallback: string) => {
        const s = settings.find((s: any) => s.setting_key === key);
        if (!s) return fallback;
        const v = s.setting_value;
        if (typeof v === "string") return v.replace(/^"|"$/g, "");
        return String(v);
      };
      const schedule = settings.find((s: any) => s.setting_key === "schedule");
      const scheduleVal = schedule?.setting_value as any;
      setForm({
        main_number: get("main_number", "573176268307"),
        welcome_message: get("welcome_message", "Hola, quiero información sobre SistecPOS"),
        support_number: get("support_number", get("main_number", "573176268307")),
        support_message: get("support_message", "Hola, necesito soporte técnico de SistecPOS"),
        sales_number: get("sales_number", get("main_number", "573176268307")),
        sales_message: get("sales_message", "Hola, quiero información comercial sobre SistecPOS"),
        is_enabled: get("is_enabled", "true") === "true",
        schedule_start: scheduleVal?.start || "08:00",
        schedule_end: scheduleVal?.end || "18:00",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const upserts = [
        { setting_group: "whatsapp", setting_key: "main_number", setting_value: JSON.stringify(form.main_number) },
        { setting_group: "whatsapp", setting_key: "welcome_message", setting_value: JSON.stringify(form.welcome_message) },
        { setting_group: "whatsapp", setting_key: "support_number", setting_value: JSON.stringify(form.support_number) },
        { setting_group: "whatsapp", setting_key: "support_message", setting_value: JSON.stringify(form.support_message) },
        { setting_group: "whatsapp", setting_key: "sales_number", setting_value: JSON.stringify(form.sales_number) },
        { setting_group: "whatsapp", setting_key: "sales_message", setting_value: JSON.stringify(form.sales_message) },
        { setting_group: "whatsapp", setting_key: "is_enabled", setting_value: JSON.stringify(form.is_enabled) },
        { setting_group: "whatsapp", setting_key: "schedule", setting_value: { start: form.schedule_start, end: form.schedule_end, timezone: "America/Bogota" } },
      ];
      for (const u of upserts) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(u as any, { onConflict: "setting_group,setting_key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Configuración de WhatsApp guardada");
      queryClient.invalidateQueries({ queryKey: ["site_settings", "whatsapp"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-500" />
          Configuración de WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Switch checked={form.is_enabled} onCheckedChange={v => setForm(f => ({ ...f, is_enabled: v }))} />
          <Label>WhatsApp habilitado</Label>
        </div>

        {/* Principal / General */}
        <div className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> General (botón flotante, footer, CTAs)
          </h3>
          <div>
            <Label>Número principal (con código de país)</Label>
            <Input value={form.main_number} onChange={e => setForm(f => ({ ...f, main_number: e.target.value }))} placeholder="573176268307" />
          </div>
          <div>
            <Label>Mensaje predeterminado</Label>
            <Input value={form.welcome_message} onChange={e => setForm(f => ({ ...f, welcome_message: e.target.value }))} />
          </div>
        </div>

        {/* Soporte */}
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/30 p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-700">
            <Headphones className="h-4 w-4" /> Soporte Técnico
          </h3>
          <div>
            <Label>Número de soporte</Label>
            <Input value={form.support_number} onChange={e => setForm(f => ({ ...f, support_number: e.target.value }))} placeholder="573176268307" />
          </div>
          <div>
            <Label>Mensaje de soporte</Label>
            <Input value={form.support_message} onChange={e => setForm(f => ({ ...f, support_message: e.target.value }))} />
          </div>
        </div>

        {/* Ventas */}
        <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50/30 p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-orange-700">
            <ShoppingCart className="h-4 w-4" /> Ventas / Comercial
          </h3>
          <div>
            <Label>Número de ventas</Label>
            <Input value={form.sales_number} onChange={e => setForm(f => ({ ...f, sales_number: e.target.value }))} placeholder="573176268307" />
          </div>
          <div>
            <Label>Mensaje de ventas</Label>
            <Input value={form.sales_message} onChange={e => setForm(f => ({ ...f, sales_message: e.target.value }))} />
          </div>
        </div>

        {/* Horario */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Horario inicio</Label>
            <Input type="time" value={form.schedule_start} onChange={e => setForm(f => ({ ...f, schedule_start: e.target.value }))} />
          </div>
          <div>
            <Label>Horario fin</Label>
            <Input type="time" value={form.schedule_end} onChange={e => setForm(f => ({ ...f, schedule_end: e.target.value }))} />
          </div>
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />{saveMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </CardContent>
    </Card>
  );
}

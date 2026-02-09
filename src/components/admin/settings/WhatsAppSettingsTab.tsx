import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageCircle, Save } from "lucide-react";

export default function WhatsAppSettingsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    main_number: "573176268307",
    welcome_message: "Hola, quiero información sobre SistecPOS",
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
      const get = (key: string) => {
        const s = settings.find((s: any) => s.setting_key === key);
        return s ? (typeof s.setting_value === "string" ? s.setting_value : JSON.stringify(s.setting_value)) : "";
      };
      const schedule = settings.find((s: any) => s.setting_key === "schedule");
      const scheduleVal = schedule?.setting_value as any;
      setForm({
        main_number: get("main_number").replace(/"/g, ""),
        welcome_message: get("welcome_message").replace(/"/g, ""),
        is_enabled: get("is_enabled") === "true",
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
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={form.is_enabled} onCheckedChange={v => setForm(f => ({ ...f, is_enabled: v }))} />
          <Label>WhatsApp habilitado</Label>
        </div>
        <div>
          <Label>Número principal (con código de país)</Label>
          <Input value={form.main_number} onChange={e => setForm(f => ({ ...f, main_number: e.target.value }))} placeholder="573176268307" />
        </div>
        <div>
          <Label>Mensaje de bienvenida</Label>
          <Input value={form.welcome_message} onChange={e => setForm(f => ({ ...f, welcome_message: e.target.value }))} />
        </div>
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, Wand2, Thermometer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PROMPT = `Eres el asistente virtual de SistecPOS, software POS colombiano. Ayuda a los visitantes con información sobre planes, precios, facturación electrónica y soporte técnico. Sé amable, conciso y profesional. Si el usuario muestra interés, captura su nombre, correo y teléfono.`;

export default function PromptStudioTab() {
  const [prompt, setPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [temperature, setTemperature] = useState(0);
  const [originalTemp, setOriginalTemp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["chatbot_system_prompt", "chatbot_temperature"]);

      const promptVal = data?.find((d) => d.key === "chatbot_system_prompt")?.value || DEFAULT_PROMPT;
      const tempVal = parseFloat(data?.find((d) => d.key === "chatbot_temperature")?.value || "0");
      setPrompt(promptVal);
      setOriginal(promptVal);
      setTemperature(tempVal);
      setOriginalTemp(tempVal);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const ops = [
      supabase.from("app_settings").upsert({ key: "chatbot_system_prompt", value: prompt }),
      supabase.from("app_settings").upsert({ key: "chatbot_temperature", value: String(temperature) }),
    ];
    const results = await Promise.all(ops);
    setSaving(false);
    const err = results.find((r) => r.error);
    if (err?.error) {
      toast({ title: "Error al guardar", description: err.error.message, variant: "destructive" });
    } else {
      setOriginal(prompt);
      setOriginalTemp(temperature);
      toast({ title: "Configuración guardada", description: "Se aplicará en la siguiente conversación del chatbot." });
    }
  };

  const reset = () => {
    setPrompt(DEFAULT_PROMPT);
    setTemperature(0);
  };

  const hasChanges = prompt !== original || temperature !== originalTemp;
  const charCount = prompt.length;

  const tempLabel = temperature === 0
    ? "Determinista (fiel a la KB)"
    : temperature <= 0.3
    ? "Muy preciso"
    : temperature <= 0.7
    ? "Balanceado"
    : temperature <= 1.2
    ? "Creativo"
    : "Muy creativo (riesgo de alucinar)";

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              System Prompt del Chatbot
            </CardTitle>
            <span className="text-xs text-muted-foreground">{charCount} caracteres</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Este prompt define la personalidad y comportamiento del chatbot. Los cambios se aplican inmediatamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            className="font-mono text-xs leading-relaxed"
            placeholder="Escribe el system prompt..."
          />
        </CardContent>
      </Card>

      {/* Temperature Control */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              Control de Temperatura IA
            </CardTitle>
            <Badge variant={temperature === 0 ? "default" : temperature <= 0.5 ? "secondary" : "destructive"} className="text-xs">
              {temperature.toFixed(1)} — {tempLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Controla la creatividad vs precisión de las respuestas. 0 = respuestas exactas según la base de conocimiento.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(Math.round(v * 10) / 10)}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0 — Determinista</span>
              <span>0.5 — Preciso</span>
              <span>1.0 — Balanceado</span>
              <span>1.5 — Creativo</span>
              <span>2.0 — Máx</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer todo
        </Button>
        <Button size="sm" onClick={save} disabled={saving || !hasChanges} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tips para un buen prompt</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5">
          <p>• Define claramente el rol y personalidad del asistente</p>
          <p>• Especifica qué temas puede y no puede responder</p>
          <p>• Incluye instrucciones para captura de leads (nombre, email, teléfono)</p>
          <p>• Usa el formato [LEAD_DATA:nombre|email|teléfono] para captura automática</p>
          <p>• Mantén el prompt bajo 2000 caracteres para mejor rendimiento</p>
          <p>• <strong>Temperatura 0</strong> = respuestas fieles a la base de conocimiento (recomendado para ventas)</p>
          <p>• <strong>Temperatura &gt;1</strong> = más creativo pero puede inventar datos (no recomendado)</p>
        </CardContent>
      </Card>
    </div>
  );
}

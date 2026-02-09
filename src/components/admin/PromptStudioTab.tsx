import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_PROMPT = `Eres el asistente virtual de SistecPOS, software POS colombiano. Ayuda a los visitantes con información sobre planes, precios, facturación electrónica y soporte técnico. Sé amable, conciso y profesional. Si el usuario muestra interés, captura su nombre, correo y teléfono.`;

export default function PromptStudioTab() {
  const [prompt, setPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "chatbot_system_prompt")
        .maybeSingle();
      const val = data?.value || DEFAULT_PROMPT;
      setPrompt(val);
      setOriginal(val);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "chatbot_system_prompt", value: prompt });
    setSaving(false);
    if (error) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } else {
      setOriginal(prompt);
      toast({ title: "Prompt guardado", description: "Se aplicará en la siguiente conversación del chatbot." });
    }
  };

  const reset = () => {
    setPrompt(DEFAULT_PROMPT);
  };

  const hasChanges = prompt !== original;
  const charCount = prompt.length;

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

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
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer
            </Button>
            <Button size="sm" onClick={save} disabled={saving || !hasChanges} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar Prompt"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tips para un buen prompt</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5">
          <p>• Define claramente el rol y personalidad del asistente</p>
          <p>• Especifica qué temas puede y no puede responder</p>
          <p>• Incluye instrucciones para captura de leads (nombre, email, teléfono)</p>
          <p>• Usa el formato [LEAD_DATA:nombre|email|teléfono] para que el sistema capture automáticamente</p>
          <p>• Mantén el prompt bajo 2000 caracteres para mejor rendimiento</p>
        </CardContent>
      </Card>
    </div>
  );
}

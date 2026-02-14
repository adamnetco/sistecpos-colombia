import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function SyncPOSSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("connect-pos");

      if (error) throw error;

      setStatus("success");
      setMessage(data?.message || "Sincronización exitosa");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al conectar con el POS");
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Sincronizar POS
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Conecta con el software POS externo de forma segura. Las credenciales nunca se exponen en el frontend.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSync} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Conectando…</>
          ) : (
            <><RefreshCw className="h-4 w-4" /> Sincronizar POS</>
          )}
        </Button>

        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export function ConnectPOSSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnect = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("connect-pos");
      if (error) throw error;

      setStatus("success");
      // Redirigir al POS después de autenticar
      setTimeout(() => {
        window.open("https://softwarepos.online", "_blank");
      }, 800);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo conectar con el POS");
    }
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center space-y-6"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Acceso Directo
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ingresa a tu Software POS
          </h2>
          <p className="text-muted-foreground text-lg">
            Conéctate de forma segura a tu panel de administración en SoftwarePOS.online.
            Tus credenciales están protegidas en el servidor y nunca se exponen en el navegador.
          </p>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleConnect}
              disabled={status === "loading"}
              className="gap-2 text-base px-8"
            >
              {status === "loading" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Conectando…</>
              ) : (
                <><ExternalLink className="h-5 w-5" /> Abrir mi POS</>
              )}
            </Button>

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Autenticado correctamente — redirigiendo…</span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <XCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, Loader2, XCircle, Smartphone, Info } from "lucide-react";
import { motion } from "framer-motion";

export function ConnectPOSSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenDemo = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await supabase.functions.invoke("connect-pos");
      if (error) throw error;

      window.open("https://softwarepos.online/index.php/login/index/1", "_blank");
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo conectar con la demo");
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
            Prueba Gratis
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Prueba el Software POS en Vivo
          </h2>
          <p className="text-muted-foreground text-lg">
            Explora todas las funcionalidades de SistecPOS con nuestra demo interactiva.
            Sin registro, sin compromisos — accede al instante.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                onClick={handleOpenDemo}
                disabled={status === "loading"}
                className="gap-2 text-base px-8"
              >
                {status === "loading" ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Abriendo demo…</>
                ) : (
                  <><Monitor className="h-5 w-5" /> Probar Demo en Vivo</>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8"
                asChild
              >
                <a
                  href="https://play.google.com/store/apps/details?id=com.sistecpos.pos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Smartphone className="h-5 w-5" />
                  Descargar en Play Store
                </a>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 rounded-lg bg-accent/50 px-4 py-2.5 text-sm text-muted-foreground"
            >
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <span>Al abrir la demo, haz clic en el <strong className="text-foreground">botón azul "Iniciar Sesión"</strong> para entrar directamente.</span>
            </motion.div>

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

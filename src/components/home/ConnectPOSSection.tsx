import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, Loader2, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { usePageContent, getContent } from "@/hooks/usePageContent";

const GooglePlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zM14.852 13.06l2.341 2.342-8.19 4.651 5.849-6.993zm3.558-3.413l2.174 1.234a1 1 0 0 1 0 1.74l-2.174 1.233-2.594-2.106 2.594-2.101zM9.003 3.947l8.19 4.651-2.341 2.342-5.849-6.993z" />
  </svg>
);

export function ConnectPOSSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [playstoreUrl, setPlaystoreUrl] = useState("https://play.google.com/store/apps/details?id=online.softwarepospro");

  const { data: blocks } = usePageContent("/");
  const badge = getContent(blocks, "connectpos_badge", "Prueba Gratis");
  const title = getContent(blocks, "connectpos_title", "Prueba el Software POS en Vivo");
  const subtitle = getContent(blocks, "connectpos_subtitle", "Explora todas las funcionalidades de SistecPOS con nuestra demo interactiva. Sin registro, sin compromisos — accede al instante.");

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "playstore_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setPlaystoreUrl(data.value);
      });
  }, []);

  const [demoCreds, setDemoCreds] = useState({ user: "demo", store: "demo", pass: "demo" });

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["demo_pos_user", "demo_pos_store", "demo_pos_pass"])
      .then(({ data }) => {
        (data || []).forEach((row) => {
          if (row.key === "demo_pos_user") setDemoCreds((p) => ({ ...p, user: row.value }));
          if (row.key === "demo_pos_store") setDemoCreds((p) => ({ ...p, store: row.value }));
          if (row.key === "demo_pos_pass") setDemoCreds((p) => ({ ...p, pass: row.value }));
        });
      });
  }, []);

  const handleOpenDemo = () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://softwarepos.online/index.php/login/index/1";
      form.target = "_blank";
      const fields = { username: demoCreds.user, password: demoCreds.pass, store: demoCreds.store, remember_user: "1" };
      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo conectar con la demo");
    }
  };

  return (
    <section id="probar-demo" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center space-y-6"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {badge}
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          <p className="text-muted-foreground text-lg">{subtitle}</p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" onClick={handleOpenDemo} disabled={status === "loading"} className="gap-2 text-base px-8">
                {status === "loading" ? (<><Loader2 className="h-5 w-5 animate-spin" /> Abriendo demo…</>) : (<><Monitor className="h-5 w-5" /> Probar Demo en Vivo</>)}
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-8" asChild>
                <a href={playstoreUrl} target="_blank" rel="noopener noreferrer">
                  <GooglePlayIcon className="h-5 w-5" />
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-destructive">
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

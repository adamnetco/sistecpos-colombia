import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { usePageContent, getContent, getJsonContent } from "@/hooks/usePageContent";

const defaultComparisonData = [
  { feature: "Soporte", saas: "Solo por chat o ticket", sistecpos: "Vamos a tu negocio" },
  { feature: "Instalación", saas: '"Hazlo tú mismo" con videos', sistecpos: "Te instalamos y configuramos" },
  { feature: "Capacitación", saas: "Videos genéricos en internet", sistecpos: "Capacitación presencial a tu equipo" },
  { feature: "Si algo falla", saas: "Espera días por respuesta", sistecpos: "Respuesta el mismo día" },
  { feature: "Personalización", saas: "Configuración estándar", sistecpos: "Sistema ajustado a tu empresa" },
];

export function ComparisonSection() {
  const { data: blocks } = usePageContent("/");

  const title = getContent(blocks, "comparison_title", '¿Por qué elegir un <span class="gradient-text">proveedor local</span>?');
  const subtitle = getContent(blocks, "comparison_subtitle", "La diferencia entre un software que solo funciona y uno que realmente impulsa tu negocio está en el servicio.");
  const comparisonData = getJsonContent(blocks, "comparison_data", defaultComparisonData);

  return (
    <section className="py-16 md:py-24 bg-background" id="como-funciona">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div></div>
            <div className="rounded-t-lg bg-muted py-3 px-4">
              <span className="text-sm font-semibold text-muted-foreground">SaaS Nacionales</span>
            </div>
            <div className="rounded-t-lg gradient-bg py-3 px-4">
              <span className="text-sm font-semibold text-primary-foreground">SistecPOS</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="rounded-xl border shadow-card overflow-hidden">
            {comparisonData.map((row: any, index: number) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 gap-4 ${index !== comparisonData.length - 1 ? "border-b" : ""}`}
              >
                <div className="py-4 px-4 md:px-6 font-medium bg-muted/30">{row.feature}</div>
                <div className="py-4 px-4 md:px-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <X className="h-4 w-4 text-destructive shrink-0" />
                  <span className="hidden sm:inline">{row.saas}</span>
                </div>
                <div className="py-4 px-4 md:px-6 text-center text-sm bg-primary/5 flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-whatsapp shrink-0" />
                  <span className="font-medium hidden sm:inline">{row.sistecpos}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="mt-6 grid gap-4 sm:hidden">
            {comparisonData.map((row: any) => (
              <div key={row.feature} className="rounded-lg border p-4">
                <div className="font-medium mb-3">{row.feature}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span>{row.saas}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                    <span className="font-medium">{row.sistecpos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

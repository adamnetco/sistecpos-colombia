import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent, getContent } from "@/hooks/usePageContent";

const cities = [
  { name: "Bucaramanga", slug: "bucaramanga", isMain: true },
  { name: "Floridablanca", slug: "floridablanca", isMain: false },
  { name: "Girón", slug: "giron", isMain: false },
  { name: "Piedecuesta", slug: "piedecuesta", isMain: false },
];

export function CoverageSection() {
  const { data: blocks } = usePageContent("/");

  const label = getContent(blocks, "coverage_label", "Zona de Cobertura");
  const title = getContent(blocks, "coverage_title", 'Servicio Presencial en el <span class="gradient-text">Área Metropolitana</span>');
  const footer = getContent(blocks, "coverage_footer", "Instalación y soporte presencial en todo Santander");

  return (
    <section id="cobertura" className="py-16 md:py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
          
          <h2
            className="text-2xl font-bold tracking-tight md:text-3xl mb-8"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {cities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={`/software-pos/${city.slug}`}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all hover:scale-105 hover:shadow-md ${
                    city.isMain
                      ? "gradient-bg text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{city.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-muted-foreground">{footer}</p>
        </motion.div>
      </div>
    </section>
  );
}

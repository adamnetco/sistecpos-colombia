import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const cities = [
  { name: "Bucaramanga", isMain: true },
  { name: "Floridablanca", isMain: false },
  { name: "Girón", isMain: false },
  { name: "Piedecuesta", isMain: false },
];

export function CoverageSection() {
  return (
    <section className="py-16 md:py-20 bg-background">
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
              Zona de Cobertura
            </span>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8">
            Servicio Presencial en el{" "}
            <span className="gradient-text">Área Metropolitana</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {cities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 ${
                  city.isMain
                    ? "gradient-bg text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{city.name}</span>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-muted-foreground">
            Instalación y soporte presencial en todo Santander
          </p>
        </motion.div>
      </div>
    </section>
  );
}

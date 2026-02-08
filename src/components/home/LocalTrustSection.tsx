import { motion } from "framer-motion";
import { MapPin, MessageCircle, UserCheck, ShieldCheck } from "lucide-react";

const trustPoints = [
  {
    icon: MapPin,
    title: "Soporte Presencial en Santander",
    description:
      "Vamos directamente a tu negocio. Instalación, configuración y capacitación en sitio.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Directo con Soporte",
    description:
      "Sin IVR, sin menús, sin esperas. Hablas directo con nuestro equipo técnico real.",
  },
  {
    icon: UserCheck,
    title: "Sin Call Centers Robóticos",
    description:
      "Soporte humano que conoce tu negocio. No te pasan de agente en agente.",
  },
  {
    icon: ShieldCheck,
    title: "Soporte Remoto 24/7 en Colombia",
    description:
      "Para el resto del país, instalación remota asistida el mismo día con soporte continuo.",
  },
];

const trustedBusinesses = [
  { name: "Droguería San Ángel", type: "Droguería" },
  { name: "Ferretería Mejía", type: "Ferretería" },
  { name: "Tienda Doña Carmen", type: "Minimercado" },
  { name: "Café La Esquina", type: "Cafetería" },
  { name: "Calzado Valentina", type: "Moda" },
  { name: "Centro Óptico Ramírez", type: "Óptica" },
];

export function LocalTrustSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/50" aria-labelledby="soporte-local">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            id="soporte-local"
            className="text-3xl font-bold md:text-4xl"
          >
            Soporte Local Real
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            No somos un Call Center internacional. Somos un equipo local que va
            a tu negocio y te resuelve en persona.
          </p>
        </motion.div>

        {/* Trust Points */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card p-6 text-center shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <point.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {point.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trusted Businesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Negocios que confían en nosotros
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {trustedBusinesses.map((biz) => (
              <div
                key={biz.name}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-whatsapp" />
                <span className="font-medium text-foreground">{biz.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({biz.type})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

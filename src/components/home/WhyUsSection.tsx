import { motion } from "framer-motion";
import { Home, UserCheck, Phone, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Home,
    title: "Instalación Presencial",
    description: "Vamos a tu negocio. No te dejamos solo con un manual.",
  },
  {
    icon: UserCheck,
    title: "Implementador Experto",
    description: "Eduardo Tobacia, años de experiencia en el sector.",
  },
  {
    icon: Phone,
    title: "Soporte Cercano",
    description: "Respuesta rápida. Estamos en Santander, no en otra ciudad.",
  },
  {
    icon: Package,
    title: "Todo en Uno",
    description: "Software + Hardware + Instalación + Capacitación.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function WhyUsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            ¿Por qué <span className="gradient-text">SistecPOS</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            No solo vendemos software. Acompañamos tu negocio desde el primer día.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} variants={itemVariants}>
              <Card className="h-full border-0 shadow-card hover:shadow-lg transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-bg">
                    <benefit.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ApplicationForm } from "@/components/representantes/ApplicationForm";
import { FAQSection } from "@/components/representantes/FAQSection";
import {
  Handshake,
  TrendingUp,
  ShieldCheck,
  Headset,
  MapPin,
  Rocket,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: DollarSign,
    title: "Comisiones Atractivas",
    description:
      "Gana comisiones competitivas por cada venta cerrada. Sin techo de ingresos — entre más vendas, más ganas.",
  },
  {
    icon: ShieldCheck,
    title: "Nosotros Hacemos el Soporte",
    description:
      "Tú vendes, nosotros nos encargamos de la instalación, capacitación y soporte técnico 24/7. Cero dolores de cabeza.",
  },
  {
    icon: Rocket,
    title: "Producto Probado",
    description:
      "SistecPOS ya tiene clientes satisfechos en +23 ciudades. Vendes un producto con reputación y resultados reales.",
  },
  {
    icon: Headset,
    title: "Capacitación Completa",
    description:
      "Te damos toda la formación comercial y técnica que necesitas para cerrar ventas con confianza desde el día uno.",
  },
  {
    icon: TrendingUp,
    title: "Mercado en Crecimiento",
    description:
      "La facturación electrónica DIAN es obligatoria. Miles de negocios necesitan un POS y tú puedes ser quien se los ofrezca.",
  },
  {
    icon: Users,
    title: "Exclusividad por Zona",
    description:
      "Asegura tu territorio. Asignamos zonas exclusivas para que no compitas con otros representantes de SistecPOS.",
  },
];

const cities = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Santa Marta", "Cúcuta", "Pereira", "Manizales", "Ibagué",
  "Neiva", "Villavicencio", "Pasto", "Armenia", "Montería",
  "Valledupar", "Sincelejo", "Popayán", "Tunja", "Riohacha",
  "Buenaventura", "Soledad", "Soacha", "Bello", "Envigado",
];

const steps = [
  {
    number: "01",
    title: "Postúlate",
    description: "Escríbenos por WhatsApp con tu ciudad y experiencia comercial.",
  },
  {
    number: "02",
    title: "Capacitación",
    description: "Te formamos en el producto, argumentos de venta y manejo de objeciones.",
  },
  {
    number: "03",
    title: "Vende",
    description: "Sal a ofrecer SistecPOS en tu zona. Nosotros cerramos la parte técnica.",
  },
  {
    number: "04",
    title: "Cobra",
    description: "Recibe tu comisión por cada cliente que active el servicio.",
  },
];

const requirements = [
  "Actitud comercial y ganas de generar ingresos",
  "Conocimiento básico de tecnología (no necesitas ser experto)",
  "Disponibilidad para visitar negocios en tu ciudad",
  "Celular con WhatsApp para coordinar con el equipo",
  "Ser mayor de edad y residir en Colombia",
];

export default function RepresentantesPage() {
  return (
    <Layout>
      <SEO
        title="Sé Representante SistecPOS en Tu Ciudad | Gana Comisiones"
        description="Únete como representante comercial de SistecPOS en tu ciudad. Tú vendes, nosotros hacemos el soporte. Comisiones atractivas y exclusividad de zona."
        canonical="/representantes"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-primary-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-whatsapp blur-[100px]" />
        </div>

        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 mb-6">
              <Handshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Programa de Representantes</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Vende SistecPOS en Tu Ciudad.{" "}
              <span className="text-primary">Nosotros Hacemos el Resto.</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
              Conviértete en representante comercial de SistecPOS. Tú te dedicas a vender,
              nosotros nos encargamos de la instalación, capacitación y soporte técnico.{" "}
              <strong className="text-primary-foreground">Sin inversión inicial.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2" asChild>
                <a href="https://wa.me/573176268307?text=Hola%2C%20quiero%20ser%20representante%20de%20SistecPOS%20en%20mi%20ciudad" target="_blank" rel="noopener noreferrer">
                  Quiero Ser Representante
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="#como-funciona">Ver Cómo Funciona</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              ¿Por Qué Ser Representante de{" "}
              <span className="gradient-text">SistecPOS</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un modelo de negocio donde tú ganas y tus clientes también. Sin riesgos, sin inversión, con respaldo total.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Así de Fácil <span className="gradient-text">Funciona</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              En 4 pasos ya estás generando ingresos con SistecPOS.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg text-primary-foreground text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Message */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <ShieldCheck className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tú Vendes. Nosotros Hacemos Todo lo Demás.
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Instalación presencial, configuración del sistema, capacitación al cliente,
              soporte técnico 24/7 y actualizaciones — <strong>todo corre por cuenta de SistecPOS.</strong>{" "}
              Tú solo necesitas conseguir clientes y cobrar tu comisión.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                ¿Qué <span className="gradient-text">Necesitas</span>?
              </h2>
              <p className="text-muted-foreground">
                No pedimos experiencia previa en tecnología. Solo actitud y ganas.
              </p>
            </motion.div>

            <div className="space-y-4">
              {requirements.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-medium">{req}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Zonas Disponibles
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Buscamos Representantes en{" "}
              <span className="gradient-text">Toda Colombia</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Si tu ciudad está en la lista, hay una oportunidad esperándote.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {cities.map((city, index) => (
              <motion.span
                key={city}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="rounded-full bg-background border border-border px-4 py-2 text-sm font-medium hover:border-primary/50 hover:shadow-sm transition-all"
              >
                {city}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-6 text-muted-foreground text-sm"
          >
            ¿Tu ciudad no está? Escríbenos y evaluamos tu zona.
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Application Form */}
      <section id="postularse" className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <ApplicationForm />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-foreground text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para Empezar a Ganar?
            </h2>
            <p className="text-primary-foreground/70 mb-6">
              Completa el formulario arriba o escríbenos directamente por WhatsApp.
            </p>
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2" asChild>
              <a
                href="https://wa.me/573176268307?text=Hola%2C%20quiero%20ser%20representante%20de%20SistecPOS%20en%20mi%20ciudad"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

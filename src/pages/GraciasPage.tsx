import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import {
  CheckCircle, MessageCircle, ArrowRight, Clock, Mail, Zap,
  Monitor, Star, Shield, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const nextSteps = [
  {
    icon: MessageCircle,
    title: "WhatsApp en < 5 min",
    description: "Nuestro equipo te contactará por WhatsApp en menos de 5 minutos para activar tu acceso.",
  },
  {
    icon: Mail,
    title: "Correo de bienvenida",
    description: "Recibirás un correo con tu usuario de acceso y la guía para comenzar.",
  },
  {
    icon: Monitor,
    title: "30 días de acceso completo",
    description: "Acceso a todas las funcionalidades sin restricciones. Sin tarjeta de crédito.",
  },
];

const differentiators = [
  { icon: UserCheck, text: "Soporte humano real, no un chatbot" },
  { icon: Shield, text: "Instalación presencial en tu negocio" },
  { icon: Clock, text: "Respuesta garantizada en menos de 5 min" },
];

const GraciasPage = () => {
  const { buildUrl } = useWhatsAppConfig();
  return (
    <Layout>
      <SEO
        title="¡Gracias! Tu solicitud fue recibida | SistecPOS"
        description="Hemos recibido tu solicitud de demo. Te contactaremos por WhatsApp en los próximos minutos."
        noindex
      />
      <section className="py-16 md:py-28">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-whatsapp/10">
              <CheckCircle className="h-12 w-12 text-whatsapp" />
            </div>

            <h1 className="text-3xl font-bold md:text-5xl" id="titulo">
              ¡Tu solicitud está en camino!
            </h1>

            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Hemos recibido tu información. Nuestro equipo se pondrá en
              contacto contigo <strong className="text-foreground">en menos de 5 minutos</strong>.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-12 max-w-3xl"
          >
            <h2 className="text-center text-xl font-semibold mb-6">
              ¿Qué sigue ahora?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="rounded-xl border bg-card p-5 text-center shadow-soft"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Urgency CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mx-auto mt-12 max-w-lg"
          >
            <div className="rounded-2xl border-2 border-whatsapp/30 bg-whatsapp/5 p-6 md:p-8 text-center">
              <p className="text-lg font-bold text-foreground mb-2">
                ¿No quieres esperar?
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Escríbenos ahora a WhatsApp y te activamos el acceso en tiempo real.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto btn-whatsapp text-base h-14 px-10"
              >
                <a
                  href={buildUrl("Hola, acabo de solicitar una demo y quiero activar mi acceso ya")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-6 w-6" />
                  Activar en WhatsApp Ahora
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Why SistecPOS - Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-12 max-w-2xl"
          >
            <div className="rounded-xl border bg-card p-6 shadow-soft">
              <h3 className="font-bold text-center mb-4">¿Por qué más de 500 negocios nos eligieron?</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {differentiators.map((d) => (
                  <div key={d.text} className="flex items-center gap-2 text-sm">
                    <d.icon className="h-4 w-4 text-whatsapp shrink-0" />
                    <span>{d.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-cta text-cta" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.8/5 — Satisfacción de clientes</span>
              </div>
            </div>
          </motion.div>

          {/* Instant Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mx-auto mt-8 max-w-lg text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">Mientras esperas, puedes explorar el software:</p>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link to="/#probar-demo">
                <Monitor className="h-5 w-5" />
                Probar Demo en Vivo (sin registro)
              </Link>
            </Button>
          </motion.div>

          {/* Secondary action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                Volver al Inicio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default GraciasPage;

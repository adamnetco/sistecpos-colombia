import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import {
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Clock,
  Mail,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const nextSteps = [
  {
    icon: Mail,
    title: "Revisa tu correo",
    description:
      "En los próximos 5 minutos recibirás un correo con tu usuario y clave de acceso.",
  },
  {
    icon: Clock,
    title: "Activación inmediata",
    description:
      "Nuestro equipo configurará tu cuenta y te guiará paso a paso.",
  },
  {
    icon: Zap,
    title: "7 días de acceso completo",
    description:
      "Tendrás acceso a todas las funcionalidades sin restricciones durante la prueba.",
  },
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
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-whatsapp/10">
              <CheckCircle className="h-12 w-12 text-whatsapp" />
            </div>

            <h1 className="text-3xl font-bold md:text-5xl" id="titulo">
              ¡Tu solicitud está en camino!
            </h1>

            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Hemos recibido tu información. Nuestro equipo se pondrá en
              contacto contigo muy pronto.
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
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
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
                Escríbenos ahora a WhatsApp y te activamos el acceso en tiempo
                real.
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

          {/* Secondary action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
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

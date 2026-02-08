import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const GraciasPage = () => {
  return (
    <Layout>
      <SEO
        title="¡Gracias! Tu solicitud fue recibida | SistecPOS"
        description="Hemos recibido tu solicitud de demo. Te contactaremos por WhatsApp en los próximos minutos."
      />
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-whatsapp/10">
              <CheckCircle className="h-10 w-10 text-whatsapp" />
            </div>

            <h1 className="text-3xl font-bold md:text-4xl" id="titulo">
              ¡Solicitud Recibida!
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Nuestro equipo te contactará por WhatsApp en los próximos minutos
              para coordinar tu demo gratuita de 7 días.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
              >
                <a
                  href="https://wa.me/573176268307?text=Hola,%20acabo%20de%20solicitar%20una%20demo%20de%20SistecPOS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Escribir por WhatsApp
                </a>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  Volver al Inicio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default GraciasPage;

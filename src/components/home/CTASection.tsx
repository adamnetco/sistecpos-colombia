import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export function CTASection() {
  const wa = useWhatsAppConfig();

  return (
    <section id="contacto" className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary-hover relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="container relative px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center text-primary-foreground"
        >
          {/* Urgency badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Clock className="h-4 w-4" />
            Prueba gratis — Sin contratos, cancela cuando quieras
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            ¿Listo para vender más y preocuparte menos?
          </h2>
          
          <p className="mt-6 text-lg text-primary-foreground/80 md:text-xl">
            Nuestro sistema es muy amigable, fácil y en pocas horas podrás llevar 
            el control de tu negocio desde internet. Agenda una visita sin compromiso.
          </p>

          {/* Testimonial snippet */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 max-w-lg rounded-xl bg-white/10 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-cta text-cta" />
              ))}
            </div>
            <p className="text-sm italic text-primary-foreground/90">
              "Desde que instalamos SistecPOS, el inventario cuadra y facturamos en segundos. 
              El soporte es real, no un bot."
            </p>
            <p className="mt-2 text-xs font-medium text-primary-foreground/70">
              — Carlos M., Mini Market, Bucaramanga
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-cta hover:bg-cta/90 text-white text-base h-14 px-10 shadow-lg font-bold"
            >
              <a
                href={wa.buildUrl("Hola, quiero agendar una visita para conocer SistecPOS")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Agenda tu Instalación
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 text-base h-14 px-10"
            >
              <a href={wa.telHref}>
                Llámanos Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Respuesta inmediata
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sin compromiso
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Instalación presencial
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

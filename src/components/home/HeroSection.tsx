import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Cloud, Smartphone, Monitor, Laptop, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

export function HeroSection() {
  const wa = useWhatsAppConfig();

  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-20 md:py-28 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cta/30 bg-cta/10 px-4 py-1.5 text-sm font-semibold text-cta"
          >
            <Clock className="h-4 w-4" />
            Prueba gratis 7 días — Sin tarjeta de crédito
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            id="titulo"
          >
            El Software POS que{" "}
            <span className="gradient-text">vende más</span>{" "}
            y factura con la DIAN
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Controla ventas, inventario y reportes desde tu celular, tablet o PC. 
            Funciona con o sin internet. Con instalación y capacitación presencial en Santander.
          </motion.p>

          {/* Device icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Monitor className="h-8 w-8" />
              <span className="text-xs">PC</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Laptop className="h-8 w-8" />
              <span className="text-xs">Laptop</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Smartphone className="h-8 w-8" />
              <span className="text-xs">Celular</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-primary">
              <Cloud className="h-8 w-8" />
              <span className="text-xs font-medium">Nube</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="bg-cta hover:bg-cta/90 text-white text-base h-14 px-10 shadow-lg font-bold"
            >
              <a
                href={wa.buildUrl("Hola, quiero una demostración de SistecPOS")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Quiero Mi Prueba Gratis
              </a>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-base h-14 px-10">
              <a href="#como-funciona">
                Ver Cómo Funciona
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-whatsapp" />
              Facturación DIAN incluida
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-whatsapp" />
              Funciona sin internet
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-whatsapp" />
              Respuesta en &lt;5 min por WhatsApp
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-whatsapp" />
              Instalación presencial incluida
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

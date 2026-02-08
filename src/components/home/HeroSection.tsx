import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Cloud, Smartphone, Monitor, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-20 md:py-28 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp"></span>
            </span>
            Administra tu negocio desde cualquier lugar
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            id="titulo"
          >
            Software POS y Facturación Electrónica DIAN{" "}
            <span className="gradient-text">100% en la Nube</span>
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
              className="bg-whatsapp hover:bg-whatsapp/90 text-white text-base h-12 px-8"
            >
              <a
                href="https://wa.me/573176268307?text=Hola,%20quiero%20una%20demostración%20de%20SistecPOS"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Prueba Gratis
              </a>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
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
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp/10">
                ✓
              </span>
              Multi-dispositivo
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp/10">
                ✓
              </span>
              Funciona sin internet
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-whatsapp/10">
                ✓
              </span>
              3 respaldos diarios
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

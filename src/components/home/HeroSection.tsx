import { motion } from "framer-motion";
import { ArrowRight, Cloud, Smartphone, Monitor, Laptop, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageContent, getContent } from "@/hooks/usePageContent";

export function HeroSection() {
  const { data: blocks } = usePageContent("/");

  const badge = getContent(blocks, "hero_badge", "Prueba gratis 30 días — Sin tarjeta de crédito");
  const title = getContent(blocks, "hero_title", 'El Software POS que <span class="gradient-text">vende más</span> y factura con la DIAN');
  const subtitle = getContent(blocks, "hero_subtitle", "Controla ventas, inventario y reportes desde tu celular, tablet o PC. Funciona con o sin internet. Con instalación y capacitación presencial en Santander.");
  const ctaPrimary = getContent(blocks, "hero_cta_primary", "Quiero Mi Prueba Gratis");
  const ctaSecondary = getContent(blocks, "hero_cta_secondary", "Ver Cómo Funciona");

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
            {badge}
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            id="titulo"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {subtitle}
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
              <Link to="/lp/demo">
                <ArrowRight className="mr-2 h-5 w-5" />
                {ctaPrimary}
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-base h-14 px-10">
              <a href="#como-funciona">
                {ctaSecondary}
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

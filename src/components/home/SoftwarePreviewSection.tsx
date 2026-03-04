import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smartphone, Monitor, Tablet, Cloud, WifiOff, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import softwareDashboard from "@/assets/software-dashboard.png";
import { usePageContent, getContent, getImageContent } from "@/hooks/usePageContent";

const features = [
  { icon: Monitor, label: "PC y Laptop" },
  { icon: Tablet, label: "Tablet" },
  { icon: Smartphone, label: "Celular" },
  { icon: Cloud, label: "100% Nube" },
  { icon: WifiOff, label: "Offline 8 días" },
];

export function SoftwarePreviewSection() {
  const { data: blocks } = usePageContent("/");

  const badge = getContent(blocks, "software_badge", "Software POS en la Nube");
  const title = getContent(blocks, "software_title", 'Administra tu negocio desde <span class="gradient-text">cualquier lugar</span>');
  const subtitle = getContent(blocks, "software_subtitle", "Controla ventas, inventario y reportes desde tu celular, tablet o PC. Funciona con o sin internet gracias a nuestro exclusivo modo offline de hasta 8 días.");
  const ctaPrimary = getContent(blocks, "software_cta_primary", "Solicitar Demo Gratis");
  const videoUrl = getContent(blocks, "software_video_url", "https://youtu.be/ANvJED741nc");
  const dashboardImg = getImageContent(blocks, "software_dashboard_image", softwareDashboard);

  return (
    <section id="software" className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">{badge}</Badge>
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl mb-6"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

            {/* Device Icons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/lp/demo">
                  {ctaPrimary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <Play className="mr-2 h-4 w-4" />
                  Ver Video
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Software Screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <img
                src={dashboardImg.url}
                alt={dashboardImg.alt || "Vista del Software POS SistecPOS"}
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 md:left-8 bg-card border shadow-lg rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-whatsapp/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-whatsapp" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Implementación rápida</p>
                  <p className="text-xs text-muted-foreground">En solo 2 horas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="absolute -top-4 -right-4 md:right-8 bg-card border shadow-lg rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <WifiOff className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Modo Offline</p>
                  <p className="text-xs text-muted-foreground">Hasta 8 días</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

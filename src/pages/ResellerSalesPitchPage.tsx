import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Monitor,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Receipt,
  Package,
  Users,
  Headphones,
  Clock,
  Zap,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const keyFeatures = [
  { icon: Receipt, title: "Facturación Electrónica DIAN", desc: "Cumple con la normativa colombiana. Genera facturas, notas crédito y débito autorizadas por la DIAN." },
  { icon: Package, title: "Inventario en Tiempo Real", desc: "Control de stock, alertas de agotamiento, múltiples bodegas y reportes de rotación." },
  { icon: BarChart3, title: "Reportes y Análisis", desc: "Ventas por producto, vendedor, horario. Gráficos claros para tomar mejores decisiones." },
  { icon: Users, title: "Gestión de Clientes", desc: "Base de datos de clientes, historial de compras, cuentas por cobrar y fidelización." },
  { icon: Monitor, title: "Multi-dispositivo", desc: "Funciona en computador, tablet y celular. El negocio en la palma de la mano." },
  { icon: FileText, title: "Cotizaciones y Pedidos", desc: "Genera cotizaciones profesionales que se convierten en facturas con un clic." },
];

const talkingPoints = [
  {
    title: "El problema",
    text: "Muchos negocios facturan a mano, pierden inventario y no saben cuánto ganan. La DIAN ya exige facturación electrónica.",
    color: "text-destructive",
  },
  {
    title: "Tu solución",
    text: "SistecPOS resuelve todo en un solo software: facturación DIAN, inventario, reportes y control del negocio.",
    color: "text-primary",
  },
  {
    title: "El diferencial",
    text: "Soporte colombiano 24/7, instalación incluida, actualizaciones permanentes. No es un software y ya: es un acompañamiento constante.",
    color: "text-whatsapp",
  },
];

const targetClients = [
  "Tiendas y minimercados",
  "Restaurantes y cafeterías",
  "Ferreterías y pinturas",
  "Papelerías y misceláneas",
  "Droguerías y farmacias",
  "Licorerías y bares",
  "Panaderías y pastelerías",
  "Tiendas de ropa y calzado",
  "Distribuidoras",
  "Talleres y autopartes",
  "Ópticas y salud",
  "Veterinarias y pet shops",
];

export default function ResellerSalesPitchPage() {
  const { buildUrl } = useWhatsAppConfig();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Presentación del Software para Ventas | SistecPOS Socios"
        description="Todo lo que necesitas saber para presentar SistecPOS a tus clientes. Argumentos de venta, funcionalidades clave y tipos de negocio ideales."
      />

      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-7"
          />
          <Button size="sm" className="gradient-bg text-primary-foreground gap-1" asChild>
            <Link to="/socio">Mi Panel <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Smartphone className="h-10 w-10 text-primary mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Guía de <span className="text-primary">Presentación del Software</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Todo lo que necesitas comunicar a tus clientes en palabras simples.
              No necesitas ser técnico, solo transmite estos puntos clave.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Talking Points */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-8">
              El Guión de <span className="text-primary">3 Pasos</span>
            </h2>
            <div className="space-y-6">
              {talkingPoints.map((point, i) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${point.color}`}>{point.title}</h3>
                    <p className="text-muted-foreground">{point.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container px-4">
          <h2 className="text-xl font-bold text-center mb-8">
            Funcionalidades que <span className="text-primary">Venden Solas</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {keyFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full border-border/50">
                  <CardContent className="p-5">
                    <f.icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you say section */}
      <section className="py-12 md:py-16 bg-foreground text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold">Lo que Debes Comunicar</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Instalación y configuración incluida",
                "Soporte técnico 24/7 colombiano",
                "Actualizaciones automáticas sin costo",
                "Capacitación al cliente incluida",
                "Facturación electrónica autorizada DIAN",
                "Funciona sin internet (modo offline)",
                "Reportes de ventas e inventario",
                "Múltiples usuarios y roles",
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Clients */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold">
                Negocios <span className="text-primary">Ideales</span> para Ofrecer SistecPOS
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Estos son los tipos de negocio que más se benefician del software.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {targetClients.map((client) => (
                <span
                  key={client}
                  className="rounded-full bg-secondary border border-border px-4 py-2 text-sm font-medium"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support reminder */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Headphones className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-3">No Estás Solo</h2>
            <p className="text-primary-foreground/80 mb-6">
              Cuentas con soporte en horario de oficina por WhatsApp, llamadas o videollamadas.
              También puedes agendar acompañamiento para presentaciones de cierre con clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 gap-2"
                asChild
              >
                <a
                  href={buildUrl("Hola, soy socio y necesito agendar acompañamiento para una presentación")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Clock className="h-4 w-4" /> Agendar Acompañamiento
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 gap-2"
                asChild
              >
                <Link to="/socio">
                  <Zap className="h-4 w-4" /> Ir al Panel
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-card border-t py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} SistecPOS · Material exclusivo para socios</p>
      </footer>
    </div>
  );
}

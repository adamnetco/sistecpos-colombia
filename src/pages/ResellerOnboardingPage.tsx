import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Ticket,
  Search,
  Video,
  Download,
  MessageSquare,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Monitor,
  Headphones,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const panelSections = [
  {
    icon: Monitor,
    title: "Panel Principal",
    desc: "Tu centro de control. Aquí verás un resumen de tus licencias vendidas, comisiones acumuladas y actividad reciente.",
    path: "/socio",
  },
  {
    icon: BookOpen,
    title: "Licencias",
    desc: "Consulta las licencias que has vendido, su estado, datos del cliente y fecha de vencimiento. Desde aquí también puedes solicitar nuevas activaciones.",
    path: "/socio/licencias",
  },
  {
    icon: Video,
    title: "Entrenamientos",
    desc: "Videos de capacitación organizados por categoría. Desde argumentos de venta hasta configuración del software. Tu centro de autoentrenamiento.",
    path: "/socio/entrenamientos",
  },
  {
    icon: Ticket,
    title: "Tickets de Soporte",
    desc: "¿Tu cliente tiene un problema técnico? Crea un ticket y nuestro equipo lo resuelve. Tú te enfocas en vender, nosotros en el soporte.",
    path: "/socio/tickets",
  },
  {
    icon: DollarSign,
    title: "Comisiones",
    desc: "Revisa el historial de tus pagos, periodos liquidados y montos pendientes. Transparencia total en tu relación comercial.",
    path: "/socio/comisiones",
  },
  {
    icon: Download,
    title: "Descargas",
    desc: "Accede a manuales, guías de venta, presentaciones y material comercial listo para compartir con tus prospectos.",
    path: "/socio/entrenamientos",
  },
];

const tips = [
  {
    icon: Search,
    title: "Búsquedas inteligentes",
    desc: "En cada sección usa el buscador para filtrar por nombre, estado o fecha. Los filtros te ahorran tiempo.",
  },
  {
    icon: MessageSquare,
    title: "ChatBot IA como tu asistente",
    desc: "Haz clic en el ícono de chat (esquina inferior derecha) y pregúntale al ChatBot sobre el software, precios, funcionalidades o procesos. Aprende mientras trabajas.",
  },
  {
    icon: Headphones,
    title: "Soporte directo",
    desc: "Puedes contactarnos por WhatsApp en horario de oficina o agendar videollamadas para acompañamiento en presentaciones de cierre.",
  },
];

export default function ResellerOnboardingPage() {
  const { buildUrl } = useWhatsAppConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-background to-background">
      <SEO
        title="Primeros Pasos en tu Panel de Socios | SistecPOS"
        description="Guía completa para usar tu panel de socios SistecPOS. Aprende a gestionar licencias, entrenamientos, tickets y comisiones."
      />

      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-7"
          />
          <Button size="sm" className="gradient-bg text-primary-foreground gap-1" asChild>
            <Link to="/socio">Ir al Panel <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">¡Tu panel está activo!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Bienvenido a tu <span className="text-primary">Panel de Socios</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Esta guía te enseñará todo lo que necesitas saber para sacarle el máximo provecho
              a las herramientas que tienes disponibles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Panel Sections */}
      <section className="pb-16">
        <div className="container px-4">
          <h2 className="text-xl font-bold text-center mb-8">
            Conoce cada sección de tu <span className="text-primary">Panel</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {panelSections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={s.path} className="gap-1">
                        Explorar <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 bg-secondary/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Lightbulb className="h-8 w-8 text-cta mx-auto mb-3" />
              <h2 className="text-xl font-bold">Tips para Aprovechar al Máximo</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {tips.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border bg-card p-5 text-center"
                >
                  <t.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 md:p-8 text-center">
                <Monitor className="h-10 w-10 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-3">Credenciales de Demostración</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Recibirás por correo tus credenciales demo del software POS para que lo pruebes
                  y puedas hacer demostraciones a tus prospectos con confianza.
                </p>
                <div className="rounded-lg bg-card border p-4 text-left text-sm space-y-2 mb-6">
                  <p><strong>🔗 Acceso:</strong> Se enviará por correo tras tu aprobación</p>
                  <p><strong>📋 Incluye:</strong> Usuario, empresa y contraseña de demostración</p>
                  <p><strong>💡 Tip:</strong> Usa el software durante unos días antes de ofrecer demostraciones</p>
                </div>
                <Button className="gradient-bg text-primary-foreground gap-2" asChild>
                  <Link to="/socio">
                    Ir a Mi Panel <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Commission details */}
      <section className="py-16 bg-foreground text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <DollarSign className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Zona de Comisiones</h2>
            <p className="text-primary-foreground/70 mb-6 max-w-xl mx-auto">
              La comisión base por venta de licencias es del <strong className="text-primary-foreground">30%</strong>.
              Si activas <strong className="text-primary-foreground">10 licencias</strong>, recibes una licencia
              donde el 100% del pago es para ti.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto text-left">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-primary-foreground/60 mb-1">Pago directo</p>
                <p className="font-bold">Inmediato</p>
                <p className="text-xs text-primary-foreground/40 mt-1">Deduce tu comisión y transfiere el resto</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-primary-foreground/60 mb-1">Pago por pasarela</p>
                <p className="font-bold">24h hábiles</p>
                <p className="text-xs text-primary-foreground/40 mt-1">Tras confirmación del pago en Wompi</p>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/30 mt-6">
              Sujeto a términos y condiciones vigentes. Las comisiones pueden cambiar con previo aviso.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="text-xl font-bold">¿Tienes preguntas?</h2>
            <p className="text-sm text-muted-foreground">
              Estamos disponibles por WhatsApp en horario de oficina o agenda una videollamada con nuestro equipo.
            </p>
            <div className="flex flex-col gap-3">
              <Button className="w-full btn-whatsapp gap-2" asChild>
                <a
                  href={buildUrl("Hola, soy socio de SistecPOS y tengo una pregunta sobre mi panel")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp de Soporte
                </a>
              </Button>
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/socio">
                  Ir al Panel <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} SistecPOS · Software POS Colombia</p>
      </footer>
    </div>
  );
}

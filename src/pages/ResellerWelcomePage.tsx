import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo/SEO";
import { useResellerFunnelTracker } from "@/hooks/useResellerFunnelTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  ArrowRight,
  DollarSign,
  Users,
  Headset,
  ShieldCheck,
  TrendingUp,
  Rocket,
  CheckCircle2,
  Zap,
  Target,
  Gift,
  Clock,
  BadgePercent,
  Chrome,
} from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const pillars = [
  {
    icon: DollarSign,
    title: "30% de Comisión Recurrente",
    desc: "Cada licencia que vendas te genera un 30% inmediato. Y cuando tu cliente renueve, tú sigues ganando. Ingresos que se acumulan mes a mes.",
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "Cero Riesgo, Cero Inversión",
    desc: "No pagas nada para empezar. Sin inventario, sin oficina, sin empleados. Tu único recurso es tu tiempo y tus ganas de crecer.",
  },
  {
    icon: Headset,
    title: "Nosotros Hacemos TODO el Soporte",
    desc: "Instalación, configuración, capacitación al cliente, soporte técnico 24/7, actualizaciones permanentes. Tú vendes, nosotros hacemos que funcione.",
  },
  {
    icon: Users,
    title: "Construye TU Base de Clientes",
    desc: "Cada cliente que consigas es tuyo. Tu portafolio crece contigo. No trabajas para alguien más: construyes tu propio negocio.",
  },
  {
    icon: TrendingUp,
    title: "Mercado Explosivo",
    desc: "La DIAN obliga a miles de negocios a facturar electrónicamente. Ellos NECESITAN un POS. Tú llegas con la solución perfecta en el momento perfecto.",
  },
  {
    icon: Gift,
    title: "Bono: 10 Licencias = 1 Gratis",
    desc: "Activa 10 licencias y recibes una licencia donde el 100% del pago es para ti. Un incentivo real para acelerar tu crecimiento.",
  },
];

const howPayWorks = [
  {
    icon: Zap,
    title: "Pago Directo",
    desc: "Si el cliente te paga directamente, solo transfieres el valor de la licencia menos tu comisión del 30%. Recibes tu pago al instante.",
  },
  {
    icon: Clock,
    title: "Pago por Pasarela Wompi",
    desc: "Si el cliente paga por la pasarela en línea, recibes tu comisión en máximo 24 horas hábiles después de confirmado el pago.",
  },
];

const steps = [
  { num: "01", title: "Te Registras", desc: "Llenas este formulario y recibes tu correo de bienvenida." },
  { num: "02", title: "Ves la Presentación", desc: "Conoces el software, la propuesta de valor y cómo comunicarla." },
  { num: "03", title: "Te Capacitas", desc: "Accedes a credenciales demo, videos y recursos de autoentrenamiento." },
  { num: "04", title: "Llamada de Calificación", desc: "Hablamos contigo para resolver dudas y activar tu panel de socio." },
  { num: "05", title: "Sales a Vender", desc: "Con tu panel activo, ofreces SistecPOS en tu ciudad con respaldo total." },
  { num: "06", title: "Cobras tu Comisión", desc: "Por cada venta, recibes el 30% de forma inmediata o en 24h." },
];

const objections = [
  { q: "¿Necesito ser experto en tecnología?", a: "No. Solo necesitas ganas. Nosotros te capacitamos y hacemos todo lo técnico." },
  { q: "¿Es un empleo?", a: "No. Es tu propio negocio. Tú defines tus horarios, tu estrategia y tus metas." },
  { q: "¿Cuánto puedo ganar?", a: "Sin techo. Si vendes 5 licencias al mes a $600.000 promedio, son $900.000 en comisiones. Con 10 licencias, $1.800.000 + una licencia gratis." },
  { q: "¿Qué pasa si el cliente tiene problemas?", a: "Nosotros nos encargamos 100%. Soporte técnico, actualizaciones y acompañamiento permanente." },
];

export default function ResellerWelcomePage() {
  const { buildUrl } = useWhatsAppConfig();
  const { trackEvent } = useResellerFunnelTracker();
  const [videoWatched, setVideoWatched] = useState(false);

  // Get the email stored during registration
  const resellerEmail = sessionStorage.getItem("reseller_email") || "";

  useEffect(() => {
    if (resellerEmail) {
      trackEvent(resellerEmail, "page_view", { page: "bienvenida" });
    }
  }, [resellerEmail, trackEvent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-foreground via-foreground to-background">
      <SEO
        title="¡Bienvenido al Equipo SistecPOS! | Tu Oportunidad de Negocio"
        description="Descubre cómo generar ingresos recurrentes del 30% como representante independiente de SistecPOS. Sin inversión, sin riesgo, con soporte total."
      />

      {/* Navbar mini */}
      <header className="border-b border-white/10 bg-foreground/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <img
            src="/lovable-uploads/43a24c53-78c0-4ca3-b642-99a376d90a0f.png"
            alt="SistecPOS"
            className="h-7 brightness-0 invert"
          />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              Programa de Socios
            </span>
            <Button size="sm" className="bg-cta hover:bg-cta/90 text-cta-foreground gap-1" asChild>
              <a href="#siguiente-paso">
                Avanzar <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO — Emotional hook */}
      <section className="relative py-16 md:py-24 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cta blur-[120px]" />
        </div>
        <div className="container px-4 relative z-10">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-whatsapp/20 px-4 py-1.5 mb-6">
              <CheckCircle2 className="h-4 w-4 text-whatsapp" />
              <span className="text-sm font-semibold text-whatsapp">¡Tu registro fue exitoso!</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Estás a un paso de{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                construir tu propio negocio
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-4 max-w-2xl mx-auto">
              Imagina ganar <strong className="text-primary-foreground">comisiones del 30%</strong> cada mes,
              sin jefe, sin horario fijo, sin inversión. Solo con tu talento comercial y el respaldo de
              un software que ya funciona en más de 23 ciudades de Colombia.
            </p>
            <p className="text-base text-primary-foreground/50 mb-8">
              Esto no es un empleo. Es <strong>tu oportunidad</strong> de construir una base de clientes propia
              que te genere ingresos recurrentes.
            </p>
            <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground gap-2 text-lg px-8 h-14" asChild>
              <a href="#video-presentacion">
                <Play className="h-5 w-5" /> Ver Presentación del Negocio
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section id="video-presentacion" className="py-16 md:py-20 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Conoce la <span className="text-primary">Oportunidad</span> en 5 Minutos
              </h2>
              <p className="text-muted-foreground">
                Mira este video y descubre por qué cientos de personas ya generan ingresos con SistecPOS.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl bg-foreground aspect-video">
              <iframe
                src="https://www.youtube.com/embed/VIDEO_ID?enablejsapi=1"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Presentación SistecPOS para Socios"
                onLoad={() => {
                  if (resellerEmail) {
                    trackEvent(resellerEmail, "video_started", { video: "presentacion-socios" });
                  }
                }}
              />
              {/* Placeholder until real video ID is set */}
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/90 text-primary-foreground">
                <div className="text-center space-y-4">
                  <div
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 cursor-pointer hover:bg-primary/30 transition-colors"
                    onClick={() => {
                      if (resellerEmail) {
                        trackEvent(resellerEmail, "video_started", { video: "presentacion-socios" });
                      }
                      window.open("https://sistecpos.com/socio/entrenamientos#video-presentacion", "_blank");
                    }}
                  >
                    <Play className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Video de Presentación del Programa</p>
                  <p className="text-sm text-primary-foreground/60">
                    Haz clic para ver el video de presentación
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => {
                        if (resellerEmail) {
                          trackEvent(resellerEmail, "video_started", { video: "presentacion-socios" });
                        }
                        window.open("https://sistecpos.com/socio/entrenamientos#video-presentacion", "_blank");
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" /> Ver Video de Presentación
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-green-400 hover:bg-green-500/10"
                      onClick={() => {
                        if (resellerEmail) {
                          trackEvent(resellerEmail, "video_completed", { video: "presentacion-socios" });
                          setVideoWatched(true);
                        }
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Ya vi el video
                    </Button>
                  </div>
                  {videoWatched && (
                    <p className="text-xs text-green-400">✓ Video marcado como visto</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              6 Razones para <span className="text-primary">Empezar Hoy</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No necesitas experiencia en tecnología. Solo las ganas y el deseo de construir algo propio.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`h-full transition-all hover:shadow-lg ${p.highlight ? "border-cta/40 bg-cta/5" : "border-border/50 hover:border-primary/30"}`}>
                  <CardContent className="p-6">
                    <div className={`rounded-xl p-3 w-fit mb-4 ${p.highlight ? "bg-cta/10" : "bg-primary/10"}`}>
                      <p.icon className={`h-6 w-6 ${p.highlight ? "text-cta" : "text-primary"}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW PAYMENT WORKS */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <BadgePercent className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                ¿Cómo <span className="text-primary">Recibes tu Pago</span>?
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {howPayWorks.map((item) => (
                <Card key={item.title} className="border-primary/20">
                  <CardContent className="p-6">
                    <item.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              * Comisiones y condiciones sujetas a cambios. Consulta los términos vigentes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FUNNEL STEPS */}
      <section className="py-16 md:py-24 bg-foreground text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Tu Camino de <span className="text-primary">Registro a Comisiones</span>
            </h2>
            <p className="text-primary-foreground/60">6 pasos claros. Sin complicaciones.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
              >
                <span className="text-3xl font-bold text-primary/60 mb-2 block">{s.num}</span>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-primary-foreground/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIONS */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <Target className="h-10 w-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Resolvemos tus <span className="text-primary">Dudas</span>
              </h2>
            </div>
            <div className="space-y-4">
              {objections.map((o, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border bg-card p-5"
                >
                  <p className="font-bold text-foreground mb-1">{o.q}</p>
                  <p className="text-sm text-muted-foreground">{o.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA — NEXT STEP */}
      <section id="siguiente-paso" className="py-16 md:py-24 bg-gradient-to-b from-primary to-primary-hover text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Rocket className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              ¿Listo para el Siguiente Paso?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Crea tu cuenta en nuestro portal de socios. Usaremos el mismo correo que registraste
              para darte acceso una vez completemos tu verificación.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold bg-white text-primary hover:bg-white/90 gap-2 shadow-xl"
                onClick={() => {
                  if (resellerEmail) trackEvent(resellerEmail, "cta_clicked", { label: "registrarme_google" });
                }}
                asChild
              >
                <Link to="/auth">
                  <Chrome className="h-5 w-5" />
                  Registrarme con Google
                </Link>
              </Button>

              <p className="text-sm text-primary-foreground/60">
                Usa el mismo correo que registraste en el formulario para vincular tu cuenta automáticamente.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 gap-2"
                  asChild
                >
                  <a
                    href={buildUrl("Hola, acabo de registrarme como representante y quiero avanzar al siguiente paso")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 Hablar con un Asesor
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/representantes">
                    Más Información
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/20">
              <p className="text-xs text-primary-foreground/40">
                Tu postulación será revisada en un máximo de 24 horas. Recibirás una llamada de calificación
                y luego un correo con tu acceso al panel de socios.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="bg-foreground text-primary-foreground/50 py-6 text-center text-xs border-t border-white/10">
        <p>© {new Date().getFullYear()} SistecPOS · Software POS Colombia · Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

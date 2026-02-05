import { useParams, Navigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Phone, 
  MapPin,
  CheckCircle2,
  WifiOff,
  Building2,
  Users,
  Shield,
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLocalLandingBySlug, localLandings } from "@/data/localSeo";
import { businessTypes } from "@/data/businessTypes";
import { DynamicMeta } from "@/components/seo/DynamicMeta";

export default function SoftwarePosLocalPage() {
  const { city } = useParams<{ city: string }>();
  const landing = city ? getLocalLandingBySlug(city) : undefined;

  if (!landing) {
    return <Navigate to="/" replace />;
  }

  const featuredSolutions = businessTypes.slice(0, 8);

  return (
    <Layout>
      <DynamicMeta
        title={landing.metaTitle}
        description={landing.metaDescription}
        canonical={`https://sistecpos.lovable.app/software-pos/${landing.slug}`}
      />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <MapPin className="h-3 w-3 mr-1" />
                Servicio Local en {landing.city}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                {landing.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
                {landing.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
                  asChild
                >
                  <a 
                    href={`https://wa.me/573176268307?text=Hola,%20estoy%20en%20${encodeURIComponent(landing.city)}%20y%20quiero%20información%20sobre%20el%20software%20POS`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Cotizar en {landing.city}
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  asChild
                >
                  <a href="tel:+573176268307">
                    <Phone className="h-5 w-5 mr-2" />
                    Llamar Ahora
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Servicio POS en <span className="gradient-text">{landing.city}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instalación presencial y soporte técnico para negocios en {landing.city} y alrededores.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {landing.highlights.map((highlight, index) => (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{highlight}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       {/* Why SistecPOS Section */}
       <section className="py-16 md:py-20 bg-muted/30">
         <div className="container px-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-12"
           >
             <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
               ¿Por qué elegir <span className="gradient-text">SistecPOS</span> en {landing.city}?
             </h2>
           </motion.div>
 
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
             {(landing.isPresencial ? [
               { icon: Building2, title: "Instalación Presencial", description: `Vamos a tu negocio en ${landing.city} a instalar y configurar` },
               { icon: Users, title: "Capacitación Incluida", description: "Te enseñamos a ti y a tu equipo a usar el sistema" },
               { icon: WifiOff, title: "Funciona Offline", description: "Hasta 8 días sin internet con sincronización automática" },
               { icon: Clock, title: "Soporte Rápido", description: "Atención técnica el mismo día en el área metropolitana" },
             ] : [
               { icon: Building2, title: "Instalación Remota", description: `Configuramos tu sistema desde ${landing.city} sin salir de tu negocio` },
               { icon: Users, title: "Capacitación Virtual", description: "Videollamada personalizada con nuestro equipo técnico" },
               { icon: WifiOff, title: "Funciona Offline", description: "Hasta 8 días sin internet con sincronización automática" },
               { icon: Shield, title: "Soporte 24/7", description: "Atención técnica remota cuando lo necesites" },
             ]).map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Soluciones POS para negocios en <span className="gradient-text">{landing.city}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Software especializado para cada tipo de comercio.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {featuredSolutions.map((solution, index) => (
              <motion.div
                key={solution.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/soluciones/${solution.slug}`}>
                  <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${solution.color} flex items-center justify-center shrink-0`}>
                        <solution.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm">{solution.titleShort}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/#soluciones" className="gap-2">
                Ver todas las soluciones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Zonas de cobertura en <span className="gradient-text">{landing.city}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Atendemos negocios en todas estas zonas y barrios.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {landing.nearbyAreas.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Badge 
                  variant="secondary" 
                  className="text-sm py-2 px-4 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {area}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Cities */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              También en el Área Metropolitana
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Servicio presencial en todo el área metropolitana de Bucaramanga.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {localLandings
              .filter(l => l.slug !== city)
              .map((l, index) => (
                <motion.div
                  key={l.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link to={`/software-pos/${l.slug}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">POS en {l.city}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Tienes un negocio en {landing.city}?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Cotiza tu sistema POS con instalación presencial. Vamos a tu local, te instalamos y capacitamos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2"
                asChild
              >
                <a 
                  href={`https://wa.me/573176268307?text=Hola,%20tengo%20un%20negocio%20en%20${encodeURIComponent(landing.city)}%20y%20quiero%20cotizar%20el%20software%20POS`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Cotizar Ahora
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                asChild
              >
                <Link to="/productos">
                  Ver Hardware y Licencias
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

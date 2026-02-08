import { useParams, Navigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  Check, 
  MessageCircle, 
  Phone, 
  ArrowRight, 
  WifiOff,
  Building2,
  Users,
  Shield,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBusinessTypeBySlug, businessTypes } from "@/data/businessTypes";
import { getTestimonialsByBusiness } from "@/data/testimonials";
import { featuredCities } from "@/data/localSeo";
import { TestimonialsSection } from "@/components/solutions/TestimonialsSection";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export default function SolucionNegocioPage() {
  const { slug } = useParams<{ slug: string }>();
  const business = slug ? getBusinessTypeBySlug(slug) : undefined;

  if (!business) {
    return <Navigate to="/" replace />;
  }

  const testimonials = getTestimonialsByBusiness(slug || "");

  const Icon = business.icon;

  return (
    <Layout>
      {/* Dynamic SEO Meta Tags */}
      <DynamicMeta
        title={business.metaTitle}
        description={business.metaDescription}
        canonical={`https://sistecpos.lovable.app/soluciones/${slug}`}
      />
      <Breadcrumbs items={[
        { label: "Software POS Colombia", href: "/software-pos-colombia" },
        { label: business.titleShort },
      ]} />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                Software POS Especializado
              </Badge>
              <h1 id="titulo" className="text-3xl md:text-5xl font-bold mb-6">
                {business.title}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                {business.longDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
                  asChild
                >
                  <a 
                    href={`https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20el%20POS%20para%20${encodeURIComponent(business.titleShort)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {business.cta}
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
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className={`h-48 w-48 rounded-3xl ${business.color} flex items-center justify-center shadow-2xl`}>
                <Icon className="h-24 w-24" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Funcionalidades para <span className="gradient-text">{business.titleShort}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu {business.titleShort.toLowerCase()} de forma eficiente.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {business.features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-whatsapp shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Módulos Incluidos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Módulos especializados para tu tipo de negocio.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {business.modules.map((module, index) => (
              <motion.div
                key={module}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Badge 
                  variant="secondary" 
                  className="text-sm py-2 px-4 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {module}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Beneficios para tu <span className="gradient-text">{business.titleShort}</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {business.benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SistecPOS Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              ¿Por qué elegir <span className="gradient-text">SistecPOS</span>?
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { icon: WifiOff, title: "Funciona Offline", description: "Hasta 8 días sin internet con sincronización automática" },
              { icon: Building2, title: "Instalación Presencial", description: "Vamos a tu local en Bucaramanga y área metropolitana" },
              { icon: Users, title: "Capacitación Incluida", description: "Te enseñamos a ti y a tu equipo a usar el sistema" },
              { icon: Shield, title: "Soporte Local", description: "Soporte técnico el mismo día cuando lo necesites" },
            ].map((item, index) => (
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

      {/* Testimonials Section */}
      <TestimonialsSection 
        businessType={business.titleShort} 
        testimonials={testimonials} 
      />

      {/* Available Cities */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Disponible en Todo <span className="gradient-text">Colombia</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instala tu POS para {business.titleShort} en cualquiera de estas ciudades.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {featuredCities.map((city) => (
              <Link key={city.slug} to={`/software-pos/${city.slug}`}>
                <Badge variant="secondary" className="py-2 px-4 hover:bg-primary/20 transition-colors cursor-pointer">
                  <MapPin className="h-3 w-3 mr-1" />
                  {city.city}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link to="/software-pos-colombia" className="gap-2">
                Ver todas las ciudades <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Other Solutions */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Otras Soluciones
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestras soluciones para otros tipos de negocio.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {businessTypes
              .filter(bt => bt.slug !== slug)
              .slice(0, 8)
              .map((bt, index) => (
                <motion.div
                  key={bt.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/soluciones/${bt.slug}`}>
                    <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${bt.color} flex items-center justify-center shrink-0`}>
                          <bt.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">{bt.titleShort}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/soluciones" className="gap-2">
                Ver todas las soluciones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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
              ¿Listo para digitalizar tu {business.titleShort}?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Agenda una demostración gratuita y descubre cómo SistecPOS puede transformar tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
                asChild
              >
                <a 
                  href={`https://wa.me/573176268307?text=Hola,%20quiero%20una%20demo%20del%20POS%20para%20${encodeURIComponent(business.titleShort)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Solicitar Demo Gratis
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                asChild
              >
                <Link to="/comparativa-licencias">
                  Comparar con otros POS
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

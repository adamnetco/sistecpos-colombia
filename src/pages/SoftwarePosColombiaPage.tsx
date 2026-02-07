import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  MessageCircle,
  MapPin,
  WifiOff,
  Shield,
  Users,
  Building2,
  ArrowRight,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicMeta } from "@/components/seo/DynamicMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, organizationSchema, faqSchema } from "@/components/seo/JsonLd";
import { businessTypes } from "@/data/businessTypes";
import { localLandings } from "@/data/localSeo";

const faqs = [
  {
    question: "¿Qué es un software POS y para qué sirve?",
    answer:
      "Un software POS (Point of Sale o Punto de Venta) es un sistema que permite registrar ventas, controlar inventario, generar facturas electrónicas y administrar tu negocio desde un computador o tablet. Reemplaza la caja registradora tradicional con funciones avanzadas como reportes en tiempo real, control de empleados y gestión de clientes.",
  },
  {
    question: "¿Cuánto cuesta un software POS en Colombia?",
    answer:
      "Los precios varían según el proveedor. SistecPOS ofrece planes desde $12 USD/mes (aproximadamente $50.000 COP/mes) con facturación electrónica DIAN incluida, usuarios ilimitados y modo offline. Es una de las opciones más completas y económicas del mercado colombiano.",
  },
  {
    question: "¿Qué software POS funciona sin internet?",
    answer:
      "SistecPOS es el único software POS en Colombia que funciona hasta 8 días sin conexión a internet con sincronización automática cuando se restablece la conexión. Esto es ideal para negocios en zonas con conectividad inestable o para garantizar la continuidad del servicio.",
  },
  {
    question: "¿Cómo implementar facturación electrónica DIAN?",
    answer:
      "Con SistecPOS, la facturación electrónica viene integrada. Te ayudamos con la habilitación ante la DIAN, configuración de resolución de facturación y capacitación. El proceso toma entre 1 y 3 días hábiles y nuestro equipo te acompaña en cada paso.",
  },
  {
    question: "¿Cuál es el mejor software POS para restaurantes en Colombia?",
    answer:
      "SistecPOS incluye módulos especializados para restaurantes: control de mesas, comandas de cocina, monitor KDS, división de cuentas, recetas con costos y domicilios. Además, funciona offline y tiene instalación presencial en Santander.",
  },
  {
    question: "¿Se puede usar un POS en el celular?",
    answer:
      "Sí, SistecPOS funciona desde cualquier navegador web, lo que significa que puedes acceder desde tu celular, tablet o computador. También ofrece reportes en tiempo real desde tu teléfono para monitorear tu negocio en cualquier momento.",
  },
  {
    question: "¿Qué hardware necesito para un punto de venta?",
    answer:
      "Lo mínimo es un computador o tablet. Opcionalmente puedes agregar impresora térmica (58mm o 80mm), lector de código de barras, cajón monedero y báscula. SistecPOS vende e instala todo el hardware necesario con configuración incluida.",
  },
];

const highlights = [
  { icon: WifiOff, title: "Modo Offline 8 Días", description: "Funciona sin internet con sincronización automática" },
  { icon: FileCheck, title: "Facturación DIAN", description: "Facturación electrónica integrada y habilitada" },
  { icon: Building2, title: "Instalación Presencial", description: "Vamos a tu negocio en el área metropolitana de Bucaramanga" },
  { icon: Users, title: "Soporte 24/7", description: "Atención técnica remota o presencial cuando la necesites" },
  { icon: Shield, title: "16+ Módulos", description: "Restaurantes, retail, servicios, distribución y más" },
  { icon: MapPin, title: "23+ Ciudades", description: "Cobertura nacional con instalación remota asistida" },
];

const featuredCitySlugs = ["bogota", "medellin", "cali", "barranquilla", "bucaramanga", "cartagena", "cucuta", "pereira"];

export default function SoftwarePosColombiaPage() {
  const featuredCities = localLandings.filter((l) => featuredCitySlugs.includes(l.slug));
  const otherCities = localLandings.filter((l) => !featuredCitySlugs.includes(l.slug));

  return (
    <Layout>
      <DynamicMeta
        title="Software POS Colombia 2025 | Sistema Punto de Venta #1 | SistecPOS"
        description="Software POS para negocios en Colombia con facturación electrónica DIAN, modo offline 8 días y soporte en 23+ ciudades. Prueba gratis."
        canonical="https://sistecpos.lovable.app/software-pos-colombia"
      />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={faqSchema(faqs)} />

      <Breadcrumbs items={[{ label: "Software POS Colombia" }]} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                #1 en Colombia · 23+ Ciudades
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
                Software POS en Colombia: El Sistema Punto de Venta #1 para Tu Negocio
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
                Software punto de venta con facturación electrónica DIAN, modo offline hasta 8 días, 16+ módulos especializados y soporte en todo el país. Desde $12 USD/mes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
                  <a href="https://wa.me/573176268307?text=Hola,%20quiero%20información%20sobre%20el%20software%20POS" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Cotizar Gratis
                  </a>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/comparativa-licencias">Comparar con Otros POS</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              ¿Qué es un <span className="gradient-text">Software POS</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un software POS (Punto de Venta) es el cerebro de tu negocio. Reemplaza la caja registradora tradicional con un sistema inteligente que controla ventas, inventario, empleados, clientes y facturación electrónica DIAN desde un solo lugar.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {highlights.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DIAN Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <Badge className="mb-4">Obligatorio desde 2024</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                <span className="gradient-text">Facturación Electrónica DIAN</span> Integrada
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Todos los negocios en Colombia están obligados a facturar electrónicamente. SistecPOS incluye facturación electrónica DIAN desde el primer día, sin costos adicionales.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
              {["Facturas electrónicas de venta", "Notas crédito y débito", "Documentos soporte", "Habilitación ante la DIAN incluida", "Resolución de facturación", "Envío automático al cliente por email"].map((item, index) => (
                <motion.div key={item} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/facturacion-electronica" className="gap-2">
                  Conoce más sobre Facturación Electrónica
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Cobertura en <span className="gradient-text">23+ Ciudades</span> de Colombia
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Instalación presencial en Santander y remota asistida en todo el país.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Ciudades Principales</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {featuredCities.map((city, index) => (
                <motion.div key={city.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                  <Link to={`/software-pos/${city.slug}`}>
                    <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <span className="font-medium text-sm">{city.city}</span>
                          <span className="block text-xs text-muted-foreground">{city.region}</span>
                        </div>
                        {city.isPresencial && (
                          <Badge variant="secondary" className="ml-auto text-xs">Presencial</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4 text-center">Más Ciudades</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {otherCities.map((city) => (
                <Link key={city.slug} to={`/software-pos/${city.slug}`}>
                  <Badge variant="secondary" className="py-2 px-4 hover:bg-primary/20 transition-colors cursor-pointer">
                    <MapPin className="h-3 w-3 mr-1" />
                    {city.city}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Software POS para <span className="gradient-text">24 Tipos de Negocio</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Módulos especializados para cada industria en Colombia.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
            {businessTypes.map((bt, index) => (
              <motion.div key={bt.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }}>
                <Link to={`/soluciones/${bt.slug}`}>
                  <Card className="h-full hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg ${bt.color} flex items-center justify-center shrink-0`}>
                        <bt.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">{bt.titleShort}</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativa CTA */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              ¿Cómo se Compara <span className="gradient-text">SistecPOS</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compara funcionalidades, precios y soporte de SistecPOS vs Tiendana, VectorPOS y SitricPOS.
            </p>
            <Button size="lg" asChild>
              <Link to="/comparativa-licencias" className="gap-2">
                Ver Comparativa Completa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Preguntas Frecuentes sobre <span className="gradient-text">Software POS</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para Digitalizar tu Negocio?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Únete a cientos de negocios en Colombia que ya usan SistecPOS. Cotización gratuita y sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
                <a href="https://wa.me/573176268307?text=Hola,%20quiero%20cotizar%20el%20software%20POS%20para%20mi%20negocio%20en%20Colombia" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Cotizar Ahora por WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/productos">Ver Hardware y Precios</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

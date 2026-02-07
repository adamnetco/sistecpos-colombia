import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  MessageCircle,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Clock,
  Shield,
  Receipt,
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
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";

const faqs = [
  {
    question: "¿Quiénes están obligados a facturar electrónicamente en Colombia?",
    answer: "Desde 2024, todos los contribuyentes del impuesto sobre la renta y complementarios, IVA e INC están obligados a emitir factura electrónica. Esto incluye personas naturales y jurídicas que realicen actividades económicas.",
  },
  {
    question: "¿Cuánto cuesta implementar facturación electrónica?",
    answer: "Con SistecPOS, la facturación electrónica está incluida en todos los planes desde $12 USD/mes. No hay costos adicionales por cantidad de facturas, notas crédito o documentos soporte.",
  },
  {
    question: "¿Cuánto tiempo toma habilitarse ante la DIAN?",
    answer: "El proceso de habilitación toma entre 1 y 3 días hábiles. Nuestro equipo te acompaña en cada paso: registro en DIAN, solicitud de resolución y pruebas de emisión.",
  },
  {
    question: "¿Qué documentos electrónicos puedo emitir con SistecPOS?",
    answer: "Puedes emitir facturas electrónicas de venta, notas crédito, notas débito y documentos soporte en adquisiciones. Todos válidos ante la DIAN con firma digital.",
  },
  {
    question: "¿La facturación electrónica funciona sin internet?",
    answer: "SistecPOS funciona offline hasta 8 días. Las facturas se generan localmente y se envían a la DIAN automáticamente cuando se restablece la conexión, sin perder ningún documento.",
  },
];

const steps = [
  { icon: FileCheck, title: "Registro DIAN", description: "Te ayudamos a registrarte como facturador electrónico en la plataforma DIAN." },
  { icon: Receipt, title: "Resolución de Facturación", description: "Gestionamos tu resolución de numeración ante la DIAN." },
  { icon: Shield, title: "Configuración", description: "Configuramos tu software POS con los datos de facturación electrónica." },
  { icon: Clock, title: "Pruebas y Habilitación", description: "Realizamos pruebas de emisión y te dejamos 100% habilitado." },
];

const documents = [
  "Facturas electrónicas de venta",
  "Notas crédito",
  "Notas débito",
  "Documentos soporte en adquisiciones",
  "Eventos de aceptación/rechazo",
  "Representación gráfica personalizada",
];

export default function FacturacionElectronicaPage() {
  return (
    <Layout>
      <DynamicMeta
        title="Facturación Electrónica DIAN | Software POS con FE | SistecPOS"
        description="Cumple con la facturación electrónica DIAN desde tu software POS. Emite facturas, notas crédito y documentos soporte. Cotiza gratis."
        canonical="https://sistecpos.lovable.app/facturacion-electronica"
      />
      <JsonLd data={faqSchema(faqs)} />

      <Breadcrumbs items={[{ label: "Facturación Electrónica" }]} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 gradient-bg text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <FileCheck className="h-3 w-3 mr-1" />
                Obligatorio DIAN 2024
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                Facturación Electrónica DIAN con Software POS Integrado
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
                Emite facturas electrónicas, notas crédito y documentos soporte directamente desde tu punto de venta. Cumple con la normativa DIAN sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
                  <a href="https://wa.me/573176268307?text=Hola,%20necesito%20implementar%20facturación%20electrónica%20DIAN" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Implementar Facturación Electrónica
                  </a>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/software-pos-colombia">Ver Software POS Completo</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Obligatoriedad */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                ¿Por qué es <span className="gradient-text">Obligatoria</span>?
              </h2>
            </motion.div>

            <Card className="border-destructive/20 bg-destructive/5 mb-8">
              <CardContent className="p-6 flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Resolución DIAN No. 000042 de 2020</h3>
                  <p className="text-sm text-muted-foreground">
                    La DIAN exige que todos los responsables del impuesto sobre la renta, IVA e INC emitan factura electrónica de venta. El incumplimiento puede generar sanciones de hasta el 1% de las operaciones facturadas o $246 UVT por cada factura no emitida.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {documents.map((doc, index) => (
                <motion.div key={doc} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-whatsapp shrink-0" />
                    <span className="text-sm font-medium">{doc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Proceso de <span className="gradient-text">Implementación</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Te acompañamos en cada paso. En 1 a 3 días hábiles estás facturando electrónicamente.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interlinks */}
      <section className="py-16 md:py-20">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Disponible en Todo <span className="gradient-text">Colombia</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-8">
            {["bogota", "medellin", "cali", "barranquilla", "bucaramanga", "cartagena", "cucuta", "pereira", "manizales"].map((slug) => (
              <Link key={slug} to={`/software-pos/${slug}`}>
                <Badge variant="secondary" className="py-2 px-4 hover:bg-primary/20 transition-colors cursor-pointer capitalize">
                  {slug === "bogota" ? "Bogotá" : slug === "medellin" ? "Medellín" : slug === "cucuta" ? "Cúcuta" : slug.charAt(0).toUpperCase() + slug.slice(1)}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/software-pos-colombia" className="gap-2">
                Ver todas las ciudades
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Preguntas sobre <span className="gradient-text">Facturación Electrónica</span>
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
              Empieza a Facturar Electrónicamente Hoy
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Implementación incluida. Sin costos adicionales por cantidad de facturas.
            </p>
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2" asChild>
              <a href="https://wa.me/573176268307?text=Hola,%20quiero%20implementar%20facturación%20electrónica%20con%20SistecPOS" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Cotizar Facturación Electrónica
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

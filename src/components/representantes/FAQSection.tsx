import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuánto puedo ganar como representante?",
    answer:
      "Tus ingresos dependen de tu dedicación. Cada venta cerrada genera una comisión atractiva, y no hay techo de ganancias. Representantes activos pueden generar ingresos significativos mensuales vendiendo SistecPOS en su zona.",
  },
  {
    question: "¿Necesito invertir dinero para empezar?",
    answer:
      "No. El programa de representantes de SistecPOS no requiere inversión inicial. No tienes que comprar inventario, pagar licencias ni asumir costos fijos. Solo necesitas tu tiempo y actitud comercial.",
  },
  {
    question: "¿Cómo me pagan las comisiones?",
    answer:
      "Las comisiones se pagan por transferencia bancaria una vez el cliente activa su servicio con SistecPOS. El proceso es transparente y recibes tu pago de forma oportuna.",
  },
  {
    question: "¿Necesito saber de tecnología?",
    answer:
      "No necesitas ser experto en tecnología. Te damos toda la capacitación comercial y técnica necesaria para que puedas explicar el producto y cerrar ventas con confianza. El soporte técnico lo manejamos nosotros.",
  },
  {
    question: "¿Qué pasa si un cliente tiene problemas técnicos?",
    answer:
      "Tú no te preocupas por eso. SistecPOS se encarga de la instalación, configuración, capacitación presencial y soporte técnico 24/7. Tu única responsabilidad es la parte comercial.",
  },
  {
    question: "¿Puedo ser representante en cualquier ciudad?",
    answer:
      "Buscamos representantes en las principales ciudades de Colombia. Si tu ciudad no está en la lista, escríbenos y evaluamos la viabilidad de abrir tu zona. Asignamos territorios exclusivos para evitar competencia entre representantes.",
  },
  {
    question: "¿Es exclusivo por zona?",
    answer:
      "Sí. Asignamos zonas exclusivas a cada representante para que no compitas con otros vendedores de SistecPOS. Esto te da la tranquilidad de trabajar tu territorio sin interferencias.",
  },
  {
    question: "¿Qué tipo de negocios puedo abordar?",
    answer:
      "Cualquier negocio que necesite un punto de venta: restaurantes, tiendas, minimercados, ferreterías, droguerías, licorerías, panaderías, entre muchos otros. La facturación electrónica DIAN es obligatoria, así que el mercado es enorme.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Preguntas Frecuentes
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Resolvemos Tus <span className="gradient-text">Dudas</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Todo lo que necesitas saber antes de postularte como representante.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-border/50 rounded-lg px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

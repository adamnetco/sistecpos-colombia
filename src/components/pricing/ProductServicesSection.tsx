import { useLicensePricing, formatCOP, monthlyPrice } from "@/hooks/useLicensePricing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Headphones,
  Wrench,
  Shield,
  Clock,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  CalendarClock,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

/** Services & pricing section shown on software license product detail pages */
export function ProductServicesSection() {
  const { data: plans = [] } = useLicensePricing();

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
         <Badge className="mb-3 bg-primary/10 text-primary border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Respaldo Total para tu Negocio
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Tu Negocio Operando al <span className="gradient-text">100% desde el Día Uno</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Imagina tener un equipo dedicado que llega a tu local, configura todo por ti 
            y te acompaña hasta que domines cada función. Eso es exactamente lo que hacemos.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-12">
          {/* Implementation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
          >
            <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Puesta en Marcha Express</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vamos a tu negocio, configuramos todo y lo dejamos funcionando. 
                  Tú solo te dedicas a vender mientras nosotros nos encargamos de la tecnología.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Instalación directa en tu local",
                    "Sistema listo para facturar el mismo día",
                    "Migración segura desde tu sistema anterior",
                    "Recibos y facturas con tu marca",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {plans.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Desde</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCOP(Math.min(...plans.map((p) => p.implementation_price_cop)))}
                    </p>
                    <p className="text-xs text-muted-foreground">Varía según el plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-primary ring-2 ring-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
                </div>
                <h3 className="text-lg font-bold mb-2">Tranquilidad Operativa</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Un técnico real te responde en minutos, no un chatbot. 
                  Cada hora que tu sistema falla, pierdes ventas. Con nosotros, eso no pasa.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Respuesta directa por WhatsApp en minutos",
                    "Conexión remota ilimitada a tu equipo",
                    "Actualizaciones automáticas incluidas",
                    "Resolución garantizada en menos de 2 horas",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary">$120.000</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Menos de $4.000/día por la tranquilidad de tu negocio</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-whatsapp/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-whatsapp" />
                </div>
                <h3 className="text-lg font-bold mb-2">Domina tu Sistema en Horas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No necesitas ser experto en tecnología. Entrenamos a tu equipo 
                  en tu propio local hasta que se sientan seguros al 100%.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Entrenamiento presencial en tu negocio",
                    "Biblioteca de 130+ videos paso a paso",
                    "Guías por tipo de negocio",
                    "Re-entrenamiento gratis si cambias de personal",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Sin costo adicional — incluido en tu plan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pricing Plans Quick View */}
        {plans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-4xl mx-auto overflow-hidden border-0 shadow-card">
              <div className="bg-primary/5 p-6 text-center">
                <h3 className="text-xl font-bold mb-1">Elige tu Plan y Empieza Hoy</h3>
                <p className="text-sm text-muted-foreground">
                  Precios con descuento exclusivo SistecPOS — actualizados diariamente
                </p>
              </div>
              <CardContent className="p-0">
                <div className="grid divide-y md:grid-cols-3 md:divide-y-0 md:divide-x">
                  {plans.map((plan, i) => {
                    const monthly = monthlyPrice(plan.selling_price_cop);
                    return (
                      <div key={plan.id} className="p-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {plan.plan_label}
                        </p>
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                          <span className="text-3xl font-black text-primary">
                            {formatCOP(monthly)}
                          </span>
                          <span className="text-sm text-muted-foreground">/mes</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCOP(plan.selling_price_cop)}/año
                        </p>
                        <Button size="sm" className="mt-3 gap-1" variant={i === 1 ? "default" : "outline"} asChild>
                          <a
                            href={`https://wa.me/573176268307?text=${encodeURIComponent(
                              `Hola, me interesa el ${plan.plan_label}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Cotizar
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}

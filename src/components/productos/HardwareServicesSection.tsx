import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Network, Cable, Printer, CheckCircle2, MessageCircle,
  AlertTriangle, Shield, Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";

/** Extra services section shown on hardware product detail pages */
export function HardwareServicesSection() {
  const { buildUrl } = useWhatsAppConfig();

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-3 bg-primary/10 text-primary border-0">
            <Wrench className="h-3 w-3 mr-1" />
            Servicios Adicionales
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Conecta Todo tu <span className="gradient-text">Punto de Venta</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ¿Necesitas varias impresoras conectadas en red? Te ofrecemos el cableado y la configuración profesional para que tu negocio opere sin interrupciones.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-10">
          {/* Network Cabling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Cable className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cableado de Red Local para Impresoras</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Instalamos el cableado estructurado Ethernet en tu local para conectar múltiples impresoras y equipos en una misma red. 
                  Cable certificado, canaletas y terminaciones profesionales.
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  {[
                    "Cable UTP Cat. 5e / Cat. 6 certificado",
                    "Canaletas y organización limpia del cableado",
                    "Puntos de red donde los necesites",
                    "Switch incluido si se requiere",
                    "Garantía sobre la instalación",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-muted/50 border p-3 text-sm">
                  <p className="font-medium mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Precio variable
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Depende de la distancia, cantidad de puntos y tipo de local. Cotización gratuita presencial.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Network Printer Configuration */}
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
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-whatsapp text-white border-0">Más solicitado</Badge>
                </div>
                <h3 className="text-lg font-bold mb-2">Configuración de Impresoras en Red</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configuramos cada impresora térmica para que funcione en red con tu sistema POS. 
                  Ideal para cocina, barra, caja y despacho — cada punto imprime lo que necesita.
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  {[
                    "Asignación de IP fija a cada impresora",
                    "Configuración en el software POS por punto",
                    "Pruebas de impresión desde cada terminal",
                    "Impresión simultánea en cocina y caja",
                    "Soporte post-instalación incluido",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm space-y-1">
                  <p className="font-medium flex items-center gap-1.5">
                    <Printer className="h-4 w-4 text-primary" />
                    Costo por impresora adicional
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clientes con software POS: la configuración de impresoras en red ya está incluida en tu instalación.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Important notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-4xl mx-auto border-0 shadow-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Lo que debes saber al comprar hardware
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p><strong>Envío:</strong> no incluido en el precio. Se cotiza según ciudad y peso del equipo.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p><strong>Garantía:</strong> del fabricante, cubre defectos de fábrica. No cubre mal uso ni daño físico.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p><strong>Instalación:</strong> no incluida en la compra de hardware solo.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                    <p><strong>Clientes con software POS:</strong> instalación de 1 equipo incluida. Para varias cajas, cotizar instalación.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                    <p><strong>Software POS + impresoras:</strong> la configuración en red está incluida. El cableado de la red local tiene costo adicional.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button className="btn-whatsapp gap-2" asChild>
                  <a
                    href={buildUrl("Hola, quiero cotizar instalación y cableado de red para mi negocio")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Cotizar Servicios de Instalación
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

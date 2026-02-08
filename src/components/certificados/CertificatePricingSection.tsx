import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CertificatePurchaseDialog } from "./CertificatePurchaseDialog";

const plans = [
  {
    id: "1_year" as const,
    name: "1 Año",
    price: 150000,
    priceFormatted: "$150.000 COP",
    description: "Certificado digital válido por 12 meses",
    features: [
      "Certificado de firma digital autorizado ONAC",
      "Válido para facturación electrónica DIAN",
      "Soporte en la instalación y configuración",
      "Compatible con facturas, notas y documento soporte",
    ],
  },
  {
    id: "2_years" as const,
    name: "2 Años",
    price: 250000,
    priceFormatted: "$250.000 COP",
    description: "Certificado digital válido por 24 meses",
    popular: true,
    features: [
      "Todo lo del plan de 1 año",
      "Ahorra $50.000 COP vs renovar cada año",
      "Vigencia extendida de 24 meses",
      "Sin preocuparte por renovación durante 2 años",
    ],
  },
];

export function CertificatePricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<"1_year" | "2_years" | null>(null);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Shield className="h-3 w-3 mr-1" />
              Venta Directa
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Adquiere tu <span className="gradient-text">Certificado Digital</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Certificado de firma digital autorizado por la ONAC, válido para facturación electrónica ante la DIAN. Instalación y soporte incluidos.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Más Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">{plan.priceFormatted}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-whatsapp shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full gap-2 ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Comprar Ahora
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Pago por transferencia bancaria. Después de completar el formulario, recibirás los datos de pago por WhatsApp.
          </p>
        </div>
      </div>

      <CertificatePurchaseDialog
        open={selectedPlan !== null}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
        plan={selectedPlan ?? "1_year"}
        priceCop={selectedPlan === "2_years" ? 250000 : 150000}
      />
    </section>
  );
}

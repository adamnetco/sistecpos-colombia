import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Clock, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DIAN_MINUTES_PER_INVOICE = 5;
const SISTECPOS_SECONDS_PER_INVOICE = 10;
const WORKING_DAYS_PER_MONTH = 26;

export function TimeLostCalculator() {
  const [dailyInvoices, setDailyInvoices] = useState(30);

  const dianMonthlyMinutes = dailyInvoices * DIAN_MINUTES_PER_INVOICE * WORKING_DAYS_PER_MONTH;
  const sistecposMonthlyMinutes = Math.ceil((dailyInvoices * SISTECPOS_SECONDS_PER_INVOICE * WORKING_DAYS_PER_MONTH) / 60);
  const savedMinutes = dianMonthlyMinutes - sistecposMonthlyMinutes;
  const savedHours = Math.floor(savedMinutes / 60);
  const savedRemainingMinutes = savedMinutes % 60;
  const dianHours = Math.floor(dianMonthlyMinutes / 60);
  const dianRemainingMinutes = dianMonthlyMinutes % 60;

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Calculadora de Productividad
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            ¿Cuánto <span className="gradient-text">Tiempo Pierdes</span> al Mes?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mueve el slider con tu número de facturas diarias y descubre cuántas horas de tu vida se van en el facturador gratuito.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Slider */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Facturas por día
                </label>
                <span className="text-3xl font-bold text-primary">{dailyInvoices}</span>
              </div>
              <Slider
                value={[dailyInvoices]}
                onValueChange={(v) => setDailyInvoices(v[0])}
                min={5}
                max={200}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 facturas</span>
                <span>200 facturas</span>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* DIAN */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-destructive uppercase tracking-wide mb-2">
                  ❌ Facturador DIAN
                </p>
                <p className="text-4xl font-bold mb-1">
                  {dianHours}h {dianRemainingMinutes}m
                </p>
                <p className="text-sm text-muted-foreground">
                  perdidas al mes ({DIAN_MINUTES_PER_INVOICE} min por factura)
                </p>
              </CardContent>
            </Card>

            {/* SistecPOS */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  ✅ SistecPOS
                </p>
                <p className="text-4xl font-bold mb-1">
                  {Math.floor(sistecposMonthlyMinutes / 60)}h {sistecposMonthlyMinutes % 60}m
                </p>
                <p className="text-sm text-muted-foreground">
                  al mes ({SISTECPOS_SECONDS_PER_INVOICE} seg por factura)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Savings highlight */}
          <motion.div
            key={dailyInvoices}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mt-6 border-whatsapp/30 bg-whatsapp/5">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-semibold text-whatsapp uppercase tracking-wide mb-1">
                  ⏱️ Recuperas cada mes
                </p>
                <p className="text-5xl font-bold text-whatsapp mb-2">
                  {savedHours}h {savedRemainingMinutes}m
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Eso es <strong>{Math.round(savedMinutes / 480)} días laborales</strong> que podrías dedicar a vender más.
                </p>
                <Button className="btn-whatsapp font-semibold" asChild>
                  <Link to="/contacto#demo">Dejar de Perder Tiempo — Prueba Gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

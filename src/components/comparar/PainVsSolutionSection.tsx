import { motion } from "framer-motion";
import { WifiOff, Headphones, Receipt, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PainPoint {
  ellos: string;
  nosotros: string;
}

interface PainVsSolutionSectionProps {
  competitorName: string;
  painPoints: PainPoint[];
}

const icons = [WifiOff, Headphones, Receipt];

export function PainVsSolutionSection({ competitorName, painPoints }: PainVsSolutionSectionProps) {
  if (!painPoints || painPoints.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            El <span className="gradient-text">Problema</span> vs La Solución
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Por qué negocios colombianos están migrando de {competitorName} a SistecPOS?
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {painPoints.slice(0, 3).map((point, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card overflow-hidden">
                  <CardContent className="p-0">
                    {/* Competitor pain */}
                    <div className="p-5 bg-destructive/5 border-b border-destructive/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-destructive font-bold text-sm uppercase tracking-wide">
                          ❌ {competitorName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{point.ellos}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center -my-3 relative z-10">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-primary-foreground rotate-90" />
                      </div>
                    </div>

                    {/* SistecPOS solution */}
                    <div className="p-5 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary font-bold text-sm uppercase tracking-wide">
                          ✅ SistecPOS
                        </span>
                      </div>
                      <p className="text-sm font-medium">{point.nosotros}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
